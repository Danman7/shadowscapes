import type { Meta, StoryObj } from "@storybook/react";
import { Hand } from "./Hand";
import { createCardInstance } from "../test/mocks/cardInstances";

const meta: Meta<typeof Hand> = {
  title: "Components/Hand",
  component: Hand,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Hand>;

const sampleCards = [
  createCardInstance(1, "zombie", 2),
  createCardInstance(2, "templeGuard", 3),
  createCardInstance(3, "bookOfAsh"),
];

export const ActiveHand: Story = {
  args: {
    cards: sampleCards,
    isActive: true,
  },
};

export const InactiveHand: Story = {
  args: {
    cards: sampleCards,
    isActive: false,
  },
};

export const EmptyHand: Story = {
  args: {
    cards: [],
    isActive: true,
  },
};

export const SingleCard: Story = {
  args: {
    cards: [sampleCards[0]!],
    isActive: true,
  },
};
