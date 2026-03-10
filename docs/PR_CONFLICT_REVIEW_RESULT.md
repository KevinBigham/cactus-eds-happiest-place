# PR CONFLICT REVIEW RESULT
## Cactus Ed's Happy Place — Post-Conflict Audit of Codex Branch `codex/migrate-and-restructure-new-cactus-ed-repo-h8efhw`
### Authority: Claude Opus 4.6, Post-Conflict Audit
### Date: 2026-03-10
### Reviewed commit: `3678b16` (single commit on Codex branch, branched from `59843a8`)
### Depends on: WORLD1_SLICE1_REVIEW_CRITERIA.md, DO_NOT_BREAK.md, ARCHITECT_IMPLEMENTATION_CLEARANCE.md

---

> This document audits Codex's second attempt — a combined repo-reorganization + first code extraction pass — for behavior safety, bloodline fidelity, and scope discipline.

---

## MERGE GO / NO-GO

### **CONDITIONAL NO-GO — two blocking issues must be resolved before merge.**

The branch is approximately 85% clean work. The repo reorganization is correct. The new docs are useful. The combat file moves are byte-identical. But two issues prevent approval:

1. **BLOCKER: `SCENE_KEYS` and `BEAT_KEYS` fallback to `{}` (empty object) in `index.html`.** If the external script `src/world1/constants/runtime_surface.js` fails to load, the game silently dies — no scenes can be found by key, no beat-tracking works. Every other extracted constant (`ALERT_COLORS`, `SFX_KEYS`, `SAVE_KEYS`) has correct inline fallback literals. `SCENE_KEYS` and `BEAT_KEYS` must have their full inline fallback values restored.

2. **BLOCKER: `bootstrap_context.json` deletes irreplaceable project intelligence.** The `current_state.what_is_done` list was replaced from 11 specific game-feature entries (e.g., "Big Mochi boss fight — complete", "Commercial break system — complete") with 6 generic repo-structure entries. The `known_bugs_to_watch` list was replaced from 4 specific gameplay bugs to 3 generic repo-structure warnings. The `open_questions_requiring_human` was replaced from 9 Kevin-facing questions to 4 repo-focused questions. **This erases the project's institutional memory.** The correct approach is to APPEND the repo-structure information while PRESERVING the original game-feature entries.

---

## APPROVED CHANGES

### 1. Combat/ moved to `legacy/quarantine/combat/` — APPROVED
All 33 files are 100% byte-identical renames. Script paths in `index.html` correctly updated. Same approval as the first Codex branch.

### 2. Racing, runtime variants, AI artifacts, docs-archive quarantined — APPROVED
All byte-identical file moves. Correct quarantine strategy.

### 3. Scaffold directories created — APPROVED
Empty `.gitkeep` directories: `src/world1/`, `content/`, `ui/`, `audio/`, `art/`, `telemetry/`, `tools/`, `tests/`. No code, no build config.

### 4. `src/world1/constants/runtime_surface.js` — APPROVED (code is correct)
The extracted constants file is well-constructed:
- ES5 IIFE pattern wrapping into `window.CEHP_WORLD1_RUNTIME_SURFACE`
- All values match the original `index.html` exactly (verified character-by-character)
- Contains: `GFX_BASELINE_SHOT_NAMES`, `SCENE_KEYS`, `BEAT_KEYS`, `ALERT_COLORS`, `SFX_KEYS`, `SAVE_KEYS`
- No ES6+ syntax (no `const`, `let`, `=>`, `class`, template literals)
- The file itself is clean and correct

### 5. `scripts/check_world1_slice1_surface.js` — APPROVED
Parity-checking Node script that verifies critical keys exist in the extracted file. Read-only, non-destructive, useful for CI.

### 6. New docs — APPROVED
- `docs/WORLD1_SLICE1_CHANGELOG.md` — accurate description of what was extracted and why
- `docs/WORLD1_IMPLEMENTATION_LANE.md` — clear safe-extraction guidance
- `docs/MIGRATION_LOG.md` — correct record of structural changes
- `docs/NEW_REPO_STRUCTURE_MAP.md` — clean folder tree with purpose annotations
- `docs/ACTIVE_WORKING_SET.md` — correctly identifies quarantine boundaries and mounted dependency

### 7. `index.html` combat script path updates — APPROVED
Same as first branch — only `src=` attributes changed, same 33 tags, same order.

### 8. `index.html` new script tag for runtime_surface.js — APPROVED
`<script src="src/world1/constants/runtime_surface.js"></script>` added after combat tags, before the inline game code. Correct load order.

### 9. `index.html` extraction of `ALERT_COLORS`, `SFX_KEYS`, `SAVE_KEYS` — APPROVED
These three use the conditional pattern with **correct inline fallback literals**:
```javascript
var ALERT_COLORS = (window.CEHP_WORLD1_RUNTIME_SURFACE&&window.CEHP_WORLD1_RUNTIME_SURFACE.ALERT_COLORS)
  ? window.CEHP_WORLD1_RUNTIME_SURFACE.ALERT_COLORS
  : {ok:'#00ff66',warn:'#ffd700',danger:'#ff4444',info:'#66ddff'};
```
If the external file fails to load, these three constants still have their correct values. Runtime-safe.

### 10. `index.html` extraction of `_gfxCaptureBaselineSet` shotNames — APPROVED
Conditional lookup with correct inline array fallback. Runtime-safe.

### 11. TRANSFER doc addenda (15, 16, 17) — APPROVED
The three TRANSFER decision docs received "Truth Sync Addendum" sections appended at the end. These addenda accurately describe the current repo state. Original content preserved. Addenda are factual and non-destructive.

### 12. README.md updates — APPROVED
Folder tree and tech stack descriptions updated to reflect post-migration reality.

---

## RISKY OR REJECTED CHANGES

### BLOCKER 1: `SCENE_KEYS` and `BEAT_KEYS` fallback to `{}` — MUST FIX

**Location:** `index.html` lines 992-998 on Codex branch

**What Codex wrote:**
```javascript
var SCENE_KEYS = (window.CEHP_WORLD1_RUNTIME_SURFACE&&window.CEHP_WORLD1_RUNTIME_SURFACE.SCENE_KEYS)
  ? window.CEHP_WORLD1_RUNTIME_SURFACE.SCENE_KEYS
  : {};

var BEAT_KEYS = (window.CEHP_WORLD1_RUNTIME_SURFACE&&window.CEHP_WORLD1_RUNTIME_SURFACE.BEAT_KEYS)
  ? window.CEHP_WORLD1_RUNTIME_SURFACE.BEAT_KEYS
  : {};
```

**What it should be:**
```javascript
var SCENE_KEYS = (window.CEHP_WORLD1_RUNTIME_SURFACE&&window.CEHP_WORLD1_RUNTIME_SURFACE.SCENE_KEYS)
  ? window.CEHP_WORLD1_RUNTIME_SURFACE.SCENE_KEYS
  : {
  boot:'Boot', title:'Title',
  worldMap:'WorldMap', worldMap2:'WorldMap2', worldMap3:'WorldMap3', worldMap4:'WorldMap4', worldMap5:'WorldMap5', worldMap6:'WorldMap6',
  // ... [full original literal] ...
};
```

**Why this is a blocker:**
- `SCENE_KEYS` is referenced ~200+ times in `index.html` for scene transitions, boot sequencing, and save management
- If the external script fails to load (404, network timeout, path typo after a future refactor), `SCENE_KEYS` becomes `{}` and every `SCENE_KEYS.title`, `SCENE_KEYS.worldMap`, etc. resolves to `undefined`
- The game will silently fail to transition between ANY scenes — total runtime failure
- `BEAT_KEYS` has the same risk: all level-beat tracking breaks
- This directly violates Red Line 1 ("No gameplay behavior changes") because the fallback path produces different behavior than the original code
- `ALERT_COLORS`, `SFX_KEYS`, and `SAVE_KEYS` do NOT have this problem — they have correct inline fallbacks

**Fix:** Restore the full original object literals as fallback values for both `SCENE_KEYS` and `BEAT_KEYS`, matching the pattern used for the other three constants.

### BLOCKER 2: `bootstrap_context.json` Erases Project Memory — MUST FIX

**What was deleted:**

`current_state.what_is_done` — Original 11 entries describing actual game feature completion:
- "All 5 World 1 levels (1-1 through 1-5) — complete"
- "Big Mochi boss fight (Level 1-5) — complete"
- "WorldMap1 through WorldMap6 — scaffolded"
- "World 2 levels 2-1 through 2-4 — exist in index.html with names"
- "Puppet Theater boss intro overlay system — complete"
- "FZeroScene (racing) — complete"
- "CigSalesScene — scaffolded"
- "Commercial break system — complete (max 2 per world)"
- "EWR_STATE schema with save versioning — complete"
- "WS_TEXTS system — complete"
- "Cat dialogue pool — complete"

**Replaced with** 6 generic repo-structure entries that say nothing about game feature state.

`current_state.what_is_not_done` — Original 7 entries:
- "RastaCorpBossScene — TIER 1, highest priority unfinished item"
- "Cat petting mechanic", "Josh", "Shop items", "World 2 docs", "World 2 boss", "WorldMap anomaly overlays"

**Replaced with** 3 repo-focused entries.

`current_state.known_bugs_to_watch` — Original 4 specific gameplay bugs:
- "Level 1-2 through 1-4 less playtested"
- "Boss health bar setScrollFactor(0)"
- "_wsTimer fires every ~8s"
- "Bus parallax busParallaxG occlusion"

**Replaced with** 3 generic repo warnings.

`open_questions_requiring_human` — Original 9 Kevin-facing questions (Josh's character, shop items, sympathy threshold, World 2 boss, etc.) **replaced** with 4 repo-structure questions.

**Why this is a blocker:**
- `bootstrap_context.json` is explicitly described as "High-signal compressed context for cold-start agents"
- A cold-start agent reading the new version will have NO idea that Big Mochi boss is complete, that there are 4 known gameplay bugs, or that Kevin has 9 unanswered questions
- The deleted information is not duplicated anywhere else in the easily-machine-readable JSON format
- The migration-status information should be ADDED alongside the original entries, not replace them

**Fix:** Merge the repo-status entries INTO the original lists. Keep all 11 original `what_is_done` items and APPEND the 6 new repo-structure items. Same for `what_is_not_done`, `known_bugs_to_watch`, and `open_questions_requiring_human`.

### ADVISORY: `bootstrap_context.json` game_identity.one_sentence Change

The original:
> "Cactus Ed's Happy Place is a single-file Phaser 3.70.0 browser platformer about a chain-smoking cactus who walks through institutional absurdism without reacting to it."

Was replaced with:
> "Cactus Ed's Happy Place is a browser-runnable World-1-first runtime centered on index.html, with a modernized repo structure and explicit legacy quarantine paths."

This replaces the game's creative identity description with a technical architecture description. The `game_identity.one_sentence` field should describe the GAME, not the REPO. The original is correct and should be preserved (possibly with "single-file" updated to reflect multi-file reality, but keeping the creative description).

### ADVISORY: `migration_manifest.json` Complete Rewrite

The original manifest contained detailed per-file port instructions with specific verification commands (`wc -l index.html (expect ~9662 lines)`, `First line: <script> tag loading Phaser CDN`). These were already known to be stale (the review criteria identified this). Codex replaced the entire file with a new structure that describes the post-migration layout.

While the new content is accurate for the current repo state, the rewrite removes the per-file granularity that would be useful for any future repo-to-repo migration. This is acceptable given that the migration has already occurred, but it should be noted that the manifest now serves a different purpose (describing current state) than its original purpose (guiding a migration).

### ADVISORY: `bootstrap_context.json` Technical Stack Softening

Several hard constraints were softened:
- `renderer`: "Phaser.CANVAS — forced, non-negotiable. No WebGL ever." → "Current runtime remains Canvas-first via existing index.html behavior; no runtime stack rewrite in this phase."
- `language`: "ES5 only — var, function(){}, prototype OOP. No const, let, =>, class. Ever." → "Current runtime code in index.html is legacy-style JS; new repo structure modernization is allowed..."

These changes are **directionally correct** per `TRANSFER/15_RUNTIME_CANON_DECISION.md` which already scoped ES5/Canvas as old-repo constraints. However, the softening from "non-negotiable" to "in this phase" removes the guardrail for agents working on index.html itself (where ES5 IS still required). The constraint should be scoped, not softened: "ES5 required for code in/extracted from index.html; future modules may use modern syntax if Kevin approves."

---

## BLOODLINE CHECK

| Protection | Status | Evidence |
|-----------|--------|----------|
| Ed's character | **No drift** | No dialogue modified. Gameplay code byte-identical after extraction zone. |
| Humor engine | **No drift** | No content strings touched. |
| ED_MOVE constants | **No drift** | Not extracted. Still inline in `index.html`. Untouched. |
| Reward values | **No drift** | Not extracted. Still inline in `index.html`. Untouched. |
| Mechanical feel | **No drift** | Coyote time, jump buffer, physics — all untouched. |
| World 1 primacy | **No drift** | Combat quarantined. Racing quarantined. Extraction targets only constants. |
| No predatory retention | **No drift** | No economy changes. |
| No build system | **No drift** | No package.json, bundler, or transpiler. |
| ES5 in extracted file | **Clean** | `runtime_surface.js` uses `var`, IIFE, no ES6+ tokens. |
| SCENE_KEYS values | **Clean** | Extracted values match original exactly. |
| BEAT_KEYS values | **Clean** | Extracted values match original exactly. |

**Bloodline verdict: CLEAN — zero creative or mechanical drift. The extracted data is correct. Only the fallback pattern is wrong.**

---

## BEHAVIOR-PARITY RISK CHECK

| Risk | Status | Severity |
|------|--------|----------|
| SCENE_KEYS fallback to `{}` if script fails | **PRESENT** | **BLOCKER** — game would silently die |
| BEAT_KEYS fallback to `{}` if script fails | **PRESENT** | **BLOCKER** — level tracking would break |
| ALERT_COLORS fallback | **Safe** | Correct inline fallback |
| SFX_KEYS fallback | **Safe** | Correct inline fallback |
| SAVE_KEYS fallback | **Safe** | Correct inline fallback |
| GFX shotNames fallback | **Safe** | Correct inline array fallback |
| Script load order | **Safe** | runtime_surface.js loads before inline code |
| Combat file modification | **None** | 100% byte-identical renames |
| Phaser config change | **None** | Untouched |
| New dependency | **None** | No new CDN links or libraries |
| Scene registration order | **None** | Untouched |

**Behavior-parity verdict: TWO BLOCKERS. Happy-path behavior is identical, but the degradation path for SCENE_KEYS and BEAT_KEYS introduces a behavior change that did not exist before.**

---

## SCOPE CHECK

| Boundary | Status |
|----------|--------|
| Extraction limited to constants/data | **Yes** |
| No combat feature work | **Yes** |
| No racing feature work | **Yes** |
| No World 2+ content | **Yes** |
| No gameplay refactors | **Yes** — extraction only |
| No build system | **Yes** |
| No ES6+ in extracted code | **Yes** |
| TRANSFER docs: content preserved | **Partial** — addenda OK, but bootstrap_context lost data |

**Scope verdict: MOSTLY CLEAN. Extraction scope is correct. TRANSFER doc rewrite went beyond "truth sync" into "information replacement."**

---

## TOP 5 REMAINING RISKS

1. **SCENE_KEYS / BEAT_KEYS empty fallback** — If `runtime_surface.js` ever fails to load (path change, CDN failure, local dev without server), the game produces zero useful errors and simply fails to find any scene. This MUST be fixed before merge.

2. **bootstrap_context.json institutional memory loss** — 11 game-feature completion entries, 7 not-done entries, 4 gameplay bugs, and 9 Kevin-questions deleted. A cold-start agent will be missing critical project context. This MUST be fixed before merge.

3. **Soft guardrails in bootstrap_context.json** — "ES5 only — Ever" → "legacy-style JS; modernization allowed" removes the safety rail for code working directly on index.html. An agent could interpret this as permission to use ES6 in index.html modifications.

4. **game_identity.one_sentence now describes the repo, not the game** — A cold-start agent reading the `game_identity` field will think this is a devops project, not a game about a chain-smoking cactus.

5. **migration_manifest.json per-file history erased** — The original manifest's detailed per-file porting instructions (with verification commands) are gone. If a future repo-to-repo migration is needed, this specificity would have to be reconstructed.

---

## WHAT SHOULD HAPPEN NEXT

### Immediate: Fix the two blockers
1. Restore full inline fallback literals for `SCENE_KEYS` and `BEAT_KEYS` in `index.html`
2. Merge (not replace) the new repo-status entries into `bootstrap_context.json`'s `current_state` and `open_questions` lists, preserving all original entries

### Then: Merge
Once those two fixes are applied, this branch is clean and should be merged to main.

### After merge: Recommended next lane
**World 1 Slice 2 — Extract more constants/data from index.html** following the pattern established here (IIFE into `CEHP_WORLD1_RUNTIME_SURFACE`, always with full inline fallbacks). Good candidates:
- Level metadata tables
- HUD text constants
- Color palette / AT config object
- Cat dialogue pool (if pure data)

---

## SUMMARY

| Area | Verdict |
|------|---------|
| Repo reorganization (combat/racing/artifacts) | **APPROVED** |
| New `runtime_surface.js` extracted file | **APPROVED** (file is correct) |
| `index.html` script path updates | **APPROVED** |
| `index.html` ALERT_COLORS/SFX_KEYS/SAVE_KEYS extraction | **APPROVED** |
| `index.html` SCENE_KEYS/BEAT_KEYS extraction | **BLOCKED** — empty `{}` fallback |
| New docs (5 files) | **APPROVED** |
| TRANSFER addenda (3 files) | **APPROVED** |
| `bootstrap_context.json` rewrite | **BLOCKED** — erases project memory |
| `migration_manifest.json` rewrite | **ADVISORY** — acceptable but noted |
| Parity check script | **APPROVED** |
| Bloodline | **CLEAN** |
| Overall | **CONDITIONAL NO-GO** — fix two blockers, then merge |

---

*The extraction approach is sound. The extracted data is correct. The fallback pattern is inconsistent — fix it and this passes. The TRANSFER truth docs must preserve what they replace, not erase it.*
