'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie, Cell as PieCell } from 'recharts';
import { LineChart, Line } from 'recharts';
import { FESTIVAL } from '@/config/festival';
import { Zap, PieChart as PieIcon } from 'lucide-react';
import type { LineupItem } from '@/types';

export function GenreBreakdown({ artists }: { artists: LineupItem[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      a.genres?.forEach((g: string) => {
        if (g === 'MUSIC') return;
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [artists]);

  return (
    <Card className="bg-card/50 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem] mb-20">
      <CardHeader className="bg-primary/10 border-b border-primary/10 px-10 py-8 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-4 text-primary text-2xl font-black uppercase italic tracking-tighter">
          <PieIcon size={32} />
          Lineup DNA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#131315', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
              />
              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FESTIVAL.theme.primaryHex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
