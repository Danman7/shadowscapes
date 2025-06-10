import { messages } from 'src/i18n/indext'
import {
  CardBody,
  CardCategories,
  CardContainer,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'src/modules/cards/components/styles'
import type { CardBase } from 'src/modules/cards/types'
import {
  getFactionBackground,
  joinCardCategories,
} from 'src/modules/cards/utils'
import { useTheme } from 'styled-components'

interface CardProps {
  card: CardBase
}

export const Card: React.FC<CardProps> = ({ card }) => {
  const { type, name, faction, categories, isElite, onPlayDescription, cost } =
    card

  const theme = useTheme()
  const strength = type === 'Character' ? card.strength : 0

  return (
    <CardContainer>
      <CardHeader $background={getFactionBackground(faction, theme)}>
        <CardTitle>
          <strong>{name}</strong>
          {strength && <strong>{strength}</strong>}
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
      </CardBody>

      <CardFooter>{cost}</CardFooter>
    </CardContainer>
  )
}
