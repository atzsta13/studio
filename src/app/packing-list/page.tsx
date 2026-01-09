'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Tent,
  Shirt,
  Sparkles,
  BriefcaseMedical,
  Utensils,
  Zap,
  Music,
  CreditCard
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

const CATEGORIES = [
  { id: 'essentials', label: 'Essentials', icon: CreditCard, color: 'text-red-400' },
  { id: 'camping', label: 'Camping', icon: Tent, color: 'text-green-400' },
  { id: 'clothing', label: 'Clothing', icon: Shirt, color: 'text-blue-400' },
  { id: 'hygiene', label: 'Hygiene', icon: Sparkles, color: 'text-purple-400' },
  { id: 'health', label: 'Health & Safety', icon: BriefcaseMedical, color: 'text-pink-400' },
  { id: 'food', label: 'Food & Drink', icon: Utensils, color: 'text-yellow-400' },
  { id: 'electronics', label: 'Electronics', icon: Zap, color: 'text-cyan-400' },
  { id: 'fun', label: 'Fun & Extras', icon: Music, color: 'text-orange-400' },
];

const DEFAULT_ITEMS: PackingItem[] = [
  // Essentials
  { id: '1', text: 'Festival Ticket (Digital & Print)', checked: false, category: 'essentials' },
  { id: '2', text: 'ID Card / Passport', checked: false, category: 'essentials' },
  { id: '3', text: 'Wallet (Cash in HUF & Cards)', checked: false, category: 'essentials' },
  { id: '4', text: 'Phone', checked: false, category: 'essentials' },
  { id: '5', text: 'Sziget CityPass (if purchased)', checked: false, category: 'essentials' },
  { id: '6', text: 'Health Insurance Card', checked: false, category: 'essentials' },
  { id: '7', text: 'Flight / Train Tickets', checked: false, category: 'essentials' },

  // Camping
  { id: '10', text: 'Waterproof Tent (Double layer)', checked: false, category: 'camping' },
  { id: '11', text: 'Sleeping Bag (Nights can be 10°C)', checked: false, category: 'camping' },
  { id: '12', text: 'Inflatable Mattress / Yoga Mat', checked: false, category: 'camping' },
  { id: '13', text: 'Camping Pillow', checked: false, category: 'camping' },
  { id: '14', text: 'Camping Chair', checked: false, category: 'camping' },
  { id: '15', text: 'Headlamp / Flashlight (+ batteries)', checked: false, category: 'camping' },
  { id: '16', text: 'Padlock for Tent (Code lock represents less risk)', checked: false, category: 'camping' },
  { id: '17', text: 'Duct Tape (Fixes everything)', checked: false, category: 'camping' },
  { id: '18', text: 'Mallet (for tent pegs)', checked: false, category: 'camping' },
  { id: '19', text: 'Garbage Bags', checked: false, category: 'camping' },
  { id: '20', text: 'Pavilion / Gazebo (for shade)', checked: false, category: 'camping' },

  // Clothing
  { id: '30', text: 'Comfortable Sneakers (Dusty!)', checked: false, category: 'clothing' },
  { id: '31', text: 'Flip-flops / Slides (Shower essential)', checked: false, category: 'clothing' },
  { id: '32', text: 'Raincoat / Poncho (Must have)', checked: false, category: 'clothing' },
  { id: '33', text: 'Warm Hoodie / Sweater', checked: false, category: 'clothing' },
  { id: '34', text: 'Long Pants (for cold nights/mosquitoes)', checked: false, category: 'clothing' },
  { id: '35', text: 'Shorts / Skirts', checked: false, category: 'clothing' },
  { id: '36', text: 'T-Shirts / Tank Tops', checked: false, category: 'clothing' },
  { id: '37', text: 'Underwear & Socks (Bring extra)', checked: false, category: 'clothing' },
  { id: '38', text: 'Swimwear (Beach/Pool parties)', checked: false, category: 'clothing' },
  { id: '39', text: 'Cap / Bucket Hat', checked: false, category: 'clothing' },
  { id: '40', text: 'Bandana / Buff (Dust protection)', checked: false, category: 'clothing' },
  { id: '41', text: 'Sunglasses', checked: false, category: 'clothing' },

  // Hygiene
  { id: '50', text: 'Biodegradable Shower Gel', checked: false, category: 'hygiene' },
  { id: '51', text: 'Shampoo / Dry Shampoo', checked: false, category: 'hygiene' },
  { id: '52', text: 'Toothbrush & Toothpaste', checked: false, category: 'hygiene' },
  { id: '53', text: 'Deodorant', checked: false, category: 'hygiene' },
  { id: '54', text: 'Microfiber Towel (Dries fast)', checked: false, category: 'hygiene' },
  { id: '55', text: 'Toilet Paper / Tissues (Always carry some)', checked: false, category: 'hygiene' },
  { id: '56', text: 'Wet Wipes (Festival shower)', checked: false, category: 'hygiene' },
  { id: '57', text: 'Hand Sanitizer', checked: false, category: 'hygiene' },
  { id: '58', text: 'Feminine Hygiene Products', checked: false, category: 'hygiene' },
  { id: '59', text: 'Hairbrush / Hair Ties', checked: false, category: 'hygiene' },
  { id: '60', text: 'Contact Lenses / Solution', checked: false, category: 'hygiene' },

  // Health & Safety
  { id: '70', text: 'Sunscreen (SPF 30+)', checked: false, category: 'health' },
  { id: '71', text: 'Mosquito Repellent (Strong)', checked: false, category: 'health' },
  { id: '72', text: 'Earplugs (High fidelity for music)', checked: false, category: 'health' },
  { id: '73', text: 'Foam Earplugs (For sleeping)', checked: false, category: 'health' },
  { id: '74', text: 'Painkillers (Ibuprofen/Paracetamol)', checked: false, category: 'health' },
  { id: '75', text: 'Blister Plasters (Compeed)', checked: false, category: 'health' },
  { id: '76', text: 'Electrolytes / Vitamins (Recovery)', checked: false, category: 'health' },
  { id: '77', text: 'Stomach Medication', checked: false, category: 'health' },
  { id: '78', text: 'Personal Meds (Prescriptions)', checked: false, category: 'health' },
  { id: '79', text: 'First Aid Kit', checked: false, category: 'health' },

  // Electronics
  { id: '90', text: 'Power Bank (20,000mAh+ recommended)', checked: false, category: 'electronics' },
  { id: '91', text: 'Charging Cables', checked: false, category: 'electronics' },
  { id: '92', text: 'Adapter / Converter (Type C/F)', checked: false, category: 'electronics' },
  { id: '93', text: 'Bluetooth Speaker', checked: false, category: 'electronics' },
  { id: '94', text: 'Old/Backup Phone', checked: false, category: 'electronics' },

  // Food & Drink
  { id: '100', text: 'Reusable Water Bottle (Empty)', checked: false, category: 'food' },
  { id: '101', text: 'Non-perishable Snacks (Nuts, Bars)', checked: false, category: 'food' },
  { id: '102', text: 'Canned Food (Easy open)', checked: false, category: 'food' },
  { id: '103', text: 'Plastic Cutlery / Spork', checked: false, category: 'food' },
  { id: '104', text: 'Plastic Cup / Mug', checked: false, category: 'food' },
  { id: '105', text: 'Vitamins / Magnesium', checked: false, category: 'food' },

  // Fun & Extras
  { id: '110', text: 'Flag / Totem (Find your friends)', checked: false, category: 'fun' },
  { id: '111', text: 'Glitter (Bio-degradable!)', checked: false, category: 'fun' },
  { id: '112', text: 'Face Paint / Makeup', checked: false, category: 'fun' },
  { id: '113', text: 'Costumes / Fun Accessories', checked: false, category: 'fun' },
  { id: '114', text: 'Playing Cards / Uno', checked: false, category: 'fun' },
  { id: '115', text: 'Earplugs (Spare pair)', checked: false, category: 'fun' },
  { id: '116', text: 'Portable Fan', checked: false, category: 'fun' },
  { id: '117', text: 'Fanny Pack / Bumbag', checked: false, category: 'fun' }
];

const STORAGE_KEY = 'sziget_packing_checklist_v2';

export default function PackingChecklistPage() {
  const [items, setItems] = useState<PackingItem[]>(DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('essentials');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [items, isLoaded]);

  const handleToggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() === '') return;
    const newItem: PackingItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
      category: selectedCategory
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your list to the defaults?')) {
      setItems(DEFAULT_ITEMS);
    }
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const progress = Math.round((checkedCount / totalCount) * 100) || 0;

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 pb-32">
      <PageHeader
        title="Packing List"
        description="Don't be that person asking for a spare tent peg."
      />

      {/* Progress Card */}
      <Card className="mb-8 border-primary/20 bg-background/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-sm text-muted-foreground">Ready for the Island of Freedom</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">{checkedCount} / {totalCount} Items</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Add Item Input */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[150px]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <div className="flex-1 flex gap-2">
              <Input
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                placeholder="Add custom item..."
                className="flex-1"
              />
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Categories Accordion */}
      <Accordion type="multiple" defaultValue={['essentials', 'camping']} className="space-y-4">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter(item => item.category === category.id);
          const categoryChecked = categoryItems.filter(item => item.checked).length;
          const isComplete = categoryItems.length > 0 && categoryChecked === categoryItems.length;
          const CategoryIcon = category.icon;

          if (categoryItems.length === 0) return null;

          return (
            <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-background ${category.color}`}>
                      <CategoryIcon size={18} />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{category.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {categoryChecked} / {categoryItems.length} packed
                      </span>
                    </div>
                  </div>
                  {isComplete && (
                    <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                      <CheckCircle2 size={12} className="mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`
                        flex items-center justify-between rounded-md p-3 transition-colors
                        ${item.checked ? 'bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'}
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`flex-1 text-sm font-medium leading-none cursor-pointer select-none transition-all ${item.checked ? 'text-muted-foreground line-through decoration-primary/50' : 'text-foreground'}`}>
                          {item.text}
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
          Reset List
        </Button>
      </div>
    </div>
  );
}
