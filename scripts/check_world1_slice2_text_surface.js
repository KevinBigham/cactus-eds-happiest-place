#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var files = [
  {
    filePath: path.join(__dirname, '..', 'src', 'world1', 'text', 'world1_map_labels.js'),
    tokens: ['CEHP_WORLD1_TEXT','W1_ROWS','W1_TILES','Ed Wakes Up','The Cat Rave','Daikon District','Hippie Bus Highway',"Daikon's Heartbreak",'THE VOID','portal-W2']
  },
  {
    filePath: path.join(__dirname, '..', 'src', 'world1', 'text', 'world1_broadcast_copy.js'),
    tokens: ['CEHP_WORLD1_TEXT','NEWS_TICKER','WS_TEXTS','ANOMALY_MSGS','WP_KOANS','CONSUME','ARE YOU REAL?','MANDELA SAYS HI.']
  },
  {
    filePath: path.join(__dirname, '..', 'src', 'world1', 'text', 'world1_receipt_templates.js'),
    tokens: ['CEHP_WORLD1_TEXT','COMMERCIALS','RASTA_BOSS_TRAUMA','aloe_max','rasta_corp','void_realty','I MONETIZED PEACE']
  },
  {
    filePath: path.join(__dirname, '..', 'src', 'world1', 'text', 'world1_overlay_labels.js'),
    tokens: ['CEHP_WORLD1_TEXT','WS_CAT_SPEECH','WS_KID_QUOTES','BEAT_CAT_LINES','CAT_ARCHETYPES','anxious','nihilistic','spiritual','street-smart','optimistic','chaotic']
  }
];

var fail = false;
files.forEach(function(f) {
  var src;
  try { src = fs.readFileSync(f.filePath, 'utf8'); } catch(e) {
    console.error('missing-file:', f.filePath);
    fail = true;
    return;
  }
  f.tokens.forEach(function(tok) {
    if (src.indexOf(tok) === -1) {
      console.error('missing-token:', tok, 'in', f.filePath);
      fail = true;
    }
  });
});

if (fail) {
  process.exitCode = 1;
} else {
  console.log('ok: world1 slice2 text surface tokens present in all 4 files');
}
