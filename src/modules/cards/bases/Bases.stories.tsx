import type { Meta } from '@storybook/react'

import { allCardBases } from 'src/modules/cards/bases'
import { Card } from 'src/modules/cards/components/Card'

const meta: Meta = {
  title: 'Cards/Gallery',
  tags: ['!autodocs', 'Showcase'],
}

export default meta

export const Gallery = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
    {Object.entries(allCardBases).map(([name, card]) => (
      <div key={name}>
        <Card card={card} />
        <div style={{ textAlign: 'center', marginTop: 8 }}>{name}</div>
      </div>
    ))}
  </div>
)
