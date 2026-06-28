import { generateUuid, joinWithSpace } from '.'

test('generates a uuid', () => {
  const randomUuid = vi
    .spyOn(crypto, 'randomUUID')
    .mockReturnValue('2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec')

  expect(generateUuid()).toBe('2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec')

  randomUuid.mockRestore()
})

test('joins strings with a single space', () => {
  expect(joinWithSpace(['duel', '', 'table', 'active'])).toBe(
    'duel table active',
  )
})
