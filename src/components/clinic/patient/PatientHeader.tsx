'use client';

import { User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { MockPatient } from '@/lib/clinic/mock-patient-data';

interface PatientHeaderProps {
  patient: MockPatient;
}

interface InfoBadgeProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'muted';
}

function InfoBadge({ label, value, variant = 'default' }: InfoBadgeProps) {
  const variantClasses = {
    default: 'bg-surface-100 text-foreground',
    success: 'bg-brand/10 text-brand',
    warning: 'bg-warning/10 text-warning',
    muted: 'bg-surface-200 text-foreground-muted',
  };

  return (
    <div className={cn('px-3 py-2 rounded-lg', variantClasses[variant])}>
      <p className="text-[10px] text-foreground-muted uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        isActive ? 'bg-brand/10 text-brand' : 'bg-destructive/10 text-destructive'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-brand' : 'bg-destructive'
        )}
      />
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const sexLabel = patient.biologicalSex === 'male' ? 'Masc' : 'Fem';
  const heightFormatted = `${patient.height.toFixed(2)}m`;
  const frequencyLabel =
    patient.frequency === 'high'
      ? 'Alta'
      : patient.frequency === 'medium'
        ? 'Média'
        : 'Baixa';

  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Top Row: Avatar, Name, Status */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {patient.avatarUrl ? (
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-14 h-14 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-surface-200 flex items-center justify-center border border-border">
                <User className="w-6 h-6 text-foreground-muted" />
              </div>
            )}
          </div>

          {/* Name, Email, Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
              <StatusBadge status={patient.status} />
            </div>
            <p className="text-sm text-foreground-muted truncate">{patient.email}</p>
          </div>
        </div>

        {/* Info Badges Grid - All Patient Info */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          <InfoBadge label="CPF" value={patient.cpf} />
          <InfoBadge label="Sexo" value={sexLabel} />
          <InfoBadge label="Idade" value={`${patient.age}`} />
          <InfoBadge label="Altura" value={heightFormatted} />
          <InfoBadge label="JTBD" value={patient.jtbd} />
          <InfoBadge label="Perfil" value={patient.profile} />
          <InfoBadge
            label="Motivação"
            value={`${patient.motivation}/10`}
            variant={patient.motivation >= 7 ? 'success' : 'warning'}
          />
          <InfoBadge
            label="Frequência"
            value={frequencyLabel}
            variant={patient.frequency === 'high' ? 'success' : 'muted'}
          />
          <InfoBadge label="Produto" value={patient.product} variant="muted" />
        </div>
      </div>
    </Card>
  );
}
