import { LuSwords } from "react-icons/lu";

export function Duel() {
  return (
    <>
      <section className="page-placeholder" aria-labelledby="duel-heading">
        <LuSwords className="large-icon" aria-hidden="true" />
        <h1 id="duel-heading">The table is being prepared.</h1>
        <p>Custom decks and the local testing duel will live here.</p>
      </section>
    </>
  );
}
