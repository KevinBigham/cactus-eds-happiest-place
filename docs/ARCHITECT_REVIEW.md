# ARCHITECT REVIEW
## Cactus Ed's Happy Place — New Repo Structural Audit
### Authority: Claude Opus 4.6, Audit Pass
### Date: 2026-03-09

---

> This document is the result of a full structural audit of the migrated repository. It identifies what is clean, what is drifting, what must be fixed before implementation begins, and what is safe to build now.

---

## WHAT IS CLEAN

### 1. TRANSFER Pack Is Comprehensive and Well-Ordered
The 11-file TRANSFER pack (`00_START_HERE.md` through `17_ARCHITECTURAL_NORMALIZATION.md` plus JSON manifests) provides a complete operating system for future agents. Reading order is explicit. Authority hierarchy is clear. Conflict resolution rules exist and are specific.

### 2. Doc Hierarchy Has Explicit Conflict Resolution
`13_SOURCE_OF_TRUTH_ORDER.md` provides 7 explicit rules for resolving doc conflicts, including the critical Rule 6 (runtime canon supersedes legacy technical mandates) and Rule 7 (World 1 wins scope tiebreakers). This is unusually robust for a game project and will prevent most agent-vs-agent drift.

### 3. World 1 Primacy Is Explicitly Stated
`16_COMBAT_RACING_STATUS_DECISION.md` closes the ambiguity that existed in earlier doc versions. World 1 is primary. Combat is experimental. Racing is quarantined. The promotion path requires Kevin's explicit sign-off. No future agent can reasonably misread this.

### 4. Soul Protections Are Architecture-Independent
The normalization pass (`17_ARCHITECTURAL_NORMALIZATION.md`) correctly separated soul laws (Ed's character, humor engine, retention model) from technical laws (ES5, Canvas, one-file). The 8 bloodline protections are permanent regardless of future architecture decisions. This is the right call.

### 5. GitHub Actions Workflow Is Pure Static Deployment
`.github/workflows/static.yml` uploads the repo as-is to GitHub Pages. No build step. No npm. No bundler. This matches the stated deployment philosophy perfectly.

### 6. Validation Scripts Are Non-Invasive
`scripts/check_rasta_corp_boss.js` and `scripts/check_save_schema.js` are read-only validators that check `index.html` for structural integrity. They do not build, transform, or generate anything. They are safe to keep and useful for regression checking.

### 7. Migration Manifest Is Specific and Actionable
`TRANSFER/migration_manifest.json` provides exact old→new path mappings with reasons, a clear "do not port yet" list with ownership assignments, and a post-port acceptance test. A future migration agent can follow this mechanically.

---

## WHAT IS DRIFTING

### DRIFT 1 — `index.html` Line Count Discrepancy (HIGH)
- **HANDOFF_BIBLE.md** states: "9,662 lines, single file"
- **README.md** states: "24,146 lines"
- **Actual `wc -l`**: 24,261 lines
- **bootstrap_context.json** states: `"line_count_expected": "~9662"`
- **migration_manifest.json** verify step expects: `"wc -l index.html (expect ~9662 lines)"`

The game has grown ~2.5x since the HANDOFF_BIBLE was written. Multiple documents cite the stale 9,662 count as a verification check. Any agent running the acceptance test will flag a false positive on line count.

**Impact:** Medium-high. A cautious agent will halt migration believing the file is corrupted.

### DRIFT 2 — `index.html` First-Line Expectation Is Wrong
- Multiple docs state: "First line: `<script>` tag loading Phaser CDN"
- **Actual first line**: `<!DOCTYPE html>`

The file has standard HTML boilerplate before the Phaser script tag. The verification check in migration_manifest.json and bootstrap_context.json will produce false failures.

**Impact:** Low-medium. Easy to fix in docs, but will confuse a literal-minded agent.

### DRIFT 3 — `combat/` Is Already Integrated, Not Experimental (HIGH)
- `16_COMBAT_RACING_STATUS_DECISION.md` labels combat/ as "experimental" and "secondary"
- `migration_manifest.json` lists combat/ under "do_not_port_yet"
- **Reality**: `index.html` loads all 33 combat/ JS files via `<script>` tags (lines 8-40)
- The combat engine (17,381 lines across 33 files) is already part of the running game

The "one file" description is already inaccurate. The game is `index.html` + 33 external combat scripts. The combat/ directory is not a disconnected prototype — it is a runtime dependency. Labeling it "experimental" while it is actively loaded creates a dangerous contradiction: an agent following the docs would skip porting combat/ and break the game.

**Impact:** Critical. Must be reconciled before any migration.

### DRIFT 4 — `bootstrap_context.json` Has Stale Rules
The bootstrap context still contains pre-normalization language:
- `"dialogue_rule": "Maximum 8 words per line. No exclamation marks. Ever."` — This was softened in the normalization pass (target 8, exceptions allowed; exclamation marks prohibited only in Ed's voice, not institutional language)
- `"line_count_expected": "~9662"` — stale (see Drift 1)
- `"renderer"` and `"language"` fields state old-repo rules as absolute without the `[OLD REPO]` scope annotations added in the normalization pass

A cold-start agent reading only bootstrap_context.json will internalize pre-normalization rules.

**Impact:** Medium. The bootstrap file is designed for quick context, so agents are likely to trust it without reading the full normalization doc.

### DRIFT 5 — `GAME_STATE.md` Mentions Optional WebGL Path
`docs/GAME_STATE.md` states: `"Render baseline: Canvas-first with optional WebGL path via feature flags"` and lists `FEATURE_FLAGS.metroidAtmosphereWebGL`. This contradicts the old-repo law of Canvas-only, suggesting the codebase has already evolved beyond the stated constraints. The normalization docs don't address this.

**Impact:** Low-medium. The feature flag system means WebGL is gated, not default. But it signals that the codebase is more evolved than the TRANSFER docs describe.

### DRIFT 6 — Root Directory Noise Confuses Canon
The repo root contains:
- `index.html` (the game — 24,261 lines)
- `index (2).html` (unknown variant — 1,328,629 bytes)
- `developer version.html` (unknown variant — 1,016,115 bytes)
- `cehp_racing_goat.html` (racing prototype)
- `cehp_racing_only.html` (racing prototype)
- `Codex response.rtf`, `Gemini response.txt`, `Meta's Results and Convo.txt`, `Mistral's Results and Convo.txt`
- `chat gpt response research.md`
- `errors claude code noticed 3:4 8:11pm.ipynb`

A future agent arriving cold will spend significant context window figuring out which files matter. The `docs/` directory similarly mixes authoritative briefings (.md) with raw AI output artifacts (.rtf, .txt) and yet another index.html variant (`docs/index (1).html`).

**Impact:** Medium. Not a code bug, but a significant agent-efficiency tax. Every new agent session burns tokens distinguishing signal from noise.

### DRIFT 7 — `HANDOFF_BIBLE.md` Quick Links Table References 9,662 Lines
The very first table in HANDOFF_BIBLE.md says `index.html (root) — 9,662 lines, single file`. This is the first number any agent will see. It is wrong by ~15,000 lines. Combined with the "single file" claim (which is inaccurate given combat/'s 33 loaded scripts), this creates a misleading first impression.

**Impact:** Medium. Erodes trust in the HANDOFF_BIBLE if an agent discovers the discrepancy early.

---

## WHAT MUST BE FIXED BEFORE IMPLEMENTATION

### FIX 1 — Reconcile `combat/` Status (CRITICAL)
**The problem:** `combat/` is labeled experimental in docs but is a runtime dependency loaded by `index.html`.

**The fix (requires Kevin):** Kevin must decide one of:
- **(A)** Combat/ IS integrated and should be ported as a first-class dependency. Update `16_COMBAT_RACING_STATUS_DECISION.md` and `migration_manifest.json` to reflect this.
- **(B)** Combat/ should be inlined back into `index.html` to restore the true one-file architecture, and the external scripts removed.
- **(C)** Combat/ remains external but is reclassified from "experimental" to "integrated-secondary" — it must be ported for the game to run, but World 1 core gameplay (levels 1-1 through 1-5) still takes priority for polish and validation.

**Do not begin migration until this is resolved.**

### FIX 2 — Update Line Count References
Update `HANDOFF_BIBLE.md`, `bootstrap_context.json`, and `migration_manifest.json` to reflect the actual ~24,261 line count. Change the verification check to something like "expect 20,000+ lines" to accommodate future growth.

### FIX 3 — Update First-Line Verification Check
Change "First line: `<script>` tag loading Phaser CDN" to "File begins with `<!DOCTYPE html>`; Phaser CDN `<script>` tag appears within the `<head>` section."

### FIX 4 — Update `bootstrap_context.json` Post-Normalization
- Soften Ed's dialogue rule to match the normalization: target 8 words, exceptions allowed when materially stronger, exclamation mark ban applies to Ed's voice only.
- Add `[OLD REPO]` scope annotations to `renderer` and `language` fields.
- Fix `line_count_expected`.

### FIX 5 — Add a `.agentignore` or Equivalent Signal for Historical Files
Future agents need a fast way to distinguish:
- **Canon runtime**: `index.html`, `combat/`
- **Canon docs**: `TRANSFER/`, `HANDOFF_BIBLE.md`, `docs/*.md` (briefings)
- **Historical noise**: `.rtf` files, `.txt` AI logs, variant HTML files, `.ipynb`

This could be a `TRANSFER/FILE_CLASSIFICATION.md` or annotations in `migration_manifest.json`. The current structure forces every agent to re-discover this taxonomy from scratch.

---

## WHAT IS SAFE TO BUILD NOW

### SAFE 1 — World 1 Playtesting and Validation
All 5 World 1 levels exist in `index.html`. The acceptance test (Title → WorldMap → Level 1-1 through 1-5 → Boss kill) can be run. No doc fixes are needed for this.

### SAFE 2 — Doc Fixes Listed Above
Fixes 2-5 are pure documentation changes. They don't touch gameplay code and can't break the running game.

### SAFE 3 — Running Validation Scripts
`scripts/check_rasta_corp_boss.js` and `scripts/check_save_schema.js` can be run against `index.html` to verify structural integrity. These are read-only and safe.

### SAFE 4 — Writing `DO_NOT_BREAK.md` Bloodline Protection Document
The soul laws are clear, consistent across all TRANSFER docs, and have survived the normalization pass intact. The bloodline protection document can be written with full confidence.

### NOT YET SAFE — Any Migration or New Feature Work
Do not begin migration to a new repo until Fix 1 (combat/ status) is resolved by Kevin. Do not begin new feature work (RastaCorpBossScene or otherwise) until the doc discrepancies (Fixes 2-5) are resolved, as they will mislead the implementing agent.

---

## SUMMARY TABLE

| Area | Status | Action Required |
|------|--------|----------------|
| TRANSFER doc pack (11 files) | Clean | None |
| Authority hierarchy | Clean | None |
| World 1 primacy | Clean | None |
| Soul/humor/retention protections | Clean | None |
| GitHub Actions deployment | Clean | None |
| Validation scripts | Clean | None |
| `combat/` status vs reality | **DRIFTING — CRITICAL** | Kevin must decide (see Fix 1) |
| `index.html` line count in docs | Drifting | Update 3 files (Fix 2) |
| First-line verification | Drifting | Update 3 files (Fix 3) |
| `bootstrap_context.json` | Drifting | Update post-normalization (Fix 4) |
| Root directory noise | Drifting | Add file classification (Fix 5) |
| GAME_STATE.md WebGL mention | Minor drift | Note only — feature-flagged |

---

*Bloodline is intact. Structure needs five fixes before migration is safe. One fix requires Kevin.*
