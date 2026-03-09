# ACTIVE_WORKING_SET

## Canonical runtime source
- **Canonical runtime source:** `index.html` (repo root).
- Runtime remains browser-runnable static HTML/JS with no build/transpile step in this migration pass.

## Active World 1 implementation surface
- `index.html` — active playable implementation (including compatibility script includes from `legacy/quarantine/combat/` during this migration stage).
- `scripts/check_rasta_corp_boss.js` — runtime/state consistency check.
- `scripts/check_save_schema.js` — save schema check.
- `docs/GAME_STATE.md` — active state reference.
- `TRANSFER/` — migration/source-of-truth guidance pack.

## Quarantined systems
- `legacy/quarantine/combat/` — combat engine and related experimental combat modules.
- `legacy/quarantine/racing/` — standalone racing prototypes.
- `legacy/quarantine/ai-artifacts/` — historical AI response artifacts.
- `legacy/quarantine/scratch/` — ad hoc notebook/scratch output.
- `legacy/quarantine/docs-archive/` — superseded or unresolved archival docs.

## Do-not-touch list (unless explicitly promoted)
- `legacy/quarantine/combat/**` (except compatibility script loading from `index.html` until combat is fully detached)
- `legacy/quarantine/racing/**`
- `legacy/quarantine/ai-artifacts/**`
- `legacy/quarantine/scratch/**`
- `legacy/quarantine/docs-archive/**`
- Alternate runtime variants moved to quarantine (`legacy/quarantine/runtime-variants/index (2).html`, `legacy/quarantine/runtime-variants/developer version.html`) until explicit promotion.
