import React from 'react'
import { useTheme } from 'styled-components'

import { StyledButton } from 'src/components/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'

export const Button: React.FC<{
  children?: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => {
  const { colors } = useTheme()
  const duration = useThemeTransitionTimeInSeconds()
  const isDisabled = !onClick

  return (
    <StyledButton
      whileHover={
        !isDisabled
          ? { scale: 1.1, boxShadow: `0 0 10px ${colors.primary}` }
          : undefined
      }
      whileTap={!isDisabled ? { scale: 0.9 } : undefined}
      transition={{
        type: 'spring',
        duration,
      }}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children}
    </StyledButton>
  )
}
