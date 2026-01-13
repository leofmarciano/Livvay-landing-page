import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const querySchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from_date deve ser YYYY-MM-DD').optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to_date deve ser YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

interface AppointmentEntry {
  id: string;
  livvay_user_id: string;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  video_link: string | null;
  created_at: string;
}

/**
 * GET /api/clinic/appointments
 * Returns the logged-in professional's appointments with filters.
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
      status: searchParams.get('status') || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
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

    const { status, from_date, to_date, page, limit } = queryResult.data;

    // 4. Build query
    let query = supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('clinic_profile_id', profile.id)
      .order('appointment_date', { ascending: false })
      .order('slot_start', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (from_date) {
      query = query.gte('appointment_date', from_date);
    }

    if (to_date) {
      query = query.lte('appointment_date', to_date);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Clinic Appointments] Database error:', error);
      return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const appointments: AppointmentEntry[] = (data || []).map((apt: Record<string, unknown>) => ({
      id: apt.id as string,
      livvay_user_id: apt.livvay_user_id as string,
      appointment_date: apt.appointment_date as string,
      slot_start: apt.slot_start as string,
      slot_end: apt.slot_end as string,
      status: apt.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
      video_link: apt.video_link as string | null,
      created_at: apt.created_at as string,
    }));

    return NextResponse.json({
      appointments,
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
    console.error('[Clinic Appointments] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
