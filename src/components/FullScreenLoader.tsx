import { MoonLoading } from 'src/components/MoonLoading'
import { FullScreenCenteredContainer } from 'src/components/styles'

export const FullScreenLoader: React.FC<{ message: string }> = ({
  message,
}) => (
  <FullScreenCenteredContainer
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
  >
    <h1>
      <MoonLoading /> {message}
    </h1>
  </FullScreenCenteredContainer>
)
