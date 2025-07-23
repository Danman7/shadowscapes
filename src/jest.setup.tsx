import '@testing-library/jest-dom'
import { ReactNode } from 'react'

export const counterIcon = 'counter-icon'
export const retaliatesIcon = 'retaliates-icon'
export const hiddenIcon = 'hidden-icon'
export const fighterIcon = 'fighter-icon'
export const agentIcon = 'agent-icon'
export const instantIcon = 'instant-icon'
export const playerTurnIcon = 'player-turn-icon'
export const checkMarkIcon = 'check-mark-icon'

jest.mock('react-icons/gi', () => {
  return {
    ...jest.requireActual('react-icons/gi'),
    GiBackForth: () => <div data-testid={retaliatesIcon} />,
    GiSemiClosedEye: () => <div data-testid={hiddenIcon} />,
    GiStoneStack: () => <div data-testid={counterIcon} />,
    GiBlackHandShield: () => <div data-testid={agentIcon} />,
    GiFist: () => <div data-testid={fighterIcon} />,
    GiPowerLightning: () => <div data-testid={instantIcon} />,
    GiCardPlay: () => <div data-testid={playerTurnIcon} />,
    GiCheckMark: () => <div data-testid={checkMarkIcon} />,
    __esModule: true,
  }
})

jest.mock('motion/react', () => ({
  ...jest.requireActual('motion/react'),
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
