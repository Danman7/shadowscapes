import type { Meta, StoryObj } from '@storybook/react';
import { DiscardPile } from './DiscardPile';

const meta: Meta<typeof DiscardPile> = {
  title: 'Components/DiscardPile',
  component: DiscardPile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DiscardPile>;

export const WithCards: Story = {
  args: {
    count: 8,
    label: 'Discard',
  },
};

export const FewCards: Story = {
  args: {
    count: 2,
    label: 'Discard',
  },
};

export const EmptyDiscard: Story = {
  args: {
    count: 0,
    label: 'Discard',
  },
};
