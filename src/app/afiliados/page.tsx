import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { LogoutButton } from '@/components/logout-button';

export default async function AfiliadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Área de Afiliados</h1>
          <LogoutButton size="small" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card hover={false}>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Bem-vindo, {user?.email}!
            </h2>
            <p className="text-foreground-light">
              Sua área de afiliados está em construção.
              Em breve você terá acesso a todas as funcionalidades.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
