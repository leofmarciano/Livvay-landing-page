import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile } from '@/lib/rbac/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const querySchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from_date deve ser YYYY-MM-DD').optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to_date deve ser YYYY-MM-DD').optional(),
});

const createBlockSchema = z.object({
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'block_date deve ser YYYY-MM-DD'),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([03]0)$/, 'start_time deve ser HH:00 ou HH:30')
    .optional()
    .nullable(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([03]0)$/, 'end_time deve ser HH:00 ou HH:30')
    .optional()
    .nullable(),
  block_type: z.enum(['vacation', 'holiday', 'personal', 'other']).default('other'),
  reason: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
});

interface BlockEntry {
  id: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  block_type: 'vacation' | 'holiday' | 'personal' | 'other';
  reason: string | null;
  created_at: string;
}

/**
 * GET /api/clinic/blocks
 * Returns the logged-in professional's time blocks.
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
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
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

    // 4. Build query
    let query = supabaseAdmin
      .from('professional_blocks')
      .select('*')
      .eq('clinic_profile_id', profile.id)
      .order('block_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (queryResult.data.from_date) {
      query = query.gte('block_date', queryResult.data.from_date);
    }

    if (queryResult.data.to_date) {
      query = query.lte('block_date', queryResult.data.to_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Clinic Blocks] Database error:', error);
      return NextResponse.json({ error: 'Erro ao buscar bloqueios' }, { status: 500 });
    }

    const blocks: BlockEntry[] = (data || []).map((block: Record<string, unknown>) => ({
      id: block.id as string,
      block_date: block.block_date as string,
      start_time: block.start_time as string | null,
      end_time: block.end_time as string | null,
      block_type: block.block_type as BlockEntry['block_type'],
      reason: block.reason as string | null,
      created_at: block.created_at as string,
    }));

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error('[Clinic Blocks] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST /api/clinic/blocks
 * Creates a new time block for the logged-in professional.
 * Uses JWT authentication (for frontend dashboard).
 */
export async function POST(request: NextRequest) {
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

    // 3. Validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const bodyResult = createBlockSchema.safeParse(body);

    if (!bodyResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: bodyResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { block_date, start_time, end_time, block_type, reason } = bodyResult.data;

    // 4. Validate time range if partial block
    if ((start_time && !end_time) || (!start_time && end_time)) {
      return NextResponse.json(
        { error: 'start_time e end_time devem ser ambos preenchidos ou ambos vazios' },
        { status: 400 }
      );
    }

    if (start_time && end_time && start_time >= end_time) {
      return NextResponse.json(
        { error: 'start_time deve ser anterior a end_time' },
        { status: 400 }
      );
    }

    // 5. Check for overlapping blocks
    const overlapQuery = supabaseAdmin
      .from('professional_blocks')
      .select('id')
      .eq('clinic_profile_id', profile.id)
      .eq('block_date', block_date);

    // If creating a full-day block, check for any existing blocks on that day
    if (!start_time) {
      // Full day block - conflicts with any existing block on that day
      const { data: existingBlocks } = await overlapQuery;
      if (existingBlocks && existingBlocks.length > 0) {
        return NextResponse.json(
          { error: 'Já existe um bloqueio para esta data. Remova-o antes de criar um novo.' },
          { status: 409 }
        );
      }
    } else {
      // Partial block - check for full-day blocks or overlapping time ranges
      const { data: existingBlocks } = await overlapQuery;

      if (existingBlocks && existingBlocks.length > 0) {
        // Check if any existing block is a full-day block or overlaps
        const { data: conflictingBlocks } = await supabaseAdmin
          .from('professional_blocks')
          .select('*')
          .eq('clinic_profile_id', profile.id)
          .eq('block_date', block_date)
          .or(`start_time.is.null,and(start_time.lt.${end_time},end_time.gt.${start_time})`);

        if (conflictingBlocks && conflictingBlocks.length > 0) {
          return NextResponse.json(
            { error: 'Já existe um bloqueio que conflita com este horário.' },
            { status: 409 }
          );
        }
      }
    }

    // 6. Create the block
    const { data: newBlock, error } = await supabaseAdmin
      .from('professional_blocks')
      .insert({
        clinic_profile_id: profile.id,
        block_date,
        start_time: start_time || null,
        end_time: end_time || null,
        block_type,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Clinic Blocks] Database error:', error);
      return NextResponse.json({ error: 'Erro ao criar bloqueio' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        block_id: newBlock.id,
        message: start_time
          ? `Horário bloqueado: ${block_date} das ${start_time} às ${end_time}`
          : `Dia inteiro bloqueado: ${block_date}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Clinic Blocks] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
