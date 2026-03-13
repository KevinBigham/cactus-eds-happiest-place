# Cactus Ed GitHub Transfer File List

## Required To Merge

These are the files that matter for the current live project state before merge:

1. Local source runtime: `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.html`
2. Local transfer doc: `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CLAUDE_CODE_GITHUB_PUSH_PROMPT.md`
3. Local transfer doc: `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CODEX_CONTINUATION_PROMPT.md`
4. Local transfer doc: `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/GITHUB_TRANSFER_FILE_LIST.md`

## Target Paths Inside The GitHub Repo

After merge, these are the repo paths that should exist:

1. `index.html` ← replace with the latest `CactusEd_FULL_GAME.html` runtime
2. `docs/CLAUDE_CODE_GITHUB_PUSH_PROMPT.md`
3. `docs/CODEX_CONTINUATION_PROMPT.md`
4. `docs/GITHUB_TRANSFER_FILE_LIST.md`

## Optional Checkpoints

These are local safety snapshots. They are useful for rollback or archaeology, but they do not need to be committed unless you want them in the repo history.

1. `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-goat-backup.html`
2. `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-first-session-goat-backup.html`
3. `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-backup.html`
4. `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-pass-complete.html`

## Current Truth

- The project folder here is not a git repo.
- The live local file to treat as source of truth before merge is `CactusEd_FULL_GAME.html`.
- The canonical repo runtime after merge should be `index.html`.
- The latest implementation pass is the "Promise-Kept" pass on top of the prior honest-core and first-session passes.
- Save compatibility was preserved.
- The game remains single-file HTML, ES5 JavaScript, no build step.

## What Changed In The Latest Pass

- Added readable-window scheduling helper for PA, ad, and boss-ceremony timing.
- Strengthened World 1 payoff chain: annex -> cross-department panel -> Return Desk terminal -> memorial ledge reward.
- Added World 1 reconnect belt and late-Compliance counselor pre-teach.
- Applied stronger World 2 entry geometry and Graduation Lawn boss rehearsal.
- Applied stronger World 3 entry/boss-approach geometry and pre-auth rehearsal.
- Added per-world debug summary output via `window.CACTUS_ED_DEBUG_FIRST_SESSION`.
- Fixed lingering boss honesty bugs discovered during implementation.

## Recommended Commit Scope

If you want a minimal clean commit, commit only:

1. `game/CactusEd_FULL_GAME.html`
2. `docs/CLAUDE_CODE_GITHUB_PUSH_PROMPT.md`
3. `docs/CODEX_CONTINUATION_PROMPT.md`
4. `docs/GITHUB_TRANSFER_FILE_LIST.md`
