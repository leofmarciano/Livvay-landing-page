import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { ClinicProfessionalType } from '@/lib/rbac/types';

// Rate limit: 100 requests per minute per IP (generous for internal API)
const RATE_LIMIT = { limit: 100, windowInSeconds: 60 };

// Query parameters validation schema
const querySchema = z.object({
  type: z.enum(['doctor', 'nutritionist', 'therapist']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Response type for a single professional
interface PublicProfessional {
  id: string;
  full_name: string;
  professional_type: ClinicProfessionalType;
  license_number: string;
  specialty: string | null;
  clinic_name: string | null;
  city: string;
  state: string;
}

// Paginated response type
interface ProfessionalsResponse {
  professionals: PublicProfessional[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Validate internal API key from request headers
 */
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
 * GET /api/internal/professionals
 *
 * Lists all active and complete clinic professionals.
 * Requires internal API key authentication.
 *
 * Query params:
 * - type: Filter by professional_type (doctor, nutritionist, therapist)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
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
    const rateLimitResult = rateLimit(`internal:${ip}`, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            ),
            'X-RateLimit-Limit': String(RATE_LIMIT.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse({
      type: searchParams.get('type') || undefined,
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

    const { type, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // 4. Build query for complete and active profiles
    let query = supabaseAdmin
      .from('clinic_profiles')
      .select(
        `
        id,
        full_name,
        professional_type,
        license_number,
        specialty,
        clinic_name,
        city,
        state
        `,
        { count: 'exact' }
      )
      // Active profiles only
      .eq('is_active', true)
      // Profile must be complete (all required fields filled)
      .not('license_number', 'is', null)
      .not('full_name', 'is', null)
      .not('phone', 'is', null)
      .not('birth_date', 'is', null)
      .not('cpf', 'is', null)
      .not('rg', 'is', null)
      .not('postal_code', 'is', null)
      .not('street', 'is', null)
      .not('number', 'is', null)
      .not('neighborhood', 'is', null)
      .not('city', 'is', null)
      .not('state', 'is', null);

    // Apply type filter if provided
    if (type) {
      query = query.eq('professional_type', type);
    }

    // Apply ordering and pagination
    query = query
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    // 5. Execute query
    const { data: professionals, count, error } = await query;

    if (error) {
      console.error('[Internal API] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 6. Build paginated response
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: ProfessionalsResponse = {
      professionals: (professionals || []) as PublicProfessional[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.resetAt),
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('[Internal API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
