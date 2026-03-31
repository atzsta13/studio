'use client';

import type { Challenge } from '@/lib/challenges';
import { CheckCircle2, Lock } from 'lucide-react';

interface ChallengeGridProps {
  challenges: Challenge[];
}

export function ChallengeGrid({ challenges }: ChallengeGridProps) {
  return (
    <div className="space-y-3">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className={`flex gap-4 rounded-lg border-2 p-4 transition-all ${
            challenge.isCompleted
              ? 'border-[#FFED4E] bg-[#1a1a1a]'
              : 'border-white/10 bg-[#0a0a0a] opacity-60'
          }`}
        >
          {/* Icon Box */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-semibold ${
              challenge.isCompleted
                ? 'bg-accent text-black'
                : 'bg-[#1a1a1a] text-gray-500'
            }`}
          >
            <span className="text-xl">{challenge.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-black uppercase tracking-wider text-sm ${
                challenge.isCompleted ? 'text-white' : 'text-gray-400'
              }`}
            >
              {challenge.title}
            </h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                challenge.isCompleted
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
            >
              {challenge.description}
            </p>
          </div>

          {/* XP Badge */}
          <div className="flex-shrink-0 flex flex-col items-end justify-center">
            <div className="flex items-center gap-1">
              {challenge.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <span
              className={`text-xs font-black italic mt-1 ${
                challenge.isCompleted
                  ? 'text-accent'
                  : 'text-gray-500'
              }`}
            >
              +{challenge.xpReward}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
