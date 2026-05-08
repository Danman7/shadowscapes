import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { CARD_BASES } from 'src/game-engine/constants/cardBases'

const COLUMNS = [
  'Name',
  'Cost',
  'Life',
  'Strength',
  'Ability',
  'Idea',
  'Approx. Value',
  'Charges',
  'Faction',
  'Categories',
  'Type',
  'Is Elite?',
] as const

type ColumnName = (typeof COLUMNS)[number]

type ExportCard = {
  Name: string
  Cost: number
  Life: number | null
  Strength: number | null
  Ability: string
  Idea: string | null
  'Approx. Value': string | null
  Charges: number | null
  Faction: string
  Categories: string
  Type: string
  'Is Elite?': boolean
}

const CARD_NOTES: Record<string, Pick<ExportCard, 'Idea' | 'Approx. Value'>> = {
  Zombie: {
    Idea: 'Keep returning to play, winning trough steady numbers and potential boosts.',
    'Approx. Value':
      '1 for 1 coin, 3 for 2 coins if the second one resurrects the first.',
  },
  Burrick: {
    Idea: 'Ranged anti-swarm.',
    'Approx. Value':
      '2 for 2, potentially 5 for 2 if they get to trigger ability on 3 cards.',
  },
  Haunt: {
    Idea: 'Low-level durable fighter.',
    'Approx. Value':
      '3 life for 3 coins, deals 2 damage, so potential 4 damage if they attack once and ability activates. 6 if they attack twice.',
  },
  "Mystic's Soul": {
    Idea: 'Reset charges based play.',
    'Approx. Value': '+2 charges potential if 2 such cards on board.',
  },
  'Book of Ash': {
    Idea: 'Play into undead theme. Boos zombies, get extra Haung',
    'Approx. Value':
      'For 4 coins you can get to summon 3 Zombies potential, or an extra Haunt',
  },
  Novice: {
    Idea: 'Swarm if supported.',
    'Approx. Value': '1 for 1, 2 for 1 if ability activates.',
  },
  'Temple Guard': {
    Idea: 'Low-level durable fighter with defensive buff.',
    'Approx. Value': '3 for 3, 4 for 3 if less cards on board.',
  },
  Sachelman: {
    Idea: 'Prolong multiple Hammerites’ stay on board.',
    'Approx. Value':
      '3 for 5 if alone, but potentially 6 for 5 if 3 other Hammerites on board.',
  },
  "Saint Yora's Skull": {
    Idea: 'Mass boost, depending on which cards are on board and in hand.',
    'Approx. Value': 'Potential 5-7 for 5 coins, depending on what you have.',
  },
  Markander: {
    Idea: 'Passive thinning.',
    'Approx. Value': '3 for 0 if ability activates',
  },
  Downwinder: {
    Idea: null,
    'Approx. Value': null,
  },
  Cook: {
    Idea: 'Thinning.',
    'Approx. Value': '1 for 1, but you get to thin.',
  },
  'Speed Potion': {
    Idea: 'Preparation when ahead.',
    'Approx. Value': 'Utility.',
  },
  'Flash Bomb': {
    Idea: 'Control.',
    'Approx. Value': 'Utility.',
  },
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function escapeCsvCell(value: string | number | boolean | null) {
  if (value === null) return ''

  const normalizedValue =
    typeof value === 'boolean' ? (value ? 'Yes' : '') : String(value)

  if (!/[",\n]/.test(normalizedValue)) return normalizedValue

  return `"${normalizedValue.replaceAll('"', '""')}"`
}

function createExportCards(): ExportCard[] {
  return Object.values(CARD_BASES).map((card) => {
    const notes = CARD_NOTES[card.name] ?? { Idea: null, 'Approx. Value': null }

    return {
      Name: card.name,
      Cost: card.attributes.cost,
      Life: card.attributes.life ?? null,
      Strength: card.attributes.strength ?? null,
      Ability: card.text.description,
      Idea: notes.Idea,
      'Approx. Value': notes['Approx. Value'],
      Charges: card.attributes.charges ?? null,
      Faction: toTitleCase(card.faction),
      Categories: card.categories.join(', '),
      Type: card.type,
      'Is Elite?': card.isElite ?? false,
    }
  })
}

function createCsv(cards: ExportCard[]) {
  const header = COLUMNS.join(',')
  const rows = cards.map((card) =>
    COLUMNS.map((column) => escapeCsvCell(card[column as ColumnName])).join(
      ',',
    ),
  )

  return [header, ...rows].join('\n')
}

const cards = createExportCards()

const jsonOutputPath = fileURLToPath(
  new URL('../cards-current-state.json', import.meta.url),
)
const csvOutputPath = fileURLToPath(
  new URL('../cards-current-state.csv', import.meta.url),
)

writeFileSync(
  jsonOutputPath,
  `${JSON.stringify({ columns: [...COLUMNS], cards }, null, 2)}\n`,
)
writeFileSync(csvOutputPath, `${createCsv(cards)}\n`)

console.log(`Exported ${cards.length} cards to ${jsonOutputPath}`)
console.log(`Exported ${cards.length} cards to ${csvOutputPath}`)
