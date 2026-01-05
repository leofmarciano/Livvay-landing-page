-- ============================================
-- Referral Codes Migration
-- Livvay - Affiliate Referral Code System
-- ============================================

-- 1. Referral Codes Table
-- Stores unique referral codes created by affiliates
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_affiliate ON public.referral_codes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active) WHERE is_active = true;

-- 2. Referral Code Claims Table
-- Tracks which accounts were created using which referral codes
CREATE TABLE IF NOT EXISTS public.referral_code_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  claimed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  UNIQUE(code_id, claimed_by)
);

-- Indexes for claims
CREATE INDEX IF NOT EXISTS idx_referral_claims_code ON public.referral_code_claims(code_id);
CREATE INDEX IF NOT EXISTS idx_referral_claims_user ON public.referral_code_claims(claimed_by);

-- 3. Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_code_claims ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for referral_codes

-- Affiliates can view their own codes
CREATE POLICY "referral_codes_select_own" ON public.referral_codes
  FOR SELECT USING (
    auth.uid() = affiliate_id
  );

-- Admins can view all codes
CREATE POLICY "referral_codes_select_admin" ON public.referral_codes
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Affiliates can insert their own codes
CREATE POLICY "referral_codes_insert_own" ON public.referral_codes
  FOR INSERT WITH CHECK (
    auth.uid() = affiliate_id
  );

-- Affiliates can update their own codes
CREATE POLICY "referral_codes_update_own" ON public.referral_codes
  FOR UPDATE USING (
    auth.uid() = affiliate_id
  );

-- Affiliates can delete their own codes
CREATE POLICY "referral_codes_delete_own" ON public.referral_codes
  FOR DELETE USING (
    auth.uid() = affiliate_id
  );

-- 5. RLS Policies for referral_code_claims

-- Code owners can view claims on their codes
CREATE POLICY "referral_claims_select_own" ON public.referral_code_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = code_id AND rc.affiliate_id = auth.uid()
    )
  );

-- Admins can view all claims
CREATE POLICY "referral_claims_select_admin" ON public.referral_code_claims
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Anyone authenticated can claim (insert) - but only once per code
CREATE POLICY "referral_claims_insert" ON public.referral_code_claims
  FOR INSERT WITH CHECK (
    auth.uid() = claimed_by
  );

-- 6. Function: Validate Referral Code (public access)
-- Returns code info if valid, null if invalid
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  affiliate_id UUID,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.code,
    rc.affiliate_id,
    true as is_valid
  FROM public.referral_codes rc
  WHERE UPPER(rc.code) = UPPER(p_code)
    AND rc.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. Function: Claim Referral Code
-- Claims a code for a user, returns success status
CREATE OR REPLACE FUNCTION public.claim_referral_code(
  p_code TEXT,
  p_user_id UUID,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  claim_id UUID
) AS $$
DECLARE
  v_code_id UUID;
  v_affiliate_id UUID;
  v_claim_id UUID;
BEGIN
  -- Find the code
  SELECT rc.id, rc.affiliate_id INTO v_code_id, v_affiliate_id
  FROM public.referral_codes rc
  WHERE UPPER(rc.code) = UPPER(p_code)
    AND rc.is_active = true;

  -- Check if code exists
  IF v_code_id IS NULL THEN
    RETURN QUERY SELECT false, 'Código inválido ou inativo'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Prevent self-referral
  IF v_affiliate_id = p_user_id THEN
    RETURN QUERY SELECT false, 'Você não pode usar seu próprio código'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if user already claimed this code
  IF EXISTS (
    SELECT 1 FROM public.referral_code_claims
    WHERE code_id = v_code_id AND claimed_by = p_user_id
  ) THEN
    RETURN QUERY SELECT false, 'Você já utilizou este código'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Create the claim
  INSERT INTO public.referral_code_claims (code_id, claimed_by, metadata)
  VALUES (v_code_id, p_user_id, p_metadata)
  RETURNING id INTO v_claim_id;

  -- Log the action
  PERFORM public.log_audit('claim', 'referral_code', p_code,
    jsonb_build_object('code_id', v_code_id, 'claim_id', v_claim_id));

  RETURN QUERY SELECT true, 'Código aplicado com sucesso'::TEXT, v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Updated timestamp trigger
CREATE TRIGGER referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 9. Grant permissions
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.referral_codes TO authenticated;
GRANT SELECT, INSERT ON public.referral_code_claims TO authenticated;

-- Public functions need to be accessible to anon for validation
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_code(TEXT, UUID, JSONB) TO authenticated;

-- 10. Add affiliate permissions for codes management
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('affiliate.codes', 'affiliate', 'codes', 'Manage affiliate referral codes')
ON CONFLICT (name) DO NOTHING;

-- Assign to affiliate role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'affiliate'
  AND p.name = 'affiliate.codes'
ON CONFLICT DO NOTHING;
