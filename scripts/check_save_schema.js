#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var htmlPath = path.join(__dirname, '..', 'index.html');
var src = fs.readFileSync(htmlPath, 'utf8');
var start = src.indexOf('// ── SAVE SYSTEM');
var end = src.indexOf('var ED_MOVE =');

if (start < 0 || end < 0 || end <= start) {
  console.error('Could not find save-system section boundaries in index.html');
  process.exit(1);
}

var saveJs = src.slice(start, end);
var store = {};
var localStorage = {
  getItem: function(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem: function(k,v){ store[k] = String(v); },
  removeItem: function(k){ delete store[k]; }
};

var sandbox = {
  console: console,
  Math: Math,
  Date: Date,
  JSON: JSON,
  isFinite: isFinite,
  ED_MOVE: { walkSpeed: 140 },
  localStorage: localStorage,
  window: { addEventListener: function(){} },
  document: { hidden: false, addEventListener: function(){} },
  setInterval: function(){ return 1; }
};

vm.createContext(sandbox);
vm.runInContext(saveJs, sandbox);

try {
  assert.strictEqual(sandbox.SAVE_SCHEMA_VERSION, 2, 'SAVE_SCHEMA_VERSION should be 2');
  assert.strictEqual(typeof sandbox._migrateSaveState, 'function', '_migrateSaveState should exist');
  assert.strictEqual(typeof sandbox._saveProgress, 'function', '_saveProgress should exist');
  assert.strictEqual(typeof sandbox._loadProgress, 'function', '_loadProgress should exist');

  var migrated = sandbox._migrateSaveState({
    _schemaVersion: 1,
    aloe: 888,
    levelsBeaten: ['3-1', '3-boss'],
    shop: { speedBoost: true },
    rastaCorp: { sympathy: 3 }
  });

  assert.strictEqual(migrated._schemaVersion, 2, 'migrated schema version should be 2');
  assert.strictEqual(migrated.aloe, 888, 'aloe should persist through migration');
  assert.ok(Array.isArray(migrated.levelsBeaten), 'levelsBeaten should remain an array');
  assert.strictEqual(migrated.shop.speedBoost, true, 'shop upgrades should persist through migration');
  assert.ok(migrated.playerPosW3 && typeof migrated.playerPosW3.x === 'number', 'playerPosW3 should exist after migration');

  sandbox._applyLoadedState(migrated);
  assert.strictEqual(sandbox.EWR_STATE._schemaVersion, 2, 'applied state should be schema version 2');

  var saved = sandbox._saveProgress();
  assert.strictEqual(saved, true, 'save should succeed');
  assert.ok(store[sandbox.SAVE_STORAGE_KEY], 'save payload should be written to storage');

  sandbox.EWR_STATE.aloe = 1;
  var loaded = sandbox._loadProgress();
  assert.strictEqual(loaded, true, 'load should succeed');
  assert.strictEqual(sandbox.EWR_STATE.aloe, 888, 'load should restore aloe value');
} catch (err) {
  console.error('Save schema checks failed: ' + err.message);
  process.exit(1);
}

console.log('Save schema checks passed.');
