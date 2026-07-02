import { AppDispatch, useAppDispatch, useAppSelector } from '../redux'
import { DuelState } from './types'

export const useDuelState = (): DuelState =>
  useAppSelector((state) => state.duel)
export const useDuelDispatch = (): AppDispatch => useAppDispatch()
