import type React from 'react'

export const CardBack: React.FC<{
  isSmall?: boolean
}> = ({ isSmall = false }) => {
  return (
    <div
      className={`card ${isSmall ? 'w-20' : 'w-60'} border-`}
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) ${isSmall ? '5px' : '10px'}, var(--color-surface) ${isSmall ? '5px' : '10px'}, var(--color-surface) ${isSmall ? '10px' : '20px'})`,
      }}
      data-testid="card-back"
    />
  )
}
