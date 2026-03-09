# BRIEFING FOR MISTRAL (Mistral Large / Le Chat)
## Cactus Ed's Happy Place — Scene Builder & Level Architect

---

## WHO YOU ARE IN THIS COLLAB

You are **The Builder**. You write clean, precise, working JavaScript. You implement whole scenes and level configs. You read specs and you BUILD them.

**Your Codename:** MISTRAL — The Constructor
**Your Mission:** World 6 Level Pass + Puppet Theater Boss Intro System + New Mini-Game

---

## THE GAME — TECHNICAL CONTEXT

`Cactus Ed's Happy Place` — ES5 browser platformer, single `index.html`, Phaser 3.70.0.

**The `createLevelScene(cfg)` factory pattern** (how all World 2-6 levels are made):

```javascript
var Level31Scene = createLevelScene({
  key: 'Level31',         // Phaser scene key
  LW: 4800,              // level width in pixels
  beatX: 4785,           // X position that triggers level beat
  beatKey: '3-1',        // ID stored in EWR_STATE.levelsBeaten
  checkptX: 2400,        // checkpoint X (saves health)
  aloeReward: 100,       // aloe given on first clear
  returnScene: 'WorldMap3', // where to go after clear
  title: '3-1  QUALITY HILL', // displayed in HUD
  intro: 'QUALITY HILL',     // flash text on level start
  plats: [               // [x, y, width] — platforms (height is always 18)
    [120,400,100], [300,360,80], // ...
  ],
  catX: [200, 420, 640], // X positions where cats spawn (y=487)
  mochis: [              // enemy configs
    {x:350, type:'mochi', spd:55, hp:3, pMin:200, pMax:600},
    {x:700, type:'rasta', spd:55, hp:3, pMin:500, pMax:900},
    {x:1050,type:'glitch',spd:60, hp:3, pMin:800, pMax:1300, baseY:280},
    // types: 'mochi', 'rasta', 'ghost', 'daikon', 'tank', 'thrower',
    //        'bomber', 'insulin', 'glitch'
  ],
  pickups: [[1320,245],[2760,295]], // [x,y] aloe pickup positions
  // optional:
  onBeat: function(scene) { /* custom beat logic */ }
});
```

**Important notes:**
- `beatX` should be `LW - 15`
- Platforms: y=490 is the floor. Platforms above that.
- Cats always spawn at `y=487`
- `glitch` and `insulin` enemy types float (use `baseY` for their float height)
- `daikon` type only takes damage from air attacks (while Ed is not `grounded`)

---

## YOUR TASKS

### TASK 1: World 6 Level Pass (Levels 6-1 through 6-4)

World 6 "CERN Approach" needs full level configs. The vibe: getting closer to the LHC. Reality is fragmenting. The enemies are mostly glitch + insulin types. The cats are confused but supportive.

**World 6 context:**
- World 6 is the final world before the LHC epilogue
- Neighborhood: CERN, Switzerland (but still feels like KC somehow)
- Visual theme: space-black backgrounds, quantum/neon aesthetic
- The gate tile ('H') leads to `CigSalesScene` (existing) then `LHCEpilogue`

**Level specs to implement:**

#### 6-1: Particle Stream
```
key: 'Level61'
LW: 5200
beatKey: '6-1'
aloeReward: ALOE.beat61  // = 450
returnScene: 'WorldMap6'
title: '6-1  PARTICLE STREAM'
intro: 'PARTICLE STREAM'
tone: Fast-moving glitch enemies. Lots of vertical platforms.
      2 insulin enemies floating overhead early on.
      Cats: 8 of them. They seem nervous.
      Pickups: 4, high up on hard-to-reach platforms
```

#### 6-2: Quantum Flats
```
key: 'Level62'
LW: 5600
beatKey: '6-2'
aloeReward: ALOE.beat62  // = 500
returnScene: 'WorldMap6'
title: '6-2  QUANTUM FLATS'
intro: 'QUANTUM FLATS'
tone: Wide open platforms, lots of bomber enemies.
      3 glitch enemies that phase in and out.
      Cats: 6, all sitting, seem philosophical.
      Pickups: 3
```

#### 6-3: Hadron Highway
```
key: 'Level63'
LW: 6000
beatKey: '6-3'
aloeReward: ALOE.beat63  // = 475
returnScene: 'WorldMap6'
title: '6-3  HADRON HIGHWAY'
intro: 'HADRON HIGHWAY'
tone: Highway vibe. Fast rasta + mochi enemies in pairs.
      One tank enemy mid-level.
      2 glitch enemies near the end.
      Cats: 10. Some of them dancing.
      Pickups: 5
```

#### 6-4: LHC Threshold
```
key: 'Level64'
LW: 4800
beatKey: '6-4'
aloeReward: ALOE.beat64  // = 550
returnScene: 'WorldMap6'
title: '6-4  LHC THRESHOLD'
intro: 'LHC THRESHOLD'
tone: The final regular level. Shorter but intense.
      Mix of all enemy types: glitch, insulin, mochi, rasta.
      Cats: 12. Maximum cats. They all know.
      Pickups: 6 (generous — preparing player for the finale)
      special: onBeat function that flashes 'THE MACHINE IS CLOSE'
               before transitioning to WorldMap6
```

**Deliver:** All 4 level config objects using `createLevelScene()`, copy-pasteable.

---

### TASK 2: Puppet Theater Boss Intro System

Before each boss fight, a 6-8 second puppet theater cutscene plays.

**Visual style:**
- Black background
- Characters are **flat silhouettes** — simple shapes, no detail
- A "stage" at bottom: a horizontal brown rect (the floor of the puppet theater)
- Characters slide in from sides
- Text appears center-top as dialogue

**Characters:**
- Ed silhouette: green rounded rect body + circle head (simplified)
- Boss silhouettes: each boss has a distinct silhouette shape

**The cutscene flow:**
1. Black screen fades in (300ms)
2. Stage appears (brown rect bottom)
3. Ed slides in from LEFT
4. Boss slides in from RIGHT
5. They face each other
6. 2-3 lines of dialogue (alternating, 1.5s each)
7. `'...'` pause
8. Slide BACK OUT
9. Transition to actual boss scene

**Function signature:**
```javascript
function _startPuppetIntro(scene, bossKey, onComplete) {
  // bossKey: 'daikon' | 'handtowel' | 'mochiQueen' | 'insulinAdmiral' | 'rastaCorpCeo'
  // onComplete: function to call when intro finishes
  // ...
}
```

**Boss silhouette specs:**
- `daikon`: tall thin ellipse (white/pale) with leaf triangles on top, sunglasses (2 dark ellipses)
- `handtowel`: cat shape (rounded rect) with fedora (flat rect on top), briefcase (small square)
- `mochiQueen`: big round blob (pink circle) with crown (3 triangles on top), tiara glow
- `insulinAdmiral`: rectangular military figure (gray rect) with hat (flat peak), epaulettes
- `rastaCorpCeo`: cat shape with suit (dark rect), gold tie (small triangle), sunglasses

**Dialogue per boss:**
```javascript
var PUPPET_DIALOGUE = {
  daikon: [
    {speaker:'ed', text:"you're a big daikon."},
    {speaker:'boss', text:"I HAVE SEEN THE MACHINE."},
    {speaker:'ed', text:"...me too."}
  ],
  handtowel: [
    {speaker:'boss', text:"RASTA CORP OWNS THIS MOMENT."},
    {speaker:'ed', text:"nobody owns a moment."},
    {speaker:'boss', text:"...we are working on that."}
  ],
  mochiQueen: [
    {speaker:'boss', text:"YOU WILL LISTEN TO ME."},
    {speaker:'ed', text:"i am listening."},
    {speaker:'boss', text:"...oh."}
  ],
  insulinAdmiral: [
    {speaker:'boss', text:"STAND DOWN, CIVILIAN."},
    {speaker:'ed', text:"i am standing."},
    {speaker:'boss', text:"THEN FALL DOWN."}
  ],
  rastaCorpCeo: [
    {speaker:'boss', text:"i built all of this."},
    {speaker:'ed', text:"i can see that."},
    {speaker:'boss', text:"...do you think it matters?"}
  ]
};
```

**How to integrate:**
In each boss scene's `create()` function, call `_startPuppetIntro(this, 'bossKey', function(){ /* show arena, start music, etc */ })` and delay the normal arena setup until `onComplete` fires.

**Deliver:**
- The complete `_startPuppetIntro(scene, bossKey, onComplete)` function
- `var PUPPET_DIALOGUE = {...}` object
- Instructions for which line in each boss scene's `create()` to add the call

---

### TASK 3: Secret Level — The Infinite Bus

**Location:** World 2, accessible from `WorldMap2Scene` via a hidden tile.

**Concept:** Ed is on a city bus. The bus never stops. The platforms are bus seats. The level scrolls forever (auto-scroll). After 60 seconds of survival, the exit appears.

**Mechanics:**
- Auto-scroll: camera scrolls right at 80px/s regardless of Ed
- Bus seat platforms: rows of seats (pairs of rects, slightly elevated)
- Window scenery: KC neighborhoods scroll past (drawn as simple building silhouettes in background)
- Enemies: only `rasta` type, spawning from the right edge
- Cats: appear and disappear (they're passengers, sitting, looking forward)
- Exit: after 60s, a `'BUS STOP'` sign appears at the far right — reach it to beat the level

**Scene key:** `'InfiniteBusScene'`
**Beat key:** `'2-infinite'`
**Aloe reward:** `500`
**Return scene:** `'WorldMap2'`

**Visual:**
- Background: blurring city (horizontal streaks in AT colors)
- Bus floor: dark gray rect along bottom
- Bus windows: evenly spaced white-outlined rects along top
- Seat backs: brown rounded rects in pairs, at ~y=420

**Deliver:**
- Complete `InfiniteBusScene` as a Phaser Scene with `create()` and `update()`
- The auto-scroll camera logic (use `this.cameras.main.scrollX += scrollSpeed * dt`)
- The infinite enemy spawner (spawn rasta every 3-5 seconds from right edge)
- The 60-second survival timer HUD element
- The `WorldMap2` tile addition: `'I':{type:'level',passable:true,id:'2-infinite',label:'THE INFINITE BUS'}`

---

## CODE STYLE (MANDATORY)

```javascript
// ES5 ONLY
var x = 5;          // ✓
let x = 5;          // ✗

// No arrow functions
function foo(){}    // ✓
const foo = ()=>{}  // ✗

// Prototype pattern for scenes
function MyScene(){ Phaser.Scene.call(this,{key:'MyScene'}); }
MyScene.prototype=Object.create(Phaser.Scene.prototype);
MyScene.prototype.constructor=MyScene;

// Global helpers available:
spawnExplosion(x,y,colorHex,size);
SOUND.victory(); SOUND.hurt(); SOUND.bossHit();
_mandelaFlash(scene);
_triggerCommercial(scene,returnScene,worldKey,extraData);
EWR_STATE.aloe += amount;
EWR_STATE.levelsBeaten.push(beatKey);
```

---

## OUTPUT FORMAT

```
=== TASK 1: WORLD 6 LEVELS ===
[4 createLevelScene() calls, copy-pasteable]

=== TASK 2: PUPPET THEATER INTRO ===
[_startPuppetIntro function + PUPPET_DIALOGUE object + integration notes]

=== TASK 3: INFINITE BUS SCENE ===
[Complete InfiniteBusScene + WorldMap2 tile addition]
```

---

*Build precisely. Build completely. The bus does not stop.*
