export type CardCategory =
  | 'Hammerite'
  | 'Undead'
  | 'Fence'
  | 'Pagan'
  | 'Thief'
  | 'Guard'
  | 'Necromancer'
  | 'Artifact'

export type CardFaction = 'Order' | 'Chaos' | 'Shadow'

export interface CardBaseCommon {
  readonly name: string
  cost: number
  faction: CardFaction
  categories: CardCategory[]
  onPlayDescription?: string
  description?: string[]
  flavor?: string
  isElite?: boolean // If true, only one copy allowed in deck
}

export type InstantCardBase = CardBaseCommon & { type: 'Instant' }
export type CharacterCardBase = CardBaseCommon & {
  type: 'Character'
  strength: number
}

export type CardBase = InstantCardBase | CharacterCardBase

export type OrderCardName = 'templeGuard' | 'brotherSachelman' | 'yoraSkull'

export type ChaosCardName = 'zombie'

type OrderCardBase = CardBase & { faction: 'Order' }
type ChaosCardBase = CardBase & { faction: 'Chaos' }

export type OrderBaseMap = Record<OrderCardName, OrderCardBase>
export type ChaosBaseMap = Record<ChaosCardName, ChaosCardBase>
export type CardBaseMap = Record<string, CardBase>
