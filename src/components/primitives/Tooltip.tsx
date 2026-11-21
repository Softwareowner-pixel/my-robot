'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TooltipProps {
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  delay?: number;
}

const sideStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-border',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-border',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-border',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-border',
};

export function Tooltip({ content, side = 'top', children, delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>();
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const show = () => {
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      show();
    }
  };

  const handleKeyUp = () => {
    hide();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipContent = isVisible ? (
    <div
      ref={tooltipRef}
      className={twMerge(
        'fixed z-tooltip px-3 py-1.5 text-sm text-text bg-surface-elevated border rounded-md shadow-pop',
        'whitespace-nowrap transition-fast animate-in fade-in-100',
        sideStyles[side]
      )}
      role="tooltip"
      aria-hidden="false"
    >
      {content}
      <div
        className={twMerge(
          'absolute w-0 h-0 border-4 border-transparent',
          arrowStyles[side]
        )}
        aria-hidden="true"
      />
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="inline-block"
      >
        {children}
      </span>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}