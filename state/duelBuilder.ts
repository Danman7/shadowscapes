import { initialDuelState } from '@/state/duelConstants'
import { clone, generateRandomId, getZoneKey } from '@/state/utils'
import {
  CardDefinitionId,
  CardZone,
  DuelPlayerId,
  DuelState,
  UpdatePlayerProps,
  ZoneKey,
} from '@/types'

export class DuelBuilder {
  private state: DuelState = clone(initialDuelState)

  private createCardInstance(
    owner: DuelPlayerId,
    definitionId: CardDefinitionId,
    id?: string,
  ) {
    const cardInstanceId = id ?? generateRandomId()

    this.state.cards[cardInstanceId] = {
      id: cardInstanceId,
      definitionId,
      ownerId: owner,
    }

    return cardInstanceId
  }

  updatePlayer(playerId: DuelPlayerId, props: UpdatePlayerProps) {
    this.state.players[playerId] = {
      ...this.state.players[playerId],
      ...props,
    }

    return this
  }

  putCardsInZone(
    playerId: DuelPlayerId,
    zone: CardZone,
    instances: { definitionId: CardDefinitionId; id?: string }[],
  ) {
    const zoneKey: ZoneKey = getZoneKey(playerId, zone)

    for (const instance of instances) {
      const cardId = this.createCardInstance(
        playerId,
        instance.definitionId,
        instance.id,
      )

      this.state.cardZone[cardId] = zoneKey

      this.state.zones[zoneKey].push(cardId)
    }

    return this
  }

  active(playerId: DuelPlayerId) {
    this.state.activePlayerId = playerId

    return this
  }

  build(): DuelState {
    return JSON.parse(JSON.stringify(this.state))
  }
}
