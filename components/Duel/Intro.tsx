import { getPlayerColorClassName } from '@/components/utils'
import { formatString, messages } from '@/i18n'
import { DuelPlayerId } from '@/types'

export interface IntroProps {
  playerNames: Record<DuelPlayerId, string>
  firstPlayerId: DuelPlayerId
}

export const Intro = ({ playerNames, firstPlayerId }: IntroProps) => (
  <div className="min-h-dvh w-full flex flex-col items-center justify-center overflow-hidden">
    <h1 className="text-4xl font-extrabold animate-fade-in-scale-up-slow">
      Duel
    </h1>

    <div className="flex w-full my-12">
      <div className="w-1/3 text-right text-background bg-first-player p-4 text-lg font-bold text-shadow-sm text-shadow-foreground shadow-lg shadow-first-player/50 rounded-r-xl animate-slide-in-from-left-slow">
        {playerNames.Player1}
      </div>

      <div className="w-1/3 text-center py-4 text-2xl font-bold text-shadow-sm text-shadow-elite animate-fade-in-scale-up-slow-delayed">
        VS
      </div>

      <div className="w-1/3 bg-second-player text-background p-4 text-lg font-bold text-shadow-sm text-shadow-foreground shadow-lg shadow-second-player/50 rounded-l-xl animate-slide-in-from-right-slow">
        {playerNames.Player2}
      </div>
    </div>

    <p className={`animate-fade-in-scale-up-xl-delayed`}>
      <span
        className={`font-bold inline-block animate-ping-once ${getPlayerColorClassName(firstPlayerId)}`}
      >
        {formatString(messages.duel.firstPlayer, {
          playerName: playerNames[firstPlayerId],
        })}
      </span>
    </p>
  </div>
)
