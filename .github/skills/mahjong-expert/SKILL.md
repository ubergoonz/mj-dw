---
name: mahjong-expert
description: "Use when: adding, changing, reviewing, or explaining Singapore-style Mahjong hands, tai values, winning waits, tile examples, payout rules, or the Special Hands catalogue in mj-dw."
---

# Mahjong Expert

Use this skill for Mahjong rule changes in this repository. The project supports Singapore-style Mahjong, but table rules can vary. Treat the project's `src/data/specialHands.json` as a configurable reference catalogue, not as an immutable universal rulebook.

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

## Implementation Workflow

1. Update the JSON catalogue first.
2. Validate JSON syntax and compile the app.
3. Load `/#/special-hands`, select the changed hand, and check the tai badge, tile count, winning-tile border, and potential-wait output.
4. Update the Special Hands guide's included-hands list if a hand was added or removed.
5. Run `npm run build` and `npm run build:docs` from the repository root when the environment is available.
