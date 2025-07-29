import { AnimatePresence } from 'motion/react'
import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

import { StyledPhaseModal } from 'src/modules/duel/components/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'

export const PhaseModal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme()
  const delayInSeconds = useThemeTransitionTimeInSeconds()

  const [isVisible, setIsVisible] = useState(!!children)
  const [childKey, setChildKey] = useState(Date.now())

  // Reset visibility and key when children change
  useEffect(() => {
    if (children) {
      setIsVisible(true)
      setChildKey(Date.now())

      // Hide after 1 second
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, theme.transitionTime * 10)

      return () => clearTimeout(timer)
    }
  }, [children, theme.transitionTime])

  return (
    <AnimatePresence>
      {isVisible && (
        <StyledPhaseModal
          key={childKey}
          initial={{ opacity: 0, left: '40%' }}
          animate={{ opacity: 1, left: '50%' }}
          exit={{ opacity: 0, left: '60%' }}
          transition={{
            duration: delayInSeconds * 2,
            type: 'spring',
          }}
        >
          {children}
        </StyledPhaseModal>
      )}
    </AnimatePresence>
  )
}
