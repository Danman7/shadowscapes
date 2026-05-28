import type { Meta, StoryObj } from '@storybook/react'

import { DuelView } from 'src/components'
import { GameProvider } from 'src/contexts'
import { GAME_DUEL, MIXED_STACKS_DUEL } from 'src/game-engine/testing'

const meta: Meta<typeof DuelView> = {
  title: 'Duel/DuelView',
  component: DuelView,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof DuelView>

export const RedrawPhase: Story = {
  render: () => (
    <GameProvider preloadedState={GAME_DUEL}>
      <DuelView />
    </GameProvider>
  ),
}

export const PlayerTurnPhase: Story = {
  render: () => (
    <GameProvider preloadedState={MIXED_STACKS_DUEL}>
      <DuelView />
    </GameProvider>
  ),
}
