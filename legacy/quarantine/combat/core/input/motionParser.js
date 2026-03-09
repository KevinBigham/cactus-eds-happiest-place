(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.input = ns.core.input || {};

  function dirMatch(actual, target, leniency){
    if (actual === target) return true;
    if (!leniency) return false;

    if (leniency.diagonalShortcut) {
      if (target === 3 && (actual === 2 || actual === 6)) return true;
      if (target === 1 && (actual === 2 || actual === 4)) return true;
      if (target === 9 && (actual === 8 || actual === 6)) return true;
      if (target === 7 && (actual === 8 || actual === 4)) return true;
    }

    return false;
  }

  function parseMotion(history, motion, windowFrames, leniency){
    if (!history || !history.length || !motion || !motion.length) return false;

    var windowN = Math.max(1, windowFrames || 12);
    var start = Math.max(0, history.length - windowN);
    var idx = motion.length - 1;
    var i;

    for (i = history.length - 1; i >= start; i--) {
      if (dirMatch(history[i].dir, motion[idx], leniency)) {
        idx -= 1;
        if (idx < 0) return true;
      }
    }

    return false;
  }

  function parseWithShortcuts(history, moveDef, cfg){
    var mCfg = cfg || {};
    var leniency = mCfg.leniency || {};
    var windowFrames = (moveDef && moveDef.motionWindowFrames) || mCfg.motionWindowFrames || 12;

    if (!moveDef || !moveDef.motion || !moveDef.motion.length) return false;

    if (parseMotion(history, moveDef.motion, windowFrames, leniency)) {
      return true;
    }

    if (
      leniency.tolerateMissingDownForward &&
      moveDef.motion.length === 3 &&
      moveDef.motion[0] === 2 &&
      moveDef.motion[2] === 6
    ) {
      return parseMotion(history, [2, 6], windowFrames, leniency);
    }

    return false;
  }

  function parseMotionLegacy(history, motion, windowFrames, leniency){
    var h = history || [];
    var m = motion || [];
    var w = (windowFrames === undefined || windowFrames === null) ? 12 : windowFrames;
    return parseMotion(h, m, w, leniency || {});
  }

  function parseMoveFromWorld(history, moveDef, worldCfg){
    return parseWithShortcuts(history || [], moveDef || null, worldCfg || {});
  }

  ns.core.input.motionParser = {
    dirMatch: dirMatch,
    parseMotion: parseMotion,
    parseWithShortcuts: parseWithShortcuts,
    parseMotionLegacy: parseMotionLegacy,
    parseMoveFromWorld: parseMoveFromWorld
  };
})(typeof window !== 'undefined' ? window : this);
