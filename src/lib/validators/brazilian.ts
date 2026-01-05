/**
 * Brazilian document validators and formatters
 * CPF, Phone, CEP validation and formatting
 */

// ============================================
// CPF Validation and Formatting
// ============================================

/**
 * Validates a Brazilian CPF using the check digit algorithm
 * @param cpf - CPF string (with or without formatting)
 * @returns boolean indicating if CPF is valid
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');

  // Must have 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formats CPF to standard format: 000.000.000-00
 * @param cpf - CPF string (digits only or partially formatted)
 * @returns Formatted CPF string
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length <= 3) {
    return cleanCPF;
  }
  if (cleanCPF.length <= 6) {
    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
  }
  if (cleanCPF.length <= 9) {
    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
  }
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
}

/**
 * Removes formatting from CPF, returning only digits
 * @param cpf - Formatted CPF string
 * @returns Digits only
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

// ============================================
// Phone Validation and Formatting
// ============================================

/**
 * Validates a Brazilian phone number
 * Accepts both mobile (9 digits) and landline (8 digits) formats
 * @param phone - Phone string (with or without formatting)
 * @returns boolean indicating if phone is valid
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');

  // Brazilian phones: 10 digits (landline) or 11 digits (mobile)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    return false;
  }

  // DDD must be between 11-99
  const ddd = parseInt(cleanPhone.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  // If 11 digits, first digit after DDD must be 9 (mobile)
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') {
    return false;
  }

  return true;
}

/**
 * Formats phone to standard format: (00) 00000-0000 or (00) 0000-0000
 * @param phone - Phone string (digits only or partially formatted)
 * @returns Formatted phone string
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length <= 2) {
    return cleanPhone.length > 0 ? `(${cleanPhone}` : '';
  }
  if (cleanPhone.length <= 6) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  }
  if (cleanPhone.length <= 10) {
    // Landline: (00) 0000-0000
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  // Mobile: (00) 00000-0000
  return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`;
}

/**
 * Removes formatting from phone, returning only digits
 * @param phone - Formatted phone string
 * @returns Digits only
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ============================================
// CEP Validation and Formatting
// ============================================

/**
 * Validates a Brazilian CEP (postal code)
 * @param cep - CEP string (with or without formatting)
 * @returns boolean indicating if CEP format is valid
 */
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

/**
 * Formats CEP to standard format: 00000-000
 * @param cep - CEP string (digits only or partially formatted)
 * @returns Formatted CEP string
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');

  if (cleanCEP.length <= 5) {
    return cleanCEP;
  }
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`;
}

/**
 * Removes formatting from CEP, returning only digits
 * @param cep - Formatted CEP string
 * @returns Digits only
 */
export function unformatCEP(cep: string): string {
  return cep.replace(/\D/g, '');
}

// ============================================
// Date/Age Utilities
// ============================================

/**
 * Calculates age from birth date
 * @param birthDate - Birth date string (YYYY-MM-DD) or Date object
 * @returns Age in years
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validates if birth date makes user at least minAge years old
 * @param birthDate - Birth date string (YYYY-MM-DD) or Date object
 * @param minAge - Minimum age required (default: 18)
 * @returns boolean indicating if user meets minimum age
 */
export function validateMinAge(birthDate: string | Date, minAge: number = 18): boolean {
  return calculateAge(birthDate) >= minAge;
}

// ============================================
// Brazilian States
// ============================================

export const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const;

export type BrazilianState = (typeof BRAZILIAN_STATES)[number]['uf'];
