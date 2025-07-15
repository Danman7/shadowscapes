export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2)

export const deepClone = <T>(object: T) => JSON.parse(JSON.stringify(object))

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}
