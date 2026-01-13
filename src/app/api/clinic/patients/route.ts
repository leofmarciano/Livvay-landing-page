import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { PatientClaim } from '@/lib/clinic/types';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

/**
 * GET /api/clinic/patients
 * Returns the logged-in professional's patients (via claims).
 * Uses JWT authentication (for frontend dashboard).
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user via JWT
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Get clinic profile
    const profile = await getCurrentClinicProfile();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de clínica não encontrado' }, { status: 404 });
    }

    // 3. Validate query params
    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      search: searchParams.get('search') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: queryResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, limit, search } = queryResult.data;

    // 4. Build and execute query with aggregated appointment stats
    // Using raw SQL for the complex aggregation
    const offset = (page - 1) * limit;

    let countQuery = supabaseAdmin
      .from('patient_professional_claims')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_profile_id', profile.id);

    if (search) {
      countQuery = countQuery.ilike('livvay_user_id', `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('[Clinic Patients] Count error:', countError);
      return NextResponse.json({ error: 'Erro ao contar pacientes' }, { status: 500 });
    }

    // For the main query, we need to use SQL to get appointment aggregates
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        SELECT
          ppc.id AS claim_id,
          ppc.livvay_user_id,
          ppc.professional_type,
          ppc.claimed_at,
          (ppc.claimed_at + INTERVAL '30 days')::TIMESTAMPTZ AS can_change_at,
          COALESCE(COUNT(a.id) FILTER (WHERE a.status = 'scheduled'), 0)::int AS scheduled_count,
          COALESCE(COUNT(a.id) FILTER (WHERE a.status = 'completed'), 0)::int AS completed_count,
          COALESCE(COUNT(a.id) FILTER (WHERE a.status = 'cancelled'), 0)::int AS cancelled_count,
          MAX(a.appointment_date)::text AS last_appointment_date
        FROM patient_professional_claims ppc
        LEFT JOIN appointments a ON a.livvay_user_id = ppc.livvay_user_id
          AND a.clinic_profile_id = ppc.clinic_profile_id
        WHERE ppc.clinic_profile_id = '${profile.id}'
        ${search ? `AND ppc.livvay_user_id::text ILIKE '%${search}%'` : ''}
        GROUP BY ppc.id, ppc.livvay_user_id, ppc.professional_type, ppc.claimed_at
        ORDER BY ppc.claimed_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    });

    // If exec_sql RPC doesn't exist, fall back to simpler query without aggregates
    if (error?.message?.includes('function') || error?.code === '42883') {
      // Fallback: Simple query without appointment aggregates
      let simpleQuery = supabaseAdmin
        .from('patient_professional_claims')
        .select('*')
        .eq('clinic_profile_id', profile.id)
        .order('claimed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        simpleQuery = simpleQuery.ilike('livvay_user_id', `%${search}%`);
      }

      const { data: simpleData, error: simpleError } = await simpleQuery;

      if (simpleError) {
        console.error('[Clinic Patients] Database error:', simpleError);
        return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 });
      }

      // For each patient, get appointment counts
      const patientsWithStats: PatientClaim[] = await Promise.all(
        (simpleData || []).map(async (claim: Record<string, unknown>) => {
          const livvayUserId = claim.livvay_user_id as string;

          // Get appointment counts for this patient
          const { data: appointments } = await supabaseAdmin
            .from('appointments')
            .select('status')
            .eq('clinic_profile_id', profile.id)
            .eq('livvay_user_id', livvayUserId);

          const scheduled = appointments?.filter(a => a.status === 'scheduled').length || 0;
          const completed = appointments?.filter(a => a.status === 'completed').length || 0;
          const cancelled = appointments?.filter(a => a.status === 'cancelled').length || 0;

          // Get last appointment date
          const { data: lastAppt } = await supabaseAdmin
            .from('appointments')
            .select('appointment_date')
            .eq('clinic_profile_id', profile.id)
            .eq('livvay_user_id', livvayUserId)
            .order('appointment_date', { ascending: false })
            .limit(1)
            .single();

          const claimedAt = new Date(claim.claimed_at as string);
          const canChangeAt = new Date(claimedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

          return {
            claim_id: claim.id as string,
            livvay_user_id: livvayUserId,
            professional_type: claim.professional_type as PatientClaim['professional_type'],
            claimed_at: claim.claimed_at as string,
            can_change_at: canChangeAt.toISOString(),
            scheduled_count: scheduled,
            completed_count: completed,
            cancelled_count: cancelled,
            last_appointment_date: lastAppt?.appointment_date || null,
          };
        })
      );

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        patients: patientsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        professional: {
          id: profile.id,
          full_name: profile.full_name,
          professional_type: profile.professional_type,
        },
      });
    }

    if (error) {
      console.error('[Clinic Patients] Database error:', error);
      return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 });
    }

    const patients: PatientClaim[] = (data || []).map((row: Record<string, unknown>) => ({
      claim_id: row.claim_id as string,
      livvay_user_id: row.livvay_user_id as string,
      professional_type: row.professional_type as PatientClaim['professional_type'],
      claimed_at: row.claimed_at as string,
      can_change_at: row.can_change_at as string,
      scheduled_count: row.scheduled_count as number,
      completed_count: row.completed_count as number,
      cancelled_count: row.cancelled_count as number,
      last_appointment_date: row.last_appointment_date as string | null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      professional: {
        id: profile.id,
        full_name: profile.full_name,
        professional_type: profile.professional_type,
      },
    });
  } catch (error) {
    console.error('[Clinic Patients] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
