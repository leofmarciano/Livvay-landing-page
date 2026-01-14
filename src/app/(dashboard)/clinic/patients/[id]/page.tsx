'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PatientHeader } from '@/components/clinic/patient/PatientHeader';
import { PatientTabs } from '@/components/clinic/patient/PatientTabs';
import { ConsultasCard } from '@/components/clinic/patient/ConsultasCard';
import { MedidasCard } from '@/components/clinic/patient/MedidasCard';
import { ObjetivoCard } from '@/components/clinic/patient/ObjetivoCard';
import { cn } from '@/lib/utils';
import {
  mockPatient,
  mockConsultas,
  mockUltimaMedida,
  mockWeightHistory,
  mockObjetivo,
  type PatientTabKey,
} from '@/lib/clinic/mock-patient-data';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [activeTab, setActiveTab] = useState<PatientTabKey>('medidas');

  // TODO: Fetch real patient data based on patientId
  // For now, we use mock data
  const patient = mockPatient;
  const consultas = mockConsultas;
  const ultimaMedida = mockUltimaMedida;
  const weightHistory = mockWeightHistory;
  const objetivo = mockObjetivo;

  // Memoized handlers to prevent unnecessary re-renders
  const handleGoBack = useCallback(() => {
    router.push('/clinic/patients');
  }, [router]);

  const handleCriarLembrete = useCallback(() => {
    console.log('Create reminder for patient:', patientId);
  }, [patientId]);

  const handleTimeSaude = useCallback(() => {
    console.log('Show health team for patient:', patientId);
  }, [patientId]);

  const handleAgendarConsulta = useCallback(() => {
    console.log('Schedule appointment for patient:', patientId);
  }, [patientId]);

  const handleIniciarConsulta = useCallback((consultaId: string) => {
    console.log('Start consultation:', consultaId);
  }, []);

  const handleCriarObjetivo = useCallback(() => {
    console.log('Create new goal for patient:', patientId);
  }, [patientId]);

  const handleEditarPesoAlvo = useCallback(() => {
    console.log('Edit target weight for patient:', patientId);
  }, [patientId]);

  const handleTabChange = useCallback((tab: PatientTabKey) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="space-y-6 pb-safe">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGoBack();
              }
            }}
            aria-label="Voltar para lista de pacientes"
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl',
              'bg-surface-100 hover:bg-surface-200 transition-colors motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
            )}
          >
            <ArrowLeft className="w-5 h-5 text-foreground-muted" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Resumo do Paciente</h1>
            <p className="text-sm text-foreground-light mt-1">
              Visão completa do histórico e progresso
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="secondary" onClick={handleTimeSaude}>
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            Time de saúde
          </Button>
          <Button type="secondary" onClick={handleCriarLembrete}>
            <Bell className="w-4 h-4 mr-2" aria-hidden="true" />
            Criar lembrete
          </Button>
        </div>
      </header>

      {/* Patient Info Card */}
      <PatientHeader patient={patient} />

      {/* Tabs Navigation */}
      <PatientTabs activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Medidas Tab Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left Column - Consultas e Objetivo */}
          <div className="lg:col-span-1 space-y-6">
            <ConsultasCard
              ultimaConsulta={consultas.ultima}
              proximasConsultas={consultas.proximas}
              consultasRealizadas={consultas.realizadas}
              onAgendarConsulta={handleAgendarConsulta}
              onIniciarConsulta={handleIniciarConsulta}
            />
            <ObjetivoCard
              objetivo={objetivo}
              onCriarObjetivo={handleCriarObjetivo}
              onEditarPesoAlvo={handleEditarPesoAlvo}
            />
          </div>

          {/* Right Column - Medidas */}
          <div className="lg:col-span-1 xl:col-span-2">
            <MedidasCard
              ultimaMedida={ultimaMedida}
              historico={weightHistory}
            />
          </div>
        </div>
      </PatientTabs>
    </div>
  );
}
