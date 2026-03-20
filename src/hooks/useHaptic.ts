'use client';

import { useCallback } from 'react';

/**
 * Hook for haptic feedback on Web using the Vibration API.
 * Gracefully falls back if the browser doesn't support it.
 *
 * Vibration patterns match Android haptics:
 * - Light tap: 20ms
 * - Medium tap: 30ms
 * - Favorite tap: 40ms
 * - Success burst: [50, 30, 50] (multiple pulses)
 */
export function useHaptic() {
  const canVibrate = useCallback(() => {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    );
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!canVibrate()) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Silently fail if vibration not supported or blocked
      console.debug('Vibration not available:', e);
    }
  }, [canVibrate]);

  return {
    /**
     * Light tap - subtle feedback for navigating between options
     * Duration: 20ms
     */
    lightTap: useCallback(() => {
      vibrate(20);
    }, [vibrate]),

    /**
     * Medium tap - standard feedback for button presses
     * Duration: 30ms
     */
    mediumTap: useCallback(() => {
      vibrate(30);
    }, [vibrate]),

    /**
     * Favorite tap - distinct feedback for adding/removing favorites
     * Duration: 40ms
     */
    favoriteTap: useCallback(() => {
      vibrate(40);
    }, [vibrate]),

    /**
     * Success burst - celebratory feedback for completing actions
     * Pattern: 50ms on, 30ms off, 50ms on
     */
    successBurst: useCallback(() => {
      vibrate([50, 30, 50]);
    }, [vibrate]),

    /**
     * Custom vibration with a specific pattern
     * @param pattern - Duration in ms or array of [on, off, on, off, ...]
     */
    custom: vibrate,

    /**
     * Cancel any ongoing vibration
     */
    cancel: useCallback(() => {
      if (!canVibrate()) return;
      try {
        navigator.vibrate(0);
      } catch (e) {
        console.debug('Failed to cancel vibration:', e);
      }
    }, [canVibrate]),
  };
}
