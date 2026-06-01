import { motion } from 'motion/react'
import { FaCheck } from 'react-icons/fa'

import { AnimatedNumber } from 'src/components'
import {
  FADE_IN_SCALE_VARIANTS,
  QUICK_TRANSITION,
} from 'src/components/animation'
import type { Player } from 'src/game-engine'
import { messages } from 'src/i18n'

export const PlayerBadge: React.FC<{
  player: Player
  isActive?: boolean
}> = ({ player, isActive }) => {
  const positionClassName = isActive
    ? 'border-primary bottom-2'
    : 'top-2 border-foreground/20'

  return (
    <div
      className={`absolute left-1/2 transform -translate-x-1/2 z-50 ${positionClassName}`}
      data-testid={isActive ? 'active-player-badge' : 'player-badge'}
    >
      <motion.div
        variants={FADE_IN_SCALE_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={QUICK_TRANSITION}
        className={`box px-4 py-1 shadow-xl flex-list ${positionClassName}`}
      >
        {isActive && (
          <span className="relative flex size-4" data-testid="active-indicator">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
              data-testid="active-indicator-ping"
            ></span>
            <span
              className="relative inline-flex size-4 rounded-full bg-primary"
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
      </motion.div>
    </div>
  )
}
