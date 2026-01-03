'use client';

import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  city?: string;
  avatar?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
  showCity?: boolean;
}

export function Leaderboard({ entries, className = '', showCity = true }: LeaderboardProps) {
  return (
    <div 
      className={`bg-surface-100 rounded-2xl border border-border overflow-hidden ${className}`}
      role="list"
      aria-label="Ranking de usuários"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" aria-hidden="true" />
          <span>Ranking</span>
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {entries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} showCity={showCity} />
        ))}
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, showCity }: { entry: LeaderboardEntry; showCity: boolean }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-warning" aria-hidden="true" />;
      case 2:
        return <Medal className="w-5 h-5 text-foreground-light" aria-hidden="true" />;
      case 3:
        return <Award className="w-5 h-5 text-warning-200" aria-hidden="true" />;
      default:
        return <span className="w-5 text-center text-foreground-muted font-mono">{entry.rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-warning/10';
      case 2:
        return 'bg-foreground-light/10';
      case 3:
        return 'bg-warning-200/10';
      default:
        return '';
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return '1º lugar';
      case 2:
        return '2º lugar';
      case 3:
        return '3º lugar';
      default:
        return `${rank}º lugar`;
    }
  };

  return (
    <div 
      className={`flex items-center gap-4 p-4 ${getRankBg(entry.rank)} hover:bg-surface-200/50 transition-colors`}
      role="listitem"
      aria-label={`${getRankLabel(entry.rank)}: ${entry.name} com ${entry.score} pontos`}
    >
      <div className="w-8 flex justify-center">
        {getRankIcon(entry.rank)}
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center text-background font-bold" aria-hidden="true">
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">{entry.name}</p>
        {showCity && entry.city && (
          <p className="text-foreground-muted text-sm truncate">{entry.city}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-brand font-bold">{entry.score.toLocaleString('pt-BR')}</p>
        <p className="text-foreground-muted text-xs">pontos</p>
      </div>
    </div>
  );
}
