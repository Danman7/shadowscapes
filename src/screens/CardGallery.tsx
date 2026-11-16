import { Card } from "../components/Card";
import { CARD_DEFINITIONS } from "../game";

export function CardGallery() {
  return (
    <>
      <ul className="card-grid" aria-label="All cards">
        {Object.entries(CARD_DEFINITIONS).map(([id, definition]) => (
          <li key={id}>
            <Card definition={definition} />
          </li>
        ))}
      </ul>
    </>
  );
}
