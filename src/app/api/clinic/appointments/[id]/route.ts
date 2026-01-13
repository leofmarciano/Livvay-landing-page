import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'ID deve ser um UUID válido' }),
});

const bodySchema = z.object({
  reason: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
});

/**
 * DELETE /api/clinic/appointments/[id]
 * Cancels an appointment as the professional.
 * Uses JWT authentication (for frontend dashboard).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Validate path params
    const { id } = await params;
    const paramsResult = paramsSchema.safeParse({ id });

    if (!paramsResult.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: paramsResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Validate body
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK for cancel
    }

    const bodyResult = bodySchema.safeParse(body);

    if (!bodyResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: bodyResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 5. Call RPC function (same as internal API)
    const { data, error } = await supabaseAdmin.rpc('cancel_appointment', {
      p_appointment_id: paramsResult.data.id,
      p_cancelled_by: 'professional',
      p_reason: bodyResult.data.reason || null,
      p_livvay_user_id: null,
      p_clinic_profile_id: profile.id,
    });

    if (error) {
      console.error('[Clinic Cancel] Database error:', error);
      return NextResponse.json({ error: 'Erro ao cancelar agendamento' }, { status: 500 });
    }

    const result = data?.[0];

    if (!result) {
      return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 });
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[Clinic Cancel] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * GET /api/clinic/appointments/[id]
 * Returns details of a specific appointment.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Validate path params
    const { id } = await params;
    const paramsResult = paramsSchema.safeParse({ id });

    if (!paramsResult.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: paramsResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Fetch appointment
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', paramsResult.data.id)
      .eq('clinic_profile_id', profile.id)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('[Clinic Appointment Detail] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
