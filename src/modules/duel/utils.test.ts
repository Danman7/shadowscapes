import { allCardBases } from 'src/modules/cards/bases'
import { AllCardNames } from 'src/modules/cards/types'
import { STARTING_DUEL_PLAYER_PROPS } from 'src/modules/duel/constants'
import {
  mockOpponentStackSetup,
  mockUserStackSetup,
} from 'src/modules/duel/mocks'
import { DuelStartingUsers, PlayerStackSetup } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  createDuelCardFromBase,
  findPlayerAndStackFromId,
  flipCoinForFirstPlayer,
  getBaseFromDuelCard,
  setupPlayersAndCardsForTest,
} from 'src/modules/duel/utils'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

describe('Duel Utils', () => {
  describe('createDuelCardFromBase', () => {
    it('should create a duel card from a base card', () => {
      const mockBaseName: AllCardNames = 'templeGuard'

      const { id, card } = createDuelCardFromBase(mockBaseName)

      expect(id).toBeDefined()
      expect(card).toEqual(expect.objectContaining(allCardBases[mockBaseName]))
      expect(card.baseName).toBe(mockBaseName)
    })
  })

  describe('convertUsersToDuelPlayersAndCards', () => {
    it('should convert users to normalized duel players and cards', () => {
      const { cards, players } = convertUsersToDuelPlayersAndCards(users)

      users.forEach(({ id, name, draftDeck }) => {
        expect(players[id]).toEqual(
          expect.objectContaining({
            id,
            name,
            ...STARTING_DUEL_PLAYER_PROPS,
          }),
        )

        const allDuelCards = Object.values(cards)

        draftDeck.forEach((baseName) => {
          expect(
            allDuelCards.some((card) =>
              expect.objectContaining({
                ...allCardBases[baseName],
                id: card.id,
                baseName,
              }),
            ),
          ).toBe(true)
        })
      })
    })
  })

  describe('flipCoinForFirstPlayer', () => {
    it('should return the first user as the active player', () => {
      const [activePlayerId, inactivePlayerId] = flipCoinForFirstPlayer(users)

      expect(users).toContainEqual(
        expect.objectContaining({ id: activePlayerId }),
      )
      expect(users).toContainEqual(
        expect.objectContaining({ id: inactivePlayerId }),
      )
    })
  })

  describe('getBaseFromDuelCard', () => {
    it('should return the base card from a duel card', () => {
      const mockBaseName: AllCardNames = 'templeGuard'

      const { card } = createDuelCardFromBase(mockBaseName)

      const baseCard = getBaseFromDuelCard(card)

      expect(baseCard).toEqual(
        expect.objectContaining(allCardBases[mockBaseName]),
      )
    })
  })

  describe('setupPlayersAndCardsForTest', () => {
    it('should return normalized players and cards for tests based on stack requirements', () => {
      const userSetups: PlayerStackSetup[] = [
        mockUserStackSetup,
        mockOpponentStackSetup,
      ]

      const { cards, players } = setupPlayersAndCardsForTest(userSetups)

      expect(Object.values(cards)).toHaveLength(
        (mockUserStackSetup.deck?.length ?? 0) +
          (mockOpponentStackSetup.deck?.length ?? 0) +
          (mockUserStackSetup.hand?.length ?? 0) +
          (mockOpponentStackSetup.hand?.length ?? 0) +
          (mockUserStackSetup.board?.length ?? 0) +
          (mockOpponentStackSetup.board?.length ?? 0) +
          (mockUserStackSetup.discard?.length ?? 0) +
          (mockOpponentStackSetup.discard?.length ?? 0),
      )

      userSetups.forEach(({ id, name }) => {
        expect(players[id]).toEqual(
          expect.objectContaining({
            id,
            name,
            ...STARTING_DUEL_PLAYER_PROPS,
          }),
        )
      })
    })
  })

  describe('findPlayerAndStackFromId', () => {
    const mockSetup: PlayerStackSetup[] = [
      {
        name: 'Player 1',
        id: 'player1',
        deck: ['yoraSkull'],
      },
    ]

    it('should return player and deck as the card stack', () => {
      const { cards, players } = setupPlayersAndCardsForTest(mockSetup)

      const { stack, player } = findPlayerAndStackFromId(
        Object.keys(cards)[0],
        players,
      )

      expect(stack).toBe('deck')
      expect(player).toEqual(expect.objectContaining(Object.values(players)[0]))
    })

    it('should throw an error if the card ID does not exist', () => {
      const { players } = setupPlayersAndCardsForTest(mockSetup)

      expect(() =>
        findPlayerAndStackFromId('nonExistentCardId', players),
      ).toThrow()
    })
  })
})
