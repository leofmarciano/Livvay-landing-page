import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get redirect destination (prevent open redirect via protocol-relative URLs)
  const _next = searchParams.get('next');
  const next = _next?.startsWith('/') && !_next.startsWith('//') ? _next : '/afiliados';

  // Check for error in URL (from Supabase redirect)
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  if (error) {
    redirect(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`);
  }

  const supabase = await createClient();

  // Handle PKCE flow (code parameter)
  const code = searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Handle token hash flow (token_hash + type parameters)
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // No valid confirmation parameters
  redirect('/auth/error?error=Link de confirmação inválido');
}
