import { act, render, screen, within } from '@testing-library/react'

import { messages } from '../../../l10n/en'
import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../../user'
import { AUTOMATED_ACTION_DELAY_MS } from '../../constants'
import { useDuelState } from '../../hooks'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const soloMode = {
  type: 'solo-random-ai',
  humanPlayerId: mockOrderUser.id,
  aiPlayerId: mockChaosUser.id,
} as const

const renderDuelTable = (state: ReturnType<typeof setupMockedDuel>) =>
  render(
    <DuelProvider preloadedState={state}>
      <DuelTable />
      <RandomAiStateProbe />
    </DuelProvider>,
  )

const RandomAiStateProbe = () => {
  const { cards, pendingPlayedCardId, players } = useDuelState()
  const human = players[mockOrderUser.id]
  const ai = players[mockChaosUser.id]
  const aiZombie = ai.board
    .map((cardId) => cards[cardId])
    .find((card) => card.baseId === 'zombie' && card.type === 'character')
  const aiHaunt = ai.board
    .map((cardId) => cards[cardId])
    .find((card) => card.baseId === 'haunt' && card.type === 'character')
  const humanNovice = human.board
    .map((cardId) => cards[cardId])
    .find((card) => card.baseId === 'novice' && card.type === 'character')
  const aiZombieLife = aiZombie?.type === 'character' ? aiZombie.life : ''
  const aiHauntLife = aiHaunt?.type === 'character' ? aiHaunt.life : ''
  const humanNoviceLife =
    humanNovice?.type === 'character' ? humanNovice.life : ''

  return (
    <>
      <output data-testid="ai-board-size">{ai.board.length}</output>
      <output data-testid="ai-hand-size">{ai.hand.length}</output>
      <output data-testid="ai-has-acted">
        {String(ai.hasActedThisPhase)}
      </output>
      <output data-testid="human-board-size">{human.board.length}</output>
      <output data-testid="human-discard-size">{human.discard.length}</output>
      <output data-testid="pending-card">
        {pendingPlayedCardId ? cards[pendingPlayedCardId].baseId : ''}
      </output>
      <output data-testid="ai-zombie-life">{aiZombieLife}</output>
      <output data-testid="ai-haunt-life">{aiHauntLife}</output>
      <output data-testid="human-novice-life">{humanNoviceLife}</output>
    </>
  )
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('AI plays a random affordable card during its play turn', () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const state = setupMockedDuel({
    inactivePlayer: { coins: 2, hand: ['zombie', 'haunt'] },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  renderDuelTable(state)

  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('0')

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(
    within(screen.getByTestId('inactive-board')).getByRole('article', {
      name: 'Zombie card',
    }),
  ).toBeInTheDocument()
  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('1')
  expect(screen.getByTestId('ai-hand-size')).toHaveTextContent('1')
})

test('AI plays a useful card despite having a large board lead', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: {
      board: ['zombie', 'zombie', 'haunt', 'burrick'],
      hand: 'zombie',
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  renderDuelTable(state)

  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('ai-has-acted')).toHaveTextContent('true')
  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('5')
  expect(screen.getByTestId('ai-hand-size')).toHaveTextContent('0')
})

test('AI passes play when it has no playable cards', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 0,
      hand: 'haunt',
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('ai-has-acted')).toHaveTextContent('true')
  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('0')
  expect(screen.getByTestId('ai-hand-size')).toHaveTextContent('1')
})

test("AI selects a random allied board target for Saint Yora's Skull", () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: 'zombie',
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('pending-card')).toHaveTextContent('yoraSkull')

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('pending-card')).toHaveTextContent('')
  expect(screen.getByTestId('ai-zombie-life')).toHaveTextContent('3')
})

test('AI leaves a pending target effect alone when no valid targets exist', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    inactivePlayer: {
      board: 'yoraSkull',
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]
  state.pendingPlayedCardId = state.players[mockChaosUser.id].board[0]

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('pending-card')).toHaveTextContent('yoraSkull')
  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('1')
})

test('AI prioritizes a discarded Zombie target for Book of Ash', () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 4,
      hand: 'bookOfAsh',
      discard: ['haunt', 'zombie'],
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  const dialog = screen.getByRole('dialog', { name: 'Book of Ash' })

  expect(
    within(dialog).queryByRole('button', { name: 'Zombie card' }),
  ).not.toBeInTheDocument()
  expect(
    within(dialog).getByRole('article', { name: 'Zombie card' }),
  ).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.queryByRole('dialog', { name: 'Book of Ash' })).toBeNull()
  expect(screen.getByTestId('ai-zombie-life')).toHaveTextContent('1')
  expect(screen.getByTestId('ai-board-size')).toHaveTextContent('2')
})

test('AI does not resolve a pending human-owned target effect', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    activePlayer: {
      board: ['yoraSkull', 'novice'],
    },
    inactivePlayer: {
      hand: 'zombie',
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]
  state.pendingPlayedCardId = state.players[mockOrderUser.id].board[0]

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('pending-card')).toHaveTextContent('yoraSkull')
  expect(screen.getByTestId('human-novice-life')).toHaveTextContent('1')
  expect(screen.getByTestId('ai-hand-size')).toHaveTextContent('1')
})

test('AI randomly attacks during its act turn', () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'haunt' },
    mode: soloMode,
    phase: 'act',
  })

  state.actPlayerId = mockChaosUser.id

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('human-board-size')).toHaveTextContent('0')
  expect(screen.getByTestId('human-discard-size')).toHaveTextContent('1')
})

test('AI passes act when it has ready characters but no valid attacks', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  state.actPlayerId = mockChaosUser.id

  renderDuelTable(state)

  act(() => vi.advanceTimersByTime(AUTOMATED_ACTION_DELAY_MS))

  expect(screen.getByTestId('ai-has-acted')).toHaveTextContent('true')
})

test('AI cards and phase controls are not manually clickable in solo mode', () => {
  vi.useFakeTimers()
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  state.actPlayerId = mockChaosUser.id

  renderDuelTable(state)

  const aiBoard = within(screen.getByTestId('inactive-board'))

  expect(
    aiBoard.getByRole('article', { name: 'Zombie card' }),
  ).toBeInTheDocument()
  expect(
    aiBoard.queryByRole('button', { name: 'Zombie card' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: messages.ui.passLabel })).toBeNull()
})
