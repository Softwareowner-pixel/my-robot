'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvatarDisplay } from '@components/avatar/AvatarDisplay';
import { PersonaSelector } from '@components/character/PersonaSelector';
import { Button } from '@components/primitives/Button';
import { Input } from '@components/primitives/Input';
import { Modal } from '@components/primitives/Modal';
import { useUserStore } from '@stores/userStore';
import type { Persona } from '@types';

type OnboardingStep = 'welcome' | 'account' | 'character' | 'permissions' | 'complete';

export function OnboardingScreen() {
  const { setUser, setCharacter, setAuthenticated, setSkillPermissions, isLoading } = useUserStore();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [persona, setPersona] = useState<Persona>('assistant');
  const [customPersona, setCustomPersona] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { id: OnboardingStep; label: string; icon: React.ReactNode }[] = [
    { id: 'welcome', label: 'Welcome', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'account', label: 'Account', icon: <Mail className="h-5 w-5" /> },
    { id: 'character', label: 'Character', icon: <User className="h-5 w-5" /> },
    { id: 'permissions', label: 'Permissions', icon: <Lock className="h-5 w-5" /> },
    { id: 'complete', label: 'Ready', icon: <Check className="h-5 w-5" /> },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  const validateEmail = (e: string) => {
    if (!e) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (p: string) => {
    if (!p) return 'Password is required';
    if (p.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(validateEmail(email));
    setPasswordError(validatePassword(password));
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (emailError || passwordError) return;

    setIsSubmitting(true);
    // Simulate account creation
    await new Promise((r) => setTimeout(r, 1000));
    const newUser = {
      id: crypto.randomUUID(),
      email,
      tier: 'lifetime' as const,
      apiKeys: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
    setAuthenticated(true);
    setIsSubmitting(false);
    setStep('character');
  };

  const handleCharacterSubmit = () => {
    const newCharacter = {
      id: crypto.randomUUID(),
      userId: '1',
      persona,
      personaText: persona === 'custom' ? customPersona : undefined,
      avatarGender: 'female' as const,
      avatarUrl: undefined,
      voiceGender: 'female' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCharacter(newCharacter);
    setStep('permissions');
  };

  const handlePermissionsSubmit = () => {
    // Initialize default skill permissions
    const defaultSkills = [
      { id: '1', userId: '1', skill: 'open_apps' as const, enabled: true, updatedAt: new Date().toISOString() },
      { id: '2', userId: '1', skill: 'play_music' as const, enabled: true, updatedAt: new Date().toISOString() },
      { id: '3', userId: '1', skill: 'web_search' as const, enabled: true, updatedAt: new Date().toISOString() },
      { id: '4', userId: '1', skill: 'file_ops' as const, enabled: true, updatedAt: new Date().toISOString() },
      { id: '5', userId: '1', skill: 'quick_message' as const, enabled: true, updatedAt: new Date().toISOString() },
    ];
    setSkillPermissions(defaultSkills);
    setStep('complete');
  };

  const goNext = () => {
    if (step === 'welcome') setStep('account');
    else if (step === 'account') handleAccountSubmit();
    else if (step === 'character') handleCharacterSubmit();
    else if (step === 'permissions') handlePermissionsSubmit();
  };

  const goBack = () => {
    if (step === 'account') setStep('welcome');
    else if (step === 'character') setStep('account');
    else if (step === 'permissions') setStep('character');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={twMerge(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-base',
                    i < currentIndex ? 'bg-accent text-on-accent' : i === currentIndex ? 'bg-accent/20 text-accent border-2 border-accent' : 'bg-surface border-2 border-border text-muted'
                  )}
                >
                  {i < currentIndex ? <Check className="h-5 w-5" /> : s.icon}
                </div>
                <span className={twMerge('mt-1 text-xs font-medium', i <= currentIndex ? 'text-text' : 'text-muted')}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={twMerge(
                      'absolute top-5 left-[50%] w-full h-0.5 -ml-[50%] transition-base',
                      i < currentIndex ? 'bg-accent' : 'bg-border'
                    )}
                    style={{ width: i < currentIndex ? '100%' : '0%' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 animate-in fade-in-200 slide-in-from-bottom-4">
          {step === 'welcome' && (
            <div className="text-center space-y-6">
              <AvatarDisplay size="xl" state="idle" ariaLabel="my robot" />
              <div>
                <h1 className="font-display text-3xl font-bold text-text">Welcome to my robot</h1>
                <p className="mt-2 text-muted">
                  Your sci-fi AI companion that lives on your desktop.
                  Talks, remembers, and helps — all by voice.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                  <div className="p-2 bg-accent/20 text-accent rounded-lg mb-2 inline-flex">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-text">Voice First</p>
                  <p className="text-sm text-muted">Hold ` and speak</p>
                </div>
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                  <div className="p-2 bg-accent-secondary/20 text-accent-secondary rounded-lg mb-2 inline-flex">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M9 4v12" /></svg>
                  </div>
                  <p className="font-medium text-text">Remembers You</p>
                  <p className="text-sm text-muted">Name, interests, context</p>
                </div>
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                  <div className="p-2 bg-success/20 text-success rounded-lg mb-2 inline-flex">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
                  </div>
                  <p className="font-medium text-text">PC Actions</p>
                  <p className="text-sm text-muted">Open apps, play music, search</p>
                </div>
              </div>
            </div>
          )}

          {step === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-text">Create your account</h2>
                <p className="text-sm text-muted mt-1">Local account, your data stays on this PC</p>
              </div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(validateEmail(e.target.value));
                }}
                error={emailError}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                error={passwordError}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-thinking-spin mr-2" /> : ''}
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </form>
          )}

          {step === 'character' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-text">Choose your character</h2>
                <p className="text-sm text-muted mt-1">Pick a personality or create your own</p>
              </div>
              <PersonaSelector
                value={persona}
                customText={customPersona}
                onChange={(value, text) => {
                  setPersona(value as Persona);
                  if (text !== undefined) setCustomPersona(text);
                }}
              />
              <AvatarDisplay
                size="lg"
                state="idle"
                ariaLabel={`my robot, ${persona}`}
                className="mx-auto"
              />
            </div>
          )}

          {step === 'permissions' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-text">Enable skills</h2>
                <p className="text-sm text-muted mt-1">Allow my robot to help with these actions</p>
              </div>
              <div className="space-y-2">
                {[
                  { skill: 'open_apps' as const, label: 'Open Apps', desc: 'Launch Spotify, Steam, Chrome, etc.' },
                  { skill: 'play_music' as const, label: 'Play Music', desc: 'Spotify, YouTube, local files' },
                  { skill: 'web_search' as const, label: 'Web Search', desc: 'Search, open sites, play videos' },
                  { skill: 'file_ops' as const, label: 'File Operations', desc: 'Find and open files' },
                  { skill: 'quick_message' as const, label: 'Quick Message', desc: 'Send WhatsApp without leaving app' },
                ].map(({ skill, label, desc }) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-text">{label}</p>
                      <p className="text-sm text-muted">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-accent rounded border-border"
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text">You're all set!</h2>
                <p className="mt-2 text-muted">Hold <kbd className="px-2 py-0.5 bg-surface-elevated border border-border rounded font-mono text-text">`</kbd> and start talking to my robot</p>
              </div>
              <div className="p-4 bg-surface-elevated rounded-lg border border-border text-left space-y-2">
                <p className="font-medium text-text">Quick tips:</p>
                <ul className="text-sm text-muted space-y-1 pl-4 list-disc">
                  <li>Hold <kbd className="px-1.5 py-0.5 bg-bg border border-border rounded font-mono text-text">`</kbd> to talk, release to send</li>
                  <li>Say "Open Notepad" or "Play music" to test skills</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-bg border border-border rounded font-mono text-text">Esc</kbd> to dismiss the overlay</li>
                  <li>Click the circuit buttons to explore Memory, Skills, Character, Settings</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={step === 'welcome' || isSubmitting}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back
            </Button>
            <Button variant="primary" onClick={goNext} disabled={isSubmitting} size="lg">
              {step === 'complete' ? 'Get Started' : 'Continue'}
              {step !== 'complete' && <ArrowRight className="h-5 w-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}