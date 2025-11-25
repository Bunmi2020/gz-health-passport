import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      throw new Error("booking_id is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Background task: wait 5 minutes then check and send email
    const reminderTask = async () => {
      try {
        console.log(`Starting 5-minute timer for booking ${booking_id}`);
        
        // Wait 5 minutes
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        
        console.log(`Checking intake form status for booking ${booking_id}`);
        
        // Check if intake form has been submitted
        const { data: intakeForm } = await supabaseAdmin
          .from("intake_forms")
          .select("id")
          .eq("booking_id", booking_id)
          .maybeSingle();

        if (intakeForm) {
          console.log(`Intake form already submitted for booking ${booking_id}`);
          return; // Form already submitted, no reminder needed
        }

        // Get booking details
        const { data: booking, error: bookingError } = await supabaseAdmin
          .from("bookings")
          .select("*")
          .eq("id", booking_id)
          .single();

        if (bookingError || !booking) {
          console.error("Error fetching booking:", bookingError);
          return;
        }

        // Send reminder email
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        const reminderUrl = `${Deno.env.get("SUPABASE_URL")?.replace("/v1", "")}/booking-success?booking_id=${booking_id}`;

        await resend.emails.send({
          from: "Guangzhou Medical Checkup <onboarding@resend.dev>",
          to: [booking.user_email],
          subject: "Complete Your Medical Intake Form",
          html: `
            <h1>Don't Forget Your Medical Form!</h1>
            <p>Hi there,</p>
            <p>We noticed you haven't completed your medical intake form yet. This is an important step to confirm your appointment at the medical center in Guangzhou.</p>
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Complete the medical intake form</li>
              <li>Our team will review with the medical center</li>
              <li>You'll receive confirmation within 24-48 hours</li>
              <li>Payment will only be charged after confirmation</li>
            </ul>
            <p><a href="${reminderUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Complete Medical Form</a></p>
            <p>If you have any questions, please don't hesitate to reach out.</p>
            <p>Best regards,<br>Guangzhou Medical Checkup Team</p>
          `,
        });

        console.log(`Reminder email sent for booking ${booking_id}`);
      } catch (err) {
        console.error("Error in reminder task:", err);
      }
    };

    // Start background task without awaiting
    reminderTask();

    return new Response(
      JSON.stringify({ success: true, message: "Reminder scheduled" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in send-intake-reminder:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
