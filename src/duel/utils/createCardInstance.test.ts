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
    traits: {},
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

test('clones base traits for each character instance', () => {
  vi.spyOn(crypto, 'randomUUID')
    .mockReturnValueOnce('2cbe7ba0-77b3-47ba-bf57-6930bd2cbeec')
    .mockReturnValueOnce('3cbe7ba0-77b3-47ba-bf57-6930bd2cbeec')

  const first = createCardInstance('burrick', 'user1', 'hand')
  const second = createCardInstance('burrick', 'user1', 'hand')

  if (first.type !== 'character' || second.type !== 'character') {
    throw new Error('Expected characters')
  }

  first.traits.charges = 0

  expect(second.traits).toEqual({ charges: 1 })

  vi.restoreAllMocks()
})
