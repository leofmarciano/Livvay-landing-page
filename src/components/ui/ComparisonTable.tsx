'use client';

import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
}

interface ComparisonTableProps {
  features: Feature[];
  className?: string;
}

export function ComparisonTable({ features, className = '' }: ComparisonTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#27272A]">
            <th className="text-left py-4 px-4 text-[#A1A1AA] font-medium">Recurso</th>
            <th className="text-center py-4 px-4 text-[#A1A1AA] font-medium min-w-[120px]">Grátis</th>
            <th className="text-center py-4 px-4 font-medium min-w-[120px]">
              <span className="text-[#00E676]">Plus</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr 
              key={index}
              className="border-b border-[#27272A]/50 hover:bg-[#1A1A1D]/50 transition-colors"
            >
              <td className="py-4 px-4 text-white">{feature.name}</td>
              <td className="py-4 px-4 text-center">
                <FeatureValue value={feature.free} />
              </td>
              <td className="py-4 px-4 text-center">
                <FeatureValue value={feature.plus} isPremium />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureValue({ value, isPremium = false }: { value: boolean | string; isPremium?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-5 h-5 mx-auto ${isPremium ? 'text-[#00E676]' : 'text-[#22C55E]'}`} />
    ) : (
      <X className="w-5 h-5 mx-auto text-[#71717A]" />
    );
  }
  return <span className={isPremium ? 'text-[#00E676]' : 'text-[#A1A1AA]'}>{value}</span>;
}

