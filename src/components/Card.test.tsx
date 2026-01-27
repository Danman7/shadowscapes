import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";
import { createCardInstance } from "../test/mocks/cardInstances";

describe("Card", () => {
  test("renders character card with strength", () => {
    const characterCard = createCardInstance(1, "zombie", 2);

    const { container } = render(<Card card={characterCard} />);

    expect(screen.getByText("Zombie")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Character")).toBeTruthy();
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders instant card without strength", () => {
    const instantCard = createCardInstance(2, "bookOfAsh");

    const { container } = render(<Card card={instantCard} />);

    expect(screen.getByText("Book of Ash")).toBeTruthy();
    expect(screen.getByText(String(instantCard.base.cost))).toBeTruthy();
    expect(screen.getByText("Instant")).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test("displays correct faction colors", () => {
    const shadowCard = createCardInstance(3, "downwinder", 2);

    render(<Card card={shadowCard} />);
    expect(screen.getByText("SHADOW")).toBeTruthy();
  });

  test("renders description paragraphs", () => {
    const card = createCardInstance(4, "novice", 1);

    render(<Card card={card} />);
    expect(screen.getByText(card.base.description[0]!)).toBeTruthy();
  });

  test("renders flavor text", () => {
    const card = createCardInstance(5, "sachelman", 2);

    render(<Card card={card} />);
    expect(screen.getByText(card.base.flavorText)).toBeTruthy();
  });
});
