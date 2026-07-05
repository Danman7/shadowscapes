import type { CardBaseId } from '../../cards'
import type { User } from '../../user'
import type { CardInstanceId, PlayerId } from '../types'

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
