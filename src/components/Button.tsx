import React from 'react'
import { useTheme } from 'styled-components'

import { StyledButton } from 'src/components/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'

export const Button: React.FC<{
  message?: string
  icon?: React.ReactNode
}> = ({ message, icon }) => {
  const { colors } = useTheme()
  const duration = useThemeTransitionTimeInSeconds()

  return (
    <StyledButton
      whileHover={{ scale: 1.1, boxShadow: `0 0 10px ${colors.primary}` }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        duration,
      }}
    >
      {icon}
      {message && <span>{message}</span>}
    </StyledButton>
  )
}
