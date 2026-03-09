# DRIFT WARNINGS AND KILL SWITCHES
## Cactus Ed's Happy Place — Detect and Stop Drift Before It Kills the Game
### Authority: Claude Sonnet 4.6, Original Architect

---

> Drift is how games lose their soul without anyone noticing. Each type of drift below has observable symptoms, a root cause, and a kill switch. When you see the symptom: stop, diagnose, fix, then re-read `10_ARCHITECT_GUARDRAILS.md`.

---

## DRIFT TYPE 1 — SOUL DRIFT

**What it is:** The game stops feeling like a game built by a cactus who loves cats and cigarettes and is slightly out of sync with consensual reality. It starts feeling like a normal platformer with funny art.

**Symptoms:**
- New dialogue is just "funny" without being strange
- Ed has opinions, reacts emotionally, or expresses enthusiasm
- The world responds to absurdity with surprise instead of bureaucratic normality
- Level names sound like game level names instead of municipal reports
- The ending feels earned in a conventional "hero wins" way

**Root cause:** Agent optimizes for conventional "good game design" instead of this specific game's design.

**Kill switch:** Re-read the "NOTE ON THE SOUL OF THIS GAME" section of `HANDOFF_BIBLE.md`. Then re-read the LHC Epilogue scene. If what you're building doesn't feel like it belongs in the same universe as "Ed walks into the Large Hadron Collider and becomes God[TM]," you have drifted.

**Fix:** Strip the new content back to its core premise. Ask: "What would this look like if the world processed it as a routine administrative event?" Rebuild from there.

---

## DRIFT TYPE 2 — HUMOR DRIFT

**What it is:** The humor shifts from sincere institutional absurdism to knowing winking comedy, meme language, or shock humor.

**Symptoms:**
- WS_TEXTS reference internet culture or current events
- Commercial break dialogue sounds like parody ads instead of sincere corporate ones
- Cat dialogue becomes quippy or tries to be funny instead of profound
- Boss names or level titles sound like someone is trying to be clever
- Fourth wall breaks feel like jokes instead of genuine ruptures

**Root cause:** Agent pulls from a general comedy training distribution instead of the specific Wonder Showzen × Adventure Time × late capitalism satire register.

**Specific tell:** If a cat says something that would work as a tweet, it has drifted. Cats say things that would work as graffiti on the wall of a philosophy department bathroom.

**Kill switch:**
- Re-read `WS_MSGS` in `index.html` (lines ~50-200). Notice: they don't wink. They accuse.
- Re-read the cat dialogue pool (`WS_CAT_SPEECH`). Notice: they sound like they've been thinking about this for years.
- If your new text doesn't fit in those arrays, it has drifted.

**Fix:** Write the new content as if it were a policy announcement from a government agency that genuinely believes what it's saying. Then cut it by 40%. Then remove any word that's trying to be funny.

---

## DRIFT TYPE 3 — FEEL DRIFT

**What it is:** The physical feel of playing the game changes. Ed feels different to control. Momentum, jump arc, punch timing — any shift here breaks the established contract with the player.

**Symptoms:**
- Jump height feels different
- Punching feels delayed or too fast
- Ed's walk speed has changed
- Coyote time or jump buffer no longer work as expected
- Camera scroll feels choppy or lurching

**Root cause:** An agent modifies `ED_MOVE` constants, changes the physics update order, or alters the `ep` (physics object) without understanding the cascade effects.

**Critical constants — do not modify without explicit human instruction:**
```javascript
ED_MOVE = {
  walkSpeed: 140,
  jumpVel: -520,
  jumpCut: 0.4,
  airControl: 0.75,
  coyoteMs: 90,
  jumpBufMs: 130,
  maxFall: 700,
  punchRange: 56,
  kickRange: 72
}
```

**Kill switch:** If `ED_MOVE` has changed values from the above, revert immediately. If the physics feel wrong but `ED_MOVE` is unchanged, check: (1) the order of the physics update loop, (2) whether `delta` is being used correctly (it's in ms, not seconds — see `var dt = delta/1000`).

**Fix:** Load the last known-good version of Level 1-1 in a browser. Play for 2 minutes. Your hands remember what Ed feels like. Then fix the new code until it matches that memory.

---

## DRIFT TYPE 4 — REWARD DRIFT

**What it is:** The economy of the game shifts so that aloe feels meaningless, or so that earning rewards feels like grinding rather than satisfying progress.

**Symptoms:**
- Level rewards reduced without compensation elsewhere
- Shop prices inflated beyond what normal play earns
- Aloe pickups sparse enough that levels feel empty
- Boss reward doesn't feel substantially bigger than level rewards
- Player can softlock by running out of aloe for shop items they need

**Root cause:** Agent treats the economy as a tuning problem without understanding that aloe is an emotional signal, not just a number.

**Canonical reward tier:**
```
Cat pet: 5 aloe (small moment of tenderness)
Aloe pickup: 15 aloe (regular beat)
Mochi death: 8 aloe (combat payoff)
Level 1-1 beat: 50 aloe (checkpoint satisfaction)
Level 1-2 beat: 80 aloe (escalating pride)
Boss kill: 300+ aloe (major achievement)
Secret find: 20 aloe (discovery delight)
```

**Kill switch:** If any reward has been reduced without a corresponding increase elsewhere, revert the change. The economy is not a problem to solve; it is a feeling to maintain.

**Fix:** Play through World 1 start to finish. If at any point you feel like you're grinding, the economy is broken. Restore the canonical values and start from there.

---

## DRIFT TYPE 5 — TRANSITION DRIFT

**What it is:** Scene transitions — between levels, to world maps, into boss fights — become abrupt, confusing, or break the game's established pacing.

**Symptoms:**
- Level complete triggers immediately without the 3-second celebration window
- World map doesn't reflect correctly which levels have been beaten
- Boss fights can be entered without completing prerequisite levels
- Particle pools bleed between scenes (explosions appearing in wrong positions)
- Flash messages are unreadable (too short, wrong font, wrong depth)

**Root cause:** An agent adds or modifies transition code without checking the `_beatLevel()` and `scene.start()` patterns, or forgets to clear particle pools.

**Kill switch — mandatory transition checklist:**
```javascript
// In every create():
EX_POOL.length = 0;
SMOKE_POOL.length = 0;
FIRE_POOL.length = 0;

// Level complete pattern (do not shortcut):
if (this._beaten) return;
this._beaten = true;
EWR_STATE.levelsBeaten.push(levelId);
EWR_STATE.aloe += reward;
this._flash('LEVEL COMPLETE! +' + reward + ' ALOE', 3000);
this.time.delayedCall(3200, function() { self.scene.start('WorldMap'); });

// World gate check (sequential unlock):
// 1-2 requires '1-1' in levelsBeaten
// 1-3 requires '1-2', etc.
```

**Fix:** If transitions are broken, trace the `_beaten` flag and the `levelsBeaten` array through the broken flow. The pool clearing and the `_beaten` guard are the two most common failure points.

---

## DRIFT TYPE 6 — STATE/FLAG DRIFT

**What it is:** `EWR_STATE` becomes inconsistent — fields are missing, renamed, or populated with unexpected values, causing downstream systems to break silently.

**Symptoms:**
- World 3 gate doesn't recognize Rasta Corp encounter count
- Commercial breaks fire more than twice per world
- Sympathy counter doesn't trigger DarkEpilogue at >= 4
- `levelsBeaten` check fails because a level ID was logged with wrong format (e.g. `'11'` instead of `'1-1'`)
- Shop items appear purchased when they shouldn't be

**Root cause:** Agent adds new levels or systems without matching the exact `EWR_STATE` field names and formats established in the canonical state object.

**Canonical level ID format:** `'1-1'`, `'1-2'`, `'2-3'`, etc. — always `'world-level'` with a hyphen. Never `'11'`, `'Level11'`, or `'l1_1'`.

**Kill switch:** If behavior is wrong, `console.log(JSON.stringify(EWR_STATE))` at the start of any scene. Verify all expected fields exist with correct types. Verify `levelsBeaten` entries use hyphen format.

**Fix:** Add a state migration check in `BootScene`. If a field is missing, set it to its default value. Never assume state is clean.

---

## DRIFT TYPE 7 — UI DRIFT

**What it is:** The HUD, flash messages, or UI elements change color, font, position, or depth in ways that fight against the established Adventure Time aesthetic.

**Symptoms:**
- Text is not in monospace font
- Outlines are missing or wrong color (should be `#2d1b00` for world elements, black for UI text)
- HUD appears at wrong depth and gets occluded by game elements
- Flash messages have wrong duration (they should be readable but not linger)
- Aloe counter uses wrong color (should be `AT.uiGold` = `#ffd60a`)
- Health bar uses wrong red (should be `AT.uiRed` = `#ff4444`)

**Root cause:** Agent adds UI elements without referencing the `AT` color palette object.

**Canonical UI constants:**
```javascript
AT.uiBg     = '#1a0a2e'   // dark purple — background panels
AT.uiPanel  = '#2d1254'   // medium purple — panel fill
AT.uiText   = '#f5f0dc'   // cream — primary text
AT.uiGold   = '#ffd60a'   // yellow — aloe, currency, rewards
AT.uiRed    = '#ff4444'   // red — health, danger
AT.outline  = '#2d1b00'   // dark brown — THE Adventure Time outline
```

**Kill switch:** If a UI element doesn't use the `AT` palette, it is wrong. No exceptions.

**Fix:** Replace all hardcoded color hex values with references to `AT.*`. Verify depth ordering: world elements on lower depths, HUD elements on depth 30+, with `setScrollFactor(0)` for fixed-position UI.

---

## MASTER KILL SWITCH TABLE

| If X happens | Stop and fix Y |
|-------------|----------------|
| Ed says more than 8 words | Cut the dialogue until it fits |
| Ed expresses surprise or enthusiasm | Remove the expression entirely. Ed continues. |
| A new text feels like a joke | Rewrite it as a municipal announcement |
| Any `ED_MOVE` constant changed | Revert immediately, no exceptions |
| Aloe reward reduced anywhere | Revert or compensate with equivalent elsewhere |
| Level IDs aren't in `'W-L'` hyphen format | Fix all instances before any other work |
| Particle pools not cleared in `create()` | Add the 3-line clear immediately |
| `var LW` is not the FIRST line of `update()` | Move it. JS hoisting will break camera clamp otherwise. |
| A new scene uses WebGL | Force `Phaser.CANVAS` or remove the scene |
| Any `let`, `const`, `=>`, or `class` appears | Rewrite in ES5 before committing |
| A commercial break ad sounds like parody | Rewrite as sincere corporate copy |
| Rasta Corp becomes sympathetic enough to root for | Add one more thing it's selling that it shouldn't be |
| A cat says something that sounds like a tweet | Give the cat a real thought instead |
| `EWR_STATE.rastaCorp.sympathy >= 4` and no DarkEpilogue | Trace the `_triggerFourthWallBreak` chain immediately |
| New file created outside `index.html` | Delete it unless human explicitly authorized it |

---

*Drift is patient. Kill switches are fast. Use them.*
