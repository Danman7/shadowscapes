import {
  CoinBack,
  CoinContainer,
  CoinFront,
  CoinWrapper,
} from 'src/modules/duel/components/Board/styles'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'

export const CoinFlip: React.FC<{
  result?: 'heads' | 'tails'
}> = ({ result }) => {
  const transitionTimeInMs = useThemeTransitionTimeInSeconds()

  return (
    <CoinContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: transitionTimeInMs * 3,
        delay: transitionTimeInMs * 7,
      }}
    >
      <CoinWrapper
        animate={{ rotateY: result === 'heads' ? 1080 : 1260 }}
        transition={{
          duration: transitionTimeInMs * 20,
          ease: [0.19, 0.96, 0.3, 1],
          delay: transitionTimeInMs * 9,
        }}
      >
        <CoinFront />
        <CoinBack />
      </CoinWrapper>
    </CoinContainer>
  )
}
