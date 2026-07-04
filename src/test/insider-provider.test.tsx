import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { InsiderProvider, useInsider } from '@/components/layout/insider-provider';

vi.mock('@/config/festival-engine', () => {
  return {
    getFestivalConfig: (id: string = 'sziget-2026') => ({
      id,
      slug: id.split('-')[0],
      name: id.split('-')[0].toUpperCase(),
      theme: {
        primaryHsl: '0 0% 0%',
        secondaryHsl: '0 0% 0%',
        accentHsl: '0 0% 0%',
        backgroundHsl: '0 0% 0%',
        cardHsl: '0 0% 0%',
        glowColor: 'rgba(0,0,0,0.1)',
      },
      features: {
        offlineBanner: false,
      },
    }),
  };
});

function TestConsumer() {
  const { config, favorites, toggleFavorite } = useInsider();
  return (
    <div>
      <div data-testid="festival-id">{config.id}</div>
      <div data-testid="favorites-count">{favorites.size}</div>
      <button data-testid="add-fav" onClick={() => toggleFavorite('artist-1', 'must_see')}>
        Add Favorite
      </button>
    </div>
  );
}

function TestParent() {
  const [festivalId, setFestivalId] = useState('sziget-2026');
  return (
    <div>
      <button data-testid="switch-fest" onClick={() => setFestivalId('frequency-2026')}>
        Switch Festival
      </button>
      <InsiderProvider key={festivalId} festivalId={festivalId}>
        <TestConsumer />
      </InsiderProvider>
    </div>
  );
}

describe('InsiderProvider key-based remounting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resets favorites completely and does not bleed when switching festivals', () => {
    render(<TestParent />);

    // 1. Initial festival is Sziget
    expect(screen.getByTestId('festival-id').textContent).toBe('sziget-2026');
    expect(screen.getByTestId('favorites-count').textContent).toBe('0');

    // 2. Add a favorite in Sziget
    fireEvent.click(screen.getByTestId('add-fav'));
    expect(screen.getByTestId('favorites-count').textContent).toBe('1');
    expect(localStorage.getItem('sziget-2026-favorites-v2')).toContain('artist-1');

    // 3. Switch to Frequency
    fireEvent.click(screen.getByTestId('switch-fest'));

    // 4. Frequency should have 0 favorites and not contain Sziget's favorites
    expect(screen.getByTestId('festival-id').textContent).toBe('frequency-2026');
    expect(screen.getByTestId('favorites-count').textContent).toBe('0');
    expect(localStorage.getItem('frequency-2026-favorites-v2')).toBeNull();
  });
});
