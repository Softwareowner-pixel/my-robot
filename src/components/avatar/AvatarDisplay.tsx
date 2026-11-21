'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarDisplayProps {
  variant?: 'default' | 'male' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  src?: string;
  ariaLabel?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-24 w-24',      // 96px
  md: 'h-40 w-40',      // 160px
  lg: 'h-50 w-50',      // 200px
  xl: 'h-70 w-70',      // 280px
};

const stateStyles = {
  idle: 'animate-pulse-glow',
  listening: 'animate-pulse-glow ring-2 ring-accent ring-offset-2 ring-offset-bg',
  thinking: 'animate-pulse-glow',
  speaking: 'animate-pulse-glow',
  error: 'animate-pulse-glow ring-2 ring-danger ring-offset-2 ring-offset-bg',
};

export function AvatarDisplay({
  variant = 'default',
  size = 'lg',
  state = 'idle',
  src,
  ariaLabel,
  className,
}: AvatarDisplayProps) {
  const label = ariaLabel || `my robot, ${state}`;

  // For now, using a gradient sphere as placeholder for the "light character"
  // In production, this would be replaced with a custom SVG/Canvas/WebGL animation
  const renderAvatar = () => {
    if (src && variant === 'custom') {
      return (
        <img
          src={src}
          alt=""
          className="h-full w-full rounded-full object-cover"
          aria-hidden="true"
        />
      );
    }

    // Default: animated gradient sphere representing the "character made of light"
    return (
      <div
        className={twMerge(
          'relative h-full w-full rounded-full',
          'bg-gradient-to-br from-accent/30 via-accent/10 to-accent-secondary/30',
          'shadow-glow',
          'overflow-hidden'
        )}
        aria-hidden="true"
      >
        {/* Inner glow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/20 animate-pulse-glow" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />

        {/* Core pulse */}
        <div className="absolute inset-4 rounded-full bg-accent/20 blur-xl animate-pulse-glow" />

        {/* State-specific overlays */}
        {state === 'listening' && (
          <div className="absolute inset-0 rounded-full border-2 border-accent animate-pulse-glow" />
        )}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-1/3 w-1/3 text-accent animate-thinking-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {state === 'speaking' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 h-8 items-end">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-sm animate-speak-wave"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        )}
        {state === 'error' && (
          <div className="absolute inset-0 rounded-full border-2 border-danger" />
        )}
      </div>
    );
  };

  return (
    <div
      className={twMerge(
        'relative inline-flex items-center justify-center',
        sizeStyles[size],
        stateStyles[state],
        className
      )}
      role="img"
      aria-label={label}
    >
      {renderAvatar()}
    </div>
  );
}