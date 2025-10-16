import { render } from '@testing-library/react'

import { Intro, IntroProps } from '@/components/Board/Intro'

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

it.todo('shows if first player goes first')

it.todo('shows if second player goes first')
