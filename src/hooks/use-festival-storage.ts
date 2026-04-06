/**
 * useFestivalStorage — localStorage wrapper that automatically namespaces keys
 * under the active festival ID, preventing cross-festival data pollution.
 *
 * Usage:
 *   const [value, setValue, remove] = useFestivalStorage('packing-list', [])
 *
 * This will read/write `sziget-2026:packing-list` (or the active festival's ID).
 *
 * IMPORTANT: Use this instead of raw localStorage in all components to avoid
 * the cross-festival key collision described in CLAUDE.md.
 */

import { useState, useCallback, useEffect } from 'react'
import { FESTIVAL } from '@/config/festival'

export function useFestivalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const prefixedKey = `${FESTIVAL.id}:${key}`

  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Read from storage on mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(prefixedKey)
      if (raw !== null) {
        setStoredValue(JSON.parse(raw))
      }
    } catch {
      // Silently use initialValue if parsing fails
    }
  }, [prefixedKey])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        try {
          localStorage.setItem(prefixedKey, JSON.stringify(next))
        } catch {
          console.warn(`[useFestivalStorage] Could not write key "${prefixedKey}"`)
        }
        return next
      })
    },
    [prefixedKey]
  )

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(prefixedKey)
    } catch {
      // ignore
    }
    setStoredValue(initialValue)
  }, [prefixedKey, initialValue])

  return [storedValue, setValue, remove]
}
