import { writeFile } from 'node:fs/promises'
import process from 'node:process'

import { cardBaseIds, cardBases } from '../src/cards/bases'
import type { CardBaseId, KnownCardBase } from '../src/cards/bases'
import { cardsText } from '../src/l10n'

type CsvValue = string | number

type CardExportRow = {
  baseId: CardBaseId
  name: string
  type: KnownCardBase['type']
  faction: KnownCardBase['faction']
  rank: KnownCardBase['rank']
  cost: number
  life: CsvValue
  strength: CsvValue
  charges: CsvValue
  target: string
  categories: string
  description: string
  flavor: string
}

const columns = [
  'baseId',
  'name',
  'type',
  'faction',
  'rank',
  'cost',
  'life',
  'strength',
  'charges',
  'target',
  'categories',
  'description',
  'flavor',
] as const satisfies readonly (keyof CardExportRow)[]

const empty = ''

const getLife = (card: KnownCardBase) =>
  card.type === 'character' ? card.life : empty

const getStrength = (card: KnownCardBase) =>
  card.type === 'character' ? (card.strength ?? 1) : empty

const getCharges = (card: KnownCardBase) =>
  card.type === 'character' ? (card.charges ?? empty) : empty

const getTarget = (card: KnownCardBase) =>
  card.type === 'instance' ? (card.target ?? empty) : empty

const rows = cardBaseIds.map((baseId) => {
  const card = cardBases[baseId]
  const text = cardsText.cards[baseId]

  return {
    baseId,
    name: text.name,
    type: card.type,
    faction: card.faction,
    rank: card.rank,
    cost: card.cost,
    life: getLife(card),
    strength: getStrength(card),
    charges: getCharges(card),
    target: getTarget(card),
    categories: card.categories.join('; '),
    description: text.description,
    flavor: text.flavor,
  } satisfies CardExportRow
})

const escapeCsvCell = (value: CsvValue) => {
  const text = String(value)

  if (!/[",\r\n]/.test(text)) return text

  return `"${text.replaceAll('"', '""')}"`
}

const toCsv = (cardRows: readonly CardExportRow[]) =>
  [
    columns.join(','),
    ...cardRows.map((row) =>
      columns.map((column) => escapeCsvCell(row[column])).join(','),
    ),
  ].join('\n')

const defaultOutputPath = 'cards.csv'
const outputPath = process.argv[2] ?? defaultOutputPath
const csv = `${toCsv(rows)}\n`

if (outputPath === '-') {
  console.log(csv.trimEnd())
} else {
  await writeFile(outputPath, csv, 'utf8')
  console.log(`Exported ${rows.length} cards to ${outputPath}`)
}
