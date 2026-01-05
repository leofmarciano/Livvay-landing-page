import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/affiliates/analytics
 * Returns time-series data for dashboard charts
 * Query params:
 *   - start (date): Start date
 *   - end (date): End date
 *   - group_by (string): 'day' | 'week' | 'month'
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
    const groupBy = searchParams.get('group_by') || 'day';

    // Validate group_by parameter
    if (!['day', 'week', 'month'].includes(groupBy)) {
      return NextResponse.json(
        { error: 'Parâmetro group_by inválido. Use: day, week, month' },
        { status: 400 }
      );
    }

    // Default to last 30 days if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get analytics data from the database function
    const { data, error } = await supabase.rpc('get_affiliate_analytics', {
      p_affiliate_id: user.id,
      p_start_date: start,
      p_end_date: end,
      p_group_by: groupBy,
    });

    if (error) {
      console.error('[Analytics] Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar analytics' },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const analytics =
      data?.map((row: {
        period_date: string;
        visits: number;
        installs: number;
        subscriptions: number;
        plus_count: number;
        max_count: number;
        churns: number;
        earnings_cents: number;
      }) => ({
        date: row.period_date,
        visits: row.visits || 0,
        installs: row.installs || 0,
        subscriptions: row.subscriptions || 0,
        plus: row.plus_count || 0,
        max: row.max_count || 0,
        churns: row.churns || 0,
        earnings_cents: row.earnings_cents || 0,
      })) || [];

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
