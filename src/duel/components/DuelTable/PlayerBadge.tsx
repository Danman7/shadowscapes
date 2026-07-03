import { DuelPlayer } from '../../types'

interface PlayerBadgeProps {
  player: DuelPlayer
  className?: string
  isActive?: boolean
}

export const PlayerBadge = ({
  player,
  className = '',
  isActive,
}: PlayerBadgeProps) => (
  <div className={`paper z-40 flex items-center gap-2 ${className}`}>
    {isActive && (
      <span className="relative flex size-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex size-4 rounded-full bg-primary"></span>
      </span>
    )}
    <span className="font-bold tracking-wide">{player.name}</span>{' '}
    <div className="coin">{player.coins}</div>
  </div>
)
