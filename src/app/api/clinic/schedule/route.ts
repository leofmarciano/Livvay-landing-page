import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const querySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date deve ser YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date deve ser YYYY-MM-DD').optional(),
});

interface ScheduleEntry {
  appointment_id: string;
  livvay_user_id: string;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  video_link: string | null;
  created_at: string;
}

/**
 * GET /api/clinic/schedule
 * Returns the logged-in professional's schedule for a date range.
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
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date') || undefined,
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

    // 4. Call RPC function (same as internal API)
    const { data, error } = await supabaseAdmin.rpc('get_professional_schedule', {
      p_clinic_profile_id: profile.id,
      p_start_date: queryResult.data.start_date,
      p_end_date: queryResult.data.end_date || null,
    });

    if (error) {
      console.error('[Clinic Schedule] Database error:', error);
      return NextResponse.json({ error: 'Erro ao buscar agenda' }, { status: 500 });
    }

    const schedule: ScheduleEntry[] = (data || []).map((entry: Record<string, unknown>) => ({
      appointment_id: entry.appointment_id,
      livvay_user_id: entry.livvay_user_id,
      appointment_date: entry.appointment_date,
      slot_start: entry.slot_start,
      slot_end: entry.slot_end,
      status: entry.status,
      video_link: entry.video_link,
      created_at: entry.created_at,
    }));

    return NextResponse.json({
      schedule,
      professional: {
        id: profile.id,
        full_name: profile.full_name,
        professional_type: profile.professional_type,
      },
    });
  } catch (error) {
    console.error('[Clinic Schedule] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
