-- ============================================
-- Referral Conversions Migration
-- Livvay - Track subscription conversions from referrals
-- ============================================

-- 1. Referral Conversions Table
-- Tracks subscription events (new, upgrade, downgrade, renewal, cancel)
CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.referral_code_claims(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversion details
  event_type TEXT NOT NULL CHECK (event_type IN ('new', 'upgrade', 'downgrade', 'renewal', 'cancel')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('plus', 'max')),
  previous_plan TEXT CHECK (previous_plan IS NULL OR previous_plan IN ('plus', 'max')),

  -- Payment info
  subscription_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'BRL',
  billing_period TEXT CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'yearly')),

  -- Source tracking
  source TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  converted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code ON public.referral_conversions(code_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_user ON public.referral_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_claim ON public.referral_conversions(claim_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_plan ON public.referral_conversions(plan_type);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_event ON public.referral_conversions(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_date ON public.referral_conversions(converted_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code_event
  ON public.referral_conversions(code_id, event_type);

-- 3. Enable RLS
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Affiliates can view conversions on their codes
CREATE POLICY "referral_conversions_select_own" ON public.referral_conversions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = code_id AND rc.affiliate_id = auth.uid()
    )
  );

-- Admins can view all conversions
CREATE POLICY "referral_conversions_select_admin" ON public.referral_conversions
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Service role can insert (API from Livvay app)
CREATE POLICY "referral_conversions_insert_service" ON public.referral_conversions
  FOR INSERT WITH CHECK (true);

-- 5. Function: Record Referral Conversion
-- Called by the Livvay app to report subscription events
CREATE OR REPLACE FUNCTION public.record_referral_conversion(
  p_user_id UUID,
  p_event_type TEXT,
  p_plan_type TEXT,
  p_previous_plan TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL,
  p_amount_cents INTEGER DEFAULT NULL,
  p_billing_period TEXT DEFAULT NULL,
  p_source TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  success BOOLEAN,
  conversion_id UUID,
  code TEXT,
  affiliate_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim public.referral_code_claims%ROWTYPE;
  v_code public.referral_codes%ROWTYPE;
  v_conversion_id UUID;
BEGIN
  -- Validate event_type
  IF p_event_type NOT IN ('new', 'upgrade', 'downgrade', 'renewal', 'cancel') THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::UUID, 'Tipo de evento inválido'::TEXT;
    RETURN;
  END IF;

  -- Validate plan_type
  IF p_plan_type NOT IN ('plus', 'max') THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::UUID, 'Tipo de plano inválido'::TEXT;
    RETURN;
  END IF;

  -- Find the user's claim (referral they used)
  SELECT * INTO v_claim
  FROM public.referral_code_claims
  WHERE claimed_by = p_user_id
  ORDER BY claimed_at DESC
  LIMIT 1;

  IF v_claim IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::UUID, 'Usuário não tem código de referência'::TEXT;
    RETURN;
  END IF;

  -- Get the code details
  SELECT * INTO v_code
  FROM public.referral_codes
  WHERE id = v_claim.code_id;

  IF v_code IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::UUID, 'Código de referência não encontrado'::TEXT;
    RETURN;
  END IF;

  -- Insert the conversion
  INSERT INTO public.referral_conversions (
    code_id,
    claim_id,
    user_id,
    event_type,
    plan_type,
    previous_plan,
    subscription_id,
    amount_cents,
    billing_period,
    source,
    metadata
  ) VALUES (
    v_claim.code_id,
    v_claim.id,
    p_user_id,
    p_event_type,
    p_plan_type,
    p_previous_plan,
    p_subscription_id,
    p_amount_cents,
    p_billing_period,
    p_source,
    p_metadata
  )
  RETURNING id INTO v_conversion_id;

  RETURN QUERY SELECT
    true,
    v_conversion_id,
    v_code.code,
    v_code.affiliate_id,
    'Conversão registrada com sucesso'::TEXT;
END;
$$;

-- 6. Update the referral_code_stats view to include conversions
DROP VIEW IF EXISTS public.referral_code_stats;

CREATE VIEW public.referral_code_stats AS
SELECT
  rc.id AS code_id,
  rc.code,
  rc.affiliate_id,
  -- Visit metrics
  COUNT(DISTINCT rlv.id) AS total_visits,
  COUNT(DISTINCT rlv.ip_address) AS unique_visitors,
  -- Claim metrics (installs)
  COUNT(DISTINCT rcc.id) AS total_claims,
  -- Conversion metrics (subscriptions)
  COUNT(DISTINCT rcv.id) AS total_conversions,
  -- New subscriptions by plan
  COUNT(DISTINCT rcv.id) FILTER (WHERE rcv.event_type = 'new' AND rcv.plan_type = 'plus') AS new_plus,
  COUNT(DISTINCT rcv.id) FILTER (WHERE rcv.event_type = 'new' AND rcv.plan_type = 'max') AS new_max,
  -- Upgrades
  COUNT(DISTINCT rcv.id) FILTER (WHERE rcv.event_type = 'upgrade') AS total_upgrades,
  -- Active subscribers (users with new or upgrade, not cancelled)
  COUNT(DISTINCT rcv.user_id) FILTER (WHERE rcv.event_type IN ('new', 'upgrade')) AS active_subscribers,
  -- Cancellations
  COUNT(DISTINCT rcv.id) FILTER (WHERE rcv.event_type = 'cancel') AS total_cancels,
  -- Timestamps
  MAX(rlv.visited_at) AS last_visit,
  MAX(rcc.claimed_at) AS last_claim,
  MAX(rcv.converted_at) AS last_conversion
FROM public.referral_codes rc
LEFT JOIN public.referral_link_visits rlv ON rlv.code_id = rc.id
LEFT JOIN public.referral_code_claims rcc ON rcc.code_id = rc.id
LEFT JOIN public.referral_conversions rcv ON rcv.code_id = rc.id
GROUP BY rc.id, rc.code, rc.affiliate_id;

-- 7. Grant permissions
GRANT SELECT ON public.referral_conversions TO authenticated;
GRANT INSERT ON public.referral_conversions TO authenticated;
GRANT SELECT ON public.referral_code_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_referral_conversion(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, JSONB) TO authenticated;
