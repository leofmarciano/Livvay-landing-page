'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { TIME_PRESETS, DEFAULT_TIME_PRESET, type TimePresetKey } from '@/lib/constants/affiliate';

interface TimeRangeFilterProps {
  value: TimePresetKey;
  onChange: (preset: TimePresetKey, startDate: string, endDate: string) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const [selected, setSelected] = useState<TimePresetKey>(value);

  const handleSelect = (presetKey: TimePresetKey) => {
    const preset = TIME_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - preset.days);

    setSelected(presetKey);
    onChange(
      presetKey,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Período:</span>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-100 border border-border">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handleSelect(preset.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selected === preset.key
                ? 'bg-surface-300 text-foreground'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to get dates from preset
export function getDateRangeFromPreset(presetKey: TimePresetKey = DEFAULT_TIME_PRESET) {
  const preset = TIME_PRESETS.find((p) => p.key === presetKey);
  if (!preset) {
    const defaultPreset = TIME_PRESETS.find((p) => p.key === DEFAULT_TIME_PRESET)!;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - defaultPreset.days);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - preset.days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// Helper to determine grouping based on date range
export function getGroupByFromPreset(presetKey: TimePresetKey): 'day' | 'week' | 'month' {
  switch (presetKey) {
    case '7d':
    case '30d':
      return 'day';
    case '90d':
      return 'week';
    case '1y':
    case '3y':
      return 'month';
    default:
      return 'day';
  }
}
