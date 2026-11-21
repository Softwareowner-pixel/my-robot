'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Skill } from '@types';

interface SkillToggleProps {
  skill: Skill;
  enabled: boolean;
  state: 'on' | 'off' | 'pending' | 'error';
  onChange?: (enabled: boolean) => void;
}

const skillLabels: Record<Skill, { label: string; description: string; icon: React.ReactNode }> = {
  open_apps: {
    label: 'Open Apps',
    description: 'Launch applications by voice (Spotify, Steam, Chrome, etc.)',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>,
  },
  play_music: {
    label: 'Play Music',
    description: 'Play music from Spotify, YouTube, or local files',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  },
  web_search: {
    label: 'Web Search',
    description: 'Search the web, open sites, play YouTube videos',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  },
  file_ops: {
    label: 'File Operations',
    description: 'Find and open files on your PC',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
  quick_message: {
    label: 'Quick Message',
    description: 'Send WhatsApp messages without leaving your current app',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
};

export function SkillToggle({ skill, enabled, state, onChange }: SkillToggleProps) {
  const { label, description, icon } = skillLabels[skill];

  const handleToggle = () => {
    if (state !== 'pending') {
      onChange?.(!enabled);
    }
  };

  return (
    <div
      className={twMerge(
        'bg-surface border border-border rounded-md p-4 transition-base',
        state === 'pending' && 'opacity-70',
        state === 'error' && 'border-danger'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 text-muted">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text">{label}</h4>
            <button
              role="switch"
              aria-checked={enabled}
              aria-disabled={state === 'pending'}
              onClick={handleToggle}
              className={twMerge(
                'relative w-11 h-6 rounded-pill transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                enabled
                  ? 'bg-accent'
                  : 'bg-border'
              )}
              disabled={state === 'pending'}
            >
              <span
                className={twMerge(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform',
                  enabled ? 'translate-x-5' : 'translate-x-0.5'
                )}
                aria-hidden="true"
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">{description}</p>
          {state === 'error' && (
            <p className="mt-2 text-sm text-danger" role="alert">
              Failed to update. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}