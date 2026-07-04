import { fireEvent, render, screen } from '@testing-library/react'

import { DuelProvider } from './DuelProvider'
import { useDuelDispatch, useDuelState } from '../../hooks'
import { initiateDuelFromUsers } from '../../state'
import { mockChaosUser, mockOrderUser } from '../../../user'

function DuelConsumer() {
  const duel = useDuelState()
  const dispatch = useDuelDispatch()

  return (
    <>
      <output data-testid="round">{duel.round}</output>
      <output data-testid="phase">{duel.phase}</output>
      <output data-testid="players">{duel.playerOrder.join(',')}</output>
      <button
        type="button"
        onClick={() =>
          dispatch(initiateDuelFromUsers([mockOrderUser, mockChaosUser]))
        }
      >
        Initiate duel
      </button>
    </>
  )
}

test('provides the initial duel state to children', () => {
  render(
    <DuelProvider>
      <DuelConsumer />
    </DuelProvider>,
  )

  expect(screen.getByTestId('round')).toHaveTextContent('0')
  expect(screen.getByTestId('phase')).toHaveTextContent('setup')
})

test('merges partial preloaded state with the initial duel state', () => {
  render(
    <DuelProvider preloadedState={{ round: 3, phase: 'act' }}>
      <DuelConsumer />
    </DuelProvider>,
  )

  expect(screen.getByTestId('round')).toHaveTextContent('3')
  expect(screen.getByTestId('phase')).toHaveTextContent('act')
  expect(screen.getByTestId('players')).toHaveTextContent(',')
})

test('provides a duel dispatch that updates consumers', () => {
  render(
    <DuelProvider>
      <DuelConsumer />
    </DuelProvider>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Initiate duel' }))

  expect([
    `${mockOrderUser.id},${mockChaosUser.id}`,
    `${mockChaosUser.id},${mockOrderUser.id}`,
  ]).toContain(screen.getByTestId('players').textContent)
})

test('creates isolated state for each provider', () => {
  render(
    <>
      <DuelProvider preloadedState={{ round: 2 }}>
        <DuelConsumer />
      </DuelProvider>
      <DuelProvider preloadedState={{ round: 7 }}>
        <DuelConsumer />
      </DuelProvider>
    </>,
  )

  expect(
    screen.getAllByTestId('round').map((round) => round.textContent),
  ).toEqual(['2', '7'])
})

test('reuses the store when the provider rerenders', () => {
  const { rerender } = render(
    <DuelProvider preloadedState={{ round: 2 }}>
      <DuelConsumer />
    </DuelProvider>,
  )

  rerender(
    <DuelProvider preloadedState={{ round: 7 }}>
      <DuelConsumer />
    </DuelProvider>,
  )

  expect(screen.getByTestId('round')).toHaveTextContent('2')
})
