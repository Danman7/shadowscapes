import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { FLOATING_NUMBER_VARIANTS } from 'src/components/animation'

interface FloatingDelta {
  id: number
  offset: number
  value: string
}

export const AnimatedNumber: React.FC<{
  value: number
}> = ({ value }) => {
  const [floatingDeltas, setFloatingDeltas] = useState<FloatingDelta[]>([])

  const isFirstRenderRef = useRef<boolean>(true)
  const previousValueRef = useRef<number>(value)
  const nextFloatingDeltaIdRef = useRef<number>(0)
  const removeFloatingTimeoutRefs = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    const removeFloatingTimeouts = removeFloatingTimeoutRefs.current

    return () => {
      removeFloatingTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    const delta = value - previousValueRef.current
    previousValueRef.current = value

    if (delta === 0) return

    const id = nextFloatingDeltaIdRef.current
    nextFloatingDeltaIdRef.current += 1

    const signedDelta = delta > 0 ? `+${delta}` : `${delta}`

    setFloatingDeltas((currentDeltas) => {
      const usedOffsets = new Set(
        currentDeltas.map((floatingDelta) => floatingDelta.offset),
      )
      let offset = 0

      while (usedOffsets.has(offset)) {
        offset += 1
      }

      return [...currentDeltas, { id, offset, value: signedDelta }]
    })

    const timeoutId = window.setTimeout(() => {
      setFloatingDeltas((currentDeltas) =>
        currentDeltas.filter((floatingDelta) => floatingDelta.id !== id),
      )

      removeFloatingTimeoutRefs.current.delete(id)
    }, 2000)
    removeFloatingTimeoutRefs.current.set(id, timeoutId)
  }, [value])

  return (
    <span className="relative inline-flex items-center justify-center">
      {floatingDeltas.map((floatingDelta) => (
        <motion.span
          key={floatingDelta.id}
          variants={FLOATING_NUMBER_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute pointer-events-none whitespace-nowrap text-shadow-3xs text-foreground! font-extrabold text-shadow-background"
          style={{ bottom: `${floatingDelta.offset * 1.15}rem` }}
        >
          {floatingDelta.value}
        </motion.span>
      ))}

      <span>{value}</span>
    </span>
  )
}
