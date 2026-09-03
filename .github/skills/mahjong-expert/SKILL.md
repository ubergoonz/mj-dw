---
name: mahjong-expert
description: "Use when: adding, changing, reviewing, or explaining Singapore-style Mahjong hands, tai values, winning waits, tile examples, payout rules, or the Special Hands catalogue in mj-dw."
---

# Mahjong Expert

Use this skill for Mahjong rule changes in this repository. The project supports Singapore-style Mahjong, but table rules can vary. Treat the project's `src/data/specialHands.json` as a configurable reference catalogue, not as an immutable universal rulebook.

## Reference Baseline

Use the Singapore Mahjong overview from [The Smart Local](https://thesmartlocal.com/read/mahjong-rules-singapore/) as a practical beginner-facing reference. It is useful for table flow and terminology, but house rules take precedence for tai values, special hands, flower/animal payments, and payout caps.

## Singapore-Style Table Model

- A full set contains 148 tiles: three numbered suits (萬/Characters, 筒/Circles, 索/Bamboos), four winds, three dragons, four flowers, and four animals.
- Each numbered-suit tile, wind, and dragon has four copies. Flowers and animals are supplementary tiles and should not be treated as normal 14-tile hand sets.
- 東 is the dealer. Seat order is 東 → 南 → 西 → 北, with South on the dealer's right and West opposite East.
- The table wall uses 19 stacks for 東 and 西, and 18 stacks for 南 and 北. The in-game dice tool must preserve this layout.
- Play proceeds in seat order. The wall is drawn from clockwise; the dealer starts with 14 tiles and opens by discarding, while other players normally draw then discard.
- Flower and animal tiles go to the visible garden and require a replacement draw from the wall tail.

## Set And Claim Rules

- A chi is a three-tile sequence in one numbered suit. It may only claim a discard from the immediately preceding player.
- A pong is three matching tiles; a kong/gang is four matching tiles. Either may claim a matching discard from any player, subject to local timing rules.
- A set completed with a discard is exposed in the garden. A concealed set formed through self-draw may remain concealed.
- Do not claim that an exposed pong can be upgraded to a kong from another player's discard; the cited Singapore guide describes an upgrade only by self-draw.
- A normal winning hand is four completed sets plus one pair (eyes), unless the named special hand defines another structure.

## Tai And Payout Terminology

- Use **台 / Tai** in all visible app text, generated copy, documentation, and newly written comments. Do not introduce the word "fan" as a scoring term.
- Tai is a points multiplier/reference, not a universal fixed score. Keep payout base, tai range, self-draw bonuses, shooter rules, and caps configurable.
- Common Singapore-style payout bases include $0.30/$0.60 and $1/$2, but never hard-code one as mandatory.
- Self-draw, dragon/wind pongs, Men Qing, flowers/animals, and special hands may add tai or change payouts according to the active house rules.

## Source Of Truth

- Special-hand entries, tai values, rule notes, example layouts, and potential waits live in `src/data/specialHands.json`.
- The interface renders this catalogue in `src/pages/SpecialHands.tsx`.
- Standard Mahjong tile image glyphs are mapped in `src/lib/mahjongTileImage.ts`.
- Update `docs-site/docs/features/special-hands.mdx` whenever the catalogue changes.

## Required Validation

Before editing a special-hand example, state the intended hand structure and winning tile. Then check all of the following:

1. A standard winning hand has 14 tiles: four sets plus one pair.
2. A kong is four tiles. A four-kong hand such as 十八罗汉 has 18 displayed tiles: four kongs plus one pair.
3. No numbered, wind, or dragon tile can appear more than four times in one example.
4. A 七对子 example has exactly seven pairs.
5. A 十三幺 example contains all 13 distinct terminal/honor tiles plus a duplicate for the pair.
6. A 九莲宝灯 example uses one suit with the base pattern `1112345678999`, plus one additional tile of that suit.
7. The last item in `exampleTiles` is the winning tile and must genuinely complete the declared example.
8. `winningPotentialTiles` must list only valid alternative winning tiles for that exact partial hand. When it contains more than six tiles, the UI intentionally renders the explanatory note without extra tile images.
9. 筒 uses the Unicode Mahjong circle range `🀙`-`🀡`; 索 uses the bamboo range `🀐`-`🀘`.

## Tai Values And House Rules

- Do not present a tai value as universal. Retain a concise `ruleNote` that tells players which local condition can differ, such as concealed-only requirements, self-draw, discard claims, or payout caps.
- When a request supplies a tai value, use it. When it does not, use the existing catalogue's Singapore-style baseline only after checking whether a neighbouring rule establishes a local convention.
- Ask for clarification when a requested rule conflicts with the active table's stated rules or when a reliable baseline cannot be identified.

## Feature-Specific Checks

- **Wind Draw:** identifies 東 as dealer and displays the dealer marker after every completed draw.
- **Dice Roll:** supports independent two- and three-dice totals for table setup.
- **In-Game Dice Roll:** two-dice mode requires two rolls; the first selects the seat and the combined totals determine the wall break. Three-dice mode uses one roll for both decisions.
- **Tai Payout:** label ranges, rows, and generated content in 台/Tai. A base pair represents 閒家 / 出銃 at 0 台.
- **Side Bets:** describe flower, animal, and kong payments separately from winning-hand tai. Verify whether a rule is an immediate garden payment or a winning-hand modifier.
- **Beckon Invite:** its copied Chat and AI content must match the current form fields, selected rules, and tai terminology.

## Implementation Workflow

1. Update the JSON catalogue first.
2. Validate JSON syntax and compile the app.
3. Load `/#/special-hands`, select the changed hand, and check the tai badge, tile count, winning-tile border, and potential-wait output.
4. Update the Special Hands guide's included-hands list if a hand was added or removed.
5. Run `npm run build` and `npm run build:docs` from the repository root when the environment is available.
