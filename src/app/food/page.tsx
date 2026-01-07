'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed, GlassWater, Leaf, WheatOff } from 'lucide-react';
import foodAndDrinkData from '@/data/food.json';

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
}

// Explicitly type the imported data
const vendors: Vendor[] = foodAndDrinkData;

// Define available filters
const filters = {
    FOOD: { label: 'Food', icon: UtensilsCrossed, category: 'Food' },
    DRINK: { label: 'Drink', icon: GlassWater, category: 'Drink' },
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
                vendor.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));

            // Filters check
            const matchesFilters = activeFilters.every(filterKey => {
                const filter = filters[filterKey as keyof typeof filters];
                if (filter.category) {
                    return vendor.category === filter.category;
                }
                if (filter.tag) {
                    return vendor.tags.includes(filter.tag);
                }
                return true;
            });

            return matchesSearch && matchesFilters;
        });
    }, [searchTerm, activeFilters]);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <header className="mb-8 flex flex-col items-center text-center">
                <div className="inline-block rounded-full bg-primary/20 p-4 mb-4">
                    <UtensilsCrossed className="h-10 w-10 text-primary" />
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Food & Drink Finder
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Find the perfect meal or a refreshing drink on the island.
                </p>
            </header>

            {/* Search and Filter UI */}
            <div className="sticky top-16 z-20 bg-background/95 py-4 backdrop-blur-sm">
                <Input 
                    placeholder="Search for food, drinks, or vibes (e.g., 'burger', 'vegan', 'coffee')" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {Object.entries(filters).map(([key, { label, icon: Icon }]) => (
                        <Button 
                            key={key}
                            variant={activeFilters.includes(key) ? 'default' : 'outline'}
                            onClick={() => handleFilterToggle(key)}
                            className="flex items-center gap-2"
                        >
                            <Icon className="h-4 w-4"/>
                            <span>{label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                        <Card key={vendor.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{vendor.name}</CardTitle>
                                <CardDescription>{vendor.cuisine} - {vendor.priceRange}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground mb-3">{vendor.description}</p>
                                <p className="text-xs font-semibold text-primary">Location: {vendor.location}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-muted-foreground">
                        <p className="font-bold">No matches found!</p>
                        <p className="text-sm">Try changing your search term or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
