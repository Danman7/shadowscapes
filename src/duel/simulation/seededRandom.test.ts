import { createSeededRandom, withSeededRandom } from './seededRandom'

test('seeded random creates repeatable sequences', () => {
  const first = createSeededRandom('balance-pass')
  const second = createSeededRandom('balance-pass')
  const third = createSeededRandom('other-seed')

  expect([first(), first(), first()]).toEqual([second(), second(), second()])
  expect(first()).not.toBe(third())
})

test('withSeededRandom restores Math.random after running', () => {
  const originalRandom = Math.random
  const values = withSeededRandom('scoped', () => [Math.random(), Math.random()])

  expect(values).toEqual(
    withSeededRandom('scoped', () => [Math.random(), Math.random()]),
  )
  expect(Math.random).toBe(originalRandom)
})
