'use client';

import { memo } from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { MockPatient } from '@/lib/clinic/mock-patient-data';

// Static constants moved outside component
const VARIANT_CLASSES = {
  default: 'text-foreground',
  success: 'text-brand',
  warning: 'text-warning',
  muted: 'text-foreground-muted',
} as const;

interface PatientHeaderProps {
  patient: MockPatient;
}

interface InfoItemProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'muted';
}

const InfoItem = memo(function InfoItem({ label, value, variant = 'default' }: InfoItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-foreground-muted uppercase tracking-wide">
        {label}
      </span>
      <span className={cn('text-sm font-medium tabular-nums', VARIANT_CLASSES[variant])}>
        {value}
      </span>
    </div>
  );
});

interface StatusBadgeProps {
  status: 'active' | 'inactive';
}

const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'active';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        isActive ? 'bg-brand/10 text-brand' : 'bg-destructive/10 text-destructive'
      )}
      role="status"
      aria-label={isActive ? 'Paciente ativo' : 'Paciente inativo'}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-brand' : 'bg-destructive'
        )}
        aria-hidden="true"
      />
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
});

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
      <div className="flex items-center gap-4 overflow-x-auto">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {patient.avatarUrl ? (
            <img
              src={patient.avatarUrl}
              alt={`Foto de ${patient.name}`}
              className="w-12 h-12 rounded-xl object-cover border border-border"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center border border-border"
              role="img"
              aria-label={`Avatar de ${patient.name}`}
            >
              <User className="w-5 h-5 text-foreground-muted" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Name, Email, Status */}
        <div className="flex-shrink-0 min-w-0 pr-4 border-r border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">
              {patient.name}
            </h2>
            <StatusBadge status={patient.status} />
          </div>
          <p className="text-xs text-foreground-muted truncate max-w-[200px]">{patient.email}</p>
        </div>

        {/* Info Items - Single Row */}
        <div className="flex items-center gap-6 sm:gap-12 flex-shrink-0">
          <InfoItem label="CPF" value={patient.cpf} />
          <InfoItem label="Sexo" value={sexLabel} />
          <InfoItem label="Idade" value={`${patient.age}`} />
          <InfoItem label="Altura" value={heightFormatted} />
          <InfoItem label="Objetivo" value={patient.jtbd} />
          <InfoItem label="Perfil" value={patient.profile} />
          <InfoItem
            label="Motivação"
            value={`${patient.motivation}/10`}
            variant={patient.motivation >= 7 ? 'success' : 'warning'}
          />
          <InfoItem
            label="Frequência"
            value={frequencyLabel}
            variant={patient.frequency === 'high' ? 'success' : 'muted'}
          />
          <InfoItem label="Produto" value={patient.product} variant="muted" />
        </div>
      </div>
    </Card>
  );
}
