import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const querySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date deve ser YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date deve ser YYYY-MM-DD').optional(),
});

interface AvailableSlot {
  date: string;
  start: string;
  end: string;
  available_spots: number;
}

/**
 * GET /api/clinic/schedule/availability
 * Returns available slots for the logged-in professional.
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

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Seu perfil não está ativo. Entre em contato com o suporte.' },
        { status: 403 }
      );
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
    const { data, error } = await supabaseAdmin.rpc('get_available_slots', {
      p_clinic_profile_id: profile.id,
      p_start_date: queryResult.data.start_date,
      p_end_date: queryResult.data.end_date || queryResult.data.start_date,
    });

    if (error) {
      console.error('[Clinic Availability] Database error:', error);
      return NextResponse.json({ error: 'Erro ao buscar disponibilidade' }, { status: 500 });
    }

    const slots: AvailableSlot[] = (data || []).map((slot: Record<string, unknown>) => ({
      date: slot.slot_date as string,
      // Strip seconds from time (PostgreSQL returns HH:MM:SS, frontend expects HH:MM)
      start: (slot.slot_start as string).slice(0, 5),
      end: (slot.slot_end as string).slice(0, 5),
      available_spots: slot.available_spots as number,
    }));

    return NextResponse.json({
      slots,
      professional: {
        id: profile.id,
        full_name: profile.full_name,
        professional_type: profile.professional_type,
      },
      query: {
        start_date: queryResult.data.start_date,
        end_date: queryResult.data.end_date || queryResult.data.start_date,
      },
    });
  } catch (error) {
    console.error('[Clinic Availability] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
