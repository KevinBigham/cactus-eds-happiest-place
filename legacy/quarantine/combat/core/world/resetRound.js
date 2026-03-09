(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function resetHelper(){
    return (ns.core && ns.core.world && ns.core.world.createFighter) || null;
  }

  function lifecycle(){
    return (ns.core && ns.core.world && ns.core.world.lifecycle) || null;
  }

  function cfgFor(world){
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    return (world && world.cfg) || (global.BALANCE && global.BALANCE.fight) || {};
  }

  function resetL15Round(world){
    if (!world || !world.l15Stats) return;
    var lc = lifecycle();
    if (lc && typeof lc.resetL15Round === 'function') {
      lc.resetL15Round(world);
      return;
    }
    if (typeof global._fightResetL15Round === 'function') {
      global._fightResetL15Round(world);
      return;
    }
    if (!world.l15Stats.round) return;
    var r = world.l15Stats.round;
    var k, side;
    for (k in r) {
      if (!Object.prototype.hasOwnProperty.call(r, k)) continue;
      if (r[k] && typeof r[k] === 'object') {
        for (side in r[k]) {
          if (Object.prototype.hasOwnProperty.call(r[k], side) && typeof r[k][side] === 'number') {
            r[k][side] = 0;
          }
        }
      }
    }
    if (world.l15Stats.flags) {
      world.l15Stats.flags.dizzyWarned = { p1: false, p2: false };
      world.l15Stats.flags.cornerToastUntilFrame = 0;
    }
  }

  function resetFighterRound(fighter, spawnXPx, facing){
    var h = resetHelper();
    if (!h || typeof h.resetFighterRound !== 'function') {
      throw new Error('combat.resetRound: createFighter.resetFighterRound unavailable');
    }
    return h.resetFighterRound(fighter, spawnXPx, facing);
  }

  function resetRound(world){
    if (!world || !world.fighters) return world;
    var cfg = cfgFor(world);

    resetFighterRound(world.fighters.p1, 220, 1);
    resetFighterRound(world.fighters.p2, 740, -1);
    resetL15Round(world);

    world.interaction = world.interaction || {};
    world.interaction.hitstop = 0;
    world.winner = '';

    if (world.mkGba && world.mkGba.enabled) {
      world.mkGba.roundTimerFrames = Math.max(30, Math.floor(((cfg && cfg.ui && cfg.ui.roundTimerSeconds) || 99))) * 60;
      world.mkGba.timerWarned = { s15: false, s10: false, s5: false };
      world.mkGba.vfx = world.mkGba.vfx || {};
      world.mkGba.vfx.heavyFlashFrames = 0;
      world.mkGba.vfx.koInvertFrames = 0;

      world.mkGba.comboDial = world.mkGba.comboDial || {
        p1: { chainId: '', step: 0, window: 0 },
        p2: { chainId: '', step: 0, window: 0 }
      };

      if (typeof global._fightMkResetDial === 'function') {
        global._fightMkResetDial(world.mkGba.comboDial.p1);
        global._fightMkResetDial(world.mkGba.comboDial.p2);
      } else {
        world.mkGba.comboDial.p1 = { chainId: '', step: 0, window: 0 };
        world.mkGba.comboDial.p2 = { chainId: '', step: 0, window: 0 };
      }

      world.mkGba.juggle = world.mkGba.juggle || {};
      world.mkGba.juggle.p1AirHitsTaken = 0;
      world.mkGba.juggle.p2AirHitsTaken = 0;

      var lc = lifecycle();
      if (lc && typeof lc.setCallout === 'function') {
        lc.setCallout(world, 'ENGAGE');
      } else if (typeof global._fightMkSetCallout === 'function') {
        global._fightMkSetCallout(world, 'ENGAGE');
      }
    }

    return world;
  }

  ns.core.world.resetRound = {
    resetFighterRound: resetFighterRound,
    resetRound: resetRound
  };
})(typeof window !== 'undefined' ? window : this);
