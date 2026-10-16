# Duel rules

This document records the rules agreed during design. Items under “Open decisions” are unresolved, not implemented rules. Numerical settings remain adjustable for testing.

## Scope

- A two-player duel card game based on the Thief universe.
- The first version supports quickly configuring test decks for both players and restarting duels. Database persistence, login, multiplayer, and a deck-building interface come later.
- There is no separate combat phase or automatic end-of-turn attack step.

## Factions and decks

- Factions are Chaos, Order, and Shadow, plus Neutral cards.
- Each deck uses cards from one faction and may include Neutral cards.
- Elite cards allow at most one copy of each card per deck.
- Common cards allow at most two copies of each card per deck.
- Deck size is not fixed yet.

## Cards and zones

- Each player has four zones: deck, hand, board, and discard.
- The two card types are instant and character.
- All cards have a name, categories, faction, coin cost, description, and flavor text. Cards also have an elite or common classification.
- Characters additionally have strength and may have abilities or statuses, such as stealth, hidden, counter, or stunned. Counter and stunned have no agreed mechanics yet.
- Instants resolve their effects and go to discard rather than remaining on the board.
- Characters remain on the board until removed. A character at zero or lower strength goes to discard.

## Duel setup

- Both players begin with the same configurable number of coins.
- All cards begin in their owners' deck piles.
- Each player draws four cards into their initial hand.
- There is no mulligan.

## Turn structure

1. At the start of the active player's turn, they draw one card, including on their first turn.
2. The active player chooses one action: play a card, attack with a character, earn a coin, or activate an ability that consumes the turn.
3. The action and its triggered effects resolve, then the turn ends and control passes to the opponent.

Drawing from an empty deck does nothing and has no penalty.

### Play a card

- Play one card from hand, pay its coin cost, and resolve its effects.
- When playing a character, choose its insertion position in the board row.
- An instant goes to discard after resolving.
- Playing a card uses the turn's action; the player cannot also take a normal attack action that turn.
- Characters need no automatic summoning delay. Playing one already uses its owner's action for that turn.
- Explicit card effects may cause additional actions, such as summoning another copy or making neighboring characters attack.

### Attack

- Choose one character on the active player's board to attack.
- It may target any opposing character that is not hidden; there are no combat lanes or position-based targeting restrictions.
- An ordinary character may attack the opposing player directly only if that player has no non-hidden characters on their board. An empty board or a board containing only hidden characters permits direct attacks.
- Any hidden character may bypass opposing characters and attack the player directly, whether or not it has stealth.
- Attacking either a character or a player reveals the attacker.
- The attack and its effects resolve, then the turn ends.

### Earn a coin

- Instead of playing or attacking, gain one coin and end the turn.
- This action is available only while the player's coins are below their starting amount.
- It can be taken once on the player's own turn, never during the opponent's turn.
- There is no automatic turn income and no automatic refund for destroyed characters.
- Cards may provide additional income or steal coins.
- Card effects can raise coins above the starting amount. The starting-amount cap applies only to the earn-a-coin action.

### Activate an ability that consumes the turn

- Some characters have manually activated abilities that consume the turn's action. Whether an ability consumes the turn is specified by that ability rather than assumed for every effect.
- Such an ability replaces playing a card, making a normal attack, or earning a coin. Pay its stated costs, resolve the ability and its triggered effects, then end the turn.
- An example is spending a charge to attack three adjacent opposing characters. Its targeting and combat-resolution details remain to be defined.
- Automatic effects, including on-play abilities, do not consume an additional action. Playing a character that summons its copies for free resolves those summons within the original play action, then the turn ends.

## Combat and strength

- Current strength is both a character's attack damage and its remaining health.
- By default, character-versus-character combat deals damage simultaneously in both directions, using the characters' strengths immediately before the exchange.
- In that default exchange, each character loses strength equal to the other's damage.
- An attack or ability can override retaliation. Ranged attacks may deal damage without receiving damage in return; the specific attack or ability defines this behavior.
- Damage persists between turns. For example, a strength-5 character that takes 2 damage becomes strength 3 and subsequently deals 3 damage.
- Characters at zero or lower strength go to discard.
- A direct attack reduces the opposing player's coins by the attacker's current strength.
- Boosting strength increases both damage and survivability.

## Board position and neighbors

- Each player's characters form an ordered row.
- Players choose where to insert a character when playing it: before, between, or after existing characters.
- A character's neighbors are the immediately adjacent characters to its left and right in its owner's row.
- Some card effects may boost neighbors or cause them to attack as part of the resolving action.

### Placement interaction

- Select a character in hand to show insertion slots around the board's characters.
- Click an insertion slot to commit the play. An empty board has one slot.
- Selecting a card alone spends no coins. Escape or selecting it again cancels placement.
- Drag-and-drop is not required.

## Hidden and stealth

- Hidden is a state; stealth is an ability. A character can be hidden without having stealth.
- Characters with stealth enter play hidden automatically. Characters without stealth need an effect to become hidden.
- The owner sees their hidden character's full card, including its strength and abilities, with an eye indicator marking the hidden state. The opponent sees only a closed-eye placeholder instead of the card interface.
- Hidden characters cannot be targeted by attacks or effects.
- Hidden characters can initiate attacks and may bypass defenders to attack the opposing player directly, whether or not they have stealth. Attacking reveals them.
- Effects that do not select individual targets, such as “damage all enemy characters,” can affect hidden characters.
- Hidden characters do not protect their player from ordinary direct attacks.
- Attacking a character or player reveals a hidden attacker.
- Manually activating an ability reveals the character, even if the ability deals no damage. Passive effects do not reveal it.
- At the end of its owner's turn, a character with stealth regains hidden if it neither attacked nor used an activated ability during that turn.
- Consequently, a stealth character that attacks remains exposed throughout the opponent's next turn. If it sits out its owner's following turn, it becomes hidden at that turn's end.
- Hidden characters without stealth do not automatically regain hidden after being revealed.

## Victory

- The primary win condition is depleting the opponent's coins.
- A player whose coins reach zero loses immediately, including when paying a card's cost. Spending coins therefore competes with preserving the resource that keeps the player alive.
- If paying a card's cost reduces its player's coins to zero, the duel ends before that card's effects resolve. A pending income or healing effect cannot prevent this defeat.
- There is no board-points victory condition.

## Card effects

Planned effect concepts include:

- Summoning another copy if one exists and specified conditions are met.
- Summoning a character automatically for free under specified conditions.
- Boosting self or neighboring characters.
- Making neighboring characters attack.
- Generating or stealing coins.
- Applying hidden or other statuses.

These concepts are supported design directions; their exact triggers, targets, timing, and amounts still need individual card definitions.

## Presentation

- Cards initially use text, rounded boxes, and modest shadows, with no card images or sprites.
- Cards are two-sided, with identifying information and character strength on the front and a generic diagonal-striped back.
- Draw: appear in the deck, flip, and move to hand.
- Play: move from hand to board.
- Remove: flip and move to discard.
- Desired feedback includes a glow for boosts and a shake for damage. Animation should stay minimal and run smoothly on an ordinary laptop.
- Hidden characters use the closed-eye presentation described above.

## Open decisions

- Starting coin amount, first-player selection, and eventual deck-size limits.
- Handling of simultaneous defeat and negative coin totals.
- Whether a player can pass when they have no legal action, and how stalemates or endless earn/attack cycles are handled.
- Hand and board size limits, if any.
- What information the opponent can inspect after a previously revealed character becomes hidden again.
- Detailed activated-ability costs, targeting, and any limits on abilities that do not consume the turn.
- For each multi-target attack, including the charged attack against three adjacent characters: valid targets, whether combat is simultaneous or sequential, and whether it permits retaliation. These details belong to the specific attack or ability.
- Target selection, order, and eligibility for attacks granted to neighbors, including whether a hidden participant is revealed and how deaths affect remaining attacks.
- Ordering of simultaneous triggers, automatic summons, deaths, and other chained effects.
- Exact mechanics for counter, stunned, and future statuses.
