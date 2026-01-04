import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card hover={false}>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Algo deu errado
            </h1>
            <p className="text-foreground-light text-sm mb-6">
              {params?.error ? (
                <>Erro: {params.error}</>
              ) : (
                <>Ocorreu um erro inesperado. Tente novamente.</>
              )}
            </p>
            <Button href="/auth/login" type="outline" className="w-full">
              Voltar para login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
