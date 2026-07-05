import { useAppSelector } from '../../redux'
import type { DuelState } from '../types'

export const useDuelState = (): DuelState =>
  useAppSelector((state) => state.duel)
