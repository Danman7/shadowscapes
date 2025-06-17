export type CardCategory =
  | 'Hammerite'
  | 'Undead'
  | 'Fence'
  | 'Pagan'
  | 'Thief'
  | 'Guard'
  | 'Necromancer'
  | 'Artifact'
  | 'Servant'
  | 'Specter'

export type CardFaction = 'Order' | 'Chaos' | 'Shadow'

export interface CardBaseCommon {
  readonly name: string
  cost: number
  categories: CardCategory[]
  faction?: CardFaction
  onPlayDescription?: string
  onDiscardDescription?: string
  description?: string
  flavor?: string
  isElite?: boolean // If true, only one copy allowed in deck
  counter?: number
}

export type InstantCardBase = CardBaseCommon & { type: 'Instant' }

export type CharacterTrait = 'retaliates' | 'hidden'

export type CharacterCardBase = CardBaseCommon & {
  type: 'Character'
  strength: number
  traits?: CharacterTrait[]
}

export type CardBase = InstantCardBase | CharacterCardBase

export interface TraitInfo {
  icon: React.ComponentType
  title: string
  description: string
}

export type OrderCardName =
  | 'templeGuard'
  | 'houseGuard'
  | 'hammeriteNovice'
  | 'elevatedAcolyte'
  | 'hammeritePriest'
  | 'brotherSachelman'
  | 'highPriestMarkander'
  | 'yoraSkull'

export type ChaosCardName =
  | 'zombie'
  | 'haunt'
  | 'apparition'
  | 'azaranTheCruel'
  | 'bookOfAsh'

export type ShadowCardName = 'downwinderThief' | 'garrettMasterThief'

export type NeutralCardName = 'cook'

type OrderCardBase = CardBase & { faction: 'Order' }
type ChaosCardBase = CardBase & { faction: 'Chaos' }
type ShadowCardBase = CardBase & { faction: 'Shadow' }
type NeutralCardBase = CardBase

export type OrderBaseMap = Record<OrderCardName, OrderCardBase>
export type ChaosBaseMap = Record<ChaosCardName, ChaosCardBase>
export type ShadowBaseMap = Record<ShadowCardName, ShadowCardBase>
export type NeutralBaseMap = Record<NeutralCardName, NeutralCardBase>

export type AllCardNames =
  | OrderCardName
  | ChaosCardName
  | ShadowCardName
  | NeutralCardName
export type CardBaseMap = Record<AllCardNames, CardBase>
