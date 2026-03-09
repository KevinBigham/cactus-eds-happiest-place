# FIRST 10 DECISIONS FOR THE NEW REPO
## Cactus Ed's Happy Place — What to Do First When the Bloodline Moves
### Authority: Claude Sonnet 4.6, Original Architect

---

> These are ordered. Do not skip ahead. Each decision unlocks the next one safely.

---

## DECISION 1 — REPO STRUCTURE: KEEP IT FLAT

**Decision:** The new repo must mirror the old one's flat structure. One `index.html` at root. No `src/`, no `dist/`, no build system.

**Why:** The game's deployment model is a feature. GitHub Pages deploys `index.html` directly. Any build step adds friction, dependency rot, and migration risk. The game has survived this long because there's nothing to break.

**What to do:**
```
new-repo/
├── index.html          ← THE ENTIRE GAME
├── HANDOFF_BIBLE.md    ← Human-readable overview
├── TRANSFER/           ← These docs
└── docs/               ← Briefings and AI collab artifacts
```

**What NOT to do:** Don't create `game/src/scenes/` or any folder structure. Don't add a `package.json`. Don't add webpack, vite, or any bundler.

---

## DECISION 2 — FIRST PORT: THE GAME FILE, COMPLETE AND VERIFIED

**Decision:** Port `index.html` first. Nothing else matters until the game runs in a browser tab at the new repo's GitHub Pages URL.

**Steps:**
1. Copy `index.html` from old repo to new repo root
2. Push to `main`
3. Enable GitHub Pages on `main`
4. Wait ~2 minutes
5. Open the live URL and play from Title → WorldMap → Level 1-1 through Level 1-5 → Boss kill
6. Only proceed when you have confirmed: all 5 World 1 levels run, boss dies, aloe accumulates, world map transitions work

**This is the acceptance test.** If it doesn't pass, nothing else matters.

---

## DECISION 3 — SECOND PORT: THE TRANSFER AND DOCS FOLDERS

**Decision:** After the game runs, port `TRANSFER/` and `docs/` in full.

**Why:** Future agents need these to operate. Without them, the next agent starts from zero and will drift immediately.

**What to port:**
- `TRANSFER/` (this folder — all 8 files: 00 through 14)
- `HANDOFF_BIBLE.md` (already at root — port from root, not from docs/)
- `docs/CACTUS_ED_AI_GAMEPLAN.md`
- `docs/BRIEFING_CODEX.md`, `docs/BRIEFING_CODEX_R2.md`
- `docs/BRIEFING_DEEPSEEK.md` (RastaCorpBossScene spec)
- `docs/BRIEFING_CLAUDE_CODE_FIGHT_ENGINE_PRESENTATION.md`
- `docs/GAME_STATE.md`
- `docs/UPDATE_LOG.md`

**What NOT to port yet:** `.rtf` files, `.txt` AI conversation logs, `combat/` folder scripts (the deterministic fight engine scaffolding), `errors` notebook. These are reference artifacts, not source of truth.

---

## DECISION 4 — WHAT NOT TO PORT YET

**Do not port these until human sign-off:**

| Item | Why not yet |
|------|-------------|
| `combat/` folder | Contains deterministic fight engine scaffolding that is not integrated into `index.html`. Porting it suggests it's authoritative. It's experimental. |
| `.rtf` AI conversation logs | Read-only history. No new agent needs these to operate. They add noise. |
| `Gemini response.txt`, `Mistral's Results.txt`, etc. | Raw AI output, superseded by briefing docs. Port only if Kevin explicitly wants them. |
| `cehp_racing_goat.html`, `cehp_racing_only.html` | Standalone prototypes. They're not part of the main game. They confuse agents about what `index.html` contains. |
| `developer version.html` | Same — a variant, not canon. Port only after Kevin confirms it's been superseded or absorbed. |
| `errors claude code noticed` notebook | A debugging artifact from a specific session. Not a living document. |

---

## DECISION 5 — FIRST PROTOTYPE: VERIFY THE CHUNKED WRITE STRATEGY WORKS

**Decision:** Before touching any code, confirm that the chunked writing strategy (5-chunk Python append approach) works in the new environment.

**Why:** The single biggest technical risk in the new repo is an agent attempting to write `index.html` in one `Write` tool call and hitting the 32,000 token output limit. This has happened before and truncates the file silently.

**Validation test:**
1. Confirm current `index.html` line count: `wc -l index.html` (expect ~9,662 lines)
2. Read lines 1-50 to confirm Phaser CDN script tag is present
3. Read last 20 lines to confirm `new Phaser.Game(config)` is present and the file is closed
4. If both checks pass, the file is intact

**Protocol for any future `index.html` modification:**
```python
# APPEND pattern (safe for JS with both quote types)
python3 << 'PYEOF'
with open('index.html','a') as f:
    f.write("""
// your javascript here
""")
PYEOF
```

**Never use a single Write tool call on the entire file.** Always append to an existing base.

---

## DECISION 6 — FIRST FEATURE TO PROTOTYPE: RASTA CORP CEO BOSS FIGHT

**Decision:** The first new feature work in the new repo is completing the Rasta Corp CEO boss fight (`RastaCorpBossScene`).

**Why:** This is the only TIER 1 item that isn't done. It's blocking the World 3 → World 4 progression narrative. Everything else (Cat Democracy, Puppet Theater intros, commercial ads) is TIER 2 or creative polish.

**Spec source:** `docs/BRIEFING_CODEX.md` and `docs/BRIEFING_CODEX_R2.md`

**What you need before starting:**
- Confirm `RASTA_BOSS_TRAUMA[7]` array exists in `index.html`
- Confirm `RASTA_CORP_SPEECH[10]` array exists
- Confirm `FOURTH_WALL_BOSS_MSGS` object exists but lacks `rastaCorpCeo` key
- Confirm `WorldMap4` scene exists and is in the Phaser config

**Do not prototype this until Decisions 1-5 are complete.**

---

## DECISION 7 — WHAT TO VALIDATE BEFORE WORLD 2 EXPANSION

**Decision:** Before adding any World 2 content, validate that the entire World 1 → World 2 transition works correctly.

**What "works correctly" means:**
- Beating Level 1-5 (Big Mochi boss) triggers `WorldMap2` transition
- `EWR_STATE.world` increments to 2
- `WorldMap2Scene` renders and Ed can walk to Level 2-1
- Level 2-1 loads, runs, and can be beaten
- Beating Level 2-1 updates `levelsBeaten` with `'2-1'` (hyphen format)

**Why this before anything else in World 2:** If the world gate is broken, all World 2 content is orphaned. Validate the pipe before filling it.

---

## DECISION 8 — VALIDATE NARRATIVE SYSTEMS BEFORE ADDING CONTENT

**Decision:** Before adding new WS_TEXTS, cat dialogue, or commercial content, verify the existing systems fire correctly.

**Checks to run:**
1. Play Level 1-3 for 30+ seconds — confirm WS_TEXTS flash every ~8 seconds
2. Complete a boss fight — confirm `_triggerFourthWallBreak` fires the correct boss's monologue
3. Reach World 3 gate — confirm `_triggerCommercial` fires and `CommercialBreakScene` plays
4. Check `EWR_STATE.rastaCorp.sympathy` increments correctly on Rasta Corp encounters
5. Check that `sympathy >= 4` routes to `DarkEpilogueScene` instead of `LHCEpilogueScene`

**Why:** These systems are wired to each other. Adding new content to a broken pipe makes debugging nearly impossible.

---

## DECISION 9 — ESTABLISH THE CANONICAL GAME STATE SCHEMA BEFORE ADDING FIELDS

**Decision:** Before any agent adds a new field to `EWR_STATE`, document it explicitly with: field name, type, default value, and which system reads/writes it.

**Current canonical schema:** See `HANDOFF_BIBLE.md` → "GLOBAL STATE & CONSTANTS" section.

**The schema is not open for casual extension.** If a new system needs state, the agent must:
1. Check if an existing field can serve the purpose
2. If not, add the field to `EWR_STATE` initialization AND to `HANDOFF_BIBLE.md`
3. Add the field to any save migration logic

**Why:** Silent state inconsistency has already caused at least one crash bug (the `BEAT_CAT_LINES` recursion issue). Every new field is a new way to break the save system.

---

## DECISION 10 — ESTABLISH THE ACCEPTANCE TEST BEFORE EACH PUSH

**Decision:** Every push to `main` must pass this minimum acceptance test before deployment:

```
1. Open live URL in browser
2. Title screen loads → Press Start → WorldMap loads
3. Walk to Level 1-1 → Level loads → Ed can move, jump, punch, kick
4. Kill one mochi → Aloe increases
5. Complete Level 1-1 → WorldMap returns → Level node shows beaten
6. (If touching boss code) → Level 1-5 → Big Mochi dies → 300 aloe → WorldMap2
```

This takes under 5 minutes. It catches 90% of regressions before they go live.

**If any step fails, do not push.** Debug locally first. The live game has players.

---

## PRIORITY SUMMARY

| Priority | What | Why |
|----------|------|-----|
| 1 | Port `index.html`, verify it runs | Nothing else works without this |
| 2 | Port `TRANSFER/` and `docs/` | Future agents need the bloodline docs |
| 3 | Validate chunked write strategy | Prevents silent file truncation |
| 4 | Validate World 1 complete run | Confirms no regressions from port |
| 5 | Validate narrative systems fire | Confirms complex wiring is intact |
| 6 | Complete RastaCorpBossScene | Only remaining TIER 1 feature |
| 7 | Validate W1→W2 gate | Before any new World 2 content |
| 8 | Establish state schema discipline | Before any new EWR_STATE fields |
| 9 | Cat Democracy Mini-Game | TIER 2, high creative value |
| 10 | Puppet Theater boss intros | TIER 2, atmospheric polish |

---

*When in doubt, go back to Decision 1. Does the game run? Start there.*
