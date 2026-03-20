import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import {
  useGameDispatch,
  useGameModel,
  useGameState,
} from 'src/contexts/GameContext'
import { renderGameContext } from 'src/test/renderGameContext'

test('renders children', () => {
  const { getByText } = renderGameContext(<div>Test Child</div>)
  expect(getByText('Test Child')).toBeInTheDocument()
})

test('useGameState provides game state', () => {
  function TestComponent() {
    const state = useGameState()
    return <div>Phase: {state.phase}</div>
  }

  const { getByText } = renderGameContext(<TestComponent />)

  expect(getByText(/Phase:/)).toBeInTheDocument()
})

test('useGameDispatch provides dispatch function', () => {
  function TestComponent() {
    const dispatch = useGameDispatch()
    return (
      <div>Has dispatch: {typeof dispatch === 'function' ? 'yes' : 'no'}</div>
    )
  }

  const { getByText } = renderGameContext(<TestComponent />)

  expect(getByText('Has dispatch: yes')).toBeInTheDocument()
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

  const { getByText } = renderGameContext(<TestComponent />, {
    preloadedState: { phase: 'player-turn' },
  })

  expect(getByText('Phase: player-turn')).toBeInTheDocument()
})

test('useGameModel returns a GameModel instance', () => {
  function TestComponent() {
    const model = useGameModel()
    return <div>Has model: {model !== null ? 'yes' : 'no'}</div>
  }

  const { getByText } = renderGameContext(<TestComponent />)

  expect(getByText('Has model: yes')).toBeInTheDocument()
})

test('useGameModel throws error when used outside GameProvider', () => {
  function TestComponent() {
    useGameModel()
    return <div>Should not render</div>
  }

  expect(() => {
    render(<TestComponent />)
  }).toThrow('useGameModel must be used within GameProvider')
})
