'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, Wallet, TrendingDown, Loader2 } from 'lucide-react';
import {
  MetricCard,
  MetricsGrid,
  TimeRangeFilter,
  EarningsChart,
  FunnelChart,
  SubscribersChart,
  TopCodesTable,
  getDateRangeFromPreset,
  getGroupByFromPreset,
} from '@/components/affiliates';
import { DashboardCard } from '@/components/ui/dashboard-card';
import {
  formatCurrency,
  DEFAULT_TIME_PRESET,
  type TimePresetKey,
} from '@/lib/constants/affiliate';

interface DashboardMetrics {
  total_earned_cents: number;
  pending_cents: number;
  available_cents: number;
  requested_cents: number;
  paid_cents: number;
  active_subscribers: number;
  churned_subscribers: number;
  churn_rate: number;
}

interface FunnelData {
  visits: number;
  unique_visitors: number;
  installs: number;
  subscriptions: number;
  plus: number;
  max: number;
  conversion_rate: number;
}

interface TopCode {
  code: string;
  visits: number;
  installs: number;
  subscriptions: number;
  earnings_cents: number;
}

interface AnalyticsDataPoint {
  date: string;
  visits: number;
  installs: number;
  subscriptions: number;
  plus: number;
  max: number;
  churns: number;
  earnings_cents: number;
}

export default function AffiliatesPage() {
  const [timePreset, setTimePreset] = useState<TimePresetKey>(DEFAULT_TIME_PRESET);
  const [dateRange, setDateRange] = useState(getDateRangeFromPreset(DEFAULT_TIME_PRESET));

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [topCodes, setTopCodes] = useState<TopCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDataPoint[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        start: dateRange.startDate,
        end: dateRange.endDate,
      });

      const response = await fetch(`/api/affiliates/dashboard?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar dashboard');
      }

      setMetrics(data.metrics);
      setFunnel(data.funnel);
      setTopCodes(data.top_codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    }
  }, [dateRange]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const groupBy = getGroupByFromPreset(timePreset);
      const params = new URLSearchParams({
        start: dateRange.startDate,
        end: dateRange.endDate,
        group_by: groupBy,
      });

      const response = await fetch(`/api/affiliates/analytics?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar analytics');
      }

      setAnalytics(data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [dateRange, timePreset]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([fetchDashboard(), fetchAnalytics()]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchDashboard, fetchAnalytics]);

  const handleTimeChange = (
    preset: TimePresetKey,
    startDate: string,
    endDate: string
  ) => {
    setTimePreset(preset);
    setDateRange({ startDate, endDate });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-brand hover:underline border-0"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-foreground-light mt-1">
            Acompanhe suas indicações e ganhos
          </p>
        </div>
        <TimeRangeFilter value={timePreset} onChange={handleTimeChange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" aria-hidden="true" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <MetricsGrid columns={4}>
            <MetricCard
              title="Total ganho"
              value={formatCurrency(metrics?.total_earned_cents || 0)}
              icon={<DollarSign className="w-5 h-5" />}
              variant="success"
            />
            <MetricCard
              title="Disponível para saque"
              value={formatCurrency(metrics?.available_cents || 0)}
              description="Pronto para solicitar"
              icon={<Wallet className="w-5 h-5" />}
            />
            <MetricCard
              title="Pendente"
              value={formatCurrency(metrics?.pending_cents || 0)}
              description="Libera em até 30 dias"
              icon={<Clock className="w-5 h-5" />}
            />
            <MetricCard
              title="Taxa de churn"
              value={`${metrics?.churn_rate || 0}%`}
              description={`${metrics?.churned_subscribers || 0} cancelamentos`}
              icon={<TrendingDown className="w-5 h-5" />}
              variant={
                (metrics?.churn_rate || 0) > 10
                  ? 'danger'
                  : (metrics?.churn_rate || 0) > 5
                    ? 'warning'
                    : 'default'
              }
            />
          </MetricsGrid>

          {/* Earnings Chart */}
          <DashboardCard title="Ganhos e Assinaturas">
            <EarningsChart data={analytics} showSubscriptions />
          </DashboardCard>

          {/* Two Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <DashboardCard title="Funil de conversão">
              <FunnelChart
                data={{
                  visits: funnel?.visits || 0,
                  installs: funnel?.installs || 0,
                  subscriptions: funnel?.subscriptions || 0,
                }}
              />
              <div className="mt-4 pt-4 border-t border-solid border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-light">Taxa de conversão</span>
                  <span className="font-medium text-brand">
                    {funnel?.conversion_rate || 0}%
                  </span>
                </div>
              </div>
            </DashboardCard>

            {/* Subscribers Chart */}
            <DashboardCard title="Assinantes por plano">
              <SubscribersChart
                data={{
                  plus: funnel?.plus || 0,
                  max: funnel?.max || 0,
                }}
              />
            </DashboardCard>
          </div>

          {/* Top Codes */}
          <TopCodesTable data={topCodes} />
        </>
      )}
    </div>
  );
}
