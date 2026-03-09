(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.input = ns.core.input || {};

  function clampLimit(limit){
    var n = Math.floor(Number(limit) || 0);
    return n > 0 ? n : 20;
  }

  function normalizeInput(input){
    var i = input || {};
    return {
      dir: (i.dir === undefined || i.dir === null) ? 5 : (i.dir | 0),
      buttons: (i.buttons === undefined || i.buttons === null) ? 0 : (i.buttons | 0)
    };
  }

  function computeEdge(prevInput, currInput){
    var prev = normalizeInput(prevInput || { dir: 5, buttons: 0 });
    var curr = normalizeInput(currInput);
    return {
      dir: (curr.dir !== prev.dir) ? 1 : 0,
      buttons: (curr.buttons & (~prev.buttons)) | 0
    };
  }

  function trimHistory(arr, limit){
    var max = clampLimit(limit);
    while (arr.length > max) {
      arr.shift();
    }
  }

  function pushHistory(fighter, input, edge, limit, frame){
    if (!fighter) return;
    var i = normalizeInput(input);
    var e = edge || { dir: 0, buttons: 0 };
    var f = (frame === undefined || frame === null) ? 0 : (frame | 0);

    fighter.inputHistory = fighter.inputHistory || [];
    fighter.inputEdgeHistory = fighter.inputEdgeHistory || [];

    fighter.inputHistory.push({
      frame: f,
      dir: i.dir,
      buttons: i.buttons
    });
    fighter.inputEdgeHistory.push({
      frame: f,
      dir: (e.dir | 0),
      buttons: (e.buttons | 0)
    });

    trimHistory(fighter.inputHistory, limit);
    trimHistory(fighter.inputEdgeHistory, limit);
  }

  ns.core.input.historyBuffer = {
    clampLimit: clampLimit,
    normalizeInput: normalizeInput,
    computeEdge: computeEdge,
    pushHistory: pushHistory
  };
})(typeof window !== 'undefined' ? window : this);
