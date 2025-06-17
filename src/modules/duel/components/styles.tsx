import { motion } from 'motion/react'
import styled from 'styled-components'

export const CardContainer = styled.div`
  width: ${({ theme }) => theme.card.width}px;
  height: ${({ theme }) => theme.card.height}px;
  position: relative;
  perspective: 1000px;
`

export const CardFlipper = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
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
  border: ${({ theme }) => `${theme.spacing}px solid  ${theme.colors.text}`};
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
  border: 1px dashed ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  font-size: 5em;
  display: flex;
  align-items: center;
  justify-content: center;
`
