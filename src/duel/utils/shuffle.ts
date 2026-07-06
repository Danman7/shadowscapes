export const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i >= 0; i--) {
    const newPosition = Math.floor((i + 1) * Math.random())
    const temp = array[newPosition]
    array[newPosition] = array[i]
    array[i] = temp
  }

  return array
}
