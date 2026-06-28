import { cardBases } from '../bases'
import type { CardBase, CharacterCardBase, InstanceCardBase } from '../types'
import { isCharacter } from './isCharacter'

test('identifies character cards', () => {
  const character: CardBase = cardBases.templeGuard
  const instance: CardBase = cardBases.bookOfAsh

  expect(isCharacter(character)).toBe(true)
  expect(isCharacter(instance)).toBe(false)
})

test('narrows card bases to character cards', () => {
  const card: CardBase =
    Math.random() > 0.5 ? cardBases.templeGuard : cardBases.bookOfAsh

  if (isCharacter(card)) {
    expectTypeOf(card).toEqualTypeOf<CharacterCardBase>()
    expect(card.life).toBeGreaterThan(0)
  } else {
    expectTypeOf(card).toEqualTypeOf<InstanceCardBase>()
  }
})
