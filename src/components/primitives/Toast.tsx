'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Toast {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const variantStyles = {
  info: 'border-border bg-surface',
  success: 'border-success/30 bg-success-muted/50',
  warning: 'border-warning/30 bg-warning-muted/50',
  error: 'border-danger/30 bg-danger-muted/50',
};

const variantIcons = {
  info: <Info className="h-5 w-5 text-accent" aria-hidden="true" />,
  success: <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />,
};

const variantAriaRole = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

const variantAriaLive = {
  info: 'polite',
  success: 'polite',
  warning: 'assertive',
  error: 'assertive',
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const { variant, title, message, action, duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return createPortal(
    <div
      className={twMerge(
        'flex items-start gap-3 p-4 rounded-lg border shadow-pop animate-in slide-in-from-top-2 fade-in',
        'max-w-sm w-full transition-base',
        variantStyles[variant]
      )}
      role={variantAriaRole[variant]}
      aria-live={variantAriaLive[variant]}
      aria-atomic="true"
    >
      <div className="flex-shrink-0 mt-0.5">{variantIcons[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{title}</p>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose(toast.id);
            }}
            className="mt-2 text-sm font-medium text-accent hover:text-accent-hover underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 text-muted hover:text-text rounded-md transition-fast"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>,
    document.body
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}