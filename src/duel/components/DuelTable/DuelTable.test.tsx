import { render, screen, within } from '@testing-library/react'

import { messages } from '../../../l10n/en'
import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../../user'
import { useDuelState } from '../../hooks'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const renderDuelTable = (
  state: ReturnType<typeof setupMockedDuel> = setupMockedDuel(),
) =>
  render(
    <DuelProvider preloadedState={state}>
      <DuelTable />
      <DuelStateProbe />
    </DuelProvider>,
  )

const DuelStateProbe = () => {
  const { phase } = useDuelState()

  return <output data-testid="duel-phase">{phase}</output>
}

test('renders the player names', () => {
  renderDuelTable()

  expect(screen.getByText(mockOrderUser.name)).toBeInTheDocument()
  expect(screen.getByText(mockChaosUser.name)).toBeInTheDocument()
})

test('renders the current phase in the center bar', () => {
  renderDuelTable({ ...setupMockedDuel(), phase: 'act' })

  expect(screen.getByText(messages.phase.act)).toBeInTheDocument()
})

test('renders cards in the correct player stacks', () => {
  renderDuelTable(
    {
      ...setupMockedDuel({
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
      phase: 'play',
    },
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
    within(screen.getByTestId('active-deck')).getByText(
      `${messages.ui.deckLabel} 2`,
    ),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-deck')).getByText(
      `${messages.ui.deckLabel} 1`,
    ),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('active-discard')).getByText(
      `${messages.ui.discardLabel} 1`,
    ),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-discard')).getByText(
      `${messages.ui.discardLabel} 2`,
    ),
  ).toBeInTheDocument()
})

test('does not render empty decks or discard piles', () => {
  renderDuelTable()

  expect(
    screen.queryByText(
      new RegExp(
        `^(${messages.ui.deckLabel}|${messages.ui.discardLabel.replace('.', '\\.')}) \\d+$`,
      ),
    ),
  ).not.toBeInTheDocument()
})

test('draws initial hands, completes the draw phase, and enters play', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { deck: mockOrderUser.activeDeck },
      inactivePlayer: { deck: mockChaosUser.activeDeck },
    }),
  )

  expect(screen.getByTestId('duel-phase')).toHaveTextContent('play')
  expect(
    within(screen.getByTestId('active-hand')).getAllByRole('article'),
  ).toHaveLength(4)
  expect(
    within(screen.getByTestId('inactive-hand')).getAllByRole('article'),
  ).toHaveLength(4)
  expect(
    within(screen.getByTestId('active-deck')).getByText(
      `${messages.ui.deckLabel} 3`,
    ),
  ).toBeInTheDocument()
  expect(
    within(screen.getByTestId('inactive-deck')).getByText(
      `${messages.ui.deckLabel} 1`,
    ),
  ).toBeInTheDocument()
})
