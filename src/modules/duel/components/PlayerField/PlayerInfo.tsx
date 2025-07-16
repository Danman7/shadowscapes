import React from 'react'
import { GiCardPlay, GiReceiveMoney, GiTwoCoins } from 'react-icons/gi'
import { useTheme } from 'styled-components'

import {
  PlayerInfoPanel,
  PlayerName,
} from 'src/modules/duel/components/PlayerField/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'
import { DuelPlayer } from 'src/modules/duel/types'

export const PlayerInfo: React.FC<{
  player: DuelPlayer
  isActive?: boolean
}> = ({ player, isActive }) => {
  const theme = useTheme()
  const delayInSeconds = useThemeTransitionTimeInSeconds()

  return (
    <PlayerInfoPanel>
      <PlayerName
        animate={{
          color: isActive ? theme.colors.active : theme.colors.text,
          textShadow: isActive
            ? `0 0 ${theme.spacing / 4}px ${theme.colors.active}`
            : 'none',
        }}
        transition={{
          duration: delayInSeconds * 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {isActive && <GiCardPlay />} {player.name}
      </PlayerName>
      <div>
        {player.income ? (
          <span>
            <GiReceiveMoney /> {player.income}{' '}
          </span>
        ) : null}
        <span>
          <GiTwoCoins /> {player.coins}
        </span>{' '}
      </div>
    </PlayerInfoPanel>
  )
}
