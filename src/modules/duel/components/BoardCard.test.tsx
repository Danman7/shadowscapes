import userEvent from '@testing-library/user-event'

import { messages } from 'src/i18n'
import { BoardCard } from 'src/modules/duel/components/BoardCard'
import { mockStackedDuelState } from 'src/modules/duel/mocks'
import { DuelState } from 'src/modules/duel/types'
import { mockLoadedUserState as preloadedUser } from 'src/modules/user/mocks'
import { render, RenderResult } from 'src/test-utils'

let preloadedDuel: DuelState
let renderResult: (cardId: string) => RenderResult

beforeEach(() => {
  preloadedDuel = { ...mockStackedDuelState }

  renderResult = (cardId: string) =>
    render(<BoardCard cardId={cardId} />, {
      preloadedDuel,
      preloadedUser,
    })
})

describe('Show', () => {
  it('displays card content when it belongs to user and is in hand', () => {
    const { players, activePlayerId, cards } = preloadedDuel

    const cardId = players[activePlayerId].hand[0]

    const { getByText } = renderResult(cardId)

    expect(getByText(cards[cardId].name)).toBeInTheDocument()
  })

  it('displays card content when it belongs to user and is on board', () => {
    const { players, activePlayerId, cards } = preloadedDuel

    const cardId = players[activePlayerId].board[0]

    const { getByText } = renderResult(cardId)

    expect(getByText(cards[cardId].name)).toBeInTheDocument()
  })

  it('displays card content when it does not belong user but is on board', () => {
    const { players, inactivePlayerId, cards } = preloadedDuel

    const cardId = players[inactivePlayerId].board[0]

    const { getByText } = renderResult(cardId)

    expect(getByText(cards[cardId].name)).toBeInTheDocument()
  })
})

describe('Hide', () => {
  it('hides card content when it belongs to user but is in deck', () => {
    const { players, activePlayerId, cards } = preloadedDuel

    const cardId = players[activePlayerId].deck[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })

  it('hides card content when it belongs to user but is in discard', () => {
    const { players, activePlayerId, cards } = preloadedDuel

    const cardId = players[activePlayerId].discard[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })

  it('hides card content when it does not belong user and is in hand', () => {
    const { players, inactivePlayerId, cards } = preloadedDuel

    const cardId = players[inactivePlayerId].hand[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })

  it('hides card content when it does not belong user and is in deck', () => {
    const { players, inactivePlayerId, cards } = preloadedDuel

    const cardId = players[inactivePlayerId].deck[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })

  it('hides card content when it does not belong user and is in discard', () => {
    const { players, inactivePlayerId, cards } = preloadedDuel

    const cardId = players[inactivePlayerId].discard[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })

  it('flips the card when isFaceDown changes', () => {
    const { players, activePlayerId, cards } = preloadedDuel

    const { rerender, getByText, queryByText } = renderResult(
      players[activePlayerId].deck[0],
    )

    expect(
      queryByText(cards[players[activePlayerId].deck[0]].name),
    ).not.toBeInTheDocument()

    rerender(<BoardCard cardId={players[activePlayerId].hand[0]} />)

    expect(
      getByText(cards[players[activePlayerId].hand[0]].name),
    ).toBeInTheDocument()

    rerender(<BoardCard cardId={players[activePlayerId].deck[0]} />)

    expect(
      queryByText(cards[players[activePlayerId].deck[0]].name),
    ).not.toBeInTheDocument()
  })

  it("hide card content when card is on opponent's board but has hidden trait", () => {
    const { players, inactivePlayerId, cards } = preloadedDuel

    const cardId = players[inactivePlayerId].board[1]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
  })
})

describe('Click', () => {
  it('does not show click helper when card is not clickable', () => {
    const { players, activePlayerId } = preloadedDuel

    const cardId = players[activePlayerId].hand[0]

    const { queryByText } = renderResult(cardId)

    expect(queryByText(messages.duel.replaceCard)).not.toBeInTheDocument()
  })

  it('shows click helper when card is clickable during redraw', async () => {
    const user = userEvent.setup()

    preloadedDuel.phase = 'Redrawing'

    const { players, activePlayerId } = preloadedDuel

    const cardId = players[activePlayerId].hand[0]
    const cardName = preloadedDuel.cards[cardId].name

    const { getByText, queryByText } = renderResult(cardId)

    await user.hover(getByText(cardName))

    expect(getByText(messages.duel.replaceCard)).toBeInTheDocument()

    await user.unhover(getByText(cardName))

    expect(queryByText(messages.duel.replaceCard)).not.toBeInTheDocument()
  })
})
