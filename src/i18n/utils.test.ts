import { formatString } from 'src/i18n/utils'

describe('i18n Utils', () => {
  describe('formatString', () => {
    it('should replace placeholders with values', () => {
      const template = 'Hello, {name}!'
      const values = { name: 'Alice' }
      expect(formatString(template, values)).toBe('Hello, Alice!')
    })
  })
})
