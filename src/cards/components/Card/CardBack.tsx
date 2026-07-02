interface CardBackProps {
  isSmall?: boolean
}

export const CardBack = ({ isSmall }: CardBackProps) => (
  <article
    aria-label="Card back"
    className={`card border border-foreground ${isSmall ? 'w-26 bg-[repeating-linear-gradient(45deg,var(--surface)_0_6px,var(--foreground)_6px_12px)]' : 'bg-[repeating-linear-gradient(45deg,var(--surface)_0_12px,var(--foreground)_12px_24px)]'}`}
  />
)
