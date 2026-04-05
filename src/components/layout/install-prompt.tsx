'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { FESTIVAL } from '@/config/festival-engine';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt(): void; userChoice: Promise<{ outcome: string }> } | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> });
            // Show prompt after 5 seconds
            setTimeout(() => setShow(true), 5000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] md:bottom-8 md:left-auto md:right-8 md:w-96 animate-in slide-in-from-bottom-10 duration-700">
            <div className="bg-card/95 backdrop-blur-3xl border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-[-20px] left-[-20px] opacity-10 blur-2xl bg-primary w-40 h-40 rounded-full" />
                
                <button 
                    onClick={() => setShow(false)}
                    className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-2xl text-primary shadow-inner">
                            <Smartphone size={32} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl uppercase italic tracking-tighter leading-none mb-1">
                                {FESTIVAL.name} <span className="text-primary text-glow">Insider</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <Sparkles size={12} className="text-yellow-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offline Tactical Mode</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">
                        Install {FESTIVAL.appName} for the best offline experience. Access the map, lineup, and tools without data roaming.
                    </p>

                    <Button 
                        onClick={handleInstall}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Add to Home Screen
                    </Button>
                </div>
            </div>
        </div>
    );
}
