---
agent: Plan
---

I want to have a custom render function for testing components that require GameProvider context. I want it to return all the regular utilities from render from '@testing-library/react'. I also want it to wrap the component in a GameProvider with initialDuelState, but also to be able to pass in custom overrides for the duel state when needed.

This is the current test structure:

```
const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Alice',
          player2Name: 'Bob',
        },
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

const { getByTestId } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )
```

The above becomes:

```
const { getByTestId } = renderGameContext(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
    preloadedState: {
        player1Name: 'Alice',
        player2Name: 'Bob',
        phase: 'initial-draw',
    }
  )
```

No actions are dispatched. Preloaded state is merged with the duelReducers state and then rendered. I would like to use this for all current tests and stories that require GameProvider context. Please replace DuelView, GameContext and playerSelectors tests and create a stories for DuelView with mock player decks, one for initial state where all cards are only in the deck, and one for a couple of cards in each stack.
