import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, FileText, Search, CheckCircle2, Stethoscope } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Choose Your Preferred Date",
    description: "Select your day and time from the calendar and submit your initial booking request.",
    badge: "Step 1"
  },
  {
    icon: CreditCard,
    title: "Payment Hold (No Immediate Charge)",
    description: "You will be taken to a secure Stripe payment page where your card will be authorized (held), but not charged yet.",
    badge: "Step 2"
  },
  {
    icon: FileText,
    title: "Complete the Medical Form",
    description: "After the payment hold, you will fill in a medical questionnaire, upload your passport, provide your arrival date, and choose whether you need airport pickup or hotel assistance.",
    badge: "Step 3"
  },
  {
    icon: Search,
    title: "Medical Review by Our Team in China",
    description: "Our team reviews your medical information with the center to confirm suitability and any required additional tests.",
    badge: "Step 4"
  },
  {
    icon: CheckCircle2,
    title: "Final Confirmation & Payment Capture",
    description: "Once your booking is approved, you receive a final confirmation with instructions, and the fee is then charged from your card.",
    badge: "Step 5"
  },
  {
    icon: Stethoscope,
    title: "Checkup Day & Follow-up",
    description: "Attend your scheduled checkup with our full support. We'll help with results translation and any follow-up care needed.",
    badge: "Step 6"
  }
];

export const JourneySection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Your Booking Journey
            <span className="block text-foreground mt-2">From Request to Confirmation</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A transparent, secure process designed for your peace of mind
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="flex gap-6 mb-12 last:mb-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Column */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-luxury flex items-center justify-center shadow-elegant">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-16 bg-border mx-auto mt-4" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pb-8">
                  <Badge variant="secondary" className="mb-3 bg-primary-light text-primary">
                    {step.badge}
                  </Badge>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
