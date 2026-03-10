# ARCHITECT IMPLEMENTATION CLEARANCE
## Cactus Ed's Happy Place — Go/No-Go for World-1-First Coding
### Authority: Claude Opus 4.6, Implementation Clearance Pass
### Date: 2026-03-10
### Depends on: ARCHITECT_REVIEW.md (first audit), DO_NOT_BREAK.md (bloodline protection), full TRANSFER pack

---

> This document issues the implementation clearance decision. It states what is safe to build now, what is not safe, what still needs clarification, and the overall go/no-go ruling for World 1 coding.

---

## IMPLEMENTATION GO/NO-GO RULING

### **GO — for World 1 coding within protected scope.**

World 1 implementation work may begin under the following conditions:
1. All work targets World 1 levels (1-1 through 1-5), the World 1 map, and World 1 boss only.
2. No work touches `combat/` files or promotes combat systems into active scope.
3. No work depends on racing prototypes or promotes them into active scope.
4. All creative output is checked against `DO_NOT_BREAK.md` before commit.
5. All ED_MOVE constants are preserved exactly. No tuning without Kevin's explicit instruction.
6. All reward values are preserved exactly. No reduction without Kevin's explicit sign-off.

### **NO-GO — for migration, combat features, or racing features.**

Migration to a new repo is blocked until the stale verification data in `bootstrap_context.json` and `migration_manifest.json` is corrected. Combat and racing remain quarantined.

---

## WHAT IS SAFE TO BUILD NOW

### Lane 1: World 1 Level Validation and Bug Fixes
**Status: CLEAR**

The five World 1 levels exist in `index.html` and are the highest-priority work. Known items:
- Level 1-2 through 1-4 are less playtested than 1-1 — validate before building forward
- Boss health bar in 1-5 — verify `setScrollFactor(0)` is applied
- `_wsTimer` in Level 1-3 — verify it fires every ~8 seconds
- Bus parallax depth in 1-4 — verify `busParallaxG` doesn't occlude Ed

Any agent working this lane should play each level start-to-finish and file bugs before making changes.

### Lane 2: World 1 Content Polish
**Status: CLEAR with guardrails**

New content for World 1 levels (cat dialogue, institutional signage, HUD labels, environmental text) may be written, provided:
- Ed's voice rules are followed (short, deadpan, no exclamation marks)
- Institutional language rules are followed (sincere bureaucratic framing, may be loud)
- No meme language, no internet slang, no knowing comedy
- Cat dialogue is philosophical, not quippy
- WS_TEXTS are confrontational, not wacky
- All content passes the DO_NOT_BREAK.md drift checks

### Lane 3: Doc Corrections (Non-Code)
**Status: CLEAR — should be done before or alongside Lane 1**

The following doc corrections are safe and should happen soon to prevent future agent confusion:

| Doc | What's Stale | Correct Value |
|-----|-------------|---------------|
| `bootstrap_context.json` → `line_count_expected` | `"~9662"` | `"~24261"` |
| `bootstrap_context.json` → `dialogue_rule` | `"Maximum 8 words per line. No exclamation marks. Ever."` | Target 8 words, exceptions when materially better. No exclamation marks in Ed's voice only. |
| `bootstrap_context.json` → `renderer` | No scope annotation | Add `[OLD REPO]` scope |
| `bootstrap_context.json` → `language` | No scope annotation | Add `[OLD REPO]` scope |
| `bootstrap_context.json` → `drift_kill_switches` | Several have no `[OLD REPO]` scope | Scope ES5, WebGL, and new-file kill switches to old repo |
| `bootstrap_context.json` → `open_questions` | `"Is combat/ folder integrated..."` | Answered: YES, integrated via 33 script tags. Status: legacy runtime dependency, quarantined but mounted. |
| `migration_manifest.json` → verify_after_port | `"wc -l index.html (expect ~9662 lines)"` | `"wc -l index.html (expect ~24000+ lines)"` |
| `migration_manifest.json` → verify_after_port | `"First line: <script> tag loading Phaser CDN"` | `"File begins with <!DOCTYPE html>; Phaser CDN in <head>"` |
| `migration_manifest.json` → combat/ entry | `"Unclear if integrated"` | `"Integrated via 33 script tags. Legacy runtime dependency — quarantined but mounted."` |
| `HANDOFF_BIBLE.md` → quick reference table | `"9,662 lines, single file"` | `"~24,261 lines; combat/ loaded via external scripts"` |

### Lane 4: Validation Script Runs
**Status: CLEAR**

`scripts/check_rasta_corp_boss.js` and `scripts/check_save_schema.js` can be run against `index.html` at any time. They are read-only and non-destructive.

---

## WHAT IS NOT SAFE TO BUILD NOW

### Blocked: Combat Feature Work
**Status: QUARANTINED**

`combat/` is a legacy runtime dependency — it is mounted (33 JS files loaded via `<script>` tags in `index.html`) but it is NOT active feature scope. This means:
- The 33 combat/ files must travel with `index.html` for the game to run. They are a dependency.
- But no new combat features, no combat polish, no combat bug fixes are in scope.
- The `RastaCorpBossScene` spec in `docs/BRIEFING_DEEPSEEK.md` is a real spec. It is not the current priority.
- Promotion to active scope requires Kevin's explicit sign-off + World 1 stability.

**WARNING FOR FUTURE AGENTS:** Do not confuse "mounted" with "promoted." The combat/ files are loaded at runtime because `index.html` references them. This does NOT mean combat is a first-class feature lane. It is a legacy dependency that happens to be wired in. Treat it as load-bearing scaffolding that you do not modify.

### Blocked: Racing Feature Work
**Status: QUARANTINED**

`cehp_racing_goat.html` and `cehp_racing_only.html` are prototype files at the repo root. `FZeroScene` exists inside `index.html`. All of these are quarantined until Kevin explicitly promotes racing.

### Blocked: New Repo Migration
**Status: BLOCKED — stale verification data**

The migration acceptance test in `migration_manifest.json` will produce false failures:
- Line count check expects ~9,662 (actual: ~24,261)
- First-line check expects `<script>` tag (actual: `<!DOCTYPE html>`)
- Combat/ is listed as "unclear" (it is definitively integrated)

A migration agent following these instructions literally will either halt on false positives or make wrong decisions about combat/. Fix Lane 3 docs first.

### Blocked: World 2+ Content
**Status: NOT IN SCOPE**

World 2 levels (2-1 through 2-4) exist in `index.html` as scaffolds, but World 2 narrative arc is not documented and World 2 boss is not named. World 1 must be validated first.

---

## WHAT STILL NEEDS CLARIFICATION

### Open Item 1: `GAME_STATE.md` Describes a Different Universe
`docs/GAME_STATE.md` (last updated 2026-03-04) references systems that do not appear in the TRANSFER pack:
- "Level15 deterministic combat loop" and "Level16 branch work"
- "AtmosphereV2" with a 5-layer rendering stack
- "MainMode Engine" with "limb economy, sacrifice mechanics"
- Feature flags for `metroidAtmosphereWebGL`, `mainMode`, `fighterEngineV2`

The TRANSFER pack describes World 1 with 5 levels (1-1 through 1-5), mochis, cats, and Big Mochi boss. GAME_STATE.md describes something that sounds like a Metroidvania with deterministic netcode and procedural atmosphere generation.

**Question for Kevin:** Is GAME_STATE.md describing the current `index.html`, or a different branch/version? If current, the TRANSFER pack is significantly understating what's in the codebase.

### Open Item 2: Truth-Sync Docs Referenced but Not Present
The task references four docs that do not exist in the repo:
- `docs/MIGRATION_LOG.md`
- `docs/ACTIVE_WORKING_SET.md`
- `docs/NEW_REPO_STRUCTURE_MAP.md`
- `docs/WORLD1_IMPLEMENTATION_LANE.md`

**Implication:** Either these were planned as outputs of a truth-sync pass that hasn't executed yet, or they exist in a different branch. Implementation clearance is issued based on what IS in the repo, not what was planned.

### Open Item 3: `index (2).html` and `developer version.html` Status
Both are large files at the repo root (1.3MB and 1MB respectively). Their relationship to `index.html` is undocumented. The task description labels them `"runtime_variant_quarantine"` — this matches the ARCHITECT_REVIEW recommendation but has not been recorded in any repo doc yet.

### Open Item 4: `GAME_STATE.md` WebGL Feature Flag
`FEATURE_FLAGS.metroidAtmosphereWebGL` suggests the codebase already has a conditional WebGL path. The old-repo law says Canvas-only. If the feature flag exists in `index.html`, the law was already broken in practice. This needs Kevin's acknowledgment — either the flag is dead code to remove, or Canvas-only is already relaxed.

---

## WORLD-1-FIRST PROTECTED SCOPE

The following scope protection is in effect for all implementation work:

```
PRIORITY 1 (must be stable before anything else):
  Level 1-1  "Ed Wakes Up"
  Level 1-2  "The Cat Rave"
  Level 1-3  "After Dark"
  Level 1-4  "Hippie Bus Highway"
  Level 1-5  "Mochi HQ" (Big Mochi boss)
  World 1 Map (Super Mario World style)

PRIORITY 2 (after World 1 is validated):
  Doc corrections (Lane 3)
  World 1 content polish (Lane 2)

QUARANTINED (do not touch without Kevin's promotion):
  combat/ (legacy runtime dependency — mounted but not promoted)
  cehp_racing_goat.html
  cehp_racing_only.html
  FZeroScene
  RastaCorpBossScene
  World 2+ content

NOT IN REPO YET (do not assume these exist):
  docs/MIGRATION_LOG.md
  docs/ACTIVE_WORKING_SET.md
  docs/NEW_REPO_STRUCTURE_MAP.md
  docs/WORLD1_IMPLEMENTATION_LANE.md
```

---

## LEGACY MOUNTED DEPENDENCY WARNING

**This warning must be read by any agent before touching `index.html`.**

The `combat/` directory contains 33 JavaScript files (17,381 lines total) that are loaded via `<script>` tags in `index.html` (approximately lines 8-40). These files attach to the `CEHP_COMBAT` global namespace using the IIFE pattern.

**What this means:**
- If you delete or move `combat/` files, the game will break.
- If you remove the `<script>` tags from `index.html`, the game will break.
- If you modify combat/ files, you are modifying a quarantined system — stop and check scope.

**What this does NOT mean:**
- Combat/ is not a feature you are building.
- Combat/ is not a system you are polishing.
- Combat/ is not in the same priority tier as World 1.
- The existence of combat/ `<script>` tags does not mean combat is "active."

**The correct mental model:** `combat/` is like a load-bearing wall in a building you're renovating one room at a time. You don't tear it down, you don't paint it, and you don't add a window to it. You walk past it. You work on the rooms that are in scope (World 1).

---

## SUMMARY

| Decision | Ruling |
|----------|--------|
| World 1 coding | **GO** |
| World 1 bug fixes | **GO** |
| World 1 content polish | **GO** (with DO_NOT_BREAK.md guardrails) |
| Doc corrections | **GO** |
| Validation script runs | **GO** |
| Combat feature work | **NO-GO** (quarantined) |
| Racing feature work | **NO-GO** (quarantined) |
| New repo migration | **NO-GO** (stale verification data) |
| World 2+ content | **NO-GO** (World 1 first) |

---

*World 1 is clear to build. Everything else waits.*
