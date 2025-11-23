import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Mail, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Booking {
  id: string;
  user_email: string;
  user_phone: string | null;
  selected_date: string;
  selected_time: string;
  status: string;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  intake_forms: Array<{
    checkup_reason: string | null;
    arrival_date: string | null;
    has_chronic_diseases: boolean | null;
    chronic_diseases_details: string | null;
    has_major_surgeries: boolean | null;
    major_surgeries_details: string | null;
    wants_capsule_endoscopy: boolean | null;
    needs_airport_pickup: boolean | null;
    needs_hotel_help: boolean | null;
    preferred_hotel: string | null;
  }>;
}

const Admin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchBookings();
  }, []);

  const checkAdminAndFetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchBookings();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          intake_forms (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const capturePayment = async (booking: Booking) => {
    if (!booking.stripe_payment_intent_id) {
      toast({
        title: "Error",
        description: "No payment intent found",
        variant: "destructive",
      });
      return;
    }

    setProcessingBookingId(booking.id);
    try {
      const { data, error } = await supabase.functions.invoke('capture-payment', {
        body: {
          paymentIntentId: booking.stripe_payment_intent_id,
          bookingId: booking.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment captured and booking confirmed!",
      });
      
      await fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to capture payment",
        variant: "destructive",
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const sendConfirmationEmail = async (bookingId: string) => {
    setProcessingBookingId(bookingId);
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: { bookingId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Confirmation email sent!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus as any })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}`,
      });
      
      await fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: "bg-yellow-500",
      payment_authorized: "bg-blue-500",
      intake_submitted: "bg-purple-500",
      confirmed: "bg-green-500",
      cancelled: "bg-red-500",
      completed: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings and appointments</p>
          </div>
          <Button onClick={fetchBookings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const intakeForm = Array.isArray(booking.intake_forms) 
                ? booking.intake_forms[0] 
                : booking.intake_forms;

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="bg-accent/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{booking.user_email}</CardTitle>
                        <CardDescription>
                          Booking ID: {booking.id.slice(0, 8)}...
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Appointment Details</h3>
                        <dl className="space-y-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground inline">Date:</dt>
                            <dd className="inline ml-2 font-medium">{booking.selected_date}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground inline">Time:</dt>
                            <dd className="inline ml-2 font-medium">{booking.selected_time}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground inline">Phone:</dt>
                            <dd className="inline ml-2 font-medium">{booking.user_phone || "N/A"}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground inline">Amount:</dt>
                            <dd className="inline ml-2 font-medium">{(booking.total_amount / 100).toFixed(0)} RMB</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground inline">Created:</dt>
                            <dd className="inline ml-2 font-medium">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {intakeForm && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Intake Form</h3>
                          <dl className="space-y-2 text-sm">
                            {intakeForm.checkup_reason && (
                              <div>
                                <dt className="text-muted-foreground">Reason:</dt>
                                <dd className="font-medium">{intakeForm.checkup_reason}</dd>
                              </div>
                            )}
                            {intakeForm.arrival_date && (
                              <div>
                                <dt className="text-muted-foreground">Arrival Date:</dt>
                                <dd className="font-medium">{intakeForm.arrival_date}</dd>
                              </div>
                            )}
                            {intakeForm.has_chronic_diseases && (
                              <div>
                                <dt className="text-muted-foreground">Chronic Diseases:</dt>
                                <dd className="font-medium">{intakeForm.chronic_diseases_details}</dd>
                              </div>
                            )}
                            {intakeForm.has_major_surgeries && (
                              <div>
                                <dt className="text-muted-foreground">Major Surgeries:</dt>
                                <dd className="font-medium">{intakeForm.major_surgeries_details}</dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-muted-foreground">Capsule Endoscopy:</dt>
                              <dd className="font-medium">{intakeForm.wants_capsule_endoscopy ? "Yes" : "No"}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Airport Pickup:</dt>
                              <dd className="font-medium">{intakeForm.needs_airport_pickup ? "Yes" : "No"}</dd>
                            </div>
                            {intakeForm.preferred_hotel && (
                              <div>
                                <dt className="text-muted-foreground">Hotel:</dt>
                                <dd className="font-medium">{intakeForm.preferred_hotel}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateStatus(booking.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending_payment">Pending Payment</SelectItem>
                          <SelectItem value="payment_authorized">Payment Authorized</SelectItem>
                          <SelectItem value="intake_submitted">Intake Submitted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>

                      {booking.status === "payment_authorized" && (
                        <Button
                          onClick={() => capturePayment(booking)}
                          disabled={processingBookingId === booking.id}
                          className="bg-gradient-to-r from-primary to-accent"
                        >
                          {processingBookingId === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          Capture Payment
                        </Button>
                      )}

                      {(booking.status === "confirmed" || booking.status === "completed") && (
                        <Button
                          onClick={() => sendConfirmationEmail(booking.id)}
                          disabled={processingBookingId === booking.id}
                          variant="outline"
                        >
                          {processingBookingId === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Mail className="h-4 w-4 mr-2" />
                          )}
                          Send Confirmation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
