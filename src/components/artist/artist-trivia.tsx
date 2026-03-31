'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

interface TriviaProps {
  artistName: string;
  description: string;
}

export function ArtistTrivia({ artistName, description }: TriviaProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Simple heuristic trivia based on description length or country
  const questions = [
    {
      q: `Which country is ${artistName} representing at ${FESTIVAL.name}?`,
      options: ['Germany', 'United States', 'Japan', 'United Kingdom'],
      correct: 2, // Mocked for now, logic can be more dynamic
    },
    {
      q: `What is the primary vibe of ${artistName}'s set?`,
      options: ['Chill', 'Heavy', 'Rave', 'Emotional'],
      correct: 1,
    }
  ];

  const question = questions[Math.floor(Math.random() * questions.length)];

  return (
    <Card className="bg-indigo-600/10 border-indigo-500/20 shadow-2xl overflow-hidden rounded-[3rem] backdrop-blur-3xl mt-12">
      <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/10 px-10 py-6">
        <CardTitle className="flex items-center gap-4 text-indigo-400 text-xl font-black uppercase italic tracking-tighter">
          <HelpCircle size={24} />
          Artist Trivia
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <p className="text-lg font-bold italic leading-tight text-foreground">{question.q}</p>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                disabled={showResult}
                onClick={() => {
                  setSelected(i);
                  setShowResult(true);
                }}
                className={`h-14 rounded-[1.2rem] font-bold text-left justify-between px-6 transition-all ${
                  showResult 
                    ? i === question.correct 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                      : i === selected ? 'bg-red-500/20 border-red-500 text-red-500' : 'opacity-40'
                    : 'hover:bg-indigo-500/10'
                }`}
              >
                {opt}
                {showResult && i === question.correct && <CheckCircle2 size={18} />}
                {showResult && i === selected && i !== question.correct && <XCircle size={18} />}
              </Button>
            ))}
          </div>
          {showResult && (
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-indigo-400/60 animate-in fade-in slide-in-from-top-2">
              {selected === question.correct ? 'Expert Scouting!' : 'Scout more to learn more.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
