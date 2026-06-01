import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'

import { Button, Card } from 'src/components'
import { CARD_BASES, createCardInstance } from 'src/game-engine'

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },

  args: {
    isOnBoard: false,
  },
}

export default meta
type Story = StoryObj<typeof Card>

const FeedbackCardStory: React.FC = () => {
  const [life, setLife] = useState(3)
  const [charges, setCharges] = useState(2)
  const card = useMemo(
    () =>
      createCardInstance('haunt', 'feedback-haunt', {
        charges,
        life,
      }),
    [charges, life],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <Card card={card} isOnBoard />

      <div className="flex-list">
        <Button onClick={() => setLife((currentLife) => currentLife - 1)}>
          Damage
        </Button>
        <Button onClick={() => setLife((currentLife) => currentLife + 1)}>
          Heal
        </Button>
        <Button
          onClick={() =>
            setCharges((currentCharges) =>
              currentCharges === 0 ? 2 : currentCharges - 1,
            )
          }
        >
          Charge
        </Button>
      </div>
    </div>
  )
}

export const AllCardsGallery: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(CARD_BASES).map(([id, base]) => (
        <div key={id} className="flex flex-col gap-2">
          <Card card={createCardInstance(id as keyof typeof CARD_BASES)} />
          <div className="text-center text-sm font-semibold">{base.name}</div>
        </div>
      ))}
    </div>
  ),
}

export const Character: Story = {
  args: {
    card: createCardInstance('templeGuard'),
  },
}

export const OnBoard: Story = {
  args: {
    isOnBoard: true,
    card: createCardInstance('templeGuard'),
  },
}

export const Instant: Story = {
  args: {
    card: createCardInstance('bookOfAsh'),
  },
}

export const Stunned: Story = {
  args: {
    card: createCardInstance('templeGuard', undefined, { isStunned: true }),
  },
}

export const HasHaste: Story = {
  args: {
    card: createCardInstance('templeGuard', undefined, { hasHaste: true }),
  },
}

export const IsHidden: Story = {
  args: {
    card: createCardInstance('templeGuard', undefined, { isHidden: true }),
  },
}

export const Feedback: Story = {
  render: () => <FeedbackCardStory />,
}
