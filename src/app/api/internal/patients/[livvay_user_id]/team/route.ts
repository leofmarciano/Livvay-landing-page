import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 100, windowInSeconds: 60 };

const paramsSchema = z.object({
  livvay_user_id: z.string().uuid({ message: 'livvay_user_id deve ser um UUID valido' }),
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

interface TeamMember {
  claim_id: string;
  professional_type: 'doctor' | 'nutritionist' | 'therapist';
  clinic_profile_id: string;
  full_name: string | null;
  specialty: string | null;
  license_number: string | null;
  claimed_at: string;
  can_change_at: string;
}

/**
 * GET /api/internal/patients/[livvay_user_id]/team
 *
 * Returns the patient's clinical team (claimed professionals).
 */
export async function GET(
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
    const rateLimitResult = rateLimit(`internal:team:${ip}`, RATE_LIMIT);

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

    // 4. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('get_patient_team', {
      p_livvay_user_id: paramsResult.data.livvay_user_id,
    });

    if (error) {
      console.error('[Team] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 5. Return response
    const team: TeamMember[] = (data || []).map((member: Record<string, unknown>) => ({
      claim_id: member.claim_id,
      professional_type: member.professional_type,
      clinic_profile_id: member.clinic_profile_id,
      full_name: member.full_name,
      specialty: member.specialty,
      license_number: member.license_number,
      claimed_at: member.claimed_at,
      can_change_at: member.can_change_at,
    }));

    return NextResponse.json(
      { team },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          'Cache-Control': 'private, max-age=30',
        },
      }
    );
  } catch (error) {
    console.error('[Team] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
