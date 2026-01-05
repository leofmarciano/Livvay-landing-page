import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/affiliates/dashboard
 * Returns dashboard metrics, funnel data, and top performing codes
 * Query params: start (date), end (date)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Default to last 30 days if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get affiliate balance (pending, available, requested, paid)
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      'get_affiliate_balance',
      { p_affiliate_id: user.id }
    );

    if (balanceError) {
      console.error('[Dashboard] Error fetching balance:', balanceError);
    }

    const balance = balanceData?.[0] || {
      pending_cents: 0,
      available_cents: 0,
      requested_cents: 0,
      paid_cents: 0,
      total_earned_cents: 0,
    };

    // Get top performing codes
    const { data: topCodes, error: topCodesError } = await supabase.rpc(
      'get_top_codes',
      {
        p_affiliate_id: user.id,
        p_start_date: start,
        p_end_date: end,
        p_limit: 5,
      }
    );

    if (topCodesError) {
      console.error('[Dashboard] Error fetching top codes:', topCodesError);
    }

    // Get funnel metrics for the period
    const { data: funnelData, error: funnelError } = await supabase
      .from('referral_code_stats')
      .select(
        'total_visits, unique_visitors, total_claims, total_conversions, new_plus, new_max, active_subscribers, total_cancels'
      )
      .eq('affiliate_id', user.id);

    if (funnelError) {
      console.error('[Dashboard] Error fetching funnel:', funnelError);
    }

    // Aggregate funnel stats across all codes
    const funnel = funnelData?.reduce(
      (acc, code) => ({
        visits: acc.visits + (code.total_visits || 0),
        unique_visitors: acc.unique_visitors + (code.unique_visitors || 0),
        installs: acc.installs + (code.total_claims || 0),
        subscriptions: acc.subscriptions + (code.total_conversions || 0),
        plus: acc.plus + (code.new_plus || 0),
        max: acc.max + (code.new_max || 0),
        active: acc.active + (code.active_subscribers || 0),
        churns: acc.churns + (code.total_cancels || 0),
      }),
      {
        visits: 0,
        unique_visitors: 0,
        installs: 0,
        subscriptions: 0,
        plus: 0,
        max: 0,
        active: 0,
        churns: 0,
      }
    ) || {
      visits: 0,
      unique_visitors: 0,
      installs: 0,
      subscriptions: 0,
      plus: 0,
      max: 0,
      active: 0,
      churns: 0,
    };

    // Calculate conversion rate and churn rate
    const conversionRate =
      funnel.visits > 0
        ? ((funnel.subscriptions / funnel.visits) * 100).toFixed(1)
        : '0';

    const churnRate =
      funnel.subscriptions > 0
        ? ((funnel.churns / funnel.subscriptions) * 100).toFixed(1)
        : '0';

    return NextResponse.json({
      metrics: {
        total_earned_cents: balance.total_earned_cents || 0,
        pending_cents: balance.pending_cents || 0,
        available_cents: balance.available_cents || 0,
        requested_cents: balance.requested_cents || 0,
        paid_cents: balance.paid_cents || 0,
        active_subscribers: funnel.active,
        churned_subscribers: funnel.churns,
        churn_rate: parseFloat(churnRate),
      },
      funnel: {
        visits: funnel.visits,
        unique_visitors: funnel.unique_visitors,
        installs: funnel.installs,
        subscriptions: funnel.subscriptions,
        plus: funnel.plus,
        max: funnel.max,
        conversion_rate: parseFloat(conversionRate),
      },
      top_codes:
        topCodes?.map((code: { code: string; visits: number; installs: number; subscriptions: number; earnings_cents: number }) => ({
          code: code.code,
          visits: code.visits || 0,
          installs: code.installs || 0,
          subscriptions: code.subscriptions || 0,
          earnings_cents: code.earnings_cents || 0,
        })) || [],
    });
  } catch (error) {
    console.error('[Dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
