import { motion } from 'motion/react'
import { useTheme } from 'styled-components'

import { FullScreenCenteredContainer } from 'src/components/styles'
import { formatString, messages } from 'src/i18n/indext'
import { CoinFlip } from 'src/modules/duel/components/CoinFlip'
import {
  FirstPlayerMessage,
  IntroPlayerName,
  VersusContainer,
} from 'src/modules/duel/components/styles'
import { DuelPlayers } from 'src/modules/duel/types'

export const DuelIntroScreen: React.FC<{
  players: DuelPlayers
  activePlayerId: string
  userId: string
}> = ({ players, activePlayerId, userId }) => {
  const playerNames = Object.values(players).map((player) => player.name)
  const { transitionTime, spacing } = useTheme()

  const delayInSeconds = transitionTime / 1000
  const isUserFirst = activePlayerId === userId
  const isActivePlayerFirst = Object.keys(players)[0] === activePlayerId
  const coinSide = isUserFirst
    ? 'heads'
    : isActivePlayerFirst
      ? 'heads'
      : 'tails'

  return (
    <FullScreenCenteredContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: delayInSeconds * 4 }}
    >
      <VersusContainer>
        <IntroPlayerName
          initial={{ opacity: 0, x: '-50vw' }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: delayInSeconds * 20,
            ease: [0.16, 1, 0.3, 1],
          }}
          $justify="flex-end"
        >
          {playerNames[0]}
        </IntroPlayerName>

        <motion.h1
          initial={{ opacity: 0, y: spacing * 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delayInSeconds * 4,
            duration: delayInSeconds * 10,
            ease: 'easeInOut',
            type: 'spring',
            bounce: 0.3,
          }}
        >
          {messages.duel.vs}
        </motion.h1>

        <IntroPlayerName
          initial={{ opacity: 0, x: '50vw' }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: delayInSeconds * 20,
            ease: [0.16, 1, 0.3, 1],
          }}
          $justify="flex-start"
        >
          {playerNames[1]}
        </IntroPlayerName>
      </VersusContainer>

      <CoinFlip result={coinSide} />

      <FirstPlayerMessage
        initial={{ opacity: 0, y: '60vh' }}
        animate={{ opacity: 1, y: '40vh' }}
        transition={{
          delay: delayInSeconds * 16,
          duration: delayInSeconds * 4,
          ease: 'easeInOut',
        }}
      >
        {formatString(messages.duel.firstPlayer, {
          playerName: players[activePlayerId].name,
        })}
      </FirstPlayerMessage>
    </FullScreenCenteredContainer>
  )
}
