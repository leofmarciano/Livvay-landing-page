import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// This should ONLY be used in server-side code (API routes, server components)
// The service role key bypasses RLS and has full access
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
