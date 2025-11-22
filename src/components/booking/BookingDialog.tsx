import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export const BookingDialog = ({ open, onOpenChange, selectedDate, selectedTime }: BookingDialogProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Create initial booking record
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_email: email,
          user_phone: phone,
          selected_date: format(selectedDate, "yyyy-MM-dd"),
          selected_time: selectedTime,
          total_amount: 520000, // Starting price in cents (¥5,200)
          status: "pending_payment",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Stripe payment intent for authorization (hold)
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-payment-authorization",
        {
          body: {
            booking_id: booking.id,
            amount: 520000,
            email: email,
          },
        }
      );

      if (paymentError) throw paymentError;

      // Redirect to Stripe payment page
      if (paymentData?.url) {
        window.open(paymentData.url, "_blank");
        toast({
          title: "Redirecting to Payment",
          description: "Opening secure payment page...",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Confirm Your Details
          </DialogTitle>
          <DialogDescription>
            Enter your contact information to proceed with payment authorization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedDate && selectedTime && (
            <div className="bg-primary-light p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Selected Appointment</p>
              <p className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
              <p className="font-semibold">{selectedTime.slice(0, 5)}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 xxx xxx xxxx"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <strong>Next Step:</strong> You'll be redirected to a secure Stripe payment page where your card will be <strong>authorized but not charged</strong>. 
              Payment will only be captured after medical center confirmation.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-foreground font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment Authorization"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
