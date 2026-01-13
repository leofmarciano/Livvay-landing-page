'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import type { ClinicProfile } from '@/lib/rbac/types';

export default function ClinicSettingsPracticePage() {
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/clinic/profile');
        if (!response.ok) {
          if (response.status === 404) {
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

  return (
    <div className="space-y-6">
      {/* Practice Info Card */}
      <Card hover={false}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10">
              <Building2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Informações do Consultório</h2>
              <p className="text-sm text-foreground-light">
                Dados do seu consultório ou clínica
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
          ) : profile?.clinic_name ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground-light">
                  Nome do Consultório/Clínica
                </label>
                <p className="mt-1 text-foreground">{profile.clinic_name}</p>
              </div>
            </div>
          ) : (
            <p className="text-foreground-muted text-center py-8">
              Configurações do consultório em breve
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
