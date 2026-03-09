(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.hitstop = ns.core.hitstop || {};

  function hashModule(){
    return (ns.core && ns.core.world && ns.core.world.hash) ? ns.core.world.hash : null;
  }

  function configFor(world){
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    if (world && world.cfg) return world.cfg;
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function applyLegacyBodyLocal(world, key){
    if (!world || !world.interaction) return;
    var cfg = configFor(world);
    var hs = (cfg && cfg.hitstop) || {};
    var v = hs.light || 6;
    if (key === 'medium') v = hs.medium || 8;
    else if (key === 'heavy') v = hs.heavy || 10;
    else if (key === 'block') v = hs.block || 5;
    world.interaction.hitstop = Math.max(world.interaction.hitstop, v);
  }

  function resolveKeyAndValue(world, key){
    var cfg = configFor(world);
    var hs = (cfg && cfg.hitstop) || {};
    var resolvedKey = 'light';
    var v = hs.light || 6;
    if (key === 'medium') {
      resolvedKey = 'medium';
      v = hs.medium || 8;
    } else if (key === 'heavy') {
      resolvedKey = 'heavy';
      v = hs.heavy || 10;
    } else if (key === 'block') {
      resolvedKey = 'block';
      v = hs.block || 5;
    }
    return { resolvedKey: resolvedKey, resolvedValue: v };
  }

  function resolveProbeSink(opts){
    if (opts && opts.probeOut && Array.isArray(opts.probeOut.calls)) return opts.probeOut;
    if (global.__fightHitstopProbeSink && Array.isArray(global.__fightHitstopProbeSink.calls)) {
      return global.__fightHitstopProbeSink;
    }
    return null;
  }

  function pushProbeCall(sink, call){
    if (!sink || !Array.isArray(sink.calls)) return;
    sink.calls.push(call);
  }

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'hitstop'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function applyHitstop(world, key, opts){
    var o = opts || {};
    var caller = String(o.caller || global.__fightHitstopCallerHint || 'unknown');
    var useLegacy = !!o.forceLegacyHitstop || !!global.__fightForceLegacyHitstop || !!(world && world.__hitstopOwner === 'legacy');
    var ownerPath = useLegacy ? 'legacy' : 'module';
    var routePath = ownerPath;
    var routeReason = '';
    var sink = resolveProbeSink(o);
    var before = (world && world.interaction) ? (world.interaction.hitstop | 0) : 0;
    var resolved = resolveKeyAndValue(world, key);
    var applied = false;

    var pre = {
      frame: world ? (world.frame | 0) : 0,
      caller: caller,
      keyIn: (key === undefined ? '' : String(key)),
      hitstopBefore: before,
      ownerPath: ownerPath
    };

    if (world && world.interaction) {
      if (useLegacy) {
        if (typeof global._fightApplyHitstopLegacyBody === 'function') {
          routeReason = o.forceLegacyHitstop
            ? 'forced-legacy-hitstop'
            : (global.__fightForceLegacyHitstop ? 'global-forced-legacy-hitstop' : 'owner-legacy-hitstop');
          global._fightApplyHitstopLegacyBody(world, key);
        } else {
          routePath = 'local';
          routeReason = 'legacy-hitstop-body-missing';
          applyLegacyBodyLocal(world, key);
        }
      } else {
        world.interaction.hitstop = Math.max(world.interaction.hitstop, resolved.resolvedValue);
      }
      applied = true;
    }

    var after = (world && world.interaction) ? (world.interaction.hitstop | 0) : 0;
    var post = {
      resolvedKey: resolved.resolvedKey,
      resolvedValue: resolved.resolvedValue | 0,
      hitstopAfter: after,
      applied: !!applied
    };

    pushProbeCall(sink, {
      preHitstopCall: pre,
      postHitstopCall: post
    });
    if (routePath !== 'module' || routeReason) {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        op: 'applyHitstop',
        path: routePath,
        reason: routeReason || 'legacy-hitstop-route',
        detail: caller
      });
    }

    return after;
  }

  function digestHitstopProbe(probe){
    var hm = hashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyHitstopDiffPath(path){
    var p = String(path || '');
    if (!p) return 'hitstop-value';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-value';
    if (p.indexOf('interaction') === 0) return 'hitstop-callsite';
    return 'hitstop-callsite';
  }

  function classifyHitstopProbeMismatch(a, b){
    var pa = a || {};
    var pb = b || {};
    var ca = Array.isArray(pa.calls) ? pa.calls : [];
    var cb = Array.isArray(pb.calls) ? pb.calls : [];
    var i;

    if ((pa.__forcedKind || '') !== '' || (pb.__forcedKind || '') !== '') {
      var fk = String(pb.__forcedKind || pa.__forcedKind || '');
      if (fk === 'hitstop-key') return 'hitstop-key';
      if (fk === 'hitstop-value') return 'hitstop-value';
      if (fk === 'hitstop-callsite') return 'hitstop-callsite';
      if (fk === 'hitstop-missing-call') return 'hitstop-missing-call';
      if (fk === 'hitstop-double-call') return 'hitstop-double-call';
    }

    if (ca.length !== cb.length) {
      return (ca.length < cb.length) ? 'hitstop-missing-call' : 'hitstop-double-call';
    }

    if (JSON.stringify(pa.callerOrder || []) !== JSON.stringify(pb.callerOrder || [])) {
      return 'hitstop-callsite';
    }

    for (i = 0; i < ca.length; i++) {
      var aPre = ca[i] && ca[i].preHitstopCall ? ca[i].preHitstopCall : {};
      var bPre = cb[i] && cb[i].preHitstopCall ? cb[i].preHitstopCall : {};
      var aPost = ca[i] && ca[i].postHitstopCall ? ca[i].postHitstopCall : {};
      var bPost = cb[i] && cb[i].postHitstopCall ? cb[i].postHitstopCall : {};

      if (String(aPre.caller || '') !== String(bPre.caller || '')) return 'hitstop-callsite';
      if (String(aPre.keyIn || '') !== String(bPre.keyIn || '')) return 'hitstop-key';
      if (String(aPost.resolvedKey || '') !== String(bPost.resolvedKey || '')) return 'hitstop-key';
      if ((aPost.resolvedValue | 0) !== (bPost.resolvedValue | 0)) return 'hitstop-value';
      if ((aPost.hitstopAfter | 0) !== (bPost.hitstopAfter | 0)) return 'hitstop-value';
    }

    if ((pa.callCount | 0) !== (pb.callCount | 0)) {
      return ((pa.callCount | 0) < (pb.callCount | 0)) ? 'hitstop-missing-call' : 'hitstop-double-call';
    }

    return 'hitstop-value';
  }

  ns.core.hitstop.bridge = {
    applyHitstop: applyHitstop,
    digestHitstopProbe: digestHitstopProbe,
    classifyHitstopDiffPath: classifyHitstopDiffPath,
    classifyHitstopProbeMismatch: classifyHitstopProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
