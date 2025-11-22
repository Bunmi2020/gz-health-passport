import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const baseTests = [
  "Complete full-body checkup",
  "Advanced scanning and diagnostic tests",
  "Blood work and lab analysis",
  "Cardiovascular assessment",
  "Cancer screening markers",
  "Pre-checkup coordination",
  "Results translation support"
];

const optionalTests = [
  { name: "Heavy metals blood test", included: false },
  { name: "Blood allergy test", included: false },
  { name: "Capsule endoscopy (camera pill)", included: false, note: "Subject to medical suitability" }
];

export const PricingSection = () => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Pricing & What's Included
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparent pricing with flexible options to match your needs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 shadow-elegant bg-card border-2 border-primary/20">
            {/* Price Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-luxury text-white px-6 py-3 rounded-full mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider">Starting Price</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl md:text-6xl font-bold text-primary">¥5,200</span>
                <span className="text-2xl text-muted-foreground">- ¥7,800</span>
              </div>
              <p className="text-muted-foreground">
                Final price depends on selected tests and medical requirements
              </p>
            </div>

            {/* Base Package */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Base Package Includes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {baseTests.map((test, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <span className="text-foreground">{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Tests */}
            <div className="mb-8 pt-8 border-t border-border">
              <h3 className="text-2xl font-semibold mb-6 text-center">Optional Add-Ons</h3>
              <div className="space-y-3">
                {optionalTests.map((test, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-foreground font-medium">{test.name}</span>
                      {test.note && (
                        <span className="block text-sm text-muted-foreground mt-1">{test.note}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <Alert className="mb-8 border-accent/50 bg-accent/5">
              <AlertCircle className="h-5 w-5 text-accent" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Additional charges may apply depending on your medical condition or 
                if extra tests are required by the medical team. All fees are discussed and approved before charging your card.
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button 
                size="lg"
                onClick={scrollToBooking}
                className="bg-accent hover:bg-accent/90 text-foreground font-semibold px-8 shadow-gold"
              >
                Book Your Checkup Now
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Note:</strong> Booking fees are non-refundable after confirmation
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
