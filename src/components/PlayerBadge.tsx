import { FaCheck } from 'react-icons/fa'

import { AnimatedNumber } from 'src/components'
import type { Player } from 'src/game-engine'
import { messages } from 'src/i18n'

export const PlayerBadge: React.FC<{
  player: Player
  isActive?: boolean
}> = ({ player, isActive }) => (
  <div
    className={`box px-4 py-1 shadow-xl animate-fade-in-scale absolute flex-list left-1/2 transform -translate-x-1/2 z-50 ${isActive ? 'border-primary bottom-2' : 'top-2'}`}
    data-testid={isActive ? 'active-player-badge' : 'player-badge'}
  >
    {isActive && (
      <span className="relative flex size-3" data-testid="active-indicator">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
          data-testid="active-indicator-ping"
        ></span>
        <span
          className="relative inline-flex size-3 rounded-full bg-primary"
          data-testid="active-indicator-dot"
        ></span>
      </span>
    )}

    <div className="text-xl">{player.name}</div>

    <div className="text-primary flex-list">
      <div className="coin">
        <AnimatedNumber value={player.coins} />
      </div>
    </div>

    {player.playerReady && (
      <div className="flex-list">
        <FaCheck />
        {messages.ui.ready}
      </div>
    )}
  </div>
)
