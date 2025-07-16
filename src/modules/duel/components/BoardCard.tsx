import { useEffect, useMemo, useState } from 'react'
import { GiSemiClosedEye } from 'react-icons/gi'

import { flipVariants } from 'src/modules/cards/components/animations'
import { Card } from 'src/modules/cards/components/Card'
import { CardBase } from 'src/modules/cards/types'
import {
  CardBack,
  CardContainer,
  CardFace,
  CardFlipper,
  HiddenAgent,
} from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
import {
  findPlayerAndStackFromId,
  getBaseFromDuelCard,
} from 'src/modules/duel/utils'
import { useUser } from 'src/modules/user/hooks'

interface BoardCardProps {
  cardId: string
  animationDelay?: number
}

export const BoardCard: React.FC<BoardCardProps> = ({ 
  cardId, 
  animationDelay = 0 
}) => {
  const {
    state: {
      user: { id: userId },
    },
  } = useUser()

  const {
    state: { cards, players },
  } = useDuel()

  const { stack, player } = findPlayerAndStackFromId(cardId, players)
  const doesCardBelongToUser = userId === player.id
  const duelCard = cards[cardId]

  const isFaceDown =
    stack === 'discard' ||
    stack === 'deck' ||
    (!doesCardBelongToUser && stack === 'hand')

  const isHidden =
    !doesCardBelongToUser &&
    stack === 'board' &&
    duelCard.type === 'character' &&
    duelCard.traits?.includes('hidden')

  const [showFront, setShowFront] = useState(!isFaceDown)

  const handleCardFlipperAnimationStart = () => {
    if (!showFront && !isFaceDown) {
      setShowFront(!isFaceDown)
    }
  }

  const handleCardFlipperAnimationComplete = () => {
    setShowFront(!isFaceDown)
  }

  const card: CardBase = useMemo(
    () => getBaseFromDuelCard(duelCard),
    [duelCard],
  )

  // In tests, sync state immediately when isFaceDown changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setShowFront(!isFaceDown)
    }
  }, [isFaceDown])

  return (
    <CardContainer>
      <CardFlipper
        layoutId={cardId}
        initial={false}
        variants={flipVariants}
        animate={isFaceDown ? 'faceDown' : 'faceUp'}
        transition={{ 
          duration: 0.6, 
          ease: [0.4, 0.2, 0.2, 1],
          layout: { delay: animationDelay }
        }}
        onAnimationStart={handleCardFlipperAnimationStart}
        onAnimationComplete={handleCardFlipperAnimationComplete}
      >
        {showFront && (
          <CardFace>
            {isHidden ? (
              <HiddenAgent>
                <GiSemiClosedEye />
              </HiddenAgent>
            ) : (
              <Card card={card} />
            )}
          </CardFace>
        )}

        <CardBack />
      </CardFlipper>
    </CardContainer>
  )
}
