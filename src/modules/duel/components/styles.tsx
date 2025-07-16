import { motion } from 'motion/react'
import styled from 'styled-components'

import { FullScreenContainer, Paper } from 'src/components/styles'

export const CardContainer = styled.div`
  width: ${({ theme }) => theme.card.width}px;
  height: ${({ theme }) => theme.card.height}px;
  perspective: 1000px;
  position: relative;
`

export const CardFlipper = styled(motion.div)`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`

export const CardFace = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: ${({ theme }) => theme.spacing}px;
  box-shadow: ${({ theme }) => theme.boxShadow.level1};
`

export const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  border: ${({ theme }) =>
    `${theme.spacing / 2}px solid  ${theme.colors.text}`};
  background: ${({ theme }) => `repeating-linear-gradient(
    45deg,
    ${theme.colors.surface},
    ${theme.colors.surface}, ${theme.spacing * 2}px,
    ${theme.colors.text} ${theme.spacing * 2}px,
    ${theme.colors.text} ${theme.spacing * 4}px
  );`};
`

export const HiddenAgent = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.hidden};
  border: 2px dashed rgba(0, 0, 0, 0.1);
  color: ${({ theme }) => theme.colors.surface};
  font-size: 5em;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const PlayerInfoPanel = styled(Paper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing}px;
  width: ${({ theme }) => theme.spacing * 30}px;
`

export const PlayerName = styled(motion.div)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${({ theme }) => theme.spacing * 17}px;
`

export const DuelBoard = styled(motion.create(FullScreenContainer))`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 ${({ theme }) => theme.spacing}px;
`

export const StyledPhaseModal = styled(motion.create(Paper))`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
`

export const FirstPlayerMessage = styled(motion.create('div'))`
  position: absolute;
`

export const VersusContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  > * {
    flex: 1;
    display: flex;
    justify-content: center;
  }
`

export const IntroPlayerName = styled(motion.create('h1'))<{
  $justify: string
}>`
  justify-content: ${({ $justify }) => $justify};
`

export const CoinContainer = styled(motion.div)`
  perspective: 1000px;
`

export const CoinWrapper = styled(motion.div)`
  width: ${({ theme }) => theme.spacing * 10}px;
  height: ${({ theme }) => theme.spacing * 10}px;
  position: relative;
  transform-style: preserve-3d;
`

const CoinSide = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  box-shadow: ${({ theme }) => theme.boxShadow.level1};
`

export const CoinFront = styled(CoinSide)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
`

export const CoinBack = styled(CoinSide)`
  background: ${({ theme }) => theme.colors.hidden};
  color: ${({ theme }) => theme.colors.surface};
  transform: rotateY(180deg);
`
