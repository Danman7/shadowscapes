export const joinWithSpace = (values: readonly string[]) =>
  values.filter((value) => value.length > 0).join(' ')
