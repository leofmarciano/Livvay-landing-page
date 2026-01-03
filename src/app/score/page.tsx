'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Moon,
  Zap,
  Scale,
  Trophy,
  Brain,
  Activity,
  Clock,
  Utensils,
  Heart,
  Users,
  Mail,
  CheckCircle,
  Sparkles,
  Target,
  Droplets,
  Cigarette,
  Wine,
  Pill,
  User,
  Calendar,
  Ruler,
  Weight,
  Dumbbell,
  Sofa,
  Apple,
  Salad,
  Cookie,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Question types
type QuestionType = 'text' | 'date' | 'number' | 'select';

interface QuestionOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  subtitle?: string;
  section: string;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  conditional?: {
    dependsOn: string;
    showWhen: string;
  };
}

// Section configuration
const sections = [
  { id: 'identification', label: 'Identificação', questions: 5 },
  { id: 'body', label: 'Corpo', questions: 2 },
  { id: 'movement', label: 'Movimento', questions: 3 },
  { id: 'sleep', label: 'Sono', questions: 2 },
  { id: 'nutrition', label: 'Alimentação', questions: 4 },
  { id: 'hydration', label: 'Hidratação', questions: 1 },
  { id: 'substances', label: 'Substâncias', questions: 3 },
  { id: 'goals', label: 'Objetivos', questions: 2 },
];

// Quiz questions data - All keys in English
const quizQuestions: Question[] = [
  // Section 1: Identificação básica
  {
    id: 'name',
    type: 'text',
    question: 'Qual é o seu nome?',
    subtitle: 'Como você gostaria de ser chamado',
    section: 'identification',
    placeholder: 'Seu nome',
  },
  {
    id: 'gender',
    type: 'select',
    question: 'Qual é o seu gênero?',
    section: 'identification',
    options: [
      { value: 'male', label: 'Masculino', icon: User },
      { value: 'female', label: 'Feminino', icon: User },
      { value: 'non_binary', label: 'Não binário', icon: User },
      { value: 'prefer_not_say', label: 'Prefiro não informar', icon: User },
    ],
  },
  {
    id: 'birth_date',
    type: 'date',
    question: 'Qual é a sua data de nascimento?',
    section: 'identification',
  },
  {
    id: 'height_cm',
    type: 'number',
    question: 'Qual é a sua altura?',
    subtitle: 'Em centímetros',
    section: 'identification',
    placeholder: '170',
    min: 100,
    max: 250,
    unit: 'cm',
  },
  {
    id: 'weight_kg',
    type: 'number',
    question: 'Qual é o seu peso atual?',
    subtitle: 'Em quilogramas',
    section: 'identification',
    placeholder: '70',
    min: 30,
    max: 300,
    unit: 'kg',
  },

  // Section 2: Corpo e composição
  {
    id: 'body_description',
    type: 'select',
    question: 'Como você descreveria seu corpo hoje?',
    section: 'body',
    options: [
      { value: 'underweight', label: 'Abaixo do peso', icon: Scale, description: 'Preciso ganhar peso' },
      { value: 'adequate', label: 'Peso adequado', icon: Scale, description: 'Me sinto bem com meu peso' },
      { value: 'slight_overweight', label: 'Sobrepeso leve', icon: Scale, description: 'Alguns quilos a mais' },
      { value: 'obese', label: 'Obesidade', icon: Scale, description: 'Acima do peso ideal' },
      { value: 'dont_know', label: 'Não sei dizer', icon: Scale, description: 'Preciso avaliar melhor' },
    ],
  },
  {
    id: 'knows_body_fat',
    type: 'select',
    question: 'Você sabe seu percentual de gordura corporal?',
    section: 'body',
    options: [
      { value: 'yes', label: 'Sim', icon: CheckCircle, description: 'Já fiz bioimpedância ou similar' },
      { value: 'no', label: 'Não', icon: AlertTriangle, description: 'Nunca medi' },
    ],
  },
  {
    id: 'body_fat_percentage',
    type: 'number',
    question: 'Qual é seu percentual de gordura corporal?',
    subtitle: 'Aproximado, se souber',
    section: 'body',
    placeholder: '20',
    min: 3,
    max: 60,
    unit: '%',
    conditional: {
      dependsOn: 'knows_body_fat',
      showWhen: 'yes',
    },
  },

  // Section 3: Rotina e movimento
  {
    id: 'exercise_days_per_week',
    type: 'select',
    question: 'Quantos dias por semana você pratica atividade física?',
    section: 'movement',
    options: [
      { value: '0', label: '0 dias', icon: Sofa, description: 'Não pratico' },
      { value: '1_2', label: '1 a 2 dias', icon: Activity, description: 'Pouca frequência' },
      { value: '3_4', label: '3 a 4 dias', icon: Dumbbell, description: 'Frequência moderada' },
      { value: '5_plus', label: '5 ou mais dias', icon: Trophy, description: 'Alta frequência' },
    ],
  },
  {
    id: 'exercise_type',
    type: 'select',
    question: 'Qual é o tipo principal de atividade que você pratica?',
    section: 'movement',
    options: [
      { value: 'weight_training', label: 'Musculação', icon: Dumbbell, description: 'Treino de força' },
      { value: 'light_cardio', label: 'Cardio leve', icon: Activity, description: 'Caminhada, bike leve' },
      { value: 'intense_cardio', label: 'Cardio intenso', icon: Zap, description: 'Corrida, HIIT' },
      { value: 'sports', label: 'Esportes', icon: Trophy, description: 'Futebol, tênis, etc.' },
      { value: 'none', label: 'Não pratico', icon: Sofa, description: 'Sem atividade regular' },
    ],
  },
  {
    id: 'sitting_hours_per_day',
    type: 'select',
    question: 'Em média, quanto tempo você fica sentado por dia?',
    section: 'movement',
    options: [
      { value: 'less_than_4h', label: 'Menos de 4 horas', icon: Activity, description: 'Trabalho ativo' },
      { value: '4_to_6h', label: '4 a 6 horas', icon: Clock, description: 'Moderado' },
      { value: '6_to_8h', label: '6 a 8 horas', icon: Sofa, description: 'Escritório típico' },
      { value: 'more_than_8h', label: 'Mais de 8 horas', icon: AlertTriangle, description: 'Muito sedentário' },
    ],
  },

  // Section 4: Sono e recuperação
  {
    id: 'sleep_hours',
    type: 'select',
    question: 'Quantas horas você dorme por noite, em média?',
    section: 'sleep',
    options: [
      { value: 'less_than_5h', label: 'Menos de 5h', icon: AlertTriangle, description: 'Muito pouco' },
      { value: '5_to_6h', label: '5 a 6h', icon: Moon, description: 'Abaixo do ideal' },
      { value: '6_to_7h', label: '6 a 7h', icon: Moon, description: 'Quase lá' },
      { value: '7_to_8h', label: '7 a 8h', icon: CheckCircle, description: 'Ideal' },
      { value: 'more_than_8h', label: 'Mais de 8h', icon: Moon, description: 'Bastante sono' },
    ],
  },
  {
    id: 'sleep_quality',
    type: 'select',
    question: 'Como você avalia a qualidade do seu sono?',
    section: 'sleep',
    options: [
      { value: 'poor', label: 'Ruim', icon: AlertTriangle, description: 'Acordo cansado' },
      { value: 'regular', label: 'Regular', icon: Moon, description: 'Poderia ser melhor' },
      { value: 'good', label: 'Boa', icon: CheckCircle, description: 'Descanso bem' },
      { value: 'excellent', label: 'Excelente', icon: Sparkles, description: 'Acordo disposto' },
    ],
  },

  // Section 5: Alimentação
  {
    id: 'eating_habits',
    type: 'select',
    question: 'Como você descreve sua alimentação na maior parte do tempo?',
    section: 'nutrition',
    options: [
      { value: 'ultra_processed', label: 'Ultraprocessados e fast food', icon: AlertTriangle, description: 'Muita comida industrializada' },
      { value: 'mixed', label: 'Mista, como de tudo', icon: Utensils, description: 'Sem padrão definido' },
      { value: 'homemade_balanced', label: 'Caseira e equilibrada', icon: Apple, description: 'Comida de verdade' },
      { value: 'planned_conscious', label: 'Planejada e consciente', icon: ClipboardList, description: 'Controlo o que como' },
    ],
  },
  {
    id: 'fruits_vegetables_daily',
    type: 'select',
    question: 'Qual o seu consumo diário de frutas e vegetais?',
    section: 'nutrition',
    options: [
      { value: 'almost_none', label: 'Quase nenhum', icon: AlertTriangle, description: 'Raramente como' },
      { value: '1_to_2', label: '1 a 2 porções', icon: Apple, description: 'Pouco' },
      { value: '3_to_5', label: '3 a 5 porções', icon: Salad, description: 'Moderado' },
      { value: '5_plus', label: '5 ou mais porções', icon: CheckCircle, description: 'Excelente' },
    ],
  },
  {
    id: 'sugar_consumption',
    type: 'select',
    question: 'Com que frequência você consome açúcar e doces?',
    section: 'nutrition',
    options: [
      { value: 'daily', label: 'Diariamente', icon: Cookie, description: 'Todo dia' },
      { value: 'few_times_week', label: 'Algumas vezes por semana', icon: Cookie, description: '2-4 vezes' },
      { value: 'rarely', label: 'Raramente', icon: CheckCircle, description: '1-2 vezes por mês' },
      { value: 'almost_never', label: 'Quase nunca', icon: Sparkles, description: 'Evito ao máximo' },
    ],
  },
  {
    id: 'tracks_food',
    type: 'select',
    question: 'Você costuma controlar o que come?',
    section: 'nutrition',
    options: [
      { value: 'never', label: 'Nunca', icon: AlertTriangle, description: 'Não presto atenção' },
      { value: 'sometimes', label: 'Às vezes', icon: ClipboardList, description: 'Quando lembro' },
      { value: 'frequently', label: 'Frequentemente', icon: ClipboardList, description: 'Na maior parte' },
      { value: 'always', label: 'Sempre', icon: CheckCircle, description: 'Registro tudo' },
    ],
  },

  // Section 6: Hidratação
  {
    id: 'water_intake',
    type: 'select',
    question: 'Qual o seu consumo diário de água?',
    section: 'hydration',
    options: [
      { value: 'less_than_1l', label: 'Menos de 1 litro', icon: AlertTriangle, description: 'Muito pouco' },
      { value: '1_to_2l', label: '1 a 2 litros', icon: Droplets, description: 'Abaixo do ideal' },
      { value: '2_to_3l', label: '2 a 3 litros', icon: Droplets, description: 'Bom' },
      { value: 'more_than_3l', label: 'Mais de 3 litros', icon: CheckCircle, description: 'Excelente' },
    ],
  },

  // Section 7: Substâncias e hábitos
  {
    id: 'alcohol_consumption',
    type: 'select',
    question: 'Qual é o seu consumo de álcool?',
    section: 'substances',
    options: [
      { value: 'none', label: 'Não consumo', icon: CheckCircle, description: 'Zero álcool' },
      { value: 'socially', label: 'Socialmente', icon: Wine, description: 'Em ocasiões especiais' },
      { value: '1_to_2_week', label: '1 a 2 vezes por semana', icon: Wine, description: 'Moderado' },
      { value: '3_plus_week', label: '3 ou mais vezes por semana', icon: AlertTriangle, description: 'Frequente' },
    ],
  },
  {
    id: 'smoking',
    type: 'select',
    question: 'Você fuma ou usa nicotina?',
    section: 'substances',
    options: [
      { value: 'no', label: 'Não', icon: CheckCircle, description: 'Nunca fumei ou parei há muito tempo' },
      { value: 'ex_smoker', label: 'Ex-fumante', icon: TrendingUp, description: 'Parei recentemente' },
      { value: 'occasionally', label: 'Ocasionalmente', icon: Cigarette, description: 'Às vezes' },
      { value: 'daily', label: 'Diariamente', icon: AlertTriangle, description: 'Todo dia' },
    ],
  },
  {
    id: 'other_substances',
    type: 'select',
    question: 'Uso de outras substâncias?',
    subtitle: 'Recreativas ou não prescritas',
    section: 'substances',
    options: [
      { value: 'none', label: 'Nenhuma', icon: CheckCircle, description: 'Não uso' },
      { value: 'occasional', label: 'Ocasional', icon: Pill, description: 'Raramente' },
      { value: 'frequent', label: 'Frequente', icon: AlertTriangle, description: 'Regularmente' },
    ],
  },

  // Section 8: Consciência e objetivo
  {
    id: 'primary_goal',
    type: 'select',
    question: 'Qual é o seu principal objetivo com o Livvay?',
    section: 'goals',
    options: [
      { value: 'weight_loss', label: 'Emagrecimento', icon: Scale, description: 'Perder peso' },
      { value: 'performance', label: 'Ganho de performance', icon: Zap, description: 'Melhorar nos treinos' },
      { value: 'health_longevity', label: 'Saúde e longevidade', icon: Heart, description: 'Viver mais e melhor' },
      { value: 'metabolic_control', label: 'Controle metabólico', icon: Activity, description: 'Equilibrar exames' },
      { value: 'all_above', label: 'Todos os anteriores', icon: Target, description: 'Quero tudo' },
    ],
  },
  {
    id: 'commitment_level',
    type: 'select',
    question: 'O quanto você está disposto a mudar sua rotina para viver mais e melhor?',
    section: 'goals',
    options: [
      { value: 'little', label: 'Pouco', icon: AlertTriangle, description: 'Mudanças mínimas' },
      { value: 'moderate', label: 'Moderado', icon: Activity, description: 'Algumas mudanças' },
      { value: 'very', label: 'Muito', icon: TrendingUp, description: 'Mudanças significativas' },
      { value: 'totally_committed', label: 'Totalmente comprometido', icon: Sparkles, description: 'O que for preciso' },
    ],
  },
];

// Email validation schema
const emailSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

type EmailFormData = z.infer<typeof emailSchema>;

// Calculate age from birth date
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Calculate BMI
function calculateBMI(heightCm: number, weightKg: number): { value: number; category: string } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: string;
  if (bmi < 18.5) category = 'Abaixo do peso';
  else if (bmi < 25) category = 'Peso normal';
  else if (bmi < 30) category = 'Sobrepeso';
  else if (bmi < 35) category = 'Obesidade grau I';
  else if (bmi < 40) category = 'Obesidade grau II';
  else category = 'Obesidade grau III';

  return { value: Math.round(bmi * 10) / 10, category };
}

// Score calculation interfaces
interface SubScores {
  movement: number;
  sleep: number;
  nutrition: number;
  risk: number;
}

interface ScoreResult {
  total: number;
  subScores: SubScores;
  zone: string;
  zoneColor: string;
  bmi: { value: number; category: string } | null;
  age: number | null;
}

// Calculate comprehensive score (0-100)
function calculateScore(answers: Record<string, string>): ScoreResult {
  // Movement Score (0-100)
  const exercisePoints: Record<string, number> = { '0': 0, '1_2': 30, '3_4': 70, '5_plus': 100 };
  const exerciseTypePoints: Record<string, number> = {
    none: 0, light_cardio: 50, sports: 70, intense_cardio: 80, weight_training: 90
  };
  const sittingPoints: Record<string, number> = {
    more_than_8h: 0, '6_to_8h': 30, '4_to_6h': 60, less_than_4h: 100
  };
  const movementScore = Math.round(
    (exercisePoints[answers.exercise_days_per_week] || 0) * 0.4 +
    (exerciseTypePoints[answers.exercise_type] || 0) * 0.3 +
    (sittingPoints[answers.sitting_hours_per_day] || 0) * 0.3
  );

  // Sleep Score (0-100)
  const sleepHoursPoints: Record<string, number> = {
    less_than_5h: 10, '5_to_6h': 40, '6_to_7h': 70, '7_to_8h': 100, more_than_8h: 80
  };
  const sleepQualityPoints: Record<string, number> = {
    poor: 10, regular: 40, good: 75, excellent: 100
  };
  const sleepScore = Math.round(
    (sleepHoursPoints[answers.sleep_hours] || 0) * 0.5 +
    (sleepQualityPoints[answers.sleep_quality] || 0) * 0.5
  );

  // Nutrition Score (0-100)
  const eatingPoints: Record<string, number> = {
    ultra_processed: 10, mixed: 40, homemade_balanced: 75, planned_conscious: 100
  };
  const fruitsPoints: Record<string, number> = {
    almost_none: 10, '1_to_2': 40, '3_to_5': 75, '5_plus': 100
  };
  const sugarPoints: Record<string, number> = {
    daily: 10, few_times_week: 40, rarely: 75, almost_never: 100
  };
  const tracksPoints: Record<string, number> = {
    never: 20, sometimes: 50, frequently: 80, always: 100
  };
  const waterPoints: Record<string, number> = {
    less_than_1l: 10, '1_to_2l': 50, '2_to_3l': 80, more_than_3l: 100
  };
  const nutritionScore = Math.round(
    (eatingPoints[answers.eating_habits] || 0) * 0.25 +
    (fruitsPoints[answers.fruits_vegetables_daily] || 0) * 0.2 +
    (sugarPoints[answers.sugar_consumption] || 0) * 0.2 +
    (tracksPoints[answers.tracks_food] || 0) * 0.15 +
    (waterPoints[answers.water_intake] || 0) * 0.2
  );

  // Risk Score (0-100, higher = better/less risk)
  const alcoholPoints: Record<string, number> = {
    none: 100, socially: 80, '1_to_2_week': 50, '3_plus_week': 20
  };
  const smokingPoints: Record<string, number> = {
    no: 100, ex_smoker: 70, occasionally: 30, daily: 0
  };
  const substancesPoints: Record<string, number> = {
    none: 100, occasional: 50, frequent: 10
  };
  const riskScore = Math.round(
    (alcoholPoints[answers.alcohol_consumption] || 0) * 0.35 +
    (smokingPoints[answers.smoking] || 0) * 0.4 +
    (substancesPoints[answers.other_substances] || 0) * 0.25
  );

  // Commitment bonus
  const commitmentPoints: Record<string, number> = {
    little: 0, moderate: 3, very: 6, totally_committed: 10
  };
  const commitmentBonus = commitmentPoints[answers.commitment_level] || 0;

  // BMI adjustment
  let bmiAdjustment = 0;
  let bmi: { value: number; category: string } | null = null;
  if (answers.height_cm && answers.weight_kg) {
    const height = parseInt(answers.height_cm);
    const weight = parseInt(answers.weight_kg);
    if (height && weight) {
      bmi = calculateBMI(height, weight);
      if (bmi.value >= 18.5 && bmi.value < 25) bmiAdjustment = 10;
      else if (bmi.value >= 25 && bmi.value < 30) bmiAdjustment = 5;
      else if (bmi.value < 18.5 || bmi.value >= 30) bmiAdjustment = 0;
    }
  }

  // Age calculation
  let age: number | null = null;
  if (answers.birth_date) {
    age = calculateAge(answers.birth_date);
  }

  // Final score calculation
  const baseScore =
    movementScore * 0.20 +
    sleepScore * 0.20 +
    nutritionScore * 0.25 +
    riskScore * 0.15 +
    commitmentBonus +
    bmiAdjustment;

  const totalScore = Math.min(100, Math.max(0, Math.round(baseScore)));

  // Determine zone
  let zone: string;
  let zoneColor: string;
  if (totalScore <= 40) {
    zone = 'Zona de risco';
    zoneColor = 'text-destructive';
  } else if (totalScore <= 70) {
    zone = 'Zona de ajuste';
    zoneColor = 'text-warning';
  } else if (totalScore <= 85) {
    zone = 'Zona saudável';
    zoneColor = 'text-brand';
  } else {
    zone = 'Zona de longevidade ativa';
    zoneColor = 'text-success';
  }

  return {
    total: totalScore,
    subScores: {
      movement: movementScore,
      sleep: sleepScore,
      nutrition: nutritionScore,
      risk: riskScore,
    },
    zone,
    zoneColor,
    bmi,
    age,
  };
}

// Generate personalized actions
function generateActions(answers: Record<string, string>, scoreResult: ScoreResult): string[] {
  const actions: string[] = [];

  // Movement-based actions
  if (scoreResult.subScores.movement < 50) {
    if (answers.exercise_days_per_week === '0') {
      actions.push('Começar com 10 minutos de caminhada por dia, 3 vezes por semana');
    } else {
      actions.push('Aumentar um dia de exercício por semana');
    }
  }
  if (answers.sitting_hours_per_day === 'more_than_8h' || answers.sitting_hours_per_day === '6_to_8h') {
    actions.push('Levantar a cada hora e fazer 2 minutos de alongamento');
  }

  // Sleep-based actions
  if (scoreResult.subScores.sleep < 50) {
    if (answers.sleep_hours === 'less_than_5h' || answers.sleep_hours === '5_to_6h') {
      actions.push('Definir horário fixo para dormir e adicionar 30 minutos de sono');
    }
    if (answers.sleep_quality === 'poor') {
      actions.push('Desligar telas 1 hora antes de dormir');
    }
  }

  // Nutrition-based actions
  if (scoreResult.subScores.nutrition < 50) {
    if (answers.eating_habits === 'ultra_processed') {
      actions.push('Substituir 1 refeição processada por comida caseira');
    }
    if (answers.fruits_vegetables_daily === 'almost_none' || answers.fruits_vegetables_daily === '1_to_2') {
      actions.push('Adicionar uma fruta no café da manhã e vegetais no almoço');
    }
    if (answers.sugar_consumption === 'daily') {
      actions.push('Reduzir doces para 3 vezes por semana');
    }
  }
  if (answers.water_intake === 'less_than_1l' || answers.water_intake === '1_to_2l') {
    actions.push('Beber 500ml de água assim que acordar');
  }

  // Risk-based actions
  if (answers.smoking === 'daily' || answers.smoking === 'occasionally') {
    actions.push('Buscar ajuda profissional para parar de fumar');
  }
  if (answers.alcohol_consumption === '3_plus_week') {
    actions.push('Reduzir álcool para no máximo 2 vezes por semana');
  }

  // Goal-based actions
  if (answers.primary_goal === 'weight_loss' && scoreResult.bmi && scoreResult.bmi.value >= 25) {
    actions.push('Criar déficit calórico de 300-500 kcal com alimentação e exercício');
  }
  if (answers.primary_goal === 'performance') {
    actions.push('Priorizar sono de qualidade para melhor recuperação');
  }
  if (answers.primary_goal === 'health_longevity') {
    actions.push('Agendar checkup completo se não fez no último ano');
  }

  // Return top 5 actions
  return actions.slice(0, 5);
}

// Get current section info
function getCurrentSection(stepIndex: number): { name: string; progress: number } {
  let accumulated = 0;
  for (const section of sections) {
    if (stepIndex < accumulated + section.questions) {
      const sectionProgress = ((stepIndex - accumulated + 1) / section.questions) * 100;
      return { name: section.label, progress: sectionProgress };
    }
    accumulated += section.questions;
  }
  return { name: 'Email', progress: 100 };
}

export default function ScorePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Filter questions based on conditionals
  const activeQuestions = quizQuestions.filter((q) => {
    if (!q.conditional) return true;
    return answers[q.conditional.dependsOn] === q.conditional.showWhen;
  });

  const isEmailStep = currentStep >= activeQuestions.length;
  const totalSteps = activeQuestions.length + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentSection = getCurrentSection(currentStep);

  const currentQuestion = activeQuestions[currentStep];

  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setInputValue('');

    // Auto-advance after selection for select type
    setTimeout(() => {
      if (currentStep < activeQuestions.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 300);
  };

  const handleInputSubmit = () => {
    if (!currentQuestion || !inputValue.trim()) return;

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: inputValue.trim() }));
    setInputValue('');

    if (currentStep < activeQuestions.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setInputValue('');
    }
  };

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          source: 'score_quiz',
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar');
      }

      const result = calculateScore(answers);
      const generatedActions = generateActions(answers, result);

      setScoreResult(result);
      setActions(generatedActions);
      setShowResult(true);
    } catch {
      setSubmitError('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Result Screen
  if (showResult && scoreResult) {
    const userName = answers.name ? answers.name.split(' ')[0] : 'você';

    return (
      <div className="min-h-screen bg-background py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Badge variant="premium" className="mb-4">Resultado</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {userName}, seu Livvay Score
              </h1>
              <p className="text-foreground-light mb-2">
                Estimamos que seu score inicial é {scoreResult.total}
              </p>
              <p className={`text-lg font-semibold ${scoreResult.zoneColor}`}>
                {scoreResult.zone}
              </p>
            </div>

            {/* Main Score */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative flex justify-center mb-8"
            >
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center shadow-2xl shadow-brand/30">
                <div className="text-center">
                  <span className="text-5xl md:text-6xl font-bold text-background">
                    {scoreResult.total}
                  </span>
                  <p className="text-sm text-background/70 font-medium">de 100</p>
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-warning animate-pulse" />
            </motion.div>

            {/* Sub-scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Movimento', value: scoreResult.subScores.movement, icon: Activity },
                { label: 'Sono', value: scoreResult.subScores.sleep, icon: Moon },
                { label: 'Nutrição', value: scoreResult.subScores.nutrition, icon: Apple },
                { label: 'Risco', value: scoreResult.subScores.risk, icon: Heart },
              ].map((sub) => (
                <div key={sub.label} className="bg-surface-100 rounded-xl p-4 text-center border border-border">
                  <sub.icon className="w-5 h-5 mx-auto mb-2 text-brand" />
                  <p className="text-2xl font-bold text-foreground">{sub.value}</p>
                  <p className="text-xs text-foreground-muted">{sub.label}</p>
                </div>
              ))}
            </div>

            {/* BMI and Age */}
            {(scoreResult.bmi || scoreResult.age) && (
              <div className="flex justify-center gap-6 mb-8 text-sm text-foreground-muted">
                {scoreResult.age && <span>Idade: {scoreResult.age} anos</span>}
                {scoreResult.bmi && (
                  <span>IMC: {scoreResult.bmi.value} ({scoreResult.bmi.category})</span>
                )}
              </div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="bg-surface-100 border border-brand/30 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand" />
                  <span>Suas próximas ações</span>
                </h2>
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-background rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand font-bold">{index + 1}</span>
                      </div>
                      <p className="text-foreground">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button href="/plus" iconRight={<Users />} className="w-full">
                  Conhecer o Plus
                </Button>
                <Button href="/liga" type="default" iconRight={<Trophy />} className="w-full">
                  Entrar na Liga
                </Button>
              </div>
              <Button href="/" type="ghost" className="w-full">
                Voltar para o início
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="mt-8 text-xs text-foreground-muted text-center">
              O Livvay Score é uma estimativa baseada nas suas respostas. Não substitui avaliação médica profissional.
            </p>
          </motion.div>
        </Container>
      </div>
    );
  }

  // Quiz Steps
  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-foreground-muted mb-2">
              <span className="font-medium text-foreground">{currentSection.name}</span>
              <span>Pergunta {currentStep + 1} de {totalSteps}</span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-foreground-light hover:text-foreground transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          )}

          <AnimatePresence mode="wait">
            {!isEmailStep && currentQuestion ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {currentQuestion.question}
                </h1>
                {currentQuestion.subtitle && (
                  <p className="text-foreground-light mb-8">{currentQuestion.subtitle}</p>
                )}

                {/* Text Input */}
                {currentQuestion.type === 'text' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full px-4 py-4 bg-surface-100 border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                      autoFocus
                    />
                    <Button
                      onClick={handleInputSubmit}
                      disabled={!inputValue.trim()}
                      className="w-full"
                      iconRight={<ArrowRight />}
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Date Input */}
                {currentQuestion.type === 'date' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      <input
                        type="date"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-4 bg-surface-100 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-lg"
                      />
                    </div>
                    <Button
                      onClick={handleInputSubmit}
                      disabled={!inputValue}
                      className="w-full"
                      iconRight={<ArrowRight />}
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Number Input */}
                {currentQuestion.type === 'number' && (
                  <div className="space-y-4">
                    <div className="relative">
                      {currentQuestion.id === 'height_cm' && (
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      )}
                      {currentQuestion.id === 'weight_kg' && (
                        <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      )}
                      {currentQuestion.id === 'body_fat_percentage' && (
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      )}
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={currentQuestion.placeholder}
                        min={currentQuestion.min}
                        max={currentQuestion.max}
                        className="w-full pl-12 pr-16 py-4 bg-surface-100 border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                        autoFocus
                      />
                      {currentQuestion.unit && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                          {currentQuestion.unit}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleInputSubmit}
                      disabled={!inputValue}
                      className="w-full"
                      iconRight={<ArrowRight />}
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Select Options */}
                {currentQuestion.type === 'select' && currentQuestion.options && (
                  <div className="grid gap-4">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.value;
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                          className={`
                            flex items-center gap-4 p-5 rounded-xl border text-left transition-all
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
                            ${isSelected
                              ? 'bg-brand/10 border-brand'
                              : 'bg-surface-100 border-border hover:border-border-strong'
                            }
                          `}
                        >
                          {Icon && (
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              ${isSelected ? 'bg-brand/20' : 'bg-surface-200'}
                            `}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-brand' : 'text-foreground-light'}`} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${isSelected ? 'text-brand' : 'text-foreground'}`}>
                              {option.label}
                            </p>
                            {option.description && (
                              <p className="text-sm text-foreground-muted">{option.description}</p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-brand flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              // Email Capture Step
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-brand" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Quase lá, {answers.name ? answers.name.split(' ')[0] : 'você'}!
                  </h1>
                  <p className="text-foreground-light">
                    Receba seu Livvay Score completo + plano de ação personalizado
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4" noValidate>
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className={`
                          w-full pl-12 pr-4 py-4
                          bg-surface-100 border rounded-xl
                          text-foreground placeholder-foreground-muted
                          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
                          text-lg
                          ${errors.email ? 'border-destructive' : 'border-border'}
                        `}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-2">{errors.email.message}</p>
                    )}
                    {submitError && (
                      <p className="text-destructive text-sm mt-2">{submitError}</p>
                    )}
                  </div>

                  <Button
                    htmlType="submit"
                    loading={isSubmitting}
                    className="w-full"
                    size="large"
                    iconRight={<ArrowRight />}
                  >
                    Ver meu resultado
                  </Button>

                  <p className="text-xs text-foreground-muted text-center">
                    Ao continuar, você concorda com nossa{' '}
                    <a href="/privacidade" className="text-brand hover:underline">
                      política de privacidade
                    </a>
                    .
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}
