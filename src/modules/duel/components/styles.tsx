import { motion } from 'motion/react'
import styled from 'styled-components'

import { Paper } from 'src/components/styles'

export const CardContainer = styled(motion.create('div'))<{
  $isClickable?: boolean
}>`
  width: ${({ theme }) => theme.card.width}px;
  height: ${({ theme }) => theme.card.height}px;
  perspective: 1000px;
  position: relative;
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  border-radius: ${({ theme }) => theme.spacing}px;
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

export const StyledPhaseModal = styled(motion.create(Paper))`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
`

export const CardClickHelpText = styled(motion.create('p'))`
  position: absolute;
  text-align: center;
  width: 100%;
  font-style: italic;
  top: -${({ theme }) => theme.spacing * 4}px;
`

export const BoardCardContainer = styled.div`
  position: relative;
`
