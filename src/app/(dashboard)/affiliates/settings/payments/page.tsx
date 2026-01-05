'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import {
  formatCurrency,
  MINIMUM_WITHDRAWAL_CENTS,
  WITHDRAWAL_STATUS_LABELS,
  type WithdrawalStatus,
} from '@/lib/constants/affiliate';

interface Balance {
  pending_cents: number;
  available_cents: number;
  requested_cents: number;
  paid_cents: number;
}

interface WithdrawalRequest {
  id: string;
  amount_cents: number;
  currency: string;
  status: WithdrawalStatus;
  requested_at: string;
  processed_at: string | null;
  paid_at: string | null;
  rejected_reason: string | null;
}

export default function AffiliatesSettingsPaymentsPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Withdrawal dialog state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [pixKey, setPixKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const response = await fetch('/api/affiliates/withdrawals');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar pagamentos');
      }

      setBalance(data.balance);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleWithdraw = async () => {
    setError(null);
    const amountCents = Math.round(parseFloat(withdrawAmount) * 100);

    if (isNaN(amountCents) || amountCents < MINIMUM_WITHDRAWAL_CENTS) {
      setError(`Valor mínimo para saque: ${formatCurrency(MINIMUM_WITHDRAWAL_CENTS)}`);
      return;
    }

    if (amountCents > (balance?.available_cents || 0)) {
      setError('Saldo disponível insuficiente');
      return;
    }

    if (!pixKey.trim()) {
      setError('Informe sua chave PIX');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/affiliates/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_cents: amountCents,
          payment_method: paymentMethod,
          payment_details: { pix_key: pixKey },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar saque');
      }

      setSuccess('Solicitação de saque enviada com sucesso!');
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setPixKey('');
      fetchWithdrawals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar saque');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const styles = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-brand/10 text-brand border-brand/20',
      paid: 'bg-brand/10 text-brand border-brand/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
      >
        {WITHDRAWAL_STATUS_LABELS[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback messages */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-brand/10 border border-brand/20 text-brand text-sm">
          {success}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-surface-100 border border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-light">
                Disponível para saque
              </p>
              <p className="text-2xl font-semibold text-brand mt-1">
                {formatCurrency(balance?.available_cents || 0)}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
              <Wallet className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-100 border border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-light">Pendente</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {formatCurrency(balance?.pending_cents || 0)}
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                Libera em até 30 dias
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-200">
              <Clock className="w-5 h-5 text-foreground-muted" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-100 border border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-light">Solicitado</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {formatCurrency(balance?.requested_cents || 0)}
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                Aguardando pagamento
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
              <Banknote className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-100 border border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-light">Total pago</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {formatCurrency(balance?.paid_cents || 0)}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Button */}
      <div className="rounded-xl bg-surface-100 border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Solicitar saque
            </h2>
            <p className="text-sm text-foreground-light mt-1">
              Mínimo: {formatCurrency(MINIMUM_WITHDRAWAL_CENTS)} • Pagamento via PIX
            </p>
          </div>
          <Button
            type="primary"
            icon={<ArrowRight />}
            onClick={() => setShowWithdrawDialog(true)}
            disabled={(balance?.available_cents || 0) < MINIMUM_WITHDRAWAL_CENTS}
          >
            Solicitar saque
          </Button>
        </div>

        {(balance?.available_cents || 0) < MINIMUM_WITHDRAWAL_CENTS && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning">
              Você precisa de pelo menos {formatCurrency(MINIMUM_WITHDRAWAL_CENTS)}{' '}
              disponível para solicitar um saque.
            </p>
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="rounded-xl bg-surface-100 border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Histórico de saques
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mb-4">
              <Banknote className="w-6 h-6 text-foreground-muted" />
            </div>
            <p className="text-foreground-light">
              Nenhuma solicitação de saque ainda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                    Data
                  </th>
                  <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                    Valor
                  </th>
                  <th className="text-center text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">
                    Pago em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-surface-200/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatDate(request.requested_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                      {formatCurrency(request.amount_cents)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-light">
                      {request.paid_at ? formatDate(request.paid_at) : '-'}
                      {request.rejected_reason && (
                        <p className="text-xs text-destructive mt-1">
                          {request.rejected_reason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar saque</DialogTitle>
            <DialogDescription>
              Saldo disponível: {formatCurrency(balance?.available_cents || 0)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-foreground-light mb-1.5"
              >
                Valor do saque (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min={MINIMUM_WITHDRAWAL_CENTS / 100}
                  max={(balance?.available_cents || 0) / 100}
                  step="0.01"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-foreground-muted mt-1">
                Mínimo: {formatCurrency(MINIMUM_WITHDRAWAL_CENTS)}
              </p>
            </div>

            <div>
              <label
                htmlFor="pix"
                className="block text-sm font-medium text-foreground-light mb-1.5"
              >
                Chave PIX
              </label>
              <Input
                id="pix"
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="outline"
              onClick={() => setShowWithdrawDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={handleWithdraw}
              loading={isSubmitting}
              disabled={
                !withdrawAmount ||
                !pixKey.trim() ||
                parseFloat(withdrawAmount) * 100 < MINIMUM_WITHDRAWAL_CENTS
              }
            >
              Confirmar saque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
