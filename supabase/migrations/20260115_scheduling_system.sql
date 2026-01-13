-- ============================================
-- Scheduling System - Tables, Enums, Indexes
-- ============================================
-- Telemedicine appointment scheduling system
-- Race-condition safe with proper constraints

-- ============================================
-- 1. ENUMS
-- ============================================

-- Appointment status lifecycle
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM (
    'scheduled',    -- Confirmed booking
    'completed',    -- Appointment finished
    'cancelled',    -- Cancelled by patient or professional
    'no_show'       -- Patient did not attend
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Who initiated the cancellation
DO $$ BEGIN
  CREATE TYPE public.cancellation_initiator AS ENUM (
    'patient',
    'professional',
    'system'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type of availability block
DO $$ BEGIN
  CREATE TYPE public.block_type AS ENUM (
    'vacation',     -- Extended time off
    'holiday',      -- Public holiday
    'personal',     -- Personal absence
    'other'         -- Other reasons
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. TABLES
-- ============================================

-- Patient-Professional Claims
-- Tracks which Livvay users have claimed which professionals
-- Each user can claim 1 professional per type (doctor, nutritionist, therapist)
CREATE TABLE IF NOT EXISTS public.patient_professional_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient: External Livvay user UUID (NOT an auth.users reference)
  livvay_user_id UUID NOT NULL,

  -- Professional: References clinic_profiles
  clinic_profile_id UUID NOT NULL REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  professional_type public.clinic_professional_type NOT NULL,

  -- Claim tracking (used for 30-day change restriction)
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce: 1 professional per type per patient
  UNIQUE(livvay_user_id, professional_type)
);

-- Appointments
-- Stores telemedicine appointment records
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  livvay_user_id UUID NOT NULL,  -- External Livvay user UUID
  clinic_profile_id UUID NOT NULL REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,
  professional_type public.clinic_professional_type NOT NULL,

  -- Scheduling (Brasilia timezone: America/Sao_Paulo)
  appointment_date DATE NOT NULL,
  slot_start TIME NOT NULL,  -- e.g., '07:00', '07:30', etc.
  slot_end TIME NOT NULL,    -- Always slot_start + 30 minutes
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',

  -- Telemedicine
  video_link TEXT,  -- Video call link

  -- Status
  status public.appointment_status NOT NULL DEFAULT 'scheduled',

  -- Cancellation tracking
  cancelled_at TIMESTAMPTZ,
  cancelled_by public.cancellation_initiator,
  cancellation_reason TEXT,

  -- Completion tracking
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_slot_times CHECK (
    slot_start >= '07:00'::TIME AND
    slot_end <= '19:00'::TIME AND
    slot_end = slot_start + INTERVAL '30 minutes'
  ),

  -- Prevent duplicate bookings: same professional + date + slot
  -- Note: This allows rebooking after cancellation since cancelled slots
  -- will have a different status, but we handle this in the RPC
  UNIQUE(clinic_profile_id, appointment_date, slot_start)
);

-- Professional Blocks
-- Stores time blocks when professionals are unavailable
CREATE TABLE IF NOT EXISTS public.professional_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Professional
  clinic_profile_id UUID NOT NULL REFERENCES public.clinic_profiles(id) ON DELETE CASCADE,

  -- Block period
  block_date DATE NOT NULL,
  start_time TIME,  -- NULL = full day block
  end_time TIME,    -- NULL = full day block

  -- Metadata
  block_type public.block_type NOT NULL DEFAULT 'other',
  reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_block_times CHECK (
    (start_time IS NULL AND end_time IS NULL) OR  -- Full day
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- ============================================
-- 3. INDEXES
-- ============================================

-- Claims indexes
CREATE INDEX IF NOT EXISTS idx_claims_livvay_user
  ON public.patient_professional_claims(livvay_user_id);
CREATE INDEX IF NOT EXISTS idx_claims_clinic_profile
  ON public.patient_professional_claims(clinic_profile_id);
CREATE INDEX IF NOT EXISTS idx_claims_professional_type
  ON public.patient_professional_claims(professional_type);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_at
  ON public.patient_professional_claims(claimed_at);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_livvay_user
  ON public.appointments(livvay_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_profile
  ON public.appointments(clinic_profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date
  ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_type
  ON public.appointments(professional_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_profile_date_status
  ON public.appointments(clinic_profile_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date
  ON public.appointments(livvay_user_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_type_date
  ON public.appointments(livvay_user_id, professional_type, appointment_date);

-- Partial index for active appointments only (most common query)
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled
  ON public.appointments(clinic_profile_id, appointment_date, slot_start)
  WHERE status = 'scheduled';

-- Blocks indexes
CREATE INDEX IF NOT EXISTS idx_blocks_clinic_profile
  ON public.professional_blocks(clinic_profile_id);
CREATE INDEX IF NOT EXISTS idx_blocks_date
  ON public.professional_blocks(block_date);
CREATE INDEX IF NOT EXISTS idx_blocks_profile_date
  ON public.professional_blocks(clinic_profile_id, block_date);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Updated at trigger for claims
DROP TRIGGER IF EXISTS update_claims_updated_at ON public.patient_professional_claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.patient_professional_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Updated at trigger for appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Updated at trigger for blocks
DROP TRIGGER IF EXISTS update_blocks_updated_at ON public.professional_blocks;
CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON public.professional_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.patient_professional_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_blocks ENABLE ROW LEVEL SECURITY;

-- Claims policies (internal API access via service role)
-- Service role bypasses RLS, but we add policies for defense-in-depth

-- Clinic professionals can view claims for their profile
DROP POLICY IF EXISTS "claims_select_for_professional" ON public.patient_professional_claims;
CREATE POLICY "claims_select_for_professional"
  ON public.patient_professional_claims FOR SELECT
  USING (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can view all claims
DROP POLICY IF EXISTS "claims_select_for_admin" ON public.patient_professional_claims;
CREATE POLICY "claims_select_for_admin"
  ON public.patient_professional_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Appointments policies

-- Clinic professionals can view their appointments
DROP POLICY IF EXISTS "appointments_select_for_professional" ON public.appointments;
CREATE POLICY "appointments_select_for_professional"
  ON public.appointments FOR SELECT
  USING (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all appointments
DROP POLICY IF EXISTS "appointments_all_for_admin" ON public.appointments;
CREATE POLICY "appointments_all_for_admin"
  ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Blocks policies

-- Clinic professionals can manage their own blocks
DROP POLICY IF EXISTS "blocks_select_own" ON public.professional_blocks;
CREATE POLICY "blocks_select_own"
  ON public.professional_blocks FOR SELECT
  USING (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "blocks_insert_own" ON public.professional_blocks;
CREATE POLICY "blocks_insert_own"
  ON public.professional_blocks FOR INSERT
  WITH CHECK (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "blocks_update_own" ON public.professional_blocks;
CREATE POLICY "blocks_update_own"
  ON public.professional_blocks FOR UPDATE
  USING (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "blocks_delete_own" ON public.professional_blocks;
CREATE POLICY "blocks_delete_own"
  ON public.professional_blocks FOR DELETE
  USING (
    clinic_profile_id IN (
      SELECT id FROM public.clinic_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all blocks
DROP POLICY IF EXISTS "blocks_all_for_admin" ON public.professional_blocks;
CREATE POLICY "blocks_all_for_admin"
  ON public.professional_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
