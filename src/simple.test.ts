import { expect, test } from 'bun:test'

test('basic arithmetic', () => {
  expect(1 + 1).toBe(2)
})

test('string comparison', () => {
  expect('hello').toBe('hello')
})
