'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Container } from './Container';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  background?: 'default' | 'darker' | 'gradient';
}

const backgrounds = {
  default: 'bg-background',
  darker: 'bg-alternative',
  gradient: 'bg-gradient-to-b from-background to-surface-100',
};

export function Section({ 
  children, 
  className = '', 
  id,
  containerClassName = '',
  background = 'default'
}: SectionProps) {
  return (
    <section 
      id={id}
      className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}
    >
      <Container className={containerClassName}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </Container>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  badge,
  align = 'center',
  className = '' 
}: SectionHeaderProps) {
  return (
    <div className={`
      mb-12 md:mb-16
      ${align === 'center' ? 'text-center' : 'text-left'}
      ${className}
    `}>
      {badge && (
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-brand/10 text-brand">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-foreground-light max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
