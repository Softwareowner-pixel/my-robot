'use client';

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import '@components/primitives/Toast';
import { HubScreen } from '@components/screens/HubScreen';
import { OnboardingScreen } from '@components/screens/OnboardingScreen';
import { SettingsScreen } from '@components/screens/SettingsScreen';
import { PushToTalkOverlay } from '@components/overlay/PushToTalkOverlay';
import { useUserStore } from '@stores/userStore';
import { AvatarDisplay } from '@components/avatar/AvatarDisplay';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function AppContent() {
  const {
    isAuthenticated,
    overlayState,
    overlayTranscript,
    overlayError,
    avatarState,
    setOverlayState,
    setOverlayTranscript,
    setOverlayError,
    setAvatarState,
    addToast,
  } = useUserStore();

  // Simulate voice interaction for demo
  const handleHotkeyPress = () => {
    setOverlayState('listening');
    setAvatarState('listening');
    // Simulate transcript appearing
    setTimeout(() => {
      setOverlayTranscript('Open Notepad');
    }, 500);
  };

  const handleHotkeyRelease = () => {
    setOverlayState('processing');
    setAvatarState('thinking');
    // Simulate AI response
    setTimeout(() => {
      setOverlayState('responding');
      setOverlayTranscript('');
      setAvatarState('speaking');
      addToast({ variant: 'success', title: 'Opened Notepad', duration: 3000 });
      setTimeout(() => {
        setOverlayState('hidden');
        setAvatarState('idle');
      }, 2000);
    }, 1500);
  };

  const handleDismiss = () => {
    setOverlayState('hidden');
    setAvatarState('idle');
    setOverlayError(null);
  };

  const handleRetry = () => {
    setOverlayError(null);
    handleHotkeyPress();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Main content */}
      <main className="flex-1">
        <Routes>
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/" element={<HubScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Push-to-Talk Overlay */}
      <PushToTalkOverlay
        state={overlayState}
        transcript={overlayTranscript}
        errorMessage={overlayError}
        onDismiss={handleDismiss}
        onRetry={handleRetry}
        onHotkeyPress={handleHotkeyPress}
        onHotkeyRelease={handleHotkeyRelease}
        language="english"
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}