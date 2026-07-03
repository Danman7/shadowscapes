import type { CharacterCardBase, Faction, InstanceCardBase } from '../types'

type CardBaseDefinition =
  | Omit<CharacterCardBase, 'baseId' | 'faction'>
  | Omit<InstanceCardBase, 'baseId' | 'faction'>

type CardBaseDefinitions = Record<string, CardBaseDefinition>

type DefinedCardBases<
  TFaction extends Faction,
  TBases extends CardBaseDefinitions,
> = {
  readonly [TBaseId in keyof TBases]: TBases[TBaseId] & {
    readonly baseId: Extract<TBaseId, string>
    readonly faction: TFaction
  }
}

export const defineCardBases = <
  const TFaction extends Faction,
  const TBases extends CardBaseDefinitions,
>(
  faction: TFaction,
  bases: TBases,
): DefinedCardBases<TFaction, TBases> =>
  Object.fromEntries(
    Object.entries(bases).map(([baseId, card]) => [
      baseId,
      { ...card, baseId, faction },
    ]),
  ) as unknown as DefinedCardBases<TFaction, TBases>
