#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var filePath = path.join(__dirname, '..', 'src', 'world1', 'constants', 'runtime_surface.js');
var src;
try {
  src = fs.readFileSync(filePath, 'utf8');
} catch (e) {
  console.error('Could not read file:', filePath, e.message);
  process.exit(1);
}

function mustContain(token) {
  if (!src.includes(token)) {
    console.error('missing-token:', token);
    process.exitCode = 1;
  }
}

[
  'CEHP_WORLD1_RUNTIME_SURFACE',
  'GFX_BASELINE_SHOT_NAMES',
  'SCENE_KEYS',
  'BEAT_KEYS',
  'ALERT_COLORS',
  'SFX_KEYS',
  'SAVE_KEYS',
  "w11:'1-1'",
  "w15:'1-5'",
  "rasta:'rasta-boss'"
].forEach(mustContain);

if (!process.exitCode) {
  console.log('ok: world1 slice1 runtime surface keys present');
}
