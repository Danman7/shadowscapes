import { GiFist, GiPowerLightning } from 'react-icons/gi'

import {
  getColoredBoxClassNames,
  getDescriptionParagraphs,
  joinStringsWithComma,
} from '@/components/utils'
import { CardDefinition, isCharacter } from '@/types'

export const Card: React.FC<CardDefinition> = (props) => {
  const { constants, categories, faction } = props
  const { name, rank, description, flavor } = constants

  const boxClassNames = getColoredBoxClassNames(rank, faction)
  const paragraphs = getDescriptionParagraphs(description)

  return (
    <div className="bg-surface w-58 h-80 flex flex-col spac rounded-lg shadow-md relative p-2 border-[] box-border border-1 border-foreground/10">
      <header className={`flex-col h-13 ${boxClassNames} pb-1`}>
        <h2 className="text-lg">{name}</h2>

        <div className="text-xs">{joinStringsWithComma(categories)}</div>
      </header>

      <section
        className="flex flex-col flex-2 items-center justify-around text-center text-sm"
        data-testid="card-description"
      >
        {paragraphs}

        <p className="text-xs text-light">{flavor}</p>
      </section>

      <footer className={`${boxClassNames} h-7`}>
        {isCharacter(props) ? (
          <div className={`flex items-center`}>
            <GiFist /> {props.strength}
          </div>
        ) : (
          <GiPowerLightning />
        )}
      </footer>
    </div>
  )
}
