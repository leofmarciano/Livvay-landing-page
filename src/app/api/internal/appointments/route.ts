import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 50, windowInSeconds: 60 };

const bodySchema = z.object({
  livvay_user_id: z.string().uuid({ message: 'livvay_user_id deve ser um UUID valido' }),
  clinic_profile_id: z.string().uuid({ message: 'clinic_profile_id deve ser um UUID valido' }),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'appointment_date deve ser YYYY-MM-DD'),
  slot_start: z.string().regex(/^([01]\d|2[0-3]):([03]0)$/, 'slot_start deve ser HH:00 ou HH:30'),
  video_link: z.string().url({ message: 'video_link deve ser uma URL valida' }).optional(),
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
 * POST /api/internal/appointments
 *
 * Books a new appointment.
 * Validations:
 * - Slot must be in valid time range (07:00-18:30)
 * - Date cannot be in the past
 * - Professional must be active
 * - Patient must have claimed the professional
 * - Monthly limit (1 per type per month)
 * - Slot must not be blocked
 * - Slot must have availability (max 2 patients)
 */
export async function POST(request: NextRequest) {
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
    const rateLimitResult = rateLimit(`internal:book:${ip}`, RATE_LIMIT);

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

    // 3. Validate body
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

    const { livvay_user_id, clinic_profile_id, appointment_date, slot_start, video_link } =
      bodyResult.data;

    // 4. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('book_appointment', {
      p_livvay_user_id: livvay_user_id,
      p_clinic_profile_id: clinic_profile_id,
      p_appointment_date: appointment_date,
      p_slot_start: slot_start,
      p_video_link: video_link || null,
    });

    if (error) {
      console.error('[Book] Database error:', error);
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

    // 5. Return response
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          appointment_id: null,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        appointment_id: result.appointment_id,
        message: result.message,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('[Book] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
