import type { TargetAndTransition, Transition, Variants } from 'motion/react'

export const CARD_LAYOUT_TRANSITION = {
  type: 'spring',
  stiffness: 520,
  damping: 42,
  mass: 0.8,
} satisfies Transition

export const QUICK_TRANSITION = {
  duration: 0.22,
  ease: 'easeOut',
} satisfies Transition

export const DRAW_STAGGER_SECONDS = 0.08

export const CARD_SLOT_VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -8,
    transition: {
      duration: 0.16,
      ease: 'easeIn',
    },
  },
} satisfies Variants

export const FADE_IN_SCALE_VARIANTS = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
} satisfies Variants

export const SLIDE_LEFT_VARIANTS = {
  initial: {
    opacity: 0,
    x: -24,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -24,
  },
} satisfies Variants

export const SLIDE_RIGHT_VARIANTS = {
  initial: {
    opacity: 0,
    x: 24,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 24,
  },
} satisfies Variants

export const FLOATING_NUMBER_VARIANTS = {
  initial: {
    opacity: 0,
    x: 0,
    y: 0,
  },
  animate: {
    opacity: [0, 1, 1, 0],
    x: [0, 20, 60, 70],
    y: [0, -5, -5, -5],
  },
  exit: {
    opacity: 0,
  },
} satisfies Variants

export const CARD_SHELL_ANIMATIONS = {
  damage: {
    x: [0, -5, 5, -4, 4, 0],
    transition: {
      duration: 0.32,
      ease: 'easeInOut',
    },
  },
  lifeBoost: {
    scale: [1, 1.035, 1],
    filter: [
      'drop-shadow(0 0 0 rgba(250, 204, 21, 0))',
      'drop-shadow(0 0 18px rgba(250, 204, 21, 0.85))',
      'drop-shadow(0 0 0 rgba(250, 204, 21, 0))',
    ],
    transition: {
      duration: 0.48,
      ease: 'easeOut',
    },
  },
  attackUp: {
    y: [0, -14, 0],
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
  attackDown: {
    y: [0, 14, 0],
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
} satisfies Record<
  'attackDown' | 'attackUp' | 'damage' | 'lifeBoost',
  TargetAndTransition
>

export const CHARGE_BADGE_VARIANTS = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0 rgba(96, 165, 250, 0)',
  },
  animate: {
    scale: [1, 1.22, 1],
    boxShadow: [
      '0 0 0 rgba(96, 165, 250, 0)',
      '0 0 16px rgba(96, 165, 250, 0.9)',
      '0 0 0 rgba(96, 165, 250, 0)',
    ],
    transition: {
      duration: 0.42,
      ease: 'easeOut',
    },
  },
} satisfies Variants
