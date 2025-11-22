import { BookingCalendar } from "@/components/booking/BookingCalendar";

export const BookingSection = () => {
  return (
    <section id="booking" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Book Your Appointment
          </h2>
          <p className="text-lg text-muted-foreground">
            Select your preferred date and time from the available slots below
          </p>
        </div>

        <BookingCalendar />
      </div>
    </section>
  );
};
