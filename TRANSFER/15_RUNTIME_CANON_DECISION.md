# RUNTIME CANON DECISION
## Cactus Ed's Happy Place — Technical Identity vs. Future Architectural Law
### Authority: Claude Sonnet 4.6, Normalization Pass
### Last updated: 2026-03-10
### Status: AUTHORITATIVE — supersedes any reading of legacy technical laws as future mandates

---

> This document draws the line between what the OLD REPO IS and what the NEW REPO MUST DO. These are not the same thing. Read this before making any architectural decisions for the new repo.

---

## THE DECISION

**ES5 + Canvas + One File is the old repo's technical identity. It is NOT a mandatory architectural law for the new repo.**

---

## WHAT THIS MEANS IN PRACTICE

### For the OLD REPO (`index.html` in this repo):
- ES5 is the law. `var`, `function(){}`, prototype OOP only.
- Canvas renderer is the law. `Phaser.CANVAS` forced. No WebGL.
- One file is the law. Everything lives in `index.html`. No exceptions without Kevin's explicit sign-off.
- These constraints are real, active, and non-negotiable for any work on the existing codebase.
- Do not modify `index.html` with ES6+ syntax. It will break.

### For the NEW REPO (migration target):
- ES5 + Canvas + One File describes the **aesthetic and deployment philosophy**, not the syntax jail.
- The new repo runtime strategy for World 1 is: modernize structure, not runtime. Keep it static and browser-runnable with no bundler, no transpiler, and no build step in this phase.
- The new repo MUST preserve: the aesthetic, the soul, the character, the humor engine, the retention philosophy.
- What is protected forever is **what the game feels like**, not **what JavaScript version it uses**.
- If the new repo uses ES6+, the old-repo vibe checklist items about ES5 syntax become advisory, not law.

---

## WHY THIS DISTINCTION EXISTS

The old repo was built in ES5 + Canvas + One File for specific reasons:
1. **No build step** — GitHub Pages deployment with zero tooling friction
2. **Maximum portability** — runs on anything that can load a URL
3. **Aesthetic coherence** — the flat, procedural, hand-drawn quality matches the hand-built code style
4. **Kevin's personal preference** at time of construction

These reasons are valid and real. But they describe **why the old repo works the way it does** — not a permanent covenant binding future versions of the game to 2015-era JavaScript syntax.

---

## THE SOUL CONSTRAINTS THAT DO TRANSFER (these are always law)

Regardless of new repo architecture, these are permanent:

1. Ed is aloof, deadpan, and sparse. He does not get excited.
2. The world speaks in institutional language. Always.
3. The humor engine is counterfeit educational framing applied to chaos.
4. The cats are philosophers, not comedic relief.
5. The retention model is generous: give players things, don't withhold punitively.
6. World 1 is the proof of concept and the emotional baseline. Protect it.
7. No dark patterns, no predatory retention mechanics.
8. Rasta Corp[TM] is sincerely absurd. Never let it become genuinely evil or sympathetic.

These soul laws have no expiration date. They are not tied to ES5 or Canvas.

---

## THE DEPLOYMENT PHILOSOPHY THAT TRANSFERS (shape, not syntax)

The new repo should preserve the spirit of the old deployment model:
- Fast to load
- No unnecessary dependencies
- Playable without setup
- The game should still feel like it was built by a human in a garage at 2am

For the active migration lane, keep the no-build browser model while extracting structure into multiple files. The **feel** is law. The **mechanism** stays static-browser in World 1-first migration.

---

## WHAT IS NOT TRANSFERABLE

The following are legacy context only — informative but not binding on new repo decisions:
- The specific Phaser CDN URL
- The `wc -l` line count of `index.html`
- The `Phaser.CANVAS` config value (unless Canvas-first is explicitly retained)
- Any ES5-specific patterns in the vibe checklist

---

## MIGRATION PROTOCOL

When migrating to the new repo:
1. Kevin must decide explicitly: **retain ES5 + Canvas + One File, or modernize?**
2. Document that decision in `TRANSFER/12_FIRST_10_DECISIONS_FOR_NEW_REPO.md` Decision #1.
3. If modernizing: run the soul laws (above) against the new architecture before shipping anything.
4. If retaining: the old-repo laws apply in full. Nothing changes.
5. Do not assume. Ask Kevin.

---

*The runtime is mortal. The soul is not.*


---

## TRUTH SYNC ADDENDUM (2026-03-10)

- Current repo is multi-folder and migration-normalized.
- `index.html` remains canonical runtime entry.
- `combat/` is physically quarantined under `legacy/quarantine/combat/` but still mounted as a legacy runtime dependency.
- Do not detach combat runtime dependencies in this pass.
