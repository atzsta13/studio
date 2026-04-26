import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

// The rate-limiter uses a module-level Map. Each test must use a unique key
// so tests don't share state. Fake timers allow testing window expiry.

let keyCounter = 0
function uniqueKey(label: string) {
  return `test-${label}-${++keyCounter}`
}

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows the very first request for a new key', () => {
    expect(rateLimit(uniqueKey('first'), { windowMs: 60_000, maxRequests: 5 })).toBe(true)
  })

  it('allows requests up to the maxRequests limit', () => {
    const key = uniqueKey('up-to-max')
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, { windowMs: 60_000, maxRequests: 5 })).toBe(true)
    }
  })

  it('blocks the request that exceeds maxRequests', () => {
    const key = uniqueKey('block')
    for (let i = 0; i < 3; i++) {
      rateLimit(key, { windowMs: 60_000, maxRequests: 3 })
    }
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 3 })).toBe(false)
  })

  it('continues blocking while still inside the window', () => {
    const key = uniqueKey('continues-blocking')
    for (let i = 0; i < 2; i++) {
      rateLimit(key, { windowMs: 60_000, maxRequests: 2 })
    }
    vi.advanceTimersByTime(59_999) // still inside the window
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 2 })).toBe(false)
  })

  it('resets the counter after the window expires', () => {
    const key = uniqueKey('reset')
    rateLimit(key, { windowMs: 60_000, maxRequests: 1 })
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(true)
  })

  it('different keys are completely independent', () => {
    const keyA = uniqueKey('indep-a')
    const keyB = uniqueKey('indep-b')

    rateLimit(keyA, { windowMs: 60_000, maxRequests: 1 })
    // keyA is now at its limit
    expect(rateLimit(keyA, { windowMs: 60_000, maxRequests: 1 })).toBe(false)
    // keyB is untouched
    expect(rateLimit(keyB, { windowMs: 60_000, maxRequests: 1 })).toBe(true)
  })

  it('respects a very tight window (100ms)', () => {
    const key = uniqueKey('tight')
    rateLimit(key, { windowMs: 100, maxRequests: 1 })
    expect(rateLimit(key, { windowMs: 100, maxRequests: 1 })).toBe(false)

    vi.advanceTimersByTime(101)
    expect(rateLimit(key, { windowMs: 100, maxRequests: 1 })).toBe(true)
  })

  it('a maxRequests of 1 allows exactly one call per window', () => {
    const key = uniqueKey('max-1')
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(true)
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(false)

    vi.advanceTimersByTime(60_001)

    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(true)
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: 1 })).toBe(false)
  })

  it('increments correctly when called sequentially up to limit', () => {
    const key = uniqueKey('seq')
    const limit = 10
    for (let i = 0; i < limit; i++) {
      const result = rateLimit(key, { windowMs: 60_000, maxRequests: limit })
      expect(result).toBe(true)
    }
    expect(rateLimit(key, { windowMs: 60_000, maxRequests: limit })).toBe(false)
  })
})
