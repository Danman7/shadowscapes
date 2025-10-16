import { CARD_BACK_TESTID } from '@/components/testIds'

export interface CardBackProps {
  isSmall?: boolean
}

export const CardBack: React.FC<CardBackProps> = ({ isSmall }) => (
  <div
    data-testid={CARD_BACK_TESTID}
    className={`${isSmall ? 'w-32 h-48' : 'w-52 h-74'} rounded-lg shadow-md box-border border-1 border-foreground/10`}
    style={{
      background: isSmall ? 'var(--card-back-small)' : 'var(--card-back)',
    }}
  />
)
