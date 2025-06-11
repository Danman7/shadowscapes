import { FaHandFist } from 'react-icons/fa6'
import { GiTwoCoins } from 'react-icons/gi'
import { GiPowerLightning } from 'react-icons/gi'
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
  } = card

  const theme = useTheme()
  const strength = type === 'Character' ? card.strength : 0

  return (
    <CardContainer>
      <CardHeader $background={getFactionBackground(faction, theme)}>
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

        {description && description.map((item) => <p>{item}</p>)}

        {onDiscardDescription && (
          <p>
            <strong>{messages.card.onDiscard}</strong>
            {onDiscardDescription}
          </p>
        )}

        {flavor && <FlavorText>{flavor}</FlavorText>}
      </CardBody>

      <CardFooter $isElite={isElite}>
        <GiTwoCoins /> {cost}
      </CardFooter>
    </CardContainer>
  )
}
