export const removeIdsFromStack = (
  stack: string[],
  idsToRemove: string[],
): string[] => {
  if (idsToRemove.length === 0) return [...stack]

  const idsToRemoveSet = new Set(idsToRemove)

  return stack.reduce<string[]>((nextStack, id) => {
    if (!idsToRemoveSet.has(id)) nextStack.push(id)
    return nextStack
  }, [])
}

export const removeIdFromStack = (
  stack: string[],
  idToRemove: string,
): string[] => {
  return stack.reduce<string[]>((nextStack, id) => {
    if (id !== idToRemove) nextStack.push(id)
    return nextStack
  }, [])
}
