import { motion } from 'motion/react'
import styled from 'styled-components'

import { Paper } from 'src/components/styles'

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

export const StyledPlayerField = styled.div<{ $isOnTop?: boolean }>`
  width: 100%;
  height: 50%;
  position: relative;
  display: grid;
  gap: ${({ theme }) => theme.spacing}px;

  grid-template-areas: ${({ $isOnTop }) =>
    $isOnTop
      ? `'discard hand deck' 'board board board'`
      : `'board board board' 'discard hand deck'`};

  grid-template-columns: ${({ theme }) =>
    `${theme.spacing * 20}px auto ${theme.spacing * 20}px`};

  grid-template-rows: ${({ $isOnTop, theme }) =>
    $isOnTop ? `${theme.spacing * 5}px 1fr` : `1fr ${theme.spacing * 5}px`};
`

export const SmallCard = styled.div<{ $origin: string }>`
  transform: scale(0.64);
  transform-origin: ${({ $origin }) => $origin};
`

export const FieldBoard = styled.div<{ $isOnTop?: boolean }>`
  grid-area: board;
  justify-self: center;
  align-self: ${({ $isOnTop }) => ($isOnTop ? 'end' : 'start')};
`

export const BoardCardsCointainer = styled.div`
  display: flex;
  height: 224px;
  margin: ${({ theme }) => theme.spacing / 2}px 0;

  ${SmallCard} {
    margin: 0 -40px;
  }
`

export const Deck = styled.div`
  grid-area: deck;
  position: relative;
`

export const Discard = styled.div`
  grid-area: discard;
  position: relative;
`

export const Hand = styled.div`
  grid-area: hand;
  justify-self: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  width: 100%;
`

export const StackedCard = styled(motion.create('div'))<{
  $offset?: number
  $isOnTop?: boolean
}>`
  position: absolute;

  ${({ $isOnTop, $offset }) =>
    $isOnTop &&
    `
    bottom: ${$offset}px;
  `}

  ${({ $isOnTop, $offset }) =>
    !$isOnTop &&
    `
    top: ${$offset}px;
  `}
`

export const StackLabelAndCount = styled.div<{ $isOnTop?: boolean }>`
  text-align: center;
  position: absolute;
  width: 100%;

  ${({ $isOnTop, theme }) =>
    !$isOnTop &&
    `
    top: -${theme.spacing * 3}px;
  `}

  ${({ $isOnTop, theme }) =>
    $isOnTop &&
    `
    bottom: -${theme.spacing * 3}px;
  `}
`

export const PlayerInfoFieldContainer = styled(motion.div)<{
  $isOnTop?: boolean
}>`
  position: absolute;
  z-index: 2;

  ${({ $isOnTop, theme }) =>
    $isOnTop ? `bottom: ${theme.spacing}px;` : `top: ${theme.spacing}px;`}
`

export const HandCardContainer = styled.div<{
  $index: number
  $total: number
  $isOnTop?: boolean
  $isUser?: boolean
}>`
  ${({ $index, $total, $isOnTop, $isUser, theme }) => {
    // Calculate the rotation angle
    // More cards = less rotation per card to avoid extreme angles
    const maxRotation = Math.min(5, 40 / Math.max($total, 1))
    const middleIndex = ($total - 1) / 2
    const rotation = ($index - middleIndex) * maxRotation

    // For top player, invert the rotation
    const adjustedRotation = $isOnTop ? -rotation : rotation

    // Calculate vertical offset to create the arc effect
    // Cards further from center are raised higher (or lower for top player)
    const yOffset = $isOnTop
      ? Math.abs(rotation) * 0.8 // Positive for top player (lower cards)
      : -Math.abs(rotation) * 0.8 // Negative for bottom player (raise cards)

    // Create a slight overlap between cards
    const xOffset = ($index - middleIndex) * 60

    return `
      transform: rotate(${adjustedRotation}deg) translate(${xOffset}px, ${yOffset}px);

      ${
        !$isOnTop &&
        $isUser &&
        `&:hover {
        transform: rotate(${adjustedRotation / 2}deg) translateY(-${theme.spacing * 34}px) translate(${xOffset}px);
        z-index: 3;
      }`
      }
    `
  }};
  position: absolute;
  transform-origin: ${({ $isOnTop }) =>
    $isOnTop ? 'top center' : 'bottom center'};
  transition: transform 0.3s ease;

  ${({ $isOnTop, theme }) =>
    !$isOnTop &&
    `
    top: -${theme.spacing * 5}px;
  `}
`
