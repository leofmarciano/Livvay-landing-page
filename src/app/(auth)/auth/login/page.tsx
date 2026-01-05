import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

function LoginFormFallback() {
  return (
    <div className="w-full max-w-sm animate-pulse">
      <div className="bg-surface-200 rounded-xl p-6">
        <div className="h-8 bg-surface-300 rounded mb-4 w-1/2 mx-auto" />
        <div className="h-4 bg-surface-300 rounded mb-6 w-3/4 mx-auto" />
        <div className="space-y-4">
          <div className="h-12 bg-surface-300 rounded" />
          <div className="h-12 bg-surface-300 rounded" />
          <div className="h-12 bg-surface-300 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
