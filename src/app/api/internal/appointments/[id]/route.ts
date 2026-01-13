import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 50, windowInSeconds: 60 };

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'id deve ser um UUID valido' }),
});

const bodySchema = z.object({
  cancelled_by: z.enum(['patient', 'professional', 'system'], {
    error: 'cancelled_by deve ser patient, professional ou system',
  }),
  reason: z.string().max(500, 'reason deve ter no maximo 500 caracteres').optional(),
  livvay_user_id: z.string().uuid({ message: 'livvay_user_id deve ser um UUID valido' }).optional(),
  clinic_profile_id: z
    .string()
    .uuid({ message: 'clinic_profile_id deve ser um UUID valido' })
    .optional(),
});

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (!expectedKey) {
    console.error('[Internal API] INTERNAL_API_KEY not configured');
    return false;
  }
  return apiKey === expectedKey;
}

/**
 * DELETE /api/internal/appointments/[id]
 *
 * Cancels an appointment.
 * - Patient can only cancel their own appointments
 * - Professional can only cancel their own appointments
 * - System can cancel any appointment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. API Key Authentication
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`internal:cancel:${ip}`, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    // 3. Validate path params
    const { id } = await params;
    const paramsResult = paramsSchema.safeParse({ id });

    if (!paramsResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid path parameters',
          code: 'VALIDATION_ERROR',
          details: paramsResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Validate body
    const body = await request.json();
    const bodyResult = bodySchema.safeParse(body);

    if (!bodyResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          code: 'VALIDATION_ERROR',
          details: bodyResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { cancelled_by, reason, livvay_user_id, clinic_profile_id } = bodyResult.data;

    // 5. Validate required fields based on cancelled_by
    if (cancelled_by === 'patient' && !livvay_user_id) {
      return NextResponse.json(
        {
          error: 'livvay_user_id e obrigatorio quando cancelled_by = patient',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (cancelled_by === 'professional' && !clinic_profile_id) {
      return NextResponse.json(
        {
          error: 'clinic_profile_id e obrigatorio quando cancelled_by = professional',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // 6. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('cancel_appointment', {
      p_appointment_id: paramsResult.data.id,
      p_cancelled_by: cancelled_by,
      p_reason: reason || null,
      p_livvay_user_id: livvay_user_id || null,
      p_clinic_profile_id: clinic_profile_id || null,
    });

    if (error) {
      console.error('[Cancel] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const result = data?.[0];

    if (!result) {
      return NextResponse.json(
        { error: 'Unexpected error', code: 'UNEXPECTED_ERROR' },
        { status: 500 }
      );
    }

    // 7. Return response
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('[Cancel] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
