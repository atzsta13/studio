import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reducer } from '@/hooks/use-toast'

// The reducer is pure (given a state + action it returns new state) and is
// exported directly, so we can test it without any React rendering.
// TOAST_LIMIT = 1 is an internal constant — tests verify the observable
// effect (the array is trimmed to 1 entry).

type AnyToast = { id: string; open?: boolean; title?: string; description?: string }
type State = { toasts: AnyToast[] }

function toast(id: string, overrides: Partial<AnyToast> = {}): AnyToast {
  return { id, open: true, title: `Toast ${id}`, ...overrides }
}

const empty: State = { toasts: [] }

describe('toast reducer — ADD_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('adds a toast to an empty list', () => {
    const next = reducer(empty as any, { type: 'ADD_TOAST', toast: toast('1') as any })
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe('1')
  })

  it('keeps the new toast open by default', () => {
    const next = reducer(empty as any, { type: 'ADD_TOAST', toast: toast('1') as any })
    expect(next.toasts[0].open).toBe(true)
  })

  it('respects TOAST_LIMIT=1 — only the newest toast survives', () => {
    const state: State = { toasts: [toast('old')] }
    const next = reducer(state as any, { type: 'ADD_TOAST', toast: toast('new') as any })
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe('new')
  })

  it('does not mutate the original state', () => {
    const original: State = { toasts: [] }
    reducer(original as any, { type: 'ADD_TOAST', toast: toast('1') as any })
    expect(original.toasts).toHaveLength(0)
  })
})

describe('toast reducer — UPDATE_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('updates the title of the matching toast', () => {
    const state: State = { toasts: [toast('1', { title: 'Old' })] }
    const next = reducer(state as any, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'New' } as any,
    })
    expect(next.toasts[0].title).toBe('New')
  })

  it('does not change toasts with a non-matching id', () => {
    const state: State = { toasts: [toast('a', { title: 'A' }), toast('b', { title: 'B' })] }
    // TOAST_LIMIT=1 means only 1 is active, but UPDATE works on whatever is stored
    const next = reducer(state as any, {
      type: 'UPDATE_TOAST',
      toast: { id: 'b', title: 'Updated B' } as any,
    })
    const aToast = next.toasts.find((t) => t.id === 'a')
    expect(aToast?.title).toBe('A')
  })

  it('can update the open field to false via UPDATE', () => {
    const state: State = { toasts: [toast('1')] }
    const next = reducer(state as any, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', open: false } as any,
    })
    expect(next.toasts[0].open).toBe(false)
  })
})

describe('toast reducer — DISMISS_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('sets open=false for the matching toast', () => {
    const state: State = { toasts: [toast('1'), toast('2')] }
    const next = reducer(state as any, { type: 'DISMISS_TOAST', toastId: '1' })
    const t1 = next.toasts.find((t) => t.id === '1')
    expect(t1?.open).toBe(false)
  })

  it('leaves other toasts unaffected when targeting a specific id', () => {
    const state: State = { toasts: [toast('1'), toast('2')] }
    const next = reducer(state as any, { type: 'DISMISS_TOAST', toastId: '1' })
    const t2 = next.toasts.find((t) => t.id === '2')
    expect(t2?.open).toBe(true)
  })

  it('dismisses all toasts when toastId is undefined', () => {
    const state: State = { toasts: [toast('1'), toast('2'), toast('3')] }
    const next = reducer(state as any, { type: 'DISMISS_TOAST', toastId: undefined })
    next.toasts.forEach((t) => expect(t.open).toBe(false))
  })

  it('returns the same toast count after dismiss (removal is deferred)', () => {
    const state: State = { toasts: [toast('1')] }
    const next = reducer(state as any, { type: 'DISMISS_TOAST', toastId: '1' })
    // DISMISS does not remove — it only marks open=false and schedules removal
    expect(next.toasts).toHaveLength(1)
  })
})

describe('toast reducer — REMOVE_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('removes the toast with the matching id', () => {
    const state: State = { toasts: [toast('1'), toast('2')] }
    const next = reducer(state as any, { type: 'REMOVE_TOAST', toastId: '1' })
    expect(next.toasts.find((t) => t.id === '1')).toBeUndefined()
    expect(next.toasts.find((t) => t.id === '2')).toBeDefined()
  })

  it('leaves the list unchanged when the id is not found', () => {
    const state: State = { toasts: [toast('1')] }
    const next = reducer(state as any, { type: 'REMOVE_TOAST', toastId: 'missing' })
    expect(next.toasts).toHaveLength(1)
  })

  it('removes ALL toasts when toastId is undefined', () => {
    const state: State = { toasts: [toast('a'), toast('b'), toast('c')] }
    const next = reducer(state as any, { type: 'REMOVE_TOAST', toastId: undefined })
    expect(next.toasts).toHaveLength(0)
  })

  it('removing from an empty list returns an empty list', () => {
    const next = reducer(empty as any, { type: 'REMOVE_TOAST', toastId: 'x' })
    expect(next.toasts).toHaveLength(0)
  })
})
