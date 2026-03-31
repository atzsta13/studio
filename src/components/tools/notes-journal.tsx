'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Trash2, Clock } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = `${FESTIVAL.id}-notes`;

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

export function NotesJournal() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  const saveNote = () => {
    if (!currentNote.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: currentNote,
      timestamp: Date.now(),
    };
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    setCurrentNote('');
    toast({
      title: "NOTE SAVED",
      description: "Memories secured locally.",
    });
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/10 px-10 py-8">
        <CardTitle className="flex items-center gap-4 text-yellow-500 text-2xl font-black uppercase italic tracking-tighter">
          <FileText size={32} />
          Memories Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <Textarea
              placeholder="Record a memory, an artist you loved, or a friend you met..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="min-h-[150px] rounded-[1.5rem] bg-muted/20 border-white/5 font-medium text-lg p-8 focus-visible:ring-yellow-500"
            />
            <Button 
              onClick={saveNote}
              className="w-full h-16 rounded-[1.2rem] bg-yellow-600 hover:bg-yellow-700 text-black font-black uppercase tracking-[0.2em] gap-3"
            >
              <Save size={20} />
              Save Memory
            </Button>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
            {notes.map(note => (
              <div key={note.id} className="group p-8 rounded-[2rem] bg-background border border-white/5 shadow-inner relative">
                <div className="flex items-center gap-2 mb-4 opacity-40">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-lg font-medium leading-relaxed italic opacity-80">{note.text}</p>
                <Button 
                  variant="ghost" 
                  onClick={() => deleteNote(note.id)} 
                  className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="py-20 text-center opacity-20 italic">
                <p className="text-xl font-black uppercase tracking-tighter">No memories recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
