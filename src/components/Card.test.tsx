// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CARD_DEFINITIONS } from "../game";
import { Card } from "./Card";

afterEach(cleanup);

describe("card faces", () => {
  it.each(Object.values(CARD_DEFINITIONS))(
    "$name shows its mandatory printed information",
    (definition) => {
      render(<Card definition={definition} />);

      const card = within(screen.getByRole("article"));
      expect(card.getByRole("heading", { name: definition.name })).toBeVisible();
      expect(card.getByText(definition.categories.join(" "))).toBeVisible();
      expect(card.getByText(definition.description)).toBeVisible();
      const cost = card.getByRole("img", { name: `Coin cost: ${definition.cost}` });
      expect(cost).toBeVisible();
      expect(cost).toHaveTextContent(String(definition.cost));

      if (definition.type === "character") {
        const strength = card.getByRole("img", { name: `Strength: ${definition.strength}` });
        expect(strength).toBeVisible();
        expect(strength).toHaveTextContent(String(definition.strength));
      } else {
        expect(card.queryByRole("img", { name: /^Strength:/ })).not.toBeInTheDocument();
        expect(card.getByRole("img", { name: "Instant" })).toBeVisible();
      }
    },
  );
});
