import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Character, MemoryFact, SkillPermission, DailyBriefing, CloudUsage, PCLicense, RemoteSession, Skill, Persona, FactKey, Toast } from '@types';

interface UserState {
  user: User | null;
  character: Character | null;
  memoryFacts: MemoryFact[];
  skillPermissions: SkillPermission[];
  dailyBriefing: DailyBriefing | null;
  cloudUsage: CloudUsage | null;
  pcLicenses: PCLicense[];
  remoteSessions: RemoteSession[];
  toasts: Toast[];
  overlayState: 'hidden' | 'listening' | 'processing' | 'responding' | 'error';
  overlayTranscript: string;
  overlayError: string | null;
  avatarState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  setMemoryFacts: (facts: MemoryFact[]) => void;
  addMemoryFact: (fact: MemoryFact) => void;
  updateMemoryFact: (id: string, updates: Partial<MemoryFact>) => void;
  deleteMemoryFact: (id: string) => void;
  setSkillPermissions: (skills: SkillPermission[]) => void;
  toggleSkill: (skill: Skill, enabled: boolean) => void;
  setDailyBriefing: (briefing: DailyBriefing | null) => void;
  dismissBriefing: () => void;
  setCloudUsage: (usage: CloudUsage | null) => void;
  setPCLicenses: (licenses: PCLicense[]) => void;
  addPCLicense: (license: PCLicense) => void;
  removePCLicense: (id: string) => void;
  setRemoteSessions: (sessions: RemoteSession[]) => void;
  addRemoteSession: (session: RemoteSession) => void;
  endRemoteSession: (id: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setOverlayState: (state: UserState['overlayState']) => void;
  setOverlayTranscript: (text: string) => void;
  setOverlayError: (error: string | null) => void;
  setAvatarState: (state: UserState['avatarState']) => void;
  setAuthenticated: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  character: null,
  memoryFacts: [],
  skillPermissions: [],
  dailyBriefing: null,
  cloudUsage: null,
  pcLicenses: [],
  remoteSessions: [],
  toasts: [],
  overlayState: 'hidden' as const,
  overlayTranscript: '',
  overlayError: null,
  avatarState: 'idle' as const,
  isAuthenticated: false,
  isLoading: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCharacter: (character) => set({ character }),
      updateCharacter: (updates) =>
        set((state) => ({
          character: state.character ? { ...state.character, ...updates } : null,
        })),

      setMemoryFacts: (memoryFacts) => set({ memoryFacts }),
      addMemoryFact: (fact) =>
        set((state) => ({ memoryFacts: [...state.memoryFacts, fact] })),
      updateMemoryFact: (id, updates) =>
        set((state) => ({
          memoryFacts: state.memoryFacts.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
      deleteMemoryFact: (id) =>
        set((state) => ({
          memoryFacts: state.memoryFacts.filter((f) => f.id !== id),
        })),

      setSkillPermissions: (skillPermissions) => set({ skillPermissions }),
      toggleSkill: (skill, enabled) =>
        set((state) => ({
          skillPermissions: state.skillPermissions.map((s) =>
            s.skill === skill ? { ...s, enabled, updatedAt: new Date().toISOString() } : s
          ),
        })),

      setDailyBriefing: (dailyBriefing) => set({ dailyBriefing }),
      dismissBriefing: () =>
        set((state) => ({
          dailyBriefing: state.dailyBriefing
            ? { ...state.dailyBriefing, dismissedAt: new Date().toISOString() }
            : null,
        })),

      setCloudUsage: (cloudUsage) => set({ cloudUsage }),

      setPCLicenses: (pcLicenses) => set({ pcLicenses }),
      addPCLicense: (license) =>
        set((state) => ({ pcLicenses: [...state.pcLicenses, license] })),
      removePCLicense: (id) =>
        set((state) => ({
          pcLicenses: state.pcLicenses.map((l) =>
            l.id === id ? { ...l, isActive: false, deauthorizedAt: new Date().toISOString() } : l
          ),
        })),

      setRemoteSessions: (remoteSessions) => set({ remoteSessions }),
      addRemoteSession: (session) =>
        set((state) => ({ remoteSessions: [...state.remoteSessions, session] })),
      endRemoteSession: (id) =>
        set((state) => ({
          remoteSessions: state.remoteSessions.map((s) =>
            s.id === id ? { ...s, endedAt: new Date().toISOString() } : s
          ),
        })),

      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      setOverlayState: (overlayState) => set({ overlayState }),
      setOverlayTranscript: (overlayTranscript) => set({ overlayTranscript }),
      setOverlayError: (overlayError) => set({ overlayError }),

      setAvatarState: (avatarState) => set({ avatarState }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: 'my-robot-user',
      partialize: (state) => ({
        user: state.user,
        character: state.character,
        memoryFacts: state.memoryFacts,
        skillPermissions: state.skillPermissions,
        dailyBriefing: state.dailyBriefing,
        pcLicenses: state.pcLicenses,
      }),
    }
  )
);