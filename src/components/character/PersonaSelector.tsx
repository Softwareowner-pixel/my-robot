'use client';

import { useState } from 'react';
import { Check, Edit2, Bot, GraduationCap, Heart, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@components/primitives/Button';
import { Textarea } from '@components/primitives/Input';
import type { Persona } from '@types';

interface PersonaSelectorProps {
  value: Persona;
  customText?: string;
  onChange?: (value: Persona, customText?: string) => void;
}

const personaOptions = [
  {
    value: 'assistant' as Persona,
    label: 'Assistant',
    description: 'Helpful, efficient, task-oriented',
    icon: Bot,
  },
  {
    value: 'mentor' as Persona,
    label: 'Mentor',
    description: 'Guiding, wise, teaches and advises',
    icon: GraduationCap,
  },
  {
    value: 'best_friend' as Persona,
    label: 'Best Friend',
    description: 'Casual, supportive, conversational',
    icon: Heart,
  },
  {
    value: 'custom' as Persona,
    label: 'Custom',
    description: 'Define your own personality',
    icon: Sparkles,
  },
];

export function PersonaSelector({ value, customText = '', onChange }: PersonaSelectorProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState(customText);

  const handleSelect = (persona: Persona) => {
    if (persona === 'custom') {
      setIsEditingCustom(true);
      setTimeout(() => {
        const textarea = document.querySelector('#custom-persona-textarea') as HTMLTextAreaElement;
        textarea?.focus();
      }, 0);
    } else {
      setIsEditingCustom(false);
      onChange?.(persona);
    }
  };

  const handleCustomSave = () => {
    onChange?.('custom', customInput.trim());
    setIsEditingCustom(false);
  };

  return (
    <div className="space-y-3">
      {personaOptions.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        if (option.value === 'custom') {
          return (
            <div key="custom" className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelect('custom')}
                className={twMerge(
                  'w-full p-4 rounded-lg border transition-base text-left',
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                )}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3">
                  <div className={twMerge(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-accent/20 text-accent' : 'bg-surface text-muted'
                  )}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text">{option.label}</h4>
                    <p className="text-sm text-muted">{option.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-accent" aria-hidden="true" />}
                </div>
              </button>

              {isSelected && (
                <div className="animate-in slide-in-from-top-2 fade-in">
                  {isEditingCustom ? (
                    <div className="space-y-2 pl-11">
                      <Textarea
                        id="custom-persona-textarea"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Describe how you want me to behave, speak, and respond..."
                        rows={3}
                        aria-label="Custom persona description"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingCustom(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleCustomSave}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingCustom(true)}
                      className="w-full justify-start pl-11"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit custom persona
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={twMerge(
              'w-full p-4 rounded-lg border transition-base text-left',
              isSelected
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50'
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-center gap-3">
              <div className={twMerge(
                'p-2 rounded-lg',
                isSelected ? 'bg-accent/20 text-accent' : 'bg-surface text-muted'
              )}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-text">{option.label}</h4>
                <p className="text-sm text-muted">{option.description}</p>
              </div>
              {isSelected && <Check className="h-5 w-5 text-accent" aria-hidden="true" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}