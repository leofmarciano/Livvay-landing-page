'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Clock,
  Wallet,
  Users,
  TrendingDown,
  Eye,
  Ticket,
  Loader2,
} from 'lucide-react';
import {
  MetricCard,
  MetricsGrid,
  TimeRangeFilter,
  EarningsChart,
  FunnelChart,
  SubscribersChart,
  getDateRangeFromPreset,
  getGroupByFromPreset,
} from '@/components/affiliates';
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
          className="text-brand hover:underline"
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
          <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
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
          <div className="rounded-xl bg-surface-100 border border-solid border-border p-6 overflow-hidden">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ganhos e Assinaturas
            </h2>
            <EarningsChart data={analytics} showSubscriptions />
          </div>

          {/* Two Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <div className="rounded-xl bg-surface-100 border border-solid border-border p-6 overflow-hidden">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Funil de conversão
              </h2>
              <FunnelChart
                data={{
                  visits: funnel?.visits || 0,
                  installs: funnel?.installs || 0,
                  subscriptions: funnel?.subscriptions || 0,
                }}
              />
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-light">Taxa de conversão</span>
                  <span className="font-medium text-brand">
                    {funnel?.conversion_rate || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Subscribers Chart */}
            <div className="rounded-xl bg-surface-100 border border-solid border-border p-6 overflow-hidden">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Assinantes por plano
              </h2>
              <SubscribersChart
                data={{
                  plus: funnel?.plus || 0,
                  max: funnel?.max || 0,
                }}
              />
            </div>
          </div>

          {/* Top Codes */}
          <div className="rounded-xl bg-surface-100 border border-solid border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Códigos com melhor performance
              </h2>
            </div>
            {topCodes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mb-4">
                  <Ticket className="w-6 h-6 text-foreground-muted" />
                </div>
                <p className="text-foreground-light">
                  Crie códigos de indicação para começar a acompanhar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                        Código
                      </th>
                      <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Visitas
                        </div>
                      </th>
                      <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Installs
                        </div>
                      </th>
                      <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                        Assinaturas
                      </th>
                      <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                        Ganhos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topCodes.map((code) => (
                      <tr key={code.code} className="hover:bg-surface-200/50">
                        <td className="px-6 py-4">
                          <code className="font-mono text-sm font-medium text-foreground">
                            {code.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-foreground-light">
                          {code.visits.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-foreground-light">
                          {code.installs.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-foreground-light">
                          {code.subscriptions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-brand">
                          {formatCurrency(code.earnings_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
