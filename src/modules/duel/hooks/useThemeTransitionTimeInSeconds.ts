import { useTheme } from 'styled-components'

export const useThemeTransitionTimeInSeconds = () => {
  const { transitionTime } = useTheme()
  return transitionTime / 1000
}
