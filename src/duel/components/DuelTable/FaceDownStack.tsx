import { CardBack } from '../../../cards'

export interface FaceDownStackProps {
  label: string
  amount: number
}

export const FaceDownStack = ({ label, amount }: FaceDownStackProps) => (
  <div className="relative">
    <div className="absolute inset-0 z-10 grid place-items-center">
      <div className="paper text-center">
        {label} {amount}
      </div>
    </div>

    <CardBack isSmall />
  </div>
)
