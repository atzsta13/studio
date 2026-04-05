'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Heart, Skull } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { getFestivalConfig } from '@/config/festival-engine';

export function FeedbackSystem() {
  const { festivalId } = useParams() as { festivalId: string };
  const config = getFestivalConfig(festivalId);
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const sendFeedback = () => {
    if (!text.trim()) return;
    setSent(true);
    toast({
      title: "INTEL RECEIVED",
      description: "Your report has been transmitted to Island HQ.",
    });
    setText('');
  };

  if (sent) {
    return (
      <Card className="bg-emerald-600/10 border-emerald-500/20 shadow-2xl overflow-hidden rounded-[3rem] p-12 text-center animate-in zoom-in duration-500">
         <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shadow-inner">
            <Heart size={40} fill="currentColor" />
         </div>
         <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Transmission Success</h3>
         <p className="text-muted-foreground font-medium italic opacity-80 leading-relaxed mb-8">
            The Scouts thank you. Your feedback helps make {config.name} even more legendary.
         </p>
         <Button onClick={() => setSent(false)} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] border-emerald-500/20 hover:bg-emerald-500/10">Send Another</Button>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="bg-primary/10 border-b border-primary/10 px-10 py-8 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black uppercase italic tracking-tighter">
          <MessageSquare size={32} />
          HQ Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="space-y-8">
          <p className="text-lg font-medium text-muted-foreground italic leading-relaxed opacity-80">
             Found a bug? Have a suggestion? Spotted a secret stage? Report it directly to the {config.name} Insider team.
          </p>
          <Textarea 
            placeholder="Report your findings..." 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] rounded-[1.5rem] bg-muted/20 border-white/5 font-medium text-lg p-8 focus-visible:ring-primary"
          />
          <Button 
            onClick={sendFeedback}
            className="w-full h-20 rounded-[1.5rem] bg-primary hover:opacity-90 text-white font-black uppercase tracking-[0.3em] gap-4 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <Send size={24} /> Transmit Intel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
