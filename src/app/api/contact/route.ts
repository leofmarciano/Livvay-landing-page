import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 3 contact messages per 5 minutes per IP
const RATE_LIMIT = { limit: 3, windowInSeconds: 300 };

const contactSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(100, { message: 'Nome muito longo' }),
  email: z
    .email({ message: 'Email inválido' })
    .transform((val) => val.toLowerCase().trim()),
  message: z
    .string({ message: 'Mensagem é obrigatória' })
    .min(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' })
    .max(5000, { message: 'Mensagem muito longa' }),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`contact:${ip}`, RATE_LIMIT);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Muitas mensagens enviadas. Aguarde alguns minutos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(RATE_LIMIT.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;

    // Insert contact message
    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        name,
        email,
        message,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Contact] Supabase error:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar mensagem' },
        { status: 500 }
      );
    }

    console.log(`[Contact] New message from: ${email}`);

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso', id: contact.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Contact] Error processing contact:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
