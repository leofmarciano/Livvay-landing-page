'use client';

import { Eye, Users, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/constants/affiliate';

interface TopCode {
  code: string;
  visits: number;
  installs: number;
  subscriptions: number;
  earnings_cents: number;
}

interface TopCodesTableProps {
  data: TopCode[];
  className?: string;
}

export function TopCodesTable({ data, className }: TopCodesTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('rounded-xl bg-surface-100 border border-solid border-border', className)}>
        <div className="p-6 border-b border-solid border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Códigos com melhor performance
          </h2>
        </div>
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mb-4">
            <Ticket className="w-6 h-6 text-foreground-muted" aria-hidden="true" />
          </div>
          <p className="text-foreground-light">
            Crie códigos de indicação para começar a acompanhar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl bg-surface-100 border border-solid border-border', className)}>
      <div className="p-6 border-b border-solid border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Códigos com melhor performance
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-0">
          <thead>
            <tr className="border-b border-solid border-border">
              <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                Código
              </th>
              <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                <div className="flex items-center justify-end gap-1">
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  Visitas
                </div>
              </th>
              <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                <div className="flex items-center justify-end gap-1">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  Installs
                </div>
              </th>
              <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                Assinaturas
              </th>
              <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3 border-0">
                Ganhos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((code) => (
              <tr key={code.code} className="hover:bg-surface-200/50 border-0">
                <td className="px-6 py-4 border-0">
                  <code className="font-mono text-sm font-medium text-foreground">
                    {code.code}
                  </code>
                </td>
                <td className="px-6 py-4 text-right text-sm text-foreground-light border-0">
                  {code.visits.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-foreground-light border-0">
                  {code.installs.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-foreground-light border-0">
                  {code.subscriptions.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-brand border-0">
                  {formatCurrency(code.earnings_cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
