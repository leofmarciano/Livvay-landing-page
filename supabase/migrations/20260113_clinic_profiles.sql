-- ============================================
-- Clinic Profiles Table
-- ============================================
-- Stores professional information for users with 'clinic' role
-- Each clinic user can have one profile with their professional type

-- Create enum for professional types
DO $$ BEGIN
  CREATE TYPE public.clinic_professional_type AS ENUM ('doctor', 'nutritionist', 'therapist');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create clinic_profiles table
CREATE TABLE IF NOT EXISTS public.clinic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Professional information
  professional_type public.clinic_professional_type NOT NULL,
  license_number VARCHAR(50),
  specialty VARCHAR(100),
  clinic_name VARCHAR(200),

  -- Personal information
  full_name VARCHAR(100),
  phone VARCHAR(20),
  birth_date DATE,
  cpf VARCHAR(11),
  rg VARCHAR(20),

  -- Address
  postal_code VARCHAR(8),
  street VARCHAR(200),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  country VARCHAR(50) DEFAULT 'Brasil',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own clinic profile" ON public.clinic_profiles;
CREATE POLICY "Users can view their own clinic profile"
  ON public.clinic_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own clinic profile" ON public.clinic_profiles;
CREATE POLICY "Users can insert their own clinic profile"
  ON public.clinic_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clinic profile" ON public.clinic_profiles;
CREATE POLICY "Users can update their own clinic profile"
  ON public.clinic_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all clinic profiles" ON public.clinic_profiles;
CREATE POLICY "Admins can view all clinic profiles"
  ON public.clinic_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all clinic profiles" ON public.clinic_profiles;
CREATE POLICY "Admins can manage all clinic profiles"
  ON public.clinic_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_clinic_profiles_updated_at ON public.clinic_profiles;
CREATE TRIGGER update_clinic_profiles_updated_at
  BEFORE UPDATE ON public.clinic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_user_id ON public.clinic_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_professional_type ON public.clinic_profiles(professional_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_profiles_cpf ON public.clinic_profiles(cpf) WHERE cpf IS NOT NULL;

-- ============================================
-- RPC Function to get clinic profile with user data
-- ============================================
CREATE OR REPLACE FUNCTION public.get_clinic_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  professional_type public.clinic_professional_type,
  license_number VARCHAR,
  specialty VARCHAR,
  clinic_name VARCHAR,
  full_name VARCHAR,
  phone VARCHAR,
  birth_date DATE,
  cpf VARCHAR,
  rg VARCHAR,
  postal_code VARCHAR,
  street VARCHAR,
  number VARCHAR,
  complement VARCHAR,
  neighborhood VARCHAR,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR,
  email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.user_id,
    cp.professional_type,
    cp.license_number,
    cp.specialty,
    cp.clinic_name,
    cp.full_name,
    cp.phone,
    cp.birth_date,
    cp.cpf,
    cp.rg,
    cp.postal_code,
    cp.street,
    cp.number,
    cp.complement,
    cp.neighborhood,
    cp.city,
    cp.state,
    cp.country,
    au.email,
    cp.created_at,
    cp.updated_at
  FROM public.clinic_profiles cp
  JOIN auth.users au ON cp.user_id = au.id
  WHERE cp.user_id = p_user_id;
END;
$$;
