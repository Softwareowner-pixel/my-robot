'use client';

import { useState } from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Input } from '@components/primitives/Input';
import { Button } from '@components/primitives/Button';
import type { MemoryFact, FactKey } from '@types';

interface MemoryFactCardProps {
  fact: MemoryFact;
  variant: FactKey;
  state: 'read' | 'editing' | 'deleting';
  onEdit?: (fact: MemoryFact) => void;
  onDelete?: (id: string) => void;
  onSave?: (fact: MemoryFact) => void;
}

const variantLabels: Record<FactKey, string> = {
  name: 'Name',
  interest: 'Interest',
  day_context: 'Today',
  custom: 'Custom',
};

const variantIcons: Record<FactKey, React.ReactNode> = {
  name: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  interest: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  day_context: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  custom: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
};

export function MemoryFactCard({ fact, variant, state, onEdit, onDelete, onSave }: MemoryFactCardProps) {
  const [editValue, setEditValue] = useState(fact.factValue);

  const handleSave = () => {
    if (editValue.trim() && editValue !== fact.factValue) {
      onSave?.({ ...fact, factValue: editValue.trim(), updatedAt: new Date().toISOString() });
    }
  };

  const handleCancel = () => {
    setEditValue(fact.factValue);
  };

  if (state === 'deleting') {
    return (
      <div className="h-12 bg-surface border border-border rounded-md animate-out fade-out slide-out-to-right" aria-hidden="true" />
    );
  }

  return (
    <div
      className={twMerge(
        'bg-surface border border-border rounded-md p-3 transition-base',
        state === 'editing' && 'border-accent bg-accent/5'
      )}
      role="listitem"
    >
      {state === 'editing' ? (
        <div className="flex gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
            placeholder={`Enter ${variantLabels[variant].toLowerCase()}`}
            aria-label={`Edit ${variantLabels[variant]}`}
          />
          <Button variant="primary" size="sm" onClick={handleSave} aria-label="Save">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel} aria-label="Cancel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 text-muted">{variantIcons[variant]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">
                {variantLabels[variant]}
              </span>
              <span className="text-base text-text break-words">{fact.factValue}</span>
              {fact.source === 'inferred' && (
                <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded">inferred</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit?.(fact)} aria-label={`Edit ${variantLabels[variant]}`}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete?.(fact.id)} aria-label={`Delete ${variantLabels[variant]}`}>
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}