import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export default async function AfiliadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Container className="py-8">
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
    </Container>
  );
}
