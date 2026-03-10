# WORLD1_SLICE2_CONTRACT

## Purpose
Define the exact **behavior-preserving** extraction contract for Slice 2: authored World 1 text/config surfaces only.

## Scope boundary
- In scope: static authored text/copy/templates/labels tied to World 1 flows.
- Out of scope: gameplay logic, control flow, combat behavior, World 2+ surfaces, save logic changes.

## Exact first extraction targets (in order)

### Target A — World 1 map node labels and IDs (text-like map config)
Current host location: `index.html` world-map tile definitions for World 1 (`id`, `label` pairs such as `1-1`, `Ed Wakes Up`, etc.).

Extract:
- World 1 tile label strings and associated static IDs for map presentation.
- Keep map traversal logic and node unlock logic in `index.html`.

Why safe:
- Static authored labels/IDs only.
- No movement/unlock control flow extracted.

### Target B — World 1 broadcast/notification authored copy arrays
Current host location: `index.html` authored text arrays used as display copy (example: `WS_TEXTS` and closely related World 1-facing copy pools).

Extract:
- Static text arrays and templates used only for display selection.
- Preserve selection/randomization logic and timer logic in `index.html`.

Why safe:
- Data-only text pools; no simulation behavior.

### Target C — Receipt and ad-readable template text constants (World 1 relevant surfaces only)
Current host location: `index.html` receipt/ad display line templates and fixed labels.

Extract:
- Static line fragments and fixed headings used by receipt/notification renderers.
- Keep branching logic, costs, outcome routing, and ad state mutations in `index.html`.

Why safe:
- Template strings only; no branch or economy behavior moved.

### Target D — Institutional overlay labels and non-interactive prompt copy (World 1-facing)
Current host location: fixed UI label strings in HUD/help overlays where values are static.

Extract:
- Static UI labels, tip strings, and institutional overlay captions tied to World 1.
- Keep input handling and scene transitions in `index.html`.

Why safe:
- Display-only copy constants.

## Recommended new files and locations

1. `src/world1/text/world1_map_labels.js`
   - Exports static World 1 node IDs + labels.

2. `src/world1/text/world1_broadcast_copy.js`
   - Exports World 1 WS/broadcast static text arrays.

3. `src/world1/text/world1_receipt_templates.js`
   - Exports receipt/ad display headings and line templates (static text only).

4. `src/world1/text/world1_overlay_labels.js`
   - Exports static institutional/HUD labels and tip text used in World 1-facing surfaces.

> Keep file split obvious and literal. No abstraction helpers in Slice 2.

## What stays in index.html for now
- Core movement/jump/combat behavior.
- Boss behavior logic.
- Tram-run behavior.
- World map traversal/unlock logic.
- Save pipeline logic beyond existing static key constants.
- Mounted combat dependency wiring.
- All World 2+ text/config.

## Fallback pattern requirements (mandatory)
For each extracted text/config domain:
1. Use `window.CEHP_WORLD1_*` namespace object from external file.
2. In `index.html`, read from namespace first.
3. Keep full inline literal fallback (never `{}`) containing original data.
4. Preserve original key names and shapes.
5. Load external script before inline consumer block.

Example pattern:
```js
var WORLD1_MAP_LABELS = (window.CEHP_WORLD1_TEXT && window.CEHP_WORLD1_TEXT.MAP_LABELS)
  ? window.CEHP_WORLD1_TEXT.MAP_LABELS
  : { /* full original literal fallback */ };
```

## Parity checks required

### Static checks
- `node --check` for each new Slice 2 file.
- Keep and run Slice 1 validator: `node scripts/check_world1_slice1_surface.js`.
- Add `scripts/check_world1_slice2_text_surface.js` to assert presence of required keys/labels/templates.

### Path checks
- Verify all local script `src` references in `index.html` resolve.

### Runtime smoke checks (manual)
- Title → WorldMap.
- Enter Level 1-1.
- Verify World 1 node labels render correctly.
- Verify World 1 notification/broadcast text still appears.
- Verify ad/receipt readable lines render with unchanged semantics.

## Red lines (NO-GO)
- Any extraction that changes control flow.
- Any extraction that mutates gameplay state semantics.
- Any extraction touching combat mounted dependency wiring.
- Any extraction of World 2+ copy in Slice 2.
- Any fallback downgraded to `{}` or partial literal.
- Any refactor that renames canonical keys consumed by existing logic.

## Contamination check
- No non-Cactus-Ed cross-project material identified in the targeted Slice 2 surfaces reviewed for this contract.
- If unfamiliar/non-bloodline text blocks are encountered during implementation, stop and flag before extraction.

## Go / No-Go
- **GO** if implementation remains data-only and fallback-complete with parity checks above.
- **NO-GO** if extraction requires touching logic branches, timers, routing, or combat/racing scope.
