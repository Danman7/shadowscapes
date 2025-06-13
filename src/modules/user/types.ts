import { AllCardNames } from 'src/modules/cards/types'

type Deck = AllCardNames[]

export type User = {
  id: string
  name: string
  deck: Deck
}

export type UserState = {
  user: User
  isUserLoaded: boolean
}

// Action types
export type LoadUserAction = { type: 'LOAD_USER'; user: User }
export type UserAction = LoadUserAction
