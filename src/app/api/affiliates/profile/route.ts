import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  validateCPF,
  validatePhone,
  validateCEP,
  validateMinAge,
  unformatCPF,
  unformatPhone,
  unformatCEP,
} from '@/lib/validators/brazilian';

/**
 * Profile schema for validation
 */
const profileSchema = z.object({
  full_name: z
    .string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  phone: z
    .string()
    .refine((val) => validatePhone(val), { message: 'Telefone inválido' })
    .transform((val) => unformatPhone(val)),
  birth_date: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: 'Data de nascimento inválida' })
    .refine((val) => validateMinAge(val, 18), { message: 'Você deve ter pelo menos 18 anos' }),
  cpf: z
    .string()
    .refine((val) => validateCPF(val), { message: 'CPF inválido' })
    .transform((val) => unformatCPF(val)),
  rg: z
    .string()
    .min(1, { message: 'RG é obrigatório' })
    .max(20, { message: 'RG deve ter no máximo 20 caracteres' }),
  postal_code: z
    .string()
    .refine((val) => validateCEP(val), { message: 'CEP inválido' })
    .transform((val) => unformatCEP(val)),
  street: z
    .string()
    .min(1, { message: 'Rua é obrigatória' })
    .max(200, { message: 'Rua deve ter no máximo 200 caracteres' }),
  number: z
    .string()
    .min(1, { message: 'Número é obrigatório' })
    .max(20, { message: 'Número deve ter no máximo 20 caracteres' }),
  complement: z
    .string()
    .max(100, { message: 'Complemento deve ter no máximo 100 caracteres' })
    .optional()
    .nullable(),
  neighborhood: z
    .string()
    .min(1, { message: 'Bairro é obrigatório' })
    .max(100, { message: 'Bairro deve ter no máximo 100 caracteres' }),
  city: z
    .string()
    .min(1, { message: 'Cidade é obrigatória' })
    .max(100, { message: 'Cidade deve ter no máximo 100 caracteres' }),
  state: z
    .string()
    .length(2, { message: 'Estado deve ter 2 caracteres (UF)' })
    .transform((val) => val.toUpperCase()),
  country: z
    .string()
    .default('Brasil'),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * GET /api/affiliates/profile
 * Gets the profile for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('[Profile] Error fetching profile:', error);
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
    }

    // Return profile or null if not found
    return NextResponse.json({
      profile: profile || null,
      email: user.email,
    });
  } catch (error) {
    console.error('[Profile] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/affiliates/profile
 * Creates or updates the profile for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      );
    }

    const profileData = result.data;

    // Check if CPF is already used by another user
    const { data: existingCPF } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('cpf', profileData.cpf)
      .neq('user_id', user.id)
      .single();

    if (existingCPF) {
      return NextResponse.json(
        { error: 'CPF já cadastrado por outro usuário', field: 'cpf' },
        { status: 409 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profile;
    let error;

    if (existingProfile) {
      // Update existing profile
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      profile = data;
      error = updateError;
    } else {
      // Insert new profile
      const { data, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
        })
        .select()
        .single();

      profile = data;
      error = insertError;
    }

    if (error) {
      // Handle unique constraint violation for CPF
      if (error.code === '23505' && error.message?.includes('cpf')) {
        return NextResponse.json(
          { error: 'CPF já cadastrado por outro usuário', field: 'cpf' },
          { status: 409 }
        );
      }
      console.error('[Profile] Error saving profile:', error);
      return NextResponse.json({ error: 'Erro ao salvar perfil' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Perfil salvo com sucesso',
      profile,
    });
  } catch (error) {
    console.error('[Profile] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
