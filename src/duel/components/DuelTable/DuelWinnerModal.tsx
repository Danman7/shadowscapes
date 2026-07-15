import { messages } from '../../../l10n/en'
import { formatString } from '../../../l10n/utils/formatString'
import { Modal } from '../../../shared/components'

export interface DuelWinnerModalProps {
  winnerName: string
}

export const DuelWinnerModal = ({ winnerName }: DuelWinnerModalProps) => (
  <Modal
    title={formatString(messages.ui.duelWinnerTitle, { name: winnerName })}
  >
    <p>{messages.ui.duelCompleteMessage}</p>
  </Modal>
)
