import { useGameState } from '@/contexts/GameContext'

/**
 * IntroScreen component - displays duel intro with player names and starting player
 */
export function IntroScreen() {
  const duel = useGameState()

  if (duel.startingPlayerId === null) {
    return null
  }

  const player1 = duel.players.player1
  const player2 = duel.players.player2
  const startingPlayer = duel.players[duel.startingPlayerId]

  return (
    <div
      className="w-full h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center"
      data-testid="intro-screen"
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">Duel</h1>

        <div className="flex items-center justify-center gap-8 mb-8">
          <span className="text-2xl font-bold text-white">{player1.name}</span>
          <span className="text-3xl text-gray-400 font-bold">VS</span>
          <span className="text-2xl font-bold text-white">{player2.name}</span>
        </div>

        <div className="text-xl text-yellow-400 font-semibold mb-8">
          {startingPlayer.name} starts first
        </div>
      </div>
    </div>
  )
}
