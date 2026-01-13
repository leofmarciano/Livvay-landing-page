import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 50, windowInSeconds: 60 };

const paramsSchema = z.object({
  livvay_user_id: z.string().uuid({ message: 'livvay_user_id deve ser um UUID valido' }),
});

const bodySchema = z.object({
  clinic_profile_id: z.string().uuid({ message: 'clinic_profile_id deve ser um UUID valido' }),
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
 * POST /api/internal/patients/[livvay_user_id]/claim
 *
 * Claims a professional for a Livvay patient.
 * Rules:
 * - 1 professional per type (doctor, nutritionist, therapist)
 * - Can only change after 30 days
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ livvay_user_id: string }> }
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
    const rateLimitResult = rateLimit(`internal:claim:${ip}`, RATE_LIMIT);

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
    const { livvay_user_id } = await params;
    const paramsResult = paramsSchema.safeParse({ livvay_user_id });

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
    let body: unknown;
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload', code: 'INVALID_JSON' },
        { status: 400 }
      );
    }

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

    // 5. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('claim_professional', {
      p_livvay_user_id: paramsResult.data.livvay_user_id,
      p_clinic_profile_id: bodyResult.data.clinic_profile_id,
    });

    if (error) {
      console.error('[Claim] Database error:', error);
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

    // 6. Return response
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          claim_id: null,
          message: result.message,
          can_change_at: result.can_change_at,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        claim_id: result.claim_id,
        message: result.message,
        can_change_at: result.can_change_at,
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
    console.error('[Claim] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
