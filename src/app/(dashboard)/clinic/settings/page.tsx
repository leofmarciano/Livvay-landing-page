'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ClinicProfileForm } from '@/components/forms/ClinicProfileForm';
import type { ClinicProfile } from '@/lib/rbac/types';

export default function ClinicSettingsProfilePage() {
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/clinic/profile');

      if (response.status === 404) {
        // No profile yet - this is expected for new users
        setProfile(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSuccess = () => {
    fetchProfile();
  };

  const isProfileComplete = !!profile;

  return (
    <div className="space-y-6">
      {/* Profile Status Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-100 border border-border">
        {isProfileComplete ? (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-medium text-foreground">Perfil profissional completo</p>
              <p className="text-sm text-foreground-light">
                Suas credenciais estão configuradas
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
                Configure suas credenciais para desbloquear todos os recursos
              </p>
            </div>
          </>
        )}
      </div>

      {/* Profile Form Section */}
      <div className="rounded-xl bg-surface-100 border border-border p-6">
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
        ) : (
          <ClinicProfileForm initialData={profile} onSuccess={handleProfileSuccess} />
        )}
      </div>
    </div>
  );
}
