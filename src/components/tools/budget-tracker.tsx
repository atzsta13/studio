'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, Plus, Trash2, Wallet } from 'lucide-react';
import { FESTIVAL } from '@/config/festival';

const STORAGE_KEY = `${FESTIVAL.id}-budget`;

interface Entry {
  id: string;
  label: string;
  amount: number;
}

export function BudgetTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const addEntry = () => {
    if (!label || !amount) return;
    const newEntry: Entry = {
      id: Date.now().toString(),
      label,
      amount: parseFloat(amount),
    };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setLabel('');
    setAmount('');
  };

  const deleteEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">
      <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/10 px-10 py-8">
        <CardTitle className="flex items-center gap-4 text-emerald-500 text-2xl font-black uppercase italic tracking-tighter">
          <Wallet size={32} />
          Budget Tracker ({FESTIVAL.currency.localCode})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="What? (e.g. Beer)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-16 rounded-[1.2rem] bg-muted/20 border-white/5 font-bold"
            />
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 rounded-[1.2rem] bg-muted/20 border-white/5 font-bold"
              />
              <Button onClick={addEntry} className="h-16 w-16 rounded-[1.2rem] bg-emerald-600 hover:bg-emerald-700">
                <Plus size={24} />
              </Button>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-2">Total Spent</p>
            <p className="text-5xl font-black italic tracking-tighter text-emerald-500">
              {FESTIVAL.currency.localCode} {total.toLocaleString()}
            </p>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-background border border-white/5 shadow-inner">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{entry.label}</p>
                  <p className="text-xl font-bold tracking-tight">{entry.amount.toLocaleString()} {FESTIVAL.currency.localCode}</p>
                </div>
                <Button variant="ghost" onClick={() => deleteEntry(entry.id)} className="text-muted-foreground hover:text-red-500 rounded-full">
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
