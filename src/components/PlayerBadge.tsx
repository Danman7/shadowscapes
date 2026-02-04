import { FaCheck } from 'react-icons/fa'
import { GiCrownCoin } from 'react-icons/gi'

import type { Player } from '@/types'

export const PlayerBadge: React.FC<{
  player: Player
  isActive?: boolean
}> = ({ player, isActive }) => (
  <div
    className={`absolute flex items-center gap-2 left-1/2 transform -translate-x-1/2 px-2 name-tag border ${isActive ? 'border-primary bottom-2' : 'top-2'}`}
    data-testid={isActive ? 'active-player-badge' : 'player-badge'}
  >
    {isActive && (
      <span className="relative flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
      </span>
    )}

    {player.playerReady && (
      <div className="text-chaos flex items-center gap-1">
        <FaCheck />
        Ready
      </div>
    )}

    <div>{player.name}</div>

    <div className="text-primary flex items-center gap-1">
      <GiCrownCoin /> {player.coins}
    </div>
  </div>
)
