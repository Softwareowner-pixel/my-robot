'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay';
  ariaLabel?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

const variantStyles = {
  default: 'inline-block',
  overlay: 'fixed inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm z-popover',
};

export function Spinner({ size = 'md', variant = 'default', ariaLabel = 'Loading', className }: SpinnerProps) {
  return (
    <div
      className={twMerge(
        'animate-thinking-spin',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <svg
        className="h-full w-full text-accent"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="2"
          fill="none"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v12m0 0l4-4m-4 4l-4-4"
          strokeWidth="2"
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}