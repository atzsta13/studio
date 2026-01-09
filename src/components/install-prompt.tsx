'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
            return;
        }

        // Check if specifically on mobile (user agent check) to avoid showing on desktop if not desired
        // The user requirement is "if this website is opened on a smartphone"
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent);

        // Optionally remove this check if you want it on desktop too, but requirement says "smartphone"
        if (!isMobile) return;

        // IOS Detection
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check if user has dismissed it recently
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (dismissed && new Date().getTime() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
            // Don't show if dismissed in last 7 days
            return;
        }

        if (ios) {
            // For iOS, show immediately after a small delay to let page load
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else {
            // For Android/Chrome, wait for beforeinstallprompt
            const handleBeforeInstallPrompt = (e: any) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setIsVisible(true);
            };

            (window as any).addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            return () => {
                (window as any).removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('install-prompt-dismissed', new Date().getTime().toString());
    };

    if (!isMounted || !isVisible || isStandalone) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-5">
            <Card className="border-primary/20 bg-background/95 backdrop-blur shadow-lg">
                <div className="absolute right-2 top-2">
                    <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Install App</CardTitle>
                    <CardDescription>
                        Install Sziget 2026 for the best offline experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {isIOS ? (
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <p>Tap the <Share className="inline h-4 w-4 mx-1" /> share button below, then select <span className="font-semibold text-foreground">Add to Home Screen <PlusSquare className="inline h-4 w-4 mx-1" /></span>.</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Add the app to your home screen for quick access and offline maps.
                        </p>
                    )}
                </CardContent>
                {!isIOS && (
                    <CardFooter className="p-4 pt-0">
                        <Button onClick={handleInstallClick} className="w-full gap-2">
                            <Download className="h-4 w-4" />
                            Install
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
