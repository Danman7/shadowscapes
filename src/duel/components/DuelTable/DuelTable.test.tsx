import { act, fireEvent, render, screen, within } from '@testing-library/react'

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
  const { phase, playerOrder } = useDuelState()

  return (
    <>
      <output data-testid="duel-phase">{phase}</output>
      <output data-testid="active-player-id">{playerOrder[0]}</output>
    </>
  )
}

afterEach(() => {
  vi.useRealTimers()
})

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
    within(screen.getByTestId('active-hand')).getByRole('button', {
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
    within(screen.getByTestId('active-hand')).getAllByRole('button'),
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

test('only makes affordable active-hand cards playable', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { coins: 1, hand: ['novice', 'templeGuard'] },
      phase: 'play',
    }),
  )

  const activeHand = within(screen.getByTestId('active-hand'))
  const playableCard = activeHand.getByRole('button', { name: 'Novice card' })

  expect(playableCard).toHaveClass('card-glow--primary')
  expect(
    activeHand.getByRole('article', { name: 'Temple Guard card' }),
  ).not.toHaveClass('card-glow')
  expect(screen.getByRole('button', { name: messages.ui.passLabel })).toBeVisible()
})

test('pays for a character, keeps it on board, and hands over after one second', () => {
  vi.useFakeTimers()
  const initialState = setupMockedDuel({
    activePlayer: { coins: 1, hand: 'novice' },
    phase: 'play',
  })
  const firstPlayerId = initialState.playerOrder[0]

  renderDuelTable(initialState)

  fireEvent.click(screen.getByRole('button', { name: 'Novice card' }))

  expect(
    within(screen.getByTestId('active-board')).getByRole('article', {
      name: 'Novice card',
    }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()
  expect(screen.getByTestId('active-player-id')).toHaveTextContent(firstPlayerId)

  act(() => vi.advanceTimersByTime(999))
  expect(screen.getByTestId('active-player-id')).toHaveTextContent(firstPlayerId)

  act(() => vi.advanceTimersByTime(1))

  expect(screen.getByTestId('active-player-id')).toHaveTextContent(
    initialState.playerOrder[1],
  )
  expect(
    within(screen.getByTestId('inactive-board')).getByRole('article', {
      name: 'Novice card',
    }),
  ).toBeInTheDocument()
})

test('shows an instance briefly, then discards it while handing over', () => {
  vi.useFakeTimers()

  renderDuelTable(
    setupMockedDuel({
      activePlayer: { coins: 3, hand: 'yoraSkull' },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getByRole('button', { name: "Saint Yora's Skull card" }))

  expect(
    within(screen.getByTestId('active-board')).getByText("Saint Yora's Skull"),
  ).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(1000))

  expect(
    within(screen.getByTestId('inactive-board')).queryByText(
      "Saint Yora's Skull",
    ),
  ).toBeNull()
  expect(
    within(screen.getByTestId('inactive-discard')).getByText(
      `${messages.ui.discardLabel} 1`,
    ),
  ).toBeInTheDocument()
})

test('passes both turns and enters act with the first player active', () => {
  vi.useFakeTimers()
  const initialState = setupMockedDuel({ phase: 'play' })
  const firstPlayerId = initialState.playerOrder[0]

  renderDuelTable(initialState)

  fireEvent.click(screen.getByRole('button', { name: messages.ui.passLabel }))
  act(() => vi.advanceTimersByTime(1000))

  expect(screen.getByRole('button', { name: messages.ui.passLabel })).toBeVisible()

  fireEvent.click(screen.getByRole('button', { name: messages.ui.passLabel }))
  act(() => vi.advanceTimersByTime(1000))

  expect(screen.getByTestId('duel-phase')).toHaveTextContent('act')
  expect(screen.getByTestId('active-player-id')).toHaveTextContent(firstPlayerId)
  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()
})
