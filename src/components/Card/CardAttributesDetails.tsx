import { getCardAttributeDetails } from 'src/components/Card/cardAttributeModels'
import type { CardAttributes } from 'src/game-engine'

export const CardAttributesDetails: React.FC<{
  attributes: CardAttributes
}> = ({ attributes }) => {
  return (
    <>
      {getCardAttributeDetails(attributes).map(({ key, label, value }) => {
        if (!label) {
          return <p key={key}>{value}</p>
        }

        return (
          <p key={key}>
            <strong>{label}:</strong> {value}
          </p>
        )
      })}
    </>
  )
}
