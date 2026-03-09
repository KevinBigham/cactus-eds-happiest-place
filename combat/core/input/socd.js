(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.input = ns.core.input || {};

  function normalizeRaw(rawInput){
    return {
      left: !!(rawInput && rawInput.left),
      right: !!(rawInput && rawInput.right),
      up: !!(rawInput && rawInput.up),
      down: !!(rawInput && rawInput.down)
    };
  }

  function resolveSocd(rawInput, socdConfig){
    var raw = normalizeRaw(rawInput);
    var l = raw.left;
    var r = raw.right;
    var u = raw.up;
    var d = raw.down;
    var socd = socdConfig || { lr: 'neutral', ud: 'neutral', udUpPriority: false };

    if (l && r) {
      if (socd.lr === 'neutral') {
        l = false;
        r = false;
      } else if (socd.lr === 'left') {
        r = false;
      } else if (socd.lr === 'right') {
        l = false;
      }
    }

    if (u && d) {
      if (socd.udUpPriority || socd.ud === 'up') {
        d = false;
      } else if (socd.ud === 'down') {
        u = false;
      } else {
        u = false;
        d = false;
      }
    }

    return { left: l, right: r, up: u, down: d };
  }

  function buildDirection(rawInput, facing, socdConfig){
    var filtered = resolveSocd(rawInput, socdConfig);
    var h = filtered.left ? -1 : (filtered.right ? 1 : 0);
    var relH = (facing === 1) ? h : -h;
    var v = filtered.up ? 1 : (filtered.down ? -1 : 0);

    if (v === 1) {
      if (relH < 0) return 7;
      if (relH > 0) return 9;
      return 8;
    }
    if (v === -1) {
      if (relH < 0) return 1;
      if (relH > 0) return 3;
      return 2;
    }
    if (relH < 0) return 4;
    if (relH > 0) return 6;
    return 5;
  }

  ns.core.input.socd = {
    normalizeRaw: normalizeRaw,
    resolveSocd: resolveSocd,
    buildDirection: buildDirection
  };
})(typeof window !== 'undefined' ? window : this);
