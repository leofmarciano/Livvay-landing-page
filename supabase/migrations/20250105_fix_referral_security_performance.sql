-- ============================================
-- Fix Referral Security & Performance Issues
-- Based on Supabase Advisor recommendations
-- ============================================

-- 1. Fix SECURITY DEFINER on view (ERROR)
-- Recreate view with SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.referral_code_stats;

CREATE VIEW public.referral_code_stats
WITH (security_invoker = true)
AS
SELECT
  rc.id as code_id,
  rc.code,
  rc.affiliate_id,
  COUNT(DISTINCT rlv.id) as total_visits,
  COUNT(DISTINCT rlv.ip_address) as unique_visitors,
  COUNT(DISTINCT rcc.id) as total_claims,
  MAX(rlv.visited_at) as last_visit,
  MAX(rcc.claimed_at) as last_claim
FROM public.referral_codes rc
LEFT JOIN public.referral_link_visits rlv ON rlv.code_id = rc.id
LEFT JOIN public.referral_code_claims rcc ON rcc.code_id = rc.id
GROUP BY rc.id, rc.code, rc.affiliate_id;

GRANT SELECT ON public.referral_code_stats TO authenticated;

-- 2. Fix function search_path (WARN)
-- Recreate functions with explicit search_path

-- Fix validate_referral_code
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- Fix claim_referral_code
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
  RETURNING public.referral_code_claims.id INTO v_claim_id;

  -- Log the action
  PERFORM public.log_audit('claim', 'referral_code', p_code,
    jsonb_build_object('code_id', v_code_id, 'claim_id', v_claim_id));

  RETURN QUERY SELECT true, 'Código aplicado com sucesso'::TEXT, v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix track_referral_visit
CREATE OR REPLACE FUNCTION public.track_referral_visit(
  p_code TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  code_id UUID,
  code TEXT,
  affiliate_id UUID
) AS $$
DECLARE
  v_code_id UUID;
  v_affiliate_id UUID;
  v_code TEXT;
BEGIN
  -- Find the code
  SELECT rc.id, rc.affiliate_id, rc.code
  INTO v_code_id, v_affiliate_id, v_code
  FROM public.referral_codes rc
  WHERE UPPER(rc.code) = UPPER(p_code)
    AND rc.is_active = true;

  -- If code not found, return failure
  IF v_code_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Record the visit
  INSERT INTO public.referral_link_visits (
    code_id, ip_address, user_agent, referrer,
    country, city, device_type, browser, os
  ) VALUES (
    v_code_id, p_ip_address, p_user_agent, p_referrer,
    p_country, p_city, p_device_type, p_browser, p_os
  );

  -- Return success with code info
  RETURN QUERY SELECT true, v_code_id, v_code, v_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 3. Fix RLS policies - use (select auth.uid()) for better performance
-- And combine multiple permissive policies into single ones

-- Drop existing policies for referral_codes
DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes;
DROP POLICY IF EXISTS "referral_codes_select_admin" ON public.referral_codes;
DROP POLICY IF EXISTS "referral_codes_insert_own" ON public.referral_codes;
DROP POLICY IF EXISTS "referral_codes_update_own" ON public.referral_codes;
DROP POLICY IF EXISTS "referral_codes_delete_own" ON public.referral_codes;

-- Recreate with optimized policies (combined SELECT, using subquery for auth.uid())
CREATE POLICY "referral_codes_select" ON public.referral_codes
  FOR SELECT USING (
    affiliate_id = (SELECT auth.uid())
    OR public.has_permission((SELECT auth.uid()), 'users.read')
  );

CREATE POLICY "referral_codes_insert" ON public.referral_codes
  FOR INSERT WITH CHECK (
    affiliate_id = (SELECT auth.uid())
  );

CREATE POLICY "referral_codes_update" ON public.referral_codes
  FOR UPDATE USING (
    affiliate_id = (SELECT auth.uid())
  );

CREATE POLICY "referral_codes_delete" ON public.referral_codes
  FOR DELETE USING (
    affiliate_id = (SELECT auth.uid())
  );

-- Drop existing policies for referral_code_claims
DROP POLICY IF EXISTS "referral_claims_select_own" ON public.referral_code_claims;
DROP POLICY IF EXISTS "referral_claims_select_admin" ON public.referral_code_claims;
DROP POLICY IF EXISTS "referral_claims_insert" ON public.referral_code_claims;

-- Recreate with optimized policies
CREATE POLICY "referral_claims_select" ON public.referral_code_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = code_id AND rc.affiliate_id = (SELECT auth.uid())
    )
    OR public.has_permission((SELECT auth.uid()), 'users.read')
  );

CREATE POLICY "referral_claims_insert" ON public.referral_code_claims
  FOR INSERT WITH CHECK (
    claimed_by = (SELECT auth.uid())
  );

-- Drop existing policies for referral_link_visits
DROP POLICY IF EXISTS "referral_visits_select_own" ON public.referral_link_visits;
DROP POLICY IF EXISTS "referral_visits_select_admin" ON public.referral_link_visits;
DROP POLICY IF EXISTS "referral_visits_insert_service" ON public.referral_link_visits;

-- Recreate with optimized policies
CREATE POLICY "referral_visits_select" ON public.referral_link_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = code_id AND rc.affiliate_id = (SELECT auth.uid())
    )
    OR public.has_permission((SELECT auth.uid()), 'users.read')
  );

-- Keep insert open for tracking (via service role)
CREATE POLICY "referral_visits_insert" ON public.referral_link_visits
  FOR INSERT WITH CHECK (true);
