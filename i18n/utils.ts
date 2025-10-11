import { messages } from '@/i18n'
import type { CardDefinitionId } from '@/types'

/**
 * Formats a string with interpolated values
 *
 * @param template The string template with placeholders like {variableName}
 * @param values Object containing values to replace placeholders
 * @returns Formatted string with replaced values
 *
 * @example
 * formatString('{playerName} starts first.', { playerName: 'Jim' })
 * // Returns: 'Jim starts first.'
 */
export function formatString(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

/**
 * Retrieves the localized text content for a card based on its definition ID.
 *
 * @param id - The unique identifier for the card definition
 * @returns An object containing the card's localized name, flavor text, and description
 * @returns {string} returns.name - The localized name of the card
 * @returns {string} returns.flavor - The localized flavor text of the card
 * @returns {string} returns.description - The localized description of the card
 */
export const getCardText = (id: CardDefinitionId) => {
  const t = messages.cards[id as keyof typeof messages.cards]
  return { name: t.name, flavor: t.flavor, description: t.description }
}
