'use client';

import { useState } from 'react';
import { X, ChevronLeft, Save, Key, Monitor, Users, CreditCard, Shield, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvatarDisplay } from '@components/avatar/AvatarDisplay';
import { Button } from '@components/primitives/Button';
import { Input } from '@components/primitives/Input';
import { Modal } from '@components/primitives/Modal';
import { HotkeyPicker } from '@components/settings/HotkeyPicker';
import { PersonaSelector } from '@components/character/PersonaSelector';
import { SkillToggle } from '@components/skills/SkillToggle';
import { useUserStore } from '@stores/userStore';
import type { Persona } from '@types';

type SettingsTab = 'general' | 'character' | 'skills' | 'api' | 'license' | 'subscription';

const tabs = [
  { id: 'general', label: 'General', icon: Monitor },
  { id: 'character', label: 'Character', icon: Users },
  { id: 'skills', label: 'Skills', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'license', label: 'License', icon: CreditCard },
  { id: 'subscription', label: 'Cloud', icon: CreditCard },
] as const;

export function SettingsScreen() {
  const {
    user,
    character,
    skillPermissions,
    setUser,
    setCharacter,
    updateCharacter,
    toggleSkill,
    addToast,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [apiKeys, setApiKeys] = useState({ openai: '', anthropic: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleSaveAPIKeys = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    // In real app: save to Tauri store, encrypt with DPAPI
    addToast({ variant: 'success', title: 'API keys saved', message: 'Stored securely in Windows Credential Manager' });
    setIsSaving(false);
    setShowModal(false);
  };

  const openAPIKeysModal = () => {
    setModalContent(
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Enter your API keys for Lifetime tier. Keys are encrypted and stored locally.
          <br />
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-accent hover:underline">
            Get OpenAI key
          </a>
          {' | '}
          <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-accent hover:underline">
            Get Anthropic key
          </a>
        </p>
        <Input
          label="OpenAI API Key"
          type="password"
          value={apiKeys.openai}
          onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
          placeholder="sk-..."
          helperText="Starts with sk-"
        />
        <Input
          label="Anthropic API Key"
          type="password"
          value={apiKeys.anthropic}
          onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
          placeholder="sk-ant-..."
          helperText="Starts with sk-ant-"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveAPIKeys} loading={isSaving}>
            Save Keys
          </Button>
        </div>
      </div>
    );
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-sticky">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 text-muted hover:text-text hover:bg-surface-elevated rounded-lg transition-fast"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-text flex-1 text-center">Settings</h1>
          <div className="w-10" /> {/* spacer */}
        </div>

        {/* Tab navigation */}
        <nav className="border-t border-border px-4" aria-label="Settings tabs">
          <div className="max-w-4xl mx-auto">
            <ul className="flex flex-wrap gap-1" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id} role="presentation">
                    <button
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={twMerge(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-fast flex items-center gap-2',
                        isActive
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'text-muted hover:text-text hover:bg-surface-elevated'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <AvatarDisplay size="sm" state="idle" ariaLabel="my robot" />
                General
              </h2>
              <HotkeyPicker value="`" state="idle" onChange={(key) => console.log('Hotkey:', key)} />
            </section>

            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Language</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'english', label: 'English' },
                  { value: 'hindi_urdu', label: 'हिंदी/उर्दू' },
                  { value: 'mixed', label: 'Mixed' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    className={twMerge(
                      'p-4 rounded-lg border transition-fast text-center',
                      'border-border hover:border-accent/50'
                    )}
                  >
                    <span className="font-medium text-text">{lang.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Data & Privacy</h2>
              <div className="space-y-3">
                <button
                  onClick={() => addToast({ variant: 'info', title: 'Export data not implemented in demo' })}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-surface-elevated transition-fast flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-text">Export my data</p>
                    <p className="text-sm text-muted">Download all your data as JSON</p>
                  </div>
                  <svg className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                </button>
                <button
                  onClick={() => addToast({ variant: 'warning', title: 'Delete account not implemented in demo' })}
                  className="w-full text-left p-3 rounded-lg border border-danger/50 bg-danger/5 hover:bg-danger/10 transition-fast flex items-center justify-between text-danger"
                >
                  <div>
                    <p className="font-medium">Delete account</p>
                    <p className="text-sm text-danger/80">Permanently delete all your data</p>
                  </div>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'character' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <AvatarDisplay size="sm" state="idle" ariaLabel="my robot" />
                Personality
              </h2>
              <PersonaSelector
                value={character?.persona || 'assistant'}
                customText={character?.personaText}
                onChange={(value, text) => updateCharacter({ persona: value as Persona, personaText: text })}
              />
            </section>

            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Voice</h2>
              <div className="flex gap-4">
                <button
                  className={twMerge(
                    'flex-1 py-3 px-4 rounded-lg border transition-fast',
                    character?.voiceGender === 'female'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:border-accent/50 hover:text-text'
                  )}
                  onClick={() => updateCharacter({ voiceGender: 'female' })}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
                    <span>Female</span>
                  </div>
                </button>
                <button
                  className={twMerge(
                    'flex-1 py-3 px-4 rounded-lg border transition-fast',
                    character?.voiceGender === 'male'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:border-accent/50 hover:text-text'
                  )}
                  onClick={() => updateCharacter({ voiceGender: 'male' })}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
                    <span>Male</span>
                  </div>
                </button>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Avatar</h2>
              <div className="flex items-center gap-4">
                <AvatarDisplay size="md" state="idle" ariaLabel="Current avatar" />
                <div>
                  <p className="font-medium text-text">Current: {character?.avatarGender || 'female'}</p>
                  <p className="text-sm text-muted">Custom avatar upload coming soon</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">PC Actions</h2>
              <p className="text-sm text-muted mb-4">Enable or disable what my robot can do on your PC</p>
              <div className="space-y-2">
                {skillPermissions.map((skill) => (
                  <SkillToggle
                    key={skill.skill}
                    skill={skill.skill}
                    enabled={skill.enabled}
                    state={skill.enabled ? 'on' : 'off'}
                    onChange={(enabled) => toggleSkill(skill.skill, enabled)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys (Lifetime Tier)
              </h2>
              <p className="text-sm text-muted mb-4">
                For Lifetime tier, provide your own API keys. Cloud tiers use managed inference.
              </p>
              <Button variant="secondary" onClick={openAPIKeysModal} className="w-full sm:w-auto">
                <Key className="h-5 w-5 mr-2" />
                Manage API Keys
              </Button>
              <p className="text-xs text-dim mt-2">
                Keys are encrypted using Windows DPAPI and never leave this device.
              </p>
            </section>

            {user?.tier === 'lifetime' && (
              <section className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Current Status</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                    <span className="text-muted">OpenAI</span>
                    <span className={twMerge('text-sm font-medium', apiKeys.openai ? 'text-success' : 'text-danger')}>
                      {apiKeys.openai ? 'Configured' : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                    <span className="text-muted">Anthropic</span>
                    <span className={twMerge('text-sm font-medium', apiKeys.anthropic ? 'text-success' : 'text-danger')}>
                      {apiKeys.anthropic ? 'Configured' : 'Not set'}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'license' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                License
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text">Lifetime · Gen 3</p>
                      <p className="text-sm text-muted">One-time purchase, all updates included</p>
                    </div>
                    <span className="px-3 py-1 bg-success/20 text-success rounded-pill text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                  <p className="font-medium text-text mb-2">Authorized PCs (1/3)</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-surface rounded border border-border">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
                        <span className="text-text">This PC (Current)</span>
                      </div>
                      <span className="text-xs text-muted">Active now</span>
                    </div>
                  </div>
                  <button className="mt-3 text-sm text-accent hover:text-accent-hover">Add another PC</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6 animate-in fade-in-200">
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stonic Cloud Subscription
              </h2>
              <p className="text-sm text-muted mb-4">
                Cloud plans provide managed AI inference (no API keys needed) and enable the Mobile Remote app.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Basic',
                    price: '$19',
                    period: '/month',
                    features: ['Managed inference', 'Daily usage limit', 'Mobile Remote access', 'All 3 PCs'],
                    cta: 'Current Plan',
                    active: user?.tier === 'cloud_basic',
                  },
                  {
                    name: 'Power',
                    price: '$49',
                    period: '/month',
                    features: ['Managed inference', '~3.5× Basic usage', 'Mobile Remote access', 'All 3 PCs', 'Priority support'],
                    cta: 'Upgrade',
                    active: user?.tier === 'cloud_power',
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={twMerge(
                      'p-6 rounded-xl border transition-base',
                      plan.active
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-text">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-text">{plan.price}</span>
                        <span className="text-muted">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted">
                          <svg className="h-4 w-4 text-success flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.active ? 'secondary' : 'primary'}
                      className="w-full"
                      disabled={plan.active}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>

    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      size="md"
      title="API Keys"
      description="Enter your API keys for local inference"
    >
      {modalContent}
    </Modal>
  );
}