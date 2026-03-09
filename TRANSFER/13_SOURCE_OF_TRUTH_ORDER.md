# SOURCE OF TRUTH ORDER
## Cactus Ed's Happy Place — Reading Order for Future Agents
### Authority: Claude Sonnet 4.6, Original Architect

---

> When two documents conflict, this document decides which one wins. Read in this order. Stop when you have enough context to act. Return here if you're confused about which doc to trust.

---

## THE READING ORDER (mandatory sequence)

### STEP 1 — THE 1-PAGE CANON (read first, always)

**File:** `HANDOFF_BIBLE.md` (root)
**What it is:** The complete technical and narrative overview of the game. One document that covers: what the game is, who Ed is, the technical stack, all scenes, all constants, all patterns, all known bugs and their fixes.
**Why first:** Everything else builds on this. If you haven't read this, you don't know what you're working on.
**Authority level:** AUTHORITATIVE

**After reading, you will know:**
- Ed's character (aloof, deadpan, cigarette lance, sunglasses)
- The one-file architecture and why it exists
- ES5 mandatory (no classes, no arrows, no const/let)
- Canvas renderer mandatory (no WebGL)
- All 5 World 1 levels and their specs
- The `EWR_STATE` schema
- The chunked write strategy (critical for modifying `index.html`)
- All 6 known critical bugs and their fixes

---

### STEP 2 — THE GUARDRAILS (read before writing any code)

**File:** `TRANSFER/10_ARCHITECT_GUARDRAILS.md`
**What it is:** The 21 non-negotiable laws governing the game's soul, tone, feel, and technical identity.
**Why second:** Knowing how to build without knowing what you must protect is how drift happens.
**Authority level:** AUTHORITATIVE — overrides AI briefing documents in case of conflict

**After reading, you will know:**
- The 4 pillars of the game (counterfeit educational universe, Ed as calm center, beautiful recovery, need satisfaction)
- What the game is not (excited Ed, predatory retention, WebGL, ES6, multi-file)
- Humor guardrails (institutional language, deadpan Ed, wise cats, sincere WS_TEXTS)
- Retention guardrails (generous economy, fair death, no grinding)
- World 1 slice guardrails (protect the 5 levels)
- No-drift rules (character, tone, scope, technical, commercial)

---

### STEP 3 — THE DRIFT WARNINGS (read before modifying anything that exists)

**File:** `TRANSFER/11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md`
**What it is:** 7 types of drift with observable symptoms, root causes, and kill switches.
**Why third:** Before you touch existing code, you need to know how to recognize if you've broken something subtle.
**Authority level:** AUTHORITATIVE

**After reading, you will know:**
- How to recognize soul drift, humor drift, feel drift, reward drift, transition drift, state drift, UI drift
- The master kill switch table (If X, stop and fix Y)
- The exact `ED_MOVE` constants that must not change
- The canonical reward tier values
- The mandatory particle pool clearing pattern

---

### STEP 4 — THE WORLD 1 SLICE DOCS

**Files (in order):**
1. `HANDOFF_BIBLE.md` → "LEVEL-BY-LEVEL SUMMARY" section (already read in Step 1, but re-read this section now)
2. `docs/BRIEFING_CLAUDE_CODE_FIGHT_ENGINE_PRESENTATION.md` (if it exists — describes fight system context)
3. `docs/GAME_STATE.md` (current state snapshot — read the "What Is Stable" section)

**What these are:** Detailed specs for each World 1 level and the current codebase state.
**Why fourth:** World 1 is the slice. If it runs correctly, the bloodline is intact. These docs tell you exactly what "runs correctly" means.
**Authority level:** AUTHORITATIVE for World 1 specs; ADVISORY for anything beyond World 1

---

### STEP 5 — THE FIRST 10 DECISIONS

**File:** `TRANSFER/12_FIRST_10_DECISIONS_FOR_NEW_REPO.md`
**What it is:** Ordered list of the 10 decisions to make when setting up the new repo.
**Why fifth:** Now that you know what the game is and what you must protect, you can make decisions safely.
**Authority level:** AUTHORITATIVE for new repo setup; ADVISORY for ongoing development

---

### STEP 6 — THE OPEN QUESTIONS

**File:** `TRANSFER/14_GAPS_AND_OPEN_QUESTIONS.md`
**What it is:** Honest list of unresolved design decisions, implementation ambiguities, and things that need human judgment.
**Why sixth:** Read this before starting any new work so you know what is and isn't decided. Don't guess about open questions — surface them to Kevin.
**Authority level:** ADVISORY — this doc describes what is NOT yet decided

---

### STEP 7 — THE RUNTIME CANON DECISION (read before any new-repo architectural decisions)

**File:** `TRANSFER/15_RUNTIME_CANON_DECISION.md`
**What it is:** The explicit ruling on what is old-repo technical identity (ES5 + Canvas + One File) versus what is future architectural law for the new repo.
**Why seventh:** Without this, agents will read Law 20 and the Vibe Checklist in `10_ARCHITECT_GUARDRAILS.md` and treat ES5/Canvas/One File as a permanent mandate for all future code. This doc draws the line.
**Authority level:** AUTHORITATIVE — overrides any reading of the guardrail docs that treats old-repo technical identity as universal future law

**After reading, you will know:**
- ES5 + Canvas + One File applies to `index.html` unconditionally
- For the new repo, these are Kevin's decision — not automatic mandates
- Which soul laws transfer regardless of architecture (Ed's character, humor engine, retention model)
- The migration protocol for making the runtime decision explicit

---

### STEP 8 — THE COMBAT/RACING SCOPE DECISION (read before migrating any non-World-1 systems)

**File:** `TRANSFER/16_COMBAT_RACING_STATUS_DECISION.md`
**What it is:** The explicit ruling that World 1 is primary scope and `combat/` (and any racing system) is experimental and secondary.
**Why eighth:** Prevents a migration agent from treating `combat/` as production-ready and allocating resources to it before World 1 is validated.
**Authority level:** AUTHORITATIVE for scope prioritization

**After reading, you will know:**
- World 1 must validate before anything else is promoted
- `combat/` is experimental until Kevin explicitly promotes it
- The World 1 checklist (what "validated" means)
- The promotion path for secondary systems

---

### STEP 9 — THE ARCHITECTURAL NORMALIZATION (read to understand what changed and why)

**File:** `TRANSFER/17_ARCHITECTURAL_NORMALIZATION.md`
**What it is:** The audit record from the normalization pass — what was too rigid, what was corrected, legacy vs. future truth, new bloodline protections, migration warnings.
**Why ninth:** Gives you the full picture of why the guardrails look the way they do now, and what the remaining open decisions are.
**Authority level:** AUTHORITATIVE for understanding what was changed; ADVISORY for decisions that remain open (those still require Kevin)

**After reading, you will know:**
- The five things that were too rigid in the original pack
- What each correction changed and what stayed the same
- The legacy-vs-future truth table
- The eight permanent bloodline protections
- Six migration warnings to watch for

---

### STEP 10 — THE AI BRIEFING DOCS (reference only, as needed)

**Files:** `docs/BRIEFING_CODEX.md`, `docs/BRIEFING_CODEX_R2.md`, `docs/BRIEFING_GEMINI_R2.md`, etc.
**What these are:** Task specifications given to specific AI agents during the multi-AI collaboration rounds.
**Why last:** These are implementation specs, not design authority. They describe what was requested, not what was decided. Read them when you're implementing a specific feature.
**Authority level:** ADVISORY — defer to `HANDOFF_BIBLE.md` and the TRANSFER guardrail docs when these conflict with anything above

---

## AUTHORITY HIERARCHY (who wins when docs conflict)

```
TIER 1 — AUTHORITATIVE (these win)
├── HANDOFF_BIBLE.md (root)
├── TRANSFER/10_ARCHITECT_GUARDRAILS.md
├── TRANSFER/11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md
├── TRANSFER/12_FIRST_10_DECISIONS_FOR_NEW_REPO.md
├── TRANSFER/15_RUNTIME_CANON_DECISION.md       (runtime scope ruling — new repo vs old repo)
├── TRANSFER/16_COMBAT_RACING_STATUS_DECISION.md (scope priority ruling — World 1 first)
└── TRANSFER/17_ARCHITECTURAL_NORMALIZATION.md  (normalization audit — what changed and why)

TIER 2 — AUTHORITATIVE FOR THEIR DOMAIN
├── docs/GAME_STATE.md (current technical state)
└── TRANSFER/13_SOURCE_OF_TRUTH_ORDER.md (this doc)

TIER 3 — ADVISORY (use for context, not as law)
├── docs/BRIEFING_CODEX.md
├── docs/BRIEFING_CODEX_R2.md
├── docs/BRIEFING_GEMINI_R2.md
├── docs/BRIEFING_META_R2.md
├── docs/BRIEFING_CHATGPT_R2.md
├── docs/BRIEFING_MISTRAL_R2.md
├── docs/BRIEFING_DEEPSEEK.md
└── docs/CACTUS_ED_AI_GAMEPLAN.md

TIER 4 — HISTORICAL (read-only context, never overrides)
├── Codex response.rtf
├── Gemini response.txt
├── Meta's Results and Convo.txt
├── Mistral's Results and Convo.txt
└── chat gpt response research.md
```

---

## CONFLICT RESOLUTION RULES

**Rule 1:** When a briefing doc (Tier 3) conflicts with a guardrail doc (Tier 1), the guardrail wins. No exceptions.

**Rule 2:** When `GAME_STATE.md` describes technical state that conflicts with `HANDOFF_BIBLE.md`, treat `GAME_STATE.md` as the more recent snapshot and raise the conflict with Kevin before proceeding.

**Rule 3:** When an AI's response from a collaboration round (Tier 4) conflicts with anything above it, assume the AI drifted. Trust the Tier 1-2 docs.

**Rule 4:** When two Tier 1 docs conflict, `10_ARCHITECT_GUARDRAILS.md` wins over `HANDOFF_BIBLE.md` on matters of tone and soul. `HANDOFF_BIBLE.md` wins over `10_ARCHITECT_GUARDRAILS.md` on matters of technical implementation.

**Rule 5:** When you are genuinely uncertain which doc to trust, surface the conflict in `TRANSFER/14_GAPS_AND_OPEN_QUESTIONS.md` and ask Kevin before acting.

**Rule 6:** When `10_ARCHITECT_GUARDRAILS.md` language about ES5/Canvas/One File appears to mandate a specific technical architecture for the new repo, `15_RUNTIME_CANON_DECISION.md` supersedes that reading. The guardrail doc was written for the old repo; file 15 draws the scope boundary explicitly.

**Rule 7:** When scope or priority is ambiguous between World 1 content and `combat/` or racing systems, `16_COMBAT_RACING_STATUS_DECISION.md` is the tiebreaker. World 1 wins.

---

## WHAT EACH DOC IS AUTHORITATIVE FOR

| Doc | Authoritative for | NOT authoritative for |
|-----|-------------------|-----------------------|
| `HANDOFF_BIBLE.md` | Technical implementation, all constants, scene list, bug fixes | Creative decisions post-V2.0 |
| `10_ARCHITECT_GUARDRAILS.md` | Ed's character, tone, humor, soul, retention philosophy | Specific code patterns |
| `11_DRIFT_WARNINGS_AND_KILL_SWITCHES.md` | Recognizing and fixing drift | What to build next |
| `12_FIRST_10_DECISIONS_FOR_NEW_REPO.md` | New repo setup sequence | Ongoing feature development |
| `13_SOURCE_OF_TRUTH_ORDER.md` (this) | Which docs win conflicts | Everything else |
| `14_GAPS_AND_OPEN_QUESTIONS.md` | What is NOT decided | What is decided |
| `docs/GAME_STATE.md` | Current codebase state snapshot | Design authority |
| `docs/BRIEFING_CODEX_R2.md` | CatDemocracyScene spec | Anything about Ed's character |
| `docs/BRIEFING_DEEPSEEK.md` | RastaCorpBossScene spec | Anything about the game's soul |

---

## ONE-LINE SUMMARIES FOR QUICK REFERENCE

```
HANDOFF_BIBLE.md             → How the game works
10_ARCHITECT_GUARDRAILS.md   → What the game must stay
11_DRIFT_WARNINGS.md         → How to know when it's going wrong
12_FIRST_10_DECISIONS.md     → What to do first in the new repo
13_SOURCE_OF_TRUTH_ORDER.md  → Which docs to trust (this doc)
14_GAPS_AND_QUESTIONS.md     → What still needs human judgment
15_RUNTIME_CANON_DECISION.md → Old-repo runtime vs. new-repo architecture
16_COMBAT_RACING_STATUS.md   → World 1 is primary; combat/ is experimental
17_ARCHITECTURAL_NORMALIZATION.md → What was corrected and why
GAME_STATE.md                → Where the codebase is right now
```

---

*When lost: re-read Step 1. When conflicted: re-read this doc. When uncertain: ask Kevin.*
