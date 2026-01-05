import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/affiliates/subscribers
 * Returns list of subscribers with status and earnings
 * Query params:
 *   - status (string): 'active' | 'churned' | null (all)
 *   - page (number): Page number (1-based)
 *   - limit (number): Items per page (default 20)
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate status
    if (status && !['active', 'churned'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: active, churned' },
        { status: 400 }
      );
    }

    // Validate pagination
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validPage - 1) * validLimit;

    // Get subscribers from the database function
    const { data: subscribers, error } = await supabase.rpc(
      'get_affiliate_subscribers',
      {
        p_affiliate_id: user.id,
        p_status: status || null,
        p_limit: validLimit,
        p_offset: offset,
      }
    );

    if (error) {
      console.error('[Subscribers] Error fetching subscribers:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar assinantes' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('referral_conversions')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'new')
      .in(
        'code_id',
        (
          await supabase
            .from('referral_codes')
            .select('id')
            .eq('affiliate_id', user.id)
        ).data?.map((c) => c.id) || []
      );

    if (countError) {
      console.error('[Subscribers] Error getting count:', countError);
    }

    // Transform the data
    const transformedSubscribers =
      subscribers?.map((sub: {
        subscriber_id: string;
        email_masked: string;
        plan_type: string;
        status: string;
        subscribed_at: string;
        churned_at: string | null;
        total_commission_cents: number;
        code: string;
      }) => ({
        id: sub.subscriber_id,
        email_masked: sub.email_masked,
        plan: sub.plan_type,
        status: sub.status,
        subscribed_at: sub.subscribed_at,
        churned_at: sub.churned_at,
        total_commission_cents: sub.total_commission_cents || 0,
        code: sub.code,
      })) || [];

    return NextResponse.json({
      subscribers: transformedSubscribers,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / validLimit),
      },
    });
  } catch (error) {
    console.error('[Subscribers] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
