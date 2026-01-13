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

interface AvailableSlot {
  date: string;
  start: string;
  end: string;
  available_spots: number;
}

/**
 * GET /api/internal/professionals/[clinic_profile_id]/availability
 *
 * Returns available slots for a professional within a date range.
 * Considers:
 * - Working hours (07:00-18:30)
 * - Professional blocks (vacations, holidays, personal)
 * - Existing appointments (max 2 per slot)
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
    const rateLimitResult = rateLimit(`internal:availability:${ip}`, RATE_LIMIT);

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

    // 5. Get professional info to verify they exist and are active
    const { data: professional, error: profError } = await supabaseAdmin
      .from('clinic_profiles')
      .select('id, full_name, professional_type, is_active')
      .eq('id', paramsResult.data.clinic_profile_id)
      .single();

    if (profError || !professional) {
      return NextResponse.json(
        { error: 'Profissional nao encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!professional.is_active) {
      return NextResponse.json(
        { error: 'Profissional nao esta ativo', code: 'PROFESSIONAL_INACTIVE' },
        { status: 400 }
      );
    }

    // 6. Call RPC function to get available slots
    const { data, error } = await supabaseAdmin.rpc('get_available_slots', {
      p_clinic_profile_id: paramsResult.data.clinic_profile_id,
      p_start_date: queryResult.data.start_date,
      p_end_date: queryResult.data.end_date || queryResult.data.start_date,
    });

    if (error) {
      console.error('[Availability] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const slots: AvailableSlot[] = (data || []).map((slot: Record<string, unknown>) => ({
      date: slot.slot_date,
      start: slot.slot_start,
      end: slot.slot_end,
      available_spots: slot.available_spots,
    }));

    return NextResponse.json(
      {
        slots,
        professional: {
          id: professional.id,
          full_name: professional.full_name,
          professional_type: professional.professional_type,
        },
        query: {
          start_date: queryResult.data.start_date,
          end_date: queryResult.data.end_date || queryResult.data.start_date,
        },
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
    console.error('[Availability] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
