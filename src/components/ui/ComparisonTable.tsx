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
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="text-left py-4 px-4 text-foreground-light font-medium">
              Recurso
            </th>
            <th scope="col" className="text-center py-4 px-4 text-foreground-light font-medium min-w-[120px]">
              Grátis
            </th>
            <th scope="col" className="text-center py-4 px-4 font-medium min-w-[120px]">
              <span className="text-brand">Plus</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr 
              key={index}
              className="border-b border-border/50 hover:bg-surface-100/50 transition-colors"
            >
              <td className="py-4 px-4 text-foreground">{feature.name}</td>
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
      <Check 
        className={`w-5 h-5 mx-auto ${isPremium ? 'text-brand' : 'text-success'}`} 
        aria-label="Incluído"
      />
    ) : (
      <X 
        className="w-5 h-5 mx-auto text-foreground-muted" 
        aria-label="Não incluído"
      />
    );
  }
  return <span className={isPremium ? 'text-brand' : 'text-foreground-light'}>{value}</span>;
}
