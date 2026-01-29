import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import { createDuel } from '@/game-engine/initialization'
import type { CardBaseId } from '@/types'

export interface DuelSetupMock {
  player1Name: string
  player2Name: string
  player1Deck: CardBaseId[]
  player2Deck: CardBaseId[]
}

export const DEFAULT_DUEL_SETUP: DuelSetupMock = {
  player1Name: 'Garrett',
  player2Name: 'Constantine',
  player1Deck: PLAYER_1_DECK,
  player2Deck: PLAYER_2_DECK,
}

export const PRELOADED_DUEL_SETUP = createDuel(DEFAULT_DUEL_SETUP)
