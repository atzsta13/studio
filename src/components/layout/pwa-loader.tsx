'use client';

import { useEffect } from 'react';
import { BASE_PATH } from '@/lib/base-path';

const PwaLoader = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` })
      .then((registration) => {
        const notifyUpdate = () => {
          if (registration.waiting) {
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        };

        // Catch updates that arrive while the page is open
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') notifyUpdate();
          });
        });

        // Catch a waiting SW that was already there on first load
        if (registration.waiting) notifyUpdate();
      })
      .catch((err) => console.error('SW registration failed:', err));

    // When the controller changes (new SW took over) reload the page
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  return null;
};

export default PwaLoader;
