# WORLD1_SLICE2_CHANGELOG

## What was extracted

Extracted authored text and static config arrays from `index.html` into four new ES5 IIFE modules under `src/world1/text/`, all publishing to `window.CEHP_WORLD1_TEXT`:

### src/world1/text/world1_map_labels.js
- `W1_ROWS` — World 1 map grid layout (10 rows of tile characters)
- `W1_TILES` — Tile-type definitions with level labels and IDs (10 tile defs)

### src/world1/text/world1_broadcast_copy.js
- `NEWS_TICKER` — World 1 map news ticker headlines (30 items)
- `WS_TEXTS` — Wonder Showzen confrontational overlay text + canon lore drops (42 items)
- `ANOMALY_MSGS` — Map anomaly/glitch messages (8 items)
- `WP_KOANS` — Possessed-cat enlightenment lines (6 items)

### src/world1/text/world1_receipt_templates.js
- `COMMERCIALS` — Commercial break ad templates with id, lines, bgColor, fgColor, weight (10 entries)
- `RASTA_BOSS_TRAUMA` — Rasta Corp CEO monologue text (7 items)

### src/world1/text/world1_overlay_labels.js
- `WS_CAT_SPEECH` — NPC cat dialogue pool (57 items)
- `WS_KID_QUOTES` — Beat-cat dialogue / kid voice (15 items)
- `BEAT_CAT_LINES` — Alias for WS_KID_QUOTES (preserved in both module and fallback)
- `CAT_ARCHETYPES` — Per-archetype cat personality data: name, speech[], petResponse[], wsStates[] (6 archetypes)

## What was left in index.html

- All gameplay logic: movement, jump, combat, scene transitions, boss behavior
- Map traversal/unlock logic (`_canWalkTo`, `_enterLevel`, etc.)
- `_getCatArchetype()` function (contains hash logic)
- `updateCatWsState()` function (state machine logic)
- Timer/selection logic for WS text display (`_wsTimer`, `Math.random()` selection)
- `_flash()`, `_showToast()`, `_showReceipt()`, `_showModal()` display functions
- `CommercialBreakScene`, `RastaCorpAdScene` classes with all branching logic
- `WS_MSGS` (~180 items — cross-world shared, deferred to Slice 3)
- `ED_LINES`, `CAT_NAMES`, `JOURNAL_LIBRARY`, `shopItems`, `_arcadeItems`
- Mounted combat dependency wiring (`legacy/quarantine/combat/**`)
- All World 2+ text/config surfaces (`W2_MAP_NEWS`, `W3_MAP_NEWS`, W2-W6 tiles/rows)

## How index.html consumes extracted data

Each variable uses the conditional lookup + full inline fallback pattern from Slice 1:

```javascript
var NEWS_TICKER = (window.CEHP_WORLD1_TEXT&&window.CEHP_WORLD1_TEXT.NEWS_TICKER)
  ? window.CEHP_WORLD1_TEXT.NEWS_TICKER
  : [ /* full original array literal */ ];
```

Special cases:
- `BEAT_CAT_LINES` fallback references the already-resolved `WS_KID_QUOTES` variable
- `WP_KOANS` is a local var inside a function body; uses same pattern inline

## Script load order

Four new `<script>` tags added after `src/world1/constants/runtime_surface.js` (Slice 1) and before font preconnect links:

```html
<script src="src/world1/text/world1_map_labels.js"></script>
<script src="src/world1/text/world1_broadcast_copy.js"></script>
<script src="src/world1/text/world1_receipt_templates.js"></script>
<script src="src/world1/text/world1_overlay_labels.js"></script>
```

## Parity checks

- `node scripts/check_world1_slice2_text_surface.js` — validates all 4 files contain required tokens
- `node --check` on all 4 new .js files — syntax validation
- All local `<script src="...">` paths in index.html resolve to existing files
- No ES6 syntax in any extracted file

## Why each extraction was considered safe

- All targets are authored text or static display config (no control flow, no mutation)
- Consumed via index lookup or iteration — no branching logic in the data
- Full inline fallback literals prevent silent failure if any module fails to load
- Extraction is reversible: removing script tags and conditional wrappers restores original state
- Cross-world contamination prevented: WS_MSGS excluded (shared across all 6 worlds)
