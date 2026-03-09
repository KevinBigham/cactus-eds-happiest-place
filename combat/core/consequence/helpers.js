(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.consequence = ns.core.consequence || {};

  function configFor(world){
    if (world && world.cfg) return world.cfg;
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function strengthFromMove(move){
    var hs = (move && move.hitstop) ? move.hitstop : 'light';
    if (hs === 'heavy') return 'heavy';
    if (hs === 'medium') return 'medium';
    return 'light';
  }

  function targetCombosEnabled(world){
    var cfg = configFor(world);
    var tcfg = (cfg && cfg.targetCombos) || {};
    if (
      (typeof global._fightSfModeOn === 'function' && global._fightSfModeOn()) ||
      (world && world.sf && world.sf.enabled)
    ) return false;
    if (!(world && world.mkGba && world.mkGba.enabled && global.FEATURE_FLAGS && global.FEATURE_FLAGS.fightMkGbaTargetCombos)) {
      return false;
    }
    return tcfg.enabled !== false;
  }

  function sfAttackPreset(world, strength){
    var cfg = configFor(world);
    var levels = (cfg && cfg.attackLevels) || {
      light: { hitstop: 6, hitstun: 13, blockstun: 8 },
      medium: { hitstop: 8, hitstun: 16, blockstun: 10 },
      heavy: { hitstop: 12, hitstun: 20, blockstun: 12 }
    };
    if (strength === 'heavy') return levels.heavy || levels.medium || levels.light;
    if (strength === 'medium') return levels.medium || levels.light;
    return levels.light || { hitstop: 6, hitstun: 13, blockstun: 8 };
  }

  function mkAirHitsKey(fid){
    return fid === 'p1' ? 'p1AirHitsTaken' : 'p2AirHitsTaken';
  }

  function mkCombosFor(rosterKey){
    var table = (global.BALANCE && global.BALANCE.fight && global.BALANCE.fight.mkGbaTargetCombos) || {};
    var arr = table[rosterKey] || [];
    return arr;
  }

  function mkDialState(world, fighter){
    if (!world || !world.mkGba || !world.mkGba.comboDial || !fighter) return null;
    return world.mkGba.comboDial[fighter.id] || null;
  }

  function mkResetDial(dial){
    if (!dial) return;
    dial.chainId = '';
    dial.step = 0;
    dial.window = 0;
  }

  function l15WarnThreshold(world){
    var cfg = configFor(world);
    var stunCfg = (cfg && cfg.stun) || { threshold: 100 };
    var warnPct = (cfg && cfg.juice && cfg.juice.warnStunPct) || 0.82;
    return Math.floor((stunCfg.threshold || 100) * warnPct);
  }

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function toPx(v){
    return v / global.FIGHT_FP;
  }

  function fromPx(v){
    return Math.round(v * global.FIGHT_FP);
  }

  function abs(v){
    return v < 0 ? -v : v;
  }

  function rosterMoveById(rosterKey, moveId){
    var r = global.FIGHT_ROSTER ? global.FIGHT_ROSTER[rosterKey] : null;
    var i;
    if (!r) return null;
    for (i = 0; i < r.moves.length; i++) {
      if (r.moves[i].id === moveId) return r.moves[i];
    }
    return null;
  }

  ns.core.consequence.helpers = {
    configFor: configFor,
    strengthFromMove: strengthFromMove,
    sfAttackPreset: sfAttackPreset,
    targetCombosEnabled: targetCombosEnabled,
    mkCombosFor: mkCombosFor,
    mkDialState: mkDialState,
    mkResetDial: mkResetDial,
    mkAirHitsKey: mkAirHitsKey,
    l15WarnThreshold: l15WarnThreshold,
    fromPx: fromPx,
    toPx: toPx,
    abs: abs,
    clamp: clamp,
    rosterMoveById: rosterMoveById
  };
})(typeof window !== 'undefined' ? window : this);
