import {
  createCharacter,
  createInstant,
  TempleGuardDefinition,
  YoraSkullDefinition,
} from '@/data'
import { messages } from '@/i18n'
import {
  CardDefinition,
  CardDefinitionId,
  CharacterDefinition,
  DefinitionArgs,
  isCharacter,
} from '@/types'

const checkCardDefinition = (
  definition: DefinitionArgs<CardDefinition>,
  result: CardDefinition,
  cardDefinitionId: CardDefinitionId,
) => {
  if (isCharacter(result)) {
    expect(result.kind).toBe('Character')

    expect(result.strength).toBe((definition as CharacterDefinition).strength)
  } else {
    expect(result.kind).toBe('Instant')
  }

  expect(result.id).toBe(cardDefinitionId)
  expect(result.cost).toBe(definition.cost)
  expect(result.constants).toEqual(
    expect.objectContaining({
      rank: definition.constants.rank,
      name: messages.definitions[cardDefinitionId].name,
      flavor: messages.definitions[cardDefinitionId].flavor,
      description: messages.definitions[cardDefinitionId].description,
    }),
  )
}

describe('character', () => {
  it('should create a character definition with correct kind and merged constants', () => {
    const characterDefinition = TempleGuardDefinition
    const cardDefinitionId = characterDefinition.id

    const result = createCharacter(characterDefinition)

    checkCardDefinition(characterDefinition, result, cardDefinitionId)
  })
})

describe('instant', () => {
  it('should create an instant definition with correct kind and merged constants', () => {
    const characterDefinition = YoraSkullDefinition
    const cardDefinitionId = characterDefinition.id

    const result = createInstant(characterDefinition)

    checkCardDefinition(characterDefinition, result, cardDefinitionId)
  })
})
