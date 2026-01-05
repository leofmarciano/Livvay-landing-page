-- ============================================
-- Referral Link Tracking Migration
-- Livvay - Track visits to referral links
-- ============================================

-- 1. Referral Link Visits Table
-- Tracks each visit to a referral link
CREATE TABLE IF NOT EXISTS public.referral_link_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_referral_visits_code ON public.referral_link_visits(code_id);
CREATE INDEX IF NOT EXISTS idx_referral_visits_date ON public.referral_link_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_visits_ip ON public.referral_link_visits(ip_address);

-- 2. Enable RLS
ALTER TABLE public.referral_link_visits ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Code owners can view visits on their codes
CREATE POLICY "referral_visits_select_own" ON public.referral_link_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = code_id AND rc.affiliate_id = auth.uid()
    )
  );

-- Admins can view all visits
CREATE POLICY "referral_visits_select_admin" ON public.referral_link_visits
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Anyone can insert (for tracking public visits)
-- Using service role key from API route
CREATE POLICY "referral_visits_insert_service" ON public.referral_link_visits
  FOR INSERT WITH CHECK (true);

-- 4. Function: Track Link Visit
-- Records a visit and returns code info
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT SELECT ON public.referral_link_visits TO authenticated;
GRANT INSERT ON public.referral_link_visits TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_referral_visit(TEXT, INET, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 6. View: Code Statistics
-- Aggregated stats for each code
CREATE OR REPLACE VIEW public.referral_code_stats AS
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
