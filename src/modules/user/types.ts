import { AllCardNames } from 'src/modules/cards/types'

type UserDeck = AllCardNames[]

export type User = {
  id: string
  name: string
  draftDeck: UserDeck
}

export type UserState = {
  user: User
  isUserLoaded: boolean
}

// Action types
export type LoadUserAction = { type: 'LOAD_USER'; user: User }
export type UserAction = LoadUserAction
