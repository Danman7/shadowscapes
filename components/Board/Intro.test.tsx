import { render } from '@testing-library/react'

import { Intro, IntroProps } from '@/components/Board/Intro'
import { formatString, messages } from '@/i18n'

const props: IntroProps = {
  firstPlayerId: 'Player1',
  playerNames: {
    Player1: 'Basso',
    Player2: 'Victoria',
  },
}

it('shows both player names', () => {
  const { getByText } = render(<Intro {...props} />)

  expect(getByText(props.playerNames.Player1)).toBeInTheDocument()
  expect(getByText(props.playerNames.Player2)).toBeInTheDocument()
})

it('shows if first player goes first', () => {
  const { getByText } = render(<Intro {...props} />)

  expect(
    getByText(
      formatString(messages.board.firstPlayer, {
        playerName: props.playerNames[props.firstPlayerId],
      }),
    ),
  ).toBeInTheDocument()
})

it('shows if second player goes first', () => {
  const { getByText } = render(<Intro {...props} firstPlayerId="Player2" />)

  expect(
    getByText(
      formatString(messages.board.firstPlayer, {
        playerName: props.playerNames['Player2'],
      }),
    ),
  ).toBeInTheDocument()
})
