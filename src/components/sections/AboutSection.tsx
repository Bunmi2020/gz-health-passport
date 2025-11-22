import { Card } from "@/components/ui/card";
import { Building2, HeartPulse, Languages, Shield } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            A World-Class Medical Center… 
            <span className="block mt-2">and a Fully Organized Health Journey</span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            We work with a highly advanced medical testing center in Guangzhou equipped with modern scanning and diagnostic technology. 
            Our mission is to manage your entire medical journey: choosing the right appointment, preparing your medical file, 
            coordinating with the center, and finally receiving, translating, and reviewing your results if needed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-card border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Facility</h3>
            <p className="text-muted-foreground">
              State-of-the-art medical center with cutting-edge diagnostic equipment
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-card border-border">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <HeartPulse className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Tests</h3>
            <p className="text-muted-foreground">
              Full-body checkup with optional specialized tests and screenings
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-card border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Languages className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Full Support</h3>
            <p className="text-muted-foreground">
              Guidance before, during, and after your checkup with result translation
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-card border-border">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
            <p className="text-muted-foreground">
              Payment authorization only - charged after medical center confirmation
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
