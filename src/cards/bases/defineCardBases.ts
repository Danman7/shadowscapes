import type { CharacterCardBase, InstanceCardBase } from '../types'

type CardBaseDefinition =
  | Omit<CharacterCardBase, 'baseId'>
  | Omit<InstanceCardBase, 'baseId'>

type CardBaseDefinitions = Record<string, CardBaseDefinition>

type DefinedCardBases<TBases extends CardBaseDefinitions> = {
  readonly [TBaseId in keyof TBases]: TBases[TBaseId] & {
    readonly baseId: Extract<TBaseId, string>
  }
}

export const defineCardBases = <const TBases extends CardBaseDefinitions>(
  bases: TBases,
): DefinedCardBases<TBases> =>
  Object.fromEntries(
    Object.entries(bases).map(([baseId, card]) => [
      baseId,
      { ...card, baseId },
    ]),
  ) as unknown as DefinedCardBases<TBases>
