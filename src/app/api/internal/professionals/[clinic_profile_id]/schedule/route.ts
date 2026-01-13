import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 100, windowInSeconds: 60 };

const paramsSchema = z.object({
  clinic_profile_id: z.string().uuid({ message: 'clinic_profile_id deve ser um UUID valido' }),
});

const querySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date deve ser YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date deve ser YYYY-MM-DD').optional(),
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

interface ScheduleEntry {
  appointment_id: string;
  livvay_user_id: string;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  video_link: string | null;
  created_at: string;
}

/**
 * GET /api/internal/professionals/[clinic_profile_id]/schedule
 *
 * Returns the professional's schedule for a date range.
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
    const rateLimitResult = rateLimit(`internal:schedule:${ip}`, RATE_LIMIT);

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
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date') || undefined,
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

    // 5. Get professional info
    const { data: professional, error: profError } = await supabaseAdmin
      .from('clinic_profiles')
      .select('id, full_name, professional_type')
      .eq('id', paramsResult.data.clinic_profile_id)
      .single();

    if (profError || !professional) {
      return NextResponse.json(
        { error: 'Profissional nao encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 6. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('get_professional_schedule', {
      p_clinic_profile_id: paramsResult.data.clinic_profile_id,
      p_start_date: queryResult.data.start_date,
      p_end_date: queryResult.data.end_date || null,
    });

    if (error) {
      console.error('[Schedule] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const schedule: ScheduleEntry[] = (data || []).map((entry: Record<string, unknown>) => ({
      appointment_id: entry.appointment_id,
      livvay_user_id: entry.livvay_user_id,
      appointment_date: entry.appointment_date,
      slot_start: entry.slot_start,
      slot_end: entry.slot_end,
      status: entry.status,
      video_link: entry.video_link,
      created_at: entry.created_at,
    }));

    return NextResponse.json(
      {
        schedule,
        professional: {
          id: professional.id,
          full_name: professional.full_name,
          professional_type: professional.professional_type,
        },
      },
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
    console.error('[Schedule] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
