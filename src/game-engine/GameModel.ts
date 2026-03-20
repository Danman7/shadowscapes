import { duelReducerWithEffects } from 'src/game-engine/duelReducer'
import type { GameEvent } from 'src/game-engine/events'
import type { Duel, DuelAction, PlayerId, Stack } from 'src/types'

type StateListener = () => void
type EventListener = (events: GameEvent[]) => void
type CardStatsChanges = Extract<
  GameEvent,
  { type: 'CARD_STATS_CHANGED' }
>['changes']

const STACKS: Stack[] = ['hand', 'board', 'deck', 'discard']

export class GameModel {
  private state: Duel
  private stateListeners = new Set<StateListener>()
  private eventListeners = new Set<EventListener>()

  constructor(initialState: Duel) {
    this.state = initialState
  }

  getState = (): Readonly<Duel> => {
    return this.state
  }

  dispatch = (action: DuelAction): void => {
    const prev = this.state
    this.state = duelReducerWithEffects(prev, action)

    for (const listener of this.stateListeners) {
      listener()
    }

    const events = this.deriveEvents(prev, this.state, action)
    if (events.length > 0) {
      for (const listener of this.eventListeners) {
        listener(events)
      }
    }
  }

  subscribe = (listener: StateListener): (() => void) => {
    this.stateListeners.add(listener)
    return () => {
      this.stateListeners.delete(listener)
    }
  }

  subscribeToEvents = (listener: EventListener): (() => void) => {
    this.eventListeners.add(listener)
    return () => {
      this.eventListeners.delete(listener)
    }
  }

  private findCardZone(
    state: Duel,
    playerId: PlayerId,
    cardId: number,
  ): Stack | null {
    const player = state.players[playerId]
    if (!player) return null

    for (const stack of STACKS) {
      if (player[stack].includes(cardId)) return stack
    }
    return null
  }

  private deriveEvents(
    prev: Duel,
    next: Duel,
    action: DuelAction,
  ): GameEvent[] {
    const events: GameEvent[] = [{ type: 'ACTION_DISPATCHED', action }]

    if (prev.phase !== next.phase) {
      events.push({ type: 'PHASE_CHANGED', from: prev.phase, to: next.phase })
    }

    if (prev.playerOrder[0] !== next.playerOrder[0]) {
      events.push({
        type: 'TURN_SWITCHED',
        activePlayerId: next.playerOrder[0],
      })
    }

    const allPlayerIds = new Set([
      ...Object.keys(prev.players),
      ...Object.keys(next.players),
    ])

    for (const playerId of allPlayerIds) {
      const prevPlayer = prev.players[playerId]
      const nextPlayer = next.players[playerId]
      if (!prevPlayer || !nextPlayer) continue

      if (prevPlayer.coins !== nextPlayer.coins) {
        events.push({
          type: 'PLAYER_COINS_CHANGED',
          playerId,
          from: prevPlayer.coins,
          to: nextPlayer.coins,
        })
      }
    }

    const allCardIds = new Set([
      ...Object.keys(prev.cards).map(Number),
      ...Object.keys(next.cards).map(Number),
    ])

    for (const cardId of allCardIds) {
      const prevCard = prev.cards[cardId]
      const nextCard = next.cards[cardId]

      if (nextCard && !prevCard) continue

      if (prevCard && nextCard) {
        const statsChanges: CardStatsChanges = {}
        let hasChanges = false

        if (prevCard.life !== nextCard.life) {
          statsChanges.life = { from: prevCard.life, to: nextCard.life }
          hasChanges = true
        }
        if (prevCard.strength !== nextCard.strength) {
          statsChanges.strength = {
            from: prevCard.strength,
            to: nextCard.strength,
          }
          hasChanges = true
        }
        if (prevCard.charges !== nextCard.charges) {
          statsChanges.charges = {
            from: prevCard.charges,
            to: nextCard.charges,
          }
          hasChanges = true
        }
        if (prevCard.stunned !== nextCard.stunned) {
          statsChanges.stunned = {
            from: prevCard.stunned,
            to: nextCard.stunned,
          }
          hasChanges = true
        }
        if (prevCard.haste !== nextCard.haste) {
          statsChanges.haste = { from: prevCard.haste, to: nextCard.haste }
          hasChanges = true
        }

        if (hasChanges) {
          events.push({
            type: 'CARD_STATS_CHANGED',
            cardId,
            changes: statsChanges,
          })
        }
      }
    }

    for (const playerId of allPlayerIds) {
      const prevPlayer = prev.players[playerId]
      const nextPlayer = next.players[playerId]
      if (!prevPlayer || !nextPlayer) continue

      for (const stack of STACKS) {
        for (const cardId of nextPlayer[stack]) {
          const prevZone = this.findCardZone(prev, playerId, cardId)
          if (prevZone !== stack) {
            events.push({
              type: 'CARD_ZONE_CHANGED',
              cardId,
              playerId,
              from: prevZone,
              to: stack,
            })

            if (
              stack === 'discard' &&
              next.cards[cardId]?.life !== undefined &&
              next.cards[cardId]!.life! <= 0
            ) {
              events.push({ type: 'CARD_DESTROYED', cardId, playerId })
            }
          }
        }
      }
    }

    return events
  }
}
