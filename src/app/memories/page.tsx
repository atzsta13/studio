'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Camera, Trash2, Plus, Sparkles, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Memory {
  id: string;
  text: string;
  artist?: string;
  timestamp: number;
}

const STORAGE_KEY = 'sziget_memories_v1';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newText, setNewText] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMemories(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  const addMemory = () => {
    if (!newText.trim()) return;
    const memory: Memory = {
      id: Date.now().toString(),
      text: newText,
      artist: newArtist,
      timestamp: Date.now()
    };
    const updated = [memory, ...memories];
    setMemories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewText('');
    setNewArtist('');
  };

  const removeMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 pb-32">
      <PageHeader 
        title="Digital Memory Log"
        description="A private, offline diary for your best Island of Freedom moments. Your data never leaves this device."
      />

      <Card className="mb-12 border-primary/20 bg-primary/5">
        <CardContent className="pt-6 space-y-4">
          <Input 
            placeholder="Artist / Stage (Optional)" 
            value={newArtist} 
            onChange={(e) => setNewArtist(e.target.value)}
            className="rounded-xl border-primary/20 bg-background"
          />
          <Textarea 
            placeholder="What just happened? Describe the magic..." 
            value={newText} 
            onChange={(e) => setNewText(e.target.value)}
            className="min-h-[120px] rounded-xl border-primary/20 bg-background"
          />
          <Button onClick={addMemory} className="w-full rounded-xl gap-2 font-black uppercase tracking-widest">
            <Sparkles size={18} />
            Log Moment
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {memories.length > 0 ? memories.map((memory) => (
          <Card key={memory.id} className="group overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-primary font-black uppercase italic tracking-tighter">
                  <Clock size={14} />
                  {format(memory.timestamp, 'HH:mm • MMM do')}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMemory(memory.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </Button>
              </div>
              {memory.artist && <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Location: {memory.artist}</p>}
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{memory.text}</p>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 opacity-30">
            <Camera size={64} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest">No memories logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
