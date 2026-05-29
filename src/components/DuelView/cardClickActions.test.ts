import {
  getBoardCardClickCommand,
  getHandCardClickCommand,
} from 'src/components/DuelView/cardClickActions'
import { makeTestCard, makeTestPlayer } from 'src/game-engine/testing'

const zombie = makeTestCard('zombie', 'z1')
const haunt = makeTestCard('haunt', 'h1')
const speedPotion = makeTestCard('speedPotion', 's1')
const burrick = makeTestCard('burrick', 'b1')

describe('getHandCardClickCommand', () => {
  test('returns redraw command only while redraw player is not ready', () => {
    const command = getHandCardClickCommand({
      cardId: 'z1',
      phase: 'redraw',
      activePlayer: makeTestPlayer('player1'),
      activePlayerCoins: 30,
      activeHand: [zombie],
      pendingInstant: null,
    })

    const readyCommand = getHandCardClickCommand({
      cardId: 'z1',
      phase: 'redraw',
      activePlayer: makeTestPlayer('player1', { playerReady: true }),
      activePlayerCoins: 30,
      activeHand: [zombie],
      pendingInstant: null,
    })

    expect(command).toEqual({
      type: 'redraw-card',
      playerId: 'player1',
      cardInstanceId: 'z1',
    })
    expect(readyCommand).toBeUndefined()
  })

  test('returns speed potion target command only for active hand characters', () => {
    const command = getHandCardClickCommand({
      cardId: 'z1',
      phase: 'turn-end',
      activePlayer: makeTestPlayer('player1'),
      activePlayerCoins: 30,
      activeHand: [zombie, speedPotion],
      pendingInstant: 'SPEED_POTION',
    })

    const instantCommand = getHandCardClickCommand({
      cardId: 's1',
      phase: 'turn-end',
      activePlayer: makeTestPlayer('player1'),
      activePlayerCoins: 30,
      activeHand: [zombie, speedPotion],
      pendingInstant: 'SPEED_POTION',
    })

    expect(command).toEqual({
      type: 'apply-speed-potion',
      targetCardInstanceId: 'z1',
    })
    expect(instantCommand).toBeUndefined()
  })

  test('returns play card command only for affordable active hand cards', () => {
    const command = getHandCardClickCommand({
      cardId: 'z1',
      phase: 'player-turn',
      activePlayer: makeTestPlayer('player1'),
      activePlayerCoins: 30,
      activeHand: [zombie],
      pendingInstant: null,
    })

    const expensiveCommand = getHandCardClickCommand({
      cardId: 'z1',
      phase: 'player-turn',
      activePlayer: makeTestPlayer('player1'),
      activePlayerCoins: 0,
      activeHand: [zombie],
      pendingInstant: null,
    })

    expect(command).toEqual({
      type: 'play-card',
      playerId: 'player1',
      cardInstanceId: 'z1',
    })
    expect(expensiveCommand).toBeUndefined()
  })
})

describe('getBoardCardClickCommand', () => {
  test('flash bomb target selection takes priority over phase behavior', () => {
    const command = getBoardCardClickCommand({
      cardId: 'h1',
      isActiveBoard: false,
      phase: 'player-turn',
      activeBoard: [zombie],
      inactiveBoard: [haunt],
      pendingCharacterAbility: null,
      pendingInstant: 'FLASH_BOMB',
      selectedAttackerId: null,
    })

    expect(command).toEqual({
      type: 'apply-flash-bomb',
      targetCardInstanceId: 'h1',
    })
  })

  test('targets pending character abilities with an animation request', () => {
    const command = getBoardCardClickCommand({
      cardId: 'h1',
      isActiveBoard: false,
      phase: 'player-turn',
      activeBoard: [burrick],
      inactiveBoard: [haunt],
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
      pendingInstant: null,
      selectedAttackerId: null,
    })

    expect(command).toEqual({
      type: 'activate-character-ability',
      cardInstanceId: 'h1',
      animationRequest: { attackerId: 'b1' },
    })
  })

  test('selects attackers or attacks directly during turn end', () => {
    const selectCommand = getBoardCardClickCommand({
      cardId: 'z1',
      isActiveBoard: true,
      phase: 'turn-end',
      activeBoard: [zombie],
      inactiveBoard: [haunt],
      pendingCharacterAbility: null,
      pendingInstant: null,
      selectedAttackerId: null,
    })

    const attackPlayerCommand = getBoardCardClickCommand({
      cardId: 'z1',
      isActiveBoard: true,
      phase: 'turn-end',
      activeBoard: [zombie],
      inactiveBoard: [],
      pendingCharacterAbility: null,
      pendingInstant: null,
      selectedAttackerId: null,
    })

    expect(selectCommand).toEqual({
      type: 'select-attacker',
      attackerId: 'z1',
    })
    expect(attackPlayerCommand).toEqual({
      type: 'attack-player',
      attackerId: 'z1',
      animationRequest: { attackerId: 'z1' },
    })
  })

  test('attacks selected defenders and rejects invalid selections', () => {
    const command = getBoardCardClickCommand({
      cardId: 'h1',
      isActiveBoard: false,
      phase: 'turn-end',
      activeBoard: [zombie],
      inactiveBoard: [haunt],
      pendingCharacterAbility: null,
      pendingInstant: null,
      selectedAttackerId: 'z1',
    })

    const invalidCommand = getBoardCardClickCommand({
      cardId: 'missing',
      isActiveBoard: false,
      phase: 'turn-end',
      activeBoard: [zombie],
      inactiveBoard: [haunt],
      pendingCharacterAbility: null,
      pendingInstant: null,
      selectedAttackerId: 'z1',
    })

    expect(command).toEqual({
      type: 'attack-card',
      attackerId: 'z1',
      defenderId: 'h1',
      animationRequest: { attackerId: 'z1' },
    })
    expect(invalidCommand).toBeUndefined()
  })
})
