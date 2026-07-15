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
  const { actPlayerId, phase, playerOrder, winnerId } = useDuelState()

  return (
    <>
      <output data-testid="duel-phase">{phase}</output>
      <output data-testid="active-player-id">{playerOrder[0]}</output>
      <output data-testid="act-player-id">{actPlayerId}</output>
      <output data-testid="winner-id">{winnerId}</output>
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

test('renders the current round and phase in the center bar', () => {
  renderDuelTable({ ...setupMockedDuel(), phase: 'act' })

  expect(
    screen.getByText(`Round 1: ${messages.phase.act}`),
  ).toBeInTheDocument()
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

test('uses compact cards on the board and full cards in the active hand', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { hand: 'novice', board: 'templeGuard' },
      inactivePlayer: { board: 'haunt' },
      phase: 'play',
    }),
  )

  const activeBoardCard = within(
    screen.getByTestId('active-board'),
  ).getByRole('article', { name: 'Temple Guard card' })
  const inactiveBoardCard = within(
    screen.getByTestId('inactive-board'),
  ).getByRole('article', { name: 'Haunt card' })
  const handCard = within(screen.getByTestId('active-hand')).getByRole(
    'button',
    { name: 'Novice card' },
  )

  expect(activeBoardCard).toHaveClass('card-compact')
  expect(inactiveBoardCard).toHaveClass('card-compact')
  expect(handCard).toHaveClass('card')
  expect(handCard).not.toHaveClass('card-compact')
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
    activePlayer: { coins: 2, hand: 'novice' },
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

test('shows a terminal winner modal and stops automation after the last coin is spent', () => {
  vi.useFakeTimers()
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, hand: 'yoraSkull', board: 'novice' },
    phase: 'play',
  })
  const [loserId, winnerId] = initialState.playerOrder
  const winnerName = initialState.players[winnerId].name

  renderDuelTable(initialState)

  fireEvent.click(screen.getByRole('button', { name: "Saint Yora's Skull card" }))

  const dialog = screen.getByRole('dialog', { name: `${winnerName} wins!` })

  expect(dialog).toHaveTextContent(messages.ui.duelCompleteMessage)
  expect(
    within(dialog).queryByRole('button', { name: messages.ui.closeLabel }),
  ).toBeNull()
  expect(screen.getByTestId('winner-id')).toHaveTextContent(winnerId)
  expect(screen.getByTestId('active-player-id')).toHaveTextContent(loserId)
  expect(
    screen.queryByRole('dialog', { name: "Saint Yora's Skull" }),
  ).toBeNull()

  act(() => vi.advanceTimersByTime(2000))

  expect(screen.getByTestId('active-player-id')).toHaveTextContent(loserId)
  expect(screen.getByTestId('duel-phase')).toHaveTextContent('play')
})

test('keeps a targeted instance pending until its board target is selected', () => {
  vi.useFakeTimers()

  renderDuelTable(
    setupMockedDuel({
      activePlayer: { coins: 4, hand: 'yoraSkull', board: 'novice' },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getByRole('button', { name: "Saint Yora's Skull card" }))

  expect(
    within(screen.getByTestId('active-board')).getByRole('article', {
      name: "Saint Yora's Skull card",
    }),
  ).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(1000))

  expect(
    within(screen.getByTestId('active-board')).getByRole('article', {
      name: "Saint Yora's Skull card",
    }),
  ).toBeInTheDocument()

  fireEvent.click(
    within(screen.getByTestId('active-board')).getByRole('button', {
      name: 'Novice card',
    }),
  )

  expect(
    within(screen.getByTestId('active-board')).queryByText(
      "Saint Yora's Skull",
    ),
  ).toBeNull()

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
  expect(screen.getByTestId('act-player-id')).toHaveTextContent(firstPlayerId)
  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()
})

test('selects a bottom attacker, animates upward, then deals damage', () => {
  vi.useFakeTimers()
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { board: 'novice' },
      inactivePlayer: { board: 'haunt' },
      phase: 'act',
    }),
  )

  const activeBoard = within(screen.getByTestId('active-board'))
  const inactiveBoard = within(screen.getByTestId('inactive-board'))

  fireEvent.click(activeBoard.getByRole('button', { name: 'Novice card' }))
  const defender = inactiveBoard.getByRole('button', { name: 'Haunt card' })
  fireEvent.click(defender)

  expect(
    activeBoard
      .getByRole('article', { name: 'Novice card' })
      .closest('.board-card'),
  ).toHaveClass('card-attack-up')
  expect(
    within(defender).getByText('Life').nextElementSibling,
  ).toHaveTextContent('3')

  act(() => vi.advanceTimersByTime(200))

  expect(
    within(
      inactiveBoard.getByRole('article', { name: 'Haunt card' }),
    ).getByText('Life').nextElementSibling,
  ).toHaveTextContent('2')
})

test('moves the second acting player to the bottom and animates upward', () => {
  vi.useFakeTimers()
  const initialState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const secondPlayerId = initialState.playerOrder[1]

  renderDuelTable(initialState)

  fireEvent.click(screen.getByRole('button', { name: messages.ui.passLabel }))
  act(() => vi.advanceTimersByTime(1000))

  expect(screen.getByTestId('active-player-id')).toHaveTextContent(
    secondPlayerId,
  )

  const activeBoard = within(screen.getByTestId('active-board'))
  const inactiveBoard = within(screen.getByTestId('inactive-board'))

  fireEvent.click(activeBoard.getByRole('button', { name: 'Zombie card' }))
  fireEvent.click(inactiveBoard.getByRole('button', { name: 'Novice card' }))

  expect(
    activeBoard
      .getByRole('article', { name: 'Zombie card' })
      .closest('.board-card'),
  ).toHaveClass('card-attack-up')

  act(() => vi.advanceTimersByTime(200))

  expect(
    within(screen.getByTestId('inactive-discard')).getByText(
      `${messages.ui.discardLabel} 1`,
    ),
  ).toBeInTheDocument()
})

test('automatically hands over an act turn when every character is stunned', () => {
  vi.useFakeTimers()
  const initialState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [firstPlayerId, secondPlayerId] = initialState.playerOrder
  const cardId = initialState.players[firstPlayerId].board[0]

  if (initialState.cards[cardId].type !== 'character') {
    throw new Error('Expected a character')
  }
  initialState.cards[cardId].turnsStunned = 1

  renderDuelTable(initialState)

  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()
  expect(screen.getByTestId('act-player-id')).toHaveTextContent(firstPlayerId)

  act(() => vi.advanceTimersByTime(999))
  expect(screen.getByTestId('act-player-id')).toHaveTextContent(firstPlayerId)

  act(() => vi.advanceTimersByTime(1))
  expect(screen.getByTestId('act-player-id')).toHaveTextContent(secondPlayerId)
  expect(screen.getByTestId('active-player-id')).toHaveTextContent(
    secondPlayerId,
  )
})
