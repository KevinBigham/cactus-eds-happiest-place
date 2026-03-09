(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT || {};
ns.version = 'extract-pass22';
  ns.api = ns.api || {};
  ns.core = ns.core || {};
  ns.core.constants = ns.core.constants || {};
  ns.core.consequence = ns.core.consequence || {};
  ns.core.world = ns.core.world || {};
  ns.core.world.lifecycle = ns.core.world.lifecycle || {};
  ns.core.spatial = ns.core.spatial || {};
  ns.core.fighter = ns.core.fighter || {};
  ns.core.move = ns.core.move || {};
  ns.core.strike = ns.core.strike || {};
  ns.core.exchange = ns.core.exchange || {};
  ns.core.throw = ns.core.throw || {};
  ns.core.hitstop = ns.core.hitstop || {};
  ns.core.input = ns.core.input || {};
  ns.core.sim = ns.core.sim || {};
  ns.adapters = ns.adapters || {};
  ns.adapters.phaser = ns.adapters.phaser || {};
  ns.tools = ns.tools || {};
  ns.tools.determinism = ns.tools.determinism || {};
  ns.data = ns.data || {};
  ns.data.fighters = ns.data.fighters || {};
  ns.data.stages = ns.data.stages || {};
  ns.presentation = ns.presentation || {};

  ns.createEngine = function createEngine(opts){
    if(!ns.api || !ns.api.CombatEngine || !ns.api.CombatEngine.create){
      return null;
    }
    return ns.api.CombatEngine.create(opts || {});
  };

  global.CEHP_COMBAT = ns;
})(typeof window !== 'undefined' ? window : this);
