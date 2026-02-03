import type { ReactNode } from 'react'

export const Button: React.FC<{
  children: ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="box px-4 py-2 uppercase bg-primary text-background cursor-pointer shadow-sm hover:scale-102 hover:shadow-md hover:bg-primary/90 active:shadow-none active:bg-primary/80 active:scale-99 transition-all disabled:cursor-not-allowed disabled:bg-surface disabled:shadow-surface disabled:scale-100 disabled:shadow-xs disabled:text-foreground/50"
      disabled={!onClick}
    >
      {children}
    </button>
  )
}
