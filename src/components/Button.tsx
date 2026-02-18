import type { ReactNode } from 'react'

export const Button: React.FC<{
  children: ReactNode
  className?: string
  onClick?: () => void
  isSecondary?: boolean
}> = ({ children, className, onClick, isSecondary = false }) => {
  const buttonStyle = isSecondary
    ? 'bg-surface border border-foreground text-foreground hover:bg-surface/90 active:bg-surface/80'
    : 'bg-primary text-background hover:bg-primary/90 active:bg-primary/80'

  return (
    <button
      onClick={onClick}
      className={`box px-4 py-2 uppercase cursor-pointer shadow-sm hover:scale-102 hover:shadow-md active:shadow-none active:scale-99 transition-all disabled:cursor-not-allowed disabled:bg-surface disabled:shadow-surface disabled:scale-100 disabled:shadow-xs disabled:text-foreground/50 ${buttonStyle} ${className}`}
      disabled={!onClick}
    >
      {children}
    </button>
  )
}
