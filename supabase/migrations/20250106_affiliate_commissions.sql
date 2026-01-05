-- ============================================
-- Affiliate Commissions System Migration
-- Livvay - Track and calculate affiliate commissions
-- ============================================

-- ============================================
-- PHASE 1: TABLES
-- ============================================

-- 1. Affiliate Commissions Table
-- Tracks individual commission entries for each subscription payment
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  conversion_id UUID NOT NULL REFERENCES public.referral_conversions(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Commission details
  subscription_month INTEGER NOT NULL CHECK (subscription_month >= 1 AND subscription_month <= 12),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('plus', 'max')),
  subscription_amount_cents INTEGER NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
  commission_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status lifecycle: pending → available → requested → paid
  -- Can be cancelled at any point before paid
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'available', 'requested', 'paid', 'cancelled')),
  cancelled_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Period tracking
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  available_at DATE NOT NULL, -- Date when commission becomes available for withdrawal (30 days after creation)

  -- Withdrawal tracking
  withdrawal_request_id UUID,
  paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate commissions for same conversion + month
  UNIQUE(conversion_id, subscription_month)
);

-- 2. Withdrawal Requests Table
-- Tracks affiliate requests for withdrawing available balance
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status lifecycle: pending → approved → paid (or rejected)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  rejected_reason TEXT,

  -- Payment method info (from affiliate profile at time of request)
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PHASE 2: INDEXES
-- ============================================

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_subscriber ON public.affiliate_commissions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_commissions_code ON public.affiliate_commissions(code_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_available_at ON public.affiliate_commissions(available_at);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON public.affiliate_commissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON public.affiliate_commissions(period_start, period_end);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_status ON public.affiliate_commissions(affiliate_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_period ON public.affiliate_commissions(affiliate_id, period_start);

-- Withdrawal requests indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_affiliate ON public.affiliate_withdrawal_requests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.affiliate_withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested ON public.affiliate_withdrawal_requests(requested_at DESC);

-- ============================================
-- PHASE 3: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Commissions policies
CREATE POLICY "commissions_select_own" ON public.affiliate_commissions
  FOR SELECT USING (affiliate_id = auth.uid());

-- Admins can view all commissions
CREATE POLICY "commissions_select_admin" ON public.affiliate_commissions
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Service role can insert (from API)
CREATE POLICY "commissions_insert_service" ON public.affiliate_commissions
  FOR INSERT WITH CHECK (true);

-- Service role can update (for status changes)
CREATE POLICY "commissions_update_service" ON public.affiliate_commissions
  FOR UPDATE USING (true);

-- Withdrawal requests policies
CREATE POLICY "withdrawals_select_own" ON public.affiliate_withdrawal_requests
  FOR SELECT USING (affiliate_id = auth.uid());

CREATE POLICY "withdrawals_insert_own" ON public.affiliate_withdrawal_requests
  FOR INSERT WITH CHECK (affiliate_id = auth.uid());

-- Admins can view all withdrawal requests
CREATE POLICY "withdrawals_select_admin" ON public.affiliate_withdrawal_requests
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'users.read')
  );

-- Service role can update (for processing)
CREATE POLICY "withdrawals_update_service" ON public.affiliate_withdrawal_requests
  FOR UPDATE USING (true);

-- ============================================
-- PHASE 4: FUNCTIONS
-- ============================================

-- 4.1 Get Commission Rate by Month
-- Business rule: 60% months 1-3, 30% months 4-12, 0% after
CREATE OR REPLACE FUNCTION public.get_commission_rate(p_month INTEGER)
RETURNS DECIMAL(5,4)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_month <= 3 THEN
    RETURN 0.60;
  ELSIF p_month <= 12 THEN
    RETURN 0.30;
  ELSE
    RETURN 0.00;
  END IF;
END;
$$;

-- 4.2 Generate Commission
-- Called when Livvay reports a renewal or new subscription
CREATE OR REPLACE FUNCTION public.generate_commission(
  p_conversion_id UUID,
  p_subscription_month INTEGER,
  p_amount_cents INTEGER DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  commission_id UUID,
  amount_cents INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversion public.referral_conversions%ROWTYPE;
  v_code public.referral_codes%ROWTYPE;
  v_rate DECIMAL(5,4);
  v_amount INTEGER;
  v_commission_cents INTEGER;
  v_commission_id UUID;
  v_available_at DATE;
BEGIN
  -- Get conversion details
  SELECT * INTO v_conversion
  FROM public.referral_conversions
  WHERE id = p_conversion_id;

  IF v_conversion IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Conversão não encontrada'::TEXT;
    RETURN;
  END IF;

  -- Get code details (for affiliate_id)
  SELECT * INTO v_code
  FROM public.referral_codes
  WHERE id = v_conversion.code_id;

  IF v_code IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Código de referência não encontrado'::TEXT;
    RETURN;
  END IF;

  -- Get commission rate for this month
  v_rate := public.get_commission_rate(p_subscription_month);

  IF v_rate = 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Sem comissão após o mês 12'::TEXT;
    RETURN;
  END IF;

  -- Use provided amount or conversion amount
  v_amount := COALESCE(p_amount_cents, v_conversion.amount_cents);

  IF v_amount IS NULL OR v_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Valor da assinatura inválido'::TEXT;
    RETURN;
  END IF;

  -- Calculate commission
  v_commission_cents := FLOOR(v_amount * v_rate);

  -- Available 30 days after creation
  v_available_at := CURRENT_DATE + INTERVAL '30 days';

  -- Check for duplicate
  IF EXISTS (
    SELECT 1 FROM public.affiliate_commissions
    WHERE conversion_id = p_conversion_id AND subscription_month = p_subscription_month
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Comissão já existe para este mês'::TEXT;
    RETURN;
  END IF;

  -- Insert commission
  INSERT INTO public.affiliate_commissions (
    affiliate_id,
    code_id,
    conversion_id,
    subscriber_id,
    subscription_month,
    plan_type,
    subscription_amount_cents,
    commission_rate,
    commission_amount_cents,
    period_start,
    period_end,
    available_at
  ) VALUES (
    v_code.affiliate_id,
    v_code.id,
    p_conversion_id,
    v_conversion.user_id,
    p_subscription_month,
    v_conversion.plan_type,
    v_amount,
    v_rate,
    v_commission_cents,
    DATE(v_conversion.converted_at) + ((p_subscription_month - 1) * INTERVAL '1 month'),
    DATE(v_conversion.converted_at) + (p_subscription_month * INTERVAL '1 month') - INTERVAL '1 day',
    v_available_at
  )
  RETURNING id INTO v_commission_id;

  RETURN QUERY SELECT true, v_commission_id, v_commission_cents, 'Comissão criada com sucesso'::TEXT;
END;
$$;

-- 4.3 Cancel Future Commissions (Churn)
-- Called when subscriber cancels or downgrades
CREATE OR REPLACE FUNCTION public.cancel_future_commissions(
  p_subscriber_id UUID,
  p_reason TEXT DEFAULT 'churned'
)
RETURNS TABLE(
  success BOOLEAN,
  cancelled_count INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Cancel all pending/available commissions for this subscriber
  UPDATE public.affiliate_commissions
  SET
    status = 'cancelled',
    cancelled_reason = p_reason,
    cancelled_at = now(),
    updated_at = now()
  WHERE subscriber_id = p_subscriber_id
    AND status IN ('pending', 'available');

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT
    true,
    v_count,
    format('Canceladas %s comissões', v_count)::TEXT;
END;
$$;

-- 4.4 Update Commission Availability
-- Should be called daily (cron job) to transition pending → available
CREATE OR REPLACE FUNCTION public.update_commission_availability()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.affiliate_commissions
  SET
    status = 'available',
    updated_at = now()
  WHERE status = 'pending'
    AND available_at <= CURRENT_DATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 4.5 Get Affiliate Balance
-- Returns pending, available, requested, and paid amounts
CREATE OR REPLACE FUNCTION public.get_affiliate_balance(p_affiliate_id UUID)
RETURNS TABLE(
  pending_cents BIGINT,
  available_cents BIGINT,
  requested_cents BIGINT,
  paid_cents BIGINT,
  total_earned_cents BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount_cents ELSE 0 END), 0)::BIGINT AS pending_cents,
    COALESCE(SUM(CASE WHEN status = 'available' THEN commission_amount_cents ELSE 0 END), 0)::BIGINT AS available_cents,
    COALESCE(SUM(CASE WHEN status = 'requested' THEN commission_amount_cents ELSE 0 END), 0)::BIGINT AS requested_cents,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount_cents ELSE 0 END), 0)::BIGINT AS paid_cents,
    COALESCE(SUM(CASE WHEN status IN ('paid', 'requested', 'available') THEN commission_amount_cents ELSE 0 END), 0)::BIGINT AS total_earned_cents
  FROM public.affiliate_commissions
  WHERE affiliate_id = p_affiliate_id;
END;
$$;

-- 4.6 Request Withdrawal
-- Creates a withdrawal request and marks commissions as requested
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_affiliate_id UUID,
  p_amount_cents INTEGER,
  p_payment_method TEXT,
  p_payment_details JSONB DEFAULT '{}'
)
RETURNS TABLE(
  success BOOLEAN,
  request_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available BIGINT;
  v_request_id UUID;
  v_remaining INTEGER;
BEGIN
  -- Check available balance
  SELECT COALESCE(SUM(commission_amount_cents), 0)
  INTO v_available
  FROM public.affiliate_commissions
  WHERE affiliate_id = p_affiliate_id AND status = 'available';

  IF v_available < p_amount_cents THEN
    RETURN QUERY SELECT false, NULL::UUID, format('Saldo disponível insuficiente: $%.2f', v_available / 100.0)::TEXT;
    RETURN;
  END IF;

  -- Minimum withdrawal check ($50)
  IF p_amount_cents < 5000 THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Valor mínimo para saque é $50,00'::TEXT;
    RETURN;
  END IF;

  -- Create withdrawal request
  INSERT INTO public.affiliate_withdrawal_requests (
    affiliate_id,
    amount_cents,
    payment_method,
    payment_details
  ) VALUES (
    p_affiliate_id,
    p_amount_cents,
    p_payment_method,
    p_payment_details
  )
  RETURNING id INTO v_request_id;

  -- Mark commissions as requested (oldest first until amount is covered)
  v_remaining := p_amount_cents;

  WITH commissions_to_request AS (
    SELECT id, commission_amount_cents
    FROM public.affiliate_commissions
    WHERE affiliate_id = p_affiliate_id AND status = 'available'
    ORDER BY created_at ASC
  ),
  running_total AS (
    SELECT
      id,
      commission_amount_cents,
      SUM(commission_amount_cents) OVER (ORDER BY id) AS running_sum
    FROM commissions_to_request
  )
  UPDATE public.affiliate_commissions ac
  SET
    status = 'requested',
    withdrawal_request_id = v_request_id,
    updated_at = now()
  FROM running_total rt
  WHERE ac.id = rt.id
    AND rt.running_sum - rt.commission_amount_cents < p_amount_cents;

  RETURN QUERY SELECT true, v_request_id, 'Solicitação de saque criada com sucesso'::TEXT;
END;
$$;

-- 4.7 Get Affiliate Analytics
-- Returns time-series data for dashboard charts
CREATE OR REPLACE FUNCTION public.get_affiliate_analytics(
  p_affiliate_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_group_by TEXT DEFAULT 'day'
)
RETURNS TABLE(
  period_date DATE,
  visits INTEGER,
  installs INTEGER,
  subscriptions INTEGER,
  plus_count INTEGER,
  max_count INTEGER,
  churns INTEGER,
  earnings_cents BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      p_start_date,
      p_end_date,
      CASE p_group_by
        WHEN 'day' THEN '1 day'::INTERVAL
        WHEN 'week' THEN '1 week'::INTERVAL
        ELSE '1 month'::INTERVAL
      END
    )::DATE AS d
  ),
  affiliate_codes AS (
    SELECT id FROM public.referral_codes WHERE affiliate_id = p_affiliate_id
  ),
  visits_data AS (
    SELECT
      CASE p_group_by
        WHEN 'day' THEN DATE(visited_at)
        WHEN 'week' THEN DATE(date_trunc('week', visited_at))
        ELSE DATE(date_trunc('month', visited_at))
      END AS period,
      COUNT(DISTINCT id) AS cnt
    FROM public.referral_link_visits
    WHERE code_id IN (SELECT id FROM affiliate_codes)
      AND DATE(visited_at) BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  ),
  claims_data AS (
    SELECT
      CASE p_group_by
        WHEN 'day' THEN DATE(claimed_at)
        WHEN 'week' THEN DATE(date_trunc('week', claimed_at))
        ELSE DATE(date_trunc('month', claimed_at))
      END AS period,
      COUNT(DISTINCT id) AS cnt
    FROM public.referral_code_claims
    WHERE code_id IN (SELECT id FROM affiliate_codes)
      AND DATE(claimed_at) BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  ),
  conversions_data AS (
    SELECT
      CASE p_group_by
        WHEN 'day' THEN DATE(converted_at)
        WHEN 'week' THEN DATE(date_trunc('week', converted_at))
        ELSE DATE(date_trunc('month', converted_at))
      END AS period,
      COUNT(DISTINCT CASE WHEN event_type = 'new' THEN id END) AS subs,
      COUNT(DISTINCT CASE WHEN event_type = 'new' AND plan_type = 'plus' THEN id END) AS plus_cnt,
      COUNT(DISTINCT CASE WHEN event_type = 'new' AND plan_type = 'max' THEN id END) AS max_cnt,
      COUNT(DISTINCT CASE WHEN event_type IN ('cancel', 'downgrade') THEN id END) AS churn_cnt
    FROM public.referral_conversions
    WHERE code_id IN (SELECT id FROM affiliate_codes)
      AND DATE(converted_at) BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  ),
  commissions_data AS (
    SELECT
      CASE p_group_by
        WHEN 'day' THEN DATE(created_at)
        WHEN 'week' THEN DATE(date_trunc('week', created_at))
        ELSE DATE(date_trunc('month', created_at))
      END AS period,
      SUM(commission_amount_cents) AS earnings
    FROM public.affiliate_commissions
    WHERE affiliate_id = p_affiliate_id
      AND status NOT IN ('cancelled')
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  )
  SELECT
    ds.d,
    COALESCE(v.cnt, 0)::INTEGER,
    COALESCE(c.cnt, 0)::INTEGER,
    COALESCE(cv.subs, 0)::INTEGER,
    COALESCE(cv.plus_cnt, 0)::INTEGER,
    COALESCE(cv.max_cnt, 0)::INTEGER,
    COALESCE(cv.churn_cnt, 0)::INTEGER,
    COALESCE(cm.earnings, 0)::BIGINT
  FROM date_series ds
  LEFT JOIN visits_data v ON v.period = ds.d
  LEFT JOIN claims_data c ON c.period = ds.d
  LEFT JOIN conversions_data cv ON cv.period = ds.d
  LEFT JOIN commissions_data cm ON cm.period = ds.d
  ORDER BY ds.d;
END;
$$;

-- 4.8 Get Affiliate Subscribers
-- Returns list of subscribers with status and earnings
CREATE OR REPLACE FUNCTION public.get_affiliate_subscribers(
  p_affiliate_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  subscriber_id UUID,
  email_masked TEXT,
  plan_type TEXT,
  status TEXT,
  subscribed_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  total_commission_cents BIGINT,
  code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH subscriber_data AS (
    SELECT DISTINCT ON (rcv.user_id)
      rcv.user_id,
      rcv.plan_type AS plan,
      rcv.converted_at,
      rcv.event_type,
      rc.code AS ref_code,
      -- Check for churn
      (
        SELECT MAX(converted_at)
        FROM public.referral_conversions
        WHERE user_id = rcv.user_id
          AND event_type IN ('cancel', 'downgrade')
      ) AS churn_date
    FROM public.referral_conversions rcv
    JOIN public.referral_codes rc ON rc.id = rcv.code_id
    WHERE rc.affiliate_id = p_affiliate_id
      AND rcv.event_type = 'new'
    ORDER BY rcv.user_id, rcv.converted_at DESC
  ),
  subscriber_earnings AS (
    SELECT
      subscriber_id AS sid,
      SUM(commission_amount_cents) AS total_cents
    FROM public.affiliate_commissions
    WHERE affiliate_id = p_affiliate_id
      AND status NOT IN ('cancelled')
    GROUP BY subscriber_id
  )
  SELECT
    sd.user_id,
    -- Mask email for privacy
    COALESCE(
      SUBSTRING(u.email FROM 1 FOR 2) || '***@' || SUBSTRING(u.email FROM POSITION('@' IN u.email) + 1),
      'anônimo'
    )::TEXT,
    sd.plan,
    CASE WHEN sd.churn_date IS NOT NULL THEN 'churned' ELSE 'active' END::TEXT,
    sd.converted_at,
    sd.churn_date,
    COALESCE(se.total_cents, 0)::BIGINT,
    sd.ref_code
  FROM subscriber_data sd
  LEFT JOIN auth.users u ON u.id = sd.user_id
  LEFT JOIN subscriber_earnings se ON se.sid = sd.user_id
  WHERE (p_status IS NULL OR
         (p_status = 'active' AND sd.churn_date IS NULL) OR
         (p_status = 'churned' AND sd.churn_date IS NOT NULL))
  ORDER BY sd.converted_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 4.9 Get Top Performing Codes
-- Returns codes ranked by performance
CREATE OR REPLACE FUNCTION public.get_top_codes(
  p_affiliate_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  code TEXT,
  visits BIGINT,
  installs BIGINT,
  subscriptions BIGINT,
  earnings_cents BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.code,
    COUNT(DISTINCT rlv.id)::BIGINT AS visits,
    COUNT(DISTINCT rcc.id)::BIGINT AS installs,
    COUNT(DISTINCT CASE WHEN rcv.event_type = 'new' THEN rcv.id END)::BIGINT AS subscriptions,
    COALESCE(SUM(ac.commission_amount_cents) FILTER (WHERE ac.status NOT IN ('cancelled')), 0)::BIGINT AS earnings_cents
  FROM public.referral_codes rc
  LEFT JOIN public.referral_link_visits rlv ON rlv.code_id = rc.id
    AND (p_start_date IS NULL OR DATE(rlv.visited_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(rlv.visited_at) <= p_end_date)
  LEFT JOIN public.referral_code_claims rcc ON rcc.code_id = rc.id
    AND (p_start_date IS NULL OR DATE(rcc.claimed_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(rcc.claimed_at) <= p_end_date)
  LEFT JOIN public.referral_conversions rcv ON rcv.code_id = rc.id
    AND (p_start_date IS NULL OR DATE(rcv.converted_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(rcv.converted_at) <= p_end_date)
  LEFT JOIN public.affiliate_commissions ac ON ac.code_id = rc.id
    AND (p_start_date IS NULL OR DATE(ac.created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(ac.created_at) <= p_end_date)
  WHERE rc.affiliate_id = p_affiliate_id
  GROUP BY rc.id, rc.code
  ORDER BY earnings_cents DESC, subscriptions DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- PHASE 5: GRANTS
-- ============================================

GRANT SELECT ON public.affiliate_commissions TO authenticated;
GRANT SELECT, INSERT ON public.affiliate_withdrawal_requests TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_commission_rate(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_commission(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_future_commissions(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_commission_availability() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(UUID, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_analytics(UUID, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_affiliate_subscribers(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_codes(UUID, DATE, DATE, INTEGER) TO authenticated;
