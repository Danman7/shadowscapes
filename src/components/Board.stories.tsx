import type { Meta, StoryObj } from '@storybook/react';
import { Board } from './Board';
import { createCardInstance } from '../test/mocks/cardInstances';

const meta: Meta<typeof Board> = {
  title: 'Components/Board',
  component: Board,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Board>;

const sampleCards = [
  createCardInstance(1, 'zombie', 2),
  createCardInstance(2, 'templeGuard', 3),
  createCardInstance(3, 'downwinder', 2),
];

export const WithCards: Story = {
  args: {
    cards: sampleCards,
    playerName: 'Player 1',
  },
};

export const EmptyBoard: Story = {
  args: {
    cards: [],
    playerName: 'Player 2',
  },
};

export const SingleCard: Story = {
  args: {
    cards: [sampleCards[0]!],
  },
};
