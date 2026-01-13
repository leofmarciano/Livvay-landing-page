-- ============================================
-- Add is_active field to clinic_profiles
-- ============================================
-- This field allows administrators to deactivate professionals
-- without deleting their data. Inactive professionals will not
-- appear in public listings.

-- Add the is_active column with default true
ALTER TABLE public.clinic_profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create an index for faster filtering on is_active
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_is_active
ON public.clinic_profiles(is_active)
WHERE is_active = true;

-- Create a composite index for common query pattern:
-- filtering by is_active + professional_type
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_active_type
ON public.clinic_profiles(is_active, professional_type)
WHERE is_active = true;
