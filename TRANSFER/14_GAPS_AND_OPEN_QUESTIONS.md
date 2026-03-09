# GAPS AND OPEN QUESTIONS
## Cactus Ed's Happy Place — What Still Needs Human or Future-Agent Judgment
### Authority: Claude Sonnet 4.6, Original Architect
### Last updated: 2026-03-09

---

> This document is honest about what is NOT decided. Do not guess about these. Surface them to Kevin before acting. Add new questions here rather than inventing answers.

---

## SECTION 1 — UNRESOLVED DESIGN DECISIONS

### 1.1 Josh's Character Design
**Status:** Scaffolded but undefined
**What exists:** `EWR_STATE.coopMode = false` is set. A second player slot exists in `health[1]` and `maxHealth[1]`. The code comments reference "Josh (TBD character design)."
**What's missing:** Josh's visual design, his move set, his personality, his canonical relationship to Ed.
**Blocker:** Co-op mode cannot be implemented until Kevin and Josh decide: Is Josh a plant? An animal? Human? What's his weapon? Is he also aloof, or is he the foil?
**Who decides:** Kevin + Josh, not an AI agent.

### 1.2 The Aloe Shop — Which Items Are Canon
**Status:** Shop scaffolded (`EWR_STATE.shop` object, 12 item slots), but item list not fully canonized in docs
**What exists:** Shop scaffold and `CigSalesScene` (cig empire management mini-game)
**What's missing:** The exact 12 shop items, their prices, their effects, and which items are mutually exclusive
**Risk:** An agent could implement a shop with items that break the feel or the economy without realizing it
**Who decides:** Kevin, after playtesting World 1 economy

### 1.3 The "God[TM]" Brand — How Far Does It Go
**Status:** LHC Epilogue ends with Ed becoming God[TM]. The trademark symbol is intentional.
**Open question:** Does "God[TM]" appear in the game UI, in level names, in item descriptions? Or is it exclusive to the epilogue?
**Risk:** Overuse dilutes the payoff. Underuse wastes a great bit.
**Who decides:** Kevin

### 1.4 Rasta Corp Sympathy Threshold — Is 4 the Right Number
**Status:** `EWR_STATE.rastaCorp.sympathy >= 4` triggers DarkEpilogue. This was set by Claude in session but not tested with real players.
**Open question:** Is sympathy 4 reachable in normal play? Is it too easy to trigger, or so hard it effectively doesn't exist?
**Risk:** If too easy, most players get the dark ending and miss the God[TM] ending. If too hard, the dark ending is orphaned content.
**Who decides:** Kevin, after playtesting the sympathy system

### 1.5 Commercial Break Cap — 2 Per World, Is That Right
**Status:** `_getCommercialForWorld()` respects a max of 2 per world.
**Open question:** Is 2 the right number? 6 worlds × 2 = 12 total commercial breaks. Is that too many? Too few?
**Risk:** Too many breaks = annoying. Too few = the satirical corporate-interruption bit loses its rhythm.
**Who decides:** Kevin, through playtesting

---

## SECTION 2 — UNKNOWN REPO DEPENDENCIES

### 2.1 The `combat/` Folder — What's Actually In It
**Status:** The `combat/` folder contains a deterministic fight engine (separate from the main game). Its relationship to `index.html` is unclear.
**What's in it:** `core/`, `presentation/`, `data/`, `api/`, `adapters/`, `tools/`, `index.js`
**Unknown:** Is this code integrated into `index.html`? Or is it a standalone prototype that happens to be in the same repo? `GAME_STATE.md` references a "deterministic fight core (Level15)" — is this that?
**Risk:** An agent could accidentally port or integrate this code thinking it's needed, when it may be experimental scaffolding.
**What to do:** Kevin should clarify whether `combat/` content is: (a) already in `index.html`, (b) planned for integration, or (c) an abandoned prototype.

### 2.2 Feature Flags — Which Are Active in the Live Game
**Status:** `GAME_STATE.md` lists several `FEATURE_FLAGS.*` (e.g. `fighterEngineV2`, `fightMkGbaMode`, `metroidAtmosphereMode`). Their current state in `index.html` is not documented.
**Risk:** An agent could flip a flag thinking it's safe, triggering experimental systems that break the live game.
**What to do:** Before any feature flag work, read `index.html` to find the `FEATURE_FLAGS` object and document which are `true` vs `false` in production.

### 2.3 `developer version.html` vs `index.html` — What's the Diff
**Status:** Both files exist in the root. Their relationship is unknown.
**Risk:** An agent could port the wrong file to the new repo, or waste time wondering which is authoritative.
**What to do:** Kevin should state clearly: Is `developer version.html` a superset? A branch? An archived version? Can it be deleted?

### 2.4 `cehp_racing_goat.html` and `cehp_racing_only.html`
**Status:** These appear to be standalone prototypes for the F-Zero racing mini-game.
**Unknown:** Have they been absorbed into `index.html`'s `FZeroScene`? Or do they contain content not yet ported?
**Risk:** Porting these to the new repo signals they're important; not porting them risks losing pre-integration work.
**What to do:** Kevin should verify whether `FZeroScene` in `index.html` contains the final version of the racing logic.

---

## SECTION 3 — WORLD 1 IMPLEMENTATION AMBIGUITIES

### 3.1 Level 1-2 Through 1-4 Playtesting Gap
**Status:** `HANDOFF.md` notes: "Level 1-2 through 1-4 use factory — not as thoroughly playtested as 1-1."
**Unknown:** Are there collision bugs, camera clamp issues, or mochi pathfinding failures in these levels?
**Risk:** An agent assumes W1 is solid and builds W2 on top of a broken foundation.
**What to do:** Play all 5 World 1 levels before starting any World 2 work. Document any bugs found in this file.

### 3.2 Boss Health Bar Depth in Level 1-5
**Status:** `HANDOFF.md` notes: "Boss health bar in 1-5 is drawn in `_drawBoss()` — verify it sticks at top of screen."
**Unknown:** Does the boss health bar have `setScrollFactor(0)` applied? If the bar scrolls with the camera, it disappears off-screen during the charge phase.
**What to do:** Play Level 1-5 to the boss and confirm the health bar remains fixed at the top center of the screen throughout the fight.

### 3.3 Cat Petting — Scaffolded but Not Implemented
**Status:** `catsPetted` increments in `EWR_STATE` but no petting mechanic exists. `HANDOFF.md` says "Petting cats = +5 aloe (not implemented yet but scaffolded)."
**Unknown:** What's the intended trigger? Z key near a sitting cat? Proximity auto-trigger? Duration-based?
**Risk:** An agent implements petting with a different trigger than Kevin intended, requiring rework.
**Who decides:** Kevin should specify the exact interaction before implementation.

### 3.4 `_wsTimer` Firing Rate in Level 1-3
**Status:** `HANDOFF.md` notes: "WS_TEXTS in Level 1-3: verify timer fires every ~8s (uses `this._wsTimer`)."
**Unknown:** Whether this timer is working correctly in the current `index.html`.
**What to do:** Play Level 1-3 for 60 seconds and confirm WS_TEXTS flash. If they don't, trace `_wsTimer` initialization in `Level13Scene`'s `create()`.

### 3.5 Bus Parallax Depth in Level 1-4
**Status:** `HANDOFF.md` notes: "Bus parallax in Level 1-4: verify `busParallaxG` layer depth doesn't occlude Ed."
**Unknown:** Current depth setting of `busParallaxG`.
**What to do:** Play Level 1-4 and confirm the bus is visible but appears behind Ed and foreground elements.

---

## SECTION 4 — QUESTIONS THAT SHOULD BE ANSWERED BEFORE WORLD 2

### 4.1 What Is World 2's Narrative Theme?
**Status:** World 2 levels (2-1 through 2-4) exist in `index.html` with names but no detailed design docs available in this transfer pack.
**Question:** What is the emotional/narrative arc of World 2? What does it reveal about Ed, the cats, or the universe that World 1 doesn't?
**Why it matters:** Worlds should escalate the weirdness and the stakes in a coherent direction. If World 2 is just "more levels," the game loses momentum.

### 4.2 What Is the World 2 Boss?
**Status:** `HANDOFF_BIBLE.md` lists boss fights: Daikon Lord (1-5 in new version), Mr. Handtowel (World 3), Mochi Queen (World 4), Insulin Admiral (World 5), Rasta Corp CEO (pending). The World 2 boss is not named.
**Question:** Is there a World 2 boss? If so, who is it? What do they sell?
**Who decides:** Kevin

### 4.3 Does the World Map Anomaly System Work for WorldMap1-5?
**Status:** `CACTUS_ED_AI_GAMEPLAN.md` notes: "World Map Anomaly Counter — PARTIAL — WorldMap6 done; WorldMap1-5 being added (Gemini Round 2)."
**Question:** Was this completed? Do WorldMap1-5 display anomaly overlays?
**What to do:** Verify by checking `index.html` for `_drawAnomalyOverlay` calls in `WorldMap1Scene` through `WorldMap5Scene`.

### 4.4 Is the Save System Ready for World 2 Content?
**Status:** `GAME_STATE.md` notes save versioning/migration framework exists. But it's unclear if new fields for World 2 (race scores, additional player positions) are included.
**Question:** If a player saves mid-World 2 and loads, does the game correctly restore world map position, level progression, and aloe?
**What to do:** Test save/load cycle manually before shipping any World 2 content.

### 4.5 What Happens to the World 1 World Map After World 2 Is Beaten?
**Status:** Unknown. Does the World 1 map remain accessible? Does it show a "cleared" state? Can the player return to replay levels?
**Why it matters:** If the player can't return to World 1, farming aloe from early levels is impossible and the economy becomes more restrictive.
**Who decides:** Kevin

---

## SECTION 5 — QUESTIONS TO LOG AS THEY ARISE

*Future agents: add questions here rather than guessing. Format:*

```
### [DATE] — [QUESTION TITLE]
**Context:** What were you working on when this came up?
**Question:** The specific thing you don't know
**Risk if guessed wrong:** What breaks
**Who decides:** Human or agent?
```

---

### 2026-03-09 — Does `index (2).html` Contain Content Not in `index.html`?
**Context:** Two `index.html` variants exist in root: `index.html` and `index (2).html`.
**Question:** Is `index (2).html` a newer version, an older backup, or a parallel experiment?
**Risk if guessed wrong:** Porting the wrong file to the new repo corrupts the bloodline.
**Who decides:** Kevin

---

### 2026-03-09 — Rasta Corp CEO Boss — Sympathy vs. Defeat Routing
**Context:** Reviewing boss fight design in briefing docs.
**Question:** When the player defeats the Rasta Corp CEO: does `sympathy` increment BEFORE or AFTER the `_triggerFourthWallBreak`? The sequencing affects whether the DarkEpilogue check fires at the right moment.
**Risk if guessed wrong:** Players who've accumulated sympathy don't get DarkEpilogue; or players get DarkEpilogue before the monologue plays.
**Who decides:** Claude (architectural), but needs code review before shipping.

---

*This document should grow over time. An empty gaps doc is a dangerous gaps doc.*
