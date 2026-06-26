import type { Meta, StoryObj } from '@storybook/react';

import { DuelView } from './DuelTable';

const meta = {
  title: 'Components/Duel Table',
  component: DuelView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DuelView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyTemplate: Story = {};
