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
