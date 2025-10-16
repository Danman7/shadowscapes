import {
  GiCrownCoin,
  GiFist,
  GiLaurels,
  GiPowerLightning,
} from 'react-icons/gi'

import { CARD_COST_TESTID, CARD_STRENGTH_TESTID } from '@/components/testIds'
import {
  getColoredBoxClassNames,
  getDescriptionParagraphs,
  joinStringsWithComma,
} from '@/components/utils'
import { CardRanks } from '@/data'
import { CardDefinition, isCharacter } from '@/types'

export const Card: React.FC<CardDefinition> = (props) => {
  const { constants, categories, faction, rank } = props
  const { name, description, flavor } = constants

  const boxClassNames = getColoredBoxClassNames(rank, faction)
  const paragraphs = getDescriptionParagraphs(description)

  return (
    <div className="bg-surface w-52 h-74 flex flex-col spac rounded-lg shadow-md relative p-2 border-[] box-border border-1 border-foreground/10">
      <header className={`flex-col h-12 ${boxClassNames}`}>
        <h2>{name}</h2>

        <div className="text-xs">{joinStringsWithComma(categories)}</div>
      </header>

      <section
        className="flex flex-col flex-2 items-center justify-around text-center text-sm"
        data-testid="card-description"
      >
        {paragraphs}

        <p className="text-xs text-light">{flavor}</p>
      </section>

      <footer className={`${boxClassNames} h-7 gap-3`}>
        {rank === CardRanks.Elite && <GiLaurels />}

        {isCharacter(props) ? (
          <div
            className="flex items-center gap-1"
            data-testid={CARD_STRENGTH_TESTID}
          >
            <GiFist /> {props.strength}
          </div>
        ) : (
          <GiPowerLightning />
        )}

        <div className="flex items-center gap-1" data-testid={CARD_COST_TESTID}>
          <GiCrownCoin /> {props.cost}
        </div>
      </footer>
    </div>
  )
}
