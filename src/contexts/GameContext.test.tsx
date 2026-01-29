import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { useGameDispatch, useGameState } from '@/contexts/GameContext'
import { renderGameContext } from '@/test/mocks/testHelpers'

test('renders children', () => {
  const { container } = renderGameContext(<div>Test Child</div>)
  expect(container.textContent).toContain('Test Child')
})

test('useGameState provides game state', () => {
  function TestComponent() {
    const state = useGameState()
    return <div>Phase: {state.phase}</div>
  }

  const { container } = renderGameContext(<TestComponent />)

  expect(container.textContent).toContain('Phase:')
})

test('useGameDispatch provides dispatch function', () => {
  function TestComponent() {
    const dispatch = useGameDispatch()
    return (
      <div>Has dispatch: {typeof dispatch === 'function' ? 'yes' : 'no'}</div>
    )
  }

  const { container } = renderGameContext(<TestComponent />)

  expect(container.textContent).toContain('Has dispatch: yes')
})

test('useGameState throws error when used outside GameProvider', () => {
  function TestComponent() {
    useGameState()
    return <div>Should not render</div>
  }

  expect(() => {
    render(<TestComponent />)
  }).toThrow('useGameState must be used within GameProvider')
})

test('useGameDispatch throws error when used outside GameProvider', () => {
  function TestComponent() {
    useGameDispatch()
    return <div>Should not render</div>
  }

  expect(() => {
    render(<TestComponent />)
  }).toThrow('useGameDispatch must be used within GameProvider')
})

test('GameProvider supports preloaded state overrides', () => {
  function TestComponent() {
    const state = useGameState()
    return <div>Phase: {state.phase}</div>
  }

  const { container } = renderGameContext(<TestComponent />, {
    preloadedState: { phase: 'player-turn' },
  })

  expect(container.textContent).toContain('Phase: player-turn')
})
