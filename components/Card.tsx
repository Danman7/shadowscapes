import {
  getFactionBgClassName,
  getFactionTextClassName,
  getRankBorderClassName,
} from '@/components/utils'
import { CardDefinition } from '@/types'

export const Card: React.FC<CardDefinition> = ({ faction, constants }) => {
  const { name, rank } = constants

  return (
    <div className="bg-surface w-62 h-87 flex  flex-col gap-2 spac rounded-lg shadow-md">
      <div
        className={`m-2 rounded-md p-2 border-2 border-b-4 ${getRankBorderClassName(rank)} ${getFactionTextClassName(faction)} ${getFactionBgClassName(faction)}`}
      >
        <h2 className="text-center">{name}</h2>
      </div>
    </div>
  )
}
