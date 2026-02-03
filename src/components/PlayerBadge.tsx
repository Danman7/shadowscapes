import type { ReactNode } from 'react'

export const PlayerBadge: React.FC<{
  children: ReactNode
  isActive?: boolean
}> = ({ children, isActive }) => (
  <div
    className={`absolute  left-1/2 transform -translate-x-1/2 px-2 name-tag border ${isActive ? 'border-primary bottom-2' : 'top-2'}`}
  >
    {isActive && (
      <span className="relative flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
      </span>
    )}

    {children}
  </div>
)
