# CACTUS ED'S HAPPY PLACE — HANDOFF BIBLE
### For: Claude Code (or any future dev) continuing this project
### Written by: Claude Sonnet 4.6 after building V1 + V1.1 with Kevin & Josh

---

## TLDR

Single-file browser game. Everything lives in `index.html`. Phaser 3.70 via CDN.
No build system. No npm. No dependencies to install. Open the file, play the game.

**Live game:** https://kevinbigham.github.io/Cactus-Eds-Happy-Place/
**Repo:** https://github.com/KevinBigham/Cactus-Eds-Happy-Place
**SSH remote:** `git@github.com:KevinBigham/Cactus-Eds-Happy-Place.git`
**Working dir:** `/Users/tkevinbigham/Downloads/Kevin and Josh make a game/`

---

## THE GAME — VISION & SOUL

**Cactus Ed's Happy Place** is an addictive psychedelic side-scrolling action-platformer
with the energy of SNES Contra III meets Adventure Time meets Wonder Showzen.

### The Protagonist: Ed
- A **slow-moving, chain-smoking cactus** from the **West Bottoms, Kansas City**
- Vibe: completely aloof, doesn't want trouble but will absolutely throw hands
- Wears sunglasses. Always. Dark rectangular lenses with a gold rim.
- His cigarette IS his weapon — it extends as a lance when he punches
- Ship: **The Hippie Bus Spaceship** (a purple/yellow psychedelic VW bus that flies)
- Speaks in short, deadpan sentences. Never excited. Always right.

### The Antagonist: Mochi Ice Cream
- Mochi balls are the enemy. Pink, round, innocent-looking, evil.
- They patrol, they absorb punches, they die in explosions.
- The Big Mochi is the boss — fat, lumbering, spawns minions, charges at you.

### The World
- **Currency: Aloe** (green, glowing, collectable)
- **Map style:** Super Mario World overworld — tile grid, Ed walks between level nodes
- **Aesthetic:** Adventure Time thick black outlines × Wonder Showzen absurdism
- **Themes:** post-modernism, absurdism, late capitalism critique, cats, psychedelia

### The Cats
- Cats are NPCs. They dance. They smoke. They have names like "Chairman Whiskers."
- They are NOT enemies. They are ambient weirdos who populate the world.
- Petting cats = +5 aloe (not implemented yet but scaffolded)
- In Level 1-2 ALL cats are dancing. In 1-3 half are smokers.

### Wonder Showzen Texts (WS_TEXTS)
These flash on screen randomly in Level 1-3 and beyond:
`CONSUME`, `ARE YOU REAL?`, `DO YOU FEEL?`, `BIRTH SCHOOL WORK DEATH`,
`YOU ARE PRODUCT`, `LOOK AWAY`, `CACTUS MOMENT`, `THIS IS FINE`,
`REALITY IS OPTIONAL`, `ED WAS RIGHT`

---

## TECHNICAL ARCHITECTURE

### The Golden Rule: ONE FILE
Everything — HTML, CSS, JS, all game code, all art — lives in `index.html`.
**Do not** create separate files unless you have a very compelling reason.
This is intentional. It means the game can be deployed anywhere instantly.

### Phaser 3.70.0
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
```
Renderer: **`Phaser.CANVAS`** (forced — WebGL caused black screen issues on some machines).

### Scene Architecture (ES5 constructor pattern)
All scenes use old-school ES5 prototypes, NOT ES6 classes. This is intentional for
maximum compatibility and to avoid transpilation.

```javascript
function MyScene() { Phaser.Scene.call(this, {key:'MyScene'}); }
MyScene.prototype = Object.create(Phaser.Scene.prototype);
MyScene.prototype.constructor = MyScene;
MyScene.prototype.create = function() { ... };
MyScene.prototype.update = function(time, delta) { ... };
```

### Scene List (in config order)
1. `BootScene` — preloads, transitions to TitleScene
2. `TitleScene` — logo + "PRESS START" prompt
3. `WorldMapScene` — Super Mario World-style overworld grid
4. `Level11Scene` — "Ed Wakes Up" (fully hand-written, most complex)
5. `Level12Scene` — "The Cat Rave" (factory-generated)
6. `Level13Scene` — "After Dark" (factory-generated)
7. `Level14Scene` — "Hippie Bus Highway" (factory-generated)
8. `Level15Scene` — "Mochi HQ" / Big Mochi Boss (hand-written, boss logic)

### Manual Physics (NOT Phaser Arcade)
Ed is NOT a Phaser physics body. All physics is manual:
```javascript
ep = { x, y, vx, vy, grounded, facing, ... }  // Ed's physics object
es = { punchTimer, kickTimer, hurtTimer, ... }  // Ed's state
```
Collision is manual AABB vs `this.platRects[]` array.
Gravity is applied manually each frame: `ep.vy = Math.min(ep.vy + 28, ED_MOVE.maxFall)`

### Graphics API (all art is procedural)
No sprites. No spritesheets. Every visual is drawn with Phaser Graphics:
```javascript
g.fillStyle(0xrrggbb, alpha);
g.fillRect(x, y, w, h);
g.fillRoundedRect(x, y, w, h, radius);
g.fillCircle(x, y, r);
g.fillEllipse(x, y, w, h);
g.fillTriangle(x1,y1, x2,y2, x3,y3);
g.lineBetween(x1,y1, x2,y2);
g.save(); g.translateCanvas(x,y); g.scaleCanvas(-1,1); /* flip */ g.restore();
g.clear(); // called each frame to redraw
```

### Global State
```javascript
var EWR_STATE = {
  aloe: 200,            // current aloe balance
  world: 1,             // current world number
  levelsBeaten: [],     // array of level IDs e.g. ['1-1','1-2']
  secrets: {},          // discovered secrets
  playerPos: {x:5,y:5},// world map position
  coopMode: false,
  health: [3,3],        // [p1,p2]
  maxHealth: [3,3],
  catsPetted: 0,
  fightWins: 0
};
```

### Global Constants
```javascript
ED_MOVE = { walkSpeed:140, jumpVel:-520, jumpCut:0.4, airControl:0.75,
             coyoteMs:90, jumpBufMs:130, maxFall:700, punchRange:56, kickRange:72 }

ALOE = { start:200, beat11:50, beat12:80, beat13:60, beat14:80, beat15:300,
          secretFind:20, catPet:5, fightWin:40,
          mochiDeath:8, aloePickup:15, raceEntryFee:25 }
```

### Color Palette (AT object)
```javascript
AT = {
  // Environment
  sky:'#7ec8e3', skyDark:'#4a9bb5',
  grass:'#8ac926', grassDark:'#5a8c1a',
  dirt:'#c97d4e', dirtDark:'#8b5028',
  outline:'#2d1b00',        // THE Adventure Time thick black outline color
  // Ed
  skinEd:'#3d6b34', skinEdDk:'#2a4d24', spineEd:'#f5f0dc',
  cigTip:'#ff6b35', cigBody:'#d4c8a0',
  // UI
  uiBg:'#1a0a2e', uiPanel:'#2d1254', uiText:'#f5f0dc', uiGold:'#ffd60a', uiRed:'#ff4444',
  // Cat colors
  catA:'#ff9f43', catB:'#dfe6e9', catC:'#2d3436', catD:'#fdcb6e',
  // Special levels
  neon1:'#ff00ff', neon2:'#00ffff', neon3:'#cc44ff',  // Cat Rave
  night:'#0a001e', nightSky:'#050010',                // After Dark
  orange:'#ff7c00', sunset:'#ff4500'                  // Hippie Bus Highway
}
```

---

## DRAW FUNCTIONS (the art engine)

### DRAW_ED — Ed's sprite
`DRAW_ED.draw(g, x, y, frame, flipped, cigF)`

**Frames:**
- `0` — idle (default)
- `1,2,3` — walk cycle (arms offset)
- `4` — jump (slight lean)
- `5` — **PUNCH** — cigarette extends as lance rod to `facing*44`, ember glow at `facing*58`
- `6` — **KICK** — right leg extends +28px, 3 motion lines behind it
- `7` — **HURT** — X-eyes in red

**Animation logic in Level11:**
```javascript
if (es.hurtTimer > 900) frame = 7;
else if (es.kickTimer > 400) frame = 6;
else if (es.punchTimer > 200) frame = 5;
else if (!ep.grounded) frame = 4;
else frame = Math.floor(ep.walkT / 180) % 3 + 1;  // walk cycle
```

**Hitbox for punch:** `ep.x + es.facing * 56` (cigarette lance tip, NOT body center)
**Hitbox for kick:** `ep.x + es.facing * 72`

### DRAW_CAT — Cat sprite
`DRAW_CAT.draw(g, x, y, colors, tailAng, facing, sitting, dance, smoker, danceT)`

- `dance=true`: arms raised, body bobs via `Math.sin(danceT*0.007)*3`
- `smoker=true`: tiny 4px cigarette at mouth position
- `danceT`: incrementing timer, causes the bob animation
- Cat objects: `{x, y, colors, tailAng, tailDir, facing, sitting, dance, smoker, danceT}`

### DRAW_BUS — Hippie Bus
`DRAW_BUS.draw(g, x, y)` — draws the full hippie bus spaceship
Used as parallax in Level 1-4.

### DRAW_HUD — HUD utilities
`DRAW_HUD.aloeBar(g, x, y, amount)` and `DRAW_HUD.healthBar(g, x, y, hp, maxHp)`

### Shared helpers (called by Level scenes)
```javascript
spawnMochiParts(m, mochiPartsArr)  // death animation parts
drawMochi(g, m)                    // renders mochi with optional m.sunglasses
drawAloe(g, x, y)                  // green aloe pickup orb
```

### Particle Systems
```javascript
// Smoke (follows Ed's cigarette)
spawnSmoke(x, y)       // adds to SMOKE_POOL
updateSmoke()           // advance physics
// draw inline in level update

// Explosions (every hit/death/pickup)
spawnExplosion(x, y, color, size)   // adds to EX_POOL
updateExplosions()                   // advance physics + decay
drawExplosions(g)                    // render to graphics object
```

**Explosion colors by event:**
- Punch hit: `0xffd60a` (yellow), size 1
- Kick hit: `0xff6b35` (orange), size 1.5
- Mochi death: `0xff4444` (red), size 2
- Aloe pickup: `0x00e676` (green), size 1
- Boss death: `0xff4444`, size 3 (sequence of several)

---

## CRITICAL BUGS & THEIR FIXES (read before touching anything)

### 1. Gamepad Button Objects (THE BIG ONE)
In Phaser 3, `pad.A`, `pad.B`, `pad.X`, `pad.Y` return **Button objects**, not booleans.
An object is always truthy. This killed controller support entirely in V1.

**WRONG (V1 bug):**
```javascript
if (pad.A) jump();  // ALWAYS fires — pad.A is always a truthy object
```

**CORRECT (V1.1 fix):**
```javascript
if (pad.A && pad.A.pressed) jump();
```

Note: `pad.left`, `pad.right`, `pad.up`, `pad.down` DO return booleans correctly.
Analog sticks: `pad.leftStick.x`, `pad.leftStick.y` return floats -1 to 1.

**PowerA OPS V3 (Xbox layout) mapping:**
- Movement: Left stick OR d-pad (pad.left/right/up/down)
- Jump: A button (`pad.A && pad.A.pressed`)
- Punch: X button (`pad.X && pad.X.pressed`)
- Kick: B button (`pad.B && pad.B.pressed`)

**Edge-triggered punch/kick** (one press = one action, not held):
```javascript
var pNow = pad.X && pad.X.pressed;
gpPunch = pNow && !this._prevPunchGP;
this._prevPunchGP = pNow;
```

### 2. var Hoisting in update()
`var LW = cfg.LW` (or `var LW = 4800`) MUST be the FIRST line of any level's `update()`.
If declared anywhere else, JS hoists the declaration but not the value — `LW` is `undefined`
when the camera clamp at the top of update() runs.

```javascript
LevelScene.prototype.update = function(time, delta) {
  var LW = 4800;  // ← FIRST LINE, always
  var cam = this.cameras.main;
  cam.scrollX = Math.max(0, Math.min(ep.x - 480, LW - 960));  // needs LW
  ...
```

### 3. Graphics restore vs restoreCanvas
`g.restore()` is the correct Phaser 3 method.
`g.restoreCanvas()` does NOT exist and throws. Easy to confuse.

### 4. Cross-Level Particle Bleed
`EX_POOL` and `SMOKE_POOL` are global. If a level ends mid-explosion, particles
persist into the next scene and draw in wrong positions.

**Fix:** Clear pools at the top of every level's `create()`:
```javascript
create: function() {
  EX_POOL.length = 0;
  SMOKE_POOL.length = 0;
  ...
```

### 5. Platform Graphics Persistence
`this.bgG` (background graphics) is drawn once in `create()` and never cleared.
`this.edG` (Ed + animated elements) is cleared and redrawn every frame.
Never call `this.bgG.clear()` in `update()` — you'll erase the level background.

### 6. Camera scrollX Pattern
```javascript
cam.scrollX = Math.max(0, Math.min(ep.x - 480, LW - 960));
```
`LW` = level width in pixels. 960 = game viewport width. 480 = half viewport.

---

## THE LEVEL FACTORY

Levels 1-2, 1-3, 1-4 are generated by `createLevelScene(key, cfg)`.
Level 1-1 and 1-5 are hand-written (more complex/custom).

### Factory config shape:
```javascript
{
  levelId: '1-2',           // for levelsBeaten tracking
  aloeReward: ALOE.beat12,  // aloe on completion
  LW: 3200,                 // level width in pixels
  title: '1-2  THE CAT RAVE',
  bgColor: 0x000000,        // Phaser hex for background fill
  drawBg: function(scene, g) { ... },   // called once in create() for static bg
  platforms: [              // array of {x,y,w,h} rects (ground + platforms)
    {x:0, y:500, w:3200, h:40},
    ...
  ],
  catSetup: function(scene) { ... },    // push into scene.cats[]
  enemySetup: function(scene) { ... },  // push into scene.mochis[]
  pickups: [                // array of {x,y} positions for aloe drops
    {x:300, y:460}, ...
  ],
  onCreate: function(scene) { ... },   // extra setup (laser beams, parallax layers, etc)
  onUpdate: function(scene, time, delta) { ... }  // extra per-frame logic
}
```

### Factory handles automatically:
- Ed spawn/physics/input (keyboard + gamepad with all V1.1 fixes)
- S key duck
- Platform collision
- Mochi AI + combat (punch/kick hit detection, hp, death, parts)
- Aloe pickups
- Cat rendering (with dance/smoker support)
- Camera scroll
- HUD (aloe display, health)
- Level complete → aloe reward → WorldMap transition
- `EX_POOL.length=0` and `SMOKE_POOL.length=0` in create()
- `updateExplosions()` and `drawExplosions()` in update()

---

## WORLD MAP

### W1_ROWS grid (16 cols × 10 rows)
```
'MMMMMMMMMMMMMMMM'
'M   M    T  5 MM'   ← '5' = Mochi HQ (col 12, row 1)
'M G  G  GT  P MM'
'M GG G  GPPP4 MM'   ← '4' = Hippie Bus Highway (col 12, row 3)
'M GGC G2 P  C MM'   ← '2' = The Cat Rave
'M P  1P P3P   MM'   ← '1' = Ed Wakes Up, '3' = After Dark
'M P  GPPPP    MM'
'M PP  GG PPCG MM'
'M  G   GG G   MM'
'MMMMMMMMMMMMMMMM'
```

### Level gates (sequential unlock):
- 1-2 requires beating 1-1
- 1-3 requires beating 1-2
- 1-4 requires beating 1-3
- 1-5 requires beating 1-4

### To add World 2:
1. Add `W2_ROWS` and `W2_TILES` globals
2. Add new level scenes
3. Add transition from World 1 map to World 2 map
4. Gate World 2 entrance behind beating 1-5

---

## LEVEL-BY-LEVEL SUMMARY

### Level 1-1: "Ed Wakes Up"
- **LW:** 4800px | **Aloe reward:** 50
- **Vibe:** Classic intro. Daytime. Green. West Bottoms KC.
- **Platforms:** Ground + a few elevated platforms
- **Enemies:** 8 mochis, speed ~50
- **Cats:** 5 cats (mix of sitting/walking), some smokers
- **Controls HUD:** Shown bottom-right for first 30 seconds
- **Special:** Coyote time, jump buffering, full input/physics demo level

### Level 1-2: "The Cat Rave"
- **LW:** 3200px | **Aloe reward:** 80
- **Vibe:** Black room, neon laser beams, total rave energy
- **Background:** Animated neon laser beams (pink/cyan/purple), redrawn each frame via `laserG`
- **Enemies:** 10 mochis, all with `sunglasses: true` → drawn with tiny shades
- **Cats:** 12 cats, ALL with `dance: true` and `danceT` incrementing
- **Platforms:** Speaker stack rectangles

### Level 1-3: "After Dark"
- **LW:** 3600px | **Aloe reward:** 60
- **Vibe:** Late night KC. Existential. Stars. Skyline silhouette.
- **Background:** Deep night `#050010`, 100 stars, KC skyline silhouette, crescent moon
- **Enemies:** 12 mochis, speed 60 (faster than 1-1)
- **Cats:** 14 cats: 7 sitting, 7 with `smoker: true`
- **Special:** WS_TEXTS flash every ~8 seconds via `this._flash(text, 2000)`

### Level 1-4: "Hippie Bus Highway"
- **LW:** 4000px | **Aloe reward:** 80
- **Vibe:** Desert sunset highway. Psychedelic road trip.
- **Background:** Orange/pink sunset gradient, gray highway at y=490 with dashed lines
- **Enemies:** 14 mochis on highway
- **Cats:** 10 cats on roadsign platforms
- **Special:** Hippie Bus drives across background every ~8 seconds (parallax via `busParallaxG`)

### Level 1-5: "Mochi HQ"
- **LW:** 3200px | **Aloe reward:** 300
- **Vibe:** Industrial factory. Mochi's home base. Conveyor belts. The final reckoning.
- **Background:** Cyan/white/pink factory interior (pipes, machines, conveyor belts)
- **Pre-boss:** 8 regular mochis
- **Boss:** Big Mochi at x=3000 — **20 HP, 3 phases:**
  - Phase 0 (hp 20–15): slow patrol, no special
  - Phase 1 (hp <15): spawns 2 mini-mochis every 4.5 seconds
  - Phase 2 (hp <8): charge attack at speed 280, 1500ms recovery cooldown
- **Boss health bar:** Red rect top-center, scrollFactor=0
- **Boss death:** 2-second explosion sequence → `_beatBoss()` → +300 aloe → WorldMap

---

## CONTROLS

### Keyboard
| Action | Key |
|--------|-----|
| Move left/right | A/D or ←/→ |
| Jump | W or ↑ or Space |
| Duck/Slow | S or ↓ |
| Punch (cigarette lance) | Z |
| Kick | X |

### Gamepad (PowerA OPS V3 / Xbox layout)
| Action | Button |
|--------|--------|
| Move | Left stick or D-pad |
| Jump | A |
| Punch | X |
| Kick | B |

---

## THE CHUNKED WRITING STRATEGY (CRITICAL)

**The problem:** Claude's output is capped at ~32,000 tokens. `index.html` is ~1,700 lines.
Writing the whole file in one `Write` tool call will fail with:
`API Error: Claude's response exceeded the 32000 output token maximum`

**The solution:** Write in 5 sequential chunks:

| # | Tool | Content |
|---|------|---------|
| 1 | `Write` (fresh file) | HTML head + all globals + all DRAW_* functions |
| 2 | `Bash` python3 append | BootScene + TitleScene + WorldMapScene |
| 3 | `Bash` python3 append | Level11Scene (most complex, hand-written) |
| 4 | `Bash` python3 append | createLevelScene factory + Level12 + Level13 + Level14 |
| 5 | `Bash` python3 append | Level15Scene + Phaser config + `</script></body></html>` |

**Append pattern (safe for JS with quotes):**
```python
python3 << 'PYEOF'
with open('index.html','a') as f:
    f.write("""
... javascript code here ...
""")
PYEOF
```

The `"""..."""` triple-quoted Python string handles both `'` and `"` inside the JS
without escaping nightmares. This is the proven approach that works every time.

**Verify after each chunk:**
```bash
wc -l index.html                    # check line count grew
tail -5 index.html                  # check ending looks right
```

---

## DEPLOY

### GitHub Pages (auto-deploy via Actions)
Every push to `main` triggers `.github/workflows/pages.yml` which deploys `index.html`
to https://kevinbigham.github.io/Cactus-Eds-Happy-Place/

Deploy takes ~1-2 minutes after push.

### Git workflow
```bash
cd "/Users/tkevinbigham/Downloads/Kevin and Josh make a game"
git add index.html
git commit -m "vX.Y: description"
GIT_SSH_COMMAND="ssh -o ConnectTimeout=15 -o BatchMode=yes" git push origin main
```

Note: The `GIT_SSH_COMMAND` wrapper prevents SSH from hanging forever on auth issues.

---

## IDEAS FOR V1.2 AND BEYOND

### Immediate Polish (low effort, high impact)
- [ ] **Sound effects** — Phaser.Sound with Web Audio API. Punch thwack, explosion boom,
  aloe ding, jump whoosh. No audio files needed — use `AudioContext.createOscillator()`
  for chiptune-style sounds.
- [ ] **Screen shake** on boss hits — `this.cameras.main.shake(150, 0.02)`
- [ ] **Ed idle animation** — random cigarette puff smoke every 3-4 seconds when standing still
- [ ] **Death screen** — when hp reaches 0, fade to black, "ED NEEDS A MINUTE" text, respawn
- [ ] **Aloe counter animation** — tween the number up when you collect aloe
- [ ] **Level transition** — flash white briefly when entering a level from world map
- [ ] **Cat petting** — press Z near a sitting cat → +5 aloe, cat does a happy spin

### New Levels (World 1 Extras / World 2)
- [ ] **World 1 Secret: The Hippie Bus Interior** — inside Ed's ship. Zero gravity. Weird jazz.
- [ ] **World 2-1: "The Aloe Fields"** — wide open desert, aloe plants everywhere, new enemy: Scorpion Clones
- [ ] **World 2-2: "Speed Run"** — F-Zero style auto-scrolling race down a highway
- [ ] **World 2-3: "The Neon Swamp"** — bioluminescent underground
- [ ] **World 2 Boss: "Mega Mochi Consortium"** — 3 big mochis in a board meeting

### Gameplay Systems (medium effort)
- [ ] **Co-op mode** — Second player controls Josh (TBD character design). `EWR_STATE.coopMode`
  is already scaffolded. Need second `ep2` physics object and DRAW_JOSH function.
- [ ] **Aloe Shop** — on WorldMap, 'S' key opens shop. Buy: extra health, speed boost,
  explosive cigarette upgrade, second hit of jump.
- [ ] **Secrets** — hidden paths in levels. `EWR_STATE.secrets['1-1-secret'] = true`
  already hooks up. Add hidden platform in Level 1-1 leading to a room with 100 aloe.
- [ ] **Score/Combo system** — consecutive hits multiply aloe drops
- [ ] **Ed's dialogue** — Z key near cats/signs triggers one-liner from Ed. Deadpan, short.

### New Enemies
- [ ] **Mochi Jr.** — tiny fast version, 1 HP, spawns from boss phase 1 (already in game)
- [ ] **Mochi Tank** — slow, 4 HP, knocks Ed back on touch
- [ ] **Mochi Thrower** — stationary, throws mini-mochis at Ed
- [ ] **Daikon Drone** — flying enemy, requires jump + punch

### Visual Upgrades
- [ ] **Parallax background layers** — multiple bg layers scrolling at different speeds
  (clouds at 0.1x, hills at 0.3x, buildings at 0.6x)
- [ ] **Day/night cycle on WorldMap** — subtle color shift in sky over time
- [ ] **Ed's cigarette smoke trail** — leave SMOKE_POOL puffs as Ed walks
- [ ] **Mochi squish** — when mochi dies, do a squish deform before explosion
  (scale y from 1→0.3→gone over 200ms)
- [ ] **Screen CRT filter** — black horizontal line overlay (alternating rows at alpha 0.08)
  for that retro TV feel. Apply via a top-layer graphics object with scrollFactor=0.

### Big Feature: The Hippie Bus Spaceship Level
Ed's ship appears in cutscenes between worlds. The Level 1-5 completion screen should
show the bus flying away. Future world transition: bus enters warp, star field, new world.

```javascript
// Bus object (for cutscene/transition)
var HIPPIE_BUS = { x:-200, y:270, speed:3, visible:false };
// DRAW_BUS.draw(g, x, y) already exists — just animate x each frame
```

---

## CODE PATTERNS TO FOLLOW

### Mochi object shape
```javascript
{
  x: 400, y: 460,
  vx: 50, hp: 2,
  dir: 1,               // patrol direction
  hurtT: 0,             // hurt flash timer
  dead: false,
  parts: [],            // death animation parts
  sunglasses: false     // draws tiny shades if true (Level 1-2)
}
```

### Cat object shape
```javascript
{
  x: 200, y: 470,
  colors: CAT_COLORS[0],
  tailAng: 0, tailDir: 1,
  facing: 1,
  sitting: false,
  dance: false,          // arms up + bob animation
  smoker: false,         // tiny cig at mouth
  danceT: 0,             // incrementing timer for dance bob
  name: CAT_NAMES[0]     // for dialogue/petting
}
```

### Flash message pattern (used for WS_TEXTS, level title, etc.)
```javascript
Level13Scene.prototype._flash = function(txt, dur) {
  var t = this.add.text(480, 200, txt, {
    fontFamily:'monospace', fontSize:'28px',
    color:'#ffffff', stroke:'#000000', strokeThickness:4,
    align:'center'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);
  this.time.delayedCall(dur, function(){ t.destroy(); });
};
```

### Level complete pattern
```javascript
LevelScene.prototype._beatLevel = function() {
  if (this._beaten) return;
  this._beaten = true;
  EWR_STATE.levelsBeaten.push(this._cfg.levelId);
  EWR_STATE.aloe += this._cfg.aloeReward;
  this._flash('LEVEL COMPLETE! +' + this._cfg.aloeReward + ' ALOE', 3000);
  var self = this;
  this.time.delayedCall(3200, function() {
    self.scene.start('WorldMap');
  });
};
```

---

## FILE STRUCTURE (index.html zones)

```
index.html
├── <head> — Phaser CDN, CSS
├── <script>
│   ├── Zone 2: Globals
│   │   ├── AT (color palette)
│   │   ├── EWR_STATE (global game state)
│   │   ├── ED_MOVE, ALOE (tuning constants)
│   │   ├── CAT_NAMES, CAT_COLORS
│   │   ├── W1_ROWS, W1_TILES (world map)
│   │   ├── WS_TEXTS
│   │   ├── SMOKE_POOL + smoke functions
│   │   └── EX_POOL + explosion functions
│   ├── DRAW_ED (Ed's sprite, 8 frames)
│   ├── DRAW_CAT (cat sprite, dance/smoker)
│   ├── DRAW_BUS (hippie bus)
│   ├── DRAW_HUD (aloe bar, health)
│   ├── BootScene
│   ├── TitleScene
│   ├── WorldMapScene
│   ├── Level11Scene (hand-written, ~400 lines)
│   ├── createLevelScene (factory function)
│   ├── Level12Scene (factory)
│   ├── Level13Scene (factory)
│   ├── Level14Scene (factory)
│   ├── Level15Scene (hand-written, boss, ~300 lines)
│   └── Phaser config + new Phaser.Game(config)
└── </script></body></html>
```

---

## KNOWN ISSUES / TODO

- [ ] Level 1-2 through 1-4 use factory — not as thoroughly playtested as 1-1
- [ ] No death/respawn system yet (Ed falls off platform → stuck)
- [ ] No audio
- [ ] Boss health bar in 1-5 is drawn in `_drawBoss()` — verify it sticks at top of screen
- [ ] `catsPetted` increments but no petting mechanic exists yet
- [ ] WS_TEXTS in Level 1-3: verify timer fires every ~8s (uses `this._wsTimer`)
- [ ] Bus parallax in Level 1-4: verify `busParallaxG` layer depth doesn't occlude Ed

---

## THE VIBE CHECKLIST

Before shipping any new level or feature, ask:

1. **Is it weird enough?** This game should feel like you're slightly concussed in the best way.
2. **Does Ed still seem aloof?** He should never look like he's trying.
3. **Are there enough explosions?** The answer is always no. Add more.
4. **Are the cats doing something interesting?** Cats make everything better.
5. **Would Wonder Showzen approve?** Text should be absurdist, confrontational, or hilarious.
6. **Is the Adventure Time outline thick enough?** `AT.outline` (`#2d1b00`) should be everywhere.

---

## HISTORY

| Version | What Happened |
|---------|---------------|
| V1 | Kevin + Josh + Claude built the whole game in one session. Deployed to GitHub Pages. Controller broken, only 1 level, no explosions. |
| V1.1 | Full upgrade. Controller fixed (the Button object bug). Cigarette lance punch. Explosions on every hit. Cats dance AND smoke. 4 new levels. Big Mochi boss. Controls HUD. |

---

*Written with love by Claude Sonnet 4.6 for Kevin, Josh, and whoever comes next.*
*LFG 🌵*
