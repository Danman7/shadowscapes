import React from 'react'
import { useTheme } from 'styled-components'

import { StyledButton } from 'src/components/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'

export type ButtonVariant = 'primary' | 'outline' | 'disabled'

export const Button: React.FC<{
  variant?: ButtonVariant
  children?: React.ReactNode
  onClick?: () => void
}> = ({ variant = 'primary', children, onClick }) => {
  const { colors } = useTheme()
  const duration = useThemeTransitionTimeInSeconds() / 4
  const disabled = !onClick

  // Determine the actual variant to use
  const buttonVariant = disabled ? 'disabled' : variant

  return (
    <StyledButton
      $variant={buttonVariant}
      whileHover={
        !disabled
          ? { scale: 1.1, boxShadow: `0 0 10px ${colors.primary}` }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.9, boxShadow: 'initial' } : undefined}
      transition={{
        type: 'spring',
        duration,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  )
}
