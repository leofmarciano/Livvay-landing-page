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
  default: 'bg-[#111113] border border-[#27272A]',
  highlight: 'bg-gradient-to-br from-[#1A1A1D] to-[#111113] border border-[#00E676]/30',
  glass: 'bg-[#111113]/80 backdrop-blur-xl border border-[#27272A]/50',
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

