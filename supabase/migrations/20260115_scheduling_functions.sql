-- ============================================
-- Scheduling System - RPC Functions
-- ============================================
-- Race-condition safe functions for appointment scheduling

-- ============================================
-- 1. claim_professional
-- ============================================
-- Atomically claims a professional for a patient
-- Enforces: 1 per type, 30-day change restriction

CREATE OR REPLACE FUNCTION public.claim_professional(
  p_livvay_user_id UUID,
  p_clinic_profile_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  claim_id UUID,
  message TEXT,
  can_change_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_professional_type public.clinic_professional_type;
  v_is_active BOOLEAN;
  v_existing_claim RECORD;
  v_new_claim_id UUID;
  v_thirty_days_ago TIMESTAMPTZ := now() - INTERVAL '30 days';
BEGIN
  -- 1. Validate professional exists and is active
  SELECT cp.professional_type, cp.is_active
  INTO v_professional_type, v_is_active
  FROM public.clinic_profiles cp
  WHERE cp.id = p_clinic_profile_id;

  IF v_professional_type IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Profissional nao encontrado'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF NOT v_is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Profissional nao esta disponivel'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- 2. Check for existing claim of same type (with row lock)
  SELECT * INTO v_existing_claim
  FROM public.patient_professional_claims
  WHERE livvay_user_id = p_livvay_user_id
    AND professional_type = v_professional_type
  FOR UPDATE;

  IF v_existing_claim IS NOT NULL THEN
    -- Already claimed same professional
    IF v_existing_claim.clinic_profile_id = p_clinic_profile_id THEN
      RETURN QUERY SELECT
        true,
        v_existing_claim.id,
        'Profissional ja esta na sua equipe'::TEXT,
        (v_existing_claim.claimed_at + INTERVAL '30 days')::TIMESTAMPTZ;
      RETURN;
    END IF;

    -- Check 30-day restriction
    IF v_existing_claim.claimed_at > v_thirty_days_ago THEN
      RETURN QUERY SELECT
        false,
        NULL::UUID,
        format('Voce so pode trocar de %s apos %s',
          CASE v_professional_type
            WHEN 'doctor' THEN 'medico'
            WHEN 'nutritionist' THEN 'nutricionista'
            WHEN 'therapist' THEN 'terapeuta'
          END,
          to_char(v_existing_claim.claimed_at + INTERVAL '30 days', 'DD/MM/YYYY')
        )::TEXT,
        (v_existing_claim.claimed_at + INTERVAL '30 days')::TIMESTAMPTZ;
      RETURN;
    END IF;

    -- Update existing claim (30 days passed)
    UPDATE public.patient_professional_claims
    SET
      clinic_profile_id = p_clinic_profile_id,
      claimed_at = now(),
      updated_at = now()
    WHERE id = v_existing_claim.id
    RETURNING id INTO v_new_claim_id;

    -- Log the change
    PERFORM public.log_audit(
      'change',
      'patient_professional_claim',
      v_new_claim_id::TEXT,
      jsonb_build_object(
        'livvay_user_id', p_livvay_user_id,
        'old_clinic_profile_id', v_existing_claim.clinic_profile_id,
        'new_clinic_profile_id', p_clinic_profile_id,
        'professional_type', v_professional_type
      )
    );

    RETURN QUERY SELECT
      true,
      v_new_claim_id,
      format('%s alterado com sucesso',
        CASE v_professional_type
          WHEN 'doctor' THEN 'Medico'
          WHEN 'nutritionist' THEN 'Nutricionista'
          WHEN 'therapist' THEN 'Terapeuta'
        END
      )::TEXT,
      (now() + INTERVAL '30 days')::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- 3. Create new claim
  INSERT INTO public.patient_professional_claims (
    livvay_user_id,
    clinic_profile_id,
    professional_type,
    claimed_at
  ) VALUES (
    p_livvay_user_id,
    p_clinic_profile_id,
    v_professional_type,
    now()
  )
  RETURNING id INTO v_new_claim_id;

  -- Log the claim
  PERFORM public.log_audit(
    'create',
    'patient_professional_claim',
    v_new_claim_id::TEXT,
    jsonb_build_object(
      'livvay_user_id', p_livvay_user_id,
      'clinic_profile_id', p_clinic_profile_id,
      'professional_type', v_professional_type
    )
  );

  RETURN QUERY SELECT
    true,
    v_new_claim_id,
    format('%s adicionado a sua equipe',
      CASE v_professional_type
        WHEN 'doctor' THEN 'Medico'
        WHEN 'nutritionist' THEN 'Nutricionista'
        WHEN 'therapist' THEN 'Terapeuta'
      END
    )::TEXT,
    (now() + INTERVAL '30 days')::TIMESTAMPTZ;
END;
$$;

-- ============================================
-- 2. check_monthly_limit
-- ============================================
-- Checks if patient can book appointment this calendar month
-- Rule: 1 appointment per professional type per calendar month
-- Cancelled appointments don't count

CREATE OR REPLACE FUNCTION public.check_monthly_limit(
  p_livvay_user_id UUID,
  p_professional_type public.clinic_professional_type,
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  can_book BOOLEAN,
  existing_appointment_id UUID,
  existing_appointment_date DATE,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_month_start DATE;
  v_month_end DATE;
  v_existing RECORD;
BEGIN
  -- Calculate calendar month boundaries
  v_month_start := date_trunc('month', p_target_date)::DATE;
  v_month_end := (date_trunc('month', p_target_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Check for existing non-cancelled appointment this month
  SELECT a.id, a.appointment_date
  INTO v_existing
  FROM public.appointments a
  WHERE a.livvay_user_id = p_livvay_user_id
    AND a.professional_type = p_professional_type
    AND a.appointment_date BETWEEN v_month_start AND v_month_end
    AND a.status NOT IN ('cancelled')
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT
      false,
      v_existing.id,
      v_existing.appointment_date,
      format('Voce ja tem uma consulta com %s marcada para %s este mes',
        CASE p_professional_type
          WHEN 'doctor' THEN 'medico'
          WHEN 'nutritionist' THEN 'nutricionista'
          WHEN 'therapist' THEN 'terapeuta'
        END,
        to_char(v_existing.appointment_date, 'DD/MM/YYYY')
      )::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true,
    NULL::UUID,
    NULL::DATE,
    'Disponivel para agendamento'::TEXT;
END;
$$;

-- ============================================
-- 3. get_available_slots
-- ============================================
-- Returns available slots for a professional on a date range
-- Considers: existing bookings, professional blocks, max 2 per slot

CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_clinic_profile_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  slot_date DATE,
  slot_start TIME,
  slot_end TIME,
  available_spots INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_end_date DATE;
  v_max_patients_per_slot INTEGER := 2;
BEGIN
  v_end_date := COALESCE(p_end_date, p_start_date);

  -- Validate professional exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.clinic_profiles
    WHERE id = p_clinic_profile_id AND is_active = true
  ) THEN
    RETURN;  -- Return empty if professional not active
  END IF;

  RETURN QUERY
  WITH
  -- Generate all dates in range
  date_range AS (
    SELECT generate_series(p_start_date, v_end_date, '1 day'::INTERVAL)::DATE AS d
  ),
  -- Generate all 30-min slots from 07:00 to 18:30
  time_slots AS (
    SELECT
      t::TIME AS slot_s,
      (t + INTERVAL '30 minutes')::TIME AS slot_e
    FROM generate_series(
      '07:00'::TIME,
      '18:30'::TIME,
      '30 minutes'::INTERVAL
    ) t
  ),
  -- All possible combinations
  all_slots AS (
    SELECT
      dr.d AS slot_date,
      ts.slot_s AS slot_start,
      ts.slot_e AS slot_end
    FROM date_range dr
    CROSS JOIN time_slots ts
  ),
  -- Get blocked slots (full day or specific times)
  blocked_slots AS (
    SELECT
      pb.block_date,
      pb.start_time,
      pb.end_time
    FROM public.professional_blocks pb
    WHERE pb.clinic_profile_id = p_clinic_profile_id
      AND pb.block_date BETWEEN p_start_date AND v_end_date
  ),
  -- Count existing bookings per slot
  booking_counts AS (
    SELECT
      a.appointment_date,
      a.slot_start,
      COUNT(*) AS booked_count
    FROM public.appointments a
    WHERE a.clinic_profile_id = p_clinic_profile_id
      AND a.appointment_date BETWEEN p_start_date AND v_end_date
      AND a.status = 'scheduled'
    GROUP BY a.appointment_date, a.slot_start
  )
  SELECT
    als.slot_date,
    als.slot_start,
    als.slot_end,
    (v_max_patients_per_slot - COALESCE(bc.booked_count, 0))::INTEGER AS available_spots
  FROM all_slots als
  LEFT JOIN booking_counts bc
    ON bc.appointment_date = als.slot_date
    AND bc.slot_start = als.slot_start
  WHERE
    -- Exclude past dates
    als.slot_date >= CURRENT_DATE
    -- Exclude blocked full days
    AND NOT EXISTS (
      SELECT 1 FROM blocked_slots bs
      WHERE bs.block_date = als.slot_date
        AND bs.start_time IS NULL  -- Full day block
    )
    -- Exclude blocked time ranges
    AND NOT EXISTS (
      SELECT 1 FROM blocked_slots bs
      WHERE bs.block_date = als.slot_date
        AND bs.start_time IS NOT NULL
        AND als.slot_start >= bs.start_time
        AND als.slot_start < bs.end_time
    )
    -- Only slots with availability
    AND (v_max_patients_per_slot - COALESCE(bc.booked_count, 0)) > 0
  ORDER BY als.slot_date, als.slot_start;
END;
$$;

-- ============================================
-- 4. get_next_availability
-- ============================================
-- Finds the next available slot for a professional

CREATE OR REPLACE FUNCTION public.get_next_availability(
  p_clinic_profile_id UUID,
  p_from_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  slot_date DATE,
  slot_start TIME,
  slot_end TIME,
  available_spots INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Search up to 60 days ahead
  RETURN QUERY
  SELECT
    gas.slot_date,
    gas.slot_start,
    gas.slot_end,
    gas.available_spots
  FROM public.get_available_slots(
    p_clinic_profile_id,
    p_from_date,
    p_from_date + INTERVAL '60 days'
  ) gas
  LIMIT 1;
END;
$$;

-- ============================================
-- 5. book_appointment
-- ============================================
-- Atomically books an appointment with all validations
-- Race-condition safe using advisory locks

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_livvay_user_id UUID,
  p_clinic_profile_id UUID,
  p_appointment_date DATE,
  p_slot_start TIME,
  p_video_link TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  appointment_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_professional_type public.clinic_professional_type;
  v_is_active BOOLEAN;
  v_slot_end TIME;
  v_current_bookings INTEGER;
  v_max_patients INTEGER := 2;
  v_monthly_check RECORD;
  v_has_claim BOOLEAN;
  v_new_appointment_id UUID;
BEGIN
  v_slot_end := p_slot_start + INTERVAL '30 minutes';

  -- 1. Validate slot time format
  IF p_slot_start < '07:00'::TIME OR p_slot_start > '18:30'::TIME THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Horario fora do intervalo permitido (07:00-18:30)'::TEXT;
    RETURN;
  END IF;

  IF EXTRACT(MINUTE FROM p_slot_start) NOT IN (0, 30) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Horario deve ser em intervalos de 30 minutos'::TEXT;
    RETURN;
  END IF;

  -- 2. Validate date (not in the past)
  IF p_appointment_date < CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Nao e possivel agendar em datas passadas'::TEXT;
    RETURN;
  END IF;

  -- 3. Validate professional exists and is active
  SELECT cp.professional_type, cp.is_active
  INTO v_professional_type, v_is_active
  FROM public.clinic_profiles cp
  WHERE cp.id = p_clinic_profile_id;

  IF v_professional_type IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Profissional nao encontrado'::TEXT;
    RETURN;
  END IF;

  IF NOT v_is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Profissional nao esta disponivel'::TEXT;
    RETURN;
  END IF;

  -- 4. Validate patient has claimed this professional
  SELECT EXISTS (
    SELECT 1 FROM public.patient_professional_claims
    WHERE livvay_user_id = p_livvay_user_id
      AND clinic_profile_id = p_clinic_profile_id
  ) INTO v_has_claim;

  IF NOT v_has_claim THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Voce precisa adicionar este profissional a sua equipe antes de agendar'::TEXT;
    RETURN;
  END IF;

  -- 5. Check monthly limit
  SELECT * INTO v_monthly_check
  FROM public.check_monthly_limit(p_livvay_user_id, v_professional_type, p_appointment_date);

  IF NOT v_monthly_check.can_book THEN
    RETURN QUERY SELECT false, NULL::UUID, v_monthly_check.message;
    RETURN;
  END IF;

  -- 6. Check for professional blocks
  IF EXISTS (
    SELECT 1 FROM public.professional_blocks pb
    WHERE pb.clinic_profile_id = p_clinic_profile_id
      AND pb.block_date = p_appointment_date
      AND (
        pb.start_time IS NULL  -- Full day block
        OR (p_slot_start >= pb.start_time AND p_slot_start < pb.end_time)
      )
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Este horario nao esta disponivel'::TEXT;
    RETURN;
  END IF;

  -- 7. Lock and check slot availability (race-condition protection)
  -- Use advisory lock on composite key to prevent concurrent bookings
  PERFORM pg_advisory_xact_lock(
    hashtext(p_clinic_profile_id::TEXT || p_appointment_date::TEXT || p_slot_start::TEXT)
  );

  SELECT COUNT(*) INTO v_current_bookings
  FROM public.appointments
  WHERE clinic_profile_id = p_clinic_profile_id
    AND appointment_date = p_appointment_date
    AND slot_start = p_slot_start
    AND status = 'scheduled';

  IF v_current_bookings >= v_max_patients THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Este horario ja esta lotado'::TEXT;
    RETURN;
  END IF;

  -- 8. Create the appointment
  INSERT INTO public.appointments (
    livvay_user_id,
    clinic_profile_id,
    professional_type,
    appointment_date,
    slot_start,
    slot_end,
    video_link,
    status
  ) VALUES (
    p_livvay_user_id,
    p_clinic_profile_id,
    v_professional_type,
    p_appointment_date,
    p_slot_start,
    v_slot_end,
    p_video_link,
    'scheduled'
  )
  RETURNING id INTO v_new_appointment_id;

  -- 9. Log the booking
  PERFORM public.log_audit(
    'create',
    'appointment',
    v_new_appointment_id::TEXT,
    jsonb_build_object(
      'livvay_user_id', p_livvay_user_id,
      'clinic_profile_id', p_clinic_profile_id,
      'professional_type', v_professional_type,
      'appointment_date', p_appointment_date,
      'slot_start', p_slot_start
    )
  );

  RETURN QUERY SELECT
    true,
    v_new_appointment_id,
    'Consulta agendada com sucesso'::TEXT;
END;
$$;

-- ============================================
-- 6. cancel_appointment
-- ============================================
-- Cancels an appointment and frees the slot

CREATE OR REPLACE FUNCTION public.cancel_appointment(
  p_appointment_id UUID,
  p_cancelled_by public.cancellation_initiator,
  p_reason TEXT DEFAULT NULL,
  p_livvay_user_id UUID DEFAULT NULL,
  p_clinic_profile_id UUID DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
BEGIN
  -- Get appointment with lock
  SELECT * INTO v_appointment
  FROM public.appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF v_appointment IS NULL THEN
    RETURN QUERY SELECT false, 'Agendamento nao encontrado'::TEXT;
    RETURN;
  END IF;

  -- Verify ownership based on who is cancelling
  IF p_cancelled_by = 'patient' THEN
    IF p_livvay_user_id IS NULL OR v_appointment.livvay_user_id != p_livvay_user_id THEN
      RETURN QUERY SELECT false, 'Voce nao tem permissao para cancelar este agendamento'::TEXT;
      RETURN;
    END IF;
  ELSIF p_cancelled_by = 'professional' THEN
    IF p_clinic_profile_id IS NULL OR v_appointment.clinic_profile_id != p_clinic_profile_id THEN
      RETURN QUERY SELECT false, 'Voce nao tem permissao para cancelar este agendamento'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Check if already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'Agendamento ja foi cancelado'::TEXT;
    RETURN;
  END IF;

  -- Check if appointment is in the past
  IF v_appointment.appointment_date < CURRENT_DATE THEN
    RETURN QUERY SELECT false, 'Nao e possivel cancelar agendamentos passados'::TEXT;
    RETURN;
  END IF;

  -- Cancel the appointment
  UPDATE public.appointments
  SET
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = p_cancelled_by,
    cancellation_reason = p_reason,
    updated_at = now()
  WHERE id = p_appointment_id;

  -- Log the cancellation
  PERFORM public.log_audit(
    'cancel',
    'appointment',
    p_appointment_id::TEXT,
    jsonb_build_object(
      'cancelled_by', p_cancelled_by,
      'reason', p_reason,
      'appointment_date', v_appointment.appointment_date,
      'slot_start', v_appointment.slot_start
    )
  );

  RETURN QUERY SELECT true, 'Agendamento cancelado com sucesso'::TEXT;
END;
$$;

-- ============================================
-- 7. get_patient_team
-- ============================================
-- Returns the patient's claimed professionals

CREATE OR REPLACE FUNCTION public.get_patient_team(p_livvay_user_id UUID)
RETURNS TABLE(
  claim_id UUID,
  professional_type public.clinic_professional_type,
  clinic_profile_id UUID,
  full_name TEXT,
  specialty TEXT,
  license_number TEXT,
  claimed_at TIMESTAMPTZ,
  can_change_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ppc.id AS claim_id,
    ppc.professional_type,
    ppc.clinic_profile_id,
    cp.full_name::TEXT,
    cp.specialty::TEXT,
    cp.license_number::TEXT,
    ppc.claimed_at,
    (ppc.claimed_at + INTERVAL '30 days')::TIMESTAMPTZ AS can_change_at
  FROM public.patient_professional_claims ppc
  JOIN public.clinic_profiles cp ON cp.id = ppc.clinic_profile_id
  WHERE ppc.livvay_user_id = p_livvay_user_id
  ORDER BY ppc.professional_type;
END;
$$;

-- ============================================
-- 8. get_professional_schedule
-- ============================================
-- Returns professional's appointments for a date range

CREATE OR REPLACE FUNCTION public.get_professional_schedule(
  p_clinic_profile_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  appointment_id UUID,
  livvay_user_id UUID,
  appointment_date DATE,
  slot_start TIME,
  slot_end TIME,
  status public.appointment_status,
  video_link TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.livvay_user_id,
    a.appointment_date,
    a.slot_start,
    a.slot_end,
    a.status,
    a.video_link,
    a.created_at
  FROM public.appointments a
  WHERE a.clinic_profile_id = p_clinic_profile_id
    AND a.appointment_date >= p_start_date
    AND a.appointment_date <= COALESCE(p_end_date, p_start_date + INTERVAL '30 days')
  ORDER BY a.appointment_date, a.slot_start;
END;
$$;

-- ============================================
-- 9. get_patient_appointments
-- ============================================
-- Returns patient's appointments with professional details

CREATE OR REPLACE FUNCTION public.get_patient_appointments(
  p_livvay_user_id UUID,
  p_status public.appointment_status DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE(
  appointment_id UUID,
  clinic_profile_id UUID,
  professional_name TEXT,
  professional_type public.clinic_professional_type,
  specialty TEXT,
  appointment_date DATE,
  slot_start TIME,
  slot_end TIME,
  status public.appointment_status,
  video_link TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.clinic_profile_id,
    cp.full_name::TEXT AS professional_name,
    a.professional_type,
    cp.specialty::TEXT,
    a.appointment_date,
    a.slot_start,
    a.slot_end,
    a.status,
    a.video_link,
    a.created_at
  FROM public.appointments a
  JOIN public.clinic_profiles cp ON cp.id = a.clinic_profile_id
  WHERE a.livvay_user_id = p_livvay_user_id
    AND (p_status IS NULL OR a.status = p_status)
    AND (p_from_date IS NULL OR a.appointment_date >= p_from_date)
    AND (p_to_date IS NULL OR a.appointment_date <= p_to_date)
  ORDER BY a.appointment_date DESC, a.slot_start DESC;
END;
$$;
