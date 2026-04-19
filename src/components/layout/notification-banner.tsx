'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { areNotificationsSupported, requestNotificationPermission } from '@/lib/notifications';

interface NotificationBannerProps {
    festivalId: string;
    hasFavorites: boolean;
}

export function NotificationBanner({ festivalId, hasFavorites }: NotificationBannerProps) {
    const [supported, setSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setSupported(areNotificationsSupported());
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
        const key = `${festivalId}-notif-dismissed`;
        setDismissed(!!localStorage.getItem(key));
    }, [festivalId]);

    const handleEnable = async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') {
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(`${festivalId}-notif-dismissed`, '1');
        setDismissed(true);
    };

    if (!supported || !hasFavorites || dismissed || permission !== 'default') return null;

    return (
        <div className="flex items-center gap-4 rounded-[2rem] border border-primary/20 bg-primary/5 px-6 py-4 mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Get Set Reminders</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Enable notifications to get a 15-min heads-up before your saved artists play.
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={handleEnable}
                    className="rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95"
                >
                    Enable
                </button>
                <button onClick={handleDismiss} className="rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
