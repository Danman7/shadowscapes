import type { ReactNode } from 'react'

export const Button: React.FC<{
  children: ReactNode
  className?: string
  onClick?: () => void
  isSecondary?: boolean
}> = ({ children, className, onClick, isSecondary = false }) => {
  const buttonBase =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md active:shadow-lg uppercase'

  const buttonStyle = isSecondary
    ? 'bg-surface border border-surface/20 hover:bg-surface/5 active:bg-surface/10 focus-visible:ring-surface/40'
    : 'bg-primary text-background hover:bg-primary/70 active:bg-primary/80 focus-visible:ring-primary/50'

  return (
    <button
      onClick={onClick}
      className={`${buttonBase} ${buttonStyle} ${className}`}
      disabled={!onClick}
    >
      {children}
    </button>
  )
}
