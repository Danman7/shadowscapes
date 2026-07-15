import { fireEvent, render, screen, within } from '@testing-library/react'

import { messages } from '../../../l10n/en'
import { setupMockedDuel } from '../../../user'
import { useDuelState } from '../../hooks'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const renderDuelTable = (state: ReturnType<typeof setupMockedDuel>) =>
  render(
    <DuelProvider preloadedState={state}>
      <DuelTable />
      <EffectStateProbe />
    </DuelProvider>,
  )

const EffectStateProbe = () => {
  const { cards, playerOrder, players } = useDuelState()
  const activePlayer = players[playerOrder[0]]
  const stunnedBoardCards = activePlayer.board.filter((cardId) => {
    const card = cards[cardId]

    return card.type === 'character' && card.turnsStunned > 0
  })

  return (
    <>
      <output data-testid="effect-coins">{activePlayer.coins}</output>
      <output data-testid="effect-stunned-count">
        {stunnedBoardCards.length}
      </output>
    </>
  )
}

test('Novice summons all hand copies for free when a higher-life ally exists', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: {
        coins: 3,
        hand: ['novice', 'novice', 'novice'],
        board: 'acolyte',
      },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getAllByRole('button', { name: 'Novice card' })[0])

  const activeBoard = within(screen.getByTestId('active-board'))
  const activeHand = within(screen.getByTestId('active-hand'))
  const novices = activeBoard.getAllByRole('article', { name: 'Novice card' })

  expect(novices).toHaveLength(3)
  expect(activeHand.queryByText('Novice')).not.toBeInTheDocument()
  expect(screen.getByTestId('effect-coins')).toHaveTextContent('2')
  expect(screen.getByTestId('effect-stunned-count')).toHaveTextContent('3')
  novices.forEach((novice) => {
    expect(within(novice).getByText('Stunned')).toBeInTheDocument()
  })
})

test('Novice does not summon hand copies without a higher-life ally', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { hand: ['novice', 'novice'] },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getAllByRole('button', { name: 'Novice card' })[0])

  expect(
    within(screen.getByTestId('active-board')).getAllByRole('article', {
      name: 'Novice card',
    }),
  ).toHaveLength(1)
  expect(
    within(screen.getByTestId('active-hand')).getByRole('article', {
      name: 'Novice card',
    }),
  ).toBeInTheDocument()
})

test('Temple Guard displays its bonus life when outnumbered post-play', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { coins: 4, hand: 'templeGuard' },
      inactivePlayer: { board: ['zombie', 'haunt'] },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getByRole('button', { name: 'Temple Guard card' }))

  expect(getActiveBoardCardLife('Temple Guard card')).toHaveTextContent('4')
})

test('Temple Guard keeps its base life when the post-play boards are tied', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: { coins: 4, hand: 'templeGuard' },
      inactivePlayer: { board: 'zombie' },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getByRole('button', { name: 'Temple Guard card' }))

  expect(getActiveBoardCardLife('Temple Guard card')).toHaveTextContent('3')
})

test('Book of Ash prompts for a discarded character and summons a one-life copy', () => {
  renderDuelTable(
    setupMockedDuel({
      activePlayer: {
        coins: 4,
        hand: 'bookOfAsh',
        discard: ['haunt', 'zombie'],
      },
      phase: 'play',
    }),
  )

  fireEvent.click(screen.getByRole('button', { name: 'Book of Ash card' }))

  const dialog = screen.getByRole('dialog', { name: 'Book of Ash' })

  expect(
    within(dialog).queryByRole('button', { name: messages.ui.closeLabel }),
  ).not.toBeInTheDocument()

  fireEvent.click(within(dialog).getByRole('button', { name: 'Haunt card' }))

  expect(screen.queryByRole('dialog', { name: 'Book of Ash' })).toBeNull()
  expect(getActiveBoardCardLife('Haunt card')).toHaveTextContent('1')
  expect(
    within(screen.getByTestId('active-discard')).getByText(
      `${messages.ui.discardLabel} 3`,
    ),
  ).toBeInTheDocument()
})

test('Book of Ash target modal stays hidden without discarded characters', () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: 'bookOfAsh',
      discard: 'bookOfAsh',
    },
    phase: 'play',
  })
  const playerId = state.playerOrder[0]

  state.pendingPlayedCardId = state.players[playerId].board[0]

  renderDuelTable(state)

  expect(screen.queryByRole('dialog', { name: 'Book of Ash' })).toBeNull()
})

const getActiveBoardCardLife = (cardName: string) => {
  const card = within(screen.getByTestId('active-board')).getByRole('article', {
    name: cardName,
  })

  return within(card).getByText('Life').nextElementSibling
}
