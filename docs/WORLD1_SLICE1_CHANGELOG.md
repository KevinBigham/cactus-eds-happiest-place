# WORLD1_SLICE1_CHANGELOG

## What was extracted
- Added `src/world1/constants/runtime_surface.js` for low-risk constants:
  - `GFX_BASELINE_SHOT_NAMES`
  - `SCENE_KEYS`
  - `BEAT_KEYS`
  - `ALERT_COLORS`
  - `SFX_KEYS`
  - `SAVE_KEYS`
- Added `scripts/check_world1_slice1_surface.js`.
- Wired `index.html` to load the runtime surface file and consume these constants.

## What was left in index.html
- Core gameplay, movement, and scene logic.
- Combat dependency mounting includes.
- Boss logic and cross-world systems.

## Why this extraction is safe
- Extracted surfaces are static constants and identifiers.
- No algorithmic logic was moved.
- Full inline fallback literals remain in `index.html` for safety.

## Parity checks used
- `node scripts/check_world1_slice1_surface.js`
- `node --check src/world1/constants/runtime_surface.js`
- `node --check scripts/check_world1_slice1_surface.js`
- Local script-path existence check for `index.html`
