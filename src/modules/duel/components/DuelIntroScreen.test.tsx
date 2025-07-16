import { formatString, messages } from 'src/i18n'
import { DuelIntroScreen } from 'src/modules/duel/components/DuelIntroScreen'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'
import { render } from 'src/test-utils'

describe('Duel Intro Screen', () => {
  const { players, activePlayerId, inactivePlayerId } =
    mockInitializeDuelMockState

  it('should show both player names', () => {
    const { getByText } = render(
      <DuelIntroScreen
        players={players}
        activePlayerId={activePlayerId}
        userId={activePlayerId}
      />,
    )

    Object.values(players).forEach((player) => {
      expect(getByText(player.name)).toBeInTheDocument()
    })
  })

  it('should show who is first', () => {
    const { getByText } = render(
      <DuelIntroScreen
        players={players}
        activePlayerId={inactivePlayerId}
        userId={activePlayerId}
      />,
    )

    expect(
      getByText(
        formatString(messages.duel.firstPlayer, {
          playerName: players[inactivePlayerId].name,
        }),
      ),
    ).toBeInTheDocument()
  })

  it('should show first user starts if player is not in game', () => {
    const { getByText } = render(
      <DuelIntroScreen
        players={players}
        activePlayerId={activePlayerId}
        userId="not-in-game"
      />,
    )

    expect(
      getByText(
        formatString(messages.duel.firstPlayer, {
          playerName: players[activePlayerId].name,
        }),
      ),
    ).toBeInTheDocument()
  })
})
