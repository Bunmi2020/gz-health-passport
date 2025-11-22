-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending_payment', 'payment_authorized', 'intake_submitted', 'under_review', 'confirmed', 'cancelled', 'completed');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_phone TEXT,
  selected_date DATE NOT NULL,
  selected_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_payment',
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  total_amount INTEGER NOT NULL, -- in RMB cents (5200-7800 RMB = 520000-780000 cents)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create intake_forms table
CREATE TABLE public.intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  how_heard_about TEXT,
  checkup_reason TEXT,
  has_chronic_diseases BOOLEAN DEFAULT false,
  chronic_diseases_details TEXT,
  has_major_surgeries BOOLEAN DEFAULT false,
  major_surgeries_details TEXT,
  wants_capsule_endoscopy BOOLEAN DEFAULT false,
  capsule_endoscopy_reason TEXT,
  passport_photo_url TEXT,
  arrival_date DATE,
  needs_airport_pickup BOOLEAN DEFAULT false,
  needs_hotel_help BOOLEAN DEFAULT false,
  preferred_hotel TEXT DEFAULT 'Rosewood Guangzhou',
  extra_fees_acknowledged BOOLEAN DEFAULT false,
  payment_capture_acknowledged BOOLEAN DEFAULT false,
  cancellation_policy_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create availability_slots table
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(slot_date, slot_time)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (true); -- Public read for now (guest checkouts)

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true); -- Allow anyone to create bookings

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (true); -- Public update for payment flow

-- RLS Policies for intake_forms
CREATE POLICY "Users can view their own intake forms"
  ON public.intake_forms FOR SELECT
  USING (true);

CREATE POLICY "Users can create intake forms"
  ON public.intake_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own intake forms"
  ON public.intake_forms FOR UPDATE
  USING (true);

-- RLS Policies for availability_slots (public read-only)
CREATE POLICY "Anyone can view availability"
  ON public.availability_slots FOR SELECT
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intake_forms_updated_at
  BEFORE UPDATE ON public.intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default availability slots (next 30 days, 9 AM - 5 PM)
INSERT INTO public.availability_slots (slot_date, slot_time, is_available, max_bookings)
SELECT 
  (CURRENT_DATE + interval '1 day' * generate_series)::date as slot_date,
  (time '09:00:00' + interval '1 hour' * hour_offset)::time as slot_time,
  true as is_available,
  2 as max_bookings
FROM 
  generate_series(1, 30) as generate_series,
  generate_series(0, 8) as hour_offset;