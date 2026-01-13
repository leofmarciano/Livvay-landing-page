import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'ID deve ser um UUID válido' }),
});

/**
 * DELETE /api/clinic/blocks/[id]
 * Removes a time block.
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

    // 4. Verify the block belongs to this professional
    const { data: existingBlock, error: fetchError } = await supabaseAdmin
      .from('professional_blocks')
      .select('id, block_date, start_time, end_time')
      .eq('id', paramsResult.data.id)
      .eq('clinic_profile_id', profile.id)
      .single();

    if (fetchError || !existingBlock) {
      return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });
    }

    // 5. Delete the block
    const { error: deleteError } = await supabaseAdmin
      .from('professional_blocks')
      .delete()
      .eq('id', paramsResult.data.id)
      .eq('clinic_profile_id', profile.id);

    if (deleteError) {
      console.error('[Clinic Blocks] Delete error:', deleteError);
      return NextResponse.json({ error: 'Erro ao remover bloqueio' }, { status: 500 });
    }

    const message = existingBlock.start_time
      ? `Bloqueio removido: ${existingBlock.block_date} das ${existingBlock.start_time} às ${existingBlock.end_time}`
      : `Bloqueio de dia inteiro removido: ${existingBlock.block_date}`;

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('[Clinic Blocks] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * GET /api/clinic/blocks/[id]
 * Returns details of a specific block.
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

    // 4. Fetch block
    const { data: block, error } = await supabaseAdmin
      .from('professional_blocks')
      .select('*')
      .eq('id', paramsResult.data.id)
      .eq('clinic_profile_id', profile.id)
      .single();

    if (error || !block) {
      return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ block });
  } catch (error) {
    console.error('[Clinic Block Detail] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
