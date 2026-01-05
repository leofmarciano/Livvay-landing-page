'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, CreditCard, Bell, LayoutGrid } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isProtectedPath, getNavLinksForRole } from '@/lib/rbac/config';
import { parseRole, getRoleLabel, hasRoleAccess, type Role } from '@/lib/rbac/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * All available dashboards with their required roles.
 */
const ALL_DASHBOARDS: { href: string; label: string; requiredRole: Role }[] = [
  { href: '/admin', label: 'Admin', requiredRole: 'admin' },
  { href: '/financeiro', label: 'Financeiro', requiredRole: 'financeiro' },
  { href: '/suporte', label: 'Suporte', requiredRole: 'suporte' },
  { href: '/afiliados', label: 'Afiliados', requiredRole: 'afiliado' },
  { href: '/clinica', label: 'Clinica', requiredRole: 'clinica' },
];

/**
 * User dropdown menu component with avatar.
 */
/**
 * Get accessible dashboards for a user role.
 */
function getAccessibleDashboards(userRole: Role | null) {
  return ALL_DASHBOARDS.filter((dashboard) =>
    hasRoleAccess(userRole, dashboard.requiredRole)
  );
}

function UserDropdown({ user, userRole }: { user: SupabaseUser; userRole: Role | null }) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const accessibleDashboards = getAccessibleDashboards(userRole);

  const handleOpen = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  const handleClose = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Menu do usuário"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          className="relative h-9 w-9 rounded-full !outline-none focus:!outline-none focus-visible:!outline-none"
        >
          <Avatar className="h-9 w-9 ring-2 ring-brand">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
            <AvatarFallback className="bg-brand/10 text-brand text-sm font-medium">
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        sideOffset={8}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email?.split('@')[0]}</p>
            <p className="text-xs leading-none text-foreground-muted">{user.email}</p>
            {userRole && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand w-fit">
                {getRoleLabel(userRole)}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/conta">
              <User className="mr-2 h-4 w-4" />
              Minha conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/assinatura">
              <CreditCard className="mr-2 h-4 w-4" />
              Assinatura
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/notificacoes">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {accessibleDashboards.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Trocar dashboard
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {accessibleDashboards.map((dashboard) => (
                  <DropdownMenuItem key={dashboard.href} asChild>
                    <Link href={dashboard.href}>{dashboard.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Primary navigation links for the public header.
 */
const publicNavLinks = [
  { href: '/plus', label: 'Plus' },
  { href: '/liga', label: 'Liga' },
  { href: '/foundation', label: 'Fundação' },
  { href: '/blog', label: 'Blog' },
  { href: '/manifesto', label: 'Manifesto' },
];

/**
 * Renders the sticky header with primary navigation and CTA actions.
 * Adapts UI based on whether user is on a protected route and their role.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const pathname = usePathname();

  const isProtectedRoute = isProtectedPath(pathname);

  useEffect(() => {
    /**
     * Tracks scroll position to toggle header elevation styles.
     */
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isProtectedRoute) {
      setUser(null);
      setUserRole(null);
      return;
    }

    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      const role = user ? parseRole(user.app_metadata?.role) || 'afiliado' : null;
      setUserRole(role);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      const role = sessionUser ? parseRole(sessionUser.app_metadata?.role) || 'afiliado' : null;
      setUserRole(role);
    });

    return () => subscription.unsubscribe();
  }, [isProtectedRoute]);

  /**
   * Closes the mobile navigation drawer.
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Toggles the mobile navigation drawer.
   */
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Handles keyboard toggling for the mobile menu button.
   */
  const handleMobileMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMobileMenuToggle();
    }
  };

  // Get navigation links based on context
  const currentNavLinks = isProtectedRoute && userRole ? getNavLinksForRole(userRole) : publicNavLinks;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'}
      `}
    >
      <Container>
        <nav
          className="relative flex items-center justify-between h-16 md:h-20"
          role="navigation"
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground font-bold text-xl hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            aria-label="Livvay - Página inicial"
            tabIndex={0}
          >
            Livvay
          </Link>

          {/* Desktop Navigation - Centered absolutely when logged in */}
          <div className={cn(
            "hidden md:flex items-center",
            isProtectedRoute && user
              ? "absolute left-1/2 -translate-x-1/2"
              : "ml-8"
          )}>
            <NavigationMenu className="w-fit">
              <NavigationMenuList>
                {currentNavLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === link.href || pathname.startsWith(link.href + '/')
                          ? 'text-brand'
                          : 'text-foreground-light hover:text-foreground'
                      )}
                    >
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? 'page' : undefined}
                        tabIndex={0}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA / User Actions */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {isProtectedRoute && user ? (
              <UserDropdown user={user} userRole={userRole} />
            ) : (
              <Button href="/score" size="small">
                Calcular meu Score
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            onKeyDown={handleMobileMenuKeyDown}
            className="md:hidden p-2 text-foreground hover:bg-surface-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            tabIndex={0}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </nav>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
            role="menu"
          >
            <Container>
              <div className="py-4 space-y-2">
                {isProtectedRoute && user && (
                  <div className="px-4 py-2 mb-2 border-b border-border">
                    <span className="text-sm text-foreground-light flex items-center gap-2">
                      <User className="w-4 h-4" aria-hidden="true" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    {userRole && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand">
                        {getRoleLabel(userRole)}
                      </span>
                    )}
                  </div>
                )}
                {currentNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`
                      block py-3 px-4 rounded-lg font-medium transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
                      ${
                        pathname === link.href || pathname.startsWith(link.href + '/')
                          ? 'bg-brand/10 text-brand'
                          : 'text-foreground-light hover:bg-surface-100 hover:text-foreground'
                      }
                    `}
                    role="menuitem"
                    aria-current={pathname === link.href ? 'page' : undefined}
                    tabIndex={0}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Dashboard Switcher - Mobile */}
                {isProtectedRoute && user && (() => {
                  const accessibleDashboards = getAccessibleDashboards(userRole);
                  if (accessibleDashboards.length <= 1) return null;
                  return (
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="px-4 py-2 text-xs font-medium text-foreground-muted flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                        Trocar dashboard
                      </p>
                      {accessibleDashboards.map((dashboard) => (
                        <Link
                          key={dashboard.href}
                          href={dashboard.href}
                          onClick={closeMobileMenu}
                          className={`
                            block py-2 px-4 ml-6 rounded-lg text-sm transition-colors
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
                            ${
                              pathname.startsWith(dashboard.href)
                                ? 'bg-brand/10 text-brand'
                                : 'text-foreground-light hover:bg-surface-100 hover:text-foreground'
                            }
                          `}
                          role="menuitem"
                        >
                          {dashboard.label}
                        </Link>
                      ))}
                    </div>
                  );
                })()}
                <div className="pt-2">
                  {isProtectedRoute && user ? (
                    <LogoutButton className="w-full" />
                  ) : (
                    <Button href="/score" className="w-full" onClick={closeMobileMenu}>
                      Calcular meu Score
                    </Button>
                  )}
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
