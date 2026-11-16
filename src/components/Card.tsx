import { FaFistRaised } from "react-icons/fa";
import { LuZap } from "react-icons/lu";
import { PiCoinsFill } from "react-icons/pi";
import type { CardDefinition } from "../game";
import "./Card.css";

type CardProps =
  | { readonly face: "back" }
  | { readonly face?: "front"; readonly definition: CardDefinition };

/** A display-only card. A parent can own movement; the inner face can own rotation. */
export function Card(props: CardProps) {
  if (props.face === "back") {
    return (
      <article className="game-card" aria-label="Face-down card">
        <div className="card-face card-face--back" aria-hidden="true">
          <span className="card-back-mark">G</span>
        </div>
      </article>
    );
  }

  const { definition } = props;
  const isCharacter = definition.type === "character";
  const isInstant = definition.type === "instant";

  return (
    <article
      className="game-card"
      data-faction={definition.faction}
      data-classification={definition.classification}
      aria-label={`${definition.name}${definition.classification === "elite" ? ", elite" : ""}`}
    >
      <div className="card-face card-face--front">
        <div className="card-topline">
          <div>
            <small>{definition.categories.join(" ")}</small>

            <h2
              className={`card-name${definition.classification === "elite" ? " elite" : ""}`}
            >
              {definition.name}
            </h2>
          </div>

          <div className="card-strength">
            {isCharacter && definition.strength !== undefined && (
              <span
                className="icon-text"
                role="img"
                aria-label={`Strength: ${definition.strength}`}
              >
                <FaFistRaised aria-hidden="true" />

                {definition.strength}
              </span>
            )}

            {isInstant && <LuZap role="img" aria-label="Instant" />}
          </div>
        </div>

        <hr />

        <p className="card-description">{definition.description}</p>
        <div className="card-bottomline">
          <span
            className="coins"
            role="img"
            aria-label={`Coin cost: ${definition.cost}`}
          >
            <PiCoinsFill aria-hidden="true" />

            {definition.cost}
          </span>
        </div>
      </div>
    </article>
  );
}
