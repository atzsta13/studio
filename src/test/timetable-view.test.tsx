import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { getFestivalConfig } from '@/config/festival-engine'
import type { LineupItem } from '@/types'

const config = getFestivalConfig('sziget-2026')

const insider = {
  config,
  favorites: new Set<string>(),
  allFavoriteIds: new Set<string>(),
  conflicts: new Set<string>(),
  toggleFavorite: vi.fn(),
  getFavoriteTier: () => null,
}

vi.mock('@/components/layout/insider-provider', () => ({
  useInsider: () => insider,
}))

const TimetableView = (await import('@/components/timetable/timetable-view')).default

function slot(id: string, artist: string, stage: string, start: string, end: string): LineupItem {
  return {
    id,
    artist,
    day: 'Sunday',
    stage,
    startTime: `2026-08-09T${start}:00.000+02:00`,
    endTime: `2026-08-09T${end}:00.000+02:00`,
    showInSchedule: true,
  } as LineupItem
}

const lineup: LineupItem[] = [
  slot('1', 'Opener', 'Main Stage', '16:00', '17:00'),
  slot('2', 'Headliner', 'Main Stage', '21:00', '23:00'),
  slot('3', 'Side Act', 'Arzenál', '18:30', '19:15'),
  // Post-midnight set — belongs to the same festival day via the 06:00 rollover.
  slot('4', 'Night Owl', 'Arzenál', '01:00', '02:30'),
]

describe('TimetableView — zoomable grid', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders one column per stage and every scheduled act', () => {
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    expect(screen.getByText('Opener')).toBeInTheDocument()
    expect(screen.getByText('Night Owl')).toBeInTheDocument()
    // Stage name appears in both the filter pill and the sticky column header.
    expect(screen.getAllByText('Main Stage').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Arzenál').length).toBeGreaterThanOrEqual(2)
  })

  it('scales the board when zooming and persists the new zoom', async () => {
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    const cardBox = (name: string) => (screen.getByText(name).closest('[data-no-pan]') as HTMLElement).style

    expect(screen.getByText('100%')).toBeInTheDocument()
    const topBefore = Number.parseFloat(cardBox('Headliner').top)
    const heightBefore = Number.parseFloat(cardBox('Headliner').height)

    fireEvent.click(screen.getByLabelText('Zoom in'))
    await waitFor(() => expect(screen.queryByText('100%')).not.toBeInTheDocument())

    expect(Number.parseFloat(cardBox('Headliner').top)).toBeGreaterThan(topBefore)
    expect(Number.parseFloat(cardBox('Headliner').height)).toBeGreaterThan(heightBefore)
    expect(localStorage.getItem('sziget-2026-timetable-zoom')).toBeTruthy()

    fireEvent.click(screen.getByLabelText('Zoom out'))
    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument())
    expect(Number.parseFloat(cardBox('Headliner').top)).toBeCloseTo(topBefore, 5)
  })

  it('restores a persisted zoom on mount', async () => {
    localStorage.setItem('sziget-2026-timetable-zoom', '0.5')
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument())
  })

  it('positions the post-midnight set below the evening sets (06:00 rollover)', () => {
    const { container } = render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    const top = (name: string) => {
      const card = screen.getByText(name).closest('[data-no-pan]') as HTMLElement
      return Number.parseFloat(card.style.top)
    }
    expect(top('Opener')).toBeLessThan(top('Headliner'))
    expect(top('Headliner')).toBeLessThan(top('Night Owl'))
    expect(container.querySelectorAll('[data-no-pan]').length).toBe(4)
  })

  it('hides a stage column when its filter pill is toggled', async () => {
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    fireEvent.click(screen.getAllByText('Arzenál')[0])
    await waitFor(() => expect(screen.queryByText('Night Owl')).not.toBeInTheDocument())
    expect(screen.getByText('Opener')).toBeInTheDocument()
  })

  it('filters by artist search and shows an empty state for no match', async () => {
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    fireEvent.change(screen.getByPlaceholderText('Search artists…'), { target: { value: 'head' } })
    await waitFor(() => expect(screen.queryByText('Opener')).not.toBeInTheDocument())
    expect(screen.getByText('Headliner')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search artists…'), { target: { value: 'zzz' } })
    await waitFor(() => expect(screen.getByText(/No artists match/)).toBeInTheDocument())
  })

  it('zooms on ctrl+wheel (trackpad pinch) and not on a plain wheel', async () => {
    const { container } = render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    const scroller = container.querySelector('.overflow-auto') as HTMLElement

    fireEvent.wheel(scroller, { deltaY: -100, clientX: 200, clientY: 300 })
    expect(screen.getByText('100%')).toBeInTheDocument()

    fireEvent.wheel(scroller, { deltaY: -100, clientX: 200, clientY: 300, ctrlKey: true })
    await waitFor(() => expect(screen.queryByText('100%')).not.toBeInTheDocument())
  })

  it('zooms on a two-finger pinch', async () => {
    const { container } = render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    const scroller = container.querySelector('.overflow-auto') as HTMLElement

    fireEvent.touchStart(scroller, {
      touches: [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 100 }],
    })
    fireEvent.touchMove(scroller, {
      touches: [{ clientX: 50, clientY: 100 }, { clientX: 250, clientY: 100 }],
    })

    // Fingers moved from 100px to 200px apart → 2x.
    await waitFor(() => expect(screen.getByText('200%')).toBeInTheDocument())
  })

  it('zooms in on a double-click of the grid background', async () => {
    const { container } = render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    const scroller = container.querySelector('.overflow-auto') as HTMLElement

    fireEvent.dblClick(scroller, { clientX: 200, clientY: 200 })
    await waitFor(() => expect(screen.getByText('130%')).toBeInTheDocument())

    // Alt-double-click is the way back out.
    fireEvent.dblClick(scroller, { clientX: 200, clientY: 200, altKey: true })
    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument())
  })

  it('renders slots as labelled blocks when zoomed all the way out', async () => {
    localStorage.setItem('sziget-2026-timetable-zoom', '0.1')
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)

    await waitFor(() => expect(screen.getByText('10%')).toBeInTheDocument())
    // No room for text at 20px-wide columns, but the slot stays a labelled link.
    expect(screen.queryByText('Headliner')).not.toBeInTheDocument()
    const block = screen.getByLabelText('Headliner, 21:00 to 23:00')
    expect(block).toHaveAttribute('href', '/sziget-2026/artist/2')
  })

  it('drops the zoom controls in list mode', async () => {
    render(<TimetableView lineup={lineup} festivalId="sziget-2026" />)
    fireEvent.click(screen.getByText('LIST'))
    await waitFor(() => expect(screen.queryByLabelText('Zoom in')).not.toBeInTheDocument())
    expect(screen.getByText('Opener')).toBeInTheDocument()
  })
})
