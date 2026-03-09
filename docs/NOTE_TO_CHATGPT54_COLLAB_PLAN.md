# Tri-AI Development Operating System: ChatGPT 5.4 + Claude Code + Codex

The repo is already in the right shape for a disciplined loop: a Phaser game centered in `index.html`, with the combat stack loaded from `combat/` modules, plus a live Combat Lab with seven matchup drills and direct hooks for quick smoke, combat audit, balance snapshot, and replay review. That means the right operating model is playtest-led tuning, not more speculative engine churn.

## 1) Roles & Responsibilities (RACI-style)

### Core roles
- **ChatGPT 5.4 — Game Architect**
  - Owns design direction, playtest synthesis, balance hypotheses, milestone framing, and “what problem are we actually solving?”
- **Claude Code — Integrator / Verifier**
  - Owns implementation sequencing, repo-safe change shaping, regression interpretation, verification standards, release notes, and handoff clarity.
- **Codex — Implementer**
  - Owns bounded code execution, tactical passes, small reversible changes, and file-scoped implementation under explicit rules.

### RACI by workflow area
| Workflow area | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Combat tuning | Codex | ChatGPT 5.4 | Claude Code | All |
| Narrative systems | Codex | ChatGPT 5.4 | Claude Code | All |
| Content production (moves, scenarios, slice polish) | Codex | ChatGPT 5.4 | Claude Code | All |
| QA / audit / regression review | Claude Code | Claude Code | ChatGPT 5.4, Codex | All |
| Milestone architecture / roadmap | ChatGPT 5.4 | ChatGPT 5.4 | Claude Code, Codex | All |
| Release / merge recommendation | Claude Code | ChatGPT 5.4 | Codex | All |

### Tie-break rule
- Player outcome beats elegance.
- If the disagreement is “cleaner architecture” vs “clearer match comprehension,” the clearer match wins unless it creates a measurable regression.

---

## 2) Development Cadence (1-week sprint loop)

### Weekly loop
1. Playtest Intake
2. Architect Synthesis
3. Implementation Brief Generation
4. Codex Execution
5. Claude Verification & Integration
6. Release Decision

### Stage-by-stage operating loop
| Stage | Owner | Inputs | Outputs | Required artifact |
|---|---|---|---|---|
| 1. Playtest Intake | Human + ChatGPT 5.4 | raw notes, clips, screenshots, audit bundles, balance snapshots | normalized issue list | Playtest Intake Note |
| 2. Architect Synthesis | ChatGPT 5.4 | intake notes + current repo truth | ranked problem statement, hypotheses, scope recommendation | Synthesis Memo |
| 3. Brief Generation | ChatGPT 5.4 | synthesis memo | exact Codex brief | Implementation Brief |
| 4. Codex Execution | Codex | implementation brief | repo changes + completion report | Completion Report |
| 5. Verification & Integration | Claude Code | diff + completion report + repo state | pass/fail verdict, regression call, merge recommendation | Verification Report |
| 6. Release Decision | ChatGPT 5.4 + Human | verification report + sprint goals | go / no-go / one-more-pass | Release Decision Note |

### 1. Playtest Intake
Use one note per session.

#### Playtest Intake Note
- Build/branch:
- Tester:
- Mode:
- Matchup:
- Scenarios used:
- Top 3 felt problems:
- Top 3 felt wins:
- Repro steps:
- Severity:
  - cosmetic
  - readability
  - fairness
  - frustration
  - blocker
- Evidence attached:
  - audit bundle?
  - balance snapshot?
  - replay review?
  - screenshot/video?
- Rematch score:
  - 1–5
- “Would play again?”:
  - yes / no / uncertain

### 2. Architect Synthesis
Convert noise into a ranked plan.

#### Synthesis Memo
- Problem being solved:
- Why it matters to player outcome:
- Evidence:
- Not in scope:
- Smallest credible fix:
- Risks:
- Success signal:
- Stop condition:

### 3. Implementation Brief Generation
One brief, one problem cluster. No soup.

#### Implementation Brief
- Objective:
- Exact file scope:
- Hard constraints:
- Allowed changes:
- Disallowed changes:
- Success criteria:
- Regression risks:
- Test checklist:
- Required output format:

### 4. Codex Execution
Codex does one bounded pass. No freelancing into adjacent systems.

### 5. Claude Verification & Integration
Claude is the bad cop with receipts.

#### Verification checklist
- Syntax checks pass
- Browser boot still works
- Required scenarios verified
- No owner/routing drift unless explicitly requested
- No new parity failures
- Known baseline status unchanged or improved
- Output/report quality is good enough for handoff
- File scope respected
- No surprise architecture churn

### 6. Release Decision
#### Go / no-go rubric
- **Go:** player problem clearly improved, no new red flags, scope stayed disciplined
- **Conditional go:** improvement real, but one contained known issue remains
- **No-go:** regression introduced, scope drifted, or player outcome unclear

---

## 3) Prompt Contracts Between AIs

### ChatGPT 5.4 -> Codex implementation brief
Use this exact structure:

```text
Objective
- [one player-facing problem only]

Repo
- /Users/tkevinbigham/Downloads/Cactus-Eds-Happy-Place

File scope
- [exact files]
- Do not touch anything else.

Current truth
- [what is already true in repo]
- [what must remain unchanged]

Allowed changes
- [small list]

Hard constraints
- no engine routing changes unless explicitly requested
- no owner flag changes unless explicitly requested
- no event schema changes
- no speculative cleanup
- no architecture churn without evidence

Success criteria
- [specific measurable outcomes]

Regression risks
- [specific likely breakages]

Required tests
- [syntax]
- [browser]
- [scenario list]
- [audit list]

Required output
1. short implementation summary
2. exact files touched
3. key code excerpts
4. how to test
5. what you actually verified
6. risks / next move
```

### Codex -> Claude completion report
Use this exact structure:

```text
Implementation summary
- what changed
- what did not change

Files touched
- exact list

Behavioral claim
- what player-visible behavior should now be better
- what is still weak

Regression declaration
- routing changed? yes/no
- owner flags changed? yes/no
- parity surfaces changed? yes/no
- event payloads changed? yes/no

Test evidence
- syntax checks run
- browser boot run?
- scenarios exercised
- audits run
- exact pass/fail status

Known risks
- [list]

Next recommended move
- [one bounded next pass only]
```

### Claude -> ChatGPT 5.4 post-implementation feedback
Use this exact structure:

```text
Verdict
- pass / mixed / fail

What materially improved
- [player-facing]

What is still weak
- [player-facing]

Regression truth
- [what stayed green]
- [what changed]
- [what baseline non-greens remain unchanged]

Scope discipline
- respected / drifted
- notes

Recommended next action
- tune / freeze / broaden test / rollback

Confidence
- high / medium / low
```

### Contract rules
Every handoff must include:
- exact file scope
- hard constraints
- exact success criteria
- regression risk declaration
- test evidence

If one of those is missing, the handoff is incomplete. Tiny goblin rule. No exceptions.

---

## 4) Decision Framework: Build vs Tune vs Freeze

### Build new content only when all are true
- Existing matchup rematch score averages 4/5 or better
- Same 2-fighter slice produces repeat play without “obvious nonsense” complaints
- Scenarios 1 / 3 / 5 / 6 / 7 are stable enough that testers mostly discuss matchup choices, not broken reads or fake pressure
- No widening audit delta after the last two content passes
- At least 2 external testers want more character/stage variety rather than more clarity/tuning

### Tune existing systems when any are true
- Same complaint appears in 3+ notes across one week
- One of scenarios 1 / 3 / 5 / 6 / 7 produces repeated complaints tied to:
  - anti-air honesty
  - throw/tech interaction
  - corner pressure clarity
  - confirm reliability
  - defensive timing
- Rematch score is below 4/5
- Audit remains stable but player feel is still off
- One move is repeatedly described as:
  - useless
  - doing too many jobs
  - unreadable
  - unfair

### Freeze and collect outside playtest data when all are true
- Quick smoke and combat-focus audit are stable relative to current baseline
- No new red flags for 2 consecutive tuning passes
- Testers stop saying “broken” and start arguing about “style,” “matchup,” or “preference”
- Rematch score averages 4/5+
- Top complaints are no longer systemic; they are now matchup-specific or taste-specific

### Immediate freeze triggers
- Any pass causes architecture churn not justified by data
- Same subsystem regresses twice in two weeks
- Visual polish continues but player comprehension does not improve
- Team starts proposing a third fighter before Ed vs Daikon is clearly worth replaying

---

## 5) Quality Bar & Regression Policy

### Minimal merge standard
Every merged change must meet all of these:
- syntax checks pass
- browser boot works
- relevant gameplay path still runs
- targeted scenarios pass manual spot-check
- audit delta is neutral or positive
- no new parity failures
- no event schema drift
- no stealth routing changes

### Required scenario checks
For combat-facing changes, always check:
- scenario 1: anti-air
- scenario 3: throw-tech
- scenario 5: corner-pressure
- scenario 6: combo-confirm
- scenario 7: defensive-timing

### Audit expectations
- Quick smoke for small changes
- Combat-focus audit for anything affecting match flow
- Full audit before handing to another tester
- Balance snapshot whenever a tuning change alters move role, risk/reward, or recap interpretation

### Regression policy
- If a change introduces a new red, rollback or isolate immediately
- If a change preserves current baseline but fails to improve the player problem, do not stack more changes on top
- If a pass touches routing or architecture without explicit approval, it fails review automatically

### No architecture churn without evidence
This rule is absolute:
- No refactor just because something “looks messy”
- No ownership pass unless a real seam exists
- No cleanup unless route diagnostics or browser evidence prove a branch is safe to touch

---

## 6) 30-Day Roadmap

### Week 1 — Ed vs Daikon truth pass
- Objective: get first real playtest notes from repeated sets and Combat Lab scenarios
- Owner AI: ChatGPT 5.4 leads, Codex supports, Claude verifies
- Deliverables:
  - playtest intake notes
  - one synthesis memo
  - one small tuning brief
- Exit criteria:
  - at least 2 real set reviews
  - top 3 matchup problems clearly ranked

### Week 2 — Small tuning pass
- Objective: fix the highest-signal fairness/readability issue only
- Owner AI: Codex
- Deliverables:
  - one bounded tuning implementation
  - completion report
  - verification report
- Exit criteria:
  - targeted issue improves
  - no new red flags
  - rematch score not worse

### Week 3 — Training / review workflow hardening
- Objective: make scenario loop and review exports feel painless for humans
- Owner AI: Claude Code with ChatGPT 5.4 consultation
- Deliverables:
  - small workflow polish brief
  - updated operating notes
  - balance snapshot examples
- Exit criteria:
  - tester can reproduce a complaint, run audit, and export a useful package in one session

### Week 4 — Outside playtest freeze
- Objective: stop tuning long enough to gather fresh reactions
- Owner AI: ChatGPT 5.4
- Deliverables:
  - freeze recommendation
  - outside playtest packet
  - triage rubric for incoming notes
- Exit criteria:
  - at least 2 outside sessions scheduled or completed
  - no new engine changes until evidence comes back

---

## 7) Communication Protocol

### Daily async update
Max 3 bullets. Format:
- Yesterday: [one concrete thing]
- Today: [one concrete thing]
- Risk/blocker: [one thing or “none”]

No essay. No performance art. Just signal.

### Weekly architecture review agenda
1. What did players actually complain about?
2. What improved materially?
3. What stayed noisy or fake?
4. Did we change too much?
5. Build / tune / freeze decision
6. One-pass plan for next week

### Incident format for regressions
Use this exactly:

```text
Incident
- Date:
- Branch/build:
- Symptom:
- Repro:
- Scope:
- First suspected pass:
- Audit result:
- Browser result:
- Severity:
- Recommendation:
  - rollback
  - isolate
  - accept baseline
```

---

## Final operating rules
- Evidence beats vibes
- Player outcome beats elegance
- Small reversible passes beat heroic rewrites
- One problem cluster per pass
- No new content when the current matchup still feels fake
- No cleanup without route evidence
- No architecture churn without approval
- Every major recommendation must map to a measurable player outcome

## Practical default for the next cycle
Start with:
1. Playtest Intake
2. Architect Synthesis
3. One Codex tuning pass
4. Claude verification
5. Go / no-go

That’s the loop. Keep it boring. Boring is how weird games survive. The repo already has the combat modules loaded through `index.html`, and the lab already gives you seven drills plus one-command audit hooks, so the right next move is disciplined iteration, not fresh engine theology.
