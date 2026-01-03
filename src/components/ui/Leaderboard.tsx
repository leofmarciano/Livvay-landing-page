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
    <div className={`bg-[#111113] rounded-2xl border border-[#27272A] overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[#27272A]">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#EAB308]" />
          Ranking
        </h3>
      </div>
      <div className="divide-y divide-[#27272A]/50">
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
        return <Trophy className="w-5 h-5 text-[#EAB308]" />;
      case 2:
        return <Medal className="w-5 h-5 text-[#A1A1AA]" />;
      case 3:
        return <Award className="w-5 h-5 text-[#CD7F32]" />;
      default:
        return <span className="w-5 text-center text-[#71717A] font-mono">{entry.rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-[#EAB308]/10';
      case 2:
        return 'bg-[#A1A1AA]/10';
      case 3:
        return 'bg-[#CD7F32]/10';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 ${getRankBg(entry.rank)} hover:bg-[#1A1A1D]/50 transition-colors`}>
      <div className="w-8 flex justify-center">
        {getRankIcon(entry.rank)}
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C853] flex items-center justify-center text-[#0A0A0B] font-bold">
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{entry.name}</p>
        {showCity && entry.city && (
          <p className="text-[#71717A] text-sm truncate">{entry.city}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[#00E676] font-bold">{entry.score.toLocaleString()}</p>
        <p className="text-[#71717A] text-xs">pontos</p>
      </div>
    </div>
  );
}

