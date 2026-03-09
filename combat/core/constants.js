(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};

  function fp(){
    var v = Number(global.FIGHT_FP || 256);
    return (isFinite(v) && v > 0) ? v : 256;
  }

  function fromPx(v){
    return Math.round(Number(v || 0) * fp());
  }

  function toPx(v){
    return Number(v || 0) / fp();
  }

  function clone(obj){
    if (obj === null || obj === undefined) return obj;
    if (typeof global._fightClone === 'function') return global._fightClone(obj);
    return JSON.parse(JSON.stringify(obj));
  }

  function neutralInput(){
    if (typeof global._fightNeutralInput === 'function') return global._fightNeutralInput();
    return { dir: 5, buttons: 0 };
  }

  function neutralFrameInput(){
    if (typeof global._fightNeutralFrameInput === 'function') return global._fightNeutralFrameInput();
    return { p1: neutralInput(), p2: neutralInput() };
  }

  function states(){
    return global.FIGHT_STATES || {
      IDLE:'idle', WALK:'walk', CROUCH:'crouch', JUMP:'jump',
      STARTUP:'startup', ACTIVE:'active', RECOVERY:'recovery',
      HITSTUN:'hitstun', BLOCKSTUN:'blockstun', KNOCKDOWN:'knockdown', WAKEUP:'wakeup',
      THROW:'throw', DIZZY:'dizzy'
    };
  }

  function phases(){
    return global.FIGHT_PHASES || {
      INTRO:'INTRO', ROUND_ANNOUNCE:'ROUND_ANNOUNCE', FIGHT_START:'FIGHT_START',
      FIGHT:'FIGHT', KO:'KO', WIN:'WIN', LOSE:'LOSE'
    };
  }

  function buttons(){
    return global.FIGHT_BTN || { PUNCH: 1, KICK: 2, THROW: 4 };
  }

  ns.core.constants = {
    fp: fp,
    fromPx: fromPx,
    toPx: toPx,
    clone: clone,
    neutralInput: neutralInput,
    neutralFrameInput: neutralFrameInput,
    states: states,
    phases: phases,
    buttons: buttons
  };
})(typeof window !== 'undefined' ? window : this);
