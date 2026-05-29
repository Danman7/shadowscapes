import {
  CARD_ATTRIBUTE_KEYS,
  type CardAttributeKey,
} from 'src/components/Card/cardAttributeKeys'
import type { CardAttributes, CardType } from 'src/game-engine'
import { formatString, messages } from 'src/i18n'

type AttributeValue = number | string

export interface CardAttributeDetail {
  key: CardAttributeKey
  label?: string
  value: AttributeValue
}

type FooterAttributeKey = Exclude<CardAttributeKey, 'cost' | 'life'>

export type CardFooterBadgeKind =
  | 'strength'
  | 'stunned'
  | 'charges'
  | 'haste'
  | 'cannot-attack'
  | 'retaliates'
  | 'hidden'

export interface CardFooterBadge {
  key: FooterAttributeKey
  kind: CardFooterBadgeKind
  value?: number
}

interface CardAttributeConfig {
  label?: string
  shouldRender: (attributes: CardAttributes) => boolean
  getValue: (attributes: CardAttributes) => AttributeValue
}

interface FooterAttributeConfig {
  shouldRender: (attributes: CardAttributes, type: CardType) => boolean
  getBadge: (attributes: CardAttributes) => CardFooterBadge
}

const getEffectiveStrength = (attributes: CardAttributes): number => {
  return (attributes.strength ?? 0) + (attributes.nextAttackStrengthBonus ?? 0)
}

const CARD_ATTRIBUTE_MAP: Record<CardAttributeKey, CardAttributeConfig> = {
  cost: {
    label: messages.ui.cost,
    shouldRender: () => true,
    getValue: ({ cost }) =>
      `${formatString(messages.ui.amountOfCoins, { coins: cost })}.`,
  },
  life: {
    label: messages.ui.remainingLife,
    shouldRender: ({ life }) => life !== undefined,
    getValue: ({ life }) => life ?? 0,
  },
  strength: {
    label: messages.ui.strength,
    shouldRender: ({ strength }) => strength !== undefined,
    getValue: (attributes) =>
      `${getEffectiveStrength(attributes)} - ${messages.ui.strengthDescription}`,
  },
  charges: {
    label: messages.ui.charges,
    shouldRender: ({ charges }) => charges !== undefined,
    getValue: ({ charges }) => charges ?? 0,
  },
  hasHaste: {
    label: messages.ui.haste,
    shouldRender: ({ hasHaste }) => hasHaste === true,
    getValue: () => messages.ui.hasteDescription,
  },
  cannotAttack: {
    shouldRender: ({ cannotAttack }) => cannotAttack === true,
    getValue: () => messages.ui.cannotAttack,
  },
  retaliates: {
    shouldRender: ({ retaliates }) => retaliates === true,
    getValue: () => messages.ui.retaliates,
  },
  isStunned: {
    label: messages.ui.stunned,
    shouldRender: ({ isStunned }) => isStunned === true,
    getValue: () => messages.ui.stunnedDescription,
  },
  isHidden: {
    label: messages.ui.hidden,
    shouldRender: ({ isHidden }) => isHidden === true,
    getValue: () => messages.ui.hiddenDescription,
  },
}

const CARD_FOOTER_ATTRIBUTE_MAP: Record<
  FooterAttributeKey,
  FooterAttributeConfig
> = {
  strength: {
    shouldRender: ({ strength }, type) =>
      type === 'Character' && strength !== undefined,
    getBadge: (attributes) =>
      attributes.isStunned
        ? { key: 'strength', kind: 'stunned' }
        : {
            key: 'strength',
            kind: 'strength',
            value: getEffectiveStrength(attributes),
          },
  },
  charges: {
    shouldRender: ({ charges }) => charges !== undefined,
    getBadge: ({ charges }) => ({
      key: 'charges',
      kind: 'charges',
      value: charges ?? 0,
    }),
  },
  hasHaste: {
    shouldRender: ({ hasHaste }) => hasHaste === true,
    getBadge: () => ({ key: 'hasHaste', kind: 'haste' }),
  },
  cannotAttack: {
    shouldRender: ({ cannotAttack }) => cannotAttack === true,
    getBadge: () => ({ key: 'cannotAttack', kind: 'cannot-attack' }),
  },
  retaliates: {
    shouldRender: ({ retaliates }) => retaliates === true,
    getBadge: () => ({ key: 'retaliates', kind: 'retaliates' }),
  },
  isStunned: {
    shouldRender: () => false,
    getBadge: () => ({ key: 'isStunned', kind: 'stunned' }),
  },
  isHidden: {
    shouldRender: ({ isHidden }) => isHidden === true,
    getBadge: () => ({ key: 'isHidden', kind: 'hidden' }),
  },
}

const CARD_FOOTER_ATTRIBUTE_KEYS = CARD_ATTRIBUTE_KEYS.filter(
  (attributeKey): attributeKey is FooterAttributeKey =>
    attributeKey !== 'cost' && attributeKey !== 'life',
)

export const getCardAttributeDetails = (
  attributes: CardAttributes,
): CardAttributeDetail[] =>
  CARD_ATTRIBUTE_KEYS.flatMap((attributeKey) => {
    const { label, shouldRender, getValue } = CARD_ATTRIBUTE_MAP[attributeKey]

    if (!shouldRender(attributes)) return []

    return [
      {
        key: attributeKey,
        label,
        value: getValue(attributes),
      },
    ]
  })

export const getCardFooterBadges = (
  attributes: CardAttributes,
  type: CardType,
): CardFooterBadge[] =>
  CARD_FOOTER_ATTRIBUTE_KEYS.flatMap((attributeKey) => {
    const { shouldRender, getBadge } = CARD_FOOTER_ATTRIBUTE_MAP[attributeKey]

    if (!shouldRender(attributes, type)) return []

    return [getBadge(attributes)]
  })
