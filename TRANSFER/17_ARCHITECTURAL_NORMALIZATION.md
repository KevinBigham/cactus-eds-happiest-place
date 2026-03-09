# ARCHITECTURAL NORMALIZATION
## Cactus Ed's Happy Place — Guardrail Audit and Migration Hardening
### Authority: Claude Sonnet 4.6, Normalization Pass
### Last updated: 2026-03-09
### Status: AUTHORITATIVE — documents all guardrail corrections from this pass

---

> This document records what was too rigid in the TRANSFER pack, what was corrected, and what new protections exist for the new repo's bloodline. Read before migrating. Read before making architectural decisions.

---

## WHAT WAS TOO RIGID

### 1. ES5 + Canvas + One File stated as universal future law

**Location:** `10_ARCHITECT_GUARDRAILS.md` Part 2 table, Law 20, and the Vibe Checklist (items 7, 10)

**Problem:** These rules were written for the old repo and apply correctly there. But the language used ("Non-negotiable," "These are the technical identity," "No exceptions") presented them as permanent architectural mandates for any future version of the game — including the new repo. A future agent reading this document cold would have no mechanism to distinguish "this applies to `index.html` right now" from "this applies to any code you ever write for this game."

**Risk:** New repo gets locked into ES5 syntax for no reason, or a future architect abandons a cleaner architecture because they believe the law forbids it.

---

### 2. Ed's dialogue rule: "Maximum 8 words per line. No exclamation marks. Ever."

**Location:** `10_ARCHITECT_GUARDRAILS.md` Part 3, Law 2

**Problem:** The spirit of this rule is correct: Ed is sparse, low-temperature, and deadpan. But the hard cap of 8 words is arbitrary and brittle — it would forbid a line that was 9 words and materially better. The "No exclamation marks. Ever." absolute extends to institutional/system language, which is wrong: menus, announcements, Rasta Corp[TM] copy, and bureaucratic signs exist outside Ed's voice and may benefit from louder formal emphasis.

**Risk:** Future agents refuse to write a clearly correct Ed line because it is 9 words. Or they apply Ed's voice rules to menu text and drain the institutional humor out of signs that should sound aggressively bureaucratic.

---

### 3. No carve-out for institutional/system/menu language exclamation marks

**Location:** `10_ARCHITECT_GUARDRAILS.md` Part 3 generally

**Problem:** The humor engine runs on counterfeit institutional language. That language — wellness committee announcements, Rasta Corp[TM] ads, compliance memos — often works precisely because it uses exclamation marks and formal emphasis with complete sincerity. "ALOE REPATRIATION INITIATIVE — COMPLIANCE IS WELLNESS!" is funnier and more on-brand than a flat declarative. The old rule would have prohibited this.

**Risk:** Institutional copy gets flattened into a tone that reads like Ed's voice, which kills the contrast the humor depends on.

---

### 4. Combat/ implied as a coequal system with World 1

**Location:** Scattered references in `10_ARCHITECT_GUARDRAILS.md`, AI briefing docs, and missing any explicit statement of World 1 primacy

**Problem:** The `RastaCorpBossScene` spec in `docs/BRIEFING_DEEPSEEK.md` is detailed and real. Without an explicit statement that World 1 ships first and `combat/` is secondary, a migration agent could reasonably treat `combat/` as production-ready and allocate resources to it before World 1 is validated.

**Risk:** World 1 levels broken in the new repo while combat systems are polished.

---

### 5. No document in the reading order covering runtime canon (files 15-17 missing)

**Location:** `13_SOURCE_OF_TRUTH_ORDER.md` reading order, `00_START_HERE.md` mandatory reading order

**Problem:** The reading order stopped at file 14. Files 15, 16, and 17 — which cover the runtime canon decision, combat/racing scope status, and this normalization — were not listed. A future agent would not know to read them.

**Risk:** Agent reads files 1-14, correctly internalizes the old-repo ES5 law, migrates the new repo to ES5-only without realizing the law has been clarified.

---

## WHAT WAS CORRECTED

### Correction 1: Legacy technical law reframed

In `10_ARCHITECT_GUARDRAILS.md`:
- Part 2 table rows for "A multi-file project," "A WebGL game," and "An ES6+ project" now include a `[OLD REPO]` annotation making clear these are old-repo constraints, not universal future law.
- Law 20 (Technical Drift) now explicitly states these are the technical identity of the **old repo**; the new repo's technical identity is Kevin's decision.
- Vibe Checklist items 7 and 10 now carry `[OLD REPO]` scope annotations.

**What did not change:** The laws still apply fully and without exception to any work on `index.html` in the existing repo.

### Correction 2: Ed's dialogue law normalized

In `10_ARCHITECT_GUARDRAILS.md` Law 2 (Part 3):
- "Maximum 8 words per line" replaced with: **Ed's lines are short by default. The target is 8 words or fewer. Exceptions are allowed when the longer version is materially stronger — not just acceptable, but better.**
- "No exclamation marks. Ever." replaced with: **No exclamation marks in Ed's own voice, ever. This does not apply to institutional language, system text, menus, or Rasta Corp[TM] copy.**

### Correction 3: Institutional language carve-out added

In `10_ARCHITECT_GUARDRAILS.md` Part 3, after Law 2:
- Added explicit statement: **Institutional, system, and menu language MAY use exclamation marks and louder formal emphasis when it serves the counterfeit educational universe.**

### Correction 4: World 1 primacy made explicit

In `10_ARCHITECT_GUARDRAILS.md` Part 5 header:
- Added: **World 1 is the primary scope. It must be complete and stable before any other world or system is promoted.**
- `16_COMBAT_RACING_STATUS_DECISION.md` created as the authoritative document for combat/racing scope status.

### Correction 5: Reading order updated

In `13_SOURCE_OF_TRUTH_ORDER.md`:
- Steps 7, 8, and 9 added for files 15, 16, and 17.
- Files 15-17 placed in Tier 1 of the authority hierarchy.

In `00_START_HERE.md`:
- Steps 6a, 6b, and 6c added (before the Open Questions step) for files 15, 16, and 17.
- THE THREE LAWS section updated with a note about scope.

---

## LEGACY TRUTH VS. FUTURE TRUTH

| Claim | Legacy Truth (old repo) | Future Truth (new repo) |
|-------|-------------------------|-------------------------|
| ES5 only | TRUE — applies to all `index.html` work | Kevin decides — may modernize |
| Canvas only | TRUE — `Phaser.CANVAS` forced in old repo | Kevin decides — may allow WebGL |
| One file | TRUE — `index.html` is the game | Kevin decides — may modularize |
| Ed is sparse and deadpan | TRUE | TRUE — soul law, no expiration |
| No exclamation marks in Ed's voice | TRUE | TRUE — soul law, no expiration |
| Institutional language uses formal emphasis | TRUE | TRUE — humor engine law, no expiration |
| Short lines default for Ed (target 8 words) | TRUE | TRUE — exceptions allowed when materially better |
| World 1 ships before combat/ | TRUE | TRUE — scope law, no expiration |
| combat/ is experimental | TRUE | TRUE until Kevin says otherwise |

---

## NEW REPO BLOODLINE PROTECTIONS

These are the laws that protect the soul of the game regardless of new repo architecture:

**Protection 1: Ed's character is permanent.**
Ed is aloof, deadpan, sparse, and low-temperature. He does not get excited. He does not get surprised. He continues. No architecture change, syntax decision, or framework migration may change this.

**Protection 2: The humor engine is permanent.**
Counterfeit institutional language applied to chaos. The world misclassifies everything in polite bureaucratic terms. This engine must survive any migration.

**Protection 3: Ed's voice has no exclamation marks.**
His lines are short (target 8 words). Exceptions require genuine material improvement, not just preference. This applies forever.

**Protection 4: Institutional language may be loud.**
Menus, announcements, Rasta Corp[TM] copy, compliance text — these may and often should use exclamation marks and formal loudness. The humor depends on the contrast between institutional confidence and the chaos it names.

**Protection 5: World 1 must validate before anything else.**
The five levels, the boss, the map. If any are broken in the new repo, nothing else gets worked on until they're fixed.

**Protection 6: Combat is secondary until promoted.**
`combat/` and any racing system are experimental. They do not get first-class migration treatment. See `16_COMBAT_RACING_STATUS_DECISION.md`.

**Protection 7: Retention is generous, not punishing.**
Players get things. The loop is satisfying. No timers creating anxiety without payoff. No grinding. This is soul law.

**Protection 8: The cats are philosophers.**
Not comedic relief. Wise and tired. Their dialogue should feel like overheard conversation from someone who has figured something out.

---

## MIGRATION WARNINGS

### Warning 1: The old-repo ES5 law will read as universal if you don't read file 15 first.
`10_ARCHITECT_GUARDRAILS.md` still uses strong language about ES5/Canvas/One File. The `[OLD REPO]` annotations clarify scope, but a skimming agent may miss them. Read `15_RUNTIME_CANON_DECISION.md` before making any new-repo architectural decisions.

### Warning 2: "Law 2" about Ed's dialogue is now softer — do not read "exception allowed" as license for verbosity.
The exception exists for the case where 9 words is genuinely better than 8. It does not mean Ed can have long lines. Default remains short. Always.

### Warning 3: The institutional language exclamation-mark carve-out only applies outside Ed's voice.
Ed himself never uses exclamation marks. Signs, menus, Rasta Corp[TM] ads, announcements — these can be loud. Ed cannot.

### Warning 4: Files 15-17 were not present in the original TRANSFER pack.
They were created in this normalization pass. Any agent working from a cached or older version of the pack will be missing them. The reading order now includes them explicitly, but agents working from `00_START_HERE.md` step counts (e.g., "8 files") will see a discrepancy. The file tree count has changed from 8 to 11 files.

### Warning 5: Combat/ promotion requires Kevin's explicit sign-off — not inference.
If `docs/BRIEFING_DEEPSEEK.md` looks complete and polished, an agent might infer it's production-ready. It is not. It is a spec. The system it specifies is experimental until Kevin says otherwise.

### Warning 6: Do not apply this normalization pass to the old repo codebase.
These changes are docs-only. The old repo's `index.html` still runs on ES5 + Canvas + One File and must continue to do so. The normalization is about future decisions, not about modifying the existing game.

---

## GO / NO-GO VIEW FOR MIGRATION

| Gate | Status | Notes |
|------|--------|-------|
| Reading order includes files 15-17 | GO | Fixed in this pass |
| Legacy technical law scoped to old repo | GO | Fixed in this pass |
| Ed dialogue law normalized | GO | Fixed in this pass |
| Institutional language carve-out added | GO | Fixed in this pass |
| World 1 primacy explicit | GO | Fixed in this pass |
| Combat/racing status explicit | GO | `16_COMBAT_RACING_STATUS_DECISION.md` created |
| Old repo codebase untouched | GO | No gameplay code modified |
| Kevin decision required on new-repo architecture | OPEN | Must ask Kevin: retain ES5+Canvas+OneFile or modernize? |
| World 1 must be validated in new repo before promotion | OPEN | Requires playtest pass |
| Combat promotion requires Kevin sign-off | OPEN | Not yet promoted |

**Overall: Docs are migration-ready. Architecture decision on runtime still requires Kevin.**

---

*Bloodline protected. Runtime decision pending human judgment.*
