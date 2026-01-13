'use client';

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

const iconMap = {
  MessageSquare,
  Scale,
  BarChart3,
  FileText,
  Pill,
  ClipboardList,
  Camera,
  Stethoscope,
};

interface TabConfig {
  key: PatientTabKey;
  label: string;
  icon: keyof typeof iconMap;
  badge?: boolean;
}

const tabs: TabConfig[] = [
  { key: 'inbox', label: 'Inbox', icon: 'MessageSquare' },
  { key: 'medidas', label: 'Medidas', icon: 'Scale', badge: true },
  { key: 'analise', label: 'Análise', icon: 'BarChart3' },
  { key: 'planos', label: 'Planos', icon: 'FileText' },
  { key: 'medicacoes', label: 'Medicações', icon: 'Pill' },
  { key: 'exames', label: 'Exames', icon: 'ClipboardList' },
  { key: 'fotos', label: 'Fotos', icon: 'Camera' },
  { key: 'diagnosticos', label: 'Diagnósticos', icon: 'Stethoscope' },
];

interface PatientTabsProps {
  activeTab: PatientTabKey;
  onTabChange: (tab: PatientTabKey) => void;
  children?: React.ReactNode;
}

export function PatientTabs({ activeTab, onTabChange, children }: PatientTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as PatientTabKey)}
      className="w-full"
    >
      <div className="border-b border-border overflow-x-auto">
        <TabsList className="bg-transparent h-auto p-0 gap-0">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon];
            const isActive = activeTab === tab.key;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent',
                  'data-[state=active]:border-brand data-[state=active]:bg-transparent',
                  'data-[state=active]:text-brand data-[state=active]:shadow-none',
                  'hover:bg-surface-100 transition-colors'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isActive ? 'bg-brand' : 'bg-foreground-muted'
                    )}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Tab contents */}
      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="mt-6">
          {tab.key === 'medidas' && children}
          {tab.key !== 'medidas' && (
            <div className="flex items-center justify-center py-16 text-foreground-muted">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mx-auto mb-3">
                  {(() => {
                    const TabIcon = iconMap[tab.icon];
                    return <TabIcon className="w-6 h-6" />;
                  })()}
                </div>
                <p className="text-sm">Conteúdo de {tab.label} em breve</p>
              </div>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
