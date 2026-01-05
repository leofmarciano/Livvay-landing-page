import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';

const validateSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Código é obrigatório' })
    .transform((val) => val.toUpperCase().trim()),
});

/**
 * POST /api/referral/validate
 * Public endpoint to validate if a referral code is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { code } = result.data;

    // Use the database function for validation
    const { data, error } = await supabaseAdmin.rpc('validate_referral_code', {
      p_code: code,
    });

    if (error) {
      console.error('[Validate] Error validating code:', error);
      return NextResponse.json({ error: 'Erro ao validar código' }, { status: 500 });
    }

    // If no rows returned, code is invalid
    if (!data || data.length === 0) {
      return NextResponse.json({
        valid: false,
        message: 'Código inválido ou inativo',
      });
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      code: data[0].code,
      message: 'Código válido',
    });
  } catch (error) {
    console.error('[Validate] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
