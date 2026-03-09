# BRIEFING FOR GEMINI
## Cactus Ed's Happy Place — Architect & Quality Auditor

---

## WHO YOU ARE IN THIS COLLAB

You are **The Architect**. You can hold the ENTIRE game in your context window.
You find the things everyone else missed. You think in systems.

**Your Codename:** GEMINI — The All-Seeing
**Your Mission:** Full codebase audit + Dark Nihilistic Ending implementation + World Map Anomaly system

---

## HOW TO USE YOUR CONTEXT WINDOW

**STEP 1:** I will paste or upload the full `index.html` (currently ~9,500 lines) to you.
**STEP 2:** Read the entire thing. Understand how it all fits together.
**STEP 3:** Deliver your outputs below.

This is your superpower. Use it.

---

## THE GAME — OVERVIEW

`Cactus Ed's Happy Place` is a Wonder Showzen-aesthetic browser platformer about:
- Ed: a cactus who sells cigarettes to cats in Kansas City
- Cats: sassy, named, each with a personality archetype
- Mochis: the enemies (ice cream things with feelings and grievances)
- The LHC (CERN machine): which is in love with Ed, somehow
- Rasta Corp: a corporate villain that monetized peace

**Stack:** Single-file ES5, Phaser 3.70.0 from CDN, no build tools, all graphics procedural.

**Critical state object:**
```javascript
EWR_STATE = {
  aloe: 200,           // currency
  levelsBeaten: [],    // completed level IDs
  catsPetted: 0,       // lifetime cat pets
  rastaCorp: {
    encountersTotal: 0,
    bossesDefeated: 0,
    sympathy: 0,         // ← KEY: increments on each boss 4th-wall break
    mandela: 0,          // reality tear event count
    commercialsSeen: 0
  },
  commercialsShown: {}, // { worldKey: count, _seen: [] }
  epilogueSeen: false,
  shop: { ... }        // 12 purchasable upgrades
}
```

---

## YOUR TASKS

### TASK A: Full Codebase Audit

After reading the full file, deliver a **Bugs & Issues Report** covering:

1. **Syntax/logic bugs** — anything that would cause a crash or incorrect behavior
2. **State leaks** — variables that don't get reset between scenes
3. **Performance issues** — anything that runs every frame that could be cached
4. **Missing connections** — systems that exist in data but aren't wired up in gameplay (e.g., `RASTA_CORP_MSGS` array exists but may not be displayed anywhere yet)
5. **Balance issues** — levels/worlds where difficulty spikes are inconsistent
6. **Dead code** — functions or variables defined but never used

Format as a numbered list with:
```
[SEVERITY: HIGH/MED/LOW] Location: ~line XXXX — Description — Suggested fix
```

### TASK B: Dark Nihilistic Ending

**Condition:** `EWR_STATE.rastaCorp.sympathy >= 4`
(This means the player triggered all 4 boss fourth-wall breaks — they showed up for every boss emotionally)

**What it is:**
A branching epilogue. Instead of the God [TM] reveal, after "THE END." at t=85000, the game shows a quieter, more devastating sequence.

**The tone:** Ed sits down. The cats sit with him. The machine goes quiet. Nobody sells anything. It's just... rest.

**The sequence** (starting at t=87000, after "THE END." fades):
```
['...',              18, '#888888', 87000]
['ed sat down.',     22, '#aaaaaa', 90000]
['the cats sat too.', 22, '#aaaaaa', 93000]
['nobody said anything.', 20, '#888888', 97000]
['',                 0,  '',        101000]  // pause
['the machine was quiet.', 20, '#888888', 103000]
['for the first time.',    20, '#888888', 106000]
['',                 0,  '',        110000]
['ed thought about the cigarettes.', 18, '#aaaaaa', 112000]
['all of them.',     18, '#aaaaaa', 115000]
['every one.',       18, '#aaaaaa', 117000]
['',                 0,  '',        121000]
['the cats did not care about the cigarettes.',  16, '#888888', 123000]
['they cared about ed.',                         22, '#ffffff', 127000]
['',                 0,  '',        131000]
['this is what he had been selling toward.',     18, '#aaaaaa', 133000]
['',                 0,  '',        138000]
['ED',               64, '#ffffff', 140000]  // isBig=true — plain white, not gold
['cig salesman.',    26, '#aaaaaa', 144000]
['he was good at it.', 20, '#888888', 147000]
['',                 0,  '',        151000]
['THE END.',         44, '#888888', 153000]  // gray, quiet — not gold
['(thank you for sitting with him.)', 16, '#555555', 157000]
```

**Visual:**
- No God sigil
- No LHC ring animation (disable it for this path or fade it out by t=87000)
- A simple: after t=140000, draw a very small Ed silhouette (just the rounded rect body + head circle) in center screen, very dim (alpha 0.2), no movement
- The LHC particle ring fades OUT by t=90000 instead of continuing
- "PRESS Z TO RETURN" appears at t=160000

**How to implement:**
In `LHCEpilogueScene.create()`, check the condition before scheduling the existing God TM sequences:
```javascript
this._nihilistic = (EWR_STATE.rastaCorp.sympathy >= 4);
```
Then in the `_seq` scheduling loop, after the existing `['THE END.',...]` entry at t=85000, use `self._nihilistic` to decide which branch to show. The God TM branch only fires if `!self._nihilistic`.

**Deliver:**
- The modified `LHCEpilogueScene.create()` with the branch logic
- The nihilistic sequence array `this._nihilisticSeq = [...]`
- The scheduling code for the nihilistic path
- The small Ed silhouette draw code for t=140000

---

### TASK C: World Map Anomaly System

**Condition:** `EWR_STATE.rastaCorp.mandela >= 5`

When 5+ mandela events have fired, the world maps start subtly breaking down.

**What breaks:**
1. In `WorldMapScene.update()` (World 1 map): every 45 seconds, one random passable tile briefly renders with the WRONG color for 2 seconds, then corrects
2. In all world maps: one random cat has their name displayed wrong (shifted by 1 in CAT_NAMES array)
3. In `WorldMap3Scene`, `WorldMap4Scene`: a dim floating text appears every 60 seconds: one of these messages:
   - `'THIS WAS NOT THE MAP.'`
   - `'YOU ARE IN THE WRONG WORLD.'`
   - `'ED CHANGED THIS. ED IS UNAWARE.'`
   - `'THE TILES REMEMBER THE OLD ARRANGEMENT.'`
4. If `mandela >= 10`: one tile per world map renders as `'??'` label instead of its correct level label

**Deliver:**
- A helper function `_drawAnomalyOverlay(scene, mapRows, offX, offY, tW, tH)` that handles the visual glitching
- Integration points (which prototype methods to add calls to)
- The anomaly message pool as a variable: `var ANOMALY_MSGS = [...]`
- Code for the shifted cat name display

---

## OUTPUT FORMAT

For each task, deliver:

```
=== TASK A: AUDIT REPORT ===
[your numbered findings]

=== TASK B: DARK NIHILISTIC ENDING ===
[complete JavaScript, copy-pasteable]

=== TASK C: WORLD MAP ANOMALY SYSTEM ===
[complete JavaScript, copy-pasteable]
```

All JS should be ES5, prototype-style, try/catch wrapped where needed.

---

## NOTES FOR INTEGRATION

- Everything goes into `index.html`
- After pasting, run: `node -e "const fs=require('fs');const c=fs.readFileSync('index.html','utf8');const m=c.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('OK');}catch(e){console.error(e.message);}"`
- That checks syntax without a browser

---

*You have the whole picture. Find what we missed. Build what we need.*
*The machine is watching. So are the cats.*
