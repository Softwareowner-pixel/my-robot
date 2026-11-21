'use client';

import { useState, useEffect, useRef } from 'react';
import { Keyboard, AlertTriangle, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '@components/primitives/Tooltip';

type HotkeyValue = '`' | 'Ctrl+Space' | 'Ctrl+`' | 'Insert';

interface HotkeyPickerProps {
  value: HotkeyValue;
  state: 'idle' | 'listening' | 'conflict';
  onChange?: (key: HotkeyValue) => void;
  conflictMessage?: string;
}

const hotkeyOptions: { value: HotkeyValue; label: string; description: string }[] = [
  { value: '`', label: 'Backtick (`)', description: 'Default, top-left key' },
  { value: 'Ctrl+Space', label: 'Ctrl + Space', description: 'Easy to reach, no conflicts' },
  { value: 'Ctrl+`', label: 'Ctrl + Backtick', description: 'Alternative modifier' },
  { value: 'Insert', label: 'Insert', description: 'Dedicated key, rarely used' },
];

export function HotkeyPicker({ value, state, onChange, conflictMessage }: HotkeyPickerProps) {
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsListening(state === 'listening');
  }, [state]);

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key;

      // Map keys to our hotkey options
      let newValue: HotkeyValue = '`';
      if (e.ctrlKey && key === ' ') newValue = 'Ctrl+Space';
      else if (e.ctrlKey && key === '`') newValue = 'Ctrl+`';
      else if (key === 'Insert') newValue = 'Insert';
      else if (key === '`') newValue = '`';
      else return; // Ignore other keys

      onChange?.(newValue);
      setIsListening(false);
    };

    const handleBlur = () => setIsListening(false);

    document.addEventListener('keydown', handleKeyDown);
    inputRef.current?.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      inputRef.current?.removeEventListener('blur', handleBlur);
    };
  }, [isListening, onChange]);

  const handleClick = () => {
    if (state !== 'listening') {
      onChange?.('`'); // Trigger listening state via parent
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">
        Push-to-Talk Hotkey
      </label>

      <Tooltip content="Click and press a key combination to set your hotkey" side="top">
        <button
          ref={inputRef}
          type="button"
          onClick={handleClick}
          className={twMerge(
            'w-full px-4 py-3 rounded-lg border font-mono text-base transition-fast',
            'flex items-center justify-between',
            isListening
              ? 'border-accent bg-accent/5 animate-pulse'
              : state === 'conflict'
              ? 'border-danger bg-danger/5'
              : 'border-border hover:border-accent/50'
          )}
          aria-label={`Current hotkey: ${value}. ${isListening ? 'Press new key combination' : 'Click to change'}`}
          aria-pressed={isListening}
        >
          <span className={twMerge(
            'px-3 py-1 rounded bg-surface border border-input text-text',
            isListening && 'bg-accent/10 border-accent'
          )}>
            {isListening ? (
              <span className="flex items-center gap-2 text-accent">
                <Keyboard className="h-4 w-4 animate-pulse" />
                Press key...
              </span>
            ) : (
              value
            )}
          </span>
          {isListening && <Keyboard className="h-5 w-5 text-accent animate-pulse" />}
        </button>
      </Tooltip>

      {conflictMessage && state === 'conflict' && (
        <div className="flex items-center gap-2 text-sm text-danger" role="alert">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{conflictMessage}</span>
        </div>
      )}

      <div className="pt-2">
        <p className="text-xs text-muted mb-2">Or choose from presets:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {hotkeyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !isListening && onChange?.(option.value)}
              disabled={isListening}
              className={twMerge(
                'px-3 py-2 rounded-lg border text-sm font-mono transition-fast',
                'flex flex-col items-center gap-1',
                value === option.value
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-muted hover:border-accent/50 hover:text-text'
              )}
              aria-pressed={value === option.value}
            >
              <span>{option.label}</span>
              <span className="text-xs text-dim">{option.description}</span>
              {value === option.value && <Check className="h-3 w-3 text-accent" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}