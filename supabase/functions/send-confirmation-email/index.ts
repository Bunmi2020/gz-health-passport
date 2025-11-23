import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONFIRMATION-EMAIL] ${step}${detailsStr}`);
};

interface ConfirmationEmailRequest {
  bookingId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin access verified");

    const { bookingId }: ConfirmationEmailRequest = await req.json();
    if (!bookingId) {
      throw new Error("Missing bookingId");
    }

    // Get booking details with intake form
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        intake_forms (*)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to fetch booking: ${bookingError?.message}`);
    }
    logStep("Booking fetched", { bookingId, email: booking.user_email });

    const intakeForm = Array.isArray(booking.intake_forms) 
      ? booking.intake_forms[0] 
      : booking.intake_forms;

    // Send confirmation email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Guangzhou Executive Checkup <onboarding@resend.dev>",
        to: [booking.user_email],
        subject: "Your Executive Health Checkup is Confirmed!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f766e; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            Booking Confirmed
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Dear Valued Client,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            We're delighted to confirm your executive health checkup appointment at Sun Yat-sen University Cancer Center in Guangzhou.
          </p>
          
          <div style="background-color: #f0fdfa; border-left: 4px solid #0f766e; padding: 15px; margin: 20px 0;">
            <h2 style="color: #0f766e; margin-top: 0;">Appointment Details</h2>
            <p><strong>Date:</strong> ${booking.selected_date}</p>
            <p><strong>Time:</strong> ${booking.selected_time}</p>
            <p><strong>Amount Paid:</strong> ${(booking.total_amount / 100).toFixed(0)} RMB</p>
            ${intakeForm?.arrival_date ? `<p><strong>Arrival Date:</strong> ${intakeForm.arrival_date}</p>` : ''}
          </div>
          
          <h3 style="color: #0f766e;">What to Bring</h3>
          <ul style="line-height: 1.8;">
            <li>Your passport (original)</li>
            <li>This confirmation email</li>
            <li>Any previous medical records (if applicable)</li>
          </ul>
          
          <h3 style="color: #0f766e;">Preparation Instructions</h3>
          <ul style="line-height: 1.8;">
            <li>Fast for 8-12 hours before your appointment</li>
            <li>Avoid alcohol for 24 hours prior</li>
            <li>Wear comfortable clothing</li>
          </ul>
          
          ${intakeForm?.needs_airport_pickup ? `
          <div style="background-color: #fffbeb; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0;">
            <p><strong>Airport Pickup:</strong> Our driver will meet you at Guangzhou Baiyun International Airport arrivals. Look for a sign with your name.</p>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            We look forward to welcoming you!
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p>Best regards,<br>
            <strong>Guangzhou Executive Health Checkup Team</strong><br>
            Sun Yat-sen University Cancer Center</p>
          </div>
        </div>
      `,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    logStep("Email sent successfully", { emailId: emailData.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent successfully",
        emailId: emailData.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-confirmation-email", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
