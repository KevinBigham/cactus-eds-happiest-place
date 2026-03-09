(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function deepClone(v){
    if (v === null || v === undefined) return v;
    var t = typeof v;
    if (t === 'number' || t === 'string' || t === 'boolean') return v;
    if (Array.isArray(v)) {
      var out = [];
      var i;
      for (i = 0; i < v.length; i++) out.push(deepClone(v[i]));
      return out;
    }
    var o = {};
    var k;
    for (k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = deepClone(v[k]);
    }
    return o;
  }

  function snapshot(world) {
    var snap = deepClone(world || {});
    if (snap && snap.debug && snap.debug.snapshots) snap.debug.snapshots = [];
    return snap;
  }

  function restore(world, snap) {
    var target = world || {};
    var src = snap || {};
    var k;
    for (k in target) {
      if (Object.prototype.hasOwnProperty.call(target, k)) delete target[k];
    }
    for (k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = deepClone(src[k]);
    }
    if (target && target.debug && target.debug.snapshots) target.debug.snapshots = [];
    return target;
  }

  function serialize(world) {
    var hash = ns.core && ns.core.world && ns.core.world.hash;
    if (hash && typeof hash.stableStringify === 'function') {
      return hash.stableStringify(world || {});
    }
    return JSON.stringify(world || {});
  }

  ns.core.world.snapshot = {
    deepClone: deepClone,
    snapshot: snapshot,
    restore: restore,
    serialize: serialize
  };
})(typeof window !== 'undefined' ? window : this);
