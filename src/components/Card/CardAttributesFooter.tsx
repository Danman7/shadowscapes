import { motion } from 'motion/react'
import { BsLightningFill } from 'react-icons/bs'
import { FaRegEyeSlash } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'
import { PiArrowsClockwiseFill } from 'react-icons/pi'
import { TbSwordOff } from 'react-icons/tb'

import { CHARGE_BADGE_VARIANTS } from 'src/components/animation'
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
  chargeAnimationKey?: number
  type: CardType
}> = ({ attributes, chargeAnimationKey = 0, type }) => {
  return (
    <div className="flex justify-between items-center pt-1">
      <div className="flex-list">
        {getCardFooterBadges(attributes, type).map((badge) => {
          const shouldAnimateCharges =
            badge.kind === 'charges' && chargeAnimationKey > 0

          return (
            <motion.div
              key={
                shouldAnimateCharges
                  ? `${badge.key}-${chargeAnimationKey}`
                  : badge.key
              }
              variants={
                shouldAnimateCharges ? CHARGE_BADGE_VARIANTS : undefined
              }
              initial={shouldAnimateCharges ? 'initial' : false}
              animate={shouldAnimateCharges ? 'animate' : undefined}
            >
              <div className="badge">{renderBadgeContent(badge)}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="coin">{attributes.cost}</div>
    </div>
  )
}
