import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { MINIMUM_WITHDRAWAL_CENTS } from '@/lib/constants/affiliate';

const withdrawalSchema = z.object({
  amount_cents: z
    .number()
    .int()
    .min(MINIMUM_WITHDRAWAL_CENTS, {
      message: `Valor mínimo para saque é $${(MINIMUM_WITHDRAWAL_CENTS / 100).toFixed(2)}`,
    }),
  payment_method: z.string().min(1, { message: 'Método de pagamento é obrigatório' }),
  payment_details: z.record(z.string(), z.unknown()).optional().default({}),
});

/**
 * GET /api/affiliates/withdrawals
 * Returns balance and withdrawal request history
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get affiliate balance
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      'get_affiliate_balance',
      { p_affiliate_id: user.id }
    );

    if (balanceError) {
      console.error('[Withdrawals] Error fetching balance:', balanceError);
      return NextResponse.json(
        { error: 'Erro ao buscar saldo' },
        { status: 500 }
      );
    }

    const balance = balanceData?.[0] || {
      pending_cents: 0,
      available_cents: 0,
      requested_cents: 0,
      paid_cents: 0,
    };

    // Get withdrawal requests history
    const { data: requests, error: requestsError } = await supabase
      .from('affiliate_withdrawal_requests')
      .select('id, amount_cents, currency, status, requested_at, processed_at, paid_at, rejected_reason')
      .eq('affiliate_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(50);

    if (requestsError) {
      console.error('[Withdrawals] Error fetching requests:', requestsError);
    }

    return NextResponse.json({
      balance: {
        pending_cents: balance.pending_cents || 0,
        available_cents: balance.available_cents || 0,
        requested_cents: balance.requested_cents || 0,
        paid_cents: balance.paid_cents || 0,
      },
      requests:
        requests?.map((req) => ({
          id: req.id,
          amount_cents: req.amount_cents,
          currency: req.currency,
          status: req.status,
          requested_at: req.requested_at,
          processed_at: req.processed_at,
          paid_at: req.paid_at,
          rejected_reason: req.rejected_reason,
        })) || [],
    });
  } catch (error) {
    console.error('[Withdrawals] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliates/withdrawals
 * Creates a new withdrawal request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const result = withdrawalSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { amount_cents, payment_method, payment_details } = result.data;

    // Call the database function to create withdrawal request
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_affiliate_id: user.id,
      p_amount_cents: amount_cents,
      p_payment_method: payment_method,
      p_payment_details: payment_details,
    });

    if (error) {
      console.error('[Withdrawals] Error creating request:', error);
      return NextResponse.json(
        { error: 'Erro ao criar solicitação de saque' },
        { status: 500 }
      );
    }

    const response = data?.[0];

    if (!response?.success) {
      return NextResponse.json(
        { error: response?.message || 'Erro ao criar solicitação' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: response.message,
        request_id: response.request_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Withdrawals] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
