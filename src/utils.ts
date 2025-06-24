export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2)

export const deepClone = <T>(object: T) => JSON.parse(JSON.stringify(object))
