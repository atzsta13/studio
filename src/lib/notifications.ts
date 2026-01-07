// This file contains the logic for scheduling local, offline notifications.
// It uses the Notification API with `showTrigger` for true serverless scheduling.

// Type definition for the experimental showTrigger property
interface NotificationOptionsWithTrigger extends NotificationOptions {
  showTrigger?: {
    timestamp: number;
  };
}

// Interface for artist data used in notifications
interface Artist {
    id: string;
    name: string;
    stage: string;
    day: string;
    start: string;
}

/**
 * Checks if the browser supports scheduled notifications.
 * This is a progressive enhancement, so it's fine if it's not supported everywhere.
 * @returns {boolean} True if supported, false otherwise.
 */
export function areNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'showTrigger' in Notification.prototype;
}

/**
 * Requests permission from the user to show notifications.
 * @returns {Promise<NotificationPermission>} The user's permission choice.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Schedules a notification for a favorite artist.
 * @param {Artist} artist The artist object with schedule details.
 */
export async function scheduleNotification(artist: Artist) {
  if (!areNotificationsSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  // Check for permission, but don't ask for it here. We'll do that via UI.
  const permission = await navigator.permissions.query({ name: 'notifications' });
  if (permission.state !== 'granted') return;

  const setTime = new Date(`${artist.day}T${artist.start}:00`).getTime();
  const notificationTime = setTime - 15 * 60 * 1000; // 15 minutes before

  // Don't schedule notifications for events in the past
  if (notificationTime < Date.now()) return;

  const options: NotificationOptionsWithTrigger = {
    tag: `artist-${artist.id}`, // Unique ID for the notification
    body: `${artist.stage} - Starts in 15 minutes`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    showTrigger: {
      timestamp: notificationTime,
    },
  };

  await registration.showNotification(`${artist.name} is starting soon!`, options);
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
        includeTriggered: true, // Important: includes scheduled notifications
    });

    notifications.forEach(notification => {
        notification.close();
    });
}
