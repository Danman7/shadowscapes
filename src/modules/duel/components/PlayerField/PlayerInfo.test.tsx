import { checkMarkIcon, playerTurnIcon } from 'src/jest.setup'
import { PlayerInfo } from 'src/modules/duel/components/PlayerField/PlayerInfo'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'
import { DuelPlayer } from 'src/modules/duel/types'
import { render } from 'src/test-utils'

const { players, activePlayerId } = mockInitializeDuelMockState

const player: DuelPlayer = players[activePlayerId]

it('should display player name and remaining coins', () => {
  const { getByText, queryByText } = render(<PlayerInfo player={player} />)

  const { name, coins, income } = player

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(coins)).toBeInTheDocument()
  expect(queryByText(income)).not.toBeInTheDocument()
})

it('should display player income if any', () => {
  const income = 2
  const { getByText } = render(<PlayerInfo player={{ ...player, income }} />)

  expect(getByText(income)).toBeInTheDocument()
})

it('should show player turn icon if active', () => {
  const { getByTestId } = render(<PlayerInfo player={player} isActive />)

  expect(getByTestId(playerTurnIcon)).toBeInTheDocument()
})

it('should show player ready icon if isReady', () => {
  const { getByTestId } = render(<PlayerInfo player={player} isReady />)

  expect(getByTestId(checkMarkIcon)).toBeInTheDocument()
})
