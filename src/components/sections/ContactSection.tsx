import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone } from "lucide-react";

export const ContactSection = () => {
  return (
    <section className="py-24 bg-gradient-luxury text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Need Assistance?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Our team is ready to help you with any questions about the booking process, medical requirements, or travel arrangements
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Support</h3>
              <p className="text-sm opacity-80 mb-4">
                Chat with us anytime for quick responses
              </p>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.open("https://wa.me/1234567890", "_blank")}
              >
                Chat on WhatsApp
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-sm opacity-80 mb-4">
                Send detailed inquiries to our team
              </p>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.location.href = "mailto:support@healthchina.com"}
              >
                Send Email
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
              <p className="text-sm opacity-80 mb-4">
                Call us for immediate assistance
              </p>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => window.location.href = "tel:+1234567890"}
              >
                Call Now
              </Button>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-sm opacity-75">
              Operating Hours: Monday - Saturday, 9:00 AM - 6:00 PM (China Time) | Sunday: By Appointment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
