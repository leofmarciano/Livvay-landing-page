import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ROLE_VALUES, parseRole } from '@/lib/rbac/types';

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

    const { role } = result.data;

    // Prevent admin from removing their own admin role
    if (userId === currentUser.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Voce nao pode remover seu proprio role de admin' },
        { status: 400 }
      );
    }

    // Update user's app_metadata with new role using admin client
    const { data: updatedUser, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    });

    if (error) {
      console.error('[Admin] Error updating user role:', error);
      return NextResponse.json({ error: 'Erro ao atualizar role do usuario' }, { status: 500 });
    }

    console.log(`[Admin] Role updated: ${userId} -> ${role} by ${currentUser.email}`);

    return NextResponse.json({
      message: 'Role atualizado com sucesso',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: updatedUser.user.app_metadata?.role,
      },
    });
  } catch (error) {
    console.error('[Admin] Error processing role update:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
