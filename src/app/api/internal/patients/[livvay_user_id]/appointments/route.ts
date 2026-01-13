import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 100, windowInSeconds: 60 };

const paramsSchema = z.object({
  livvay_user_id: z.string().uuid({ message: 'livvay_user_id deve ser um UUID valido' }),
});

const querySchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from_date deve ser YYYY-MM-DD').optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to_date deve ser YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
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

interface AppointmentEntry {
  id: string;
  clinic_profile_id: string;
  professional_name: string | null;
  professional_type: 'doctor' | 'nutritionist' | 'therapist';
  specialty: string | null;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  video_link: string | null;
  created_at: string;
}

/**
 * GET /api/internal/patients/[livvay_user_id]/appointments
 *
 * Returns the patient's appointments with optional filters.
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
    const rateLimitResult = rateLimit(`internal:patient-appointments:${ip}`, RATE_LIMIT);

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

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse({
      status: searchParams.get('status') || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
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

    const { status, from_date, to_date, page, limit } = queryResult.data;

    // 5. Call RPC function
    const { data, error } = await supabaseAdmin.rpc('get_patient_appointments', {
      p_livvay_user_id: paramsResult.data.livvay_user_id,
      p_status: status || null,
      p_from_date: from_date || null,
      p_to_date: to_date || null,
    });

    if (error) {
      console.error('[Patient Appointments] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 6. Apply pagination (RPC returns all, we paginate in code)
    const allAppointments = data || [];
    const total = allAppointments.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = allAppointments.slice(offset, offset + limit);

    const appointments: AppointmentEntry[] = paginatedData.map((apt: Record<string, unknown>) => ({
      id: apt.appointment_id,
      clinic_profile_id: apt.clinic_profile_id,
      professional_name: apt.professional_name,
      professional_type: apt.professional_type,
      specialty: apt.specialty,
      appointment_date: apt.appointment_date,
      slot_start: apt.slot_start,
      slot_end: apt.slot_end,
      status: apt.status,
      video_link: apt.video_link,
      created_at: apt.created_at,
    }));

    return NextResponse.json(
      {
        appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
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
    console.error('[Patient Appointments] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
