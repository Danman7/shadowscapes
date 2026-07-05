import type { AppDispatch } from '../../redux'
import { useAppDispatch } from '../../redux'

export const useDuelDispatch = (): AppDispatch => useAppDispatch()
