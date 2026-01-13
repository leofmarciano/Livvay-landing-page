import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentClinicProfile, upsertClinicProfile } from '@/lib/rbac/server';
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
 * GET /api/clinic/profile
 * Returns the current user's clinic profile.
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

    const profile = await getCurrentClinicProfile();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching clinic profile:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Validation schema for clinic profile
const clinicProfileSchema = z.object({
  // Professional information
  professional_type: z.enum(['doctor', 'nutritionist', 'therapist']),
  license_number: z.string().min(1).max(50),
  specialty: z.string().max(100).optional(),
  clinic_name: z.string().max(200).optional(),

  // Personal information
  full_name: z.string().min(3).max(100),
  phone: z.string().refine((val) => validatePhone(val), 'Telefone inválido'),
  birth_date: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Data de nascimento inválida')
    .refine((val) => validateMinAge(val, 18), 'Você deve ter pelo menos 18 anos'),
  cpf: z.string().refine((val) => validateCPF(val), 'CPF inválido'),
  rg: z.string().min(1).max(20),

  // Address
  postal_code: z.string().refine((val) => validateCEP(val), 'CEP inválido'),
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  country: z.string().min(1),
});

/**
 * PUT /api/clinic/profile
 * Creates or updates the current user's clinic profile.
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = clinicProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Upsert clinic profile
    const result = await upsertClinicProfile({
      userId: user.id,
      // Professional info
      professionalType: data.professional_type,
      licenseNumber: data.license_number,
      specialty: data.specialty || undefined,
      clinicName: data.clinic_name || undefined,
      // Personal info (unformat before saving)
      fullName: data.full_name,
      phone: unformatPhone(data.phone),
      birthDate: data.birth_date,
      cpf: unformatCPF(data.cpf),
      rg: data.rg,
      // Address (unformat CEP before saving)
      postalCode: unformatCEP(data.postal_code),
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state.toUpperCase(),
      country: data.country,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Perfil salvo com sucesso',
      profile: result.profile,
    });
  } catch (error) {
    console.error('Error saving clinic profile:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
