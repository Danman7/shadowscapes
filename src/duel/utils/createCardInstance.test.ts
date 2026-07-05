import { createCardInstance } from './createCardInstance'

test('creates a card instance with a unique id', () => {
  const randomUuid = vi
    .spyOn(crypto, 'randomUUID')
    .mockReturnValue('2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec')

  expect(createCardInstance('novice', 'user1', 'deck')).toEqual({
    id: '2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec',
    baseId: 'novice',
    ownerId: 'user1',
    stack: 'deck',
    type: 'character',
    cost: 1,
    life: 1,
    strength: 1,
    turnsStunned: 0,
    didAct: false,
  })

  expect(randomUuid).toHaveBeenCalledOnce()
  randomUuid.mockRestore()
})

test('creates a non-character instance with its mutable cost', () => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    '2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec',
  )

  expect(createCardInstance('bookOfAsh', 'user1', 'hand')).toEqual({
    id: '2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec',
    baseId: 'bookOfAsh',
    ownerId: 'user1',
    stack: 'hand',
    type: 'instance',
    cost: 3,
  })

  vi.restoreAllMocks()
})
