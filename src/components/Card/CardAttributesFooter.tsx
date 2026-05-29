import { BsLightningFill } from 'react-icons/bs'
import { FaRegEyeSlash } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'
import { PiArrowsClockwiseFill } from 'react-icons/pi'
import { TbSwordOff } from 'react-icons/tb'

import {
  type CardFooterBadge,
  getCardFooterBadges,
} from 'src/components/Card/cardAttributeModels'
import type { CardAttributes, CardType } from 'src/game-engine'

const renderBadgeContent = (badge: CardFooterBadge): React.ReactNode => {
  switch (badge.kind) {
    case 'strength':
      return (
        <>
          <FaHandFist /> {badge.value}
        </>
      )

    case 'stunned':
      return <GiStarSwirl />

    case 'charges':
      return (
        <>
          <BsLightningFill /> {badge.value}
        </>
      )

    case 'haste':
      return <GiWingfoot />

    case 'cannot-attack':
      return <TbSwordOff />

    case 'retaliates':
      return <PiArrowsClockwiseFill />

    case 'hidden':
      return <FaRegEyeSlash />
  }
}

export const CardAttributesFooter: React.FC<{
  attributes: CardAttributes
  type: CardType
}> = ({ attributes, type }) => {
  return (
    <div className="flex justify-between items-center pt-1">
      <div className="flex-list">
        {getCardFooterBadges(attributes, type).map((badge) => {
          return (
            <div key={badge.key}>
              <div className="badge">{renderBadgeContent(badge)}</div>
            </div>
          )
        })}
      </div>

      <div className="coin">{attributes.cost}</div>
    </div>
  )
}
