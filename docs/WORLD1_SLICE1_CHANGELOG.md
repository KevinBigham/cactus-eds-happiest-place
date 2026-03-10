# WORLD1_SLICE1_CHANGELOG

## What was extracted
- Extracted low-risk runtime surface constants from `index.html` into `src/world1/constants/runtime_surface.js`:
  - `GFX_BASELINE_SHOT_NAMES`
  - `SCENE_KEYS`
  - `BEAT_KEYS`
  - `ALERT_COLORS`
  - `SFX_KEYS`
  - `SAVE_KEYS`
- Wired `index.html` to load the new module via `<script src="src/world1/constants/runtime_surface.js"></script>`.
- Updated `index.html` to consume extracted constants from `window.CEHP_WORLD1_RUNTIME_SURFACE` with inline fallback literals for parity safety.
- Added `scripts/check_world1_slice1_surface.js` to validate presence of critical extracted keys and IDs.

## What was left in index.html
- Core movement, jump, combat, and scene behavior logic.
- Mounted combat runtime dependency includes (`legacy/quarantine/combat/**`).
- Tram/core gameplay systems, cross-world behavior, and boss behavior logic.
- Save pipeline logic (only save key constants were extracted).

## Why each extraction was considered safe
- All extracted domains are static key maps / labels / IDs / text-like surfaces.
- No extraction changed control flow or algorithmic gameplay behavior.
- Fallback literals remain in `index.html` for low-risk runtime continuity if module load fails.
- Module is loaded before inline runtime script executes.

## What parity checks were used
- `node scripts/check_world1_slice1_surface.js` (ensures extracted file has required keys and beat IDs).
- Local script path check for `index.html` references.
- Syntax checks:
  - `node --check src/world1/constants/runtime_surface.js`
  - `node --check index.html` (not run; HTML, not JS)
- Runtime-preservation expectation: no intentional gameplay behavior change in this slice.
