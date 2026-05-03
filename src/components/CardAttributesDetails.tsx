import { CARD_ATTRIBUTE_KEYS } from 'src/components/cardAttributeKeys'
import type { CardAttributes } from 'src/game-engine'
import { formatString, messages } from 'src/i18n'

interface CardAttributeConfig {
  label: string
  shouldRender: (attributes: CardAttributes) => boolean
  renderValue: (attributes: CardAttributes) => React.ReactNode
}

const CARD_ATTRIBUTE_MAP: Record<keyof CardAttributes, CardAttributeConfig> = {
  cost: {
    label: messages.ui.cost,
    shouldRender: () => true,
    renderValue: ({ cost }) =>
      `${formatString(messages.ui.amountOfCoins, { coins: cost })}.`,
  },
  life: {
    label: messages.ui.remainingLife,
    shouldRender: ({ life }) => life !== undefined,
    renderValue: ({ life }) => life,
  },
  strength: {
    label: messages.ui.strength,
    shouldRender: ({ strength }) => strength !== undefined,
    renderValue: ({ strength }) =>
      `${strength} - ${messages.ui.strengthDescription}`,
  },
  charges: {
    label: messages.ui.charges,
    shouldRender: ({ charges }) => charges !== undefined,
    renderValue: ({ charges }) => charges,
  },
  hasHaste: {
    label: messages.ui.haste,
    shouldRender: ({ hasHaste }) => hasHaste === true,
    renderValue: () => messages.ui.hasteDescription,
  },
  isStunned: {
    label: messages.ui.stunned,
    shouldRender: ({ isStunned }) => isStunned === true,
    renderValue: () => messages.ui.stunnedDescription,
  },
  isHidden: {
    label: messages.ui.hidden,
    shouldRender: ({ isHidden }) => isHidden === true,
    renderValue: () => messages.ui.hiddenDescription,
  },
}

export const CardAttributesDetails: React.FC<{
  attributes: CardAttributes
}> = ({ attributes }) => {
  return (
    <>
      {CARD_ATTRIBUTE_KEYS.map((attributeKey) => {
        const { label, shouldRender, renderValue } =
          CARD_ATTRIBUTE_MAP[attributeKey]

        if (!shouldRender(attributes)) return null

        return (
          <p key={attributeKey}>
            <strong>{label}:</strong> {renderValue(attributes)}
          </p>
        )
      })}
    </>
  )
}
