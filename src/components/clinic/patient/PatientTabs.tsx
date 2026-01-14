'use client';

import { memo, useRef, useState, useEffect, useCallback } from 'react';
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
      aria-label={`Seção ${tab.label} em breve`}
    >
      <div className="text-center">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mx-auto mb-3"
          aria-hidden="true"
        >
          <TabIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-foreground-muted">{tab.label} em breve</p>
      </div>
    </div>
  );
});

interface IndicatorStyle {
  left: number;
  width: number;
}

export function PatientTabs({ activeTab, onTabChange, children }: PatientTabsProps) {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<PatientTabKey, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Store ref for each tab
  const setTabRef = useCallback((key: PatientTabKey, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(key, el);
    } else {
      tabRefs.current.delete(key);
    }
  }, []);

  // Update indicator position when active tab changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeTabEl = tabRefs.current.get(activeTab);
      const listEl = tabsListRef.current;

      if (activeTabEl && listEl) {
        const listRect = listEl.getBoundingClientRect();
        const tabRect = activeTabEl.getBoundingClientRect();

        setIndicatorStyle({
          left: tabRect.left - listRect.left + listEl.scrollLeft,
          width: tabRect.width,
        });

        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateIndicator, 10);

    // Also update on resize
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab, isInitialized]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as PatientTabKey)}
      className="w-full"
    >
      <div className="border-b border-border overflow-x-auto relative">
        <TabsList ref={tabsListRef} className="bg-transparent h-auto p-0 gap-0 relative">
          {TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon];
            const isActive = activeTab === tab.key;

            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                ref={(el) => setTabRef(tab.key, el)}
                className={cn(
                  // Reset all base styles
                  '!bg-transparent !border-0 !shadow-none !rounded-none',
                  // Layout
                  'relative flex items-center gap-2 px-4 py-3',
                  // Text color transition
                  'text-foreground-muted transition-colors duration-200 motion-reduce:transition-none',
                  // Active state - only text color
                  'data-[state=active]:!text-brand',
                  // Hover
                  'hover:text-foreground hover:bg-surface-100/50',
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
                        'w-2 h-2 rounded-full transition-colors duration-200',
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

          {/* Animated indicator line */}
          <span
            className={cn(
              'absolute bottom-0 h-0.5 bg-brand rounded-full',
              'transition-all duration-300 ease-out motion-reduce:transition-none',
              !isInitialized && 'opacity-0'
            )}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            aria-hidden="true"
          />
        </TabsList>
      </div>

      {/* Tab contents with fade-in animation (no animate-out to prevent double render) */}
      {TABS.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          className="mt-6 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:duration-200 motion-reduce:animate-none"
          forceMount={undefined}
        >
          {tab.key === 'medidas' && children}
          {tab.key !== 'medidas' && <EmptyTabContent tab={tab} />}
        </TabsContent>
      ))}
    </Tabs>
  );
}
