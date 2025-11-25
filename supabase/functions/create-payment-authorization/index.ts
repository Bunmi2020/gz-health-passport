import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[PAYMENT AUTH] Starting payment authorization process");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Parse request body
    const { booking_id, amount, email } = await req.json();
    console.log("[PAYMENT AUTH] Request details:", { booking_id, amount, email });

    if (!booking_id || !amount || !email) {
      throw new Error("Missing required fields: booking_id, amount, or email");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[PAYMENT AUTH] Existing customer found:", customerId);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      console.log("[PAYMENT AUTH] New customer created:", customerId);
    }

    // Create payment intent with manual capture (authorization hold)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (RMB)
      currency: "cny", // Chinese Yuan
      customer: customerId,
      capture_method: "manual", // Critical: Hold funds, don't capture yet
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking_id,
        service: "Medical Checkup - Guangzhou",
      },
      description: `Medical checkup booking - ${email}`,
    });

    console.log("[PAYMENT AUTH] Payment intent created:", paymentIntent.id);

    // Update booking with Stripe IDs
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: customerId,
        status: "pending_payment",
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("[PAYMENT AUTH] Error updating booking:", updateError);
      throw updateError;
    }

    // Create checkout session for payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: "Medical Checkup - Guangzhou",
              description: "Full body health checkup at advanced medical center",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual",
        metadata: {
          booking_id: booking_id,
        },
      },
      success_url: `${req.headers.get("origin")}/booking-success?booking_id=${booking_id}`,
      cancel_url: `${req.headers.get("origin")}/?cancelled=true`,
    });

    console.log("[PAYMENT AUTH] Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, payment_intent_id: paymentIntent.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[PAYMENT AUTH] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
