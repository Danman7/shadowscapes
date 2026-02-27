import type { Meta, StoryObj } from '@storybook/react'

import { DuelView } from 'src/components/DuelView'
import { GameProvider } from 'src/contexts/GameContext'
import {
  MIXED_STACKS_DUEL,
  PRELOADED_DUEL_SETUP,
} from 'src/test/mocks/duelSetup'

const meta: Meta<typeof DuelView> = {
  title: 'Duel/DuelView',
  component: DuelView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DuelView>

export const RedrawPhase: Story = {
  render: () => (
    <GameProvider preloadedState={PRELOADED_DUEL_SETUP}>
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
