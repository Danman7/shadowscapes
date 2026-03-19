export const formatNoun = (amount: number, noun = 'coin'): string =>
  `${amount} ${noun}${amount !== 1 ? 's' : ''}`
