import { Fragment } from 'react/jsx-runtime'
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
        {traits.map(({ type }) => {
          const { title, description } = traitInfoMap[type]

          return title && description ? (
            <p key={`trait-desc-${generateId()}`}>
              <strong>{title}</strong>
              {description}
            </p>
          ) : null
        })}
      </div>
    ) : null}
  </>
)

export const getCharacterTraitsFooterIcons = (traits?: CharacterTrait[]) => (
  <>
    {traits ? (
      <div>
        {traits.map(({ type, value }) => {
          const IconComponent = traitInfoMap[type].icon

          return (
            <Fragment key={`trait-icon-${generateId()}`}>
              <IconComponent key={type} />

              {typeof value === 'number' ? value : null}
            </Fragment>
          )
        })}
      </div>
    ) : null}
  </>
)
