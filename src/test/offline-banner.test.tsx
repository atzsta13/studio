import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '@/components/layout/offline-banner'

vi.mock('next/navigation', () => ({
  useParams: () => ({ festivalId: 'sziget-2026' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/sziget-2026',
}))

// We override the mock per-test using vi.mocked helpers — simpler approach
// is two separate vi.mock factories via a factory variable.
const mockIsOnline = { value: true }

vi.mock('@/components/layout/insider-provider', () => ({
  useInsider: () => ({
    config: {},
    features: {},
    batterySaver: false,
    toggleBatterySaver: vi.fn(),
    getStorageKey: (k: string) => `test:${k}`,
    isOnline: mockIsOnline.value,
    lineup: [],
    favorites: new Set(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  }),
}))

describe('OfflineBanner', () => {
  it('renders nothing when the user is online', () => {
    mockIsOnline.value = true
    const { container } = render(<OfflineBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('does not show any text when online', () => {
    mockIsOnline.value = true
    render(<OfflineBanner />)
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument()
  })

  it('renders the banner div when the user is offline', () => {
    mockIsOnline.value = false
    const { container } = render(<OfflineBanner />)
    expect(container.firstChild).not.toBeNull()
  })

  it('displays offline mode text when offline', () => {
    mockIsOnline.value = false
    render(<OfflineBanner />)
    expect(screen.getByText(/offline mode active/i)).toBeInTheDocument()
  })

  it('mentions that core features remain operational', () => {
    mockIsOnline.value = false
    render(<OfflineBanner />)
    expect(screen.getByText(/core features remain operational/i)).toBeInTheDocument()
  })

  it('banner has a fixed-position container class when offline', () => {
    mockIsOnline.value = false
    const { container } = render(<OfflineBanner />)
    const banner = container.firstChild as HTMLElement
    expect(banner.className).toMatch(/fixed/)
  })

  it('uses a high z-index so the banner overlays all content', () => {
    mockIsOnline.value = false
    const { container } = render(<OfflineBanner />)
    const banner = container.firstChild as HTMLElement
    // z-[3000] in Tailwind classes
    expect(banner.className).toMatch(/z-\[3000\]/)
  })
})
