import { motion } from 'motion/react'
import styled from 'styled-components'

import { FullScreenContainer } from 'src/components/styles'

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

export const DuelBoard = styled(motion.create(FullScreenContainer))`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 ${({ theme }) => theme.spacing}px;
`

export const ActionButtonWrapper = styled(motion.create('div'))`
  position: absolute;
  left: ${({ theme }) => theme.spacing * 2}px;
  bottom: ${({ theme }) => theme.spacing * 10}px;
  z-index: 5;
`
