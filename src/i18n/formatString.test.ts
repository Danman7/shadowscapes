import { formatString } from 'src/i18n/formatString'

describe('formatString', () => {
  test('replaces simple placeholders', () => {
    expect(formatString('{name} goes first.', { name: 'Alice' })).toBe(
      'Alice goes first.',
    )
  })

  test('replaces multiple placeholders', () => {
    expect(
      formatString('{attacker} attacks {defender}.', {
        attacker: 'Zombie',
        defender: 'Haunt',
      }),
    ).toBe('Zombie attacks Haunt.')
  })

  test('replaces the same placeholder multiple times', () => {
    expect(
      formatString('{name} attacks. {name} wins.', { name: 'Alice' }),
    ).toBe('Alice attacks. Alice wins.')
  })

  test('handles number values', () => {
    expect(formatString('{count} cards', { count: 3 })).toBe('3 cards')
  })

  test('handles singular plural form when count is 1', () => {
    expect(formatString('{count} {count|coin|coins}', { count: 1 })).toBe(
      '1 coin',
    )
  })

  test('handles singular plural form when count is not 1', () => {
    expect(formatString('{count} {count|coin|coins}', { count: 5 })).toBe(
      '5 coins',
    )
  })

  test('handles zero as plural', () => {
    expect(formatString('{count} {count|coin|coins}', { count: 0 })).toBe(
      '0 coins',
    )
  })

  test('handles mixed interpolation and pluralization', () => {
    expect(
      formatString(
        '{name} plays {card} for {cost} {cost|coin|coins}. They have {remaining} {remaining|coin|coins} left.',
        { name: 'Alice', card: 'Zombie', cost: 1, remaining: 5 },
      ),
    ).toBe('Alice plays Zombie for 1 coin. They have 5 coins left.')
  })

  test('leaves unmatched placeholders unchanged', () => {
    expect(formatString('{name} has {unknown} items.', { name: 'Bob' })).toBe(
      'Bob has {unknown} items.',
    )
  })
})
