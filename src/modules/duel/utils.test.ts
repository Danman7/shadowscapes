import { allCardBases } from 'src/modules/cards/bases'
import { AllCardNames } from 'src/modules/cards/types'
import { STARTING_COINS } from 'src/modules/duel/constants'
import { DuelStartingUsers } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  createDuelCardFromBase,
  flipCoinForFirstPlayer,
  getBaseFromDuelCard,
} from 'src/modules/duel/utils'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

describe('Duel Utils', () => {
  describe('createDuelCardFromBase', () => {
    it('should create a duel card from a base card', () => {
      const mockBaseName: AllCardNames = 'templeGuard'

      const [id, card] = createDuelCardFromBase(mockBaseName)

      expect(id).toBeDefined()
      expect(card).toEqual(expect.objectContaining(allCardBases[mockBaseName]))
      expect(card.baseName).toBe(mockBaseName)
    })
  })

  describe('convertUsersToDuelPlayersAndCards', () => {
    it('should convert users to normalized duel players and cards', () => {
      const [cards, players] = convertUsersToDuelPlayersAndCards(users)

      users.forEach(({ id, name, draftDeck }) => {
        expect(players[id]).toEqual(
          expect.objectContaining({
            id,
            name,
            income: 0,
            coins: STARTING_COINS,
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

      const [, card] = createDuelCardFromBase(mockBaseName)

      const baseCard = getBaseFromDuelCard(card)

      expect(baseCard).toEqual(
        expect.objectContaining(allCardBases[mockBaseName]),
      )
    })
  })
})
