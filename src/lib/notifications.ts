// This file contains the logic for scheduling local, offline notifications.
// It uses the Notification API with `showTrigger` for true serverless scheduling.

// Type definition for the experimental showTrigger property
interface NotificationOptionsWithTrigger extends NotificationOptions {
  showTrigger?: {
    timestamp: number;
  };
}

import { LineupItem } from '@/types';

/**
 * Checks if the browser supports scheduled notifications.
 */
export function areNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'showTrigger' in Notification.prototype;
}

/**
 * Requests permission from the user to show notifications.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Schedules a notification for a favorite artist.
 * @param {LineupItem} arist The artist object with schedule details.
 */
export async function scheduleNotification(artist: LineupItem) {
  if (!areNotificationsSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const permission = await navigator.permissions.query({ name: 'notifications' });
  if (permission.state !== 'granted') return;

  const setTime = new Date(artist.startTime).getTime();
  const notificationTime = setTime - 15 * 60 * 1000; // 15 minutes before

  if (notificationTime < Date.now()) return;

  const options: NotificationOptionsWithTrigger = {
    tag: `artist-${artist.id}`,
    body: `${artist.stage} - Starts in 15 minutes`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    showTrigger: {
      timestamp: notificationTime,
    },
  };

  await registration.showNotification(`${artist.artist} is starting soon!`, options);
}

/**
 * Cancels a scheduled notification for an artist.
 * @param {string} artistId The ID of the artist.
 */
export async function cancelNotification(artistId: string) {
  if (!areNotificationsSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const notifications = await registration.getNotifications({
    tag: `artist-${artistId}`,
  });

  notifications.forEach(notification => {
    notification.close();
  });
}
