import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'

import { IntroScreen } from '@/components/IntroScreen'
import { GameProvider } from '@/contexts/GameContext'
import { useGameDispatch } from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

const meta: Meta<typeof IntroScreen> = {
  title: 'Components/IntroScreen',
  component: IntroScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      function DuelInitializer() {
        const dispatch = useGameDispatch()

        useEffect(() => {
          dispatch({
            type: 'START_DUEL',
            payload: DEFAULT_DUEL_SETUP,
          })
        }, [dispatch])

        return <Story />
      }

      return (
        <GameProvider>
          <DuelInitializer />
        </GameProvider>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof IntroScreen>

export const Default: Story = {
  args: {},
}

export const WithContinueButton: Story = {
  args: {
    onContinue: () => alert('Duel starting!'),
  },
}
