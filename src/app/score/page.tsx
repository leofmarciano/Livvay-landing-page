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
  Shield,
  Clock,
  Utensils,
  Bed,
  Heart,
  Watch,
  Users,
  Mail,
  CheckCircle,
  Sparkles,
  Target,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Quiz questions data
const quizSteps = [
  {
    id: 'goal',
    question: 'Você quer otimizar o que primeiro?',
    options: [
      { value: 'sono', label: 'Sono', icon: Moon, description: 'Dormir melhor e acordar descansado' },
      { value: 'energia', label: 'Energia', icon: Zap, description: 'Mais disposição no dia a dia' },
      { value: 'emagrecimento', label: 'Emagrecimento', icon: Scale, description: 'Perder peso de forma saudável' },
      { value: 'performance', label: 'Performance', icon: Trophy, description: 'Melhorar nos treinos e trabalho' },
      { value: 'estresse', label: 'Estresse', icon: Brain, description: 'Reduzir ansiedade e tensão' },
      { value: 'prevencao', label: 'Prevenção', icon: Shield, description: 'Cuidar antes de ter problemas' },
    ],
  },
  {
    id: 'routine',
    question: 'Sua rotina é como?',
    options: [
      { value: 'caotica', label: 'Caótica', icon: Clock, description: 'Cada dia é diferente, sem padrão' },
      { value: 'normal', label: 'Normal', icon: Target, description: 'Tem estrutura mas com imprevistos' },
      { value: 'organizada', label: 'Bem organizada', icon: CheckCircle, description: 'Horários definidos e rotina clara' },
    ],
  },
  {
    id: 'saboteur',
    question: 'Seu maior sabotador?',
    options: [
      { value: 'fome-emocional', label: 'Fome emocional', icon: Utensils, description: 'Comer por ansiedade ou tédio' },
      { value: 'falta-tempo', label: 'Falta de tempo', icon: Clock, description: 'Nunca sobra tempo pra cuidar de mim' },
      { value: 'preguica', label: 'Preguiça', icon: Bed, description: 'Sei o que fazer mas não faço' },
      { value: 'ansiedade', label: 'Ansiedade', icon: Brain, description: 'Mente acelerada atrapalha tudo' },
      { value: 'sono-ruim', label: 'Sono ruim', icon: Moon, description: 'Não descanso direito' },
    ],
  },
  {
    id: 'wearable',
    question: 'Você usa wearable?',
    subtitle: 'Relógio, pulseira ou anel inteligente',
    options: [
      { value: 'sim', label: 'Sim', icon: Watch, description: 'Apple Watch, Garmin, Oura, etc.' },
      { value: 'nao', label: 'Não', icon: Heart, description: 'Só celular mesmo' },
    ],
  },
  {
    id: 'plus',
    question: 'Quer Plus com equipe médica?',
    subtitle: 'Nutricionista, médico e psicólogo acompanhando você',
    options: [
      { value: 'sim', label: 'Sim', icon: Users, description: 'Quero acompanhamento profissional' },
      { value: 'talvez', label: 'Talvez', icon: Target, description: 'Preciso entender melhor' },
      { value: 'nao', label: 'Não', icon: CheckCircle, description: 'Só a AI por enquanto' },
    ],
  },
];

// Email validation schema
const emailSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

type EmailFormData = z.infer<typeof emailSchema>;

// Score calculation function
// Formula: Base score + bonuses based on answers
// - Goal selection: +50-100 points based on specificity
// - Routine: Organized +80, Normal +50, Chaotic +20
// - Saboteur awareness: +30 (self-awareness bonus)
// - Wearable: Yes +40 (data advantage)
// - Plus interest: Yes +30, Maybe +15 (commitment indicator)
function calculateScore(answers: Record<string, string>): number {
  let score = 500; // Base score

  // Goal bonus (all goals indicate intentionality)
  const goalBonuses: Record<string, number> = {
    sono: 80,
    energia: 70,
    emagrecimento: 60,
    performance: 90,
    estresse: 75,
    prevencao: 100, // Prevention shows long-term thinking
  };
  score += goalBonuses[answers.goal] || 70;

  // Routine bonus
  const routineBonuses: Record<string, number> = {
    caotica: 20,
    normal: 50,
    organizada: 80,
  };
  score += routineBonuses[answers.routine] || 40;

  // Self-awareness bonus (knowing your saboteur)
  score += 30;

  // Wearable bonus
  if (answers.wearable === 'sim') {
    score += 40;
  }

  // Plus interest bonus
  const plusBonuses: Record<string, number> = {
    sim: 30,
    talvez: 15,
    nao: 0,
  };
  score += plusBonuses[answers.plus] || 0;

  // Add some deterministic variation based on answers
  const answerString = Object.values(answers).join('');
  let hash = 0;
  for (let i = 0; i < answerString.length; i++) {
    hash = ((hash << 5) - hash) + answerString.charCodeAt(i);
    hash = hash & hash;
  }
  score += Math.abs(hash % 50);

  return Math.min(999, Math.max(100, score));
}

// Generate actions based on answers
function generateActions(answers: Record<string, string>): string[] {
  const actions: string[] = [];

  // Action based on goal
  const goalActions: Record<string, string> = {
    sono: 'Definir horário fixo para dormir (mesmo no fim de semana)',
    energia: 'Tomar 500ml de água assim que acordar',
    emagrecimento: 'Registrar tudo que comer amanhã (sem julgamento)',
    performance: 'Fazer 10 minutos de movimento antes das 9h',
    estresse: 'Praticar 3 respirações profundas antes de cada refeição',
    prevencao: 'Agendar checkup básico se não fez no último ano',
  };
  actions.push(goalActions[answers.goal] || 'Escolher um hábito pequeno para começar');

  // Action based on saboteur
  const saboteurActions: Record<string, string> = {
    'fome-emocional': 'Antes de comer fora de hora, esperar 10 minutos',
    'falta-tempo': 'Bloquear 15 minutos no calendário só pra você',
    preguica: 'Preparar roupas/equipamentos na noite anterior',
    ansiedade: 'Anotar 3 coisas que preocupam antes de dormir',
    'sono-ruim': 'Desligar telas 30 minutos antes de dormir',
  };
  actions.push(saboteurActions[answers.saboteur] || 'Identificar o padrão que mais atrapalha');

  // Third action based on routine
  if (answers.routine === 'caotica') {
    actions.push('Escolher 1 horário fixo por dia (café da manhã ou jantar)');
  } else if (answers.routine === 'normal') {
    actions.push('Adicionar 1 check-in de como você está se sentindo');
  } else {
    actions.push('Testar uma micro-otimização na rotina já existente');
  }

  return actions;
}

export default function ScorePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [actions, setActions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const isEmailStep = currentStep === quizSteps.length;
  const progress = ((currentStep + 1) / (quizSteps.length + 1)) * 100;

  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < quizSteps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
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
          source: 'score',
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar');
      }

      // Calculate score and actions
      const calculatedScore = calculateScore(answers);
      const generatedActions = generateActions(answers);

      setScore(calculatedScore);
      setActions(generatedActions);
      setShowResult(true);
    } catch {
      setSubmitError('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Result Screen
  if (showResult && score !== null) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            {/* Score Display */}
            <div className="text-center mb-12">
              <Badge variant="premium" className="mb-4">Resultado</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Seu Livvay Score inicial
              </h1>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative inline-block"
              >
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C853] flex items-center justify-center shadow-2xl shadow-[#00E676]/30">
                  <div className="text-center">
                    <span className="text-5xl md:text-6xl font-bold text-[#0A0A0B]">
                      {score}
                    </span>
                    <p className="text-sm text-[#0A0A0B]/70 font-medium">pontos</p>
                  </div>
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-[#EAB308] animate-pulse" />
              </motion.div>

              <p className="mt-6 text-[#A1A1AA] max-w-md mx-auto">
                Este é seu ponto de partida. Com consistência e o método Livvay, 
                esse número vai subir — e sua saúde também.
              </p>
            </div>

            {/* Actions */}
            <Card variant="highlight" className="mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00E676]" />
                3 ações para amanhã
              </h2>
              <div className="space-y-4">
                {actions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-[#0A0A0B] rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#00E676]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00E676] font-bold">{index + 1}</span>
                    </div>
                    <p className="text-white">{action}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* CTAs */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button href="/plus" className="w-full">
                  Conhecer o Plus
                  <Users className="w-4 h-4" />
                </Button>
                <Button href="/liga" variant="secondary" className="w-full">
                  Entrar na Liga
                  <Trophy className="w-4 h-4" />
                </Button>
              </div>
              <Button href="/" variant="ghost" className="w-full">
                Voltar para o início
              </Button>
            </div>

            {/* Note */}
            <p className="mt-8 text-xs text-[#71717A] text-center">
              O Livvay Score é uma estimativa baseada nas suas respostas para 
              orientar seu plano. Não substitui avaliação médica.
            </p>
          </motion.div>
        </Container>
      </div>
    );
  }

  // Quiz Steps
  return (
    <div className="min-h-screen bg-[#0A0A0B] py-8 md:py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-[#71717A] mb-2">
              <span>Passo {currentStep + 1} de {quizSteps.length + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[#27272A] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00E676] rounded-full"
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
              className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}

          <AnimatePresence mode="wait">
            {!isEmailStep ? (
              // Quiz Question
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {quizSteps[currentStep].question}
                </h1>
                {quizSteps[currentStep].subtitle && (
                  <p className="text-[#A1A1AA] mb-8">
                    {quizSteps[currentStep].subtitle}
                  </p>
                )}

                <div className="grid gap-4">
                  {quizSteps[currentStep].options.map((option) => {
                    const isSelected = answers[quizSteps[currentStep].id] === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(quizSteps[currentStep].id, option.value)}
                        className={`
                          flex items-center gap-4 p-5 rounded-xl border text-left transition-all
                          ${isSelected
                            ? 'bg-[#00E676]/10 border-[#00E676]'
                            : 'bg-[#111113] border-[#27272A] hover:border-[#3F3F46]'
                          }
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isSelected ? 'bg-[#00E676]/20' : 'bg-[#1A1A1D]'}
                        `}>
                          <option.icon className={`w-6 h-6 ${isSelected ? 'text-[#00E676]' : 'text-[#A1A1AA]'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? 'text-[#00E676]' : 'text-white'}`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-[#71717A]">{option.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-[#00E676] ml-auto flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
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
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#00E676]" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Quase lá!
                  </h1>
                  <p className="text-[#A1A1AA]">
                    Receba seu resultado + plano base de 7 dias
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                        className={`
                          w-full pl-12 pr-4 py-4 
                          bg-[#111113] border rounded-xl
                          text-white placeholder-[#71717A]
                          focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent
                          text-lg
                          ${errors.email ? 'border-[#EF4444]' : 'border-[#27272A]'}
                        `}
                        aria-label="Email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[#EF4444] text-sm mt-2" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                    {submitError && (
                      <p className="text-[#EF4444] text-sm mt-2" role="alert">
                        {submitError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    Ver meu resultado
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  <p className="text-xs text-[#71717A] text-center">
                    Ao continuar, você concorda com nossa{' '}
                    <a href="/privacidade" className="text-[#00E676] hover:underline">
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

