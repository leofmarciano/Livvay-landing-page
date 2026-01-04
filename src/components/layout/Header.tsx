'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
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
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Primary navigation links for the header.
 */
const navLinks = [
  { href: '/plus', label: 'Plus' },
  { href: '/liga', label: 'Liga' },
  { href: '/foundation', label: 'Fundação' },
  { href: '/blog', label: 'Blog' },
  { href: '/manifesto', label: 'Manifesto' },
];

/**
 * Navigation links for authenticated users in protected routes.
 */
const protectedNavLinks = [
  { href: '/afiliados', label: 'Dashboard' },
];

/**
 * Routes that require authentication and show protected header.
 */
const protectedRoutes = ['/afiliados'];

/**
 * Renders the sticky header with primary navigation and CTA actions.
 * Adapts UI based on whether user is on a protected route.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const pathname = usePathname();

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

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
      return;
    }

    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'}
      `}
    >
      <Container>
        <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Navegação principal">
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground font-bold text-xl hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            aria-label="Livvay - Página inicial"
            tabIndex={0}
          >
            Livvay
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu className="w-fit">
              <NavigationMenuList>
                {(isProtectedRoute ? protectedNavLinks : navLinks).map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === link.href ? 'text-brand' : 'text-foreground-light hover:text-foreground'
                      )}
                    >
                      <Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined} tabIndex={0}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA / User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isProtectedRoute && user ? (
              <>
                <span className="text-sm text-foreground-light flex items-center gap-2">
                  <User className="w-4 h-4" aria-hidden="true" />
                  {user.email}
                </span>
                <LogoutButton size="small" />
              </>
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
                      {user.email}
                    </span>
                  </div>
                )}
                {(isProtectedRoute ? protectedNavLinks : navLinks).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`
                      block py-3 px-4 rounded-lg font-medium transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
                      ${pathname === link.href
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
