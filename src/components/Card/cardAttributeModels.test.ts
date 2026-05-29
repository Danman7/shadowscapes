import {
  getCardAttributeDetails,
  getCardFooterBadges,
} from 'src/components/Card/cardAttributeModels'
import type { CardAttributes } from 'src/game-engine'
import { messages } from 'src/i18n'

describe('getCardAttributeDetails', () => {
  test('returns semantic details for visible optional attributes', () => {
    const attributes: CardAttributes = {
      cost: 3,
      life: 2,
      strength: 1,
      nextAttackStrengthBonus: 2,
      hasHaste: true,
      cannotAttack: true,
      isHidden: true,
    }

    expect(getCardAttributeDetails(attributes)).toEqual([
      {
        key: 'cost',
        label: messages.ui.cost,
        value: '3 coins.',
      },
      {
        key: 'life',
        label: messages.ui.remainingLife,
        value: 2,
      },
      {
        key: 'strength',
        label: messages.ui.strength,
        value: `3 - ${messages.ui.strengthDescription}`,
      },
      {
        key: 'hasHaste',
        label: messages.ui.haste,
        value: messages.ui.hasteDescription,
      },
      {
        key: 'cannotAttack',
        value: messages.ui.cannotAttack,
      },
      {
        key: 'isHidden',
        label: messages.ui.hidden,
        value: messages.ui.hiddenDescription,
      },
    ])
  })
})

describe('getCardFooterBadges', () => {
  test('returns footer badges in card attribute order', () => {
    const attributes: CardAttributes = {
      cost: 4,
      strength: 2,
      charges: 1,
      hasHaste: true,
      retaliates: true,
      isHidden: true,
    }

    expect(getCardFooterBadges(attributes, 'Character')).toEqual([
      { key: 'strength', kind: 'strength', value: 2 },
      { key: 'charges', kind: 'charges', value: 1 },
      { key: 'hasHaste', kind: 'haste' },
      { key: 'retaliates', kind: 'retaliates' },
      { key: 'isHidden', kind: 'hidden' },
    ])
  })

  test('uses stunned badge instead of strength value while stunned', () => {
    expect(
      getCardFooterBadges(
        { cost: 2, strength: 1, isStunned: true },
        'Character',
      ),
    ).toEqual([{ key: 'strength', kind: 'stunned' }])
  })
})
