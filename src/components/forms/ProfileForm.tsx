'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { useCepLookup } from '@/hooks/use-cep-lookup';
import {
  validateCPF,
  validatePhone,
  validateCEP,
  validateMinAge,
  formatCPF,
  formatPhone,
  formatCEP,
  unformatCPF,
  unformatPhone,
  unformatCEP,
  BRAZILIAN_STATES,
} from '@/lib/validators/brazilian';

// ============================================
// Schema
// ============================================

const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: z
    .string()
    .refine((val) => validatePhone(val), 'Telefone inválido'),
  birth_date: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Data de nascimento inválida')
    .refine((val) => validateMinAge(val, 18), 'Você deve ter pelo menos 18 anos'),
  cpf: z
    .string()
    .refine((val) => validateCPF(val), 'CPF inválido'),
  rg: z
    .string()
    .min(1, 'RG é obrigatório')
    .max(20, 'RG deve ter no máximo 20 caracteres'),
  postal_code: z
    .string()
    .refine((val) => validateCEP(val), 'CEP inválido'),
  street: z
    .string()
    .min(1, 'Rua é obrigatória')
    .max(200, 'Rua deve ter no máximo 200 caracteres'),
  number: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(20, 'Número deve ter no máximo 20 caracteres'),
  complement: z
    .string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional(),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (UF)'),
  country: z
    .string()
    .min(1, 'País é obrigatório'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================
// Types
// ============================================

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

interface ProfileFormProps {
  initialData?: ProfileData | null;
  onSuccess?: () => void;
}

// ============================================
// Styles (matching login-form pattern)
// ============================================

const inputStyles =
  'w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

const selectStyles =
  'w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none';

// ============================================
// Component
// ============================================

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isLoading: isCepLoading, error: cepError, lookupCEP } = useCepLookup();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      phone: initialData?.phone ? formatPhone(initialData.phone) : '',
      birth_date: initialData?.birth_date || '',
      cpf: initialData?.cpf ? formatCPF(initialData.cpf) : '',
      rg: initialData?.rg || '',
      postal_code: initialData?.postal_code ? formatCEP(initialData.postal_code) : '',
      street: initialData?.street || '',
      number: initialData?.number || '',
      complement: initialData?.complement || '',
      neighborhood: initialData?.neighborhood || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || 'Brasil',
    },
  });

  // Handle CEP lookup
  const handleCepChange = useCallback(
    async (value: string) => {
      const formatted = formatCEP(value);
      setValue('postal_code', formatted);

      const cleanCep = unformatCEP(value);
      if (cleanCep.length === 8) {
        const address = await lookupCEP(cleanCep);
        if (address) {
          setValue('street', address.street);
          setValue('neighborhood', address.neighborhood);
          setValue('city', address.city);
          setValue('state', address.state);
        }
      }
    },
    [lookupCEP, setValue]
  );

  // Handle CPF formatting
  const handleCpfChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value);
      setValue('cpf', formatted);
    },
    [setValue]
  );

  // Handle phone formatting
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setValue('phone', formatted);
    },
    [setValue]
  );

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...data,
        cpf: unformatCPF(data.cpf),
        phone: unformatPhone(data.phone),
        postal_code: unformatCEP(data.postal_code),
        state: data.state.toUpperCase(),
      };

      const response = await fetch('/api/affiliates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar perfil');
      }

      setSuccess('Perfil salvo com sucesso!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Feedback messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-brand/10 border border-brand/30 rounded-xl">
          <p className="text-brand text-sm">{success}</p>
        </div>
      )}

      {/* Personal information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-foreground">Informações pessoais</h3>
          <p className="text-sm text-foreground-light mt-1">Dados básicos do seu cadastro</p>
        </div>

        <div className="grid gap-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="full_name" className="text-foreground mb-2">
              Nome completo
            </Label>
            <input
              id="full_name"
              type="text"
              {...register('full_name')}
              placeholder="Seu nome completo"
              className={inputStyles}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-destructive text-xs mt-1.5">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone and Birth Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-foreground mb-2">
                Telefone
              </Label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={inputStyles}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-destructive text-xs mt-1.5">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birth_date" className="text-foreground mb-2">
                Data de nascimento
              </Label>
              <input
                id="birth_date"
                type="date"
                {...register('birth_date')}
                className={inputStyles}
                aria-invalid={!!errors.birth_date}
              />
              {errors.birth_date && (
                <p className="text-destructive text-xs mt-1.5">{errors.birth_date.message}</p>
              )}
            </div>
          </div>

          {/* CPF and RG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf" className="text-foreground mb-2">
                CPF
              </Label>
              <input
                id="cpf"
                type="text"
                {...register('cpf')}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className={inputStyles}
                aria-invalid={!!errors.cpf}
              />
              {errors.cpf && (
                <p className="text-destructive text-xs mt-1.5">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="rg" className="text-foreground mb-2">
                RG
              </Label>
              <input
                id="rg"
                type="text"
                {...register('rg')}
                placeholder="Número do RG"
                maxLength={20}
                className={inputStyles}
                aria-invalid={!!errors.rg}
              />
              {errors.rg && (
                <p className="text-destructive text-xs mt-1.5">{errors.rg.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Address */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-foreground">Endereço</h3>
          <p className="text-sm text-foreground-light mt-1">Informe seu endereço completo</p>
        </div>

        <div className="grid gap-4">
          {/* CEP */}
          <div className="max-w-xs">
            <Label htmlFor="postal_code" className="text-foreground mb-2">
              CEP
            </Label>
            <div className="relative">
              <input
                id="postal_code"
                type="text"
                {...register('postal_code')}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className={inputStyles}
                aria-invalid={!!errors.postal_code}
              />
              {isCepLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted animate-spin" />
              )}
            </div>
            {errors.postal_code && (
              <p className="text-destructive text-xs mt-1.5">{errors.postal_code.message}</p>
            )}
            {cepError && (
              <p className="text-destructive text-xs mt-1.5">{cepError}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <Label htmlFor="street" className="text-foreground mb-2">
              Rua
            </Label>
            <input
              id="street"
              type="text"
              {...register('street')}
              placeholder="Nome da rua"
              disabled={isCepLoading}
              className={inputStyles}
              aria-invalid={!!errors.street}
            />
            {errors.street && (
              <p className="text-destructive text-xs mt-1.5">{errors.street.message}</p>
            )}
          </div>

          {/* Number and Complement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number" className="text-foreground mb-2">
                Número
              </Label>
              <input
                id="number"
                type="text"
                {...register('number')}
                placeholder="123"
                maxLength={20}
                className={inputStyles}
                aria-invalid={!!errors.number}
              />
              {errors.number && (
                <p className="text-destructive text-xs mt-1.5">{errors.number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="complement" className="text-foreground mb-2">
                Complemento{' '}
                <span className="text-foreground-muted font-normal">(opcional)</span>
              </Label>
              <input
                id="complement"
                type="text"
                {...register('complement')}
                placeholder="Apto, bloco, etc."
                maxLength={100}
                className={inputStyles}
                aria-invalid={!!errors.complement}
              />
              {errors.complement && (
                <p className="text-destructive text-xs mt-1.5">{errors.complement.message}</p>
              )}
            </div>
          </div>

          {/* Neighborhood */}
          <div>
            <Label htmlFor="neighborhood" className="text-foreground mb-2">
              Bairro
            </Label>
            <input
              id="neighborhood"
              type="text"
              {...register('neighborhood')}
              placeholder="Nome do bairro"
              disabled={isCepLoading}
              className={inputStyles}
              aria-invalid={!!errors.neighborhood}
            />
            {errors.neighborhood && (
              <p className="text-destructive text-xs mt-1.5">{errors.neighborhood.message}</p>
            )}
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-foreground mb-2">
                Cidade
              </Label>
              <input
                id="city"
                type="text"
                {...register('city')}
                placeholder="Nome da cidade"
                disabled={isCepLoading}
                className={inputStyles}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="text-destructive text-xs mt-1.5">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="text-foreground mb-2">
                Estado
              </Label>
              <div className="relative">
                <select
                  id="state"
                  {...register('state')}
                  disabled={isCepLoading}
                  className={selectStyles}
                  aria-invalid={!!errors.state}
                >
                  <option value="">Selecione o estado</option>
                  {BRAZILIAN_STATES.map((s) => (
                    <option key={s.uf} value={s.uf}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="h-4 w-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.state && (
                <p className="text-destructive text-xs mt-1.5">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="max-w-xs">
            <Label htmlFor="country" className="text-foreground mb-2">
              País
            </Label>
            <input
              id="country"
              type="text"
              {...register('country')}
              placeholder="País"
              className={inputStyles}
              aria-invalid={!!errors.country}
            />
            {errors.country && (
              <p className="text-destructive text-xs mt-1.5">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
