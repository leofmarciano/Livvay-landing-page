'use client';

import { memo } from 'react';
import {
  MessageSquare,
  Scale,
  BarChart3,
  FileText,
  Pill,
  ClipboardList,
  Camera,
  Stethoscope,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { PatientTabKey } from '@/lib/clinic/mock-patient-data';
import { cn } from '@/lib/utils';

// Static constants moved outside component for performance
const ICON_MAP = {
  MessageSquare,
  Scale,
  BarChart3,
  FileText,
  Pill,
  ClipboardList,
  Camera,
  Stethoscope,
} as const;

interface TabConfig {
  key: PatientTabKey;
  label: string;
  icon: keyof typeof ICON_MAP;
  badge?: boolean;
}

const TABS: TabConfig[] = [
  { key: 'inbox', label: 'Inbox', icon: 'MessageSquare' },
  { key: 'medidas', label: 'Medidas', icon: 'Scale', badge: true },
  { key: 'analise', label: 'Análise', icon: 'BarChart3' },
  { key: 'planos', label: 'Planos', icon: 'FileText' },
  { key: 'medicacoes', label: 'Medicações', icon: 'Pill' },
  { key: 'exames', label: 'Exames', icon: 'ClipboardList' },
  { key: 'fotos', label: 'Fotos', icon: 'Camera' },
  { key: 'diagnosticos', label: 'Diagnósticos', icon: 'Stethoscope' },
] as const;

// Content-visibility styles for performance optimization
const TAB_CONTENT_STYLE = {
  contentVisibility: 'auto',
  containIntrinsicSize: '0 500px',
} as const;

interface PatientTabsProps {
  activeTab: PatientTabKey;
  onTabChange: (tab: PatientTabKey) => void;
  children?: React.ReactNode;
}

interface EmptyTabContentProps {
  tab: TabConfig;
}

const EmptyTabContent = memo(function EmptyTabContent({ tab }: EmptyTabContentProps) {
  const TabIcon = ICON_MAP[tab.icon];
  return (
    <div
      className="flex items-center justify-center py-16 text-foreground-muted"
      role="status"
      aria-label={`Seção ${tab.label} em desenvolvimento`}
    >
      <div className="text-center">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mx-auto mb-3"
          aria-hidden="true"
        >
          <TabIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Em desenvolvimento…</p>
        <p className="text-xs text-foreground-muted">
          A seção {tab.label} estará disponível em breve
        </p>
      </div>
    </div>
  );
});

export function PatientTabs({ activeTab, onTabChange, children }: PatientTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as PatientTabKey)}
      className="w-full"
    >
      <div className="border-b border-border overflow-x-auto">
        <TabsList className="bg-transparent h-auto p-0 gap-0">
          {TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon];
            const isActive = activeTab === tab.key;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  // Reset all base styles
                  '!bg-transparent !border-0 !border-b-2 !border-transparent !shadow-none !rounded-none',
                  // Layout
                  'relative flex items-center gap-2 px-4 py-3',
                  // Active state - only bottom border
                  'data-[state=active]:!border-b-brand data-[state=active]:!text-brand',
                  // Hover
                  'hover:bg-surface-100/50 transition-colors motion-reduce:transition-none',
                  // Focus
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.badge && (
                  <>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isActive ? 'bg-brand' : 'bg-foreground-muted'
                      )}
                      aria-hidden="true"
                    />
                    <span className="sr-only">(atualizado)</span>
                  </>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Tab contents with content-visibility for performance */}
      {TABS.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          className="mt-6"
          style={TAB_CONTENT_STYLE}
        >
          {tab.key === 'medidas' && children}
          {tab.key !== 'medidas' && <EmptyTabContent tab={tab} />}
        </TabsContent>
      ))}
    </Tabs>
  );
}
