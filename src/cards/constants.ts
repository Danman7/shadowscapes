import { Faction } from './types'

export const factionTextColorClassNames = {
  order: 'text-order',
  chaos: 'text-chaos',
  shadow: 'text-shaodw',
  neutral: 'text-foreground',
} satisfies Record<Faction, string>

export const factionBorderColorClassNames = {
  order: 'border-order/10',
  chaos: 'border-chaos/10',
  shadow: 'border-shaodw/10',
  neutral: 'border-foreground/10',
} satisfies Record<Faction, string>
