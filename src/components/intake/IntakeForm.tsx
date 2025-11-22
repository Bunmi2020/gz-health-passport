import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntakeFormProps {
  bookingId: string;
}

export const IntakeForm = ({ bookingId }: IntakeFormProps) => {
  const [formData, setFormData] = useState({
    howHeardAbout: "",
    checkupReason: "",
    hasChronicDiseases: false,
    chronicDiseasesDetails: "",
    hasMajorSurgeries: false,
    majorSurgeriesDetails: "",
    wantsCapsuleEndoscopy: false,
    capsuleEndoscopyReason: "",
    passportPhotoUrl: "",
    arrivalDate: undefined as Date | undefined,
    needsAirportPickup: false,
    needsHotelHelp: false,
    preferredHotel: "Rosewood Guangzhou",
  });

  const [acknowledgements, setAcknowledgements] = useState({
    extraFees: false,
    paymentCapture: false,
    cancellationPolicy: false,
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // For now, we'll store a placeholder URL
      // In production, you'd upload to Supabase Storage
      const fileUrl = URL.createObjectURL(file);
      setFormData({ ...formData, passportPhotoUrl: fileUrl });
      
      toast({
        title: "Upload Successful",
        description: "Passport photo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload passport photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.passportPhotoUrl) {
      toast({
        title: "Missing Information",
        description: "Please upload your passport photo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.arrivalDate) {
      toast({
        title: "Missing Information",
        description: "Please select your arrival date",
        variant: "destructive",
      });
      return;
    }

    if (!acknowledgements.extraFees || !acknowledgements.paymentCapture || !acknowledgements.cancellationPolicy) {
      toast({
        title: "Acknowledgements Required",
        description: "Please acknowledge all terms before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("intake_forms").insert({
        booking_id: bookingId,
        how_heard_about: formData.howHeardAbout,
        checkup_reason: formData.checkupReason,
        has_chronic_diseases: formData.hasChronicDiseases,
        chronic_diseases_details: formData.chronicDiseasesDetails,
        has_major_surgeries: formData.hasMajorSurgeries,
        major_surgeries_details: formData.majorSurgeriesDetails,
        wants_capsule_endoscopy: formData.wantsCapsuleEndoscopy,
        capsule_endoscopy_reason: formData.capsuleEndoscopyReason,
        passport_photo_url: formData.passportPhotoUrl,
        arrival_date: format(formData.arrivalDate, "yyyy-MM-dd"),
        needs_airport_pickup: formData.needsAirportPickup,
        needs_hotel_help: formData.needsHotelHelp,
        preferred_hotel: formData.preferredHotel,
        extra_fees_acknowledged: true,
        payment_capture_acknowledged: true,
        cancellation_policy_acknowledged: true,
      });

      if (error) throw error;

      // Update booking status
      await supabase
        .from("bookings")
        .update({ status: "intake_submitted" })
        .eq("id", bookingId);

      setSubmitted(true);
      toast({
        title: "Form Submitted",
        description: "Your medical intake form has been submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 md:p-12 text-center shadow-elegant">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Thank You!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your medical intake form has been submitted. Our team in China will review your information 
              and confirm your appointment within 24-48 hours. You'll receive an email with further details.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = "/"}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Return to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-8 md:p-12 shadow-elegant">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
            Medical Intake Form
          </h1>
          <p className="text-muted-foreground mb-8">
            Please provide accurate information to help us prepare for your checkup
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* How heard about */}
            <div>
              <Label htmlFor="howHeard">How did you hear about this service? *</Label>
              <Input
                id="howHeard"
                required
                value={formData.howHeardAbout}
                onChange={(e) => setFormData({ ...formData, howHeardAbout: e.target.value })}
                placeholder="E.g., social media, friend, search engine..."
                className="mt-1.5"
              />
            </div>

            {/* Checkup reason */}
            <div>
              <Label htmlFor="reason">What is your reason for this checkup? *</Label>
              <Textarea
                id="reason"
                required
                value={formData.checkupReason}
                onChange={(e) => setFormData({ ...formData, checkupReason: e.target.value })}
                placeholder="E.g., routine exam, ongoing symptoms, follow-up..."
                className="mt-1.5 min-h-24"
              />
            </div>

            {/* Chronic diseases */}
            <div className="space-y-3">
              <Label>Do you have any chronic diseases?</Label>
              <RadioGroup
                value={formData.hasChronicDiseases ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, hasChronicDiseases: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="chronic-yes" />
                  <Label htmlFor="chronic-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="chronic-no" />
                  <Label htmlFor="chronic-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
              
              {formData.hasChronicDiseases && (
                <Textarea
                  value={formData.chronicDiseasesDetails}
                  onChange={(e) => setFormData({ ...formData, chronicDiseasesDetails: e.target.value })}
                  placeholder="Please specify your chronic conditions..."
                  className="mt-2"
                />
              )}
            </div>

            {/* Major surgeries */}
            <div className="space-y-3">
              <Label>Have you had any major surgeries before?</Label>
              <RadioGroup
                value={formData.hasMajorSurgeries ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, hasMajorSurgeries: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="surgery-yes" />
                  <Label htmlFor="surgery-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="surgery-no" />
                  <Label htmlFor="surgery-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
              
              {formData.hasMajorSurgeries && (
                <Textarea
                  value={formData.majorSurgeriesDetails}
                  onChange={(e) => setFormData({ ...formData, majorSurgeriesDetails: e.target.value })}
                  placeholder="Please specify the surgeries..."
                  className="mt-2"
                />
              )}
            </div>

            {/* Capsule endoscopy */}
            <div className="space-y-3">
              <Label>Do you want a capsule endoscopy (camera pill)?</Label>
              <RadioGroup
                value={formData.wantsCapsuleEndoscopy ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, wantsCapsuleEndoscopy: value === "yes" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="capsule-yes" />
                  <Label htmlFor="capsule-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="capsule-no" />
                  <Label htmlFor="capsule-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
              
              {formData.wantsCapsuleEndoscopy && (
                <Textarea
                  value={formData.capsuleEndoscopyReason}
                  onChange={(e) => setFormData({ ...formData, capsuleEndoscopyReason: e.target.value })}
                  placeholder="Please explain your reason or symptoms..."
                  className="mt-2"
                />
              )}
            </div>

            {/* Passport upload */}
            <div className="space-y-3">
              <Label>Upload Your Passport Photo *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="passport"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="passport"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  ) : formData.passportPhotoUrl ? (
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formData.passportPhotoUrl ? "Passport uploaded" : "Click to upload passport photo"}
                  </span>
                </label>
              </div>
            </div>

            {/* Arrival date */}
            <div className="space-y-3">
              <Label>Your Expected Arrival Date in Guangzhou *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.arrivalDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.arrivalDate ? format(formData.arrivalDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.arrivalDate}
                    onSelect={(date) => setFormData({ ...formData, arrivalDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Airport pickup */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pickup"
                checked={formData.needsAirportPickup}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, needsAirportPickup: checked as boolean })
                }
              />
              <Label htmlFor="pickup" className="font-normal cursor-pointer">
                I need airport pickup service
              </Label>
            </div>

            {/* Hotel help */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hotel"
                  checked={formData.needsHotelHelp}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, needsHotelHelp: checked as boolean })
                  }
                />
                <Label htmlFor="hotel" className="font-normal cursor-pointer">
                  I need help booking a hotel
                </Label>
              </div>
              {formData.needsHotelHelp && (
                <Input
                  value={formData.preferredHotel}
                  onChange={(e) => setFormData({ ...formData, preferredHotel: e.target.value })}
                  placeholder="Preferred hotel (default: Rosewood Guangzhou)"
                />
              )}
            </div>

            {/* Acknowledgements */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-semibold text-lg">Important Acknowledgements *</h3>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="extra-fees"
                  checked={acknowledgements.extraFees}
                  onCheckedChange={(checked) =>
                    setAcknowledgements({ ...acknowledgements, extraFees: checked as boolean })
                  }
                />
                <Label htmlFor="extra-fees" className="font-normal cursor-pointer leading-relaxed">
                  I understand that additional fees may be required depending on my medical condition
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="payment-capture"
                  checked={acknowledgements.paymentCapture}
                  onCheckedChange={(checked) =>
                    setAcknowledgements({ ...acknowledgements, paymentCapture: checked as boolean })
                  }
                />
                <Label htmlFor="payment-capture" className="font-normal cursor-pointer leading-relaxed">
                  I understand that the amount will be charged only after final confirmation from the medical center
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="cancellation"
                  checked={acknowledgements.cancellationPolicy}
                  onCheckedChange={(checked) =>
                    setAcknowledgements({ ...acknowledgements, cancellationPolicy: checked as boolean })
                  }
                />
                <Label htmlFor="cancellation" className="font-normal cursor-pointer leading-relaxed">
                  I understand that booking fees are non-refundable after confirmation
                </Label>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent/90 text-foreground font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Medical Form"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
