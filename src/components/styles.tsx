import { motion } from 'motion/react'
import styled, { keyframes } from 'styled-components'

const cycle = keyframes`
  0% {
    border-left: 0 solid  var(--light-color);
    border-right: 0.5em solid  var(--shadow-color);
    background-color:  var(--shadow-color);
    transform: rotate(-10deg);
  }
  24.9999% { background-color:  var(--shadow-color); }
  25% {
    border-left: 0.5em solid  var(--light-color);
    border-right: 0.5em solid  var(--shadow-color);
    background-color:  var(--light-color);
  }
  50% {
    border-left: 0 solid  var(--light-color);
    border-right: 0 solid  var(--shadow-color);
    background-color:  var(--light-color);
    transform: rotate(0deg);
  }
  50.0001% {
    border-left: 0 solid  var(--shadow-color);
  }
  74.9999% {
    background-color:  var(--light-color);
    border-right: 0 solid  var(--light-color);
  }
  75% {
    border-left: 0.5em solid  var(--shadow-color);
    border-right: 0.5em solid  var(--light-color);
    background-color:  var(--shadow-color);
  }
  100% {
    border-left: 0.5em solid  var(--shadow-color);
    border-right: 0 solid  var(--light-color);
    background-color:  var(--shadow-color);
    transform: rotate(10deg);
  }
`

export const Moon = styled.div`
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  overflow: hidden;
  border: 0.03em solid currentcolor;
  position: relative;
`

export const Light = styled.div`
  --light-color: ${({ theme }) => theme.colors.background};
  --shadow-color: currentcolor;
  box-sizing: border-box;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  animation: ${cycle} ${({ theme }) => theme.transitionTime * 10}ms linear
    infinite reverse;
`

export const Crater = styled.div<{
  $size: string
  $top: string
  $left: string
}>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background-color: transparent;
  box-shadow: -0.02em 0.02em 0 0.02em currentcolor;
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
`

export const Paper = styled.div`
  padding: ${({ theme }) => theme.spacing}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.spacing}px;
  box-shadow: ${({ theme }) => theme.boxShadow.level2};
`

export const FullScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  min-width: 100dvw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
`

export const FullScreenCenteredContainer = styled(
  motion.create(FullScreenContainer),
)`
  display: flex;
  align-items: center;
  justify-content: center;
`
