-- Fix get_available_slots function to use timestamp instead of time for generate_series
-- generate_series doesn't support time type directly

CREATE OR REPLACE FUNCTION get_available_slots(
  p_clinic_profile_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  slot_date DATE,
  slot_start TIME,
  slot_end TIME,
  available_spots INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_end_date DATE := COALESCE(p_end_date, p_start_date);
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT d::date AS the_date
    FROM generate_series(p_start_date, v_end_date, '1 day'::interval) AS d
  ),
  time_slots AS (
    -- Use timestamp and extract time (generate_series doesn't support time type)
    SELECT (ts::time) AS slot_time
    FROM generate_series(
      '2000-01-01 07:00:00'::timestamp,
      '2000-01-01 18:30:00'::timestamp,
      '30 minutes'::interval
    ) AS ts
  ),
  all_slots AS (
    SELECT
      dr.the_date,
      ts.slot_time AS start_time,
      (ts.slot_time + '30 minutes'::interval)::time AS end_time
    FROM date_range dr
    CROSS JOIN time_slots ts
  ),
  blocked_slots AS (
    SELECT
      pb.block_date,
      pb.start_time AS block_start,
      pb.end_time AS block_end
    FROM professional_blocks pb
    WHERE pb.clinic_profile_id = p_clinic_profile_id
      AND pb.block_date BETWEEN p_start_date AND v_end_date
  ),
  booked_counts AS (
    SELECT
      a.appointment_date,
      a.slot_start AS booked_start,
      COUNT(*) AS booked_count
    FROM appointments a
    WHERE a.clinic_profile_id = p_clinic_profile_id
      AND a.appointment_date BETWEEN p_start_date AND v_end_date
      AND a.status = 'scheduled'
    GROUP BY a.appointment_date, a.slot_start
  )
  SELECT
    s.the_date AS slot_date,
    s.start_time AS slot_start,
    s.end_time AS slot_end,
    (2 - COALESCE(bc.booked_count, 0))::int AS available_spots
  FROM all_slots s
  LEFT JOIN booked_counts bc
    ON bc.appointment_date = s.the_date
    AND bc.booked_start = s.start_time
  WHERE
    -- Exclude past dates
    s.the_date >= CURRENT_DATE
    -- Exclude blocked full days (start_time IS NULL means full day block)
    AND NOT EXISTS (
      SELECT 1 FROM blocked_slots bs
      WHERE bs.block_date = s.the_date
        AND bs.block_start IS NULL
    )
    -- Exclude blocked time ranges
    AND NOT EXISTS (
      SELECT 1 FROM blocked_slots bs
      WHERE bs.block_date = s.the_date
        AND bs.block_start IS NOT NULL
        AND s.start_time >= bs.block_start
        AND s.start_time < bs.block_end
    )
    -- Only return slots with availability
    AND (2 - COALESCE(bc.booked_count, 0)) > 0
  ORDER BY s.the_date, s.start_time;
END;
$$;

-- Also fix get_next_availability which uses the same pattern
CREATE OR REPLACE FUNCTION get_next_availability(
  p_clinic_profile_id UUID,
  p_from_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  slot_date DATE,
  slot_start TIME,
  slot_end TIME,
  available_spots INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gas.slot_date,
    gas.slot_start,
    gas.slot_end,
    gas.available_spots
  FROM get_available_slots(
    p_clinic_profile_id,
    p_from_date,
    (p_from_date + INTERVAL '60 days')::DATE  -- Cast back to DATE
  ) gas
  LIMIT 1;
END;
$$;
