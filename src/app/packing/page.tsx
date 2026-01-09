'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

interface PackingItem {
  id: number;
  text: string;
  checked: boolean;
}

const initialChecklist: PackingItem[] = [
  { id: 1, text: 'Festival Ticket', checked: false },
  { id: 2, text: 'ID Card / Passport', checked: false },
  { id: 3, text: 'Tent & Sleeping Bag', checked: false },
  { id: 4, text: 'Sunscreen', checked: false },
  { id: 5, text: 'Reusable Water Bottle', checked: false },
  { id: 6, text: 'Power Bank', checked: false },
  { id: 7, text: 'Comfortable Shoes', checked: false },
  { id: 8, text: 'Rain Jacket', checked: false },
];

const STORAGE_KEY = 'sziget_packing_checklist';

export default function PackingChecklistPage() {
  const [items, setItems] = useState<PackingItem[]>(initialChecklist);
  const [newItemText, setNewItemText] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items === initialChecklist) return; // Skip initial save if it hasn't changed
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [items]);

  const handleToggleItem = (id: number) => {
    setItems((prev) => prev.map((item: PackingItem) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() === '') return;
    const newItem = { id: Date.now(), text: newItemText, checked: false };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item: PackingItem) => item.id !== id));
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader 
        title="Packing Checklist"
        description="Don't leave the important stuff behind! Your list is saved on this device."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>My Sziget Essentials</span>
            <span className="text-sm font-normal text-muted-foreground">
              {checkedCount} / {totalCount} packed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
            <Input
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              placeholder="Add an item (e.g., Hand Sanitizer)"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-2">
            {items.map((item: PackingItem) => (
              <div key={item.id} className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className={`text-sm font-medium leading-none ${item.checked ? 'text-muted-foreground line-through' : ''}`}>
                    {item.text}
                  </label>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
