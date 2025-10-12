import { messages, formatString, getCardText } from '@/i18n'
import { CardDefinitionId } from '@/types'

import { CardDefinitionIds } from '../data'

describe('formatString', () => {
  const template = 'Hello, {name}!'

  it('should replace placeholders with values', () => {
    const values = { name: 'Alice' }
    expect(formatString(template, values)).toBe('Hello, Alice!')
  })

  it('should not replace placeholders when value is missing', () => {
    const values = {}
    expect(formatString(template, values)).toBe('Hello, {name}!')
  })
})

describe('getCardText', () => {
  it('should return card text object with name, flavor, and description', () => {
    const cardDefinitionId: CardDefinitionId = CardDefinitionIds.TempleGuard

    const result = getCardText(cardDefinitionId)

    expect(result).toEqual({
      name: messages.definitions[cardDefinitionId].name,
      flavor: messages.definitions[cardDefinitionId].flavor,
      description: messages.definitions[cardDefinitionId].description,
    })
  })
})
