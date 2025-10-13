import { GiFist, GiPowerLightning } from 'react-icons/gi'

import {
  getColoredBoxClassNames,
  joinStringsWithComma,
} from '@/components/utils'
import { CardDefinition, isCharacter } from '@/types'

export const Card: React.FC<CardDefinition> = (props) => {
  const { constants, categories, faction } = props
  const { name, rank } = constants

  const boxClassNames = getColoredBoxClassNames(rank, faction)

  return (
    <div className="bg-surface w-62 h-87 flex  flex-col spac rounded-lg shadow-md relative p-1 border-[] box-border border-1 border-foreground/10">
      <header className={`flex-col h-13 ${boxClassNames}`}>
        <h2 className="text-lg">{name}</h2>

        <div className="text-xs">{joinStringsWithComma(categories)}</div>
      </header>

      <section className="flex-2"></section>

      <footer className={`${boxClassNames} text-lg h-8`}>
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
