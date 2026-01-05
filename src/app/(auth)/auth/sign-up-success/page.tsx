import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card hover={false}>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Cadastro realizado!
            </h1>
            <p className="text-foreground-light text-sm mb-6">
              Enviamos um link de confirmação para seu email.
              Verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
            <Button href="/auth/login" type="outline" className="w-full">
              Ir para login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
