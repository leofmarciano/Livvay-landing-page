/**
 * Affiliate Commission System Constants
 * Business rules for commission calculation, withdrawal limits, and time presets
 */

// Plan prices in cents (USD)
export const PLAN_PRICES_CENTS = {
  plus: 2000, // $20.00
  max: 9900, // $99.00
} as const;

// Commission rates by subscription period
export const COMMISSION_RATES = {
  months_1_3: 0.6, // 60% for first 3 months
  months_4_12: 0.3, // 30% for months 4-12
} as const;

// Withdrawal rules
export const WITHDRAWAL_DELAY_DAYS = 30; // Days before commission becomes available
export const MINIMUM_WITHDRAWAL_CENTS = 5000; // $50.00 minimum

// Dashboard time filter presets
export const TIME_PRESETS = [
  { key: '7d', label: '7 dias', days: 7 },
  { key: '30d', label: '30 dias', days: 30 },
  { key: '90d', label: '90 dias', days: 90 },
  { key: '1y', label: '1 ano', days: 365 },
  { key: '3y', label: '3 anos', days: 1095 },
] as const;

export const DEFAULT_TIME_PRESET = '30d';

// Commission status labels (Portuguese)
export const COMMISSION_STATUS_LABELS = {
  pending: 'Pendente',
  available: 'Disponível',
  requested: 'Solicitado',
  paid: 'Pago',
  cancelled: 'Cancelado',
} as const;

// Withdrawal status labels (Portuguese)
export const WITHDRAWAL_STATUS_LABELS = {
  pending: 'Aguardando',
  approved: 'Aprovado',
  paid: 'Pago',
  rejected: 'Rejeitado',
} as const;

// Plan labels (Portuguese)
export const PLAN_LABELS = {
  plus: 'Plus',
  max: 'Max',
} as const;

// Helper to format currency
export function formatCurrency(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Helper to get commission rate for a given month
export function getCommissionRateForMonth(month: number): number {
  if (month <= 3) return COMMISSION_RATES.months_1_3;
  if (month <= 12) return COMMISSION_RATES.months_4_12;
  return 0;
}

// Helper to calculate expected commission for a plan
export function calculateCommission(
  planType: keyof typeof PLAN_PRICES_CENTS,
  month: number
): number {
  const price = PLAN_PRICES_CENTS[planType];
  const rate = getCommissionRateForMonth(month);
  return Math.floor(price * rate);
}

// Type exports
export type PlanType = keyof typeof PLAN_PRICES_CENTS;
export type CommissionStatus = keyof typeof COMMISSION_STATUS_LABELS;
export type WithdrawalStatus = keyof typeof WITHDRAWAL_STATUS_LABELS;
export type TimePresetKey = (typeof TIME_PRESETS)[number]['key'];
