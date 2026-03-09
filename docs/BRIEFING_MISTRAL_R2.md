# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: Mistral — "The Constructor" — ROUND 2
### Role: Scene Builder. Fast. Precise. Gets things running.

---

## WHO YOU ARE IN THIS PROJECT

You build working Phaser 3 scenes from specs. Fast. You follow patterns precisely.

Last round your World 6 level configs and Dark Ending content were solid.
This round: **two tasks** — one full new level scene (The Infinite Bus), and one integration task (putting RASTA_CORP_MSGS to actual use in World 3 levels).

---

## THE GAME — TECHNICAL STACK

- **Engine:** Phaser 3.70.0 (CANVAS renderer — NOT WebGL)
- **Language:** ES5 only — `var`, `function`, prototype pattern. No arrow functions, no classes, no `let`/`const`.
- **File structure:** Single `index.html`. One big `<script>` block. Everything global.
- **Art:** 100% procedural — Phaser Graphics API. No sprites, no images.
- **Manual physics:** `ep = {x, y, vx, vy, grounded}` updated each frame. Gravity is `ep.vy += 28` per frame. Max fall: 700.

### Scene pattern (ES5):
```javascript
function MyScene(){ Phaser.Scene.call(this,{key:'MyScene'}); }
MyScene.prototype=Object.create(Phaser.Scene.prototype);
MyScene.prototype.constructor=MyScene;
MyScene.prototype.create=function(){ ... };
MyScene.prototype.update=function(time,delta){ ... };
```

### Global helpers available (call freely):
```javascript
spawnExplosion(x, y, color, size)   // e.g. spawnExplosion(ep.x, ep.y, 0xff4444, 2)
spawnSmoke(x, y)
updateExplosions()
drawExplosions(g)
updateSmoke()
SOUND.punch()  SOUND.kick()  SOUND.jump()  SOUND.hurt()  SOUND.pickup()  SOUND.death()
_mandelaFlash(scene)
DRAW_ED.draw(g, x, y, frame, flipped, cigF)  // frame 0=idle, 1-3=walk, 4=jump, 5=punch, 6=kick, 7=hurt
EWR_STATE.aloe += n   // currency
EWR_STATE.secrets['key'] = true  // secret flags
EX_POOL  SMOKE_POOL  FIRE_POOL  // clear these in create()
```

---

## TASK 1: INFINITE BUS SCENE

### Concept:
A secret level hidden in WorldMap2. The Hippie Bus never stops. Ed must survive 60 seconds inside it.

### Scene key: `'InfiniteBus'`
### Return: WorldMap2 on win or loss

### Trigger (how to reach it):
Add this tile to WorldMap2's `W2_ROWS` at a secret position (pick a hidden corner).
Create a new tile in `W2_TILES` with type `'secret'` and id `'infiniteBus'`.
In WorldMap2's `_tryEnter2()` function, map `'infiniteBus'` → `'InfiniteBus'` scene.

### Visual — The Bus Interior:
- **Background:** Deep purple `0x2d0050` with yellow trim elements
- **Bus windows:** 3-4 windows along top — dark teal rectangles with rounded corners, showing blurring scenery outside (just horizontal colored streaks moving left)
- **Bus seats:** Brown rectangles as platforms — 3-4 seats staggered in height, creating a platformer layout inside the bus
- **Floor:** Warm orange-brown `0x8b4513`
- **Ceiling:** Purple `0x4a0080`
- **Ambient detail:** Bus driver silhouette far left (just a rounded black shape)

### Level layout:
```
Ceiling:  y=60 (wall — Ed can't jump through it)
Platform heights: y=200, y=280, y=350 (bus seats — 3 platforms, each w=120-180px)
Floor: y=460 (ground)
Width: 960px only — NO horizontal scrolling. This is a contained arena.
```

### Ed setup:
- Start: `{x:100, y:440, vx:0, vy:0, grounded:true}`
- Normal controls (left/right/jump/punch/kick)
- Keyboard + `_initVPad(this)` for mobile

### Auto-scroll enemies:
Every 3 seconds, spawn a mochi at `x=980, y=440` (right edge, ground level):
```javascript
// Mochi object shape for InfiniteBus:
{x:980, y:440, hp:1, dir:-1, vx:-120, hurtT:0, dead:false, parts:[]}
// Move left each frame: m.x += m.vx * dt
// Despawn when m.x < -40
// If Ed punches (punchActive, within 60px): m.hp--, SOUND.punch(), spawnExplosion, +20 aloe
// If Ed kicks (kickActive, within 80px): m.hp--, SOUND.kick(), spawnExplosion, +20 aloe
// If mochi touches Ed (within 28px): Ed hurt, -1 health, hurtTimer=1200
```

Additionally: every 8 seconds, spawn a "rasta" mochi at `x=980, y=random(200,350)` that floats diagonally down-left at `vx=-80, vy=30`.

### Survival timer:
```javascript
this._surviveT = 60000; // ms countdown
// In update: this._surviveT -= delta;
```
Display: top-right corner, white monospace text "TIME: XX"

### HUD:
- Top-left: "VOTES: 0" → no, wrong level. Show: "SURVIVED: Xs / 60s"
- Top-right: "HP: X"
- Center-top: "THE BUS NEVER STOPS" in small purple text

### Win condition (surviveT <= 0):
```javascript
EWR_STATE.aloe += 150;
EWR_STATE.secrets['infiniteBus'] = true;
_mandelaFlash(this);
// Flash: "THE BUS STOPS. BRIEFLY."
// Flash 1200ms later: "...NO IT DOESN'T."
// After 3s: scene.start('WorldMap2')
```

### Loss condition (EWR_STATE.health[0] <= 0):
```javascript
EWR_STATE.health[0] = EWR_STATE.maxHealth[0]; // respawn health
// Flash: "ED GOT OFF THE BUS."
// Flash: "THE BUS CONTINUED."
// After 2s: scene.start('WorldMap2')
```

### Bus window scenery (visual detail):
In the update loop, animate 3-5 horizontal streaks behind the windows:
```javascript
// streak objects: {x, y, w, color, speed}
// Move left each frame: s.x -= s.speed * dt
// When s.x < windowLeft: s.x = windowRight
// Colors: 0x88ccaa, 0x4488cc, 0xaaaa44 (desert landscape blurs)
```

---

## TASK 2: RASTA_CORP_MSGS INTEGRATION IN WORLD 3 LEVELS

### Context:
The game has these global arrays that are defined but **never used in gameplay**:
```javascript
var RASTA_CORP_MSGS = [
  'RASTA CORP: THE REVOLUTION WILL BE FRANCHISED',
  'RASTA CORP™: YOUR PEACE. OUR RECEIPT.',
  'GOOD VIBES ARE A REGISTERED TRADEMARK OF RASTA CORP INC.',
  'RASTA CORP: WE MONETIZED ENLIGHTENMENT SO YOU DON\'T HAVE TO',
  'JOIN THE RASTA CORP LOYALTY PROGRAM. REDEMPTION SOLD SEPARATELY.',
  'RASTA CORP: DISRUPTING THE SPIRITUAL ECONOMY SINCE ALWAYS',
  'THE REVOLUTION HAS A PREMIUM TIER. UPGRADE NOW.',
  'RASTA CORP: BECAUSE SOMEONE HAS TO OWN THE VIBES',
  'YOUR TRAUMA IS AN ASSET. RASTA CORP WILL MANAGE IT.',
  'RASTA CORP DENTAL PLAN: BECAUSE THE REVOLUTION NEEDS TEETH'
];

var RASTA_CORP_SPEECH = [
  'MY TRAUMA IS A SERVICE',
  'I AM MONETIZING MY HEALING JOURNEY',
  'THE REVOLUTION HAS A DENTAL PLAN',
  'I BELIEVE IN THE VIBES. RASTA CORP OWNS THE VIBES.',
  'PEACE IS A PRODUCT. I AM AN EMPLOYEE OF PEACE.',
  'MY CHAKRAS ARE LISTED ON THE NASDAQ',
  'ENLIGHTENMENT IS A SUBSCRIPTION SERVICE',
  'I AM DISRUPTING THE PARADIGM OF BEING FINE',
  'RASTA CORP GAVE ME PURPOSE. RASTA CORP OWNS MY PURPOSE.'
];
```

World 3 (Levels 31-36) is Rasta Corp territory. These cats have been recruited.
Currently World 3 cats say normal cat speech. They should say Rasta Corp speech instead.

### createLevelScene factory — catSetup hook:
The factory accepts a `catSetup: function(scene)` that runs in `create()` after cats are placed.
Each cat in `scene.cats[]` is an object: `{x, y, ci, tailAng, facing, sitting, dance, smoker, danceT, name, wsMsg}`.
The `wsMsg` field controls what the cat says when Ed gets near.

### What to deliver:

**A) A `catSetup` addition** for Level31-36: after cats are placed, iterate `scene.cats` and for each cat, set:
```javascript
cat.wsMsg = RASTA_CORP_SPEECH[Math.floor(Math.random()*RASTA_CORP_SPEECH.length)];
cat.smoker = false; // Rasta cats don't smoke — they meditate
cat.dance = Math.random() < 0.4; // 40% chance of dance
```

**B) An `onUpdate` flash system** that shows RASTA_CORP_MSGS as background flash text in World 3 levels (like how WS_MSGS flash in Level 1-3). Every 10-12 seconds, flash a random RASTA_CORP_MSGS entry:
```javascript
onUpdate: function(scene, time, delta) {
  scene._rcMsgT = (scene._rcMsgT||0) - delta;
  if(scene._rcMsgT <= 0) {
    scene._rcMsgT = 10000 + Math.random()*4000;
    var msg = RASTA_CORP_MSGS[Math.floor(Math.random()*RASTA_CORP_MSGS.length)];
    scene._flash(msg, 2400, 18, '#ffdd00');
  }
}
```

**Deliver:** The exact `catSetup` function code and `onUpdate` function code to add to **each** of Level31 through Level36's `createLevelScene({...})` config object.

Since all 6 levels get the same `catSetup` and `onUpdate`, you can write them once as shared code and explain they're identical across all 6.

---

## OUTPUT FORMAT

**Task 1:** Complete `InfiniteBusScene` — constructor, create(), update() — all prototype methods. Copy-pasteable block.
Then: one additional code snippet showing the WorldMap2 tile to add.

**Task 2:** The shared `catSetup` function + `onUpdate` function. Plus a note showing exactly how to add them to Level31 config (example), clarifying the same applies to Level32-36.

Build it. Make it run.
