'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ProfileForm } from '@/components/forms/ProfileForm';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  birth_date: string;
  cpf: string;
  rg: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

interface ProfileResponse {
  profile: ProfileData | null;
  email: string;
}

export default function AffiliatesSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/affiliates/profile');
      const data: ProfileResponse = await response.json();

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

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
              <p className="font-medium text-foreground">Perfil completo</p>
              <p className="text-sm text-foreground-light">
                Suas informações estão atualizadas
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Complete seu perfil</p>
              <p className="text-sm text-foreground-light">
                Preencha seus dados para liberar todas as funcionalidades
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
          <ProfileForm initialData={profile} onSuccess={handleProfileSuccess} />
        )}
      </div>
    </div>
  );
}
