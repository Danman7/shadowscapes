import type { Meta, StoryObj } from '@storybook/react';
import { DeckPile } from './DeckPile';

const meta: Meta<typeof DeckPile> = {
  title: 'Components/DeckPile',
  component: DeckPile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DeckPile>;

export const FullDeck: Story = {
  args: {
    count: 20,
    label: 'Deck',
  },
};

export const FewCards: Story = {
  args: {
    count: 3,
    label: 'Deck',
  },
};

export const EmptyDeck: Story = {
  args: {
    count: 0,
    label: 'Deck',
  },
};
