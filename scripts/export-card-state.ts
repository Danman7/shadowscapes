import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { CARD_BASES } from 'src/game-engine/constants/cardBases'

const COLUMNS = [
  'Name',
  'Cost',
  'Life',
  'Strength',
  'Ability',
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
  Charges: number | null
  Faction: string
  Categories: string
  Type: string
  'Is Elite?': boolean
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
    return {
      Name: card.name,
      Cost: card.attributes.cost,
      Life: card.attributes.life ?? null,
      Strength: card.attributes.strength ?? null,
      Ability: card.text.description,
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

const csvOutputPath = fileURLToPath(
  new URL('../cards-current-state.csv', import.meta.url),
)

writeFileSync(csvOutputPath, `${createCsv(cards)}\n`)

console.log(`Exported ${cards.length} cards to ${csvOutputPath}`)
