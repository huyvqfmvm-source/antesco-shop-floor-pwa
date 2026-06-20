import { useCallback } from 'react';
import { useApp } from '@/store/AppContext';

export function useScanFeedback() {
  const { state } = useApp();

  const scanSuccess = useCallback(() => {
    if (state.soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // Audio not available
      }
    }
    if (state.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [state.soundEnabled, state.vibrationEnabled]);

  const scanError = useCallback(() => {
    if (state.soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        // Audio not available
      }
    }
    if (state.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [state.soundEnabled, state.vibrationEnabled]);

  return { scanSuccess, scanError };
}