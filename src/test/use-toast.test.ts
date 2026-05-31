import { describe, it, expect } from 'vitest'
import { reducer } from '@/hooks/use-toast'

// The reducer is pure (given a state + action it returns new state) and is
// exported directly, so we can test it without any React rendering.
// TOAST_LIMIT = 1 is an internal constant — tests verify the observable
// effect (the array is trimmed to 1 entry).

type ReducerState = Parameters<typeof reducer>[0]
type ReducerAction = Parameters<typeof reducer>[1]

type AnyToast = { id: string; open?: boolean; title?: string; description?: string }

function toast(id: string, overrides: Partial<AnyToast> = {}): AnyToast {
  return { id, open: true, title: `Toast ${id}`, ...overrides }
}

function toState(toasts: AnyToast[]): ReducerState {
  return { toasts } as ReducerState
}

function addAction(t: AnyToast): ReducerAction {
  return { type: 'ADD_TOAST', toast: t } as ReducerAction
}

function updateAction(t: Partial<AnyToast> & { id: string }): ReducerAction {
  return { type: 'UPDATE_TOAST', toast: t } as ReducerAction
}

function dismissAction(toastId?: string): ReducerAction {
  return { type: 'DISMISS_TOAST', toastId } as ReducerAction
}

function removeAction(toastId?: string): ReducerAction {
  return { type: 'REMOVE_TOAST', toastId } as ReducerAction
}

const empty = toState([])

describe('toast reducer — ADD_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('adds a toast to an empty list', () => {
    const next = reducer(empty, addAction(toast('1')))
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe('1')
  })

  it('keeps the new toast open by default', () => {
    const next = reducer(empty, addAction(toast('1')))
    expect(next.toasts[0].open).toBe(true)
  })

  it('respects TOAST_LIMIT=1 — only the newest toast survives', () => {
    const next = reducer(toState([toast('old')]), addAction(toast('new')))
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe('new')
  })

  it('does not mutate the original state', () => {
    const original = toState([])
    reducer(original, addAction(toast('1')))
    expect(original.toasts).toHaveLength(0)
  })
})

describe('toast reducer — UPDATE_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('updates the title of the matching toast', () => {
    const next = reducer(toState([toast('1', { title: 'Old' })]), updateAction({ id: '1', title: 'New' }))
    expect(next.toasts[0].title).toBe('New')
  })

  it('does not change toasts with a non-matching id', () => {
    const state = toState([toast('a', { title: 'A' }), toast('b', { title: 'B' })])
    const next = reducer(state, updateAction({ id: 'b', title: 'Updated B' }))
    const aToast = next.toasts.find((t) => t.id === 'a')
    expect(aToast?.title).toBe('A')
  })

  it('can update the open field to false via UPDATE', () => {
    const next = reducer(toState([toast('1')]), updateAction({ id: '1', open: false }))
    expect(next.toasts[0].open).toBe(false)
  })
})

describe('toast reducer — DISMISS_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('sets open=false for the matching toast', () => {
    const next = reducer(toState([toast('1'), toast('2')]), dismissAction('1'))
    const t1 = next.toasts.find((t) => t.id === '1')
    expect(t1?.open).toBe(false)
  })

  it('leaves other toasts unaffected when targeting a specific id', () => {
    const next = reducer(toState([toast('1'), toast('2')]), dismissAction('1'))
    const t2 = next.toasts.find((t) => t.id === '2')
    expect(t2?.open).toBe(true)
  })

  it('dismisses all toasts when toastId is undefined', () => {
    const next = reducer(toState([toast('1'), toast('2'), toast('3')]), dismissAction(undefined))
    next.toasts.forEach((t) => expect(t.open).toBe(false))
  })

  it('returns the same toast count after dismiss (removal is deferred)', () => {
    const next = reducer(toState([toast('1')]), dismissAction('1'))
    expect(next.toasts).toHaveLength(1)
  })
})

describe('toast reducer — REMOVE_TOAST', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('removes the toast with the matching id', () => {
    const next = reducer(toState([toast('1'), toast('2')]), removeAction('1'))
    expect(next.toasts.find((t) => t.id === '1')).toBeUndefined()
    expect(next.toasts.find((t) => t.id === '2')).toBeDefined()
  })

  it('leaves the list unchanged when the id is not found', () => {
    const next = reducer(toState([toast('1')]), removeAction('missing'))
    expect(next.toasts).toHaveLength(1)
  })

  it('removes ALL toasts when toastId is undefined', () => {
    const next = reducer(toState([toast('a'), toast('b'), toast('c')]), removeAction(undefined))
    expect(next.toasts).toHaveLength(0)
  })

  it('removing from an empty list returns an empty list', () => {
    const next = reducer(empty, removeAction('x'))
    expect(next.toasts).toHaveLength(0)
  })
})
