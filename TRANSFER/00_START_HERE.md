# START HERE
## Cactus Ed's Happy Place — Entry Point for All Future Agents
### Authority: Claude Sonnet 4.6, Original Architect
### Last updated: 2026-03-09

---

> You are about to work on Cactus Ed's Happy Place. Read this file first. Then follow the reading order below. Do not skip steps. Do not write code until you have read through Step 3.

---

## WHAT THIS IS

A single-file Phaser 3.70.0 browser platformer. The entire game lives in `index.html` at the repo root. It runs on GitHub Pages with no build step. It is written in ES5 (no classes, no arrows, no const/let). It uses Canvas renderer only (no WebGL).

Ed is a slow-moving, chain-smoking cactus. He does not react to absurdity. He is absurdity's landlord. Do not make him excited. Do not make him surprised. He continues.

---

## THE TRANSFER PACK (this folder)

These 11 files are your operating system. Read them in order.

```
TRANSFER/
├── 00_START_HERE.md                        ← YOU ARE HERE
├── 10_ARCHITECT_GUARDRAILS.md              ← guardrails for soul, tone, and old-repo technical identity
├── 11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md  ← 7 drift types + kill switches
├── 12_FIRST_10_DECISIONS_FOR_NEW_REPO.md   ← ordered setup sequence
├── 13_SOURCE_OF_TRUTH_ORDER.md             ← which docs win conflicts
├── 14_GAPS_AND_OPEN_QUESTIONS.md           ← what is NOT decided
├── 15_RUNTIME_CANON_DECISION.md            ← old-repo runtime vs. new-repo architecture ← READ BEFORE MIGRATING
├── 16_COMBAT_RACING_STATUS_DECISION.md     ← World 1 primary; combat/ experimental ← READ BEFORE MIGRATING
├── 17_ARCHITECTURAL_NORMALIZATION.md       ← what was corrected in the guardrails and why
├── bootstrap_context.json                  ← compressed context for cold starts
└── migration_manifest.json                 ← exact paths for new repo setup
```

---

## MANDATORY READING ORDER

### Step 1 — `HANDOFF_BIBLE.md` (repo root)
The complete technical and narrative overview. One file. Read it entirely before touching anything.

You will learn: Ed's character, the one-file architecture, ES5 requirement, Canvas requirement, all 5 World 1 levels, EWR_STATE schema, chunked write strategy, all known bugs and fixes.

### Step 2 — `TRANSFER/10_ARCHITECT_GUARDRAILS.md`
21 laws protecting the game's soul. Read before writing any code.

### Step 3 — `TRANSFER/11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md`
7 types of drift with symptoms and kill switches. Read before modifying anything that already exists.

### Step 4 — `TRANSFER/12_FIRST_10_DECISIONS_FOR_NEW_REPO.md`
If you are setting up the new repo, follow these 10 decisions in order. Do not skip.

### Step 5 — `TRANSFER/13_SOURCE_OF_TRUTH_ORDER.md`
Consult this whenever two documents conflict. It decides which wins.

### Step 6a — `TRANSFER/15_RUNTIME_CANON_DECISION.md` ← REQUIRED BEFORE ANY NEW-REPO ARCHITECTURAL DECISION
Read this before making any decisions about the new repo's technical architecture. It draws the line between old-repo technical identity (ES5 + Canvas + One File) and future architectural choices. Without this, you will misread the guardrail laws as universal mandates.

### Step 6b — `TRANSFER/16_COMBAT_RACING_STATUS_DECISION.md` ← REQUIRED BEFORE MIGRATING NON-WORLD-1 SYSTEMS
Read this before migrating `combat/`, racing, or any system outside World 1. World 1 is primary scope. `combat/` is experimental until Kevin explicitly promotes it.

### Step 6c — `TRANSFER/17_ARCHITECTURAL_NORMALIZATION.md`
Read this to understand what changed in the guardrail pack and why. Contains the full audit record: what was too rigid, what was corrected, legacy vs. future truth, bloodline protections, and migration warnings.

### Step 7 — `TRANSFER/14_GAPS_AND_OPEN_QUESTIONS.md`
Read this before starting any new feature work. If a question is here, do not guess — surface it to Kevin.

---

## AUTHORITY HIERARCHY (quick reference)

```
TIER 1 — THESE WIN:
  HANDOFF_BIBLE.md                        (technical implementation)
  TRANSFER/10_ARCHITECT_GUARDRAILS.md     (soul, tone, humor, character)
  TRANSFER/11_DRIFT_WARNINGS.md           (detecting and fixing drift)
  TRANSFER/12_FIRST_10_DECISIONS.md       (new repo setup)

TIER 2 — THEIR DOMAIN:
  docs/GAME_STATE.md                      (current codebase state)
  TRANSFER/13_SOURCE_OF_TRUTH_ORDER.md    (conflict resolution)

TIER 3 — ADVISORY:
  docs/BRIEFING_CODEX*.md
  docs/BRIEFING_DEEPSEEK.md
  docs/CACTUS_ED_AI_GAMEPLAN.md
  (all other briefing docs)

TIER 4 — HISTORICAL (read-only, never override):
  Codex response.rtf
  Gemini response.txt
  Meta's Results and Convo.txt
  Mistral's Results and Convo.txt
```

---

## THE THREE LAWS YOU MUST NEVER BREAK (OLD REPO — `index.html`)

1. **One file.** `index.html` is the entire game. No new files without Kevin's explicit sign-off.
2. **ES5 only.** `var`, `function(){}`, prototype OOP. No `const`, `let`, `=>`, `class`. Ever.
3. **Canvas only.** `Phaser.CANVAS` forced. No WebGL. No exceptions.

Violating any of these breaks the deployment model and the aesthetic. If you feel tempted to break one, re-read `TRANSFER/10_ARCHITECT_GUARDRAILS.md` before acting.

**Note for new-repo work:** These three laws describe the old repo's technical identity. For the new repo, they are Kevin's decision — not automatic mandates. Read `TRANSFER/15_RUNTIME_CANON_DECISION.md` before making new-repo architectural decisions.

---

## FIRST ACTION CHECKLIST (before any code work)

- [ ] Read `HANDOFF_BIBLE.md` in full
- [ ] Read `TRANSFER/10_ARCHITECT_GUARDRAILS.md` in full
- [ ] Read `TRANSFER/11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md` in full
- [ ] Read `TRANSFER/15_RUNTIME_CANON_DECISION.md` before making any new-repo decisions
- [ ] Read `TRANSFER/16_COMBAT_RACING_STATUS_DECISION.md` before migrating non-World-1 systems
- [ ] Confirm `index.html` line count (`wc -l index.html` — expect ~9,662 lines)
- [ ] Confirm first line is a `<script>` tag loading Phaser CDN
- [ ] Confirm last line contains `new Phaser.Game(config)`
- [ ] Read `TRANSFER/14_GAPS_AND_OPEN_QUESTIONS.md` before starting any feature

---

## IF YOU ARE SETTING UP THE NEW REPO

Read `TRANSFER/12_FIRST_10_DECISIONS_FOR_NEW_REPO.md` and `TRANSFER/migration_manifest.json`.
Do not create a build system. Do not create a src/ folder. Do not add package.json.
The flat structure is the architecture. Preserve it.

---

## IF YOU ARE CONFUSED ABOUT WHAT TO BUILD

Check `TRANSFER/14_GAPS_AND_OPEN_QUESTIONS.md`. If it's in there, it's unresolved. Surface it to Kevin rather than inventing an answer.

The highest-priority unfinished TIER 1 item is the Rasta Corp CEO boss fight (`RastaCorpBossScene`). Spec is in `docs/BRIEFING_DEEPSEEK.md`.

---

*When lost: go back to Step 1. When conflicted: read `13_SOURCE_OF_TRUTH_ORDER.md`. When uncertain: ask Kevin.*
