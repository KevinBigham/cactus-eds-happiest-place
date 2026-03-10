# WORLD 1 SLICE 2 CONTRACT
## Behavior-Preserving Authored-Text Extraction
### Authority: Claude Opus 4.6, Architect Pass
### Date: 2026-03-10
### Depends on: Slice 1 complete (merged to main), docs/WORLD1_IMPLEMENTATION_LANE.md, docs/DO_NOT_BREAK.md

---

> This contract defines the exact scope, targets, file layout, fallback pattern, parity checks, and red lines for World 1 Slice 2. No implementation work may exceed what is specified here. If a question arises that this contract does not answer, stop and surface it to Kevin.

---

## EXACT FIRST EXTRACTION TARGETS

Slice 2 extracts **authored text and static config arrays** from `index.html` into four new ES5 IIFE modules. Every target is pure data — no control flow, no branching, no timer logic, no scene transitions.

### Target 1 — World 1 Map Labels and Grid Config

| Variable | Line (approx.) | Type | Item count | Description |
|----------|----------------|------|------------|-------------|
| `W1_ROWS` | 2589 | Array of strings | 10 rows | World 1 map grid layout (tile characters) |
| `W1_TILES` | 2602 | Object | 10 tile defs | Tile-type definitions including level labels and IDs |

**What is extracted:** The full `W1_ROWS` array and the full `W1_TILES` object, including all `type`, `passable`, `id`, and `label` properties.

**What stays in index.html:** All traversal logic (`_canWalkTo`, `_enterLevel`, etc.), unlock logic, save-state checking, Ed's map movement, and the WorldMapScene class itself. The map *uses* these data objects but the objects themselves are inert.

**Why safe:** `W1_ROWS` is a static string array defining grid layout. `W1_TILES` is a static lookup table mapping tile characters to display metadata. Neither is mutated at runtime. Neither contains branching logic.

### Target 2 — World 1 Broadcast and Notification Copy

| Variable | Line (approx.) | Type | Item count | Description |
|----------|----------------|------|------------|-------------|
| `NEWS_TICKER` | 2261 | Array of strings | 30 | World 1 map news ticker headlines |
| `WS_TEXTS` | 2619 | Array of strings | 42 | Wonder Showzen confrontational overlay text + canon lore drops |
| `ANOMALY_MSGS` | 2555 | Array of strings | 8 | Map anomaly/glitch messages |
| `WP_KOANS` | 4829 | Array of strings | 6 | Possessed-cat enlightenment lines |

**What is extracted:** The four arrays above — all authored text, no logic.

**What stays in index.html:** The `_wsTimer` firing logic, the `Math.random()` selection, the `_flash()` display function, the ticker scroll tween, the anomaly trigger conditions, and all world-map update loops that consume these arrays.

**Cross-world note:** `NEWS_TICKER` is World 1's dedicated ticker (W2 and W3 have their own: `W2_MAP_NEWS`, `W3_MAP_NEWS`). `WS_TEXTS` is used in World 1 levels. `ANOMALY_MSGS` is used on the World 1 map. `WP_KOANS` is used on the World 1 map for possessed-cat interaction.

**Scope decision — WS_MSGS excluded from Slice 2:** `WS_MSGS` (~180 items, lines 2297-2478) is consumed by **all six world maps and multiple level scenes** (WorldMap, Level11, Level12, WorldMap2, WorldMap3, WorldMap4, WorldMap5, WorldMap6). It is a shared global resource. Extracting it requires either a shared namespace or a cross-world module, which exceeds the "World 1 text" scope of this slice. `WS_MSGS` is a strong candidate for Slice 3.

**Why safe:** All four arrays are immutable authored text. They are consumed via index lookup (`array[Math.floor(Math.random()*array.length)]`) with no mutation. Extraction changes where the data lives, not how it behaves.

### Target 3 — Receipt/Ad Template Text

| Variable | Line (approx.) | Type | Item count | Description |
|----------|----------------|------|------------|-------------|
| `COMMERCIALS` | 2812 | Array of objects | 10 entries | Commercial break ad templates (id, lines, bgColor, fgColor, weight) |
| `RASTA_BOSS_TRAUMA` | 2754 | Array of strings | 7 | Rasta Corp CEO monologue text for RastaCorpAd scene |

**What is extracted:** The full `COMMERCIALS` array (including `id`, `lines`, `bgColor`, `fgColor`, and `weight` per entry — these are all static display config, not logic). The full `RASTA_BOSS_TRAUMA` array.

**What stays in index.html:** The `CommercialBreakScene` class and its `_setChoice()` branching logic, the receipt display function `_showReceipt()`, the `RastaCorpAdScene` class, all choice/outcome logic (SELLOUT/SUBVERT/CHAOS), chaos cost calculations, and the `JOURNAL_LIBRARY` object (mixed text + game-state config — too entangled for Slice 2).

**Why safe:** `COMMERCIALS` is a static array of display templates. Each entry's `lines` array is pure authored text. The `bgColor`/`fgColor` are display constants (hex values), not behavior. `weight` is a static selection-probability hint, not runtime logic. `RASTA_BOSS_TRAUMA` is a flat string array consumed by index lookup.

### Target 4 — Institutional Overlay Labels and Cat Dialogue

| Variable | Line (approx.) | Type | Item count | Description |
|----------|----------------|------|------------|-------------|
| `WS_CAT_SPEECH` | 2479 | Array of strings | 57 | NPC cat dialogue pool |
| `WS_KID_QUOTES` | 2536 | Array of strings | 15 | Beat-cat dialogue (kid voice) |
| `CAT_ARCHETYPES` | 2765 | Array of objects | 6 archetypes | Per-archetype cat personality: `name`, `speech[]`, `petResponse[]`, `wsStates[]` |

**What is extracted:** All three variables above.

**Note on `BEAT_CAT_LINES`:** Line 2553 defines `var BEAT_CAT_LINES = WS_KID_QUOTES;` (alias). The extraction must preserve this alias by defining `BEAT_CAT_LINES` as a reference to the extracted `WS_KID_QUOTES` in the same namespace.

**Note on `CAT_ARCHETYPES`:** Each archetype object contains `name` (string), `speech` (string array), `petResponse` (string array), and `wsStates` (string array of behavior state names like `'speech'`, `'stare'`, `'dance'`, `'levitate'`, `'vibrate'`, `'philosophize'`, `'normal'`). The `wsStates` arrays are behavior-state *names* consumed by a state machine in index.html — they are authored labels, not logic. The state machine that interprets them stays in index.html.

**What stays in index.html:** The `_getCatArchetype(catIndex)` function (hashes cat name to select archetype), the `updateCatWsState()` function (state machine that reads `wsStates`), all cat rendering, pet interaction handlers, and the beat-cat tile interaction at position (2,6).

**Scope decision — shop/arcade labels excluded:** `shopItems` (13 entries) and `_arcadeItems` (7 entries) contain authored labels but also `cost`, `key`, and `scene` fields that are consumed by purchase/navigation logic. Extracting just the labels would split the object definition unnaturally. These are candidates for a future slice that extracts "game config objects" holistically.

**Why safe:** `WS_CAT_SPEECH` and `WS_KID_QUOTES` are flat string arrays with no mutation. `CAT_ARCHETYPES` is a static array of personality profiles — all fields are authored text or state-name labels. None contain functions, callbacks, or mutable state.

---

## RECOMMENDED NEW FILE NAMES AND LOCATIONS

All files go under `src/world1/text/`. Each follows the ES5 IIFE pattern established by Slice 1.

```
src/world1/text/
├── world1_map_labels.js       ← W1_ROWS, W1_TILES
├── world1_broadcast_copy.js   ← NEWS_TICKER, WS_TEXTS, ANOMALY_MSGS, WP_KOANS
├── world1_receipt_templates.js ← COMMERCIALS, RASTA_BOSS_TRAUMA
└── world1_overlay_labels.js   ← WS_CAT_SPEECH, WS_KID_QUOTES, BEAT_CAT_LINES, CAT_ARCHETYPES
```

### Namespace

All four files publish to `window.CEHP_WORLD1_TEXT`:

```javascript
(function(root){
  var ns = root.CEHP_WORLD1_TEXT || {};
  // ... assign keys ...
  root.CEHP_WORLD1_TEXT = ns;
})(window);
```

This is a separate namespace from Slice 1's `window.CEHP_WORLD1_RUNTIME_SURFACE` because these are authored-text surfaces, not runtime constants.

### Script Load Order in index.html

The four new `<script>` tags must appear **after** the Slice 1 runtime_surface.js tag and **before** the inline `<script>` that defines the game code. Suggested insertion point: immediately after `<script src="src/world1/constants/runtime_surface.js"></script>`.

```html
<script src="src/world1/text/world1_map_labels.js"></script>
<script src="src/world1/text/world1_broadcast_copy.js"></script>
<script src="src/world1/text/world1_receipt_templates.js"></script>
<script src="src/world1/text/world1_overlay_labels.js"></script>
```

---

## WHAT STAYS IN INDEX.HTML

These must NOT move in Slice 2:

| Category | Why it stays |
|----------|-------------|
| Core movement/jump/combat behavior | Gameplay logic, not text |
| Boss behavior logic and tram-run behavior | Gameplay logic |
| World map traversal/unlock logic | Control flow that reads map data — the data moves, the logic stays |
| Save pipeline logic | Stateful, mutates `EWR_STATE` |
| Mounted combat dependency wiring (`legacy/quarantine/combat/**` script tags) | Quarantined legacy dependency |
| All World 2+ text/config surfaces (`W2_MAP_NEWS`, `W3_MAP_NEWS`, W2-W6 tiles/rows, etc.) | Out of World 1 scope |
| `WS_MSGS` (~180 items) | Cross-world shared resource — Slice 3 candidate |
| `ED_LINES` (Ed's dialogue) | Tied to Ed's voice rules; warrants its own extraction review |
| `CAT_NAMES` (sassy cat name pool) | Consumed by archetype hash function; extract with `_getCatArchetype` in a future slice |
| `JOURNAL_LIBRARY` | Mixed text + game-state config; too entangled for pure-text extraction |
| `shopItems` / `_arcadeItems` | Labels + cost/key/scene config interleaved; extract as config objects in a future slice |
| `_showReceipt()`, `_showToast()`, `_showModal()`, `_flash()` | Display logic functions, not text data |
| `CommercialBreakScene` / `RastaCorpAdScene` classes | Scene classes with branching logic |

---

## FALLBACK PATTERN REQUIREMENTS

Every extracted variable must be consumed in index.html using the **conditional lookup with full inline fallback literal** pattern established by Slice 1:

```javascript
var W1_TILES = (window.CEHP_WORLD1_TEXT && window.CEHP_WORLD1_TEXT.W1_TILES)
  ? window.CEHP_WORLD1_TEXT.W1_TILES
  : {
    // FULL original literal here — every key, every value
    ' ':{type:'empty',   passable:true},
    'G':{type:'grass',   passable:true},
    // ... all 10 tile definitions ...
  };
```

### Non-negotiable fallback rules:
1. **Full literal fallback.** Never `{}`, never `[]`, never `null`. The fallback must be byte-identical to the original value.
2. **Every extracted variable gets its own conditional.** Do not batch multiple variables into one conditional.
3. **`BEAT_CAT_LINES` alias preserved.** After extracting `WS_KID_QUOTES`, the alias line becomes:
   ```javascript
   var BEAT_CAT_LINES = (window.CEHP_WORLD1_TEXT && window.CEHP_WORLD1_TEXT.BEAT_CAT_LINES)
     ? window.CEHP_WORLD1_TEXT.BEAT_CAT_LINES
     : WS_KID_QUOTES;
   ```
   The fallback references the already-resolved `WS_KID_QUOTES` variable (which itself has a full fallback).
4. **`CAT_ARCHETYPES` fallback includes all fields** — `name`, `speech`, `petResponse`, `wsStates` for all 6 archetypes.
5. **`COMMERCIALS` fallback includes all fields** — `id`, `lines`, `bgColor`, `fgColor`, and `weight` where present.

---

## PARITY CHECKS

### Automated parity checker: `scripts/check_world1_slice2_text.js`

A Node.js script (similar to `scripts/check_world1_slice1_surface.js`) that:
1. Reads all four extracted .js files.
2. Validates the presence of required tokens in each file.

**Required token checks:**

| File | Must contain |
|------|-------------|
| `world1_map_labels.js` | `CEHP_WORLD1_TEXT`, `W1_ROWS`, `W1_TILES`, `Ed Wakes Up`, `The Cat Rave`, `Daikon District`, `Hippie Bus Highway`, `Daikon's Heartbreak`, `THE VOID`, `portal-W2` |
| `world1_broadcast_copy.js` | `CEHP_WORLD1_TEXT`, `NEWS_TICKER`, `WS_TEXTS`, `ANOMALY_MSGS`, `WP_KOANS`, `CONSUME`, `ARE YOU REAL?`, `MANDELA SAYS HI` |
| `world1_receipt_templates.js` | `CEHP_WORLD1_TEXT`, `COMMERCIALS`, `RASTA_BOSS_TRAUMA`, `aloe_max`, `rasta_corp`, `void_realty`, `I MONETIZED PEACE` |
| `world1_overlay_labels.js` | `CEHP_WORLD1_TEXT`, `WS_CAT_SPEECH`, `WS_KID_QUOTES`, `BEAT_CAT_LINES`, `CAT_ARCHETYPES`, `anxious`, `nihilistic`, `spiritual`, `street-smart`, `optimistic`, `chaotic` |

### Manual verification (implementation agent must confirm):
- `node --check` passes for all four new .js files
- All local `<script src="...">` paths in index.html resolve to existing files
- Every extracted variable in index.html uses the full inline fallback pattern (not `{}` or `[]`)
- `W1_TILES` fallback has all 10 tile definitions
- `NEWS_TICKER` fallback has all 30 headlines
- `WS_TEXTS` fallback has all 42 items
- `COMMERCIALS` fallback has all 10 commercial entries with `lines`, `bgColor`, `fgColor`
- `CAT_ARCHETYPES` fallback has all 6 archetypes with `speech`, `petResponse`, `wsStates`
- `BEAT_CAT_LINES` alias is preserved (references `WS_KID_QUOTES` in fallback)
- No ES6 syntax (`const`, `let`, `=>`, `class`) in any extracted file

---

## RED LINES

These are hard stops. If any of these are true, the implementation has drifted and must be corrected before merge.

| # | Red line | Why |
|---|----------|-----|
| 1 | Any extracted file contains `function` calls, `if` statements, `for` loops, or `setTimeout`/`setInterval` | Slice 2 is data-only. Logic stays in index.html. |
| 2 | Any fallback literal is `{}`, `[]`, or `null` instead of the full original value | Silent gameplay death if module fails to load. |
| 3 | `ED_MOVE` constants are modified | Sacred feel constants — Slice 2 does not touch these. |
| 4 | Reward values (aloe tiers) are modified | Retention covenant — Slice 2 does not touch these. |
| 5 | Combat script tags or `legacy/quarantine/combat/**` files are modified | Quarantined dependency — Slice 2 does not touch these. |
| 6 | World 2+ text or config is extracted | Out of scope. World 1 only. |
| 7 | `WS_MSGS` is extracted in this slice | Cross-world shared resource — deferred to Slice 3. |
| 8 | Any new creative content is authored (new headlines, new cat dialogue, etc.) | Slice 2 extracts existing text. It does not add text. |
| 9 | `_getCatArchetype()` function is moved out of index.html | It contains logic (hash function). Only the data it reads moves. |
| 10 | ES6 syntax appears in any extracted file or in the index.html consumption pattern | ES5 only in all runtime code. |
| 11 | `JOURNAL_LIBRARY` is extracted | Too entangled — mixed text + game-state config. Deferred. |

---

## WHY THESE TARGETS ARE SAFE

1. **All targets are authored text or static display config.** They are consumed by random-index lookup or iteration. They do not branch, mutate, or affect game state.

2. **The Slice 1 extraction pattern is proven.** Conditional lookup with full inline fallback was merged to main and verified. Slice 2 applies the same pattern to text arrays.

3. **No target contains gameplay logic.** Map traversal logic reads `W1_TILES` but does not live inside it. Commercial branching logic reads `COMMERCIALS` but does not live inside it. The data is inert.

4. **Failure mode is graceful degradation.** If any extracted module fails to load, the inline fallback provides byte-identical data. The game runs exactly as before. No silent failure, no empty arrays, no missing content.

5. **The extraction is reversible.** Removing the `<script>` tags and the conditional wrappers returns index.html to its pre-extraction state. No data is lost.

6. **Cross-world contamination is explicitly prevented.** `WS_MSGS` (shared across all worlds) is excluded. Only World 1-specific or World 1-primary text moves.

---

## DELIVERABLES CHECKLIST

When Slice 2 implementation is complete, the following must exist:

- [ ] `src/world1/text/world1_map_labels.js` — ES5 IIFE, publishes to `window.CEHP_WORLD1_TEXT`
- [ ] `src/world1/text/world1_broadcast_copy.js` — ES5 IIFE, publishes to `window.CEHP_WORLD1_TEXT`
- [ ] `src/world1/text/world1_receipt_templates.js` — ES5 IIFE, publishes to `window.CEHP_WORLD1_TEXT`
- [ ] `src/world1/text/world1_overlay_labels.js` — ES5 IIFE, publishes to `window.CEHP_WORLD1_TEXT`
- [ ] `scripts/check_world1_slice2_text.js` — parity checker
- [ ] `docs/WORLD1_SLICE2_CHANGELOG.md` — extraction record
- [ ] `index.html` — 4 new `<script>` tags + conditional consumption with full inline fallbacks for all extracted variables
- [ ] All verification tasks pass (syntax checks, parity checker, script path check, fallback audit)

---

## FUTURE SLICE CANDIDATES (NOT IN SCOPE)

These are noted for planning purposes only. They are NOT approved for Slice 2.

| Candidate | Why deferred |
|-----------|-------------|
| `WS_MSGS` (~180 items) | Cross-world shared resource. Needs shared namespace or cross-world module strategy. |
| `ED_LINES` (Ed's dialogue) | Tied to Ed's voice rules. Extraction warrants its own creative review to ensure fallback preserves voice fidelity. |
| `CAT_NAMES` (sassy name pool) | Consumed by `_getCatArchetype()` hash function. Extract together with the function in a future config slice. |
| `JOURNAL_LIBRARY` | Mixed authored text + game-state config + faction/branch/outcome metadata. Needs schema review before extraction. |
| `shopItems` / `_arcadeItems` | Labels interleaved with cost/key/scene config. Extract as full config objects, not text-only. |
| Level-scene flash text (e.g. `'ED WAKES UP'`) | Hardcoded in scene create methods. Extraction requires auditing all level scenes. |
| Combat ticker pool (`tickerPool` in BALANCE) | Level 1-5 combat-adjacent. Quarantine-adjacent scope. |

---

*This contract is the single source of truth for Slice 2 scope. Do not exceed it. Do not invent beyond it. If something is not listed here, it is not in Slice 2.*
