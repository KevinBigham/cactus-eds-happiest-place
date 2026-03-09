(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.adapters = ns.adapters || {};
  ns.adapters.phaser = ns.adapters.phaser || {};

  function createFightShellAdapter(opts) {
    var options = opts || {};
    var legacy = options.engine || global.__FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE;
    if (legacy && legacy.__isAdapter && legacy.__legacy) {
      legacy = legacy.__legacy;
    }

    var combatEngineFactory = ns.api && ns.api.CombatEngine;
    var engine = options.engineApi || (combatEngineFactory && combatEngineFactory.create ? combatEngineFactory.create({ legacyEngine: legacy }) : legacy);

    if (!engine) {
      throw new Error('phaser adapter init failed: no combat engine available');
    }

    return {
      __isAdapter: true,
      __legacy: legacy,
      __engine: engine,
      __source: 'cehp-phaser-adapter-pass7',

      createWorld: function(seed, config) { return engine.createWorld(seed, config || {}); },
      step: function(world, frameInputs) { return engine.step(world, frameInputs); },
      snapshot: function(world) { return engine.snapshot(world); },
      restore: function(world, snap) { return engine.restore(world, snap); },
      stateHash: function(world) { return engine.stateHash(world); },
      serialize: function(world) { return engine.serialize(world); },
      runInputLog: function(world, log, maxFrames, optsIn) { return engine.runInputLog(world, log, maxFrames, optsIn || {}); },

      buildDirection: function(rawInput, facing, socdConfig) {
        if (typeof engine.buildDirection === 'function') return engine.buildDirection(rawInput, facing, socdConfig);
        return 5;
      },
      buildInput: function(rawInput, ctx) {
        if (typeof engine.buildInput === 'function') return engine.buildInput(rawInput, ctx || {});
        return { dir: 5, buttons: 0 };
      },
      normalizeFrameInput: function(rawFrameInput, ctx) {
        if (typeof engine.normalizeFrameInput === 'function') return engine.normalizeFrameInput(rawFrameInput, ctx || {});
        return rawFrameInput || { p1: { dir: 5, buttons: 0 }, p2: { dir: 5, buttons: 0 } };
      },
      parseMotion: function(history, moveDef, nowFrame) {
        if (typeof engine.parseMotion === 'function') return engine.parseMotion(history, moveDef, nowFrame);
        return false;
      },

      debug: engine.debug || {}
    };
  }

  ns.adapters.phaser.createFightShellAdapter = createFightShellAdapter;
})(typeof window !== 'undefined' ? window : this);
