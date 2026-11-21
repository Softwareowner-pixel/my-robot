'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, X, Volume2, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvatarDisplay } from '@components/avatar/AvatarDisplay';
import { Spinner } from '@components/primitives/Spinner';

export type OverlayState = 'hidden' | 'listening' | 'processing' | 'responding' | 'error';

interface PushToTalkOverlayProps {
  state: OverlayState;
  transcript?: string;
  response?: string;
  errorMessage?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  onHotkeyPress?: () => void;
  onHotkeyRelease?: () => void;
  language?: 'english' | 'hindi_urdu' | 'mixed';
}

export function PushToTalkOverlay({
  state,
  transcript = '',
  response = '',
  errorMessage,
  onDismiss,
  onRetry,
  onHotkeyPress,
  onHotkeyRelease,
  language = 'english',
}: PushToTalkOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isPressedRef = useRef(false);

  // Handle global hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Default hotkey: backtick (`)
      if (e.key === '`' && !e.repeat && !isPressedRef.current) {
        isPressedRef.current = true;
        onHotkeyPress?.();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === '`' && isPressedRef.current) {
        isPressedRef.current = false;
        onHotkeyRelease?.();
        e.preventDefault();
      }
      if (e.key === 'Escape' && state !== 'hidden') {
        onDismiss?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, onHotkeyPress, onHotkeyRelease, onDismiss]);

  if (state === 'hidden') return null;

  const stateConfig = {
    listening: {
      icon: <Mic className="h-6 w-6 text-accent animate-pulse-glow" />,
      label: 'Listening...',
      bg: 'bg-accent/10 border-accent',
    },
    processing: {
      icon: <Spinner size="md" />,
      label: 'Thinking...',
      bg: 'bg-accent-secondary/10 border-accent-secondary',
    },
    responding: {
      icon: <Bot className="h-6 w-6 text-accent" />,
      label: 'Responding...',
      bg: 'bg-accent/10 border-accent',
    },
    error: {
      icon: <MicOff className="h-6 w-6 text-danger" />,
      label: 'Error',
      bg: 'bg-danger/10 border-danger',
    },
  };

  const config = stateConfig[state];

  return (
    <div
      ref={overlayRef}
      className={twMerge(
        'fixed top-0 left-1/2 -translate-x-1/2 z-overlay w-full max-w-3xl mx-4',
        'animate-in slide-in-from-top-4 fade-in-200 transition-base'
      )}
      role="status"
      aria-live="polite"
      aria-busy={state === 'processing'}
    >
      <div className={twMerge(
        'rounded-xl border-2 shadow-pop backdrop-blur-xl',
        'px-6 py-4 transition-base',
        config.bg
      )}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Avatar + State indicator */}
          <div className="flex items-center gap-4 min-w-0">
            <AvatarDisplay variant="default" size="sm" state={state as any} ariaLabel={`my robot, ${state}`} />
            <div className="flex items-center gap-2 min-w-0">
              {config.icon}
              <span className="text-base font-medium text-text truncate">{config.label}</span>
            </div>
          </div>

          {/* Center: Transcript / Response */}
          <div className="flex-1 min-w-0 text-center">
            {state === 'listening' && transcript && (
              <p className="text-base text-text truncate" aria-live="polite">
                {transcript}
              </p>
            )}
            {state === 'responding' && response && (
              <p className="text-base text-text truncate" aria-live="polite">
                {response}
              </p>
            )}
            {state === 'processing' && !transcript && (
              <p className="text-sm text-muted">Processing your request...</p>
            )}
            {state === 'error' && errorMessage && (
              <p className="text-sm text-danger" role="alert">{errorMessage}</p>
            )}
          </div>

          {/* Right: Language + Dismiss */}
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => {}}
              className="bg-surface border border-input rounded-md px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Voice language"
              disabled={state !== 'hidden'}
            >
              <option value="english">English</option>
              <option value="hindi_urdu">हिंदी/उर्दू</option>
              <option value="mixed">Mixed</option>
            </select>
            {state === 'error' ? (
              <button
                onClick={onRetry}
                className="p-2 text-danger hover:text-danger-hover hover:bg-danger/10 rounded-md transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                aria-label="Retry"
              >
                <Loader2 className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="p-2 text-muted hover:text-text hover:bg-surface-elevated rounded-md transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Hotkey hint */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted">
          <kbd className="px-2 py-0.5 bg-surface-elevated border border-border rounded text-text font-mono">`</kbd>
          <span>Hold to talk</span>
          <span>•</span>
          <kbd className="px-2 py-0.5 bg-surface-elevated border border-border rounded text-text font-mono">Esc</kbd>
          <span>Dismiss</span>
        </div>
      </div>
    </div>
  );
}