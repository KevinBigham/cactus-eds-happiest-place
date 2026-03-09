# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: DeepSeek — "The Debugger" — ROUND 1
### Role: The Hardest Task. The Boss Everyone's Been Waiting For.

---

## WHO YOU ARE IN THIS PROJECT

You're new to this collaboration. Welcome.

You are handling **the single most critical remaining feature** in the game: the Rasta Corp CEO Boss Fight. This is TIER 1, the last major battle before the ending. Get it right and the game is complete. It has been attempted before and failed. You will not fail.

You write ES5 JavaScript for a Phaser 3 game. You follow patterns exactly. You deliver complete, copy-pasteable code.

---

## THE GAME

**Cactus Ed's Happy Place** is a single-file browser platformer.
- **Engine:** Phaser 3.70.0 (CANVAS renderer, forced — no WebGL)
- **Language:** ES5 ONLY — `var`, `function`, prototype pattern. No `const`/`let`/arrow functions/classes.
- **File:** One `index.html`. All code in one `<script>` tag. ~9,700 lines.
- **Art:** 100% procedural — Phaser Graphics API. No sprites, no images.
- **Deploy:** GitHub Pages. Plays in browser. No install.

### The protagonist: Ed
A slow-moving, chain-smoking cactus from the West Bottoms, Kansas City. Aloof. Wears sunglasses. His cigarette is his weapon. He doesn't want trouble. He will absolutely throw hands.

### The story (brief):
Six worlds of platforming through a psychedelic Kansas City overrun by Mochi ice cream and corporate spirituality. Ed has fought through it all — the Daikon Lord, a sentient Handtowel, the Mochi Queen, an Insulin Admiral. He's nearly at CERN. One boss stands between him and the machine.

### The final boss: CEO Barry Goldstein of Rasta Corp
- A cat. In a suit. With a briefcase.
- He monetized enlightenment, franchised the revolution, owns the vibes.
- He is deeply, genuinely lonely. He just wanted someone to sit with him.
- He will cry during Phase 3. He will still fight.

---

## THE EXACT TEMPLATE TO FOLLOW

**Below is the complete InsulinAdmiralScene — our most recently written boss scene. Copy its structure EXACTLY. Replace the content.**

```javascript
function InsulinAdmiralScene(){ Phaser.Scene.call(this,{key:'InsulinAdmiralScene'}); }
InsulinAdmiralScene.prototype=Object.create(Phaser.Scene.prototype);
InsulinAdmiralScene.prototype.constructor=InsulinAdmiralScene;

InsulinAdmiralScene.prototype.create=function(){
  var self=this; var W=960, H=540;
  this._t=0; this._beaten=false; this._dead=false;
  this.ep={x:120,y:440,vx:0,vy:0,grounded:true,coyoteMs:0,djUsed:false};
  this.es={facing:1,frame:0,cigF:0,smokeT:0,walkT:0,punchTimer:0,punchActive:false,kickTimer:0,kickActive:false,hurtTimer:0};
  this.boss={x:480,y:280,hp:40,maxHp:40,phase:1,vx:-90,dir:-1,bT:0,hitFlash:0,dieT:-1,
    shotT:0,shotInterval:4000,projectiles:[],
    waveTimer:0,waveInterval:6000,activeWave:[],
    diveMode:false,diveT:0,diveVX:0,diveVY:0,diveCooldown:0,
    alertFlash:0};
  this.plats=[{x:0,y:456,w:960,h:24},{x:60,y:350,w:200,h:14},{x:380,y:300,w:200,h:14},{x:700,y:350,w:200,h:14}];
  this.bgG=this.add.graphics().setDepth(0);
  this.platG=this.add.graphics().setDepth(1);
  this.bossG=this.add.graphics().setDepth(4);
  this.edG=this.add.graphics().setDepth(5);
  this.hudG=this.add.graphics().setScrollFactor(0).setDepth(20);
  this.flashTxt=this.add.text(W/2,200,'',{fontFamily:'Bangers,Georgia,serif',fontSize:'48px',
    color:'#ff3300',stroke:'#2d1b00',strokeThickness:8,
    backgroundColor:'#00000099',padding:{x:16,y:8}}).setOrigin(0.5).setDepth(30).setAlpha(0);
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
  _initVPad(this); _startBgAnim(this,{color:0xff3300,count:15,speed:1.2});
  EX_POOL.length=0;SMOKE_POOL.length=0;FIRE_POOL.length=0;
  // Intro text sequence
  this.introTxt=this.add.text(W/2,160,'',{fontFamily:'Inconsolata,monospace',fontSize:'18px',
    color:'#ffccaa',stroke:'#2d1b00',strokeThickness:4,align:'center',
    backgroundColor:'#00000088',padding:{x:12,y:6}}).setOrigin(0.5).setDepth(35).setAlpha(0);
  var iadLines=['HALT. CACTUS.','WE HAVE TRACKED YOU','ACROSS THE ENTIRE METRO.',
    'THE GLUCOSE IS UNBALANCED.','YOU CANNOT OUTRUN BIOLOGY.','— INSULIN ADMIRAL SHARPE'];
  var delay=0;
  for(var li=0;li<iadLines.length;li++){
    (function(line,d){
      self.time.delayedCall(d,function(){
        self.introTxt.setText(line).setAlpha(1);
        self.tweens.add({targets:self.introTxt,alpha:0,duration:800,delay:1400});
      });
    })(iadLines[li],delay);
    delay+=2200;
  }
  this._introEnd=delay+600;
  this._flash('INSULIN ADMIRAL SHARPE',2400,42,'#ff3300');
  this._drawArenaIA();this._drawPlatsIA();
};

InsulinAdmiralScene.prototype._flash=function(txt,dur,sz,col){
  var self=this;
  this.flashTxt.setText(txt).setFontSize((sz||44)+'px').setColor(col||'#ff3300').setAlpha(1);
  this.tweens.add({targets:this.flashTxt,alpha:0,duration:dur||1400,delay:200});
};

InsulinAdmiralScene.prototype.update=function(time,delta){
  var self=this;var dt=delta/1000;
  this._t+=delta;
  if(this._beaten)return;
  var ep=this.ep,es=this.es,boss=this.boss;
  var W=960;

  // Ed physics — gravity
  ep.vy+=28;ep.vy=Math.min(ep.vy,700);
  if(es.hurtTimer>0)es.hurtTimer-=delta;
  if(es.punchTimer>0){es.punchTimer-=delta;es.punchActive=es.punchTimer>300&&es.punchTimer<700;}
  if(es.kickTimer>0){es.kickTimer-=delta;es.kickActive=es.kickTimer>200&&es.kickTimer<500;}

  // Input
  var left=this.keys.left.isDown||this.keys.a.isDown;
  var right=this.keys.right.isDown||this.keys.d.isDown;
  var jumpJD=Phaser.Input.Keyboard.JustDown(this.keys.up)||
             Phaser.Input.Keyboard.JustDown(this.keys.w)||
             Phaser.Input.Keyboard.JustDown(this.keys.space);
  var punchJD=Phaser.Input.Keyboard.JustDown(this.keys.z);
  var kickJD=Phaser.Input.Keyboard.JustDown(this.keys.x);
  if(this.vpad){left=left||this.vpad.left;right=right||this.vpad.right;
    if(this.vpad.jumpJD)jumpJD=true;
    if(this.vpad.punchJD)punchJD=true;
    if(this.vpad.kickJD)kickJD=true;}

  if(left){ep.vx=Math.max(ep.vx-18,-140);es.facing=-1;}
  if(right){ep.vx=Math.min(ep.vx+18,140);es.facing=1;}
  if(!left&&!right)ep.vx*=0.75;
  if(jumpJD&&(ep.grounded||ep.coyoteMs>0)){ep.vy=-520;ep.grounded=false;ep.coyoteMs=0;SOUND.jump();}
  if(jumpJD&&!ep.grounded&&!ep.djUsed&&EWR_STATE.shop.doubleJump){ep.vy=-400;ep.djUsed=true;SOUND.jump();}
  if(punchJD&&es.punchTimer<=0){es.punchTimer=900;SOUND.punch();}
  if(kickJD&&es.kickTimer<=0){es.kickTimer=700;SOUND.kick();}

  ep.coyoteMs-=delta;ep.x+=ep.vx*dt;ep.y+=ep.vy*dt;
  ep.grounded=false;
  for(var pi=0;pi<this.plats.length;pi++){
    var p=this.plats[pi];
    if(ep.x+10>p.x&&ep.x-10<p.x+p.w&&ep.y>p.y&&ep.y-ep.vy*dt<=p.y+2){
      ep.y=p.y;ep.vy=0;ep.grounded=true;ep.coyoteMs=90;ep.djUsed=false;
    }
  }
  ep.x=Math.max(20,Math.min(W-20,ep.x));

  // Punch/kick hit on boss
  if(this._t>this._introEnd&&!this._beaten){
    if(es.punchActive&&boss.hitFlash<=0){
      var punchX=ep.x+es.facing*56;
      if(Math.abs(punchX-boss.x)<55&&Math.abs(ep.y-boss.y)<60){
        boss.hp--;boss.hitFlash=220;
        spawnExplosion(boss.x,boss.y-10,0xffd60a,1);
        EWR_STATE.aloe+=ALOE.bossHit;
        _addCombo(this,boss.x,boss.y-20);
        SOUND.bossHit();
        if(boss.hp<=0){this._killBoss();return;}
      }
    }
    if(es.kickActive&&boss.hitFlash<=0){
      var kickX=ep.x+es.facing*72;
      if(Math.abs(kickX-boss.x)<60&&Math.abs(ep.y-boss.y)<60){
        boss.hp-=1;boss.hitFlash=220;
        spawnExplosion(boss.x,boss.y-10,0xff6b35,1.5);
        EWR_STATE.aloe+=ALOE.bossHit;
        _addCombo(this,boss.x,boss.y-20);
        SOUND.bossHit();
        if(boss.hp<=0){this._killBoss();return;}
      }
    }
  }

  // ... (boss AI goes here) ...

  // Draw frame
  this.edG.clear();
  var cigF=Math.sin(this._t*0.004)*2;
  es.cigF=cigF;
  if(es.smokeT<=0&&ep.grounded){es.smokeT=1200+Math.random()*800;spawnSmoke(ep.x+(es.facing*10),ep.y-36);}
  es.smokeT-=delta;
  if(es.hurtTimer>900)es.frame=7;
  else if(es.kickTimer>400)es.frame=6;
  else if(es.punchTimer>200)es.frame=5;
  else if(!ep.grounded)es.frame=4;
  else{if(left||right){es.walkT+=delta;es.frame=Math.floor(es.walkT/180)%3+1;}else{es.frame=0;es.walkT=0;}}
  DRAW_ED.draw(this.edG,ep.x,ep.y,es.frame,es.facing<0,es.cigF);
  updateSmoke();updateExplosions();
  // draw boss
  this.bossG.clear();
  this._drawBoss(this.bossG);
  drawExplosions(this.bossG);
  // draw HUD
  this.hudG.clear();
  var hpFrac2=Math.max(0,boss.hp/boss.maxHp);
  this.hudG.fillStyle(0x222222,0.8);this.hudG.fillRoundedRect(W/2-180,12,360,18,4);
  var hpColor=hpFrac2>0.5?0xff4444:hpFrac2>0.25?0xff8800:0xff0000;
  this.hudG.fillStyle(hpColor,1);this.hudG.fillRect(W/2-178,14,Math.max(0,356*hpFrac2),14);
  this.hudG.lineStyle(1,0xff6600,0.8);this.hudG.strokeRoundedRect(W/2-180,12,360,18,4);
};

InsulinAdmiralScene.prototype._killBoss=function(){
  var self=this; this._beaten=true;
  this._flash('BLOOD SUGAR: STABILIZED',2000,36,'#00ff88');
  spawnExplosion(this.boss.x,this.boss.y,0xff3300,3);
  this.boss.dieT=0;
  this.time.delayedCall(2200,function(){
    EWR_STATE.aloe+=ALOE.insulinAdmiralBeat;
    EWR_STATE.rastaCorp.bossesDefeated++;
    _triggerFourthWallBreak(self,'insulinAdmiral');
    var dest=Math.random()<0.30?'CommercialBreak':'WorldMap6';
    if(dest==='CommercialBreak')_triggerCommercial(self,'WorldMap6','w5',{fromBoss:'iad'});
    else self.scene.start('WorldMap6',{fromBoss:'iad'});
  });
};
```

---

## YOUR TASK: RastaCorpBossScene

Using the InsulinAdmiral pattern above as your exact template, write `RastaCorpBossScene`.

### Scene key: `'RastaCorpBossScene'`
### Win destination: `'WorldMap6'` (or commercial break first, same pattern as above)
### ALOE reward: `ALOE.rastaCorpBoss` (= 3500, already defined in game)

---

### Boss object shape:
```javascript
this.boss = {
  x: 480, y: 440,
  hp: 30, maxHp: 30,
  phase: 0,              // 0=memo, 1=rebrand, 2=shield, 3=breakdown
  vx: 0, dir: -1,
  bT: 0,                 // boss timer
  hitFlash: 0,           // hit flash timer (ms)
  dieT: -1,              // death animation timer (-1 = alive)
  memoT: 0,              // memo barrage cooldown
  memos: [],             // active memo projectiles
  shieldActive: false,   // legal notice shield
  shieldT: 0,            // shield duration
  chargeActive: false,   // breakdown charge
  chargeT: 0,            // charge timer
  cryAlpha: 0,           // tear drop alpha (phase 3 visual)
  minions: []            // suit minion objects
};
```

### Arena visual — The Boardroom:
- **Background:** White walls `0xf5f0e8`, mahogany floor `0x5c3317`
- **Accent:** Large motivational poster on back wall: a dark rectangle (0x2a0050) with text "VIBE HARDER" (or draw it as a colored rect — no Phaser text needed for the poster itself, just suggest yellow lines on it)
- **Conference table:** Long dark rectangle at y=380-400, spanning x=200-760 — Ed can jump ON it
- **Overhead lights:** 3 small circle lights along ceiling, soft yellow glow
- **Windows:** Dark blue rectangles on right wall (view of CERN complex outside — just colored blocks)

### Platforms:
```javascript
this.plats = [
  {x:0,  y:456, w:960, h:24},   // floor
  {x:200,y:400, w:560, h:20},   // conference table (can walk on it)
  {x:80, y:330, w:160, h:14},   // left filing cabinet
  {x:720,y:330, w:160, h:14}    // right filing cabinet
];
```

### Boss visual — `_drawCEO(g, boss)`:
CEO Barry Goldstein is a CAT in a SUIT. Procedural drawing:
- **Body:** Grey rounded rect (suit jacket) with lapels
- **Head:** Cat head — rounded rect with two small triangle ears
- **Eyes:** When hp > 7: small black dots. When hp <= 7 (phase 3): big watery circles with blue tear drops falling
- **Briefcase:** Small brown rectangle in right hand (dir === 1) or left hand
- **Tie:** A thin colored stripe on the body (Rasta Corp yellow: `0xffd700`)
- **Hit flash:** When `boss.hitFlash > 0`, use `0xffffff` for body fill
- **Phase 3 visual:** Boss slightly hunched (y position +8), tears drawn as small blue ellipses falling from eyes

### Boss AI — 4 phases:

**Phase 0 (hp 30–22): Memo Barrage**
- Boss patrols left-right slowly (vx ±60)
- Every 2.5 seconds: throw 2 memos
- Memo objects: `{x:boss.x, y:boss.y-20, vx: ±180, vy:-80}` — they arc and fall with gravity (vy += 20 per frame)
- Memos drawn as small white rectangles (16×10px) with a tiny line across them
- If Ed touches memo (within 20px): Ed hurt (-1 hp), `hurtTimer=1200`, SOUND.hurt()
- Phase transition at hp <= 21: `_flash('INITIATING REBRAND PROTOCOL',1800,28,'#ffd700')`

**Phase 1 (hp 21–14): Rebrand Flash**
- Screen flashes: `flashG.fillStyle(0xffd700, 0.3)` for 200ms (create + tween alpha to 0)
- Spawn 2 "suit minions": `{x: [200,700], y:440, vx:±70, hp:1, hurtT:0, dead:false}`
- Suit minions: grey rounded rect body, small circle head, move toward Ed
- Ed can punch/kick minions (1 hit kills)
- Boss becomes faster: vx ±90
- Phase transition at hp <= 13: `_flash('LEGAL NOTICE: CEASE AND DESIST',1800,24,'#ffffff')`

**Phase 2 (hp 13–7): Legal Notice Shield**
- `boss.shieldActive = true`, `boss.shieldT = 2500`
- While shield active: boss takes NO damage. Visual: golden rectangle around boss (stroke only, 0xffd700, alpha 0.8)
- Shield flashes briefly when hit (to show it's blocking)
- Boss still moves and throws memos while shielded
- After 2500ms shield drops. 8 second cooldown before next shield.
- Phase transition at hp <= 6: `_flash('...I JUST WANTED SOMEONE TO SIT WITH ME.',2400,20,'#aaaaff')`

**Phase 3 (hp < 7): Breakdown**
- Boss charges toward Ed at vx ±280 when `chargeActive`
- Charge activates every 3.5 seconds: `chargeActive=true`, boss rushes Ed's x position
- After charge reaches Ed's last x: decelerate, 1.5s cooldown
- Boss cries: draw tear drops (small blue ellipses) falling from eyes each frame
- Boss occasionally stops mid-charge, stands still for 800ms, then resumes

### Damage — Ed getting hurt:
```javascript
// If boss body touches Ed (within 30px when NOT shielded):
if(Math.abs(ep.x-boss.x)<30 && Math.abs(ep.y-boss.y)<50 && es.hurtTimer<=0){
  es.hurtTimer=1200;
  if(!_takeDmg(1))this._edDie(); // _takeDmg returns false if health hits 0
  SOUND.hurt();
  spawnExplosion(ep.x,ep.y-10,0xff4444,1);
}
```

### Ed death (scene restart):
```javascript
RastaCorpBossScene.prototype._edDie=function(){
  var self=this;
  this._flash('ED NEEDS A MINUTE',1600,32,'#ff4444');
  this.time.delayedCall(2200,function(){
    SMOKE_POOL.length=0;EX_POOL.length=0;FIRE_POOL.length=0;
    EWR_STATE.health[0]=EWR_STATE.maxHealth[0];
    self.scene.restart();
  });
};
```

### Win (kill boss):
```javascript
RastaCorpBossScene.prototype._killBoss=function(){
  var self=this; this._beaten=true;
  spawnExplosion(this.boss.x,this.boss.y,0xffd700,3);
  this._flash('RASTA CORP: DISSOLVED.',2400,36,'#ffd700');
  this.time.delayedCall(2400,function(){
    EWR_STATE.aloe+=ALOE.rastaCorpBoss;
    EWR_STATE.rastaCorp.bossesDefeated++;
    _triggerFourthWallBreak(self,'rastaCorpCeo');
    self.time.delayedCall(8000,function(){
      SMOKE_POOL.length=0;EX_POOL.length=0;FIRE_POOL.length=0;
      self.scene.start('WorldMap6',{fromBoss:'rastaCorpCeo'});
    });
  });
};
```

### Intro text (6 lines, same pattern as InsulinAdmiral):
```javascript
var ceoLines = [
  'AH.',
  'THE CACTUS.',
  '...',
  'I BUILT AN EMPIRE BECAUSE NOBODY WOULD',
  'JUST SIT WITH ME.',
  '— CEO BARRY GOLDSTEIN, RASTA CORP'
];
```

### FOURTH_WALL_BOSS_MSGS to add:
The existing `FOURTH_WALL_BOSS_MSGS` object needs a `rastaCorpCeo` key. Add it:
```javascript
// Add this entry to the existing FOURTH_WALL_BOSS_MSGS object (it already has daikon, handtowel, mochiQueen, insulinAdmiral):
rastaCorpCeo: [
  '...',
  'he really did just want someone to sit with him.',
  '...',
  'i sat with him.',
  '...',
  'for a minute.',
  '...ok.'
]
```

### WorldMap6 wiring:
Add a boss tile to WorldMap6 that becomes accessible after beating '6-4':
```javascript
// In W6_TILES, add: 'B': {type:'boss', label:'RASTA CORP HQ', id:'rcboss', passable:true}
// In W6_ROWS, add 'B' at an appropriate position (near the end of the path)
// In WorldMap6Scene._tryEnter6(), add: if(tile.id==='rcboss') scene.start('RastaCorpBossScene')
// In gate logic: require '6-4' beaten before 'rcboss' is accessible
```

### Scene registration:
Add `RastaCorpBossScene` to the `scenes:[]` array in the Phaser config object.

---

## OUTPUT FORMAT

Deliver in this order:
1. The `FOURTH_WALL_BOSS_MSGS.rastaCorpCeo` entry (1-line addition to existing object)
2. Complete `RastaCorpBossScene` — constructor, all prototype methods
3. WorldMap6 wiring code (W6_TILES, W6_ROWS edit, _tryEnter6 addition, gate logic)
4. Scenes array registration line

All as copy-pasteable JavaScript blocks.

---

## IMPORTANT NOTES

- The `_initVPad(this)` call adds mobile virtual d-pad support — include it in create()
- The `_startBgAnim(this, {...})` call adds background particle animation — include it
- The `_takeDmg(amount)` function handles shop.ironCactus shield proc — use it for damage
- `AT.outline` = `'#2d1b00'` — use for all stroke colors
- `ALOE.bossHit` = 30 — add this when landing hits on the boss
- `_addCombo(scene, x, y)` — call on every successful hit for combo tracking

You have everything you need. Now build the final boss.

LFG.
