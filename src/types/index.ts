/** Core types for my robot */

export type Tier = 'lifetime' | 'cloud_basic' | 'cloud_power' | 'trial';

export interface User {
  id: string;
  email: string;
  tier: Tier;
  apiKeys: Record<string, string>;
  cloudExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type Persona = 'assistant' | 'mentor' | 'best_friend' | 'custom';

export interface Character {
  id: string;
  userId: string;
  persona: Persona;
  personaText?: string;
  avatarGender: 'female' | 'male' | 'custom';
  avatarUrl?: string;
  voiceGender: 'female' | 'male';
  createdAt: string;
  updatedAt: string;
}

export type FactKey = 'name' | 'interest' | 'day_context' | 'custom';

export interface MemoryFact {
  id: string;
  userId: string;
  factKey: FactKey;
  factValue: string;
  source: 'user' | 'inferred';
  createdAt: string;
  updatedAt: string;
}

export type Skill = 'open_apps' | 'play_music' | 'web_search' | 'file_ops' | 'quick_message';

export interface SkillPermission {
  id: string;
  userId: string;
  skill: Skill;
  enabled: boolean;
  updatedAt: string;
}

export interface DailyBriefing {
  id: string;
  userId: string;
  briefingDate: string;
  pick1: BriefingPick;
  pick2: BriefingPick;
  pick3: BriefingPick;
  dismissedAt?: string;
  createdAt: string;
}

export interface BriefingPick {
  title: string;
  summary: string;
  url?: string;
  category: 'work' | 'follows' | 'goals';
}

export interface CloudUsage {
  id: string;
  userId: string;
  usageDate: string;
  tokensUsed: number;
  limitDaily: number;
  limitMonthly: number;
  plan: 'basic' | 'power';
  createdAt: string;
  updatedAt: string;
}

export interface PCLicense {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  authorizedAt: string;
  deauthorizedAt?: string;
  isActive: boolean;
}

export interface RemoteSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  voiceGender: 'female' | 'male';
  pcOnline: boolean;
  createdAt: string;
}

export interface ConversationLog {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  contentText: string;
  contentAudioPath?: string;
  tokensUsed?: number;
  createdAt: string;
}

export type OverlayState = 'hidden' | 'listening' | 'processing' | 'responding' | 'error';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type Language = 'english' | 'hindi_urdu' | 'mixed';

export interface Toast {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

export interface PCActionResult {
  success: boolean;
  pid?: number;
  results?: string[];
  error?: string;
}