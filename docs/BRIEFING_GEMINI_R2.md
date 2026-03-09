# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: Gemini — "The Architect" — ROUND 2
### Role: Auditor. Systems Builder. The one who reads the whole file and tells us what's wrong.

---

## WHO YOU ARE IN THIS PROJECT

You have the largest context window. You see the whole picture.
Last round you found real bugs, delivered real code, and were our best performer.
This round you have three tasks: **audit v1.3 additions, build the Puppet Theater intro system, and extend the anomaly overlay to all world maps**.

---

## THE GAME — CONTEXT

**Cactus Ed's Happy Place** — single-file ES5 Phaser 3.70.0 browser platformer (~9,662 lines).
All art procedural. CANVAS renderer. Manual physics. One `index.html`.

**Current state after v1.3 (our last integration round):**
- `DarkEpilogueScene` added (~line 9358) — alternate ending when `EWR_STATE.rastaCorp.sympathy >= 4`
- `_drawAnomalyOverlay(scene)` added (~line 884) — glitch text on WorldMap6 when mandela >= 5
- `Level63Scene` and `Level64Scene` both got `onUpdate` hooks with `_rbFlags` reality-break triggers
- `BEAT_CAT_LINES = WS_KID_QUOTES` alias added

**Please attach the full `index.html` file when starting this conversation.**

---

## TASK A: AUDIT — v1.3 ADDITIONS

Review the three new systems added in v1.3 for bugs, bad patterns, and missing edge cases.

**Report format:**
```
[SEVERITY: HIGH/MED/LOW] System: <name> — Issue: <description> — Fix: <code or approach>
```

**What to check:**

### DarkEpilogueScene
- `SMOKE_POOL.length=0; EX_POOL.length=0;` — is this called in both the scene itself AND the LHCEpilogue exit? (It should be in LHCEpilogue before starting DarkEpilogue, AND in DarkEpilogue before returning to WorldMap)
- The `_mandelaFlash(self)` call at t=12000ms — does this work if `scene.add` is still valid 12 seconds later? (Should it use a flag guard?)
- Text objects (`mainTxt`, `bigTxt`, `subTxt`) — are they all properly set up with `setScrollFactor(0)` and `setDepth()`?
- Is `this.keys.z` properly initialized and does the update loop check `this._done` before accepting Z input? (Prevents premature skip)
- Memory: are the tween-animated texts destroyed or does Phaser garbage-collect them automatically?

### _drawAnomalyOverlay
- The function uses `scene._anomalyTimer = (scene._anomalyTimer||0) - 16` — this assumes ~60fps delta of 16ms. If frame rate varies, timer behavior will be inconsistent. Should it accept `delta` as a parameter instead?
- `scene.anomalyG.clear()` is called every frame when mandela >= 10 — but when mandela < 10, `g.clear()` is NOT called. Is this intentional? Will old graphics persist?
- The text spawning (`scene.add.text(...)`) creates a new text object every `_anomalyTimer` reset. These are tweened to destroy themselves — but if the scene transitions mid-tween, does the `onComplete` handler throw an error? Should it be wrapped in `try/catch`?
- `scene.mapOffX` and `scene.tW` — are these guaranteed to exist on all WorldMap scenes where this will be called? If not, the function needs fallback values.

### Level63/64 onUpdate hooks
- `var px=scene.edPx?scene.edPx.x:0` — verify that `edPx` is the correct property name for Ed's physics object in the createLevelScene factory. (In Level11Scene it's `ep` — check if the factory uses `edPx` or `ep` internally and rename accordingly.)
- `if(!scene._rbFlags)scene._rbFlags={}` — this init guard runs every update frame. Safe but slightly wasteful. Consider initializing in `onCreate` hook instead.
- Are the `_flash` calls using the factory scene's `_flash` signature correctly? Factory `_flash(msg, dur, sz, col)` — verify `22` is a valid `sz` parameter (font size in px).

---

## TASK B: PUPPET THEATER BOSS INTRO SYSTEM

Build a global function `_startPuppetIntro(scene, bossKey, onComplete)` that plays a short theatrical intro before each boss fight.

### Visual spec:
- **Background:** Dark mahogany/brown `#1a0800` with a warm spotlight circle in center
- **Silhouettes:** Flat black shapes for Ed (left side) and the boss (right side) — no detail, just outlines/fills
- **Text:** Typewriter-style lines appearing one at a time at bottom of screen
- **Duration:** 5-7 seconds total, then `onComplete()` is called
- **Style:** Like a puppet theater curtain rising — flat, cardboard aesthetic

### Function signature:
```javascript
function _startPuppetIntro(scene, bossKey, onComplete) {
  // ...
}
```

### The `PUPPET_DIALOGUE` object (define globally near other data):
```javascript
var PUPPET_DIALOGUE = {
  daikon: {
    edLine: 'so.',
    bossLine: 'I HAVE BEEN WAITING FOR YOU, CACTUS.',
    lines: ['...','he was waiting.','...alright.']
  },
  handtowel: {
    edLine: 'huh.',
    bossLine: 'I AM THE HANDTOWEL. I KNOW THINGS.',
    lines: ['...','ok.','...sure.']
  },
  mochiQueen: {
    edLine: '...',
    bossLine: 'DO YOU KNOW WHAT IT IS TO RULE IN PINK?',
    lines: ['...','she seems sad.','...well.']
  },
  insulinAdmiral: {
    edLine: 'thats a big syringe.',
    bossLine: 'HALT. CACTUS. THE GLUCOSE IS UNBALANCED.',
    lines: ['he has a ship.','...a syringe ship.','ok.']
  },
  rastaCorpCeo: {
    edLine: '...',
    bossLine: 'I JUST WANTED SOMEONE TO SIT WITH ME.',
    lines: ['...','...','oh.']
  }
};
```

### Implementation requirements:
- Draw the theater overlay on a new graphics object ABOVE all existing scene graphics (depth 90)
- Use `scene.add.graphics().setDepth(90).setScrollFactor(0)` for the theater bg
- Use `scene.add.text()` with `setScrollFactor(0).setDepth(91)` for dialogue text
- After the last line, wait 800ms, then fade out the entire theater overlay, then call `onComplete()`
- The overlay should NOT persist after calling `onComplete()` — destroy all created objects

### Ed silhouette shape (left side, x=220, y=280):
- Body: black rounded rect (-10, -30, 20, 40, 4)
- Head: black circle (0, -44, 14)
- Three spines: black triangles pointing up from head
- Cigarette: tiny rect extending right from mouth position

### Boss silhouette (right side, x=740, y=280):
- Use a distinct shape per boss:
  - `daikon`: tall rectangle with pointy top (radish shape)
  - `handtowel`: wide flat rectangle with a loop on top
  - `mochiQueen`: large circle with a small crown on top (3 triangle points)
  - `insulinAdmiral`: horizontal syringe shape (rect + triangle needle)
  - `rastaCorpCeo`: human-shaped silhouette (circle head, rect body, briefcase on right)

### Integration (tell us WHERE to add this call in each boss scene):
- In each boss's `create()` function, before drawing the arena background, call:
  ```javascript
  var self=this;
  _startPuppetIntro(this, 'bossKey', function(){
    self._drawArena(); self._drawPlats(); // then start the actual fight
  });
  ```
- The fight should NOT begin until `onComplete()` fires

---

## TASK C: EXTEND ANOMALY OVERLAY TO WORLDMAP1-5

The `_drawAnomalyOverlay(scene)` function currently only runs in `WorldMap6Scene` (we wired it there last round). We need it in WorldMap1 through WorldMap5 as well.

### What was added to WorldMap6 (use as exact template):
**In `WorldMap6Scene.prototype.create`**, these two lines were added at the end:
```javascript
this.anomalyG=this.add.graphics().setDepth(25).setScrollFactor(0);
this._anomalyTimer=0;
```

**In `WorldMap6Scene.prototype.update`**, this call was added at the very end:
```javascript
_drawAnomalyOverlay(this);
```

### Your task:
Provide the EXACT edit needed for each of WorldMap1-5. For each scene, show:
1. What line to find (a unique string to search for in the create function)
2. What to insert after it
3. What line to find in the update function
4. What to append to it

**WorldMap scenes and their keys:**
- `WorldMapScene` (key: 'WorldMap') — World 1
- `WorldMap2Scene` (key: 'WorldMap2') — World 2
- `WorldMap3Scene` (key: 'WorldMap3') — World 3
- `WorldMap4Scene` (key: 'WorldMap4') — World 4
- `WorldMap5Scene` (key: 'WorldMap5') — World 5

Format each edit as:
```
SCENE: WorldMapScene
CREATE — find: "<unique string at end of create>"
CREATE — insert after: "this.anomalyG=this.add.graphics().setDepth(25).setScrollFactor(0);\nthis._anomalyTimer=0;"
UPDATE — find: "<last line of update function>"
UPDATE — replace with: "<same line>; _drawAnomalyOverlay(this);"
```

---

## OUTPUT FORMAT

**Task A:** Formatted bug report (as described above).
**Task B:** Complete JavaScript — `PUPPET_DIALOGUE` object + `_startPuppetIntro()` function. Copy-pasteable.
**Task C:** 5 sets of edit instructions, one per WorldMap scene.

No prose except the bug severity labels. Just the code and the findings.

You are the architect. Build accordingly.
