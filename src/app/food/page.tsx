'use client';

import { useState } from 'react';
import { Search, Utensils, Beer, Leaf, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import foodDrinksData from '@/data/food_drinks.json';

export default function FoodDrinksPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Food' | 'Drink'>('All');

    const filteredItems = foodDrinksData.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.type.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <header className="mb-8 flex flex-col items-center text-center">
                <div className="inline-block rounded-full bg-primary/20 p-4 mb-4">
                    <Utensils className="h-10 w-10 text-primary" />
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Food & Drink Finder
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Fuel your festival adventure with the best bites and brews.
                </p>
            </header>

            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pb-4 pt-2">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search burgers, pizza, cocktails..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['All', 'Food', 'Drink'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {item.category === 'Food' ? (
                                        <Utensils className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Beer className="h-5 w-5 text-accent-secondary" />
                                    )}
                                    <CardTitle className="text-xl">{item.name}</CardTitle>
                                </div>
                                <Badge variant="outline" className="border-primary/30 text-primary">
                                    {item.type}
                                </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {item.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-card-foreground/80 text-sm mb-4">
                                {item.description}
                            </p>
                            <div className="flex gap-2">
                                {item.isVegan && (
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
                                        <Leaf className="h-3 w-3 mr-1" /> Vegan
                                    </Badge>
                                )}
                                {item.isVegetarian && !item.isVegan && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0">
                                        Vegetarian
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground italic">No results found for your search.</p>
                </div>
            )}
        </div>
    );
}
