import type { CardInstance, CardBaseId, Faction } from "../types";
import type { CARD_BASES } from "../constants/cardBases";

export interface CardProps {
  card: CardInstance & { base: (typeof CARD_BASES)[CardBaseId] };
  onClick?: () => void;
  className?: string;
}

const FACTION_COLORS: Record<
  Faction,
  { border: string; bg: string; text: string }
> = {
  chaos: { border: "border-red-500", bg: "bg-red-500", text: "text-red-500" },
  order: {
    border: "border-blue-500",
    bg: "bg-blue-500",
    text: "text-blue-500",
  },
  shadow: {
    border: "border-purple-600",
    bg: "bg-purple-600",
    text: "text-purple-600",
  },
  neutral: {
    border: "border-gray-500",
    bg: "bg-gray-500",
    text: "text-gray-500",
  },
};

/**
 * Card component - displays a game card with its details
 * Shows character strength for character cards or instant indicator for instant cards
 */
export function Card({ card, onClick, className = "" }: CardProps) {
  const { base, strength, type } = card;
  const colors = FACTION_COLORS[base.faction];

  return (
    <div
      className={`w-32 h-40 rounded-lg border-2 ${colors.border} bg-slate-100 p-3 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow relative ${className}`}
      onClick={onClick}
      data-testid="card"
    >
      <div className="flex justify-between items-start gap-1">
        <span className="font-bold text-sm leading-tight flex-1">
          {base.name}
        </span>
        <span className="font-bold text-xs bg-gray-300 px-1 rounded">
          {base.cost}
        </span>
      </div>

      <div
        className={`${colors.bg} text-white text-xs font-semibold px-2 py-1 rounded text-center`}
      >
        {type === "character" ? "Character" : "Instant"}
      </div>

      <div className="text-xs text-gray-700 flex-grow overflow-hidden">
        {base.description.map((paragraph, index) => (
          <p key={index} className="mb-1">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="text-xs italic text-gray-600 border-t pt-1">
        {base.flavorText}
      </div>

      <div className="flex justify-between items-end">
        <span className={`text-xs font-bold ${colors.text}`}>
          {base.faction.toUpperCase()}
        </span>
        {type === "character" && strength !== undefined && (
          <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-xs font-bold">
            {strength}
          </div>
        )}
      </div>
    </div>
  );
}
