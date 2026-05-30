import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'

import { DiscardPileDialog } from 'src/components'
import { createCardInstance } from 'src/game-engine'
import { messages } from 'src/i18n'

const discardCards = [
  createCardInstance('zombie', 'discard-zombie'),
  createCardInstance('haunt', 'discard-haunt', { charges: 2 }),
  createCardInstance('markander', 'discard-markander'),
  createCardInstance('bookOfAsh', 'discard-book-of-ash'),
]

const meta: Meta<typeof DiscardPileDialog> = {
  title: 'Duel/DiscardPileDialog',
  component: DiscardPileDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
    cards: discardCards,
    title: messages.cards.bookOfAsh.name,
    closeLabel: messages.ui.close,
    noValidTargetsLabel: messages.ui.noValidTargets,
    isCardSelectable: (card) => card.base.isElite !== true,
    onSelectCard: fn(),
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<typeof DiscardPileDialog>

export const WithSelectableCards: Story = {}

export const NoValidTargets: Story = {
  args: {
    cards: [
      createCardInstance('bookOfAsh', 'discard-book-of-ash-only'),
      createCardInstance('sachelman', 'discard-sachelman-only'),
      createCardInstance('markander', 'discard-markander-only'),
    ],
  },
}

export const Empty: Story = {
  args: {
    cards: [],
  },
}
