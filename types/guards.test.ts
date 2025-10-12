import { cardDefinitions } from '@/data'
import { isCharacter } from '@/types'

describe('isCharacter', () => {
  it('should return true when definition kind is Character', () => {
    expect(isCharacter(cardDefinitions.TempleGuard)).toBe(true)
  })

  it('should return false when definition kind is not Character', () => {
    expect(isCharacter(cardDefinitions.YoraSkull)).toBe(false)
  })
})
