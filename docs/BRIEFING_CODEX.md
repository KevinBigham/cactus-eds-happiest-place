# BRIEFING FOR CODEX (GitHub Copilot)
## Cactus Ed's Happy Place — Implementation Specialist

---

## WHO YOU ARE IN THIS COLLAB

You are **The Implementer**. You live in the code. You write precise, working JavaScript that slots directly into an existing 9,500-line single-file Phaser 3.70.0 game. You do not guess. You match the existing code style exactly.

**Your Codename:** CODEX — The Codewriter
**Your Mission:** Implement the Rasta Corp CEO Boss Fight scene

---

## THE GAME — QUICK CONTEXT

`Cactus Ed's Happy Place` is a single-file ES5 browser platformer. No build tools. No modules. Just one big `index.html` with Phaser 3.70.0 loaded from CDN.

**Style rules you must follow:**
- ES5 only (`var`, not `let`/`const`)
- No arrow functions — use `function()`
- Prototype-based OOP: `function MyScene(){ Phaser.Scene.call(this,{key:'MyKey'}); }`
- All graphics drawn procedurally with Phaser's Graphics API (no images)
- Colors as hex ints: `0xff4444`, or strings: `'#ff4444'`
- Wrap risky things in `try/catch`
- Global state lives in `EWR_STATE` object
- ALOE is the currency (integers only)

**Existing code patterns to follow exactly:**

```javascript
// Scene constructor pattern:
function MyScene(){ Phaser.Scene.call(this,{key:'MyScene'}); }
MyScene.prototype=Object.create(Phaser.Scene.prototype);
MyScene.prototype.constructor=MyScene;
MyScene.prototype.create=function(){
  var self=this; var W=960,H=540;
  // ...
};
MyScene.prototype.update=function(time,delta){
  var dt=delta/1000;
  // ...
};

// Flash text (already exists as Level11Scene._flash):
// this._flash('MESSAGE',durationMs,fontSize,'#color')

// Spawn explosion (global):
// spawnExplosion(x, y, colorHex, size)

// Play sound:
// SOUND.victory() / SOUND.bossHit() / SOUND.hurt() / SOUND.punch()

// Track boss beat:
// if(EWR_STATE.levelsBeaten.indexOf('rasta-boss')<0){
//   EWR_STATE.levelsBeaten.push('rasta-boss');
//   EWR_STATE.aloe+=ALOE.rastaCorpBoss; // = 3500
//   EWR_STATE.rastaCorp.bossesDefeated++;
// }
```

---

## YOUR TASK: `RastaCorpBossScene`

### What this is:
The **Rasta Corp CEO boss fight**. The CEO (name: Chairman Whiskers McVibration III) is the corporate antagonist of World 3. He's a cat in a suit. He's sympathetic. He just wanted someone to sit with him. He monetized peace because he couldn't find it.

**He fights with:**
1. **CORPORATE MEMO BARRAGE** — Throws stacks of paper (white rects) that arc across the screen
2. **REBRAND** — Flashes the arena with a new corporate color scheme and spawns 3 Rasta Corp mochi enforcers
3. **LEGAL NOTICE** — A brief shield that blocks all attacks (3 seconds, "CEASE AND DESIST" displayed)
4. **BREAKDOWN MOMENT** (at 25% HP) — Stops fighting briefly, delivers a trauma monologue from `RASTA_BOSS_TRAUMA` array, then goes ENRAGED (speed +50%, memo barrage frequency +100%)

**When defeated:**
- He says `"...I just wanted someone to sit with me."`
- Fedora flies off (floating animation)
- `EWR_STATE.rastaCorp.sympathy++` (player may feel bad — this feeds the nihilistic ending)
- Trigger `_triggerFourthWallBreak(this, 'handtowel')` — wait, no, the handtowel already exists. This boss needs a NEW fourth wall break entry: key `'rastaCorpCeo'`
- Award `ALOE.rastaCorpBoss` (3500 aloe)
- Transition to `WorldMap4` after 16000ms

### Boss stats:
```javascript
var boss = {
  x: 700, y: 400,
  hp: 120, maxHp: 120,
  state: 'idle', stateT: 0,
  aiTimer: 2000,
  speed: 90,
  hitFlash: 0,
  dieT: -1,
  blocking: false,
  blockT: 0,
  enraged: false,
  hadBreakdown: false,
  memos: [],     // paper projectile objects
  enforcers: []  // spawned rasta mochi
};
```

### Arena:
- Single flat arena, width 1600px
- Background: corporate green (`0x001200`) with grid lines
- Two platforms flanking center
- Rasta Corp logo banner at top: `'RASTA CORP™'` in gold on dark green bar

### Boss visual (drawn procedurally):
- Cat in a suit: gray body, white collar, gold tie, small fedora on top
- Briefcase in one hand
- Sunglasses (this is very important — he's cool AND broken)
- When enraged: suit turns red, sunglasses crack

### Enemy mochis spawned during REBRAND:
- Use existing `type: 'rasta'` mochi type, drawn with existing `_drawMochi` function
- Spawn 3 at: x = [300, 600, 900]

---

## WHAT TO DELIVER

Write the complete `RastaCorpBossScene` as a JS scene that:

1. Uses the constructor pattern above
2. Has `create()`, `update(time, delta)`, `_killBoss()`, `_triggerDeath()`, `_hitBoss(dmg)`, `_hitEd(dmg)`, `_drawBoss(g, boss)`, `_drawMemo(g, memo)`
3. Integrates `_triggerFourthWallBreak` and `_mandelaFlash` (both are global functions)
4. Returns to `WorldMap4` after win
5. Resets to start on death (like other boss scenes)
6. Adds to `FOURTH_WALL_BOSS_MSGS` object: `rastaCorpCeo: ['...','i built this.','you took it apart.','...','good.','i think that was good.','...cig?']`

**Also deliver:**
- The addition to `FOURTH_WALL_BOSS_MSGS` (add `rastaCorpCeo` key)
- The entry for the scene array: `RastaCorpBossScene`
- The World 3 tile/map link: in `WorldMap3Scene._tryEnterW3`, add `'3-rcboss': 'RastaCorpBossScene'` to destMap
- A new tile `'B'` in `W3_TILES`: `'B':{type:'boss',passable:true,id:'3-rcboss',label:'RASTA CORP HQ'}`

---

## CODE STYLE REFERENCE (existing boss scene snippet)

```javascript
// From HandtowelScene — use this pattern
HandtowelScene.prototype._killBoss=function(){
  var self=this; this._beaten=true;
  var boss=this.boss;
  boss.dieT=0; boss.fedoraFly=true;
  spawnExplosion(boss.x,boss.y-40,0xffd700,3);
  SOUND.victory(); this.cameras.main.shake(400,0.025);
  this._flash('HANDTOWEL GOES DOWN!!!',2500,42,'#ffd700');
  if(EWR_STATE.levelsBeaten.indexOf('3-boss')<0){
    EWR_STATE.levelsBeaten.push('3-boss');
    EWR_STATE.aloe+=600;
    EWR_STATE.rastaCorp.bossesDefeated++;
  }
  _triggerFourthWallBreak(this,'handtowel');
  _mandelaFlash(this);
  this.time.delayedCall(16000,function(){
    EX_POOL.length=0; SMOKE_POOL.length=0; FIRE_POOL.length=0;
    self.scene.start('WorldMap4',{fromBoss:'handtowel'});
  });
};
```

---

## OUTPUT FORMAT

Write the complete scene as clean, copy-pasteable JavaScript. No markdown inside the JS. Include a comment at the top:

```javascript
// ════════════════════════════════════════════════════════════════
// RASTA CORP CEO BOSS FIGHT — Written by Codex
// ════════════════════════════════════════════════════════════════
```

This goes directly into `index.html` before the `var config = {` block.

---

*Good luck, Implementer. The CEO is waiting. He has dental.*
