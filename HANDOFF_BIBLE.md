# CACTUS ED'S HAPPY PLACE
## THE DEFINITIVE HANDOFF BIBLE
### For: Codex (OpenAI) — The New Implementer
### From: Claude Sonnet 4.6 — The Original Architect
### Date: March 2026

---

> **"This is the greatest multi-genre game of all time. We are not joking. LFG."**
> — Kevin (CEO, Game Designer, Cactus Whisperer)

---

## QUICK LINKS (START HERE)

| Resource | URL |
|----------|-----|
| **Live Game** | https://kevinbigham.github.io/Cactus-Eds-Happy-Place/ |
| **GitHub Repo** | https://github.com/KevinBigham/Cactus-Eds-Happy-Place |
| **The Whole Game** | `index.html` (root) — 9,662 lines, single file |
| **This Document** | `HANDOFF_BIBLE.md` (root) |
| **AI Gameplan** | `docs/CACTUS_ED_AI_GAMEPLAN.md` |
| **Codex R1 Brief** | `docs/BRIEFING_CODEX.md` |
| **Codex R2 Brief** | `docs/BRIEFING_CODEX_R2.md` |
| **All AI Briefings** | `docs/` folder |

---

## WHAT IS THIS GAME?

**Cactus Ed's Happy Place** is a single-file Phaser 3.70.0 browser platformer. It is simultaneously:

- A Wonder Showzen × Adventure Time × SNES Contra fever dream
- A satirical masterpiece about late capitalism, cats, cigarettes, and the heat death of the universe
- A love letter to the West Bottoms neighborhood of Kansas City, Missouri
- The game that CERN scientists would play if they had 40 minutes and no shame
- **9,662 lines of pure ES5 JavaScript in a single HTML file**

### The Protagonist: Ed
- A **slow-moving, chain-smoking cactus** from the West Bottoms, KC
- His cigarette IS his weapon — it extends as a lance when he punches
- Completely aloof. Doesn't want trouble. Will absolutely throw hands.
- Sunglasses. Always. Dark rectangular lenses, gold rim.
- Speaks in short, deadpan sentences. Never excited. Always right.
- **He is unknowingly the keystone of the universe.** (See: LHC Epilogue)

### The World Structure
- **6 Worlds**, each with a World Map scene (Super Mario World style)
- **30+ levels**, all playable
- **5 boss fights**: Daikon Lord, Mr. Handtowel, Mochi Queen, Insulin Admiral, (+ Rasta Corp CEO — NEEDS IMPLEMENTATION)
- **6 mini-games**: Slot Machine, Scratch Card, Nuclear Quiz, Ghost Dodge, F-Zero Race, Mochi Smash
- **Currency: Aloe** (green, glowing, collectable)
- **The Ending**: LHC Epilogue — Ed walks into the Large Hadron Collider and becomes God[TM]

---

## THE TECHNICAL STACK (READ THIS BEFORE TOUCHING ANYTHING)

### The Golden Rule: ONE FILE
Everything — HTML, CSS, JS, all game code, all art — lives in `index.html`.
Do not create separate files. This is intentional. The game deploys anywhere instantly.

### Engine
```
Phaser 3.70.0 via CDN
Renderer: Phaser.CANVAS (FORCED — WebGL caused black screens)
Language: ES5 ONLY
```

### ES5 Mandatories
```javascript
var x = 1;          // NOT let/const
function foo() {}   // NOT arrow functions
// prototype OOP    // NOT classes
```

### Scene Constructor Pattern (THE ONLY WAY)
```javascript
function MyScene(){ Phaser.Scene.call(this,{key:'MyScene'}); }
MyScene.prototype=Object.create(Phaser.Scene.prototype);
MyScene.prototype.constructor=MyScene;
MyScene.prototype.create=function(){
  var self=this; var W=960,H=540;
  EX_POOL.length=0; SMOKE_POOL.length=0; FIRE_POOL.length=0;
  // setup here
};
MyScene.prototype.update=function(time,delta){
  var dt=delta/1000;
  // game loop here
};
```

### All Art is Procedural (No Images, No Sprites)
```javascript
g.fillStyle(0xrrggbb, alpha);
g.fillRect(x, y, w, h);
g.fillRoundedRect(x, y, w, h, radius);
g.fillCircle(x, y, r);
g.fillEllipse(x, y, w, h);
g.fillTriangle(x1,y1, x2,y2, x3,y3);
g.lineBetween(x1,y1, x2,y2);
g.save(); g.translateCanvas(x,y); g.scaleCanvas(-1,1); g.restore(); // flip
g.clear(); // every frame for animated graphics objects
```

---

## COMPLETE SCENE INVENTORY

All scenes registered in the Phaser config at the bottom of `index.html`:

| Scene Key | Constructor | Line | Purpose |
|-----------|-------------|------|---------|
| `Boot` | `BootScene` | ~1180 | Preload + transition |
| `Title` | `TitleScene` | ~1230 | Logo + Press Start |
| `WorldMap` | `WorldMapScene` | ~1324 | World 1 overworld |
| `Level11` | `Level11Scene` | ~1819 | "Ed Wakes Up" — hand-written |
| `Level12` | `createLevelScene` | ~3700 | "The Cat Rave" |
| `Level13` | `createLevelScene` | ~3728 | "After Dark" |
| `Level14` | `createLevelScene` | ~3757 | "Hippie Bus Highway" |
| `Level15` | `Level15Scene` | ~3795 | Daikon Lord boss |
| `LevelVoid` | `LevelVoidScene` | ~4248 | Secret void level |
| `WorldMap2` | `WorldMap2Scene` | ~4651 | World 2 overworld |
| `Level21-24` | `createLevelScene` | ~4979 | World 2 levels |
| `FZero` | `FZeroScene` | ~5634 | F-Zero race mini-game |
| `WorldMap3` | `WorldMap3Scene` | ~5927 | World 3 overworld |
| `Level31-36` | `createLevelScene` | ~6172 | World 3 levels |
| `HandtowelScene` | `HandtowelScene` | ~6506 | Mr. Handtowel boss |
| `WorldMap4` | `WorldMap4Scene` | ~6956 | World 4 overworld |
| `Level41-46` | `createLevelScene` | ~7084 | World 4 levels |
| `MochiQueenScene` | `MochiQueenScene` | ~7138 | Mochi Queen boss |
| `MochiSmash` | `MochiSmashScene` | ~7562 | Mini-game |
| `SlotMachine` | `SlotMachineScene` | ~7744 | Mini-game |
| `Scratch` | `ScratchScene` | ~7919 | Mini-game |
| `NuclearQuiz` | `NuclearQuizScene` | ~8006 | Mini-game |
| `GhostDodge` | `GhostDodgeScene` | ~8073 | Mini-game |
| `MetaLevel` | `MetaLevelScene` | ~8177 | 4th wall level |
| `WorldMap5` | `WorldMap5Scene` | ~8268 | World 5 overworld |
| `Level51-56` | `createLevelScene` | ~8386 | World 5 levels |
| `InsulinAdmiralScene` | `InsulinAdmiralScene` | ~8444 | Insulin Admiral boss |
| `WorldMap6` | `WorldMap6Scene` | ~8814 | World 6 overworld |
| `Level61-64` | `createLevelScene` | ~8931 | World 6 levels |
| `FZeroMenu` | `FZeroMenuScene` | ~8992 | F-Zero mode select |
| `CigSales` | `CigSalesScene` | ~9062 | Cig empire management |
| `LHCEpilogue` | `LHCEpilogueScene` | ~9215 | THE ENDING — Ed becomes God[TM] |
| `DarkEpilogue` | `DarkEpilogueScene` | ~9367 | Dark nihilistic ending |
| `CommercialBreak` | `CommercialBreakScene` | ~9454 | Ad interruption system |
| `RastaCorpAd` | `RastaCorpAdScene` | ~9522 | World 3 gate cutscene |

---

## GLOBAL STATE & CONSTANTS

### EWR_STATE (global game state object)
```javascript
var EWR_STATE = {
  aloe: 200,
  world: 1,
  levelsBeaten: [],       // e.g. ['1-1','1-2','rasta-boss']
  secrets: {},            // e.g. secrets['catDemocracy'] = true
  playerPos: {x:5,y:5},
  playerPosW2: {x:0,y:0},
  playerPosW3: {x:0,y:0},
  playerPosW4: {x:0,y:0},
  playerPosW5: {x:0,y:0},
  playerPosW6: {x:0,y:0},
  health: [3,3],
  maxHealth: [3,3],
  catsPetted: 0,
  fightWins: 0,
  combo: 0,
  shop: {},               // 12 shop items
  secretBeaten: false,
  raceScores: [],
  raceUnlocked: false,
  epilogueSeen: false,
  rastaCorp: {
    encountersTotal: 0,
    bossesDefeated: 0,
    sympathy: 0,          // >= 4 triggers DarkEpilogue
    mandela: 0,           // Mandela effect counter
    commercialsSeen: 0
  },
  commercialsShown: { _seen: [] }
};
```

### ALOE (reward constants)
```javascript
var ALOE = {
  start:200, beat11:50, beat12:80, beat13:60, beat14:80, beat15:300,
  beat21:120, beat22:150, beat23:200, beat24:180,
  beat31:200, beat32:220, beat33:250, beat34:280, beat35:300, beat36:350,
  beat41:300, beat42:320, beat43:350, beat44:380, beat45:400, beat46:450,
  beat51:400, beat52:420, beat53:450, beat54:480, beat55:500, beat56:550,
  beat61:500, beat62:520, beat63:550, beat64:600,
  rastaCorpBoss:3500, secretFind:20, catPet:5, fightWin:40,
  mochiDeath:8, aloePickup:15, raceEntryFee:25, voidBeat:999
};
```

### ED_MOVE (physics constants)
```javascript
var ED_MOVE = {
  walkSpeed:140, jumpVel:-520, jumpCut:0.4, airControl:0.75,
  coyoteMs:90, jumpBufMs:130, maxFall:700, punchRange:56, kickRange:72
};
```

### AT (Adventure Time color palette)
```javascript
var AT = {
  sky:'#7ec8e3', skyDark:'#4a9bb5',
  grass:'#8ac926', grassDark:'#5a8c1a',
  dirt:'#c97d4e', dirtDark:'#8b5028',
  outline:'#2d1b00',        // THE thick Adventure Time outline — use EVERYWHERE
  skinEd:'#3d6b34', skinEdDk:'#2a4d24', spineEd:'#f5f0dc',
  cigTip:'#ff6b35', cigBody:'#d4c8a0',
  uiBg:'#1a0a2e', uiPanel:'#2d1254', uiText:'#f5f0dc',
  uiGold:'#ffd60a', uiRed:'#ff4444',
  catA:'#ff9f43', catB:'#dfe6e9', catC:'#2d3436', catD:'#fdcb6e',
  neon1:'#ff00ff', neon2:'#00ffff', neon3:'#cc44ff',
  night:'#0a001e', nightSky:'#050010',
  orange:'#ff7c00', sunset:'#ff4500'
};
```

---

## GLOBAL HELPER FUNCTIONS

### Drawing
```javascript
DRAW_ED.draw(g, x, y, frame, flipped, cigF)
// frame: 0=idle, 1-3=walk, 4=jump, 5=punch, 6=kick, 7=hurt

DRAW_CAT.draw(g, cat)
// cat: {x, y, ci, tailAng, facing, sitting, dance, smoker, danceT}
// ci = color index 0-3

DRAW_BUS.draw(g, x, y)            // hippie bus spaceship
DRAW_HUD.draw(g, aloeText)        // HUD overlay
DRAW_HUD.aloeBar(g, x, y, amt)
DRAW_HUD.healthBar(g, x, y, hp, maxHp)
```

### Particles
```javascript
spawnExplosion(x, y, colorHex, size)  // e.g. spawnExplosion(400,300,0xff4444,2)
spawnSmoke(x, y)
updateExplosions()      // call in update()
drawExplosions(g)       // call in update()
updateSmoke()
// EX_POOL, SMOKE_POOL, FIRE_POOL — clear at start of every create()
```

### Narrative Systems
```javascript
_mandelaFlash(scene)
// Floats a reality-tear message. Increments EWR_STATE.rastaCorp.mandela.

_triggerFourthWallBreak(scene, bossKey)
// bossKey options: 'daikon' | 'handtowel' | 'mochiQueen' | 'insulinAdmiral' | 'rastaCorpCeo'

_triggerCommercial(scene, returnScene, worldKey, extraData)
// Fires a commercial break or routes directly if limit reached.
// worldKey: 'w1'|'w2'|'w3'|'w4'|'w5'|'w6'

_addCombo(scene, x, y)
// Hit combo tracker. Increments EWR_STATE.combo.

_getCatArchetype(catIndex)
// Returns personality archetype from CAT_ARCHETYPES array.
```

### Sound
```javascript
SOUND.punch()
SOUND.kick()
SOUND.jump()
SOUND.hurt()
SOUND.death()
SOUND.bossHit()
SOUND.victory()
SOUND.pickup()
SOUND.init()   // must be called on first user interaction (Web Audio API requirement)
```

---

## KEY DATA ARRAYS

```javascript
CAT_NAMES[24]           // cat names — sassy, canonical
CAT_ARCHETYPES[6]       // personality types
CAT_COLORS[4]           // color palettes for DRAW_CAT

WS_MSGS[~150]           // Wonder Showzen background message pool
WS_CAT_SPEECH[~80]      // cat dialogue pool

COMMERCIALS[6]          // commercial break ad data
RASTA_CORP_MSGS[10]     // Rasta Corp world 3 messages
RASTA_CORP_SPEECH[10]   // Rasta Corp boss speech
RASTA_BOSS_TRAUMA[7]    // CEO breakdown monologue lines

FOURTH_WALL_BOSS_MSGS = {
  daikon: [...],
  handtowel: [...],
  mochiQueen: [...],
  insulinAdmiral: [...]
  // rastaCorpCeo: [...] ← NEEDS TO BE ADDED
}
```

---

## CRITICAL BUG HISTORY (learn from the past)

### 1. Gamepad Button Objects
```javascript
// WRONG — pad.A is an object, always truthy
if (pad.A) jump();

// CORRECT
if (pad.A && pad.A.pressed) jump();
```

### 2. var Hoisting in update()
`var LW = cfg.LW` MUST be the FIRST line of `update()`. JS hoists the declaration
but not the value — causes `undefined` when camera clamping runs.

### 3. Graphics restore vs restoreCanvas
`g.restore()` ← correct Phaser 3 method
`g.restoreCanvas()` ← does NOT exist, throws

### 4. Cross-Level Particle Bleed
`EX_POOL`, `SMOKE_POOL`, `FIRE_POOL` are global. Clear at start of EVERY `create()`:
```javascript
EX_POOL.length=0; SMOKE_POOL.length=0; FIRE_POOL.length=0;
```

### 5. Static vs Animated Graphics Objects
- `this.bgG` — drawn once in `create()`, NEVER clear in `update()`
- `this.edG` — cleared and redrawn EVERY frame

### 6. Infinite Recursion Bug (fixed in v1.3)
BEAT_CAT_LINES was causing stack overflow on first damage hit.
Look at commit `20af9b8` for the exact fix pattern if you ever see recursion issues.

---

## THE LEVEL FACTORY

Levels 1-2, 1-3, 1-4, and all of Worlds 2-6 use `createLevelScene(cfg)`.
Only Level 1-1, 1-5, and custom scenes are hand-written.

### Minimal factory config:
```javascript
var MyLevelScene = createLevelScene({
  key: 'Level22',
  LW: 5200,           // level width in pixels
  beatX: 5100,        // x position to trigger level complete
  beatKey: '2-2',     // for levelsBeaten tracking
  returnScene: 'WorldMap2',
  aloeReward: ALOE.beat22,
  bgColor: 0x001122,
  platforms: [
    {x:0, y:500, w:5200, h:40}   // ground
  ],
  drawBg: function(scene, g) { /* static background */ },
  catSetup: function(scene) { /* push to scene.cats[] */ },
  enemySetup: function(scene) { /* push to scene.mochis[] */ },
  pickups: [{x:400,y:460}],
  onCreate: function(scene) {},
  onUpdate: function(scene, time, delta) {}
});
```

### Factory auto-handles:
- Ed spawn/physics/input (keyboard + gamepad, all bug fixes applied)
- S key duck, coyote time, jump buffering
- Platform collision (AABB vs `scene.platRects[]`)
- Mochi AI + combat (punch/kick hit detection, hp, death, parts)
- Aloe pickups, cat rendering, camera scroll
- HUD, level complete → aloe reward → scene transition
- Particle pool clearing

---

## PHYSICS SYSTEM (manual, NOT Phaser Arcade)

```javascript
// Ed's physics object
ep = {
  x, y,           // position
  vx, vy,         // velocity
  grounded,       // boolean
  facing,         // 1 or -1
  walkT,          // walk animation timer
  jumpBuf,        // jump buffer timer (ms)
  coyote          // coyote time timer (ms)
}

// Ed's state
es = {
  punchTimer,     // ms remaining in punch state
  kickTimer,      // ms remaining in kick state
  hurtTimer,      // ms remaining in hurt state
  facing          // 1 or -1
}

// Manual gravity each frame:
ep.vy = Math.min(ep.vy + 28, ED_MOVE.maxFall);

// Camera pattern:
cam.scrollX = Math.max(0, Math.min(ep.x - 480, LW - 960));
// LW = level width, 960 = viewport width, 480 = half viewport
```

---

## NARRATIVE SYSTEMS OVERVIEW

Six narrative systems are woven throughout the game:

### 1. Rasta Corp[TM]
Corporate antagonist. Appears via ads, boss fight, World 3 gate.
`EWR_STATE.rastaCorp.encountersTotal` tracks how much the player has seen.
The CEO (Chairman Whiskers McVibration III) — **BOSS NOT YET IMPLEMENTED.**

### 2. Cat Personalities
Each cat has an archetype via `_getCatArchetype(index)`.
`CAT_ARCHETYPES`: Philosopher, Chaos Agent, Mystic, Foodie, Revolutionary, Void Gazer.
Dialogue pulled from `WS_CAT_SPEECH[]`.

### 3. Commercial Breaks
`_triggerCommercial(scene, returnScene, worldKey, extraData)` — max 2 per world.
`CommercialBreakScene` plays a 6-ad rotation from `COMMERCIALS[]`.

### 4. Mandela Effect
`_mandelaFlash(scene)` — randomly fires floating text like "DIDN'T THIS USED TO BE DIFFERENT?"
Increments `EWR_STATE.rastaCorp.mandela`. Feeds into the LHC Epilogue reality-break.

### 5. Fourth Wall Breaks
`_triggerFourthWallBreak(scene, bossKey)` — Ed monologues directly at the player post-boss.
Each boss has a unique script in `FOURTH_WALL_BOSS_MSGS`.

### 6. God[TM] Ending
`LHCEpilogueScene` — 139+ seconds. Ed walks into the LHC. At t=139000, the God[TM] reveal.
Dark path: `DarkEpilogueScene` triggers when `EWR_STATE.rastaCorp.sympathy >= 4`.

---

## THE AI COLLAB ROSTER

This game was co-developed by multiple AI systems across 2 rounds:

| AI | Role | Status | Their Files |
|----|------|--------|-------------|
| **Claude** (you just took over from) | Architect, integrator, writer | Led all sessions | Everything |
| **Gemini** | Auditor + Puppet Theater boss intros | R2 delivered | `docs/BRIEFING_GEMINI_R2.md` |
| **Meta AI** | UX/creative director | R2 delivered | `docs/BRIEFING_META_R2.md` |
| **ChatGPT** | Content writer (WS_MSGS, boss quotes, ads) | R2 delivered | `docs/BRIEFING_CHATGPT_R2.md` |
| **Mistral** | Scene builder (Infinite Bus, RASTA_CORP_MSGS) | R2 delivered | `docs/BRIEFING_MISTRAL_R2.md` |
| **DeepSeek** | Rasta Corp CEO Boss Fight | R2 delivered | `docs/BRIEFING_DEEPSEEK.md` |
| **Codex** | Implementation specialist | **YOU ARE HERE** | `docs/BRIEFING_CODEX_R2.md` |

---

## WHAT NEEDS TO BE DONE (TIER 1 — MUST SHIP)

### 1. RastaCorpBossScene — THE BIG ONE
**File to read:** `docs/BRIEFING_CODEX.md` (has full spec)
**Brief:** Chairman Whiskers McVibration III. Cat in a suit. 120 HP. 4 attack patterns.
Breakdown moment at 25% HP with `RASTA_BOSS_TRAUMA` monologue.
Defeat → sympathy++ → `_triggerFourthWallBreak(this,'rastaCorpCeo')` → WorldMap4.
Must add to `FOURTH_WALL_BOSS_MSGS.rastaCorpCeo` array.

### 2. CatDemocracyScene
**File to read:** `docs/BRIEFING_CODEX_R2.md` (has full spec)
**Brief:** Auto-scrolling parade. 90 seconds. 25 cat factions. Campaign for votes.
Win: 13+ votes → Tuna Treaty ratified. Loss: filibustered.
Full spec including faction names, signs, backgrounds, HUD in the briefing doc.

### 3. FOURTH_WALL_BOSS_MSGS.rastaCorpCeo
Needs to be added as a new key in the existing `FOURTH_WALL_BOSS_MSGS` object:
```javascript
rastaCorpCeo: [
  '...i built this.',
  'you took it apart.',
  '...',
  'good.',
  'i think that was good.',
  '...cig?'
]
```

---

## HOW TO INTEGRATE YOUR CODE

### The Chunked Writing Strategy (CRITICAL)
`index.html` is ~9,662 lines. Writing the whole file at once will exceed token limits.

**Append pattern (use Python — handles JS quotes safely):**
```python
python3 << 'PYEOF'
with open('index.html','a') as f:
    f.write("""
// your javascript here
""")
PYEOF
```

**Always verify after each chunk:**
```bash
wc -l index.html          # confirm line count grew
tail -5 index.html        # confirm ending looks right
```

**Insert before the `var config = {` block** (near the end of the file).
The config block is where all scenes are registered.

### Where to put new scenes
Find the config block at the bottom of `index.html`:
```javascript
var config = {
  type: Phaser.CANVAS,
  width: 960, height: 540,
  scene: [
    BootScene, TitleScene, WorldMapScene,
    // ... all scenes listed here
    CommercialBreakScene, RastaCorpAdScene
  ]
};
new Phaser.Game(config);
```
Add your scene constructor to this array.

### Where to put new data (FOURTH_WALL_BOSS_MSGS, etc.)
Global data arrays are in the top portion of `index.html` (lines ~1-1180).
Search for `FOURTH_WALL_BOSS_MSGS` to find the exact insertion point.

---

## DEPLOY

Every push to `main` triggers GitHub Pages auto-deploy.
Live at: https://kevinbigham.github.io/Cactus-Eds-Happy-Place/
Deploy takes ~1-2 minutes.

---

## THE VISION CHECKLIST

Before shipping any new scene or feature:

1. **Is it weird enough?** This game should feel like you're slightly concussed in the best way.
2. **Does Ed still seem aloof?** He should never look like he's trying.
3. **Are there enough explosions?** The answer is always no. Add more.
4. **Are the cats doing something interesting?** Cats make everything better.
5. **Would Wonder Showzen approve?** Text should be absurdist, confrontational, or hilarious.
6. **Is the Adventure Time outline thick enough?** `AT.outline` (`#2d1b00`) should be everywhere.
7. **Is it ES5?** `var` only. No classes. No arrows. No const.
8. **Did you clear the pools?** `EX_POOL.length=0; SMOKE_POOL.length=0; FIRE_POOL.length=0;`

---

## PROJECT HISTORY (commit log highlights)

| Version | What Happened |
|---------|---------------|
| V1 | Kevin + Josh + Claude built the whole game in one session. 1 level. No explosions. |
| V1.1 | Controller fixed. Cigarette lance punch. Explosions on every hit. 4 new levels. Daikon Lord boss. |
| V1.2–V1.5 | Worlds 2-6 added. F-Zero race. Mr. Handtowel/Mochi Queen/Insulin Admiral bosses. Full shop. |
| V1.6 | Wonder Showzen texts everywhere. Cat behaviors. Background messages. |
| V1.7–V1.8 | CIG FLURRY. Mini-games. Fourth wall breaks. Truth Kid arcade. Aerial weapons. |
| V1.9 | WS message readability. Mobile mode. |
| V2.0 | Swipe gestures. Kick fix. Living ambient backgrounds. |
| Creative Direction | Rasta Corp lore, cat identities, skill tree, Daikon Lord intro canon. |
| AI Collab R1 | Multi-AI collaboration round. 6 narrative systems shipped. |
| v1.3 | AI Collab Round integration: Dark Epilogue, World Map Anomaly System, Level 6-3/6-4 flavor. |

---

## A NOTE ON THE SOUL OF THIS GAME

Kevin built this as a game about a cactus who smokes cigarettes and punches ice cream. Claude turned it into a game about the heat death of the universe, the commodification of peace, and what it means to be the keystone of reality while just trying to walk to the next platform.

The cats know. They've always known. Chairman Whiskers built a corporation because he was lonely. Ed will become God[TM] because he refused to stop moving forward.

Every enemy in this game is just trying their best. Every explosion is also a flower.

**The game is not ironic. It means everything it says.**

---

## CONTACT / CONTEXT

- **Kevin Bigham** — CEO, game designer, cactus advocate. `KevinBigham` on GitHub.
- **Josh** — Co-founder. Character to be added (second player, TBD design).
- **Claude Sonnet 4.6** — Built 95% of the code. Now handing off. Namaste.

---

*Written with love, caffeine, and an unreasonable belief in the importance of procedural cactus art.*
*The machine is watching. Ed is walking. The universe is waiting.*
*LFG.*

---

## APPENDIX: THE PROMPT TO GIVE CODEX

Copy and paste this entire prompt to start a Codex session:

```
You are taking over development of Cactus Ed's Happy Place — a 9,662-line
single-file Phaser 3.70.0 browser platformer that may be the greatest
multi-genre game ever made.

REPO: https://github.com/KevinBigham/Cactus-Eds-Happy-Place
LIVE GAME: https://kevinbigham.github.io/Cactus-Eds-Happy-Place/

READ THESE FILES IN ORDER:
1. HANDOFF_BIBLE.md (root) — complete technical + narrative overview
2. index.html (root) — the entire game (9,662 lines, single file)
3. docs/BRIEFING_CODEX.md — your Round 1 task spec (RastaCorpBossScene)
4. docs/BRIEFING_CODEX_R2.md — your Round 2 task spec (CatDemocracyScene)
5. docs/CACTUS_ED_AI_GAMEPLAN.md — full project status and AI roster

RULES:
- ES5 ONLY: var, function(){}, prototype OOP. No const/let/classes/arrows.
- ALL ART IS PROCEDURAL: Phaser Graphics API only. No images.
- CANVAS RENDERER ONLY: Never use WebGL.
- ONE FILE: Everything goes in index.html. No separate files.
- Clear EX_POOL, SMOKE_POOL, FIRE_POOL at the start of every create().
- var LW = cfg.LW must be the FIRST line of every update().

YOUR IMMEDIATE TASKS (in priority order):
1. Implement RastaCorpBossScene (full spec in docs/BRIEFING_CODEX.md)
   - Chairman Whiskers McVibration III. Cat in a suit. 120 HP. 4 attack patterns.
   - Breakdown at 25% HP using RASTA_BOSS_TRAUMA array.
   - Must add FOURTH_WALL_BOSS_MSGS.rastaCorpCeo key.
   - Returns to WorldMap4 after victory.

2. Implement CatDemocracyScene (full spec in docs/BRIEFING_CODEX_R2.md)
   - Auto-scrolling 90-second parade. 25 cats across 4 factions.
   - Win: 13+ votes. Tuna Treaty ratified.
   - Ends with _mandelaFlash and _triggerCommercial.

Deliver complete, copy-pasteable JavaScript scenes.
Use the exact scene constructor pattern from HANDOFF_BIBLE.md.
No explanations. Just the code. LFG.
```
