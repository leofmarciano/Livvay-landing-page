'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  CLINIC_PROFESSIONAL_LABELS,
  type ClinicProfile,
  type ClinicProfessionalType,
} from '@/lib/rbac/types';

export default function ClinicSettingsProfessionalPage() {
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/clinic/profile');
        if (!response.ok) {
          if (response.status === 404) {
            // No profile yet - this is expected for new users
            setProfile(null);
            return;
          }
          throw new Error('Erro ao carregar perfil');
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const hasProfile = !!profile;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-100 border border-border">
        {hasProfile ? (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-medium text-foreground">Perfil profissional completo</p>
              <p className="text-sm text-foreground-light">
                Suas credenciais estão verificadas
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Complete seu perfil profissional</p>
              <p className="text-sm text-foreground-light">
                Adicione suas credenciais para desbloquear todos os recursos
              </p>
            </div>
          </>
        )}
      </div>

      {/* Professional Info Card */}
      <Card hover={false}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10">
              <Stethoscope className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Informações Profissionais</h2>
              <p className="text-sm text-foreground-light">
                Suas credenciais e especialidade
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-foreground-muted animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-foreground-light">{error}</p>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground-light">
                    Tipo Profissional
                  </label>
                  <p className="mt-1 text-foreground">
                    {CLINIC_PROFESSIONAL_LABELS[profile.professional_type as ClinicProfessionalType]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-light">
                    Número do Registro
                  </label>
                  <p className="mt-1 text-foreground">
                    {profile.license_number || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-light">
                    Especialidade
                  </label>
                  <p className="mt-1 text-foreground">
                    {profile.specialty || 'Não informada'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-foreground-muted text-center py-8">
              Formulário de perfil profissional em breve
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
