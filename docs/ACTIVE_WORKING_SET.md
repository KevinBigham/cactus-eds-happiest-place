# ACTIVE_WORKING_SET

## Canonical runtime source
- **Canonical runtime source:** `index.html` (repo root).
- Runtime remains browser-runnable static HTML/JS with no bundler, transpiler, or build step in this phase.

## Active World 1 implementation surface
- `index.html` — active playable implementation.
- `scripts/check_rasta_corp_boss.js` — runtime/state consistency check.
- `scripts/check_save_schema.js` — save schema check.
- `docs/GAME_STATE.md` — active state reference.
- `TRANSFER/` — migration/source-of-truth guidance pack.
- `docs/WORLD1_IMPLEMENTATION_LANE.md` — safe first coding lane and parity gates.

## Quarantined systems
- `legacy/quarantine/combat/` — experimental combat modules; **physically quarantined but still mounted as a legacy runtime dependency from `index.html`**.
- `legacy/quarantine/racing/` — standalone racing prototypes.
- `legacy/quarantine/runtime-variants/` — non-canonical runtime variants.
- `legacy/quarantine/ai-artifacts/` — historical AI response artifacts.
- `legacy/quarantine/scratch/` — ad hoc notebook/scratch output.
- `legacy/quarantine/docs-archive/` — superseded or unresolved archival docs.

## Do-not-touch list (unless explicitly promoted)
- `legacy/quarantine/combat/**` (except path-stability maintenance required to keep current runtime loading).
- `legacy/quarantine/racing/**`
- `legacy/quarantine/runtime-variants/**`
- `legacy/quarantine/ai-artifacts/**`
- `legacy/quarantine/scratch/**`
- `legacy/quarantine/docs-archive/**`

## Legacy mounted dependency clarity
- `combat/` is not active feature scope.
- `combat/` is currently a mounted legacy dependency because `index.html` still includes combat scripts.
- Detaching those includes is a later migration step and is out of scope for this pass.
