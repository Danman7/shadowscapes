import { render, screen } from '@testing-library/react'

import { setupMockedDuel } from '../../user'
import { DuelProvider } from '../components/DuelProvider/DuelProvider'
import { useDuelState } from './useDuelState'
import { useRefreshCompletion } from './useRefreshCompletion'

const RefreshProbe = () => {
  useRefreshCompletion()
  const { phase, round } = useDuelState()

  return (
    <>
      <output data-testid="phase">{phase}</output>
      <output data-testid="round">{round}</output>
    </>
  )
}

test('completes refresh when the duel enters the refresh phase', () => {
  render(
    <DuelProvider preloadedState={setupMockedDuel({ phase: 'refresh' })}>
      <RefreshProbe />
    </DuelProvider>,
  )

  expect(screen.getByTestId('phase')).toHaveTextContent('draw')
  expect(screen.getByTestId('round')).toHaveTextContent('1')
})

test('does not dispatch refresh completion during another phase', () => {
  render(
    <DuelProvider preloadedState={setupMockedDuel({ phase: 'act' })}>
      <RefreshProbe />
    </DuelProvider>,
  )

  expect(screen.getByTestId('phase')).toHaveTextContent('act')
  expect(screen.getByTestId('round')).toHaveTextContent('0')
})
