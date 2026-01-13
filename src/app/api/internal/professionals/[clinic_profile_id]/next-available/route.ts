import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 100, windowInSeconds: 60 };

const paramsSchema = z.object({
  clinic_profile_id: z.string().uuid({ message: 'clinic_profile_id deve ser um UUID valido' }),
});

const querySchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from_date deve ser YYYY-MM-DD').optional(),
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
 * GET /api/internal/professionals/[clinic_profile_id]/next-available
 *
 * Returns the next available slot for a professional.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinic_profile_id: string }> }
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
    const rateLimitResult = rateLimit(`internal:next-available:${ip}`, RATE_LIMIT);

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
    const { clinic_profile_id } = await params;
    const paramsResult = paramsSchema.safeParse({ clinic_profile_id });

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

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse({
      from_date: searchParams.get('from_date') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: queryResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 5. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('get_next_availability', {
      p_clinic_profile_id: paramsResult.data.clinic_profile_id,
      p_from_date: queryResult.data.from_date || new Date().toISOString().split('T')[0],
    });

    if (error) {
      console.error('[Next Available] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const slot = data?.[0] || null;

    return NextResponse.json(
      {
        slot: slot
          ? {
              date: slot.slot_date,
              start: slot.slot_start,
              end: slot.slot_end,
              available_spots: slot.available_spots,
            }
          : null,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('[Next Available] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
