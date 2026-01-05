import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ROLE_VALUES, parseRole, type RoleName } from '@/lib/rbac/types';

const updateRoleSchema = z.object({
  role: z.enum(ROLE_VALUES as [string, ...string[]]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verify the requesting user is an admin
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const currentUserRole = parseRole(currentUser.app_metadata?.role);
    if (currentUserRole !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem alterar roles.' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Role invalido', details: result.error.issues },
        { status: 400 }
      );
    }

    const { role } = result.data as { role: RoleName };

    // Prevent admin from removing their own admin role
    if (userId === currentUser.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Voce nao pode remover seu proprio role de admin' },
        { status: 400 }
      );
    }

    // Get the role ID for the new role
    const { data: newRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !newRole) {
      console.error('[Admin] Role not found:', role, roleError);
      return NextResponse.json({ error: 'Role nao encontrado no sistema' }, { status: 400 });
    }

    // Remove all existing roles for the user (single primary role model)
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Admin] Error removing existing roles:', deleteError);
      return NextResponse.json({ error: 'Erro ao remover roles anteriores' }, { status: 500 });
    }

    // Assign the new role in the database
    const { error: insertError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role_id: newRole.id,
      assigned_by: currentUser.id,
    });

    if (insertError) {
      console.error('[Admin] Error assigning new role:', insertError);
      return NextResponse.json({ error: 'Erro ao atribuir novo role' }, { status: 500 });
    }

    // Update app_metadata for JWT/middleware consistency
    const { data: updatedUser, error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { app_metadata: { role } }
    );

    if (metadataError) {
      console.error('[Admin] Error updating app_metadata:', metadataError);
      // Role was assigned in DB, but metadata failed - log but don't fail the request
      // The database is the source of truth, so this is recoverable
    }

    // Log audit entry
    await supabaseAdmin.from('audit_log').insert({
      user_id: currentUser.id,
      action: 'role.update',
      resource: 'user',
      resource_id: userId,
      details: { newRole: role, assignedBy: currentUser.email },
    });

    console.log(`[Admin] Role updated: ${userId} -> ${role} by ${currentUser.email}`);

    return NextResponse.json({
      message: 'Role atualizado com sucesso',
      user: {
        id: updatedUser?.user?.id || userId,
        email: updatedUser?.user?.email,
        role,
      },
    });
  } catch (error) {
    console.error('[Admin] Error processing role update:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
