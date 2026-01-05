import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate a random alphanumeric string
 */
function generateRandomSuffix(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const createCodeSchema = z.object({
  prefix: z
    .string()
    .min(3, { message: 'Prefixo deve ter no mínimo 3 caracteres' })
    .max(10, { message: 'Prefixo deve ter no máximo 10 caracteres' })
    .regex(/^[A-Za-z0-9]+$/, { message: 'Prefixo deve conter apenas letras e números' })
    .transform((val) => val.toUpperCase()),
  description: z.string().max(200).optional(),
});

/**
 * GET /api/affiliates/codes
 * Lists all referral codes for the authenticated affiliate
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Fetch codes with basic info
    const { data: codes, error: codesError } = await supabase
      .from('referral_codes')
      .select('id, code, description, is_active, created_at, updated_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });

    if (codesError) {
      console.error('[Codes] Error fetching codes:', codesError);
      return NextResponse.json({ error: 'Erro ao buscar códigos' }, { status: 500 });
    }

    // Fetch stats from the view (includes visits, claims, and conversions)
    const { data: stats, error: statsError } = await supabase
      .from('referral_code_stats')
      .select(
        `
        code_id,
        total_visits,
        unique_visitors,
        total_claims,
        total_conversions,
        new_plus,
        new_max,
        total_upgrades,
        active_subscribers,
        total_cancels,
        last_visit,
        last_claim,
        last_conversion
      `
      )
      .eq('affiliate_id', user.id);

    if (statsError) {
      console.error('[Codes] Error fetching stats:', statsError);
      // Continue without stats if view fails (graceful degradation)
    }

    // Create a map of stats by code_id for efficient lookup
    const statsMap = new Map(
      stats?.map((stat) => [stat.code_id, stat]) || []
    );

    // Transform the response to include all metrics
    const transformedCodes = codes?.map((code) => {
      const codeStats = statsMap.get(code.id);
      return {
        ...code,
        // Visit metrics
        visit_count: codeStats?.total_visits || 0,
        unique_visitors: codeStats?.unique_visitors || 0,
        // Claim metrics (installs)
        claim_count: codeStats?.total_claims || 0,
        // Conversion metrics (subscriptions)
        conversion_count: codeStats?.total_conversions || 0,
        plus_count: codeStats?.new_plus || 0,
        max_count: codeStats?.new_max || 0,
        upgrade_count: codeStats?.total_upgrades || 0,
        active_subscribers: codeStats?.active_subscribers || 0,
        cancel_count: codeStats?.total_cancels || 0,
        // Timestamps
        last_visit: codeStats?.last_visit || null,
        last_claim: codeStats?.last_claim || null,
        last_conversion: codeStats?.last_conversion || null,
      };
    });

    return NextResponse.json({ codes: transformedCodes });
  } catch (error) {
    console.error('[Codes] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST /api/affiliates/codes
 * Creates a new referral code for the authenticated affiliate
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const result = createCodeSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { prefix, description } = result.data;

    // Generate the full code: PREFIX-XXXXX (5 random chars)
    const suffix = generateRandomSuffix(5);
    const fullCode = `${prefix}-${suffix}`;

    // Check if code already exists
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', fullCode)
      .single();

    if (existing) {
      // Very unlikely, but handle collision
      return NextResponse.json(
        { error: 'Código já existe. Tente novamente.' },
        { status: 409 }
      );
    }

    // Insert the new code
    const { data: newCode, error } = await supabase
      .from('referral_codes')
      .insert({
        code: fullCode,
        affiliate_id: user.id,
        description: description || null,
      })
      .select('id, code, description, is_active, created_at')
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Código já existe. Tente novamente.' },
          { status: 409 }
        );
      }
      console.error('[Codes] Error creating code:', error);
      return NextResponse.json({ error: 'Erro ao criar código' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Código criado com sucesso', code: newCode },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Codes] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/affiliates/codes
 * Deletes a referral code for the authenticated affiliate
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get('id');

    if (!codeId) {
      return NextResponse.json({ error: 'ID do código é obrigatório' }, { status: 400 });
    }

    // Delete the code (RLS ensures only owner can delete)
    const { error } = await supabase
      .from('referral_codes')
      .delete()
      .eq('id', codeId)
      .eq('affiliate_id', user.id);

    if (error) {
      console.error('[Codes] Error deleting code:', error);
      return NextResponse.json({ error: 'Erro ao excluir código' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Código excluído com sucesso' });
  } catch (error) {
    console.error('[Codes] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
