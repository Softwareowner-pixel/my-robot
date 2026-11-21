'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, Settings, Brain, Zap, User, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvatarDisplay } from '@components/avatar/AvatarDisplay';
import { CircuitPanel } from '@components/circuit/CircuitPanel';
import { MemoryFactCard } from '@components/memory/MemoryFactCard';
import { SkillToggle } from '@components/skills/SkillToggle';
import { PersonaSelector } from '@components/character/PersonaSelector';
import { HotkeyPicker } from '@components/settings/HotkeyPicker';
import { DailyBriefingCard } from '@components/briefing/DailyBriefingCard';
import { useUserStore } from '@stores/userStore';
import { Button } from '@components/primitives/Button';

export function HubScreen() {
  const {
    user,
    character,
    memoryFacts,
    skillPermissions,
    dailyBriefing,
    avatarState,
    setAvatarState,
    isLoading,
  } = useUserStore();

  const [activeCircuit, setActiveCircuit] = useState<'memory' | 'skills' | 'character' | 'settings' | null>('memory');

  // Initialize with seed data if empty
  useEffect(() => {
    if (!user) return;
    // Seed data would come from Tauri commands in real app
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-accent/20 mb-6">
            <AvatarDisplay size="lg" state="thinking" ariaLabel="my robot, loading" />
          </div>
          <p className="text-text-muted">Waking up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-sticky">
        <div className="max-w-app mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AvatarDisplay variant="default" size="sm" state={avatarState} ariaLabel={`my robot, ${avatarState}`} />
            <div>
              <h1 className="font-display text-xl font-bold text-text">my robot</h1>
              <p className="text-xs text-muted">Your sci-fi AI companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveCircuit('settings')}>
              <Settings className="h-5 w-5" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-app mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Character Hub */}
          <div className="space-y-6">
            {/* Character Display */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <AvatarDisplay
                  variant={character?.avatarGender as any || 'default'}
                  size="lg"
                  state={avatarState}
                  ariaLabel={`my robot, ${avatarState}`}
                />
                {/* Circuit indicators */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {['memory', 'skills', 'character', 'settings'].map((circuit) => (
                    <button
                      key={circuit}
                      onClick={() => setActiveCircuit(circuit as any)}
                      className={twMerge(
                        'p-1.5 rounded-full transition-fast',
                        activeCircuit === circuit
                          ? 'bg-accent text-on-accent shadow-glow'
                          : 'bg-surface border border-border text-muted hover:text-text hover:border-accent'
                      )}
                      aria-label={`Open ${circuit} circuit`}
                      aria-pressed={activeCircuit === circuit}
                    >
                      {circuit === 'memory' && <Brain className="h-4 w-4" />}
                      {circuit === 'skills' && <Zap className="h-4 w-4" />}
                      {circuit === 'character' && <User className="h-4 w-4" />}
                      {circuit === 'settings' && <Settings className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Briefing */}
              {dailyBriefing && !dailyBriefing.dismissedAt && (
                <div className="w-full max-w-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-text">Your World</h2>
                    <button
                      onClick={() => useUserStore.getState().dismissBriefing()}
                      className="text-sm text-muted hover:text-text"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <DailyBriefingCard variant="work" pick={dailyBriefing.pick1} state="loaded" />
                    <DailyBriefingCard variant="follows" pick={dailyBriefing.pick2} state="loaded" />
                    <DailyBriefingCard variant="goals" pick={dailyBriefing.pick3} state="loaded" />
                  </div>
                </div>
              )}

              {/* Empty state for first run */}
              {!dailyBriefing && memoryFacts.length === 0 && (
                <div className="w-full max-w-xl text-center py-8">
                  <p className="text-muted mb-4">
                    Welcome to my robot. Hold <kbd className="px-2 py-0.5 bg-surface-elevated border border-border rounded font-mono text-text">`</kbd> to start talking.
                  </p>
                  <p className="text-sm text-dim">
                    I'll remember your name, interests, and daily context. Each morning I'll bring you
                    three curated picks from your world.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Circuit Panels */}
          <div className="space-y-4">
            <CircuitPanel
              variant="memory"
              title="Memory"
              icon={<Brain className="h-5 w-5" />}
              defaultOpen={activeCircuit === 'memory'}
              onToggle={(open) => setActiveCircuit(open ? 'memory' : null)}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {memoryFacts.length > 0 ? (
                  memoryFacts.map((fact) => (
                    <MemoryFactCard
                      key={fact.id}
                      fact={fact}
                      variant={fact.factKey}
                      state="read"
                      onEdit={(f) => console.log('Edit fact', f)}
                      onDelete={(id) => useUserStore.getState().deleteMemoryFact(id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted">
                    <p className="mb-2">No memories yet</p>
                    <p className="text-sm text-dim">Talk to me and I'll remember</p>
                  </div>
                )}
              </div>
            </CircuitPanel>

            <CircuitPanel
              variant="skills"
              title="Skills"
              icon={<Zap className="h-5 w-5" />}
              defaultOpen={activeCircuit === 'skills'}
              onToggle={(open) => setActiveCircuit(open ? 'skills' : null)}
            >
              <div className="space-y-2">
                {skillPermissions.map((skill) => (
                  <SkillToggle
                    key={skill.skill}
                    skill={skill.skill}
                    enabled={skill.enabled}
                    state={skill.enabled ? 'on' : 'off'}
                    onChange={(enabled) => useUserStore.getState().toggleSkill(skill.skill, enabled)}
                  />
                ))}
                {skillPermissions.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <p className="text-sm">Loading skills...</p>
                  </div>
                )}
              </div>
            </CircuitPanel>

            <CircuitPanel
              variant="character"
              title="Character"
              icon={<User className="h-5 w-5" />}
              defaultOpen={activeCircuit === 'character'}
              onToggle={(open) => setActiveCircuit(open ? 'character' : null)}
            >
              <div className="space-y-4">
                <PersonaSelector
                  value={character?.persona || 'assistant'}
                  customText={character?.personaText}
                  onChange={(value, customText) =>
                    useUserStore.getState().updateCharacter({ persona: value as any, personaText: customText })
                  }
                />
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-text mb-2">Voice</label>
                  <div className="flex gap-3">
                    <button
                      className={twMerge(
                        'flex-1 py-2 px-3 rounded-lg border transition-fast',
                        character?.voiceGender === 'female'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:border-accent hover:text-text'
                      )}
                      onClick={() => useUserStore.getState().updateCharacter({ voiceGender: 'female' })}
                    >
                      Female
                    </button>
                    <button
                      className={twMerge(
                        'flex-1 py-2 px-3 rounded-lg border transition-fast',
                        character?.voiceGender === 'male'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:border-accent hover:text-text'
                      )}
                      onClick={() => useUserStore.getState().updateCharacter({ voiceGender: 'male' })}
                    >
                      Male
                    </button>
                  </div>
                </div>
              </div>
            </CircuitPanel>

            <CircuitPanel
              variant="settings"
              title="Settings"
              icon={<Settings className="h-5 w-5" />}
              defaultOpen={activeCircuit === 'settings'}
              onToggle={(open) => setActiveCircuit(open ? 'settings' : null)}
            >
              <div className="space-y-4">
                <HotkeyPicker value="`" state="idle" onChange={(key) => console.log('Hotkey changed:', key)} />
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => useUserStore.getState().addToast({ variant: 'info', title: 'Check for updates...' })}
                    className="w-full text-left text-sm text-accent hover:text-accent-hover"
                  >
                    Check for updates
                  </button>
                  <button
                    onClick={() => useUserStore.getState().addToast({ variant: 'warning', title: 'Sign out not implemented in demo' })}
                    className="w-full text-left text-sm text-danger hover:text-danger-hover"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </CircuitPanel>
          </div>
        </div>
      </main>
    </div>
  );
}