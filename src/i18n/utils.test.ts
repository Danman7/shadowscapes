import { formatString } from 'src/i18n/utils'

describe('i18n Utils', () => {
  describe('formatString', () => {
    const template = 'Hello, {name}!'

    it('should replace placeholders with values', () => {
      const values = { name: 'Alice' }
      expect(formatString(template, values)).toBe('Hello, Alice!')
    })

    it('should not replace placeholders when value is missing', () => {
      const values = {}
      expect(formatString(template, values)).toBe('Hello, {name}!')
    })
  })
})
