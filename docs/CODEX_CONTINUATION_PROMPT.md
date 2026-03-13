# Codex Continuation Prompt

Use this prompt with Codex on the next computer after the GitHub push.

---

You are Codex continuing development of `Cactus Ed's Happy Place`, a single-file HTML browser platformer.

## Project Rules

- Single HTML file only.
- Zero build steps.
- ES5 JavaScript only.
- Phaser CDN allowed.
- No module split.
- Preserve save compatibility unless absolutely necessary and explicitly documented.
- Make surgical edits, not a rewrite.

## Source Of Truth

Primary file after GitHub merge:

- `index.html`

Original local pre-merge source:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.html`

Reference docs:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/HANDOFF_BIBLE_v3.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/GITHUB_TRANSFER_FILE_LIST.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CODEX_CONTINUATION_PROMPT.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CLAUDE_CODE_GITHUB_PUSH_PROMPT.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/Session7_Sprite_Prompts.md`

Useful local checkpoints:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-goat-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-first-session-goat-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-pass-complete.html`

## Current State

The game has already passed through three major implementation phases:

1. Honest-core pass
   - controller parity direction
   - boss scheduler and telegraph honesty
   - shared audio cleanup
   - baseline W2/W3 parity wiring

2. First-session GOAT pass
   - opener rewrite
   - contextual hint ladder
   - weirdness gating
   - W2 deterministic quiz triggers
   - W3 waiting-room stillness reward and scan lesson base

3. Promise-kept pass
   - shared `scheduleReadableEvent(scene, channel, delayMs, fn, maxExtraMs)`
   - shared `dumpFirstSessionSummary(scene, label)`
   - W1 callback chain: annex -> cross-department panel -> Return Desk terminal -> memorial ledge reward
   - W1 reconnect belt and counselor pre-teach
   - W2 stronger entry geometry and Graduation Lawn rehearsal
   - W3 stronger entry geometry, scan ladder, recovery foreshadow, pre-auth lamp drill
   - boss ceremony and PA timing delayed to readable windows
   - fixes for W1 pamphlet multi-fire, W1 stamp-queue reroll, and W2 stomp-defeat completion bypass

## Important Live Hooks Already Present

- `recordFirstSessionBeat(scene, id)`
- `showContextHint(scene, hintId, stage)`
- `canDelayWeirdness(scene, channel)`
- `scheduleReadableEvent(scene, channel, delayMs, fn, maxExtraMs)`
- `dumpFirstSessionSummary(scene, label)`
- `scene._session`
- `scene._hintState`
- `window.CACTUS_ED_DEBUG_FIRST_SESSION`

## What Still Needs Real Follow-Through

The highest-value next work is not art-first polish. It is play validation and tuning.

### Priority 1: Real Browser Validation

- Do a full browser playthrough of the first 20-25 minutes.
- Validate:
  - no console errors
  - W1 callback chain pays off clearly
  - W1 counselor pre-teach reads and feels fair
  - W2 trellis / answer lanes / lawn rehearsal are readable
  - W2 stomp and melee boss wins both flow correctly
  - W3 side-window rule is legible without overexplaining
  - W3 scan ladder feels learnable, not sticky or random
  - W3 pre-auth lamp drill pays off naturally before the physician

### Priority 2: Feel Tuning Only

Make small tuning edits, not structural rewrites:

- belt push strength if W1 reconnect feels too weak or too sticky
- counselor pre-teach sweep timing if it catches recovery unfairly
- W2 podium safe-sector pacing if it rotates too quickly
- W3 side-window telegraph strength if players miss the rule
- W3 pre-auth reward placement if it feels disconnected from the rehearsal

### Priority 3: Console / Telemetry Validation

Use:

- `window.CACTUS_ED_DEBUG_FIRST_SESSION = true`

Confirm each world prints useful milestone timing via `dumpFirstSessionSummary`.

## Things To Preserve

- Ed stays the straight man.
- Bureaucratic/document voice only.
- Weirdness must pay rent.
- Cigarette centrality and breakdown ending remain intact.
- No long tutorial walls.
- No build system.
- No save payload churn.

## Things Explicitly Out Of Scope Unless Asked

- Session 7 sprite rollout
- giant late-game rewrite
- splitting the file
- new boss attack families
- replay/archive systems
- external analytics

## Suggested First Command Sequence

1. Open the live HTML.
   - In the repo, this means `index.html`.
2. Search for:
   - `scheduleReadableEvent`
   - `dumpFirstSessionSummary`
   - `_counselorPreteach`
   - `_gardenerPreview`
   - `_preAuthDrill`
3. Validate the first 20-25 minute path in a real browser.
4. Tune only the moments that fail trust, readability, or payoff.

## Deliverable Style

When you continue, report:

1. what you verified in-browser
2. what felt unclear or unfair
3. what small tuning changes you made
4. any remaining risks worth a future pass

---
