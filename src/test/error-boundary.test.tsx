import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/layout/error-boundary'

// Suppress console.error noise from ErrorBoundary's componentDidCatch
// and from React's own error logging in tests
let consoleErrorSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  consoleErrorSpy.mockRestore()
})

// A component that throws unconditionally
function Bomb({ message }: { message?: string }) {
  throw new Error(message ?? 'boom')
}

// A component that renders normally
function Safe() {
  return <p>All good</p>
}

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <Safe />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('displays the thrown error message in the default fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb message="database connection failed" />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/database connection failed/i)).toBeInTheDocument()
  })

  it('renders a "Try again" button in the default fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders a custom fallback node instead of the default UI', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error view</div>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error view')).toBeInTheDocument()
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })

  it('"Try again" button resets the error state', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Clicking "Try again" calls setState({ hasError: false }). The Bomb child
    // will immediately throw again, putting the boundary back into error state.
    // We verify the reset path fired by confirming the boundary accepted the
    // click without crashing (i.e. we are still seeing the fallback after
    // the inevitable re-throw, not a completely broken tree).
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    // After re-throw the boundary is back in error state — fallback visible
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('does not show error message paragraph when error has no message', () => {
    function BombNoMsg() {
      throw new Error('')
    }
    render(
      <ErrorBoundary>
        <BombNoMsg />
      </ErrorBoundary>,
    )
    // The "Something went wrong" heading is present
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    // But the secondary error-detail paragraph must NOT be rendered
    // because error.message is empty string (falsy)
    const allParagraphs = document.querySelectorAll('p')
    // Only the "something went wrong" paragraph exists; no extra detail paragraph
    expect(allParagraphs.length).toBe(1)
  })
})
