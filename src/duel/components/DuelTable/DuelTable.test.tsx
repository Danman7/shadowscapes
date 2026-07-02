import { render, screen, within } from '@testing-library/react'

import { setupMockedDuel } from '../../../user'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const renderDuelTable = (
  state: ReturnType<typeof setupMockedDuel> = setupMockedDuel(),
) =>
  render(
    <DuelProvider preloadedState={state}>
      <DuelTable />
    </DuelProvider>,
  )

test('renders the duel table grid', () => {
  renderDuelTable()

  expect(screen.getByTestId('duel-table')).toHaveClass(
    'grid-cols-[100px_minmax(0,2fr)_100px]',
    'grid-rows-[140px_1fr_50px_1fr_140px]',
  )
})

test('renders cards in the correct player stacks', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: {
        hand: 'novice',
        deck: ['templeGuard', 'yoraSkull'],
        board: 'templeGuard',
        discard: 'acolyte',
      },
      inactivePlayer: {
        hand: ['zombie', 'haunt'],
        deck: 'bookOfAsh',
        board: 'haunt',
        discard: ['zombie', 'zombie'],
      },
    }),
  )

  expect(
    within(screen.getByTestId('active-hand')).getByRole('article', {
      name: 'Novice card',
    }),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('active-board')).getByRole('article', {
      name: 'Temple Guard card',
    }),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-board')).getByRole('article', {
      name: 'Haunt card',
    }),
  ).toBeInTheDocument()

  expect(
    within(screen.getByTestId('inactive-hand')).getAllByRole('article', {
      name: 'Card back',
    }),
  ).toHaveLength(2)
  expect(
    within(screen.getByTestId('inactive-hand')).queryByText('Zombie'),
  ).not.toBeInTheDocument()

  expect(
    within(screen.getByTestId('active-deck')).getByText('Deck 2'),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-deck')).getByText('Deck 1'),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('active-discard')).getByText('Discard 1'),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-discard')).getByText('Discard 2'),
  ).toBeInTheDocument()
})

test('does not render empty decks or discard piles', () => {
  renderDuelTable()

  expect(screen.queryByText(/^(Deck|Discard) \d+$/)).not.toBeInTheDocument()
})
