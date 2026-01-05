-- ============================================
-- RBAC Tables Migration
-- Livvay - Role-Based Access Control System
-- ============================================

-- 1. Roles Table
-- Defines available roles with hierarchy levels
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  level INT NOT NULL DEFAULT 0,
  is_isolated BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (name, label, level, is_isolated, description) VALUES
  ('admin', 'Administrator', 100, false, 'Full system access'),
  ('finance', 'Finance', 80, false, 'Financial operations and reports'),
  ('support', 'Support & Risk', 60, false, 'Customer support and risk management'),
  ('affiliate', 'Affiliate', 40, false, 'Affiliate program access'),
  ('clinic', 'Clinic', 0, true, 'Clinic management - isolated access')
ON CONFLICT (name) DO NOTHING;

-- 2. User Roles Table
-- Links users to their assigned roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);

-- 3. Permissions Table
-- Defines granular permissions for resources
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default permissions
INSERT INTO public.permissions (name, resource, action, description) VALUES
  -- User management
  ('users.read', 'users', 'read', 'View user list and details'),
  ('users.write', 'users', 'write', 'Create and update users'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.roles', 'users', 'roles', 'Manage user roles'),

  -- Patient management (clinic)
  ('patients.read', 'patients', 'read', 'View patient list and details'),
  ('patients.write', 'patients', 'write', 'Create and update patients'),
  ('patients.delete', 'patients', 'delete', 'Delete patients'),

  -- Appointments (clinic)
  ('appointments.read', 'appointments', 'read', 'View appointments'),
  ('appointments.write', 'appointments', 'write', 'Create and update appointments'),
  ('appointments.delete', 'appointments', 'delete', 'Cancel appointments'),

  -- Reports
  ('reports.read', 'reports', 'read', 'View reports'),
  ('reports.export', 'reports', 'export', 'Export reports'),

  -- Financial
  ('payments.read', 'payments', 'read', 'View payment history'),
  ('payments.write', 'payments', 'write', 'Process payments'),
  ('payments.refund', 'payments', 'refund', 'Process refunds'),

  -- Support tickets
  ('tickets.read', 'tickets', 'read', 'View support tickets'),
  ('tickets.write', 'tickets', 'write', 'Create and respond to tickets'),
  ('tickets.close', 'tickets', 'close', 'Close tickets'),

  -- Affiliate
  ('affiliate.links', 'affiliate', 'links', 'Manage affiliate links'),
  ('affiliate.earnings', 'affiliate', 'earnings', 'View earnings'),

  -- Audit
  ('audit.read', 'audit', 'read', 'View audit logs'),

  -- Settings
  ('settings.read', 'settings', 'read', 'View system settings'),
  ('settings.write', 'settings', 'write', 'Update system settings')
ON CONFLICT (name) DO NOTHING;

-- 4. Role Permissions Table
-- Links roles to their permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Finance role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'finance'
  AND p.name IN (
    'payments.read', 'payments.write', 'payments.refund',
    'reports.read', 'reports.export',
    'users.read'
  )
ON CONFLICT DO NOTHING;

-- Support role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'support'
  AND p.name IN (
    'tickets.read', 'tickets.write', 'tickets.close',
    'users.read'
  )
ON CONFLICT DO NOTHING;

-- Affiliate role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'affiliate'
  AND p.name IN (
    'affiliate.links', 'affiliate.earnings'
  )
ON CONFLICT DO NOTHING;

-- Clinic role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'clinic'
  AND p.name IN (
    'patients.read', 'patients.write', 'patients.delete',
    'appointments.read', 'appointments.write', 'appointments.delete'
  )
ON CONFLICT DO NOTHING;

-- 5. Audit Log Table
-- Tracks important actions for compliance
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource, resource_id);

-- 6. View: User with Roles
-- Convenient view for querying user role information
CREATE OR REPLACE VIEW public.user_with_roles AS
SELECT
  u.id,
  u.email,
  u.raw_app_meta_data,
  u.created_at as user_created_at,
  COALESCE(
    (SELECT r.name FROM public.user_roles ur
     JOIN public.roles r ON ur.role_id = r.id
     WHERE ur.user_id = u.id
     ORDER BY r.level DESC LIMIT 1),
    'affiliate'
  ) as primary_role,
  COALESCE(
    (SELECT r.label FROM public.user_roles ur
     JOIN public.roles r ON ur.role_id = r.id
     WHERE ur.user_id = u.id
     ORDER BY r.level DESC LIMIT 1),
    'Affiliate'
  ) as primary_role_label,
  COALESCE(
    ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL),
    ARRAY['affiliate']::TEXT[]
  ) as all_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.raw_app_meta_data, u.created_at;

-- 7. Function: Check Permission
-- Checks if a user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
  p_user_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Admin always has all permissions
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Check specific permission
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id AND p.name = p_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. Function: Check Role Access
-- Checks if a user has access based on role hierarchy
CREATE OR REPLACE FUNCTION public.has_role_access(
  p_user_id UUID,
  p_required_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role RECORD;
  v_required_role RECORD;
BEGIN
  -- Get required role info
  SELECT * INTO v_required_role FROM public.roles WHERE name = p_required_role;
  IF v_required_role IS NULL THEN
    RETURN false;
  END IF;

  -- Get user's highest role
  SELECT r.* INTO v_user_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  ORDER BY r.level DESC
  LIMIT 1;

  -- No role assigned, default to affiliate
  IF v_user_role IS NULL THEN
    SELECT * INTO v_user_role FROM public.roles WHERE name = 'affiliate';
  END IF;

  -- Admin has access to everything
  IF v_user_role.name = 'admin' THEN
    RETURN true;
  END IF;

  -- Isolated roles (clinic) can only access their own routes
  IF v_required_role.is_isolated THEN
    RETURN v_user_role.name = v_required_role.name;
  END IF;

  -- Isolated user roles can't access non-isolated routes
  IF v_user_role.is_isolated THEN
    RETURN false;
  END IF;

  -- Standard hierarchy check
  RETURN v_user_role.level >= v_required_role.level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Function: Get User Permissions
-- Returns all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  name TEXT,
  resource TEXT,
  action TEXT
) AS $$
BEGIN
  -- Admin gets all permissions
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = 'admin'
  ) THEN
    RETURN QUERY SELECT p.name, p.resource, p.action FROM public.permissions p;
    RETURN;
  END IF;

  -- Return permissions based on assigned roles
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 10. Function: Log Audit Entry
-- Helper function to create audit log entries
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource, p_resource_id, p_details)
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Roles: Everyone can read roles
CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT USING (true);

-- Roles: Only admins can modify
CREATE POLICY "roles_admin_all" ON public.roles
  FOR ALL USING (public.has_permission(auth.uid(), 'settings.write'));

-- User Roles: Users can see their own, admins can see all
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    public.has_permission(auth.uid(), 'users.read')
  );

-- User Roles: Only admins can modify
CREATE POLICY "user_roles_insert" ON public.user_roles
  FOR INSERT WITH CHECK (
    public.has_permission(auth.uid(), 'users.roles')
  );

CREATE POLICY "user_roles_delete" ON public.user_roles
  FOR DELETE USING (
    public.has_permission(auth.uid(), 'users.roles')
  );

-- Permissions: Everyone can read
CREATE POLICY "permissions_select_all" ON public.permissions
  FOR SELECT USING (true);

-- Role Permissions: Everyone can read
CREATE POLICY "role_permissions_select_all" ON public.role_permissions
  FOR SELECT USING (true);

-- Audit Log: Admins can read, everyone can insert (for logging)
CREATE POLICY "audit_log_select" ON public.audit_log
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'audit.read')
  );

CREATE POLICY "audit_log_insert" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Triggers
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Assign default role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_role_id UUID;
BEGIN
  -- Get affiliate role ID
  SELECT id INTO v_affiliate_role_id FROM public.roles WHERE name = 'affiliate';

  -- Assign default affiliate role
  IF v_affiliate_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_affiliate_role_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Migration Script: Existing Users
-- ============================================

-- Migrate existing users from app_metadata to user_roles table
DO $$
DECLARE
  v_user RECORD;
  v_role_id UUID;
  v_role_name TEXT;
BEGIN
  FOR v_user IN
    SELECT id, raw_app_meta_data->>'role' as role_name
    FROM auth.users
    WHERE raw_app_meta_data->>'role' IS NOT NULL
  LOOP
    -- Map old role names to new ones
    v_role_name := CASE v_user.role_name
      WHEN 'afiliado' THEN 'affiliate'
      WHEN 'financeiro' THEN 'finance'
      WHEN 'suporte' THEN 'support'
      WHEN 'clinica' THEN 'clinic'
      ELSE v_user.role_name
    END;

    -- Get role ID
    SELECT id INTO v_role_id FROM public.roles WHERE name = v_role_name;

    -- Insert user role if found
    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (v_user.id, v_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT ON public.permissions TO anon, authenticated;
GRANT SELECT ON public.role_permissions TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT SELECT ON public.user_with_roles TO authenticated;
