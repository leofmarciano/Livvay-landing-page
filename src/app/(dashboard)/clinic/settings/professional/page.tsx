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
          throw new Error('Failed to load profile');
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
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
              <p className="font-medium text-foreground">Professional profile complete</p>
              <p className="text-sm text-foreground-light">
                Your credentials are verified
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Complete your professional profile</p>
              <p className="text-sm text-foreground-light">
                Add your credentials to unlock all features
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
              <h2 className="text-lg font-semibold text-foreground">Professional Information</h2>
              <p className="text-sm text-foreground-light">
                Your professional credentials and specialty
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
                    Professional Type
                  </label>
                  <p className="mt-1 text-foreground">
                    {CLINIC_PROFESSIONAL_LABELS[profile.professional_type as ClinicProfessionalType]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-light">
                    License Number
                  </label>
                  <p className="mt-1 text-foreground">
                    {profile.license_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground-light">
                    Specialty
                  </label>
                  <p className="mt-1 text-foreground">
                    {profile.specialty || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-foreground-muted text-center py-8">
              Professional profile form coming soon
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
