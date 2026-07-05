import { Button } from '../../../shared/components'
import { usePhaseButton } from '../../hooks/usePhaseButton'

export const PhaseButton = () => {
  const options = usePhaseButton()

  if (!options) return null

  return <Button label={options.label} onClick={options.onClick} />
}
