import { CardBaseId } from '../cards'

export type UserDeck = CardBaseId[]

export type UserId = string

export interface User {
  id: UserId
  name: string
  activeDeck: UserDeck
}
