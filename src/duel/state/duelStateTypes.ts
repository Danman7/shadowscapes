import type { CardBaseId } from '../../cards'
import type { User } from '../../user'
import type { CardInstanceId, PlayerId, Stack } from '../types'

export type InitiateDuelPayload = [User, User]

export interface InitiateSoloRandomAiDuelPayload {
  human: User
  ai: User
}

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

export interface SummonCardCopyPayload {
  playerId: PlayerId
  sourceCardInstanceId: CardInstanceId
  life: number
}

export interface AdjustCharacterLifePayload {
  cardInstanceId: CardInstanceId
  amount: number
  stack?: Stack
}

export interface AdjustCharacterChargesPayload {
  cardInstanceId: CardInstanceId
  amount: number
  stack?: Stack
}

export interface AdjustCharacterStunPayload {
  cardInstanceId: CardInstanceId
  amount: number
  stack?: Stack
}

export interface GrantCharacterHastePayload {
  cardInstanceId: CardInstanceId
  stack?: Stack
}

export interface StripCharacterTraitsPayload {
  cardInstanceId: CardInstanceId
  stack?: Stack
}

export interface DamageCharacterPayload {
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
