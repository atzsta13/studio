'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed, GlassWater, Leaf, WheatOff, Coins, Search } from 'lucide-react';
import foodAndDrinkData from '@/data/food.json';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';

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

// Explicitly type the imported data
const vendors: Vendor[] = foodAndDrinkData as Vendor[];

const filters = {
    FOOD: { label: 'Food', icon: UtensilsCrossed, category: 'Food' },
    DRINK: { label: 'Drink', icon: GlassWater, category: 'Drink' },
    BUDGET: { label: 'Budget Hero', icon: Coins, isBudget: true },
    VEGAN: { label: 'Vegan', icon: Leaf, tag: 'vegan' },
    'GLUTEN-FREE': { label: 'Gluten-Free', icon: WheatOff, tag: 'gluten-free' },
};

export default function FoodFinderPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
    }, [searchTerm, activeFilters]);

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <PageHeader 
                title="Food & Drink Scout"
                description="Find the tastiest meals and the best value on Sziget. Look for the Budget Hero badge for official festival-priced options."
            />

            {/* Search and Filter UI */}
            <div className="sticky top-0 z-30 -mx-4 space-y-4 bg-background/95 px-4 pb-6 pt-4 backdrop-blur-md md:top-16 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search for food, drinks, or vibes (e.g., 'burger', 'vegan', 'cheap')"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="h-12 pl-10 text-lg shadow-sm"
                    />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {Object.entries(filters).map(([key, filter]) => {
                        const Icon = filter.icon;
                        const isActive = activeFilters.includes(key);
                        return (
                            <Button
                                key={key}
                                variant={isActive ? 'default' : 'outline'}
                                onClick={() => handleFilterToggle(key)}
                                className={`flex items-center gap-2 rounded-xl transition-all ${isActive && key === 'BUDGET' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                                <span>{filter.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Results Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                        <Card key={vendor.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-2xl hover:border-emerald-500/50 bg-card border-border/50">
                            <CardHeader className="pb-3 px-6 pt-6">
                                <div className="flex justify-between items-start mb-1">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                                        {vendor.cuisine}
                                    </Badge>
                                    <span className="text-emerald-500/80 font-bold">{vendor.priceRange}</span>
                                </div>
                                <CardTitle className="text-2xl group-hover:text-emerald-500 transition-colors uppercase font-headline">
                                    {vendor.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{vendor.location}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow px-6 pb-6">
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {vendor.description}
                                </p>

                                {vendor.budgetPrice && (
                                    <div className="mt-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 relative overflow-hidden group/budget">
                                        <div className="absolute right-[-10px] top-[-10px] rotate-12 opacity-5 group-hover/budget:scale-110 transition-transform">
                                            <Coins className="h-16 w-16" />
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Budget Hero Main</span>
                                            <span className="text-lg font-black text-emerald-600 font-mono">{vendor.budgetPrice}</span>
                                        </div>
                                        <p className="font-bold text-foreground leading-tight">{vendor.budgetOption}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Search className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">No meal matches found</h3>
                        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                            We couldn't find any stalls matching your specific hunger or filters.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-6 border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-600"
                            onClick={() => {
                                setActiveFilters([]);
                                setSearchTerm('');
                            }}
                        >
                            Reset Scout Radar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
