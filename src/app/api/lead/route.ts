import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, answers } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validate source
    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Source é obrigatório' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('email', normalizedEmail)
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
        email: normalizedEmail,
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

    console.log(`[Lead] New lead captured: ${normalizedEmail} from ${source}`);

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
