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

    // Fetch codes with claim count
    const { data: codes, error } = await supabase
      .from('referral_codes')
      .select(
        `
        id,
        code,
        description,
        is_active,
        created_at,
        updated_at,
        referral_code_claims (count)
      `
      )
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Codes] Error fetching codes:', error);
      return NextResponse.json({ error: 'Erro ao buscar códigos' }, { status: 500 });
    }

    // Transform the response to include claim_count
    const transformedCodes = codes?.map((code) => ({
      ...code,
      claim_count: code.referral_code_claims?.[0]?.count || 0,
      referral_code_claims: undefined,
    }));

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
