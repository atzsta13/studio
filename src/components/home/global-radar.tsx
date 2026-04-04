'use client';

import { motion } from 'framer-motion';
import { FESTIVAL_CONFIGS } from '@/config/festival';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function GlobalRadar() {
  const festivals = Object.values(FESTIVAL_CONFIGS);
  const [hovered, setHovered] = useState<string | null>(null);

  // Simplified Europe Map Projection
  // Mapping Lat/Lng to SVG 100x100
  // Range: Lat 45-55, Lng 5-25 (Central Europe focus)
  const project = (lat: number, lng: number) => {
    const x = ((lng - 5) / 20) * 100;
    const y = 100 - ((lat - 45) / 10) * 100;
    return { x, y };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] bg-zinc-950 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <svg className="w-full h-full p-12" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Europe Stylized Background (Abstract) */}
        <path 
          d="M10,20 Q30,15 50,25 T90,20 T80,80 T40,90 T10,70 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.2" 
          strokeDasharray="2 2" 
          className="opacity-10"
        />

        {/* Dynamic Festival Pings */}
        {festivals.map((fest) => {
          const { x, y } = project(fest.location.lat, fest.location.lng);
          const isHovered = hovered === fest.id;

          return (
            <g key={fest.id} 
               onMouseEnter={() => setHovered(fest.id)}
               onMouseLeave={() => setHovered(null)}
               className="cursor-pointer"
            >
              {/* Outer Pulse */}
              <motion.circle
                cx={x} cy={y}
                r="4"
                fill={fest.theme.primaryHex}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1], 
                  scale: [1, 2, 1] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Core Point */}
              <Link href={`/${fest.id}`}>
                <circle
                  cx={x} cy={y}
                  r="1.2"
                  fill={fest.theme.primaryHex}
                  className="shadow-2xl"
                />
              </Link>

              {/* Label */}
              <motion.g
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isHovered ? 1 : 0.4, y: 0 }}
              >
                <text
                  x={x} y={y - 4}
                  textAnchor="middle"
                  fill="white"
                  className="text-[2.5px] font-black uppercase tracking-widest italic"
                >
                  {fest.name}
                </text>
                <text
                  x={x} y={y - 7}
                  textAnchor="middle"
                  fill={fest.theme.primaryHex}
                  className="text-[1.5px] font-bold uppercase tracking-[0.2em]"
                >
                  {fest.location.city}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>

      {/* Radar Overlay Info */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Tactical Radar Active</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          Scanning {festivals.length} Sectors
        </div>
      </div>

      <div className="absolute top-8 right-8 text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Global Center</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">48.2082° N, 16.3738° E</p>
      </div>
    </div>
  );
}
