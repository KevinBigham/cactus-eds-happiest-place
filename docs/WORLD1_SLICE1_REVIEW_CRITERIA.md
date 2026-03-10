# WORLD 1 SLICE 1 — REVIEW CRITERIA
## Cactus Ed's Happy Place — Approval Gate for Behavior-Preserving Extraction
### Authority: Claude Opus 4.6, Architect Guard
### Date: 2026-03-10
### Policy: `behavior_preserving_extraction_only`
### Depends on: DO_NOT_BREAK.md, ARCHITECT_REVIEW.md, ARCHITECT_IMPLEMENTATION_CLEARANCE.md

---

> This document defines what Slice 1 is allowed to do, what it is not allowed to do, how to verify the extraction preserved behavior, and what would trigger a hard stop. Any agent performing or reviewing Slice 1 must read this before proceeding.

---

## WHAT SLICE 1 IS

Slice 1 is a **structural extraction** pass. It takes code that currently lives inside the `index.html` monolith and moves it into separate `.js` files loaded via `<script>` tags — without changing what the code does.

The goal is modularization, not modernization. The game must behave identically before and after Slice 1. If a player cannot tell the difference, Slice 1 succeeded. If a player can tell the difference, Slice 1 failed.

---

## WHAT SLICE 1 IS ALLOWED TO CHANGE

### 1. File boundaries
Code may be moved from `index.html` into new `.js` files. The extracted files must be loaded via `<script>` tags in `index.html` in the correct dependency order.

### 2. Namespace wrapping
Extracted code may be wrapped in IIFEs or attached to named global objects (e.g., `window.CEHP_WORLD1 = {}`) to avoid polluting the global scope — provided the runtime behavior is identical.

### 3. Script loading order in `index.html`
New `<script src="...">` tags may be added to `index.html` to load extracted files. The order must respect dependency chains. No deferred or async loading unless the original code already used it.

### 4. Comment headers in extracted files
Each new file may include a header comment identifying its origin (e.g., `// Extracted from index.html — World 1 level scenes`). This is encouraged for traceability.

### 5. Whitespace and formatting in extracted code
Minor formatting normalization (consistent indentation, trailing whitespace removal) is acceptable in the extracted files only. Do not reformat code that stays in `index.html`.

---

## WHAT SLICE 1 IS NOT ALLOWED TO CHANGE

### RED LINE 1 — No gameplay behavior changes
No logic changes. No conditional changes. No timing changes. No order-of-execution changes. If a function did X before extraction, it must do exactly X after extraction. "Equivalent but cleaner" is not acceptable — it must be identical in effect.

### RED LINE 2 — No ED_MOVE constant modifications
```
walkSpeed: 140, jumpVel: -520, jumpCut: 0.4, airControl: 0.75,
coyoteMs: 90, jumpBufMs: 130, maxFall: 700,
punchRange: 56, kickRange: 72
```
These values must appear in the extracted code exactly as they appear in `index.html`. No rounding, no renaming to "equivalent" values, no refactoring the object structure they live in.

### RED LINE 3 — No reward value modifications
```
cat_pet: 5, aloe_pickup: 15, mochi_death: 8,
level_1_1_beat: 50, level_1_2_beat: 80,
boss_kill: 300+, secret_find: 20
```
All aloe reward values must be preserved exactly.

### RED LINE 4 — No creative content changes
No editing of dialogue strings, HUD labels, cat text, WS_TEXTS, Rasta Corp copy, level names, commercial break content, or any player-visible text. Extraction moves code; it does not edit content.

### RED LINE 5 — No ES6+ syntax introduction
Extracted code must remain ES5. `var`, `function(){}`, prototype OOP. No `const`, `let`, `=>`, `class`, template literals, destructuring, or any ES6+ feature. The extraction is structural, not syntactic.

**Rationale:** The old-repo ES5 constraint is acknowledged as legacy for future decisions, but Slice 1 is extracting FROM the old monolith. Introducing new syntax during extraction creates a diff that is impossible to review for behavior parity. Syntax modernization is a separate, future pass — not part of Slice 1.

### RED LINE 6 — No combat/ modifications
The 33 files in `combat/` and their `<script>` tags in `index.html` must not be touched. Combat is a mounted legacy dependency. Slice 1 does not extract, modify, reorganize, or even lint combat/ files.

### RED LINE 7 — No racing prototype modifications
`cehp_racing_goat.html`, `cehp_racing_only.html`, and `FZeroScene` code (if in `index.html`) must not be touched by Slice 1.

### RED LINE 8 — No build system introduction
No `package.json`, no `webpack.config.js`, no `vite.config.js`, no `tsconfig.json`, no bundler, no transpiler, no minifier. The project remains a flat collection of static files served by GitHub Pages.

### RED LINE 9 — No new dependencies
No new CDN links, no new libraries, no polyfills, no shims. The only external dependency is Phaser 3.70.0 loaded from the existing CDN URL.

### RED LINE 10 — No Phaser configuration changes
`Phaser.CANVAS` must remain forced. The `config` object passed to `new Phaser.Game(config)` must not change. Scene registration order must not change. The renderer, resolution, physics config, and scene list must be identical.

---

## BLOODLINE REVIEW QUESTIONS

After Slice 1 completes, the reviewing agent must answer every question below. If any answer is "no" or "unclear," the extraction has drifted and must be corrected before merge.

### Soul preservation
1. Does Ed still speak in short, deadpan lines with no exclamation marks?
2. Are all cat dialogue strings preserved exactly as they were?
3. Are all WS_TEXTS strings preserved exactly?
4. Are all institutional/HUD labels preserved exactly?
5. Are all Rasta Corp commercial break strings preserved exactly?

### Mechanical preservation
6. Are all ED_MOVE constants preserved with identical values?
7. Is coyote time still 90ms? Is jump buffer still 130ms?
8. Are all aloe reward values preserved exactly?
9. Are all hitbox dimensions, collision rectangles, and physics bodies unchanged?
10. Does the Phaser config object have identical properties?

### Structural preservation
11. Does `index.html` still load Phaser 3.70.0 from the same CDN URL?
12. Are all `<script>` tags for `combat/` files still present and in the same order?
13. Do new `<script>` tags for extracted files appear AFTER the Phaser CDN tag and BEFORE `new Phaser.Game(config)`?
14. Is the scene registration order in the Phaser config unchanged?
15. Are there zero ES6+ syntax tokens (`const`, `let`, `=>`, `class`, backtick strings) in any extracted file?

### Scope preservation
16. Were zero files in `combat/` modified?
17. Were zero racing files modified?
18. Was no build system or package manager introduced?
19. Was no new external dependency added?
20. Is the total line count of `index.html` + all extracted `.js` files approximately equal to the original `index.html` line count (~24,261)?

---

## BEHAVIOR-PARITY REVIEW QUESTIONS

These verify that the extraction did not change what the game does.

### Functional parity
1. **Title screen:** Does the title screen load? Does pressing Start transition to the World Map?
2. **World Map:** Does the World 1 map render with the correct tile grid? Does Ed walk between nodes? Do levels unlock sequentially?
3. **Level 1-1:** Can Ed move, jump, punch, kick? Do 8 mochis spawn? Do 5 cats appear? Does the controls HUD display for ~30 seconds? Does killing a mochi award the correct aloe?
4. **Level 1-2:** Is the room black with neon lasers? Are ALL cats dancing? Do mochis have sunglasses?
5. **Level 1-3:** Do WS_TEXTS fire every ~8 seconds? Is the night-KC vibe intact? Are smoker cats present?
6. **Level 1-4:** Is bus parallax rendering? Does the bus NOT occlude Ed?
7. **Level 1-5:** Does Big Mochi execute 3 phases (patrol → spawn → charge)? Does killing Big Mochi award 300+ aloe?
8. **Scene transitions:** Do all level-complete transitions return to the World Map? Does the beaten-level node update?

### Regression signals
9. **Console errors:** Are there zero new JavaScript errors in the browser console during a full World 1 playthrough?
10. **Undefined references:** Does `grep -r "undefined" *.js` in extracted files show zero instances of variables that lost their references during extraction?
11. **Global namespace:** Do all extracted functions and objects that were previously global remain accessible at the same paths? (e.g., if `createMochi` was `window.createMochi`, it must still be `window.createMochi` or equivalently reachable)
12. **Load order:** If file B depends on file A, is file A's `<script>` tag before file B's?

---

## WHAT WOULD TRIGGER A HARD STOP

Any of the following findings during review will block the Slice 1 extraction from merging:

| Trigger | Why it's fatal |
|---------|---------------|
| Any ED_MOVE constant has a different value | Breaks the mechanical covenant with the player |
| Any aloe reward value changed | Breaks the retention contract |
| Any player-visible string modified | Indicates content editing during extraction — scope violation |
| ES6+ syntax in any extracted file | Makes behavior-parity review impossible (different parse semantics) |
| `combat/` files touched | Scope violation — quarantined dependency |
| New dependency introduced | Architecture violation — flat static project |
| Build system file created | Architecture violation — no bundler, no transpiler |
| Phaser config object changed | Could alter renderer, resolution, physics, or scene order |
| Console errors during World 1 playthrough | Extraction broke something |
| Scene registration order changed | Could alter which scene loads first or how transitions route |
| Any function that was globally accessible is no longer reachable | Extraction broke a reference chain |
| `new Phaser.Game(config)` call modified or moved | This is the game's boot line — untouchable |

If even one trigger fires, the extraction must be rolled back and the specific issue fixed before re-review.

---

## POST-EXTRACTION CHECKLIST (for reviewing agent)

```
[ ] 1. Read this document in full before starting review
[ ] 2. Diff index.html (before vs after) — confirm only <script> tags and code removal
[ ] 3. Read every new .js file — confirm ES5 only, no logic changes
[ ] 4. Grep for ED_MOVE constants — verify exact values
[ ] 5. Grep for aloe reward values — verify exact values
[ ] 6. Grep for all player-visible strings from DO_NOT_BREAK.md — verify unchanged
[ ] 7. Verify combat/ directory is untouched (git diff combat/)
[ ] 8. Verify no package.json, webpack, vite, or tsconfig files exist
[ ] 9. Verify Phaser config object is identical
[ ] 10. Verify scene registration order is identical
[ ] 11. Load in browser — play Title → WorldMap → 1-1 → 1-2 → 1-3 → 1-4 → 1-5
[ ] 12. Check browser console for zero new errors
[ ] 13. Compare total line count (index.html + new files ≈ original index.html)
[ ] 14. Answer all 20 bloodline questions — all must be "yes"
[ ] 15. Answer all 12 behavior-parity questions — all must be "yes"
[ ] 16. If any answer is "no" — HARD STOP — do not merge
```

---

## SLICE 1 SCOPE BOUNDARY STATEMENT

Slice 1 extracts. It does not improve, optimize, modernize, refactor, or enhance. The only acceptable diff is:
- Code removed from `index.html`
- Identical code appearing in new `.js` files
- `<script>` tags added to `index.html` to load those files
- Optional IIFE/namespace wrapping that does not change behavior
- Optional file header comments for traceability

Anything beyond this list is out of scope and must be flagged during review.

---

*If the game plays the same, Slice 1 passed. If anything feels different, Slice 1 failed. There is no middle ground.*
