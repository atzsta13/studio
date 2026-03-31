'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

interface TriviaProps {
  artistName: string;
  description: string;
  countryCode?: string;
  vibes?: string[];
}

function buildQuestions(artistName: string, countryCode?: string, vibes?: string[]) {
  const questions = [];

  if (countryCode) {
    const distractors = ['DE', 'US', 'GB', 'FR', 'SE', 'JP', 'AU', 'BR']
      .filter(c => c !== countryCode)
      .slice(0, 3);
    const options = [...distractors, countryCode].sort();
    const correct = options.indexOf(countryCode);
    questions.push({
      q: `What is ${artistName}'s country code?`,
      options,
      correct,
    });
  }

  if (vibes && vibes.length > 0) {
    const correctVibe = vibes[0];
    const distractors = ['Chill', 'Heavy', 'Rave', 'Emotional', 'Dance', 'Dark', 'Uplifting']
      .filter(v => !vibes.includes(v))
      .slice(0, 3);
    const options = [...distractors, correctVibe].sort();
    const correct = options.indexOf(correctVibe);
    questions.push({
      q: `Which of these is a vibe tag for ${artistName}?`,
      options,
      correct,
    });
  }

  return questions;
}

export function ArtistTrivia({ artistName, description, countryCode, vibes }: TriviaProps) {
  const questions = buildQuestions(artistName, countryCode, vibes);
  // Deterministic pick: use name length to index into questions
  const questionIndex = artistName.length % Math.max(questions.length, 1);
  const question = questions[questionIndex];

  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!question) return null;

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
