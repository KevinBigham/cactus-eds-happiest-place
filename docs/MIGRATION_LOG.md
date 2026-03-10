# MIGRATION_LOG

## Scope
This pass syncs repository docs with the **actual migrated layout** and prepares a safe World-1-first implementation lane without changing gameplay behavior.

## What was promoted into active structure
- Root `index.html` remains canonical runtime entry.
- Active scaffolding remains: `src/world1/`, `content/`, `tools/`, `tests/`, `telemetry/`, `ui/`, `audio/`, `art/`.
- Active docs now explicitly describe mounted legacy dependencies and safe extraction gates.
- Added `docs/WORLD1_IMPLEMENTATION_LANE.md` to define the first safe coding target.

## What was quarantined
The quarantine layout is confirmed as:
- `legacy/quarantine/combat/` (experimental combat system, mounted dependency only)
- `legacy/quarantine/racing/` (prototype racing HTMLs)
- `legacy/quarantine/runtime-variants/` (`index (2).html`, `developer version.html`)
- `legacy/quarantine/ai-artifacts/` (historical AI outputs)
- `legacy/quarantine/scratch/` (notebook scratch artifacts)
- `legacy/quarantine/docs-archive/` (superseded docs/artifacts)

## What remained untouched
- Runtime behavior and gameplay logic in `index.html`.
- Physical quarantine placement for combat/racing/runtime variants.
- CI workflow in `.github/workflows/static.yml`.

## Why each decision was made
- **World 1 primacy:** keep a minimal, obvious active surface.
- **Mounted dependency honesty:** combat is quarantined as scope but still mounted for runtime parity.
- **No accidental promotion:** racing and runtime variants remain explicitly quarantined.
- **Safe extraction path:** first coding lane focuses on low-risk structural extraction with parity checks.
- **Source-of-truth integrity:** TRANSFER docs now reflect the real migrated state.
