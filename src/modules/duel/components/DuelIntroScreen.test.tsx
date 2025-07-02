import { formatString, messages } from 'src/i18n/indext'
import { DuelIntroScreen } from 'src/modules/duel/components/DuelIntroScreen'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'
import { render } from 'src/test-utils'

describe('Duel Intro Screen', () => {
  const { players, activePlayerId } = mockInitializeDuelMockState

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show both player names and who starts message', () => {
    const { getByText } = render(
      <DuelIntroScreen
        players={players}
        activePlayerId={activePlayerId}
        userId={activePlayerId}
      />,
    )

    expect(getByText(messages.duel.vs)).toBeInTheDocument()

    Object.values(players).forEach((player) => {
      expect(getByText(player.name)).toBeInTheDocument()
    })

    expect(
      getByText(
        formatString(messages.duel.firstPlayer, {
          playerName: players[activePlayerId].name,
        }),
      ),
    ).toBeInTheDocument()
  })
})
