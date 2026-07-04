import type { ReactNode } from 'react'

export interface ButtonProps {
  label: ReactNode
  onClick: () => void
}

export const Button = ({ label, onClick }: ButtonProps) => (
  <button
    className="paper cursor-pointer border-primary font-bold text-primary transition-colors hover:bg-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
)
