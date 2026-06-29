type Params = Record<string, string | number>

export const formatString = (template: string, params: Params): string =>
  template.replace(
    /\{(\w+)(?:\|([^|}]+)\|([^}]+))?\}/g,
    (_match, key: string, singular?: string, plural?: string) => {
      const value = params[key]
      if (value === undefined) return _match

      if (singular !== undefined && plural !== undefined) {
        return Number(value) === 1 ? singular : plural
      }

      return String(value)
    },
  )
