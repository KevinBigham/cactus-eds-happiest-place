# Cactus Ed General State Of The Game

Last updated: 2026-03-04

## 1) Build Snapshot

- Repo: `KevinBigham/Cactus-Eds-Happy-Place`
- Live: https://kevinbigham.github.io/Cactus-Eds-Happy-Place/
- Primary runtime file: `index.html` (single-file architecture)
- Engine: Phaser 3.70.0
- Coding style: ES5/prototype style
- Render baseline: Canvas-first with optional WebGL path via feature flags

## 2) Current Major Systems

### Deterministic Fight Core (Level15)
- Fixed-step deterministic sim at 60 Hz.
- Input log/replay + snapshot/restore + state hash in place.
- Debug tools active (hitboxes, pause/step, slow-mo, determinism runners).
- MK-GBA-inspired fight HUD/VFX/tuning path exists behind fight flags.

### Atmosphere System (Level15 v2.8)
- AtmosphereV2 with strict 5-layer stack:
  - L1 Atmosphere
  - L2 Background Structure
  - L3 Midground Structure
  - L4 Gameplay/props backing
  - L5 Foreground Occluders
- Deterministic material-tagged generation:
  - `ROCK`, `TECH`, `ORGANIC`, `RUINS`
- Palette families:
  - `CAVERN_DEPTH`
  - `BIO_CHAMBER`
  - `MAGMA_CORE`
  - `SUBMERGED_FACILITY`
  - `DERELICT_HUB`
- Dedicated lab scene: `Level15AtmosLab` (title hotkey `B`)

### MainMode Engine (Level16 branch work)
- Determinism-friendly platformer engine with fixed-tick option.
- Feel Lab + micro slice scenes included.
- Limb economy, sacrifice mechanics, and pacing scaffolding integrated.

### Save/State Safety
- Save versioning/migration framework already present.
- Save manager + slot/backup systems present.
- Deterministic RNG infrastructure exists behind flags.

## 3) Important Runtime Flags (high value)

- `FEATURE_FLAGS.fighterEngineV2`
- `FEATURE_FLAGS.fightMkGbaMode`
- `FEATURE_FLAGS.metroidAtmosphereMode`
- `FEATURE_FLAGS.metroidAtmosphereWebGL`
- `FEATURE_FLAGS.metroidAtmosphereCanvasFallback`
- `FEATURE_FLAGS.mainMode`

## 4) What Is Stable vs In Progress

### Stable enough to iterate on
- Core scene routing and progression baseline.
- Level15 deterministic combat loop.
- Save/load framework and migration backbone.
- AtmosphereV2 rendering integration and lab scene plumbing.

### Still actively evolving
- Global visual consistency pass across non-Level15 scenes.
- Deep balancing of combat, minigames, and economy.
- Broader deterministic soak/perf sweeps across all scene families.

## 5) Known Watchlist

- Renderer mode now may select WebGL automatically depending on atmosphere flag; verify on low-end/mobile targets.
- Atmosphere draw-call budget is instrumented but should be monitored in heavy scenes.
- Keep F8 hotkey behavior reviewed when adding new scene-local debug binds.

## 6) Operating Playbook (recommended)

1. Run syntax check after each batch.
2. Run deterministic replay checks for any Level15 combat/atmosphere change.
3. Capture before/after screenshot sets for visual regressions.
4. Append an entry to `docs/UPDATE_LOG.md` with commit hash and validation notes.

## 7) Useful Validation Commands

```bash
cd /Users/tkevinbigham/Downloads/Cactus-Eds-Happy-Place
awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/cactus_script.js
node --check /tmp/cactus_script.js
```

In browser console (while Level15 is active):

```js
window._l15AtmosPerfReport()
window._l15AtmosRunDeterminismSlices(50, 1337, 600, { snapshotFrame: 300 })
window._l15AtmosCaptureSet()
window._l15AtmosChecklistStatus()
```

