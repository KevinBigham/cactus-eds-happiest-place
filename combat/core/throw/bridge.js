(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.throw = ns.core.throw || {};

  function constants(){
    return (ns.core && ns.core.constants) || null;
  }

  function states(){
    var c = constants();
    if (c && typeof c.states === 'function') return c.states();
    return global.FIGHT_STATES || {
      IDLE:'idle', WALK:'walk', CROUCH:'crouch', JUMP:'jump',
      STARTUP:'startup', ACTIVE:'active', RECOVERY:'recovery',
      HITSTUN:'hitstun', BLOCKSTUN:'blockstun', KNOCKDOWN:'knockdown', WAKEUP:'wakeup',
      THROW:'throw', DIZZY:'dizzy'
    };
  }

  function consequenceHelpers(){
    return (ns.core && ns.core.consequence && ns.core.consequence.helpers) ? ns.core.consequence.helpers : null;
  }

  function summarizeConfig(cfg){
    var c = cfg || {};
    var throwCfg = c.throw || {};
    var tcfg = c.targetCombos || {};
    var hitstop = c.hitstop || {};
    return {
      throwCfg: {
        rangeX: throwCfg.rangeX === undefined ? null : (throwCfg.rangeX | 0),
        rangeY: throwCfg.rangeY === undefined ? null : (throwCfg.rangeY | 0),
        techWindow: throwCfg.techWindow === undefined ? null : (throwCfg.techWindow | 0),
        tieRule: String(throwCfg.tieRule || '')
      },
      targetCombos: {
        enabled: tcfg.enabled === undefined ? null : !!tcfg.enabled,
        inputWindowFrames: tcfg.inputWindowFrames === undefined ? null : (tcfg.inputWindowFrames | 0),
        requireHitOrBlock: tcfg.requireHitOrBlock === undefined ? null : !!tcfg.requireHitOrBlock
      },
      hitstop: {
        light: hitstop.light === undefined ? null : (hitstop.light | 0),
        medium: hitstop.medium === undefined ? null : (hitstop.medium | 0),
        heavy: hitstop.heavy === undefined ? null : (hitstop.heavy | 0),
        block: hitstop.block === undefined ? null : (hitstop.block | 0)
      },
      forced: !!c.__forcedHelperConfig
    };
  }

  function summarizeMove(move){
    var m = move || {};
    return {
      id: String(m.id || ''),
      type: String(m.type || ''),
      hitstop: String(m.hitstop || ''),
      startup: m.startup === undefined ? null : (m.startup | 0),
      active: m.active === undefined ? null : (m.active | 0),
      recovery: m.recovery === undefined ? null : (m.recovery | 0),
      forced: !!m.__forcedHelperLookup
    };
  }

  function helperArgs(name, args){
    if (name === 'configFor') {
      return {
        hasWorld: !!args[0],
        hasCfg: !!(args[0] && args[0].cfg),
        sfEnabled: !!(args[0] && args[0].sf && args[0].sf.enabled),
        mkEnabled: !!(args[0] && args[0].mkGba && args[0].mkGba.enabled)
      };
    }
    if (name === 'rosterMoveById') {
      return { rosterKey: String(args[0] || ''), moveId: String(args[1] || '') };
    }
    if (name === 'strengthFromMove') {
      return { moveId: String(args[0] && args[0].id || ''), hitstop: String(args[0] && args[0].hitstop || '') };
    }
    if (name === 'targetCombosEnabled') {
      return {
        sfEnabled: !!(args[0] && args[0].sf && args[0].sf.enabled),
        mkEnabled: !!(args[0] && args[0].mkGba && args[0].mkGba.enabled)
      };
    }
    if (name === 'mkAirHitsKey') {
      return { fighter: String(args[0] || '') };
    }
    if (name === 'l15WarnThreshold') {
      return { hasWorld: !!args[0] };
    }
    if (name === 'fromPx' || name === 'toPx' || name === 'abs') {
      return { value: Number(args[0] || 0) };
    }
    if (name === 'clamp') {
      return { value: Number(args[0] || 0), min: Number(args[1] || 0), max: Number(args[2] || 0) };
    }
    return {};
  }

  function helperRet(name, value){
    if (name === 'configFor') return summarizeConfig(value);
    if (name === 'rosterMoveById') return summarizeMove(value);
    if (name === 'strengthFromMove') return { value: String(value || '') };
    if (name === 'targetCombosEnabled') return { value: !!value };
    if (name === 'mkAirHitsKey') return { value: String(value || '') };
    if (name === 'l15WarnThreshold') return { value: value === undefined ? null : (value | 0) };
    return { value: (value === undefined ? null : value) };
  }

  function helperMismatchLabel(name){
    if (name === 'configFor') return 'helper-config';
    if (name === 'strengthFromMove') return 'helper-strength';
    if (name === 'sfAttackPreset') return 'helper-preset';
    if (name === 'targetCombosEnabled') return 'helper-target-combos';
    if (name === 'mkAirHitsKey') return 'helper-air-key';
    if (name === 'l15WarnThreshold') return 'helper-warn-threshold';
    if (name === 'fromPx' || name === 'toPx' || name === 'abs') return 'helper-px-math';
    if (name === 'clamp') return 'helper-clamp';
    if (name === 'rosterMoveById') return 'helper-move-lookup';
    return 'helper-call-order';
  }

  function safeDialState(dial){
    if (!dial) return null;
    return {
      chainId: String(dial.chainId || ''),
      step: dial.step | 0,
      window: dial.window | 0
    };
  }

  function comboDigest(combos){
    var arr = Array.isArray(combos) ? combos : [];
    var out = [];
    var i, j, chain, parts;
    for (i = 0; i < arr.length; i++) {
      chain = Array.isArray(arr[i]) ? arr[i] : [];
      parts = [];
      for (j = 0; j < chain.length; j++) parts.push(String(chain[j] || ''));
      out.push(parts.join('>'));
    }
    return out.join('|');
  }

  function pushDialHelperTrace(route, entry){
    if (!route || !route.trace) return;
    if (!Array.isArray(route.trace.dialHelperCalls)) route.trace.dialHelperCalls = [];
    route.trace.dialHelperCalls.push(entry);
  }

  function pushTelemetryHelperTrace(route, entry){
    if (!route || !route.trace) return;
    if (!Array.isArray(route.trace.telemetryHelperCalls)) route.trace.telemetryHelperCalls = [];
    route.trace.telemetryHelperCalls.push(entry);
  }

  function dialMismatchLabel(name){
    if (name === 'mkDialState') return 'dial-state-access';
    if (name === 'mkCombosFor') return 'combo-lookup';
    if (name === 'mkResetDial') return 'dial-reset';
    if (name === 'targetCombosEnabled') return 'target-combo-gate';
    return 'dial-helper-call-order';
  }

  function forcedDialMismatch(name){
    var inj = global.__fightForceDialComboHelperMismatch || null;
    if (!inj || inj.used) return null;
    if (String(inj.kind || '') !== dialMismatchLabel(name)) return null;
    inj.used = true;
    return inj;
  }

  function maybeForceDialCallOrder(route){
    var inj = global.__fightForceDialComboHelperMismatch || null;
    if (!inj || inj.used || String(inj.kind || '') !== 'dial-helper-call-order') return;
    inj.used = true;
    pushDialHelperTrace(route, {
      name: '__forcedDialOrder',
      ctx: String(route.context || 'throw'),
      kind: 'call-order',
      path: 'forced'
    });
  }

  function lifecycleModule(){
    return (ns.core && ns.core.world && ns.core.world.lifecycle) ? ns.core.world.lifecycle : null;
  }

  function telemetryMismatchLabel(name){
    if (name === 'l15Bump') return 'telemetry-bump';
    return 'telemetry-call-order';
  }

  function forcedTelemetryMismatch(name){
    var inj = global.__fightForceTelemetryHelperMismatch || null;
    if (!inj || inj.used) return null;
    if (String(inj.kind || '') !== telemetryMismatchLabel(name)) return null;
    inj.used = true;
    return inj;
  }

  function maybeForceTelemetryCallOrder(route){
    var inj = global.__fightForceTelemetryHelperMismatch || null;
    if (!inj || inj.used || String(inj.kind || '') !== 'telemetry-call-order') return;
    inj.used = true;
    pushTelemetryHelperTrace(route, {
      name: '__forcedTelemetryOrder',
      ctx: String(route && route.context || 'throw'),
      path: 'forced'
    });
  }

  function cloneValue(value){
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    return JSON.parse(JSON.stringify(value));
  }

  function applyForcedHelperMismatch(name, value){
    var inj = global.__fightForceConsequenceHelperMismatch || null;
    var label = helperMismatchLabel(name);
    var out;
    if (!inj || inj.used || String(inj.kind || '') !== label) return value;
    inj.used = true;
    if (label === 'helper-config') {
      out = cloneValue(value) || {};
      out.__forcedHelperConfig = true;
      return out;
    }
    if (label === 'helper-strength') {
      return String(value || '') === 'heavy' ? 'light' : 'heavy';
    }
    if (label === 'helper-target-combos') {
      return !value;
    }
    if (label === 'helper-px-math') {
      return Number(value || 0) + 1;
    }
    if (label === 'helper-move-lookup') {
      out = cloneValue(value) || {};
      out.__forcedHelperLookup = true;
      return out;
    }
    return value;
  }

  function pushHelperTrace(route, name, args, value, path){
    if (!route || !route.trace) return;
    if (!Array.isArray(route.trace.helperCalls)) route.trace.helperCalls = [];
    route.trace.helperCalls.push({
      name: name,
      path: path,
      ctx: String(route.context || 'throw'),
      args: helperArgs(name, args),
      ret: helperRet(name, value)
    });
  }

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'throw'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function routeHelper(name, args, route, modFn, legacyFn, localFn){
    var useLegacy = !!(route && route.forceLegacyConsequenceHelpers);
    var path = 'module';
    var reason = '';
    var ret;
    if (useLegacy && legacyFn) {
      path = 'legacy';
      reason = 'forced-legacy-consequence-helpers';
      ret = legacyFn.apply(null, args);
    } else if (modFn) {
      if (useLegacy) reason = 'forced-legacy-helper-missing';
      ret = modFn.apply(null, args);
    } else if (legacyFn) {
      path = 'legacy';
      reason = 'module-consequence-helper-missing';
      ret = legacyFn.apply(null, args);
    } else {
      path = 'local';
      reason = useLegacy ? 'forced-legacy-and-module-consequence-helper-missing' : 'module-and-legacy-consequence-helper-missing';
      ret = localFn.apply(null, args);
    }
    if (route) ret = applyForcedHelperMismatch(name, ret);
    pushHelperTrace(route, name, args, ret, path);
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        frame: route && route.trace ? (route.trace.frame | 0) : 0,
        ctx: String(route && route.context || 'throw'),
        op: name,
        path: path,
        reason: reason || 'legacy-consequence-helper-route',
        detail: ''
      });
    }
    return ret;
  }

  function configFor(world, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'configFor',
      [world],
      route,
      hm && typeof hm.configFor === 'function' ? hm.configFor : null,
      typeof global._fightConfigFor === 'function' ? global._fightConfigFor : null,
      function(localWorld){
        if (localWorld && localWorld.cfg) return localWorld.cfg;
        return (global.BALANCE && global.BALANCE.fight) || {};
      }
    );
  }

  function toPx(v, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'toPx',
      [v],
      route,
      hm && typeof hm.toPx === 'function' ? hm.toPx : null,
      typeof global._fightToPx === 'function' ? global._fightToPx : null,
      function(localV){
        return Number(localV || 0) / Number(global.FIGHT_FP || 256);
      }
    );
  }

  function fromPx(v, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'fromPx',
      [v],
      route,
      hm && typeof hm.fromPx === 'function' ? hm.fromPx : null,
      typeof global._fightFromPx === 'function' ? global._fightFromPx : null,
      function(localV){
        return Math.round(Number(localV || 0) * Number(global.FIGHT_FP || 256));
      }
    );
  }

  function abs(v, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'abs',
      [v],
      route,
      hm && typeof hm.abs === 'function' ? hm.abs : null,
      typeof global._fightAbs === 'function' ? global._fightAbs : null,
      function(localV){
        return Math.abs(localV | 0);
      }
    );
  }

  function rosterMoveById(rosterKey, moveId, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'rosterMoveById',
      [rosterKey, moveId],
      route,
      hm && typeof hm.rosterMoveById === 'function' ? hm.rosterMoveById : null,
      typeof global._fightRosterMoveById === 'function' ? global._fightRosterMoveById : null,
      function(localRosterKey, localMoveId){
        var r = global.FIGHT_ROSTER && global.FIGHT_ROSTER[localRosterKey];
        var i;
        if (!r || !Array.isArray(r.moves) || !localMoveId) return null;
        for (i = 0; i < r.moves.length; i++) {
          if (r.moves[i] && r.moves[i].id === localMoveId) return r.moves[i];
        }
        return null;
      }
    );
  }

  function l15Bump(roundStats, key, side, amt, route){
    var lc = lifecycleModule();
    var useLegacy = !!(route && route.forceLegacyTelemetryHelpers);
    var fn = null;
    var path = 'module';
    var reason = '';
    var hasBlock = !!roundStats;
    var hasKey = !!(roundStats && roundStats[key]);
    var hasSide = !!(roundStats && roundStats[key] && roundStats[key][side] !== undefined);
    var beforeValue = hasSide ? (roundStats[key][side] | 0) : null;
    maybeForceTelemetryCallOrder(route);
    if (useLegacy && typeof global._fightL15Bump === 'function') {
      fn = global._fightL15Bump;
      path = 'legacy';
      reason = 'forced-legacy-telemetry-helpers';
    } else if (lc && typeof lc.l15Bump === 'function') {
      fn = lc.l15Bump;
      if (useLegacy) reason = 'forced-legacy-telemetry-helper-missing';
    } else if (typeof global._fightL15Bump === 'function') {
      fn = global._fightL15Bump;
      path = 'legacy';
      reason = 'module-telemetry-helper-missing';
    } else {
      path = 'local';
      reason = useLegacy ? 'forced-legacy-and-module-telemetry-helper-missing' : 'module-and-legacy-telemetry-helper-missing';
      fn = function(localBlock, localKey, localSide, localAmt){
        if (!localBlock || !localBlock[localKey] || localBlock[localKey][localSide] === undefined) return;
        localBlock[localKey][localSide] += Math.floor(localAmt === undefined ? 1 : localAmt);
      };
    }
    fn(roundStats, key, side, amt);
    if (forcedTelemetryMismatch('l15Bump') && roundStats && roundStats[key] && roundStats[key][side] !== undefined) {
      roundStats[key][side] = (roundStats[key][side] | 0) + 1;
    }
    var afterValue = (roundStats && roundStats[key] && roundStats[key][side] !== undefined) ? (roundStats[key][side] | 0) : null;
    pushTelemetryHelperTrace(route, {
      name: 'l15Bump',
      ctx: String(route && route.context || 'throw'),
      path: path,
      key: String(key || ''),
      side: String(side || ''),
      amt: amt === undefined ? null : Number(amt),
      hasBlock: hasBlock,
      hasKey: hasKey,
      hasSide: hasSide,
      beforeValue: beforeValue,
      afterValue: afterValue,
      applied: beforeValue !== afterValue,
      delta: (beforeValue === null || afterValue === null) ? 0 : ((afterValue | 0) - (beforeValue | 0))
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        frame: route && route.trace ? (route.trace.frame | 0) : 0,
        ctx: String(route && route.context || 'throw'),
        op: 'l15Bump',
        path: path,
        reason: reason || 'legacy-telemetry-helper-route',
        detail: String(key || '')
      });
    }
  }

  function strengthFromMove(move, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'strengthFromMove',
      [move],
      route,
      hm && typeof hm.strengthFromMove === 'function' ? hm.strengthFromMove : null,
      typeof global._fightStrengthFromMove === 'function' ? global._fightStrengthFromMove : null,
      function(localMove){
        var hs = (localMove && localMove.hitstop) ? String(localMove.hitstop) : 'light';
        if (hs === 'heavy') return 'heavy';
        if (hs === 'medium') return 'medium';
        return 'light';
      }
    );
  }

  function mkCombosFor(rosterKey, route){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var ret;
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkCombosFor === 'function') {
      fn = global._fightMkCombosFor;
      path = 'legacy';
    } else if (hm && typeof hm.mkCombosFor === 'function') {
      fn = hm.mkCombosFor;
    } else if (typeof global._fightMkCombosFor === 'function') {
      fn = global._fightMkCombosFor;
      path = 'legacy';
    } else {
      fn = function(localRosterKey){
        var table = (global.BALANCE && global.BALANCE.fight && global.BALANCE.fight.mkGbaTargetCombos) || {};
        return table[localRosterKey] || [];
      };
    }
    ret = fn(rosterKey);
    if (forcedDialMismatch('mkCombosFor')) {
      ret = Array.isArray(ret) ? ret.slice(0) : [];
      ret.push(['__forcedDialCombo']);
    }
    pushDialHelperTrace(route, {
      name: 'mkCombosFor',
      ctx: String(route && route.context || 'throw'),
      kind: 'combo-lookup',
      path: path,
      rosterKey: String(rosterKey || ''),
      comboCount: Array.isArray(ret) ? (ret.length | 0) : 0,
      comboDigest: comboDigest(ret)
    });
    return ret;
  }

  function mkDialState(world, fighter, route){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var ret;
    var slot = (!world || !world.mkGba || !world.mkGba.comboDial || !fighter) ? null : (world.mkGba.comboDial[fighter.id] || null);
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkDialState === 'function') {
      fn = global._fightMkDialState;
      path = 'legacy';
    } else if (hm && typeof hm.mkDialState === 'function') {
      fn = hm.mkDialState;
    } else if (typeof global._fightMkDialState === 'function') {
      fn = global._fightMkDialState;
      path = 'legacy';
    } else {
      fn = function(localWorld, localFighter){
        if (!localWorld || !localWorld.mkGba || !localWorld.mkGba.comboDial || !localFighter) return null;
        return localWorld.mkGba.comboDial[localFighter.id] || null;
      };
    }
    ret = fn(world, fighter);
    if (forcedDialMismatch('mkDialState')) {
      if (ret && typeof ret === 'object') ret = { chainId: String(ret.chainId || ''), step: ret.step | 0, window: ret.window | 0, __forcedDialState: true };
      else ret = { chainId: '', step: 0, window: 0, __forcedDialState: true };
    }
    pushDialHelperTrace(route, {
      name: 'mkDialState',
      ctx: String(route && route.context || 'throw'),
      kind: 'state-access',
      path: path,
      fighter: String(fighter && fighter.id || ''),
      sameSlot: ret === slot,
      dial: safeDialState(ret)
    });
    return ret;
  }

  function targetCombosEnabled(world, route){
    var hm = consequenceHelpers();
    var helperRoute = {
      forceLegacyConsequenceHelpers: !!(route && (route.forceLegacyConsequenceHelpers || route.forceLegacyDialComboHelpers)),
      trace: route ? route.trace : null,
      context: route ? route.context : 'throw'
    };
    var ret = !!routeHelper(
      'targetCombosEnabled',
      [world],
      helperRoute,
      hm && typeof hm.targetCombosEnabled === 'function' ? hm.targetCombosEnabled : null,
      typeof global._fightTargetCombosEnabled === 'function' ? global._fightTargetCombosEnabled : null,
      function(localWorld){
        var cfg = configFor(localWorld);
        var tcfg = (cfg && cfg.targetCombos) || {};
        return tcfg.enabled !== false;
      }
    );
    if (forcedDialMismatch('targetCombosEnabled')) ret = !ret;
    pushDialHelperTrace(route, {
      name: 'targetCombosEnabled',
      ctx: String(route && route.context || 'throw'),
      kind: 'gate',
      path: helperRoute.forceLegacyConsequenceHelpers ? 'legacy' : 'module',
      value: ret
    });
    return ret;
  }

  function mkResetDial(dial, route, reason){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var before = safeDialState(dial);
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkResetDial === 'function') {
      fn = global._fightMkResetDial;
      path = 'legacy';
    } else if (hm && typeof hm.mkResetDial === 'function') {
      fn = hm.mkResetDial;
    } else if (typeof global._fightMkResetDial === 'function') {
      fn = global._fightMkResetDial;
      path = 'legacy';
    } else {
      fn = function(localDial){
        if (!localDial) return;
        localDial.chainId = '';
        localDial.step = 0;
        localDial.window = 0;
      };
    }
    fn(dial);
    if (forcedDialMismatch('mkResetDial') && dial) dial.window = 1;
    pushDialHelperTrace(route, {
      name: 'mkResetDial',
      ctx: String(route && route.context || 'throw'),
      kind: 'reset',
      path: path,
      reason: String(reason || ''),
      before: before,
      after: safeDialState(dial)
    });
  }

  function hitstopBridge(){
    return (ns.core && ns.core.hitstop && ns.core.hitstop.bridge) ? ns.core.hitstop.bridge : null;
  }

  function applyHitstop(world, key, opts){
    var o = opts || {};
    var hm = hitstopBridge();
    if (hm && typeof hm.applyHitstop === 'function') {
      hm.applyHitstop(world, key, {
        forceLegacyHitstop: !!o.forceLegacyHitstop,
        caller: String(o.caller || 'throw-module-connect'),
        probeOut: o.hitstopProbeOut || null
      });
      return;
    }
    if (typeof global._fightApplyHitstopLegacyBody === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'throw',
        op: 'applyHitstop',
        path: 'legacy',
        reason: 'module-hitstop-bridge-missing',
        detail: String(o.caller || 'throw-module-connect')
      });
      global._fightApplyHitstopLegacyBody(world, key);
      return;
    }
    pushRouteDiagnostic({
      frame: world ? (world.frame | 0) : 0,
      ctx: 'throw',
      op: 'applyHitstop',
      path: 'local',
      reason: 'module-and-legacy-hitstop-missing',
      detail: String(o.caller || 'throw-module-connect')
    });
    if (!world || !world.interaction) return;
    var cfg = configFor(world);
    var hs = (cfg && cfg.hitstop) || {};
    var v = hs.light || 6;
    if (key === 'medium') v = hs.medium || 8;
    else if (key === 'heavy') v = hs.heavy || 10;
    else if (key === 'block') v = hs.block || 5;
    world.interaction.hitstop = Math.max(world.interaction.hitstop, v);
  }

  function hashModule(){
    return (ns.core && ns.core.world && ns.core.world.hash) ? ns.core.world.hash : null;
  }

  function compactLastExchange(world){
    var ex = world && world.interaction ? world.interaction.lastExchange : null;
    if (!ex) return null;
    return {
      frame: ex.frame | 0,
      moveId: String(ex.moveId || ''),
      hitType: String(ex.hitType || ''),
      contactFrame: ex.contactFrame | 0
    };
  }

  function interactionHitstop(world){
    return (world && world.interaction) ? (world.interaction.hitstop | 0) : 0;
  }

  function throwEventDigest(events, startIdx, attackerId){
    var out = [];
    var arr = events || [];
    var i;
    for (i = startIdx | 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t !== 'throw' && t !== 'throwTech' && t !== 'throwWhiff') continue;
      var a = String(ev.attacker || '');
      if (attackerId && a !== String(attackerId || '')) continue;
      out.push({
        t: t,
        a: a,
        d: String(ev.defender || ''),
        m: String(ev.moveId || ''),
        x: (ev.x === undefined ? 0 : (ev.x | 0)),
        y: (ev.y === undefined ? 0 : (ev.y | 0)),
        s: String(ev.strength || ''),
        mt: String(ev.moveType || ''),
        sp: !!ev.isSpecial
      });
    }
    return out;
  }

  function detectResultType(delta){
    var i;
    var arr = delta || [];
    for (i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].t === 'throwTech') return 'tech';
    }
    for (i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].t === 'throw') return 'connect';
    }
    for (i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].t === 'throwWhiff') return 'whiff';
    }
    return 'none';
  }

  function tieWinner(world, tieRule){
    if (String(tieRule || 'seeded') === 'seeded') {
      return ((((world.rng.seed + world.frame) >>> 0) & 1) === 0) ? 'p1' : 'p2';
    }
    if (global.FightRng && typeof global.FightRng.nextInt === 'function') {
      return (global.FightRng.nextInt(world, 2) === 0) ? 'p1' : 'p2';
    }
    return ((((world.rng.seed + world.frame) >>> 0) & 1) === 0) ? 'p1' : 'p2';
  }

  function canThrowWithReason(world, att, def, route){
    var st = states();
    if (!att || !def) return { ok: false, reason: 'missing-fighter' };
    if (att.state !== st.THROW && att.state !== st.ACTIVE) return { ok: false, reason: 'attacker-state' };
    if ((def.wakeupThrowInvulFramesLeft | 0) > 0) return { ok: false, reason: 'wakeup-throw-invul' };
    if (def.state === st.DIZZY || def.state === st.KNOCKDOWN || !def.grounded) return { ok: false, reason: 'defender-state' };
    var cfg = configFor(world, route);
    var tc = (cfg && cfg.throw) || { rangeX: 30, rangeY: 24 };
    var inRange = abs(toPx((att.x | 0) - (def.x | 0), route), route) <= (tc.rangeX | 0) &&
      abs(toPx((att.y | 0) - (def.y | 0), route), route) <= (tc.rangeY | 0);
    if (!inRange) return { ok: false, reason: 'out-of-range' };
    return { ok: true, reason: '' };
  }

  function canThrow(world, att, def){
    return canThrowWithReason(world, att, def, null).ok;
  }

  function resolveThrow(world, att, def, move, events, opts){
    var o = opts || {};
    var probe = o.probeOut || null;
    var route = {
      forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
      forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
      forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
      trace: probe,
      context: 'throw'
    };
    var useLegacy = !!o.forceLegacyThrowBridge || !!(world && world.__throwBridgeOwner === 'legacy');
    if (probe && !Array.isArray(probe.helperCalls)) probe.helperCalls = [];
    if (probe && !Array.isArray(probe.telemetryHelperCalls)) probe.telemetryHelperCalls = [];
    var cfg = configFor(world, route);
    var tc = (cfg && cfg.throw) || { techWindow: 7 };
    var tcfg = (cfg && cfg.targetCombos) || { enabled: true, inputWindowFrames: 8, requireHitOrBlock: true };
    var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
    var dial = mkDialState(world, att, route);
    var mkCombos = mkCombosFor(att && att.rosterKey ? att.rosterKey : '', route);
    var strength = strengthFromMove(move, route);
    var techWindow = tc.techWindow | 0;
    var startIdx = events ? events.length : 0;
    var techEligible = !!(def && (def.throwTechFramesLeft | 0) > 0 && techWindow > 0);
    var hitstopBefore = interactionHitstop(world);
    var resultType = 'none';
    var delta;

    if (probe) {
      probe.postEntry = {
        attacker: String(att && att.id || ''),
        defender: String(def && def.id || ''),
        moveId: String(move && move.id || ''),
        attackerState: String(att && att.state || ''),
        defenderState: String(def && def.state || ''),
        attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
        defenderThrowTechFramesLeft: def ? (def.throwTechFramesLeft | 0) : 0,
        techWindow: techWindow,
        moveHitRegisteredBefore: att ? !!att.moveHitRegistered : false
      };
      probe.postTechCheck = {
        defenderThrowTechFramesLeft: def ? (def.throwTechFramesLeft | 0) : 0,
        techWindow: techWindow,
        techEligible: techEligible,
        techTaken: false
      };
      probe.postBranchSelection = { resultType: 'none' };
    }

    if (useLegacy && typeof global._fightResolveThrow === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'throw',
        op: 'resolveThrow',
        path: 'legacy',
        reason: o.forceLegacyThrowBridge ? 'forced-legacy-throw-bridge' : 'owner-legacy-throw-bridge',
        detail: String(move && move.id || '')
      });
      var prevHint = global.__fightHitstopCallerHint;
      global.__fightHitstopCallerHint = 'throw-legacy';
      try {
        global._fightResolveThrow(world, att, def, move, events);
      } finally {
        global.__fightHitstopCallerHint = prevHint;
      }
      delta = throwEventDigest(events, startIdx, att && att.id ? att.id : '');
      resultType = detectResultType(delta);
      if (probe) {
        probe.postBranchSelection = { resultType: resultType };
        probe.postTechCheck.techTaken = (resultType === 'tech');
        probe.postLastExchangeWrite = {
          lastExchange: compactLastExchange(world)
        };
        probe.postHitstop = {
          called: resultType === 'connect',
          before: (resultType === 'connect') ? hitstopBefore : null,
          after: (resultType === 'connect') ? interactionHitstop(world) : null
        };
        probe.postThrowResolution = {
          resultType: resultType,
          moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
          lastExchange: compactLastExchange(world)
        };
        probe.postThrowEventDelta = delta;
        probe.postEventEmission = { throwEvents: delta };
      }
      return resultType;
    }

    // Module-owner consequence path: branch-for-branch parity with legacy _fightResolveThrow.
    if (att) att.moveHitRegistered = true;
    if (att) att.lastMoveContact = 'hit';
    if (techEligible) {
      resultType = 'tech';
      if (att) {
        att.moveId = null;
        att.moveFrame = 0;
        att.state = states().IDLE;
      }
      if (def) {
        def.state = states().IDLE;
        def.throwTechFramesLeft = 0;
      }
      if (att && def) {
        att.x -= fromPx(16, route) * att.facing;
        def.x += fromPx(16, route) * att.facing;
      }
      if (world && world.interaction) {
        world.interaction.lastExchange = {
          frame: world.frame,
          moveId: move && move.id || '',
          hitType: 'block',
          startup: move && move.startup,
          active: move && move.active,
          recovery: move && move.recovery,
          hitstun: 0,
          blockstun: 0,
          advantage: 0,
          advOnHit: 0,
          advOnBlock: 0,
          punishable: false,
          contactFrame: world.frame
        };
      }
      events.push({
        type: 'throwTech',
        attacker: att && att.id,
        defender: def && def.id,
        x: toPx((((att && att.x) || 0) + ((def && def.x) || 0)) * 0.5, route),
        y: toPx((((att && att.y) || 0) + ((def && def.y) || 0)) * 0.5, route)
      });
      if (dial) mkResetDial(dial, route, 'tech-branch');

      delta = throwEventDigest(events, startIdx, att && att.id ? att.id : '');
      if (probe) {
        probe.postBranchSelection = { resultType: resultType };
        probe.postTechCheck.techTaken = true;
        probe.postLastExchangeWrite = {
          lastExchange: compactLastExchange(world)
        };
        probe.postHitstop = {
          called: false,
          before: null,
          after: null
        };
        probe.postThrowResolution = {
          resultType: resultType,
          moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
          lastExchange: compactLastExchange(world)
        };
        probe.postThrowEventDelta = delta;
        probe.postEventEmission = { throwEvents: delta };
      }
      return resultType;
    }

    var oh = (move && move.onHit) || {};
    resultType = 'connect';
    if (def) {
      def.health = Math.max(0, (def.health | 0) - (oh.damage || 10));
      def.knockdownFramesLeft = Math.max(def.knockdownFramesLeft | 0, oh.knockdown || 38);
      def.state = states().KNOCKDOWN;
      def.vx = (att ? att.facing : 1) * fromPx(3.8, route);
      def.vy = fromPx(-2.2, route);
      def.hitFlashFrames = 14;
    }
    if (rs && att && def) {
      l15Bump(rs, 'throws', att.id, 1, route);
      l15Bump(rs, 'throwDamage', att.id, oh.damage || 10, route);
      rs.currentCombo[att.id] += 1;
      rs.currentCombo[def.id] = 0;
      rs.blockStreak[def.id] = 0;
      if (rs.currentCombo[att.id] > rs.maxCombo[att.id]) rs.maxCombo[att.id] = rs.currentCombo[att.id];
    }
    applyHitstop(world, (move && move.hitstop) || 'medium', {
      forceLegacyHitstop: !!o.forceLegacyHitstop,
      caller: 'throw-module-connect'
    });
    if (world && world.interaction) {
      world.interaction.lastExchange = {
        frame: world.frame,
        moveId: move && move.id || '',
        hitType: 'throw',
        startup: move && move.startup || 0,
        active: move && move.active || 0,
        recovery: move && move.recovery || 0,
        hitstun: 0,
        blockstun: 0,
        advantage: 0,
        advOnHit: 0,
        advOnBlock: 0,
        punishable: false,
        contactFrame: world.frame
      };
    }
    var tx = toPx((((att && att.x) || 0) + ((def && def.x) || 0)) * 0.5, route);
    var ty = toPx((((att && att.y) || 0) + ((def && def.y) || 0)) * 0.5, route);
    events.push({
      type: 'throw',
      attacker: att && att.id,
      defender: def && def.id,
      moveId: move && move.id,
      damage: oh.damage || 10,
      x: tx,
      y: ty,
      contactPx: { x: tx, y: ty },
      strength: strength,
      moveType: (move && move.type) || 'throw',
      isSpecial: false
    });
    if (targetCombosEnabled(world, route) && tcfg.enabled && dial && dial.chainId !== '') {
      var cIdx = parseInt(dial.chainId, 10);
      if (isFinite(cIdx) && mkCombos[cIdx]) {
        var chain = mkCombos[cIdx];
        var idx = (dial.step <= 0) ? 0 : (dial.step - 1);
        if (chain[idx] === (move && move.id) && dial.step < chain.length) {
          dial.window = Math.max(1, Math.floor(tcfg.inputWindowFrames || 8));
        } else if (chain[idx] !== (move && move.id)) {
          mkResetDial(dial, route, 'consequence-mismatch');
        }
      } else {
        mkResetDial(dial, route, 'invalid-chain');
      }
    }

    delta = throwEventDigest(events, startIdx, att && att.id ? att.id : '');
    if (probe) {
      probe.postBranchSelection = { resultType: resultType };
      probe.postTechCheck.techTaken = false;
      probe.postLastExchangeWrite = {
        lastExchange: compactLastExchange(world)
      };
      probe.postHitstop = {
        called: true,
        before: hitstopBefore,
        after: interactionHitstop(world)
      };
      probe.postThrowResolution = {
        resultType: resultType,
        moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
        lastExchange: compactLastExchange(world)
      };
      probe.postThrowEventDelta = delta;
      probe.postEventEmission = { throwEvents: delta };
    }
    return resultType;
  }

  function stampGateProbe(probe, world, att, def, move, activeWindow, canInfo, techWindow){
    if (!probe) return;
    probe.postThrowGate = {
      frame: world ? (world.frame | 0) : 0,
      attacker: String(att && att.id || ''),
      defender: String(def && def.id || ''),
      moveId: String(move && move.id || ''),
      attackerState: String(att && att.state || ''),
      moveFrame: att ? (att.moveFrame | 0) : 0,
      activeThrowWindow: !!activeWindow,
      canThrow: !!(canInfo && canInfo.ok),
      gateFailReason: activeWindow ? String((canInfo && canInfo.reason) || '') : 'inactive-window',
      moveHitRegisteredBefore: att ? !!att.moveHitRegistered : false
    };
    probe.postEntry = {
      attacker: String(att && att.id || ''),
      defender: String(def && def.id || ''),
      moveId: String(move && move.id || ''),
      attackerState: String(att && att.state || ''),
      defenderState: String(def && def.state || ''),
      attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
      defenderThrowTechFramesLeft: def ? (def.throwTechFramesLeft | 0) : 0,
      techWindow: techWindow | 0,
      moveHitRegisteredBefore: att ? !!att.moveHitRegistered : false
    };
  }

  function markNoneResolution(probe, world, att){
    if (!probe) return;
    if (!probe.postTechCheck) {
      probe.postTechCheck = {
        defenderThrowTechFramesLeft: 0,
        techWindow: 0,
        techEligible: false,
        techTaken: false
      };
    }
    probe.postBranchSelection = { resultType: 'none' };
    probe.postLastExchangeWrite = {
      lastExchange: compactLastExchange(world)
    };
    probe.postHitstop = {
      called: false,
      before: null,
      after: null
    };
    probe.postThrowResolution = {
      resultType: 'none',
      moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
      lastExchange: compactLastExchange(world)
    };
    probe.postThrowEventDelta = [];
    probe.postEventEmission = { throwEvents: [] };
  }

  function applyWhiff(world, att, def, move, events, rs, probe, route){
    var start = events ? events.length : 0;
    if (att) att.moveHitRegistered = true;
    if (rs && att) l15Bump(rs, 'throwWhiffs', att.id, 1, route);
    events.push({
      type: 'throwWhiff',
      attacker: att && att.id ? att.id : '',
      defender: def && def.id ? def.id : '',
      moveId: move && move.id ? move.id : '',
      x: toPx((((world.fighters && world.fighters.p1 ? world.fighters.p1.x : 0) | 0) + ((world.fighters && world.fighters.p2 ? world.fighters.p2.x : 0) | 0)) * 0.5, route),
      y: toPx((((world.fighters && world.fighters.p1 ? world.fighters.p1.y : 0) | 0) + ((world.fighters && world.fighters.p2 ? world.fighters.p2.y : 0) | 0)) * 0.5, route),
      strength: 'light',
      moveType: 'throw',
      isSpecial: false
    });

    if (probe) {
      if (!probe.postTechCheck) {
        probe.postTechCheck = {
          defenderThrowTechFramesLeft: def ? (def.throwTechFramesLeft | 0) : 0,
          techWindow: 0,
          techEligible: false,
          techTaken: false
        };
      }
      probe.postBranchSelection = { resultType: 'whiff' };
      probe.postLastExchangeWrite = {
        lastExchange: compactLastExchange(world)
      };
      probe.postHitstop = {
        called: false,
        before: null,
        after: null
      };
      probe.postThrowResolution = {
        resultType: 'whiff',
        moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
        lastExchange: compactLastExchange(world)
      };
      probe.postThrowEventDelta = throwEventDigest(events, start, att && att.id ? att.id : '');
      probe.postEventEmission = { throwEvents: probe.postThrowEventDelta };
    }
  }

  function inferLegacyBranchResult(delta, attackerId){
    return detectResultType(throwEventDigest(delta, 0, attackerId));
  }

  function legacyResolveThrowsWithProbes(world, inputP1, inputP2, events, probe){
    var p1 = world && world.fighters ? world.fighters.p1 : null;
    var p2 = world && world.fighters ? world.fighters.p2 : null;
    var cfg = configFor(world);
    var tc = (cfg && cfg.throw) || { techWindow: 7 };
    var m1 = rosterMoveById(p1 ? p1.rosterKey : '', p1 ? p1.moveId : '');
    var m2 = rosterMoveById(p2 ? p2.rosterKey : '', p2 ? p2.moveId : '');
    var st = states();
    var a1 = !!(m1 && m1.type === 'throw' && p1 && p1.state === st.THROW && p1.moveFrame > m1.startup && p1.moveFrame <= m1.startup + m1.active);
    var a2 = !!(m2 && m2.type === 'throw' && p2 && p2.state === st.THROW && p2.moveFrame > m2.startup && p2.moveFrame <= m2.startup + m2.active);
    var c1Info = a1 ? canThrowWithReason(world, p1, p2) : { ok: false, reason: 'inactive-window' };
    var c2Info = a2 ? canThrowWithReason(world, p2, p1) : { ok: false, reason: 'inactive-window' };
    var start = events ? events.length : 0;

    var hitstopBefore = interactionHitstop(world);
    if (probe) {
      stampGateProbe(probe.p1, world, p1, p2, m1, a1, c1Info, tc.techWindow | 0);
      stampGateProbe(probe.p2, world, p2, p1, m2, a2, c2Info, tc.techWindow | 0);
    }

    var prevHint = global.__fightHitstopCallerHint;
    global.__fightHitstopCallerHint = 'throw-legacy';
    try {
      global._fightResolveThrows(world, inputP1, inputP2, events);
    } finally {
      global.__fightHitstopCallerHint = prevHint;
    }

    var delta = throwEventDigest(events, start, '');
    var p1Result = inferLegacyBranchResult(delta, p1 && p1.id ? p1.id : '');
    var p2Result = inferLegacyBranchResult(delta, p2 && p2.id ? p2.id : '');
    var hitstopAfter = interactionHitstop(world);

    if (probe) {
      if (probe.p1) {
        probe.p1.postBranchSelection = { resultType: p1Result };
        probe.p1.postTechCheck = {
          defenderThrowTechFramesLeft: p2 ? (p2.throwTechFramesLeft | 0) : 0,
          techWindow: tc.techWindow | 0,
          techEligible: !!(p2 && (p2.throwTechFramesLeft | 0) > 0 && (tc.techWindow | 0) > 0),
          techTaken: p1Result === 'tech'
        };
        probe.p1.postLastExchangeWrite = {
          lastExchange: compactLastExchange(world)
        };
        probe.p1.postHitstop = {
          called: p1Result === 'connect',
          before: (p1Result === 'connect') ? hitstopBefore : null,
          after: (p1Result === 'connect') ? hitstopAfter : null
        };
        probe.p1.postThrowResolution = {
          resultType: p1Result,
          moveHitRegisteredAfter: p1 ? !!p1.moveHitRegistered : false,
          lastExchange: compactLastExchange(world)
        };
        probe.p1.postThrowEventDelta = throwEventDigest(events, start, p1 && p1.id ? p1.id : '');
        probe.p1.postEventEmission = { throwEvents: probe.p1.postThrowEventDelta };
      }
      if (probe.p2) {
        probe.p2.postBranchSelection = { resultType: p2Result };
        probe.p2.postTechCheck = {
          defenderThrowTechFramesLeft: p1 ? (p1.throwTechFramesLeft | 0) : 0,
          techWindow: tc.techWindow | 0,
          techEligible: !!(p1 && (p1.throwTechFramesLeft | 0) > 0 && (tc.techWindow | 0) > 0),
          techTaken: p2Result === 'tech'
        };
        probe.p2.postLastExchangeWrite = {
          lastExchange: compactLastExchange(world)
        };
        probe.p2.postHitstop = {
          called: p2Result === 'connect',
          before: (p2Result === 'connect') ? hitstopBefore : null,
          after: (p2Result === 'connect') ? hitstopAfter : null
        };
        probe.p2.postThrowResolution = {
          resultType: p2Result,
          moveHitRegisteredAfter: p2 ? !!p2.moveHitRegistered : false,
          lastExchange: compactLastExchange(world)
        };
        probe.p2.postThrowEventDelta = throwEventDigest(events, start, p2 && p2.id ? p2.id : '');
        probe.p2.postEventEmission = { throwEvents: probe.p2.postThrowEventDelta };
      }
    }
  }

  function resolveThrows(world, inputP1, inputP2, events, opts){
    var o = opts || {};
    var probe = o.probeOut || null;
    var forceLegacy = !!o.forceLegacyThrowBridge;
    var ownerLegacy = forceLegacy || !!(world && world.__throwBridgeOwner === 'legacy');

    if (ownerLegacy && typeof global._fightResolveThrows === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'throw',
        op: 'resolveThrows',
        path: 'legacy',
        reason: forceLegacy ? 'forced-legacy-throw-bridge' : 'owner-legacy-throw-bridge',
        detail: ''
      });
      legacyResolveThrowsWithProbes(world, inputP1, inputP2, events, probe);
      return;
    }

    var p1 = world && world.fighters ? world.fighters.p1 : null;
    var p2 = world && world.fighters ? world.fighters.p2 : null;
    var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
    if (probe && probe.p1 && !Array.isArray(probe.p1.helperCalls)) probe.p1.helperCalls = [];
    if (probe && probe.p2 && !Array.isArray(probe.p2.helperCalls)) probe.p2.helperCalls = [];
    if (probe && probe.p1 && !Array.isArray(probe.p1.telemetryHelperCalls)) probe.p1.telemetryHelperCalls = [];
    if (probe && probe.p2 && !Array.isArray(probe.p2.telemetryHelperCalls)) probe.p2.telemetryHelperCalls = [];
    var routeP1 = {
      forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
      forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
      forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
      trace: probe ? probe.p1 : null,
      context: 'throw'
    };
    var routeP2 = {
      forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
      forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
      forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
      trace: probe ? probe.p2 : null,
      context: 'throw'
    };
    var cfg = configFor(world, routeP1);
    var tc = (cfg && cfg.throw) || { techWindow: 7 };
    var m1 = rosterMoveById(p1 ? p1.rosterKey : '', p1 ? p1.moveId : '', routeP1);
    var m2 = rosterMoveById(p2 ? p2.rosterKey : '', p2 ? p2.moveId : '', routeP2);
    var st = states();
    var a1 = !!(m1 && m1.type === 'throw' && p1 && p1.state === st.THROW && p1.moveFrame > m1.startup && p1.moveFrame <= m1.startup + m1.active);
    var a2 = !!(m2 && m2.type === 'throw' && p2 && p2.state === st.THROW && p2.moveFrame > m2.startup && p2.moveFrame <= m2.startup + m2.active);
    var c1Info = a1 ? canThrowWithReason(world, p1, p2, routeP1) : { ok: false, reason: 'inactive-window' };
    var c2Info = a2 ? canThrowWithReason(world, p2, p1, routeP2) : { ok: false, reason: 'inactive-window' };
    var c1 = a1 && c1Info.ok;
    var c2 = a2 && c2Info.ok;

    if (probe) {
      stampGateProbe(probe.p1, world, p1, p2, m1, a1, c1Info, tc.techWindow | 0);
      stampGateProbe(probe.p2, world, p2, p1, m2, a2, c2Info, tc.techWindow | 0);
    }

    if (!a1 && !a2) {
      if (probe) {
        markNoneResolution(probe.p1, world, p1);
        markNoneResolution(probe.p2, world, p2);
      }
      return;
    }

    if (a1 && a2 && c1 && c2) {
      var tie = (cfg && cfg.throw && cfg.throw.tieRule) || 'seeded';
      var winner = tieWinner(world, tie);
      if (winner === 'p1') {
        resolveThrow(world, p1, p2, m1, events, {
          probeOut: probe ? probe.p1 : null,
          forceLegacyThrowBridge: false,
          forceLegacyHitstop: !!o.forceLegacyHitstop,
          forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
          forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
          forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers
        });
        if (probe) markNoneResolution(probe.p2, world, p2);
      } else {
        resolveThrow(world, p2, p1, m2, events, {
          probeOut: probe ? probe.p2 : null,
          forceLegacyThrowBridge: false,
          forceLegacyHitstop: !!o.forceLegacyHitstop,
          forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
          forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
          forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers
        });
        if (probe) markNoneResolution(probe.p1, world, p1);
      }
      return;
    }

    if (c1) {
      resolveThrow(world, p1, p2, m1, events, {
        probeOut: probe ? probe.p1 : null,
        forceLegacyThrowBridge: false,
        forceLegacyHitstop: !!o.forceLegacyHitstop,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers
      });
    } else if (a1 && p1 && !p1.moveHitRegistered) {
      if (probe && probe.p1) {
        probe.p1.postTechCheck = {
          defenderThrowTechFramesLeft: p2 ? (p2.throwTechFramesLeft | 0) : 0,
          techWindow: tc.techWindow | 0,
          techEligible: !!(p2 && (p2.throwTechFramesLeft | 0) > 0 && (tc.techWindow | 0) > 0),
          techTaken: false
        };
      }
      applyWhiff(world, p1, p2, m1, events, rs, probe ? probe.p1 : null, routeP1);
    } else if (probe && probe.p1) {
      markNoneResolution(probe.p1, world, p1);
    }

    if (c2) {
      resolveThrow(world, p2, p1, m2, events, {
        probeOut: probe ? probe.p2 : null,
        forceLegacyThrowBridge: false,
        forceLegacyHitstop: !!o.forceLegacyHitstop,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers
      });
    } else if (a2 && p2 && !p2.moveHitRegistered) {
      if (probe && probe.p2) {
        probe.p2.postTechCheck = {
          defenderThrowTechFramesLeft: p1 ? (p1.throwTechFramesLeft | 0) : 0,
          techWindow: tc.techWindow | 0,
          techEligible: !!(p1 && (p1.throwTechFramesLeft | 0) > 0 && (tc.techWindow | 0) > 0),
          techTaken: false
        };
      }
      applyWhiff(world, p2, p1, m2, events, rs, probe ? probe.p2 : null, routeP2);
    } else if (probe && probe.p2) {
      markNoneResolution(probe.p2, world, p2);
    }
  }

  function digestThrowProbe(probe){
    var hm = hashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyThrowBridgeDiffPath(path){
    var p = String(path || '');
    if (!p) return 'throw-gate';
    if (p.indexOf('throwTechFramesLeft') >= 0 || p.indexOf('wakeupThrowInvulFramesLeft') >= 0) return 'throw-tech';
    if (p.indexOf('interaction.lastExchange') === 0) return 'throw-last-exchange';
    if (p.indexOf('interaction.hitstop') === 0) return 'throw-hitstop';
    if (
      p.indexOf('health') >= 0 ||
      p.indexOf('knockdownFramesLeft') >= 0 ||
      p.indexOf('.vx') >= 0 ||
      p.indexOf('.vy') >= 0
    ) return 'throw-connect';
    if (p.indexOf('moveHitRegistered') >= 0) return 'throw-whiff';
    return 'throw-event-order';
  }

  function classifySingleProbeMismatch(a, b){
    if (!a || !b) return 'throw-event-order';

    var ga = a.postThrowGate || {};
    var gb = b.postThrowGate || {};
    if (
      !!ga.activeThrowWindow !== !!gb.activeThrowWindow ||
      !!ga.canThrow !== !!gb.canThrow ||
      String(ga.gateFailReason || '') !== String(gb.gateFailReason || '') ||
      String(ga.moveId || '') !== String(gb.moveId || '')
    ) return 'throw-gate';

    var ea = a.postEntry || {};
    var eb = b.postEntry || {};
    if (
      String(ea.attacker || '') !== String(eb.attacker || '') ||
      String(ea.defender || '') !== String(eb.defender || '') ||
      String(ea.moveId || '') !== String(eb.moveId || '') ||
      (ea.attackerMoveFrame | 0) !== (eb.attackerMoveFrame | 0)
    ) return 'throw-handoff';

    var ba = a.postBranchSelection || {};
    var bb = b.postBranchSelection || {};
    if (String(ba.resultType || '') !== String(bb.resultType || '')) {
      if (String(ba.resultType || '') === 'tech' || String(bb.resultType || '') === 'tech') return 'throw-tech';
      if (String(ba.resultType || '') === 'connect' || String(bb.resultType || '') === 'connect') return 'throw-connect';
      if (String(ba.resultType || '') === 'whiff' || String(bb.resultType || '') === 'whiff') return 'throw-whiff';
      return 'throw-handoff';
    }

    var ta = a.postTechCheck || {};
    var tb = b.postTechCheck || {};
    if (
      !!ta.techTaken !== !!tb.techTaken ||
      !!ta.techEligible !== !!tb.techEligible ||
      (ta.techWindow | 0) !== (tb.techWindow | 0)
    ) return 'throw-tech';

    var ra = a.postThrowResolution || {};
    var rb = b.postThrowResolution || {};
    if (String(ra.resultType || '') !== String(rb.resultType || '')) {
      if (String(ra.resultType || '') === 'whiff' || String(rb.resultType || '') === 'whiff') return 'throw-whiff';
      if (String(ra.resultType || '') === 'tech' || String(rb.resultType || '') === 'tech') return 'throw-tech';
      if (String(ra.resultType || '') === 'connect' || String(rb.resultType || '') === 'connect') return 'throw-connect';
      return 'throw-handoff';
    }
    if (JSON.stringify(ra.lastExchange || null) !== JSON.stringify(rb.lastExchange || null)) return 'throw-last-exchange';
    if (!!ra.moveHitRegisteredAfter !== !!rb.moveHitRegisteredAfter) {
      return String(ra.resultType || '') === 'whiff' ? 'throw-whiff' : 'throw-connect';
    }

    if (JSON.stringify((a.postLastExchangeWrite || {}).lastExchange || null) !== JSON.stringify((b.postLastExchangeWrite || {}).lastExchange || null)) {
      return 'throw-last-exchange';
    }

    var hsA = a.postHitstop || {};
    var hsB = b.postHitstop || {};
    if (
      !!hsA.called !== !!hsB.called ||
      ((hsA.before === null ? -1 : (hsA.before | 0)) !== (hsB.before === null ? -1 : (hsB.before | 0))) ||
      ((hsA.after === null ? -1 : (hsA.after | 0)) !== (hsB.after === null ? -1 : (hsB.after | 0)))
    ) {
      return 'throw-hitstop';
    }

    if (JSON.stringify(a.postThrowEventDelta || []) !== JSON.stringify(b.postThrowEventDelta || [])) {
      return 'throw-event-order';
    }
    if (JSON.stringify((a.postEventEmission || {}).throwEvents || []) !== JSON.stringify((b.postEventEmission || {}).throwEvents || [])) {
      return 'throw-event-order';
    }

    return 'throw-event-order';
  }

  function classifyThrowProbeMismatch(a, b){
    if (!a || !b) return 'throw-event-order';
    if (a.p1 || b.p1 || a.p2 || b.p2) {
      var p1 = classifySingleProbeMismatch(a.p1, b.p1);
      if (p1 !== 'throw-event-order') return p1;
      return classifySingleProbeMismatch(a.p2, b.p2);
    }
    return classifySingleProbeMismatch(a, b);
  }

  ns.core.throw.bridge = {
    resolveThrows: resolveThrows,
    canThrow: canThrow,
    resolveThrow: resolveThrow,
    digestThrowProbe: digestThrowProbe,
    classifyThrowBridgeDiffPath: classifyThrowBridgeDiffPath,
    classifyThrowProbeMismatch: classifyThrowProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
