import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const claimSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Código é obrigatório' })
    .transform((val) => val.toUpperCase().trim()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/referral/claim
 * Authenticated endpoint to claim a referral code
 * This links the code to the user's account
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
    const result = claimSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { code, metadata } = result.data;

    // Use the database function for claiming
    const { data, error } = await supabase.rpc('claim_referral_code', {
      p_code: code,
      p_user_id: user.id,
      p_metadata: metadata || null,
    });

    if (error) {
      console.error('[Claim] Error claiming code:', error);
      return NextResponse.json({ error: 'Erro ao aplicar código' }, { status: 500 });
    }

    // Check the result
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Erro ao processar código' }, { status: 500 });
    }

    const claimResult = data[0];

    if (!claimResult.success) {
      return NextResponse.json(
        { error: claimResult.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: claimResult.message,
      claim_id: claimResult.claim_id,
    });
  } catch (error) {
    console.error('[Claim] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
