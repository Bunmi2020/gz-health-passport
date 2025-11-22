import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookingDialog } from "./BookingDialog";

interface TimeSlot {
  slot_date: string;
  slot_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

export const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchTimeSlots = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("slot_date", dateStr)
        .order("slot_time");

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load time slots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selection Required",
        description: "Please select both a date and time slot.",
        variant: "destructive",
      });
      return;
    }
    setShowBookingDialog(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-6 md:p-8 shadow-elegant">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-lg border shadow-sm"
            />
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Available Times</h3>
            
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Please select a date to view available time slots
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">
                  No available slots for this date. Please select another date.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {timeSlots.map((slot) => {
                  const isAvailable = slot.is_available && slot.current_bookings < slot.max_bookings;
                  const isSelected = selectedTime === slot.slot_time;
                  
                  return (
                    <Button
                      key={slot.slot_time}
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full justify-between ${
                        !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      }`}
                      onClick={() => isAvailable && handleTimeSelect(slot.slot_time)}
                      disabled={!isAvailable}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {slot.slot_time.slice(0, 5)}
                      </span>
                      <span className="text-xs">
                        {isAvailable 
                          ? `${slot.max_bookings - slot.current_bookings} spots left`
                          : "Fully Booked"
                        }
                      </span>
                    </Button>
                  );
                })}
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-primary-light p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-primary mb-1">Selected Slot</p>
                  <p className="text-lg font-semibold">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-lg font-semibold">
                    {selectedTime.slice(0, 5)}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-foreground font-semibold shadow-gold"
                  onClick={handleContinue}
                >
                  Continue to Payment
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </div>
  );
};
