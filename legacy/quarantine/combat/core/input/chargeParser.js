(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.input = ns.core.input || {};

  function isBack(dir){ return dir === 1 || dir === 4 || dir === 7; }
  function isDown(dir){ return dir === 1 || dir === 2 || dir === 3; }
  function isForward(dir){ return dir === 3 || dir === 6 || dir === 9; }
  function isUp(dir){ return dir === 7 || dir === 8 || dir === 9; }

  function createChargeState(){
    return { back: 0, down: 0, backReady: 0, downReady: 0 };
  }

  function updateChargeState(chargeState, input, cfg){
    var st = chargeState || createChargeState();
    var i = input || { dir: 5 };
    var c = cfg || { backFrames: 45, downFrames: 40, releaseWindowFrames: 8 };

    if (isBack(i.dir)) {
      st.back += 1;
    } else {
      if (st.back >= c.backFrames) {
        st.backReady = Math.max(st.backReady, c.releaseWindowFrames);
      }
      st.back = 0;
    }

    if (isDown(i.dir)) {
      st.down += 1;
    } else {
      if (st.down >= c.downFrames) {
        st.downReady = Math.max(st.downReady, c.releaseWindowFrames);
      }
      st.down = 0;
    }

    if (st.backReady > 0) st.backReady -= 1;
    if (st.downReady > 0) st.downReady -= 1;

    return st;
  }

  function canDoChargeMove(chargeState, moveDef, input, cfg){
    if (!moveDef || !moveDef.charge) return false;

    var st = chargeState || createChargeState();
    var i = input || { dir: 5 };
    var c = cfg || { backFrames: 45, downFrames: 40 };
    var req = moveDef.charge || {};

    if (req.hold === 'back') {
      if (st.backReady <= 0 && st.back < c.backFrames) return false;
      return isForward(i.dir) || st.backReady > 0;
    }

    if (req.hold === 'down') {
      if (st.downReady <= 0 && st.down < c.downFrames) return false;
      return isUp(i.dir) || st.downReady > 0;
    }

    return false;
  }

  function resolveCfg(world){
    var cfg = null;
    if (world && world.cfg && world.cfg.charge) cfg = world.cfg.charge;
    if (!cfg && typeof global._fightConfigFor === 'function') {
      var wcfg = global._fightConfigFor(world);
      if (wcfg && wcfg.charge) cfg = wcfg.charge;
    }
    cfg = cfg || {};
    return {
      backFrames: Math.max(1, Math.floor(cfg.backFrames || 45)),
      downFrames: Math.max(1, Math.floor(cfg.downFrames || 40)),
      releaseWindowFrames: Math.max(0, Math.floor(cfg.releaseWindowFrames || 8))
    };
  }

  function updateChargeForLegacy(world, fighter, input){
    if (!fighter) return;
    var cfg = resolveCfg(world);
    fighter.charge = updateChargeState(fighter.charge || createChargeState(), input || { dir: 5 }, cfg);
  }

  function canDoChargeMoveForLegacy(world, fighter, moveDef, input){
    if (!fighter) return false;
    var cfg = resolveCfg(world);
    return canDoChargeMove(fighter.charge || createChargeState(), moveDef, input || { dir: 5 }, cfg);
  }

  ns.core.input.chargeParser = {
    isBack: isBack,
    isDown: isDown,
    isForward: isForward,
    isUp: isUp,
    createChargeState: createChargeState,
    updateChargeState: updateChargeState,
    canDoChargeMove: canDoChargeMove,
    resolveCfg: resolveCfg,
    updateChargeForLegacy: updateChargeForLegacy,
    canDoChargeMoveForLegacy: canDoChargeMoveForLegacy
  };
})(typeof window !== 'undefined' ? window : this);
