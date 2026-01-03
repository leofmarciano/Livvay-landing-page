'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'glass';
  hover?: boolean;
}

const cardVariants = {
  default: 'bg-surface-100 border border-border',
  highlight: 'bg-gradient-to-br from-surface-200 to-surface-100 border border-brand/30',
  glass: 'bg-surface-100/80 backdrop-blur-xl border border-border/50',
};

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true 
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        rounded-2xl p-6
        ${cardVariants[variant]}
        ${hover ? 'transition-shadow hover:shadow-xl hover:shadow-black/20' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
