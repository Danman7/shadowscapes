import { allCardBases } from 'src/modules/cards/bases'
import { AllCardNames } from 'src/modules/cards/types'
import { STARTING_COINS } from 'src/modules/duel/constants'
import { DuelStartingUsers } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  createDuelCardFromBase,
} from 'src/modules/duel/utils'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

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
    const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

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
})
