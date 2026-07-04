export const shuffle = <T>(items: readonly T[]): T[] => {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const itemAtIndex = shuffledItems[index]

    shuffledItems[index] = shuffledItems[randomIndex]
    shuffledItems[randomIndex] = itemAtIndex
  }

  return shuffledItems
}
