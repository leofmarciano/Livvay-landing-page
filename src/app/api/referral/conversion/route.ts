import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';

const WEBHOOK_SECRET = process.env.LIVVAY_WEBHOOK_SECRET;

const conversionSchema = z.object({
  user_id: z.string().uuid({ message: 'user_id deve ser um UUID válido' }),
  event_type: z.enum(['new', 'upgrade', 'downgrade', 'renewal', 'cancel'], {
    message: 'event_type inválido',
  }),
  plan_type: z.enum(['plus', 'max'], {
    message: 'plan_type deve ser plus ou max',
  }),
  previous_plan: z
    .enum(['plus', 'max'])
    .optional()
    .nullable(),
  subscription_id: z.string().optional().nullable(),
  amount_cents: z.number().int().positive().optional().nullable(),
  billing_period: z
    .enum(['monthly', 'yearly'])
    .optional()
    .nullable(),
  source: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

/**
 * Verify the webhook secret from Authorization header
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('[Conversion] LIVVAY_WEBHOOK_SECRET not configured');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return false;
  }

  return token === WEBHOOK_SECRET;
}

/**
 * POST /api/referral/conversion
 * Webhook endpoint for Livvay app to report subscription conversions
 *
 * Headers:
 *   Authorization: Bearer <LIVVAY_WEBHOOK_SECRET>
 *
 * Body:
 *   {
 *     user_id: string (UUID),
 *     event_type: 'new' | 'upgrade' | 'downgrade' | 'renewal' | 'cancel',
 *     plan_type: 'plus' | 'max',
 *     previous_plan?: 'plus' | 'max',
 *     subscription_id?: string,
 *     amount_cents?: number,
 *     billing_period?: 'monthly' | 'yearly',
 *     source?: string,
 *     metadata?: object
 *   }
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = conversionSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const {
      user_id,
      event_type,
      plan_type,
      previous_plan,
      subscription_id,
      amount_cents,
      billing_period,
      source,
      metadata,
    } = result.data;

    // Call the database function to record the conversion
    const { data, error } = await supabaseAdmin.rpc('record_referral_conversion', {
      p_user_id: user_id,
      p_event_type: event_type,
      p_plan_type: plan_type,
      p_previous_plan: previous_plan || null,
      p_subscription_id: subscription_id || null,
      p_amount_cents: amount_cents || null,
      p_billing_period: billing_period || null,
      p_source: source || null,
      p_metadata: metadata,
    });

    if (error) {
      console.error('[Conversion] Database error:', error);
      return NextResponse.json(
        { error: 'Erro ao registrar conversão' },
        { status: 500 }
      );
    }

    // Check function result
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Erro ao processar conversão' },
        { status: 500 }
      );
    }

    const response = data[0];

    if (!response.success) {
      return NextResponse.json(
        { error: response.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      conversion_id: response.conversion_id,
      code: response.code,
      affiliate_id: response.affiliate_id,
    });
  } catch (error) {
    console.error('[Conversion] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
