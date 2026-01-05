-- Migration: Add default role on user signup
-- Description: Sets app_metadata.role = 'afiliado' for all new users
-- Run this in your Supabase SQL Editor or via migrations

-- Create or replace the function that sets the default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default role to 'afiliado' in app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "afiliado"}'::jsonb
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run after user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Optional: Update existing users without a role to have 'afiliado' role
-- Uncomment the following lines if you want to backfill existing users
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "afiliado"}'::jsonb
-- WHERE raw_app_meta_data->>'role' IS NULL;

COMMENT ON FUNCTION public.handle_new_user() IS 'Sets default role to afiliado for new users on signup';
