import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '@/components/artist/favorite-button'

vi.mock('next/navigation', () => ({
  useParams: () => ({ festivalId: 'sziget-2026' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/sziget-2026',
}))

vi.mock('@/config/festival-engine', () => ({
  FESTIVAL: {
    id: 'test-festival',
    slug: 'test',
    name: 'Test Festival',
  },
}))

const mockToggleFavorite = vi.fn()
const mockIsFavorite = vi.fn(() => false)

vi.mock('@/components/layout/insider-provider', () => ({
  useInsider: () => ({
    config: { id: 'test-festival' },
    features: {},
    batterySaver: false,
    toggleBatterySaver: vi.fn(),
    getStorageKey: (k: string) => `test:${k}`,
    isOnline: true,
    lineup: [],
    favorites: new Set(),
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mockIsFavorite.mockReturnValue(false)
})

describe('FavoriteButton', () => {
  it('renders the SAVE button when artist is not favorited', () => {
    mockIsFavorite.mockReturnValue(false)
    render(<FavoriteButton artistId="artist-1" />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders the SAVED button when artist is favorited', () => {
    mockIsFavorite.mockReturnValue(true)
    render(<FavoriteButton artistId="artist-1" />)
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument()
  })

  it('calls toggleFavorite with artistId and "must_see" when SAVE is clicked', () => {
    mockIsFavorite.mockReturnValue(false)
    render(<FavoriteButton artistId="artist-42" />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(mockToggleFavorite).toHaveBeenCalledOnce()
    expect(mockToggleFavorite).toHaveBeenCalledWith('artist-42', 'must_see')
  })

  it('calls toggleFavorite when clicking the SAVED button (un-favorite)', () => {
    mockIsFavorite.mockReturnValue(true)
    render(<FavoriteButton artistId="artist-7" />)
    fireEvent.click(screen.getByRole('button', { name: /saved/i }))
    expect(mockToggleFavorite).toHaveBeenCalledWith('artist-7', 'must_see')
  })

  it('renders a SEEN button alongside the favorite button', () => {
    render(<FavoriteButton artistId="artist-1" />)
    // Both buttons use the text "SEEN" — at least one should be present
    const seenButtons = screen.getAllByRole('button', { name: /seen/i })
    expect(seenButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('toggling the SEEN button updates state (persists to localStorage)', () => {
    render(<FavoriteButton artistId="artist-99" festivalId="test-festival" />)
    const seenBtn = screen.getAllByRole('button', { name: /seen/i })[0]
    fireEvent.click(seenBtn)
    const stored = JSON.parse(localStorage.getItem('test-festival-seen') ?? '[]') as string[]
    expect(stored).toContain('artist-99')
  })

  it('un-toggles the SEEN state on a second click', () => {
    render(<FavoriteButton artistId="artist-99" festivalId="test-festival" />)
    const seenBtn = screen.getAllByRole('button', { name: /seen/i })[0]
    fireEvent.click(seenBtn) // add to seen
    fireEvent.click(seenBtn) // remove from seen
    const stored = JSON.parse(localStorage.getItem('test-festival-seen') ?? '[]') as string[]
    expect(stored).not.toContain('artist-99')
  })

  it('applies size="sm" class differences — smaller buttons rendered', () => {
    const { container } = render(<FavoriteButton artistId="artist-1" size="sm" />)
    // In sm mode the favorite button uses h-12 class
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].className).toMatch(/h-12/)
  })

  it('applies size="lg" class by default — larger buttons rendered', () => {
    const { container } = render(<FavoriteButton artistId="artist-1" size="lg" />)
    const buttons = container.querySelectorAll('button')
    expect(buttons[0].className).toMatch(/h-16/)
  })
})
