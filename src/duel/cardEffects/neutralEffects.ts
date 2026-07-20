import { FLASH_BOMB_STUN_TURNS } from '../../cards/bases/neutralConstants'
import {
  adjustCharacterStun,
  drawCard,
  grantCharacterHaste,
  stripCharacterTraits,
} from '../state'
import { createOnPlayCardEffect } from './onPlayEffect'
import { createTargetedCardEffect } from './targetedCardEffect'

const cookOnPlay = createOnPlayCardEffect(
  'cook',
  ({ dispatch, playerId }) => {
    dispatch(drawCard({ playerId }))
  },
)

const speedPotionTargetedEffect = createTargetedCardEffect(
  'speedPotion',
  ({ dispatch, targetCardInstanceId }) => {
    dispatch(
      grantCharacterHaste({
        cardInstanceId: targetCardInstanceId,
        stack: 'hand',
      }),
    )
  },
)

const flashBombTargetedEffect = createTargetedCardEffect(
  'flashBomb',
  ({ dispatch, targetCardInstanceId }) => {
    dispatch(stripCharacterTraits({ cardInstanceId: targetCardInstanceId }))
    dispatch(
      adjustCharacterStun({
        cardInstanceId: targetCardInstanceId,
        amount: FLASH_BOMB_STUN_TURNS,
      }),
    )
  },
)

export const neutralEffects = [
  cookOnPlay,
  speedPotionTargetedEffect,
  flashBombTargetedEffect,
] as const
