import { getCardFeedbackEvents } from 'src/components/animation'

describe('getCardFeedbackEvents', () => {
  test('returns damage feedback when life decreases', () => {
    expect(
      getCardFeedbackEvents(
        { cardId: 'card-1', life: 3 },
        { cardId: 'card-1', life: 2 },
      ),
    ).toEqual({ chargesChanged: false, shellFeedback: 'damage' })
  })

  test('returns life boost feedback when life increases', () => {
    expect(
      getCardFeedbackEvents(
        { cardId: 'card-1', life: 2 },
        { cardId: 'card-1', life: 3 },
      ),
    ).toEqual({ chargesChanged: false, shellFeedback: 'life-boost' })
  })

  test('returns charge feedback when charges change', () => {
    expect(
      getCardFeedbackEvents(
        { cardId: 'card-1', charges: 1, life: 2 },
        { cardId: 'card-1', charges: 0, life: 2 },
      ),
    ).toEqual({ chargesChanged: true })
  })

  test('does not animate when the card identity changes', () => {
    expect(
      getCardFeedbackEvents(
        { cardId: 'card-1', charges: 1, life: 2 },
        { cardId: 'card-2', charges: 0, life: 1 },
      ),
    ).toEqual({ chargesChanged: false })
  })
})
