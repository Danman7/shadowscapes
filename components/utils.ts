import { CardRanks, Factions } from '@/data'
import { CardRank, Faction } from '@/types'

export const getFactionBgClassName = (faction: Faction): string => {
  switch (faction) {
    case Factions.Order:
      return 'bg-order'
    case Factions.Chaos:
      return 'bg-chaos'
    case Factions.Shadow:
      return 'bg-shadow'
    default:
      return 'bg-surface'
  }
}

export const getFactionTextClassName = (faction: Faction): string => {
  switch (faction) {
    case Factions.Order:
    case Factions.Chaos:
    case Factions.Shadow:
      return 'text-surface'
    default:
      return 'text-foreground'
  }
}

export const getRankBorderClassName = (rank: CardRank): string => {
  switch (rank) {
    case CardRanks.Elite:
      return 'border-elite'
    default:
      return 'border-foreground'
  }
}

export const joinStringsWithComma = (strings: string[]): string =>
  strings.join(', ')

export const getColoredBoxClassNames = (rank: CardRank, faction: Faction) =>
  `rounded-md border-2 border-b-4 flex items-center justify-center ${getRankBorderClassName(rank)} ${getFactionTextClassName(faction)} ${getFactionBgClassName(faction)}`
