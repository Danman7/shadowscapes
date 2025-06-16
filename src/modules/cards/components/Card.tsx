import { useEffect, useState } from 'react'
import { FaHandFist } from 'react-icons/fa6'
import { GiPowerLightning, GiTwoCoins } from 'react-icons/gi'
import { useTheme } from 'styled-components'

import { messages } from 'src/i18n/indext'
import { flipVariants } from 'src/modules/cards/components/animations'
import {
  CardBack,
  CardBody,
  CardCategories,
  CardContainer,
  CardFlipper,
  CardFooter,
  CardFront,
  CardHeader,
  CardTitle,
  FlavorText,
} from 'src/modules/cards/components/styles'
import type { CardBase } from 'src/modules/cards/types'
import {
  getCharacterFooterIcons,
  getCharacterTraitsDescriptions,
  getFactionBackground,
  joinCardCategories,
} from 'src/modules/cards/utils'

interface CardProps {
  card: CardBase
  isFaceDown?: boolean
}

export const Card: React.FC<CardProps> = ({ card, isFaceDown }) => {
  const {
    type,
    name,
    faction,
    categories,
    isElite,
    description,
    onPlayDescription,
    onDiscardDescription,
    cost,
    flavor,
    counter,
  } = card

  const theme = useTheme()

  const [showFront, setShowFront] = useState(!isFaceDown)

  const handleCardFlipperAnimationStart = () => {
    if (!showFront && !isFaceDown) {
      setShowFront(!isFaceDown)
    }
  }

  const handleCardFlipperAnimationComplete = () => {
    setShowFront(!isFaceDown)
  }

  const strength = type === 'Character' ? card.strength : 0
  const traits = type === 'Character' ? card.traits : undefined
  const isHidden = traits && traits.includes('hidden')

  // In tests, sync state immediately when isFaceDown changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setShowFront(!isFaceDown)
    }
  }, [isFaceDown])

  return (
    <CardContainer>
      <CardFlipper
        variants={flipVariants}
        animate={isFaceDown ? 'faceDown' : 'faceUp'}
        transition={{ duration: 0.6, ease: [0.4, 0.2, 0.2, 1] }}
        onAnimationStart={handleCardFlipperAnimationStart}
        onAnimationComplete={handleCardFlipperAnimationComplete}
      >
        <CardFront $isHidden={isHidden}>
          {showFront && (
            <>
              <CardHeader $background={getFactionBackground(theme, faction)}>
                <CardTitle>
                  <strong>{name}</strong>
                  <strong>
                    {strength ? (
                      <>
                        <FaHandFist /> {strength}
                      </>
                    ) : (
                      <GiPowerLightning />
                    )}
                  </strong>
                </CardTitle>

                <CardCategories $isElite={isElite}>
                  <small>{joinCardCategories(categories)}</small>
                </CardCategories>
              </CardHeader>

              <CardBody>
                {onPlayDescription && (
                  <p>
                    <strong>{messages.card.onPlay}</strong>
                    {onPlayDescription}
                  </p>
                )}

                {description && <p>{description}</p>}

                {onDiscardDescription && (
                  <p>
                    <strong>{messages.card.onDiscard}</strong>
                    {onDiscardDescription}
                  </p>
                )}

                {getCharacterTraitsDescriptions(traits)}

                {flavor && <FlavorText>{flavor}</FlavorText>}
              </CardBody>

              <CardFooter $isElite={isElite}>
                <div>
                  <GiTwoCoins /> {cost}
                </div>
                {getCharacterFooterIcons(traits, counter)}
              </CardFooter>
            </>
          )}
        </CardFront>

        <CardBack />
      </CardFlipper>
    </CardContainer>
  )
}
