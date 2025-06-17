import { GiStoneStack } from 'react-icons/gi'
import { DefaultTheme } from 'styled-components/dist/types'

import { traitInfoMap } from 'src/modules/cards/constants'
import {
  CardCategory,
  CardFaction,
  CharacterTrait,
} from 'src/modules/cards/types'
import { generateId } from 'src/utils'

export const getFactionBackground = (
  theme: DefaultTheme,
  faction?: CardFaction,
) => {
  const factionMap: Record<string, string> = {
    Order: theme.colors.faction.order,
    Chaos: theme.colors.faction.chaos,
    Shadow: theme.colors.faction.shadow,
  }

  return faction ? factionMap[faction] : theme.colors.text
}

export const joinCardCategories = (categories: CardCategory[]) =>
  categories.join(', ')

export const getCharacterTraitsDescriptions = (traits?: CharacterTrait[]) => (
  <>
    {traits ? (
      <div>
        {traits.map((trait) => {
          const { title, description } = traitInfoMap[trait]

          return (
            <p key={`trait-desc-${generateId()}`}>
              <strong>{title}</strong>
              {description}
            </p>
          )
        })}
      </div>
    ) : null}
  </>
)

export const getCharacterFooterIcons = (
  traits?: CharacterTrait[],
  counter?: number,
) => (
  <div>
    {traits ? (
      <div>
        {traits.map((trait) => {
          const IconComponent = traitInfoMap[trait].icon

          return <IconComponent key={`trait-icon-${generateId()}`} />
        })}
      </div>
    ) : null}

    {counter !== undefined ? (
      <span>
        <GiStoneStack /> {counter}
      </span>
    ) : null}
  </div>
)
