import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuizOptionCard } from '@/components/quiz/QuizOptionCard'

// QuizOptionCard is a pure presentational component — no provider or router
// deps needed. No mocks required.

describe('QuizOptionCard', () => {
  const baseProps = {
    label: 'Heavy Metal',
    selected: false,
    onClick: vi.fn(),
  }

  it('renders the label text', () => {
    render(<QuizOptionCard {...baseProps} />)
    expect(screen.getByText('Heavy Metal')).toBeInTheDocument()
  })

  it('renders optional emoji when provided', () => {
    render(<QuizOptionCard {...baseProps} emoji="🤘" />)
    expect(screen.getByText('🤘')).toBeInTheDocument()
  })

  it('does not render an emoji span when emoji prop is omitted', () => {
    const { container } = render(<QuizOptionCard {...baseProps} />)
    // Only the label and possibly description text — no emoji span
    const spans = container.querySelectorAll('span')
    // Should only have the label span (and description if present)
    spans.forEach(span => {
      expect(span.textContent).not.toBe('🤘')
    })
  })

  it('renders optional description when provided', () => {
    render(<QuizOptionCard {...baseProps} description="Loud and fast" />)
    expect(screen.getByText('Loud and fast')).toBeInTheDocument()
  })

  it('does not render description paragraph when prop is omitted', () => {
    render(<QuizOptionCard {...baseProps} />)
    expect(screen.queryByText('Loud and fast')).not.toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', () => {
    const onClick = vi.fn()
    render(<QuizOptionCard {...baseProps} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies selected border color class when selected=true', () => {
    const { container } = render(<QuizOptionCard {...baseProps} selected={true} />)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.className).toMatch(/border-primary/)
  })

  it('does not apply selected border color when selected=false', () => {
    const { container } = render(<QuizOptionCard {...baseProps} selected={false} />)
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button.className).not.toMatch(/bg-card.*text-white/)
  })

  it('is rendered as a <button> element', () => {
    render(<QuizOptionCard {...baseProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('onClick is not called when the card is not interacted with', () => {
    const onClick = vi.fn()
    render(<QuizOptionCard {...baseProps} onClick={onClick} />)
    expect(onClick).not.toHaveBeenCalled()
  })
})
