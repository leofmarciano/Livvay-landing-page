import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';

const leadSchema = z.object({
  email: z
    .string({ message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' })
    .transform((val) => val.toLowerCase().trim()),
  source: z
    .string({ message: 'Source é obrigatório' })
    .min(1, { message: 'Source é obrigatório' }),
  answers: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, source, answers } = result.data;

    // Check if email already exists
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (existingLead) {
      // Update answers if provided, otherwise just return existing
      if (answers) {
        await supabaseAdmin
          .from('leads')
          .update({ answers, source })
          .eq('id', existingLead.id);
      }

      return NextResponse.json(
        { message: 'Lead já cadastrado', id: existingLead.id },
        { status: 200 }
      );
    }

    // Insert new lead
    const { data: newLead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        email,
        source,
        answers: answers || null,
      })
      .select('id')
      .single();

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Lead já cadastrado' },
          { status: 200 }
        );
      }

      console.error('[Lead] Supabase error:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar lead' },
        { status: 500 }
      );
    }

    console.log(`[Lead] New lead captured: ${email} from ${source}`);

    return NextResponse.json(
      { message: 'Lead cadastrado com sucesso', id: newLead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Lead] Error processing lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
