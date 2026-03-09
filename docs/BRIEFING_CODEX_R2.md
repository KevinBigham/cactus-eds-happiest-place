# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: Codex — "The Implementer" — ROUND 2
### Role: Scene Architect. The one who turns design docs into working JavaScript.

---

## ⚠️ LESSON FROM ROUND 1

Last time you referenced line numbers that didn't match our actual file — you were working from a different version.

**This time: we give you the EXACT template to copy. Don't reference line numbers. Just write the code using the patterns shown below, and deliver a complete, copy-pasteable scene.**

---

## WHO YOU ARE IN THIS PROJECT

You write complete Phaser 3 scenes in ES5 JavaScript. Your output gets pasted directly into a single HTML file (no build system, no modules). Your job this round: **implement the Cat Democracy Mini-Game** as a full playable scene.

---

## THE GAME — TECHNICAL STACK

- **Engine:** Phaser 3.70.0 (CANVAS renderer — NOT WebGL)
- **Language:** ES5 only. No `const`, no `let`, no arrow functions, no classes.
- **File structure:** Single `index.html`. Everything in one `<script>` tag.
- **Art:** All graphics procedural — Phaser Graphics API (`fillRect`, `fillCircle`, `fillRoundedRect`, etc.)
- **No sprites, no asset loading.** Everything drawn with code.

---

## THE EXACT SCENE PATTERN TO FOLLOW

Copy this pattern **exactly**. Only change the scene key and the content inside create/update:

```javascript
function MyCoolScene(){ Phaser.Scene.call(this,{key:'MyCoolScene'}); }
MyCoolScene.prototype=Object.create(Phaser.Scene.prototype);
MyCoolScene.prototype.constructor=MyCoolScene;

MyCoolScene.prototype.create=function(){
  var self=this; var W=960,H=540;
  this._t=0; this._done=false;
  // all setup here
  this.keys={
    left:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    up:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    w:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    d:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    z:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
    x:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
    space:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  };
  EX_POOL.length=0; SMOKE_POOL.length=0; FIRE_POOL.length=0;
};

MyCoolScene.prototype.update=function(time,delta){
  var self=this; this._t+=delta;
  // game loop here
};
```

**Scene registration (add to the existing scenes array at bottom of file):**
```javascript
// Add CatDemocracyScene to the scenes:[] array in the Phaser config object
```

---

## GLOBAL HELPERS AVAILABLE

These functions exist globally — call them freely:

```javascript
spawnExplosion(x, y, color, size)     // particle burst (color = hex number e.g. 0xff4444)
spawnSmoke(x, y)                       // smoke puff particle
_mandelaFlash(scene)                   // reality tear text + increments mandela count
_triggerCommercial(scene, returnScene, worldKey, extraData) // commercial break
_addCombo(scene, x, y)                // combo streak tracker
SOUND.punch()  SOUND.kick()  SOUND.jump()  SOUND.hurt()  SOUND.pickup()  SOUND.victory()

// Drawing helpers:
DRAW_ED.draw(g, x, y, frame, flipped, cigF)
// frame: 0=idle, 1-3=walk, 4=jump, 5=punch, 6=kick, 7=hurt

DRAW_CAT.draw(g, cat)
// cat object shape: {x, y, ci, tailAng, facing, sitting, dance, smoker, danceT}
// ci = color index 0-3

// Global state:
EWR_STATE.aloe         // add to this for rewards
EWR_STATE.levelsBeaten // check what's been beaten
EWR_STATE.secrets      // EWR_STATE.secrets['catDemocracy'] = true for win state
EWR_STATE.rastaCorp.sympathy  // incremented when player is merciful
```

---

## THE TASK: CatDemocracyScene

**Scene key:** `'CatDemocracy'`
**Trigger:** Called from WorldMap after beating World 4 (add to WorldMap4's tile map)
**Return scene:** `'WorldMap4'` on both win and loss

### The Full Design Spec (from our game designer — implement this exactly):

**Concept:** Operation Meow Manifesto. After World 4, Ed must campaign for cat votes to ratify The Great Tuna Treaty.

**Format:** Auto-scrolling parade level — 90 seconds long. Ed runs right automatically at 60px/s. Player controls jumping and punching only (no manual walk — Ed auto-parades).

**Mechanics:**
1. **Canvass**: Ed touches a sitting cat (within 40px) → cat stands, danceT spins, +1 vote. Play SOUND.pickup().
2. **Dodge**: Mochi ice cream projectiles fall from above every 3 seconds. Ed can punch them (SOUND.punch()). Getting hit by one = -2 votes (min 0).
3. **Timer**: 90 seconds. Shown as countdown at top-center.
4. **Vote counter**: Top-left. Starts at 0.

**Factions (for visual display on signs/banners at intervals):**
- **The Nappers Union** (8 possible votes) — grey cats, sitting, signs say "PROGRESS IS FINE BUT HAVE YOU TRIED SLEEPING ON IT"
- **The Gremblin Caucus** (7 possible votes) — orange cats, standing, signs say "MORE CANS TO TOPPLE"
- **The Alley Cat Alliance** (6 possible votes) — black cats, walking, signs say "YEAH BUT WHERE'S THE TUNA"
- **The Void Gazers** (4 possible votes) — white cats, sitting perfectly still, signs say "THE CAN IS A CONSTRUCT"

**Total possible votes:** 25. **Win condition:** 13+ votes when timer hits 0.

**Win outcome:**
```
EWR_STATE.aloe += 200;
EWR_STATE.secrets['catDemocracy'] = true;
// Flash: "OPERATION MEOW MANIFESTO: SUCCESS"
// Flash: "TUNA TREATY RATIFIED. RASTA CORP IS UNHAPPY."
// _triggerCommercial then return to WorldMap4
```

**Loss outcome:**
```
EWR_STATE.aloe += 80;  // consolation aloe
// Flash: "THE NAPPERS UNION HAS FILIBUSTERED THE VOTE"
// Flash: "DEMOCRACY FAILS. CATS UNSURPRISED."
// Return to WorldMap4 after 3 seconds
```

**Background:** The parade route — daytime, sunny, KC skyline, banners strung between buildings. Use warm yellows and blues. Buildings in the AT.outline color (#2d1b00). Cats of all colors line both sides.

**Arena layout (static — no scrolling camera needed, just move Ed + enemies + cats):**
- Ground at y=480
- No platforms — ground only
- Sign posts at x=400, 800, 1200, 1600, 2000 showing faction slogans (auto-scroll these left)
- Cat spawn: place 25 cats spaced across x=200 to x=4000, some sitting/some walking

**Cat placement:** Pre-populate `this.cats` with 25 cat objects using DRAW_CAT pattern. Mix ci values 0-3 for color variety. Space them across `startX=300` to `endX=4800` at ground level (y=462).

**Ed setup:** `{x:100, y:460, vy:0, grounded:true}` — auto-moves right at 60px/s each frame. Player can press Z to punch (hits nearby projectiles) and UP/W/Space to jump (simple arc, -400 vy).

**HUD:**
- Top-left: "VOTES: X / 25" in green
- Top-center: countdown timer "TIME: XX"
- Top-right: "WIN CONDITION: 13+ VOTES" faded text

**Twist ending (show after win or loss, before commercial):**
Flash 3 lines with 1200ms between:
```
"ELECTION RESULTS BROUGHT TO YOU BY RASTA CORP™"
"CAMPAIGN: PROJECT TUNA-OCRACY"
"OBJECTIVE: TEST MARKET VIABILITY OF MOCHI REPLACEMENT"
```
Then `_mandelaFlash(scene)`.

---

## OUTPUT FORMAT

Deliver the complete `CatDemocracyScene` as a single copy-pasteable JavaScript block:
- `function CatDemocracyScene()` constructor
- `CatDemocracyScene.prototype.create`
- `CatDemocracyScene.prototype.update`
- Any helper prototype methods needed (e.g. `_flash`, `_drawBackground`, `_checkWin`)

Then as a separate block, show the one-line addition needed to register it in the Phaser scenes array.

No explanations. Just the code. It should run.

LFG. Give us the democracy.
