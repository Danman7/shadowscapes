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
          {strength ? <strong>{strength}</strong> : null}
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

        {onDiscardDescription && (
          <p>
            <strong>{messages.card.onDiscard}</strong>
            {onDiscardDescription}
          </p>
        )}

        {flavor && <FlavorText>{flavor}</FlavorText>}
      </CardBody>

      <CardFooter $isElite={isElite}>{cost}</CardFooter>
    </CardContainer>
  )
}
