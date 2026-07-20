import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UnknownAction } from '@reduxjs/toolkit'
import { getCardBase } from '../../cards'
import {
  INITIAL_CARDS_DRAWN,
  INITIAL_PLAYER_COINS,
  INITIAL_DUAL_STATE as initialState,
  MAX_REFRESH_INCOME,
} from '../constants'
import type {
  CardInstance,
  CardInstanceId,
  CharacterCardInstance,
  DuelMode,
  DuelPlayer,
  DuelState,
  Stack,
} from '../types'
import {
  applyBoardEntryStun,
  canActPlayerPass,
  canActTurnComplete,
  canCardBePlayed,
  canCharacterAttack,
  createCardInstance,
  haveBothPlayersActed,
  isAwaitingCardEffectTarget,
  isCharacterInstance,
  moveCard,
  reduceTurnsStunned,
  shuffle,
} from '../utils'
import type {
  AdjustCharacterChargesPayload,
  AdjustCharacterLifePayload,
  AdjustCharacterStunPayload,
  AdjustPlayerIncomePayload,
  AttackCharacterPayload,
  DamageCharacterPayload,
  DrawCardPayload,
  GrantCharacterHastePayload,
  InitiateDuelPayload,
  InitiateSoloRandomAiDuelPayload,
  PlayCardPayload,
  ResolvePendingPlayedCardPayload,
  SummonAllCopiesPayload,
  SummonCardCopyPayload,
  SummonCardPayload,
  StripCharacterTraitsPayload,
} from './duelStateTypes'

const decrementPlayerCharactersStun = (state: DuelState, playerId: string) => {
  const player = state.players[playerId]

  player.board.forEach((cardId) => {
    const card = state.cards[cardId]

    if (isCharacterInstance(card)) reduceTurnsStunned(card)
  })
}

const isDamagedCharacter = (card: CharacterCardInstance): boolean => {
  const base = getCardBase(card.baseId)

  return base.type === 'character' && card.life < base.life
}

const getCharacterInStack = (
  state: DuelState,
  cardInstanceId: CardInstanceId,
  stack: Stack = 'board',
): CharacterCardInstance | undefined => {
  const card = state.cards[cardInstanceId]
  const player = card ? state.players[card.ownerId] : undefined

  if (
    !isCharacterInstance(card) ||
    card.stack !== stack ||
    !player?.[stack].includes(card.id)
  ) {
    return undefined
  }

  return card
}

const createDuelStateFromUsers = (
  users: InitiateDuelPayload,
  mode: DuelMode,
): DuelState => {
  const players: Record<string, DuelPlayer> = {}
  const cards: Record<string, CardInstance> = {}
  const playerOrder: DuelState['playerOrder'] =
    Math.random() < 0.5
      ? [users[0].id, users[1].id]
      : [users[1].id, users[0].id]

  users.forEach((user) => {
    const deck = user.activeDeck.map((baseId) => {
      const card = createCardInstance(baseId, user.id, 'deck')

      cards[card.id] = card

      return card.id
    })

    players[user.id] = {
      id: user.id,
      name: user.name,
      coins: INITIAL_PLAYER_COINS,
      income: 0,
      deck: shuffle(deck),
      hand: [],
      board: [],
      discard: [],
      hasActedThisPhase: false,
    }
  })

  return {
    ...initialState,
    mode,
    playerOrder,
    players,
    cards,
    actPlayerId: null,
  }
}

const damageCharacterById = (
  state: DuelState,
  cardInstanceId: CardInstanceId,
  amount: number,
) => {
  if (amount <= 0) return

  const card = state.cards[cardInstanceId]
  const player = card ? state.players[card.ownerId] : undefined

  if (
    !isCharacterInstance(card) ||
    card.stack !== 'board' ||
    !player?.board.includes(card.id)
  ) {
    return
  }

  card.life -= amount

  if (card.life > 0) return

  moveCard({
    state,
    playerId: card.ownerId,
    cardId: card.id,
    from: 'board',
    to: 'discard',
  })
}

export const duelSlice = createSlice({
  name: 'duel',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    initiateDuelFromUsers: (
      _state,
      action: PayloadAction<InitiateDuelPayload>,
    ): DuelState =>
      createDuelStateFromUsers(action.payload, { type: 'hot-seat' }),
    initiateSoloRandomAiDuel: (
      _state,
      action: PayloadAction<InitiateSoloRandomAiDuelPayload>,
    ): DuelState =>
      createDuelStateFromUsers([action.payload.human, action.payload.ai], {
        type: 'solo-random-ai',
        humanPlayerId: action.payload.human.id,
        aiPlayerId: action.payload.ai.id,
      }),
    drawInitialHands: (state) => {
      if (
        state.phase !== 'setup' ||
        !state.playerOrder.every(
          (playerId) =>
            state.players[playerId].hand.length < INITIAL_CARDS_DRAWN,
        )
      ) {
        return
      }

      state.playerOrder.forEach((playerId) => {
        const cardsNeeded =
          INITIAL_CARDS_DRAWN - state.players[playerId].hand.length

        moveCard({
          state,
          playerId,
          from: 'deck',
          to: 'hand',
          amount: cardsNeeded,
        })
      })
      state.phase = 'draw'
    },
    drawForPlayers: (state) => {
      if (state.phase !== 'draw') return

      state.playerOrder.forEach((playerId) => {
        moveCard({ state, playerId, from: 'deck', to: 'hand' })
        decrementPlayerCharactersStun(state, playerId)
      })
      state.phase = 'play'
    },
    playCard: (state, action: PayloadAction<PlayCardPayload>) => {
      if (!canCardBePlayed({ state, ...action.payload })) return

      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]
      const card = state.cards[cardInstanceId]

      player.coins -= card.cost
      moveCard({
        state,
        playerId,
        cardId: cardInstanceId,
        from: 'hand',
        to: 'board',
      })
      player.hasActedThisPhase = true
      state.pendingPlayedCardId = cardInstanceId

      if (player.coins === 0) {
        state.winnerId =
          state.playerOrder.find((orderedPlayerId) => orderedPlayerId !== playerId) ??
          null
      }
    },
    summonCard: (state, action: PayloadAction<SummonCardPayload>) => {
      const { playerId, cardInstanceId, from } = action.payload
      const card = state.cards[cardInstanceId]

      if (!isCharacterInstance(card)) return

      moveCard({
        state,
        playerId,
        cardId: cardInstanceId,
        from,
        to: 'board',
      })
    },
    summonAllCopies: (
      state,
      action: PayloadAction<SummonAllCopiesPayload>,
    ) => {
      const { playerId, cardBaseId, from } = action.payload
      const player = state.players[playerId]

      if (!player) return

      const matchingCardIds = player[from].filter((cardId) => {
        const card = state.cards[cardId]

        return isCharacterInstance(card) && card.baseId === cardBaseId
      })

      matchingCardIds.forEach((cardId) => {
        moveCard({ state, playerId, cardId, from, to: 'board' })
      })
    },
    summonCardCopy: (
      state,
      action: PayloadAction<SummonCardCopyPayload>,
    ) => {
      const { playerId, sourceCardInstanceId, life } = action.payload
      const player = state.players[playerId]
      const source = state.cards[sourceCardInstanceId]

      if (
        !player ||
        !isCharacterInstance(source) ||
        source.ownerId !== playerId ||
        source.stack !== 'discard' ||
        !player.discard.includes(sourceCardInstanceId) ||
        life <= 0
      ) {
        return
      }

      const copy = createCardInstance(source.baseId, playerId, 'board')

      if (!isCharacterInstance(copy)) return

      copy.life = life
      applyBoardEntryStun(copy)
      state.cards[copy.id] = copy
      player.board.push(copy.id)
    },
    adjustCharacterLife: (
      state,
      action: PayloadAction<AdjustCharacterLifePayload>,
    ) => {
      const card = state.cards[action.payload.cardInstanceId]
      const player = card ? state.players[card.ownerId] : undefined
      const stack = action.payload.stack ?? 'board'

      if (
        !isCharacterInstance(card) ||
        card.stack !== stack ||
        !player?.[stack].includes(card.id)
      ) {
        return
      }

      card.life += action.payload.amount
    },
    adjustCharacterCharges: (
      state,
      action: PayloadAction<AdjustCharacterChargesPayload>,
    ) => {
      const stack = action.payload.stack ?? 'board'
      const card = getCharacterInStack(
        state,
        action.payload.cardInstanceId,
        stack,
      )

      if (!card) return

      card.traits.charges = Math.max(
        0,
        (card.traits.charges ?? 0) + action.payload.amount,
      )
    },
    adjustCharacterStun: (
      state,
      action: PayloadAction<AdjustCharacterStunPayload>,
    ) => {
      const stack = action.payload.stack ?? 'board'
      const card = getCharacterInStack(
        state,
        action.payload.cardInstanceId,
        stack,
      )

      if (!card) return

      const stunned = Math.max(
        0,
        (card.traits.stunned ?? 0) + action.payload.amount,
      )

      if (stunned === 0) {
        delete card.traits.stunned
      } else {
        card.traits.stunned = stunned
      }
    },
    grantCharacterHaste: (
      state,
      action: PayloadAction<GrantCharacterHastePayload>,
    ) => {
      const stack = action.payload.stack ?? 'board'
      const card = getCharacterInStack(
        state,
        action.payload.cardInstanceId,
        stack,
      )

      if (!card) return

      card.traits.haste = true
    },
    stripCharacterTraits: (
      state,
      action: PayloadAction<StripCharacterTraitsPayload>,
    ) => {
      const stack = action.payload.stack ?? 'board'
      const card = getCharacterInStack(
        state,
        action.payload.cardInstanceId,
        stack,
      )

      if (!card) return

      card.traits = {}
    },
    damageCharacter: (
      state,
      action: PayloadAction<DamageCharacterPayload>,
    ) => {
      damageCharacterById(
        state,
        action.payload.cardInstanceId,
        action.payload.amount,
      )
    },
    adjustPlayerIncome: (
      state,
      action: PayloadAction<AdjustPlayerIncomePayload>,
    ) => {
      const player = state.players[action.payload.playerId]

      if (!player) return

      player.income += action.payload.amount
    },
    drawCard: (state, action: PayloadAction<DrawCardPayload>) => {
      if (!state.players[action.payload.playerId]) return

      moveCard({
        state,
        playerId: action.payload.playerId,
        from: 'deck',
        to: 'hand',
      })
    },
    resolvePendingPlayedCard: (
      state,
      action: PayloadAction<ResolvePendingPlayedCardPayload>,
    ) => {
      const cardInstanceId = action.payload.cardInstanceId
      const card = state.cards[cardInstanceId]

      if (
        state.pendingPlayedCardId !== cardInstanceId ||
        card?.type !== 'instance'
      ) {
        return
      }

      moveCard({
        state,
        playerId: card.ownerId,
        cardId: cardInstanceId,
        from: 'board',
        to: 'discard',
      })
      state.pendingPlayedCardId = null
    },
    passPlayTurn: (state) => {
      const activePlayer = state.players[state.playerOrder[0]]

      activePlayer.hasActedThisPhase = true
    },
    completePlayTurn: (state) => {
      if (isAwaitingCardEffectTarget(state)) return

      const activePlayer = state.players[state.playerOrder[0]]
      const pendingCardId = state.pendingPlayedCardId

      if (pendingCardId && state.cards[pendingCardId].type === 'instance') {
        moveCard({
          state,
          playerId: activePlayer.id,
          cardId: pendingCardId,
          from: 'board',
          to: 'discard',
        })
      }

      state.pendingPlayedCardId = null

      const bothPlayersActed = haveBothPlayersActed(state)

      state.playerOrder = [state.playerOrder[1], state.playerOrder[0]]

      if (bothPlayersActed) {
        state.phase = 'act'
        state.actPlayerId = state.playerOrder[0]
        state.playerOrder.forEach((playerId) => {
          state.players[playerId].hasActedThisPhase = false
        })
      }
    },
    attackCharacter: (state, action: PayloadAction<AttackCharacterPayload>) => {
      if (!canCharacterAttack(state, action.payload)) return

      const attacker = state.cards[
        action.payload.attackerId
      ] as CharacterCardInstance
      const defender = state.cards[
        action.payload.defenderId
      ] as CharacterCardInstance

      attacker.didAct = true

      if (
        defender.baseId === 'haunt' &&
        (defender.traits.stunned ?? 0) === 0 &&
        isDamagedCharacter(attacker)
      ) {
        damageCharacterById(state, attacker.id, defender.strength)

        if (attacker.stack !== 'board') return
      }

      damageCharacterById(state, defender.id, attacker.strength)
    },
    passActTurn: (state) => {
      if (!state.actPlayerId || !canActPlayerPass(state)) return

      state.players[state.actPlayerId].hasActedThisPhase = true
    },
    completeActTurn: (state) => {
      if (!state.actPlayerId || !canActTurnComplete(state)) return

      const completingPlayerId = state.actPlayerId
      state.players[completingPlayerId].hasActedThisPhase = true

      const nextPlayerId = state.playerOrder.find(
        (playerId) => !state.players[playerId].hasActedThisPhase,
      )

      if (nextPlayerId) {
        state.playerOrder = [nextPlayerId, completingPlayerId]
        state.actPlayerId = nextPlayerId
        return
      }

      state.actPlayerId = null
      state.phase = 'refresh'
    },
    completeRefresh: (state) => {
      if (state.phase !== 'refresh') return

      state.round += 1

      state.playerOrder.forEach((playerId) => {
        const player = state.players[playerId]

        player.hasActedThisPhase = false
        player.coins += Math.min(Math.max(player.income, 0), MAX_REFRESH_INCOME)

        player.board.forEach((cardId) => {
          const card = state.cards[cardId]

          if (card.type === 'character') card.didAct = false
        })
      })

      state.phase = 'draw'
    },
  },
})

export const {
  adjustCharacterCharges,
  adjustCharacterLife,
  adjustCharacterStun,
  adjustPlayerIncome,
  attackCharacter,
  completeActTurn,
  completePlayTurn,
  completeRefresh,
  drawForPlayers,
  damageCharacter,
  drawCard,
  drawInitialHands,
  grantCharacterHaste,
  initiateDuelFromUsers,
  initiateSoloRandomAiDuel,
  passActTurn,
  passPlayTurn,
  playCard,
  resolvePendingPlayedCard,
  summonAllCopies,
  summonCard,
  summonCardCopy,
  stripCharacterTraits,
} = duelSlice.actions

export const duelReducer = (
  state: DuelState | undefined,
  action: UnknownAction,
): DuelState => {
  if (
    state?.winnerId &&
    !initiateDuelFromUsers.match(action) &&
    !initiateSoloRandomAiDuel.match(action)
  ) {
    return state
  }

  return duelSlice.reducer(state, action)
}
