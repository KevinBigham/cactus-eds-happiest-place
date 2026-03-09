# MIGRATION_LOG

## Scope
This migration pass restructures the repository for a **World-1-first active surface** while keeping runtime behavior static-browser compatible and preserving `TRANSFER/` as the source-of-truth pack.

## What was promoted into active structure
- Root `index.html` remains the canonical runtime entry point for immediate browser execution.
- `scripts/` remains active for existing runtime integrity checks (`check_rasta_corp_boss.js`, `check_save_schema.js`).
- New active-first folder scaffold was established for future modularization without introducing a build step:
  - `src/world1/`
  - `content/`
  - `tools/`
  - `tests/`
  - `telemetry/`
  - `ui/`
  - `audio/`
  - `art/`
- Existing active docs remain in `docs/`.

## What was quarantined
Moved out of active implementation paths into `legacy/quarantine/`:
- Alternate/ambiguous runtime files:
  - `index (2).html` → `legacy/quarantine/runtime-variants/index (2).html`
  - `developer version.html` → `legacy/quarantine/runtime-variants/developer version.html`
- Experimental secondary systems:
  - `combat/` → `legacy/quarantine/combat/`
  - `cehp_racing_goat.html`, `cehp_racing_only.html` → `legacy/quarantine/racing/`
- Duplicate historical AI artifacts and scratch files:
  - `Codex response.rtf`
  - `Gemini response.txt`
  - `Meta's Results and Convo.txt`
  - `Mistral's Results and Convo.txt`
  - `chat gpt response research.md`
  - `errors claude code noticed 3:4 8:11pm.ipynb`
- Historical / unresolved doc artifacts:
  - `HANDOFF.md`
  - `docs/index (1).html`
  - `docs/CODEX R2.rtf`
  - `docs/GEMINI R2 - v1.rtf`
  - `docs/Gemini r2 -v2.txt`
  - `docs/Mistral R2.rtf`
  - `docs/deepseek r2.rtf`
  - `docs/meta r2.rtf`
  - `docs/chat gpt r2.md`

## What remained untouched
- `TRANSFER/` contents were preserved untouched.
- Root runtime `index.html` gameplay implementation was not refactored in this pass.
- Existing authoritative docs in `docs/` were kept in-place.
- CI workflow `.github/workflows/static.yml` remained unchanged.

## Why each decision was made
- **World 1 primacy:** keep only the active World 1 runtime in the main path.
- **Combat/racing quarantine:** explicit architect decision marks these as secondary/experimental; `index.html` keeps compatibility script includes that now point to the quarantined combat location to avoid runtime breakage during migration.
- **Readability for future agents:** hard-separate active vs historical/ambiguous material.
- **No runtime-stack rewrite:** repository modernization focused on structure and clarity, not gameplay/system rewrites.
