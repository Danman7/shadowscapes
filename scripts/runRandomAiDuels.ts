import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {
  DEFAULT_RANDOM_AI_DUEL_RUNS,
  formatRandomAiDuelBatchMarkdown,
  simulateRandomAiDuelBatch,
} from '../src/duel/simulation'
import type { SimulationPlayerLabels } from '../src/duel/simulation'
import type { UserDeck } from '../src/user'

const defaultPlayerLabels = {
  player1: 'Order Hammerites',
  player2: 'Chaos Undead + Burricks',
} satisfies SimulationPlayerLabels

const defaultDecks = [
  [
    'novice',
    'novice',
    'novice',
    'templeGuard',
    'templeGuard',
    'templeGuard',
    'acolyte',
    'acolyte',
    'acolyte',
    'yoraSkull',
  ],
  [
    'zombie',
    'zombie',
    'zombie',
    'burrick',
    'burrick',
    'haunt',
    'haunt',
    'haunt',
    'bookOfAsh',
    'bookOfAsh',
  ],
] satisfies [UserDeck, UserDeck]

const getArgValue = (name: string): string | undefined => {
  const prefix = `--${name}=`
  const matchingArg = process.argv.find((arg) => arg.startsWith(prefix))

  if (matchingArg) return matchingArg.slice(prefix.length)

  const argIndex = process.argv.indexOf(`--${name}`)

  return argIndex >= 0 ? process.argv[argIndex + 1] : undefined
}

const getNumberArg = (name: string, fallback: number): number => {
  const value = Number(getArgValue(name))

  return Number.isFinite(value) && value >= 0 ? value : fallback
}

const sanitizeFilePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, '-')

const runs = getNumberArg('runs', DEFAULT_RANDOM_AI_DUEL_RUNS)
const maxSteps = getNumberArg('max-steps', 1000)
const seed = getArgValue('seed') ?? 'random-ai-duels'
const outputDir = getArgValue('out-dir') ?? 'simulation-results'
const result = simulateRandomAiDuelBatch({
  decks: defaultDecks,
  playerLabels: defaultPlayerLabels,
  runs,
  seed,
  maxSteps,
})
const outputBasePath = path.join(
  outputDir,
  `random-ai-duels.${sanitizeFilePart(seed)}`,
)
const jsonOutputPath = `${outputBasePath}.json`
const markdownOutputPath = `${outputBasePath}.md`

await mkdir(outputDir, { recursive: true })
await writeFile(jsonOutputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
await writeFile(
  markdownOutputPath,
  formatRandomAiDuelBatchMarkdown(result),
  'utf8',
)

console.log(`Wrote ${runs} simulated duels to:`)
console.log(`- ${jsonOutputPath}`)
console.log(`- ${markdownOutputPath}`)
