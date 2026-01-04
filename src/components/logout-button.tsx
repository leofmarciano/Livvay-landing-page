'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import type { ButtonType, ButtonSize } from '@/components/ui/Button';

interface LogoutButtonProps {
  type?: ButtonType;
  size?: ButtonSize;
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  type = 'ghost',
  size = 'medium',
  className,
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button
      type={type}
      size={size}
      loading={isLoading}
      onClick={handleLogout}
      icon={showIcon ? <LogOut /> : undefined}
      className={className}
    >
      {isLoading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}
