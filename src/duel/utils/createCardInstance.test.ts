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
  })

  expect(randomUuid).toHaveBeenCalledOnce()
  randomUuid.mockRestore()
})
