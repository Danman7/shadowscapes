import type { CardBaseId } from '../../cards'
import type { User } from '../../user'
import type { CardInstanceId, PlayerId, Stack } from '../types'

export type InitiateDuelPayload = [User, User]

export interface PlayCardPayload {
  playerId: PlayerId
  cardInstanceId: CardInstanceId
  cardBaseId: CardBaseId
}

export interface AttackCharacterPayload {
  attackerId: CardInstanceId
  defenderId: CardInstanceId
}

export type SummonSourceStack = Exclude<Stack, 'board'>

export interface SummonCardPayload {
  playerId: PlayerId
  cardInstanceId: CardInstanceId
  from: SummonSourceStack
}

export interface SummonAllCopiesPayload {
  playerId: PlayerId
  cardBaseId: CardBaseId
  from: SummonSourceStack
}

export interface AdjustCharacterLifePayload {
  cardInstanceId: CardInstanceId
  amount: number
}

export interface AdjustPlayerIncomePayload {
  playerId: PlayerId
  amount: number
}

export interface DrawCardPayload {
  playerId: PlayerId
}

export interface ResolvePendingPlayedCardPayload {
  cardInstanceId: CardInstanceId
}
