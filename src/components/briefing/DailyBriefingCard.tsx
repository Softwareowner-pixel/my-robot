'use client';

import { ExternalLink, Bookmark, Target, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BriefingPick } from '@types';

interface DailyBriefingCardProps {
  variant: 'work' | 'follows' | 'goals';
  pick: BriefingPick;
  state: 'loaded' | 'tapped' | 'dismissed' | 'skeleton';
  onTap?: (pick: BriefingPick) => void;
  onDismiss?: () => void;
}

const variantConfig = {
  work: { icon: Briefcase, color: 'accent', label: 'From your work' },
  follows: { icon: Bookmark, color: 'accent-secondary', label: 'Something you follow' },
  goals: { icon: Target, color: 'success', label: 'For your goals' },
};

export function DailyBriefingCard({ variant, pick, state, onTap, onDismiss }: DailyBriefingCardProps) {
  const { icon: Icon, color, label } = variantConfig[variant];

  if (state === 'skeleton') {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 animate-pulse space-y-3">
        <div className="h-4 w-1/4 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-3/4 bg-border rounded" />
      </div>
    );
  }

  if (state === 'dismissed') return null;

  const colorClasses = {
    accent: 'border-l-accent',
    'accent-secondary': 'border-l-accent-secondary',
    success: 'border-l-success',
  };

  return (
    <article
      className={twMerge(
        'bg-surface border border-border rounded-lg p-4 transition-base',
        'relative overflow-hidden',
        colorClasses[color as keyof typeof colorClasses],
        state === 'tapped' && 'opacity-60'
      )}
      role="article"
      aria-labelledby={`briefing-${variant}-title`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={twMerge('p-1.5 rounded', `bg-${color}/20 text-${color}`)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        </div>
        {pick.url && (
          <a
            href={pick.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-muted hover:text-text transition-fast"
            aria-label="Open source"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <h3 id={`briefing-${variant}-title`} className="mt-3 font-medium text-text leading-snug">
        {pick.title}
      </h3>

      {pick.summary && (
        <p className="mt-2 text-sm text-muted line-clamp-3">{pick.summary}</p>
      )}

      <button
        onClick={() => onTap?.(pick)}
        className="mt-4 w-full text-left text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1"
        aria-label={`Discuss: ${pick.title}`}
      >
        Talk about this
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </article>
  );
}