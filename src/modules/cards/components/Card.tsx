import { FaHandFist } from 'react-icons/fa6'
import { GiPowerLightning, GiTwoCoins } from 'react-icons/gi'
import { useTheme } from 'styled-components'

import { messages } from 'src/i18n/indext'
import {
  CardBody,
  CardCategories,
  CardContainer,
  CardFooter,
  CardHeader,
  CardTitle,
  FlavorText,
} from 'src/modules/cards/components/styles'
import type { CardBase } from 'src/modules/cards/types'
import {
  getCharacterTraitsDescriptions,
  getCharacterFooterIcons,
  getFactionBackground,
  joinCardCategories,
} from 'src/modules/cards/utils'

interface CardProps {
  card: CardBase
}

export const Card: React.FC<CardProps> = ({ card }) => {
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

  const strength = type === 'Character' ? card.strength : 0
  const traits = type === 'Character' ? card.traits : undefined
  const isHidden = traits && traits.includes('hidden')

  return (
    <CardContainer $isHidden={isHidden}>
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
    </CardContainer>
  )
}
