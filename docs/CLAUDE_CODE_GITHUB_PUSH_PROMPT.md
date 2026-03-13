# Claude Code Prompt For GitHub Push

Use this prompt in Claude Code on the machine that will push to GitHub.

---

You are Claude Code helping me merge the latest live state of `Cactus Ed's Happy Place` into this GitHub repo:

`https://github.com/KevinBigham/cactus-eds-happiest-place`

## Goal

Take the current local project state from these source files and merge it cleanly into the GitHub repo, then commit and push.

## Source Of Truth

Primary local source game file:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.html`

Target file inside the GitHub repo:

- `index.html`

Docs to copy into the repo `docs/` folder:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/GITHUB_TRANSFER_FILE_LIST.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CLAUDE_CODE_GITHUB_PUSH_PROMPT.md`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/docs/CODEX_CONTINUATION_PROMPT.md`

Optional local-only backups, do not commit unless I explicitly ask:

- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-goat-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-first-session-goat-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-backup.html`
- `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.pre-promise-kept-pass-complete.html`

## Important Constraints

- Preserve single-file architecture.
- Do not split the HTML or add a build step.
- Treat the current local HTML as newer than anything in the repo unless you find a direct conflict that needs human review.
- Preserve save compatibility.
- Do not overwrite the live game with older repo content.
- Prefer a minimal merge focused on the actual changed files.
- Replace repo-root `index.html` with the current local `CactusEd_FULL_GAME.html` runtime.

## Latest Implemented State

The live HTML already includes:

- Honest-core controller parity and boss honesty work.
- Shared audio cleanup.
- First-session opener rewrite and hint system.
- Promise-kept pass:
  - readable-window scheduling for PA/ad/boss ceremony
  - World 1 callback chain and counselor pre-teach
  - World 2 stronger entry geometry and Gardener foreshadow/pre-teach
  - World 3 stronger entry geometry and Physician foreshadow/pre-teach
  - per-world first-session debug summaries
  - fixes for lingering boss honesty regressions found during implementation

## Specific Checks Before Push

1. Clone or open the GitHub repo locally.
2. Replace repo `index.html` with:
   - `/Users/kevin/Desktop/Cactus Eds Happiest Place/cactus-ed-handoff/game/CactusEd_FULL_GAME.html`
3. Copy in the required docs from the local workspace into repo `docs/`.
4. Verify the merged HTML still parses as JavaScript.
5. Confirm no save-key or payload changes were introduced.
6. If the repo has older copies of the same backup files, do not replace them unless I ask.
7. Show me the final diff summary before commit.

## Suggested Commit Message

`Replace canonical runtime with promise-kept pass and add handoff docs`

## Suggested PR / Commit Summary

- strengthen first-session trust arc across Worlds 1-3
- add callback/payoff chain in World 1
- add readable boss foreshadow and pre-teach in all worlds
- improve interruption timing, hint progression, and optional route payoff density
- add transfer and continuation handoff docs

## If You Hit Merge Conflicts

- Prefer the local live HTML unless the repo contains clearly newer intentional work.
- If there is non-obvious overlap, stop and summarize the conflict instead of guessing.

## Deliverable

I want:

1. the merged files in the GitHub repo working tree
2. a short diff summary
3. the commit hash
4. confirmation of push success
5. the pushed branch name

---
