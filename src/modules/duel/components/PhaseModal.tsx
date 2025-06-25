import { AnimatePresence } from 'motion/react'
import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

import { StyledPhaseModal } from 'src/modules/duel/components/styles'

export const PhaseModal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme()

  const [isVisible, setIsVisible] = useState(true)
  const [childKey, setChildKey] = useState(Date.now())

  // Reset visibility and key when children change
  useEffect(() => {
    setIsVisible(true)
    setChildKey(Date.now())

    // Hide after 1 second
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, theme.transitionTime * 20)

    return () => clearTimeout(timer)
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
            duration: (theme.transitionTime / 1000) * 2,
            type: 'spring',
          }}
        >
          {children}
        </StyledPhaseModal>
      )}
    </AnimatePresence>
  )
}
