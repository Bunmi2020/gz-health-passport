import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Utensils, FileText } from "lucide-react";

export const FAQSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            FAQ & Medical Notes
          </h2>
          <p className="text-lg text-muted-foreground">
            Important information about your checkup
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Cancellation Policy Alert */}
          <Alert className="mb-8 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDescription>
              <strong>Cancellation Policy:</strong> Booking fees are non-refundable after confirmation. 
              Please ensure you're certain about your dates before confirming your appointment.
            </AlertDescription>
          </Alert>

          {/* Preparation Instructions */}
          <div className="mb-8 p-6 bg-card rounded-lg shadow-elegant border">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Pre-Checkup Instructions
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Utensils className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Fasting Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    You may need to fast for 8-12 hours before your checkup. Specific instructions will be provided after booking confirmation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Medical Records</p>
                  <p className="text-sm text-muted-foreground">
                    Bring any previous medical reports, test results, or relevant health documents if available.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Current Medications</p>
                  <p className="text-sm text-muted-foreground">
                    Inform our team about any ongoing medications, supplements, or health conditions during the intake form.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg">
                What's included in the base checkup package?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The base package (¥5,200) includes a comprehensive full-body checkup with advanced scanning, 
                blood work, cardiovascular assessment, and cancer screening markers. It also includes pre-checkup 
                coordination and results translation support.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg">
                When will my card be charged?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your card will be <strong>authorized but not charged</strong> initially. The actual charge only 
                happens after our team in China confirms your appointment suitability with the medical center. 
                If your booking cannot be confirmed, the authorization will be released.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg">
                What optional tests can I add?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can add heavy metals blood testing, comprehensive blood allergy testing, and capsule endoscopy 
                (camera pill for stomach examination). These options are available during the intake form, and prices 
                may vary (total up to ¥7,800 with all add-ons).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg">
                Do you provide airport pickup and hotel booking?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! During the intake form, you can request airport pickup service and hotel booking assistance. 
                Our preferred partner hotel is Rosewood Guangzhou, known for its luxury and proximity to the medical center.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg">
                What if additional tests are required?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                If the medical center recommends additional tests based on your health profile, our team will 
                contact you to discuss the options and associated costs. No additional charges will be made without 
                your explicit approval.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg">
                How long does the checkup take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                A comprehensive checkup typically takes 3-5 hours depending on the tests included in your package. 
                Capsule endoscopy, if selected, may require additional time for monitoring.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left text-lg">
                When will I receive my results?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most results are available within 7-10 business days. Our team will translate the results and 
                provide a comprehensive review. Complex tests may take slightly longer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};
