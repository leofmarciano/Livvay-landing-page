/**
 * Mock Patient Data
 *
 * Sample data for patient detail page UI development.
 * This will be replaced with real API data later.
 */

export interface MockPatient {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  cpf: string;
  biologicalSex: 'male' | 'female';
  age: number;
  height: number; // in meters
  jtbd: string;
  profile: string;
  motivation: number;
  frequency: 'low' | 'medium' | 'high';
  product: string;
}

export interface MockConsulta {
  id: string;
  titulo: string;
  data: string;
  horario: string;
  profissionalTipo: 'nutritionist' | 'doctor' | 'therapist';
}

export interface MockMedida {
  data: string;
  peso: number;
  gordura: number;
  gorduraPercent: number;
  musculo: number;
  musculoPercent: number;
}

export interface MockObjetivo {
  titulo: string;
  tipo: 'weight_loss' | 'weight_gain' | 'maintenance';
  dataInicio: string;
  dias: number;
  variacoes: {
    totalKg: number;
    totalPercent: number;
    dias30: number;
    dias7: number;
  };
  pesoAlvo: number;
  pesoInicial: number;
  pesoAtual: number;
  evolucao: {
    perdeu: number;
    percentual: number;
  };
}

export interface MockWeightHistory {
  data: string;
  peso: number;
  musculo: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const mockPatient: MockPatient = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'John Doe',
  email: 'teste@teste.com',
  status: 'active',
  cpf: '123.456.789-00',
  biologicalSex: 'male',
  age: 32,
  height: 1.91,
  jtbd: 'Gangorra',
  profile: 'Meta',
  motivation: 7,
  frequency: 'high',
  product: 'Desconhecido',
};

export const mockConsultas = {
  ultima: {
    id: 'c1',
    titulo: '7ª Consulta Nutricionista',
    data: '22/08/2025',
    horario: '12:40-13:10',
    profissionalTipo: 'nutritionist' as const,
  },
  proximas: [
    {
      id: 'c2',
      titulo: '8ª Consulta Nutricionista',
      data: 'quarta-feira, 24/09',
      horario: '14:00-15:00',
      profissionalTipo: 'nutritionist' as const,
    },
  ],
  realizadas: [
    {
      id: 'c3',
      titulo: '7ª Consulta Nutricionista',
      data: '22/08/2025',
      horario: '12:40-13:10',
      profissionalTipo: 'nutritionist' as const,
    },
    {
      id: 'c4',
      titulo: '6ª Consulta Nutricionista',
      data: '15/07/2025',
      horario: '10:00-10:30',
      profissionalTipo: 'nutritionist' as const,
    },
    {
      id: 'c5',
      titulo: '5ª Consulta Nutricionista',
      data: '01/07/2025',
      horario: '09:00-09:30',
      profissionalTipo: 'nutritionist' as const,
    },
  ],
};

export const mockUltimaMedida: MockMedida = {
  data: '04/09/2025',
  peso: 84.4,
  gordura: 10.5,
  gorduraPercent: 12.4,
  musculo: 42.6,
  musculoPercent: 50.5,
};

export const mockWeightHistory: MockWeightHistory[] = [
  { data: '2025-06-08', peso: 86.35, musculo: 41.2 },
  { data: '2025-06-15', peso: 86.0, musculo: 41.5 },
  { data: '2025-06-22', peso: 85.5, musculo: 41.8 },
  { data: '2025-06-29', peso: 85.8, musculo: 42.0 },
  { data: '2025-07-06', peso: 85.2, musculo: 42.1 },
  { data: '2025-07-13', peso: 84.9, musculo: 42.3 },
  { data: '2025-07-20', peso: 85.1, musculo: 42.2 },
  { data: '2025-07-27', peso: 84.6, musculo: 42.4 },
  { data: '2025-08-03', peso: 84.3, musculo: 42.5 },
  { data: '2025-08-10', peso: 85.05, musculo: 42.4 },
  { data: '2025-08-17', peso: 84.7, musculo: 42.5 },
  { data: '2025-08-24', peso: 84.5, musculo: 42.6 },
  { data: '2025-09-04', peso: 84.4, musculo: 42.6 },
];

export const mockObjetivo: MockObjetivo = {
  titulo: 'Perda de peso',
  tipo: 'weight_loss',
  dataInicio: '08/06/25',
  dias: 92,
  variacoes: {
    totalKg: 1.95,
    totalPercent: 2.26,
    dias30: 5.85,
    dias7: 0.65,
  },
  pesoAlvo: 80,
  pesoInicial: 86.35,
  pesoAtual: 84.4,
  evolucao: {
    perdeu: 1.95,
    percentual: 2.26,
  },
};

// Tab definitions
export const patientTabs = [
  { key: 'inbox', label: 'Inbox', icon: 'MessageSquare' },
  { key: 'medidas', label: 'Medidas', icon: 'Scale', badge: true },
  { key: 'analise', label: 'Análise', icon: 'BarChart3' },
  { key: 'planos', label: 'Planos', icon: 'FileText' },
  { key: 'medicacoes', label: 'Medicações', icon: 'Pill' },
  { key: 'exames', label: 'Exames', icon: 'ClipboardList' },
  { key: 'fotos', label: 'Fotos', icon: 'Camera' },
  { key: 'diagnosticos', label: 'Diagnósticos', icon: 'Stethoscope' },
] as const;

export type PatientTabKey = (typeof patientTabs)[number]['key'];
