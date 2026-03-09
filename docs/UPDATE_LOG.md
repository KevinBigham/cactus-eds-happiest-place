# Cactus Ed Update Log

This file is the running chronological changelog for development batches.

## Entry Template

Use this format for each new batch:

```md
## YYYY-MM-DD — <version/name> — <commit>
- Scope:
- Added:
- Changed:
- Fixed:
- Validation:
- Notes:
```

## 2026-03-04 — Level15 v2.8 Atmosphere V2 — 430077a
- Scope: Level15 atmosphere rebuild (deterministic, IP-safe, 5-layer stack), plus dedicated atmosphere lab scene.
- Added:
  - `FEATURE_FLAGS.metroidAtmosphereLab`
  - `FEATURE_FLAGS.metroidAtmosphereWebGL`
  - `FEATURE_FLAGS.metroidAtmosphereCanvasFallback`
  - `FEATURE_FLAGS.metroidAtmosphereStrictDeterminism`
  - `BALANCE.fight.metroidAtmosphereV2`
  - `Level15AtmosLabScene` (`B` from title)
  - Atmosphere debug APIs:
    - `window._l15AtmosPerfReport()`
    - `window._l15AtmosCaptureSet()`
    - `window._l15AtmosChecklistStatus()`
    - `window._l15AtmosRunDeterminismSlices(...)`
- Changed:
  - Level15 atmosphere render path now uses v2 config contract and deterministic frame hash digest.
  - WebGL fog+LUT pipeline upgraded (`L15AtmosV2FogLut`) with Canvas fallback.
  - Global F8 quicksave is suppressed in Level15/AtmosLab so fight/lab hotkeys are not overridden.
  - Renderer selection now uses `Phaser.AUTO` when `metroidAtmosphereWebGL` is enabled.
- Validation:
  - `node --check` on extracted `<script>` passed.
- Notes:
  - Push complete to `main`.

## 2026-03-04 — Visual Foundation Pass — 6755add
- Scope: Visual lab and handheld-style render foundation.

## 2026-03-04 — MainMode Engine v1 (Level16) — d9a3d60
- Scope: Deterministic platformer engine, Feel Lab, micro vertical slice.

## 2026-03-03 — Level15 v2.6.2 Entertainment Pass — 77a36d5
- Scope: Deterministic fighting entertainment pass, recap/consequence hooks, micro-achievements.

## 2026-03-03 — Round 2 AI Integration — 6e7377e
- Scope: RastaCorp boss, InfiniteBus, World 3 messaging hooks, anomaly overlay.

