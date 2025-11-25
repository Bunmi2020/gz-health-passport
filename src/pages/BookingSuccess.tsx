import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IntakeForm } from "@/components/intake/IntakeForm";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showIntakeForm, setShowIntakeForm] = useState(false);

  useEffect(() => {
    const id = searchParams.get("booking_id");
    if (id) {
      setBookingId(id);
      checkBookingStatus(id);
      
      // Trigger reminder email to be sent after 5 minutes if form not submitted
      supabase.functions.invoke("send-intake-reminder", {
        body: { booking_id: id }
      }).catch(console.error);
      
      // Auto-show form after 10 seconds if not clicked
      const timer = setTimeout(() => {
        setShowIntakeForm(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  const checkBookingStatus = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Update booking status to payment authorized
      await supabase
        .from("bookings")
        .update({ status: "payment_authorized" })
        .eq("id", id);

      setLoading(false);
    } catch (error) {
      console.error("Error checking booking:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (showIntakeForm) {
    return <IntakeForm bookingId={bookingId} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 md:p-12 text-center shadow-elegant">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Payment Authorized Successfully!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Your card has been authorized (but not charged yet). The payment will only be captured 
            after our team confirms your appointment with the medical center.
          </p>

          <div className="bg-accent/10 p-6 rounded-lg border border-accent/20 mb-8">
            <h3 className="font-semibold text-lg mb-3">Next Steps:</h3>
            <ol className="text-left space-y-2 text-muted-foreground">
              <li>1. Complete the medical intake form (next step)</li>
              <li>2. Our team will review your information with the medical center</li>
              <li>3. You'll receive confirmation via email within 24-48 hours</li>
              <li>4. Payment will be charged only after confirmation</li>
            </ol>
          </div>

          <Button
            size="lg"
            onClick={() => setShowIntakeForm(true)}
            className="bg-accent hover:bg-accent/90 text-foreground font-semibold px-8"
          >
            Continue to Medical Form
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default BookingSuccess;
