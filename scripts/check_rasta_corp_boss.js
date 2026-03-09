#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var htmlPath = path.join(__dirname, '..', 'index.html');
var src = fs.readFileSync(htmlPath, 'utf8');

var checks = [
  { re: /function RastaCorpBossScene\(\)\{ Phaser\.Scene\.call\(this,\{key:'RastaCorpBossScene'\}\); \}/, msg: 'scene constructor missing' },
  { re: /RastaCorpBossScene\.prototype\._killBoss=function\(\)/, msg: '_killBoss missing' },
  { re: /RastaCorpBossScene\.prototype\._triggerDeath=function\(\)/, msg: '_triggerDeath missing' },
  { re: /RastaCorpBossScene\.prototype\._hitBoss=function\(dmg\)/, msg: '_hitBoss missing' },
  { re: /RastaCorpBossScene\.prototype\._hitEd=function\(dmg\)/, msg: '_hitEd missing' },
  { re: /RastaCorpBossScene\.prototype\._drawBoss=function\(g,boss\)/, msg: '_drawBoss missing' },
  { re: /RastaCorpBossScene\.prototype\._drawMemo=function\(g,memo\)/, msg: '_drawMemo missing' },
  { re: /_triggerFourthWallBreak\(this,'rastaCorpCeo'\)/, msg: 'fourth-wall break key not wired' },
  { re: /_mandelaFlash\(this\)/, msg: 'mandela flash not wired in scene' },
  { re: /'B':\{type:'boss'\s*,\s*passable:true\s*,\s*id:'3-rcboss'\s*,\s*label:'RASTA CORP HQ'\}/, msg: 'W3 tile B for 3-rcboss missing' },
  { re: /'3-rcboss':'RastaCorpBossScene'/, msg: 'WorldMap3 destination mapping missing' },
  { re: /rastaCorpCeo:\['\.\.\.','i built this\.','you took it apart\.','\.\.\.','good\.','i think that was good\.','\.\.\.cig\?'\]/, msg: 'FOURTH_WALL_BOSS_MSGS.rastaCorpCeo missing' },
  { re: /HandtowelScene,\s*RastaCorpBossScene,\s*WorldMap4Scene/, msg: 'scene array entry missing for RastaCorpBossScene' }
];

var failed = [];
for (var i = 0; i < checks.length; i++) {
  if (!checks[i].re.test(src)) failed.push(checks[i].msg);
}

if (failed.length) {
  console.error('Rasta Corp boss integration checks failed:');
  for (var j = 0; j < failed.length; j++) console.error(' - ' + failed[j]);
  process.exit(1);
}

console.log('Rasta Corp boss integration checks passed.');
