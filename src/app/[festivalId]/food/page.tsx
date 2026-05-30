import { BASE_PATH } from '@/lib/base-path';
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, GlassWater, Leaf, WheatOff, Coins, Search, Star, Sprout } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getFestivalConfig } from '@/config/festival-engine';
import { Badge } from '@/components/ui/badge';
import { FestivalLayoutShell } from '@/components/layout/festival-layout-shell';
import { NeonButton, GlassCard } from '@/components/ui/brutalist';

// Define the type for a vendor item
interface Vendor {
    id: string;
    name: string;
    category: 'Food' | 'Drink';
    cuisine: string;
    tags: string[];
    priceRange: string;
    location: string;
    description: string;
    budgetOption?: string;
    budgetPrice?: string;
}

const filters = {
    FOOD: { label: 'Food', icon: UtensilsCrossed, category: 'Food' },
    DRINK: { label: 'Drink', icon: GlassWater, category: 'Drink' },
    BUDGET: { label: 'Budget Hero', icon: Coins, isBudget: true },
    VEGAN: { label: 'Vegan', icon: Leaf, tag: 'vegan' },
    VEGETARIAN: { label: 'Vegetarian', icon: Sprout, tag: 'vegetarian' },
    'GLUTEN-FREE': { label: 'Gluten-Free', icon: WheatOff, tag: 'gluten-free' },
};

const DIETARY_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
    vegan: { label: 'Vegan', className: 'bg-green-500/15 text-green-400 border-green-500/20' },
    vegetarian: { label: 'Vegetarian', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    'gluten-free': { label: 'GF', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    halal: { label: 'Halal', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

export default function FoodFinderPage() {
    const { festivalId } = useParams() as { festivalId: string };
    const config = getFestivalConfig(festivalId);
    
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [ratings, setRatings] = useState<Record<string, number>>({});

    useEffect(() => {
        async function fetchFood() {
            try {
                const response = await fetch(`${BASE_PATH}/data/${festivalId}/food.json`);
                if (response.ok) setVendors(await response.json());
            } catch (err) {
                console.error(err);
            } finally {
                setIsLocalLoading(false);
            }
        }
        fetchFood();

        const saved = localStorage.getItem(`${config.id}-food-ratings`);
        if (saved) setRatings(JSON.parse(saved));
    }, [festivalId, config.id]);

    const setRating = (vendorId: string, value: number) => {
        const newRatings = { ...ratings, [vendorId]: value };
        setRatings(newRatings);
        localStorage.setItem(`${config.id}-food-ratings`, JSON.stringify(newRatings));
    };

    const handleFilterToggle = (filterKey: string) => {
        setActiveFilters(prev =>
            prev.includes(filterKey)
                ? prev.filter(f => f !== filterKey)
                : [...prev, filterKey]
        );
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const lowerSearchTerm = searchTerm.toLowerCase();

            // Search term check
            const matchesSearch =
                vendor.name.toLowerCase().includes(lowerSearchTerm) ||
                vendor.cuisine.toLowerCase().includes(lowerSearchTerm) ||
                vendor.description.toLowerCase().includes(lowerSearchTerm) ||
                (vendor.budgetOption && vendor.budgetOption.toLowerCase().includes(lowerSearchTerm)) ||
                vendor.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));

            // Filters check
            const matchesFilters = activeFilters.every(filterKey => {
                const filter = filters[filterKey as keyof typeof filters];
                if ('category' in filter) {
                    return vendor.category === filter.category;
                }
                if ('tag' in filter) {
                    return vendor.tags.includes(filter.tag);
                }
                if ('isBudget' in filter) {
                    return !!vendor.budgetPrice;
                }
                return true;
            });

            return matchesSearch && matchesFilters;
        });
    }, [searchTerm, activeFilters, vendors]);

    return (
        <FestivalLayoutShell
            headerTitle="Food & Drink Scout"
            headerSubtitle={`Find the tastiest meals and the best value on ${config.name}. Look for the Budget Hero badge for official festival-priced options.`}
            headerIcon={UtensilsCrossed}
        >
            <div className="max-w-5xl mx-auto">
                {/* Search and Filter UI */}
                <div className="sticky top-0 z-30 -mx-4 space-y-6 bg-background/95 px-4 pb-10 pt-4 backdrop-blur-md md:top-0 border-b border-white/5">
                    <GlassCard className="relative p-1.5 rounded-[1.8rem] border-white/10" blur="md">
                        <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground/40" />
                        <Input
                            placeholder="Search for food, drinks, or vibes (e.g., 'burger', 'vegan', 'cheap')"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="h-16 pl-14 pr-14 rounded-[1.5rem] bg-transparent border-none text-base font-bold focus-visible:ring-0 shadow-none"
                        />
                    </GlassCard>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {Object.entries(filters).map(([key, filter]) => {
                            const Icon = filter.icon;
                            const isActive = activeFilters.includes(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleFilterToggle(key)}
                                    className={`flex items-center gap-3 rounded-[1.2rem] px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap border ${isActive ? (key === 'BUDGET' ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xl scale-105' : 'bg-foreground text-background border-foreground shadow-2xl scale-105') : 'bg-muted/10 border-white/5 text-muted-foreground hover:border-primary/40'}`}
                                >
                                    <Icon className={`h-4 w-4`} />
                                    <span>{filter.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVendors.length > 0 ? (
                        filteredVendors.map(vendor => (
                            <GlassCard key={vendor.id} className="group flex flex-col h-full">
                                <div className="p-8 pb-3">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest opacity-70 border-white/10">
                                            {vendor.cuisine}
                                        </Badge>
                                        <span className="text-emerald-500/80 font-black italic">{vendor.priceRange}</span>
                                    </div>
                                    <h3 className="text-2xl font-black group-hover:text-emerald-500 transition-colors uppercase italic tracking-tighter leading-tight mb-2">
                                        {vendor.name}
                                    </h3>
                                    <p className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm">{vendor.location}</span>
                                    </p>
                                </div>
                                <div className="p-8 flex-grow">
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed italic mb-6">
                                        "{vendor.description}"
                                    </p>
                                    {vendor.tags.some(t => t in DIETARY_BADGE_CONFIG) && (
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {vendor.tags.filter(t => t in DIETARY_BADGE_CONFIG).map(tag => (
                                                <span key={tag} className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${DIETARY_BADGE_CONFIG[tag].className}`}>
                                                    {DIETARY_BADGE_CONFIG[tag].label}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {config.features.foodRatings && (
                                        <div className="flex items-center gap-2 mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mr-2">Your Rating</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button 
                                                    key={star} 
                                                    onClick={() => setRating(vendor.id, star)}
                                                    className="transition-all hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                                                >
                                                    <Star 
                                                        size={18} 
                                                        className={star <= (ratings[vendor.id] || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/10'} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {vendor.budgetPrice && (
                                        <div className="mt-auto rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-6 relative overflow-hidden group/budget">
                                            <div className="absolute right-[-10px] top-[-10px] rotate-12 opacity-5 group-hover/budget:scale-110 transition-transform duration-1000">
                                                <Coins className="h-20 w-20 text-emerald-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Budget Hero Main</span>
                                                    <span className="text-xl font-black text-emerald-500 italic">{vendor.budgetPrice}</span>
                                                </div>
                                                <p className="font-bold text-foreground leading-tight">{vendor.budgetOption}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center">
                            <GlassCard className="py-24 border-dashed border-white/10" blur="lg">
                                <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 opacity-20">
                                    <Search className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">Zero meal matches</h3>
                                <p className="mt-6 text-muted-foreground text-xl font-medium max-w-sm mx-auto opacity-60 leading-relaxed italic">
                                    We couldn't find any stalls matching your specific hunger or filters.
                                </p>
                                <NeonButton
                                    variant="outline"
                                    size="lg"
                                    className="mt-12 px-12 h-14"
                                    onClick={() => {
                                        setActiveFilters([]);
                                        setSearchTerm('');
                                    }}
                                >
                                    Reset Scout Radar
                                </NeonButton>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>
        </FestivalLayoutShell>
    );
}
