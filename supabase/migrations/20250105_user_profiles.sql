-- ============================================
-- User Profiles Table for Affiliates
-- Personal data and address management
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal data
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT,

  -- Address
  postal_code TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brasil',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON public.user_profiles(cpf);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own profile
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "user_profiles_select_admin" ON public.user_profiles
  FOR SELECT USING (
    public.has_permission((SELECT auth.uid()), 'users.read')
  );

-- Users can insert their own profile
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
  );

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (
    user_id = (SELECT auth.uid())
  );

-- Admins can update any profile
CREATE POLICY "user_profiles_update_admin" ON public.user_profiles
  FOR UPDATE USING (
    public.has_permission((SELECT auth.uid()), 'users.update')
  );

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- ============================================
-- Helper function to get user profile
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  cpf TEXT,
  rg TEXT,
  postal_code TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.user_id,
    up.full_name,
    up.phone,
    up.birth_date,
    up.cpf,
    up.rg,
    up.postal_code,
    up.street,
    up.number,
    up.complement,
    up.neighborhood,
    up.city,
    up.state,
    up.country,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- ============================================
-- Function to upsert user profile
-- ============================================
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_birth_date DATE,
  p_cpf TEXT,
  p_rg TEXT,
  p_postal_code TEXT,
  p_street TEXT,
  p_number TEXT,
  p_complement TEXT,
  p_neighborhood TEXT,
  p_city TEXT,
  p_state TEXT,
  p_country TEXT DEFAULT 'Brasil'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  profile_id UUID
) AS $$
DECLARE
  v_profile_id UUID;
  v_existing_cpf UUID;
BEGIN
  -- Check if CPF is already used by another user
  SELECT user_id INTO v_existing_cpf
  FROM public.user_profiles
  WHERE cpf = p_cpf AND user_id != p_user_id;

  IF v_existing_cpf IS NOT NULL THEN
    RETURN QUERY SELECT false, 'CPF já cadastrado por outro usuário'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Upsert the profile
  INSERT INTO public.user_profiles (
    user_id, full_name, phone, birth_date, cpf, rg,
    postal_code, street, number, complement, neighborhood, city, state, country
  ) VALUES (
    p_user_id, p_full_name, p_phone, p_birth_date, p_cpf, p_rg,
    p_postal_code, p_street, p_number, p_complement, p_neighborhood, p_city, p_state, p_country
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    cpf = EXCLUDED.cpf,
    rg = EXCLUDED.rg,
    postal_code = EXCLUDED.postal_code,
    street = EXCLUDED.street,
    number = EXCLUDED.number,
    complement = EXCLUDED.complement,
    neighborhood = EXCLUDED.neighborhood,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    updated_at = now()
  RETURNING id INTO v_profile_id;

  -- Log the action
  PERFORM public.log_audit(
    CASE WHEN v_profile_id IS NOT NULL THEN 'update' ELSE 'create' END,
    'user_profile',
    v_profile_id::TEXT,
    jsonb_build_object('user_id', p_user_id)
  );

  RETURN QUERY SELECT true, 'Perfil atualizado com sucesso'::TEXT, v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
