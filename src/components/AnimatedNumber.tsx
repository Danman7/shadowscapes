import { useEffect, useRef, useState } from 'react'

export const AnimatedNumber: React.FC<{
  value: number
}> = ({ value }) => {
  const [floatingDelta, setFloatingDelta] = useState<string | null>(null)

  const isFirstRenderRef = useRef<boolean>(true)
  const previousValueRef = useRef<number>(value)
  const removeFloatingTimeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    if (removeFloatingTimeoutRef.current !== null) {
      window.clearTimeout(removeFloatingTimeoutRef.current)
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
    }

    const delta = value - previousValueRef.current
    previousValueRef.current = value

    if (delta === 0) return

    const signedDelta = delta > 0 ? `+${delta}` : `${delta}`

    rafRef.current = window.requestAnimationFrame(() => {
      setFloatingDelta(signedDelta)
    })

    removeFloatingTimeoutRef.current = window.setTimeout(() => {
      setFloatingDelta(null)

      removeFloatingTimeoutRef.current = null
    }, 2000)

    return () => {
      if (removeFloatingTimeoutRef.current !== null) {
        window.clearTimeout(removeFloatingTimeoutRef.current)
      }

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value])

  return (
    <span className="relative inline-flex items-center justify-center">
      {floatingDelta !== null && (
        <span className="absolute pointer-events-none whitespace-nowrap animate-float-number text-shadow-3xs text-foreground! font-extrabold text-shadow-background">
          {floatingDelta}
        </span>
      )}

      <span>{value}</span>
    </span>
  )
}
