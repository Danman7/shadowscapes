import { DuelBuilder } from '@/state/duelBuilder'
import { CardZones } from '@/state/duelConstants'
import { getZoneKey } from '@/state/utils'
import { UpdatePlayerProps } from '@/types'

it('updates player props', () => {
  const updatedPlayerProps: UpdatePlayerProps = {
    name: 'Garrett',
    coins: 5,
    userId: 'user-123',
    hasPerformedAction: true,
  }

  const { players } = new DuelBuilder()
    .updatePlayer('Player1', updatedPlayerProps)
    .build()

  expect(players.Player1.id).toBe('Player1')
  expect(players.Player1.name).toBe(updatedPlayerProps.name)
  expect(players.Player1.coins).toBe(updatedPlayerProps.coins)
  expect(players.Player1.userId).toBe(updatedPlayerProps.userId)
  expect(players.Player1.hasPerformedAction).toBe(
    updatedPlayerProps.hasPerformedAction,
  )
})

it('create new card instances with defined ids', () => {
  const card1Id = 'c1'
  const card2Id = 'c2'

  const { cards, zones, cardZone, activePlayerId } = new DuelBuilder()
    .putCardsInZone('Player1', CardZones.Deck, [
      { definitionId: 'TempleGuard', id: card1Id },
    ])
    .putCardsInZone('Player2', CardZones.Hand, [
      { definitionId: 'YoraSkull', id: card2Id },
    ])
    .build()

  expect(cards[card1Id]).toEqual({
    id: card1Id,
    definitionId: 'TempleGuard',
    ownerId: 'Player1',
  })

  expect(cards[card2Id]).toEqual({
    id: card2Id,
    definitionId: 'YoraSkull',
    ownerId: 'Player2',
  })

  expect(zones[getZoneKey('Player1', CardZones.Deck)]).toEqual([card1Id])
  expect(zones[getZoneKey('Player2', CardZones.Hand)]).toEqual([card2Id])

  expect(cardZone[card1Id]).toBe(getZoneKey('Player1', CardZones.Deck))
  expect(cardZone[card2Id]).toBe(getZoneKey('Player2', CardZones.Hand))

  expect(activePlayerId).toBe('Player1')
})

it('create new card instances with random ids', () => {
  const { cards, zones, cardZone } = new DuelBuilder()
    .putCardsInZone('Player1', CardZones.Field, [
      { definitionId: 'TempleGuard' },
    ])
    .putCardsInZone('Player2', CardZones.Discard, [
      { definitionId: 'YoraSkull' },
    ])
    .build()

  const randomCard1Id = Object.keys(cards)[0]
  const randormCard2Id = Object.keys(cards)[1]

  expect(cards[randomCard1Id]).toEqual({
    id: randomCard1Id,
    definitionId: 'TempleGuard',
    ownerId: 'Player1',
  })

  expect(cards[randormCard2Id]).toEqual({
    id: randormCard2Id,
    definitionId: 'YoraSkull',
    ownerId: 'Player2',
  })

  expect(zones[getZoneKey('Player1', CardZones.Field)]).toEqual([randomCard1Id])
  expect(zones[getZoneKey('Player2', CardZones.Discard)]).toEqual([
    randormCard2Id,
  ])

  expect(cardZone[randomCard1Id]).toBe(getZoneKey('Player1', CardZones.Field))
  expect(cardZone[randormCard2Id]).toBe(
    getZoneKey('Player2', CardZones.Discard),
  )
})

it('set second player as active', () => {
  const { activePlayerId } = new DuelBuilder().active('Player2').build()

  expect(activePlayerId).toBe('Player2')
})
