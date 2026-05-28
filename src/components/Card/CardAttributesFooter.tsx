import { BsLightningFill } from 'react-icons/bs'
import { FaRegEyeSlash } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'
import { PiArrowsClockwiseFill } from 'react-icons/pi'
import { TbSwordOff } from 'react-icons/tb'

import {
  CARD_ATTRIBUTE_KEYS,
  type CardAttributeKey,
} from 'src/components/Card/cardAttributeKeys'
import type { CardAttributes, CardType } from 'src/game-engine'

type FooterAttributeKey = Exclude<CardAttributeKey, 'cost' | 'life'>

interface FooterAttributeConfig {
  shouldRender: (attributes: CardAttributes, type: CardType) => boolean
  renderBadge: (attributes: CardAttributes) => React.ReactNode
}

const getEffectiveStrength = (attributes: CardAttributes): number => {
  return (attributes.strength ?? 0) + (attributes.nextAttackStrengthBonus ?? 0)
}

const CARD_FOOTER_ATTRIBUTE_MAP: Record<
  FooterAttributeKey,
  FooterAttributeConfig
> = {
  strength: {
    shouldRender: ({ strength }, type) =>
      type === 'Character' && strength !== undefined,
    renderBadge: (attributes) =>
      attributes.isStunned ? (
        <div className="badge">
          <GiStarSwirl />
        </div>
      ) : (
        <div className="badge">
          <FaHandFist /> {getEffectiveStrength(attributes)}
        </div>
      ),
  },
  charges: {
    shouldRender: ({ charges }) => charges !== undefined,
    renderBadge: ({ charges }) => (
      <div className="badge">
        <BsLightningFill /> {charges}
      </div>
    ),
  },
  hasHaste: {
    shouldRender: ({ hasHaste }) => hasHaste === true,
    renderBadge: () => (
      <div className="badge">
        <GiWingfoot />
      </div>
    ),
  },
  cannotAttack: {
    shouldRender: ({ cannotAttack }) => cannotAttack === true,
    renderBadge: () => (
      <div className="badge">
        <TbSwordOff />
      </div>
    ),
  },
  retaliates: {
    shouldRender: ({ retaliates }) => retaliates === true,
    renderBadge: () => (
      <div className="badge">
        <PiArrowsClockwiseFill />
      </div>
    ),
  },
  isStunned: {
    shouldRender: () => false,
    renderBadge: () => null,
  },
  isHidden: {
    shouldRender: ({ isHidden }) => isHidden === true,
    renderBadge: () => (
      <div className="badge">
        <FaRegEyeSlash />
      </div>
    ),
  },
}

const CARD_FOOTER_ATTRIBUTE_KEYS = CARD_ATTRIBUTE_KEYS.filter(
  (attributeKey): attributeKey is FooterAttributeKey =>
    attributeKey !== 'cost' && attributeKey !== 'life',
)

export const CardAttributesFooter: React.FC<{
  attributes: CardAttributes
  type: CardType
}> = ({ attributes, type }) => {
  return (
    <div className="flex justify-between items-center pt-1">
      <div className="flex-list">
        {CARD_FOOTER_ATTRIBUTE_KEYS.map((attributeKey) => {
          const { shouldRender, renderBadge } =
            CARD_FOOTER_ATTRIBUTE_MAP[attributeKey]

          if (!shouldRender(attributes, type)) return null

          return <div key={attributeKey}>{renderBadge(attributes)}</div>
        })}
      </div>

      <div className="coin">{attributes.cost}</div>
    </div>
  )
}
