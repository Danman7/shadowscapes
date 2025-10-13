import { en as messages } from '@/i18n/en'
import type { CardDefinitionId } from '@/types'

export function formatString(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

export const getCardText = (id: CardDefinitionId) => {
  const t = messages.definitions[id as keyof typeof messages.definitions]
  return { name: t.name, flavor: t.flavor, description: t.description }
}
