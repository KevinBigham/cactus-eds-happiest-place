(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.exchange = ns.core.exchange || {};

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

  function hashModule(){
    return (ns.core && ns.core.world && ns.core.world.hash) ? ns.core.world.hash : null;
  }

  function consequenceHelpers(){
    return (ns.core && ns.core.consequence && ns.core.consequence.helpers) ? ns.core.consequence.helpers : null;
  }

  function summarizeConfig(cfg){
    var c = cfg || {};
    var push = c.pushback || {};
    var chip = c.chip || {};
    var stun = c.stun || {};
    var jug = c.juggle || {};
    var tcfg = c.targetCombos || {};
    var throwCfg = c.throw || {};
    var levels = c.attackLevels || {};
    return {
      pushback: {
        groundHit: push.groundHit === undefined ? null : (push.groundHit | 0),
        groundBlock: push.groundBlock === undefined ? null : (push.groundBlock | 0),
        airHit: push.airHit === undefined ? null : (push.airHit | 0),
        cornerExtra: push.cornerExtra === undefined ? null : (push.cornerExtra | 0)
      },
      chip: {
        specialOnly: chip.specialOnly === undefined ? null : !!chip.specialOnly,
        minDamage: chip.minDamage === undefined ? null : (chip.minDamage | 0)
      },
      stun: {
        threshold: stun.threshold === undefined ? null : (stun.threshold | 0),
        dizzyFrames: stun.dizzyFrames === undefined ? null : (stun.dizzyFrames | 0)
      },
      juggle: {
        maxAirHits: jug.maxAirHits === undefined ? null : (jug.maxAirHits | 0),
        extraGravityAfterCap: jug.extraGravityAfterCap === undefined ? null : Number(jug.extraGravityAfterCap || 0),
        postCapHitstunScale: jug.postCapHitstunScale === undefined ? null : Number(jug.postCapHitstunScale || 0)
      },
      targetCombos: {
        enabled: tcfg.enabled === undefined ? null : !!tcfg.enabled,
        inputWindowFrames: tcfg.inputWindowFrames === undefined ? null : (tcfg.inputWindowFrames | 0),
        requireHitOrBlock: tcfg.requireHitOrBlock === undefined ? null : !!tcfg.requireHitOrBlock
      },
      throwCfg: {
        rangeX: throwCfg.rangeX === undefined ? null : (throwCfg.rangeX | 0),
        rangeY: throwCfg.rangeY === undefined ? null : (throwCfg.rangeY | 0),
        techWindow: throwCfg.techWindow === undefined ? null : (throwCfg.techWindow | 0)
      },
      attackLevels: {
        light: levels.light ? {
          hitstop: levels.light.hitstop === undefined ? null : (levels.light.hitstop | 0),
          hitstun: levels.light.hitstun === undefined ? null : (levels.light.hitstun | 0),
          blockstun: levels.light.blockstun === undefined ? null : (levels.light.blockstun | 0)
        } : null,
        medium: levels.medium ? {
          hitstop: levels.medium.hitstop === undefined ? null : (levels.medium.hitstop | 0),
          hitstun: levels.medium.hitstun === undefined ? null : (levels.medium.hitstun | 0),
          blockstun: levels.medium.blockstun === undefined ? null : (levels.medium.blockstun | 0)
        } : null,
        heavy: levels.heavy ? {
          hitstop: levels.heavy.hitstop === undefined ? null : (levels.heavy.hitstop | 0),
          hitstun: levels.heavy.hitstun === undefined ? null : (levels.heavy.hitstun | 0),
          blockstun: levels.heavy.blockstun === undefined ? null : (levels.heavy.blockstun | 0)
        } : null
      },
      forced: !!c.__forcedHelperConfig
    };
  }

  function summarizePreset(preset){
    var p = preset || {};
    return {
      hitstop: p.hitstop === undefined ? null : (p.hitstop | 0),
      hitstun: p.hitstun === undefined ? null : (p.hitstun | 0),
      blockstun: p.blockstun === undefined ? null : (p.blockstun | 0),
      forced: !!p.__forcedHelperPreset
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
    if (name === 'strengthFromMove') {
      return {
        moveId: String(args[0] && args[0].id || ''),
        hitstop: String(args[0] && args[0].hitstop || '')
      };
    }
    if (name === 'sfAttackPreset') {
      return {
        strength: String(args[1] || ''),
        sfEnabled: !!(args[0] && args[0].sf && args[0].sf.enabled)
      };
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
    if (name === 'rosterMoveById') {
      return { rosterKey: String(args[0] || ''), moveId: String(args[1] || '') };
    }
    return {};
  }

  function helperRet(name, value){
    if (name === 'configFor') return summarizeConfig(value);
    if (name === 'strengthFromMove') return { value: String(value || '') };
    if (name === 'sfAttackPreset') return summarizePreset(value);
    if (name === 'targetCombosEnabled') return { value: !!value };
    if (name === 'mkAirHitsKey') return { value: String(value || '') };
    if (name === 'l15WarnThreshold') return { value: value === undefined ? null : (value | 0) };
    if (name === 'rosterMoveById') return summarizeMove(value);
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
      ctx: String(route.context || 'exchange'),
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
      ctx: String(route && route.context || 'exchange'),
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
    if (label === 'helper-preset') {
      out = cloneValue(value) || {};
      out.hitstun = ((out.hitstun === undefined ? 0 : out.hitstun) | 0) + 1;
      out.__forcedHelperPreset = true;
      return out;
    }
    if (label === 'helper-target-combos') {
      return !value;
    }
    if (label === 'helper-air-key') {
      return String(value || '') === 'p1AirHitsTaken' ? 'p2AirHitsTaken' : 'p1AirHitsTaken';
    }
    if (label === 'helper-warn-threshold') {
      return (value | 0) + 1;
    }
    if (label === 'helper-px-math') {
      return Number(value || 0) + 1;
    }
    if (label === 'helper-clamp') {
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
      ctx: String(route.context || 'exchange'),
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
      ctx: String(ev.ctx || 'exchange'),
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
        ctx: String(route && route.context || 'exchange'),
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

  function sfAttackPreset(world, strength, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'sfAttackPreset',
      [world, strength],
      route,
      hm && typeof hm.sfAttackPreset === 'function' ? hm.sfAttackPreset : null,
      typeof global._fightSfAttackPreset === 'function' ? global._fightSfAttackPreset : null,
      function(localWorld, localStrength){
        var cfg = configFor(localWorld);
        var levels = (cfg && cfg.attackLevels) || {
          light: { hitstop: 6, hitstun: 13, blockstun: 8 },
          medium: { hitstop: 8, hitstun: 16, blockstun: 10 },
          heavy: { hitstop: 12, hitstun: 20, blockstun: 12 }
        };
        if (localStrength === 'heavy') return levels.heavy || levels.medium || levels.light;
        if (localStrength === 'medium') return levels.medium || levels.light;
        return levels.light || { hitstop: 6, hitstun: 13, blockstun: 8 };
      }
    );
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
      ctx: String(route && route.context || 'exchange'),
      kind: 'state-access',
      path: path,
      fighter: String(fighter && fighter.id || ''),
      sameSlot: ret === slot,
      dial: safeDialState(ret)
    });
    return ret;
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
      ctx: String(route && route.context || 'exchange'),
      kind: 'combo-lookup',
      path: path,
      rosterKey: String(rosterKey || ''),
      comboCount: Array.isArray(ret) ? (ret.length | 0) : 0,
      comboDigest: comboDigest(ret)
    });
    return ret;
  }

  function targetCombosEnabled(world, route){
    var hm = consequenceHelpers();
    var helperRoute = {
      forceLegacyConsequenceHelpers: !!(route && (route.forceLegacyConsequenceHelpers || route.forceLegacyDialComboHelpers)),
      trace: route ? route.trace : null,
      context: route ? route.context : 'exchange'
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
      ctx: String(route && route.context || 'exchange'),
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
      ctx: String(route && route.context || 'exchange'),
      kind: 'reset',
      path: path,
      reason: String(reason || ''),
      before: before,
      after: safeDialState(dial)
    });
  }

  function mkAirHitsKey(fid, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'mkAirHitsKey',
      [fid],
      route,
      hm && typeof hm.mkAirHitsKey === 'function' ? hm.mkAirHitsKey : null,
      typeof global._fightMkAirHitsKey === 'function' ? global._fightMkAirHitsKey : null,
      function(localFid){
        return (String(localFid || '') === 'p1') ? 'p1AirHitsTaken' : 'p2AirHitsTaken';
      }
    );
  }

  function l15WarnThreshold(world, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'l15WarnThreshold',
      [world],
      route,
      hm && typeof hm.l15WarnThreshold === 'function' ? hm.l15WarnThreshold : null,
      typeof global._fightL15WarnThreshold === 'function' ? global._fightL15WarnThreshold : null,
      function(localWorld){
        var cfg = configFor(localWorld);
        var stunCfg = (cfg && cfg.stun) || { threshold: 100 };
        var warnPct = (cfg && cfg.juice && cfg.juice.warnStunPct) || 0.82;
        return Math.floor((stunCfg.threshold || 100) * warnPct);
      }
    );
  }

  function l15Bump(block, key, side, amt, route){
    var lc = lifecycleModule();
    var useLegacy = !!(route && route.forceLegacyTelemetryHelpers);
    var fn = null;
    var path = 'module';
    var reason = '';
    var hasBlock = !!block;
    var hasKey = !!(block && block[key]);
    var hasSide = !!(block && block[key] && block[key][side] !== undefined);
    var beforeValue = hasSide ? (block[key][side] | 0) : null;
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
    fn(block, key, side, amt);
    if (forcedTelemetryMismatch('l15Bump') && block && block[key] && block[key][side] !== undefined) {
      block[key][side] = (block[key][side] | 0) + 1;
    }
    var afterValue = (block && block[key] && block[key][side] !== undefined) ? (block[key][side] | 0) : null;
    pushTelemetryHelperTrace(route, {
      name: 'l15Bump',
      ctx: String(route && route.context || 'exchange'),
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
        ctx: String(route && route.context || 'exchange'),
        op: 'l15Bump',
        path: path,
        reason: reason || 'legacy-telemetry-helper-route',
        detail: String(key || '')
      });
    }
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

  function clamp(v, min, max, route){
    var hm = consequenceHelpers();
    return routeHelper(
      'clamp',
      [v, min, max],
      route,
      hm && typeof hm.clamp === 'function' ? hm.clamp : null,
      typeof global._fightClamp === 'function' ? global._fightClamp : null,
      function(localV, localMin, localMax){
        return localV < localMin ? localMin : (localV > localMax ? localMax : localV);
      }
    );
  }

  function hitstopBridge(){
    return (ns.core && ns.core.hitstop && ns.core.hitstop.bridge) ? ns.core.hitstop.bridge : null;
  }

  function applyHitstop(world, key, opts){
    var o = opts || {};
    var caller = String(o.caller || 'exchange-module');
    var prevHint = global.__fightHitstopCallerHint;
    global.__fightHitstopCallerHint = caller;
    try {
      if (typeof global._fightApplyHitstop === 'function') {
        pushRouteDiagnostic({
          frame: world ? (world.frame | 0) : 0,
          ctx: 'exchange',
          op: 'applyHitstop',
          path: 'compat-symbol',
          reason: 'global-hitstop-compat-symbol',
          detail: caller
        });
        global._fightApplyHitstop(world, key);
        return;
      }
      var hm = hitstopBridge();
      if (hm && typeof hm.applyHitstop === 'function') {
        hm.applyHitstop(world, key, {
          forceLegacyHitstop: !!o.forceLegacyHitstop,
          caller: caller,
          probeOut: o.hitstopProbeOut || null
        });
        return;
      }
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'exchange',
        op: 'applyHitstop',
        path: 'local',
        reason: 'module-and-compat-hitstop-missing',
        detail: caller
      });
      if (!world || !world.interaction) return;
      var cfg = configFor(world);
      var hs = (cfg && cfg.hitstop) || {};
      var v = hs.light || 6;
      if (key === 'medium') v = hs.medium || 8;
      else if (key === 'heavy') v = hs.heavy || 10;
      else if (key === 'block') v = hs.block || 5;
      world.interaction.hitstop = Math.max(world.interaction.hitstop, v);
    } finally {
      global.__fightHitstopCallerHint = prevHint;
    }
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

  function compactFighter(f){
    if (!f) return null;
    return {
      id: String(f.id || ''),
      health: f.health | 0,
      state: String(f.state || ''),
      hitstunFramesLeft: f.hitstunFramesLeft | 0,
      blockstunFramesLeft: f.blockstunFramesLeft | 0,
      knockdownFramesLeft: f.knockdownFramesLeft | 0,
      dizzyFramesLeft: f.dizzyFramesLeft | 0,
      stunMeter: f.stunMeter | 0,
      x: f.x | 0,
      y: f.y | 0,
      vx: f.vx | 0,
      vy: f.vy | 0,
      grounded: !!f.grounded,
      moveHitRegistered: !!f.moveHitRegistered,
      lastMoveContact: String(f.lastMoveContact || ''),
      hitFlashFrames: f.hitFlashFrames | 0
    };
  }

  function compactContact(contact){
    if (!contact) return null;
    return {
      x: Number(contact.x || 0),
      y: Number(contact.y || 0)
    };
  }

  function roundTelemetrySummary(world, attacker, defender){
    var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
    if (!rs || !attacker || !defender) return null;

    function pick(map, id){
      if (!map || map[id] === undefined) return 0;
      return map[id] | 0;
    }

    return {
      hitsLanded: pick(rs.hitsLanded, attacker.id),
      strikeDamage: pick(rs.strikeDamage, attacker.id),
      heavies: pick(rs.heavies, attacker.id),
      punishHits: pick(rs.punishHits, attacker.id),
      dizziesCaused: pick(rs.dizziesCaused, attacker.id),
      currentComboAtt: pick(rs.currentCombo, attacker.id),
      currentComboDef: pick(rs.currentCombo, defender.id),
      maxComboAtt: pick(rs.maxCombo, attacker.id),
      blocksDef: pick(rs.blocks, defender.id),
      blockStreakDef: pick(rs.blockStreak, defender.id),
      maxBlockStreakDef: pick(rs.maxBlockStreak, defender.id)
    };
  }

  function dialSummary(world, attacker){
    var d = mkDialState(world, attacker);
    if (!d) return null;
    return {
      chainId: String(d.chainId || ''),
      step: d.step | 0,
      window: d.window | 0
    };
  }

  function sideEffectSummary(world, attacker, defender){
    var flags = world && world.l15Stats && world.l15Stats.flags ? world.l15Stats.flags : null;
    var juggle = world && world.mkGba && world.mkGba.juggle ? world.mkGba.juggle : null;
    var airKey = defender ? mkAirHitsKey(defender.id) : '';
    return {
      cornerToastUntilFrame: flags ? (flags.cornerToastUntilFrame | 0) : 0,
      dizzyWarned: (flags && defender) ? !!flags.dizzyWarned[defender.id] : false,
      airHitsTaken: (juggle && airKey) ? (juggle[airKey] | 0) : 0,
      dial: dialSummary(world, attacker),
      telemetry: roundTelemetrySummary(world, attacker, defender)
    };
  }

  function exchangeEventDigest(events, startIdx){
    var out = [];
    var arr = events || [];
    var i;
    for (i = startIdx | 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (
        t === 'hit' ||
        t === 'block' ||
        t === 'juggleCapReached' ||
        t === 'dizzyWarn' ||
        t === 'cornerPressure'
      ) {
        out.push({
          t: t,
          a: String(ev.attacker || ''),
          d: String(ev.defender || ''),
          f: String(ev.fighter || ''),
          m: String(ev.moveId || ''),
          x: (ev.x === undefined ? 0 : (ev.x | 0)),
          y: (ev.y === undefined ? 0 : (ev.y | 0)),
          th: (ev.threshold === undefined ? 0 : (ev.threshold | 0)),
          cnt: (ev.count === undefined ? 0 : (ev.count | 0)),
          fr: (ev.frame === undefined ? 0 : (ev.frame | 0))
        });
      }
    }
    return out;
  }

  function consequenceDataSummary(data, sfAtk, sfOn, isBlock){
    var d = data || {};
    var sf = sfAtk || {};
    return {
      branch: isBlock ? 'block' : 'hit',
      damage: Math.max(0, d.damage || 0),
      hitstun: sfOn ? (sf.hitstun || d.hitstun || 0) : (d.hitstun || 0),
      blockstun: sfOn ? (sf.blockstun || d.blockstun || 0) : (d.blockstun || 0),
      knockdown: d.knockdown || 0,
      stun: d.stun || 0
    };
  }

  function applyExchangeModule(world, att, def, move, hitType, inputDef, events, contact, opts){
    var o = opts || {};
    var st = states();
    var trace = o.trace || null;
    var route = {
      forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
      forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
      forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
      trace: trace,
      context: 'exchange'
    };
    var isBlock = (hitType === true || hitType === 'block');
    if (trace && !Array.isArray(trace.helperCalls)) trace.helperCalls = [];
    var cfg = configFor(world, route);
    var sfOn = !!(world && world.sf && world.sf.enabled);
    var bh = (cfg && cfg.pushback) || { groundHit: 14, groundBlock: 10, airHit: 18, cornerExtra: 4 };
    var chipCfg = (cfg && cfg.chip) || { specialOnly: true, minDamage: 1 };
    var stunCfg = (cfg && cfg.stun) || { threshold: 100 };
    var jugCfg = (cfg && cfg.juggle) || { maxAirHits: 2, extraGravityAfterCap: 0.55, postCapHitstunScale: 0.5 };
    var tcfg = (cfg && cfg.targetCombos) || { enabled: true, inputWindowFrames: 8, requireHitOrBlock: true };
    var strength = strengthFromMove(move, route);
    var sfAtk = sfAttackPreset(world, strength, route);
    var dial = mkDialState(world, att, route);
    var mkCombos = mkCombosFor(att && att.rosterKey ? att.rosterKey : '', route);
    var contactPx = { x: contact ? contact.x : 0, y: contact ? contact.y : 0 };
    var warnThreshold = l15WarnThreshold(world, route);
    var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
    var flags = world && world.l15Stats && world.l15Stats.flags ? world.l15Stats.flags : null;
    var defWasAction = !!(def && def.moveId && (def.state === st.STARTUP || def.state === st.ACTIVE || def.state === st.RECOVERY));
    var data = isBlock ? ((move && move.onBlock) || {}) : ((move && move.onHit) || {});

    if (trace) {
      trace.postBranchSelection = {
        isBlock: !!isBlock,
        branch: isBlock ? 'block' : 'hit',
        strength: String(strength || ''),
        moveType: String(move && move.type || 'normal'),
        sfEnabled: sfOn,
        data: consequenceDataSummary(data, sfAtk, sfOn, isBlock)
      };
    }

    att.lastMoveContact = isBlock ? 'block' : 'hit';
    var dmg = Math.max(0, data.damage || 0);
    if (isBlock) {
      if (chipCfg.specialOnly && move.type !== 'special') dmg = 0;
      if (move.type === 'special') dmg = Math.max(chipCfg.minDamage || 1, dmg || 0);
    }
    def.health = Math.max(0, def.health - dmg);

    if (isBlock) {
      def.blockstunFramesLeft = Math.max(def.blockstunFramesLeft, sfOn ? (sfAtk.blockstun || data.blockstun || 0) : (data.blockstun || 0));
      def.state = st.BLOCKSTUN;
      if (rs) {
        l15Bump(rs, 'blocks', def.id, 1, route);
        rs.blockStreak[def.id] += 1;
        if (rs.blockStreak[def.id] > rs.maxBlockStreak[def.id]) rs.maxBlockStreak[def.id] = rs.blockStreak[def.id];
        rs.currentCombo[att.id] = 0;
      }
    } else {
      def.hitstunFramesLeft = Math.max(def.hitstunFramesLeft, sfOn ? (sfAtk.hitstun || data.hitstun || 0) : (data.hitstun || 0));
      def.state = (data.knockdown && data.knockdown > 0) ? st.KNOCKDOWN : st.HITSTUN;

      if (world.mkGba && world.mkGba.enabled && !sfOn && !def.grounded) {
        var airKey = mkAirHitsKey(def.id, route);
        world.mkGba.juggle[airKey] = (world.mkGba.juggle[airKey] || 0) + 1;
        if (world.mkGba.juggle[airKey] > (jugCfg.maxAirHits || 2)) {
          def.vy += fromPx(jugCfg.extraGravityAfterCap || 0.55, route);
          def.hitstunFramesLeft = Math.max(1, Math.floor(def.hitstunFramesLeft * (jugCfg.postCapHitstunScale || 0.5)));
          events.push({ type: 'juggleCapReached', attacker: att.id, defender: def.id, count: world.mkGba.juggle[airKey], x: contactPx.x, y: contactPx.y });
        }
      }

      if (data.knockdown && data.knockdown > 0) {
        def.knockdownFramesLeft = Math.max(def.knockdownFramesLeft, data.knockdown);
        def.hitstunFramesLeft = 0;
      }

      if (rs) {
        l15Bump(rs, 'hitsLanded', att.id, 1, route);
        l15Bump(rs, 'strikeDamage', att.id, dmg, route);
        if (move.hitstop === 'heavy') l15Bump(rs, 'heavies', att.id, 1, route);
        if (defWasAction) l15Bump(rs, 'punishHits', att.id, 1, route);
        rs.blockStreak[def.id] = 0;
        rs.currentCombo[att.id] += 1;
        rs.currentCombo[def.id] = 0;
        if (rs.currentCombo[att.id] > rs.maxCombo[att.id]) rs.maxCombo[att.id] = rs.currentCombo[att.id];
      }

      def.stunMeter = Math.min(stunCfg.threshold || 100, def.stunMeter + (data.stun || 0));
      if (flags && def.stunMeter >= warnThreshold && def.dizzyFramesLeft <= 0 && !flags.dizzyWarned[def.id]) {
        flags.dizzyWarned[def.id] = true;
        events.push({ type: 'dizzyWarn', fighter: def.id, stun: def.stunMeter, threshold: warnThreshold });
      }
      if (def.stunMeter >= (stunCfg.threshold || 100) && def.dizzyFramesLeft <= 0) {
        def.dizzyFramesLeft = (stunCfg.dizzyFrames || 120);
        def.state = st.DIZZY;
        if (flags) flags.dizzyWarned[def.id] = false;
        if (rs) l15Bump(rs, 'dizziesCaused', att.id, 1, route);
      }
    }

    if (trace) {
      trace.postMainMutation = {
        attacker: compactFighter(att),
        defender: compactFighter(def)
      };
    }

    def.hitFlashFrames = 12;
    var pb = isBlock ? (bh.groundBlock || 10) : (def.grounded ? (bh.groundHit || 14) : (bh.airHit || 18));
    if (world.stage.cornerPush && (def.x <= world.stage.left + fromPx(6, route) || def.x >= world.stage.right - fromPx(6, route))) pb += (bh.cornerExtra || 4);
    def.x += att.facing * fromPx(pb, route);
    def.x = clamp(def.x, world.stage.left, world.stage.right, route);

    var nearCorner = (def.x <= world.stage.left + fromPx(8, route) || def.x >= world.stage.right - fromPx(8, route));
    if (nearCorner && flags && world.frame >= flags.cornerToastUntilFrame) {
      flags.cornerToastUntilFrame = world.frame + ((cfg && cfg.juice && cfg.juice.cornerToastFrames) || 42);
      events.push({ type: 'cornerPressure', attacker: att.id, defender: def.id, x: contact ? contact.x : contactPx.x, y: contact ? contact.y : contactPx.y });
    }

    applyHitstop(world, isBlock ? 'block' : (sfOn ? strength : (move.hitstop || 'light')), {
      caller: 'exchange-module',
      forceLegacyHitstop: !!o.forceLegacyHitstop,
      hitstopProbeOut: o.hitstopProbeOut || null
    });

    var remainingRecovery = Math.max(0, (move.totalFrames || 0) - att.moveFrame);
    var stun = isBlock ? (sfOn ? (sfAtk.blockstun || data.blockstun || 0) : (data.blockstun || 0)) : (sfOn ? (sfAtk.hitstun || data.hitstun || 0) : (data.hitstun || 0));
    var advHit = (sfOn ? (sfAtk.hitstun || 0) : ((move.onHit && move.onHit.hitstun) || 0)) - remainingRecovery;
    var advBlock = (sfOn ? (sfAtk.blockstun || 0) : ((move.onBlock && move.onBlock.blockstun) || 0)) - remainingRecovery;

    world.interaction.lastExchange = {
      frame: world.frame,
      moveId: move.id || '',
      hitType: isBlock ? 'block' : 'hit',
      startup: move.startup || 0,
      active: move.active || 0,
      recovery: move.recovery || 0,
      hitstun: sfOn ? (sfAtk.hitstun || ((move.onHit && move.onHit.hitstun) || 0)) : ((move.onHit && move.onHit.hitstun) || 0),
      blockstun: sfOn ? (sfAtk.blockstun || ((move.onBlock && move.onBlock.blockstun) || 0)) : ((move.onBlock && move.onBlock.blockstun) || 0),
      advantage: stun - remainingRecovery,
      advOnHit: advHit,
      advOnBlock: advBlock,
      punishable: (isBlock ? advBlock : advHit) < 0,
      contactFrame: world.frame
    };

    if (trace) {
      trace.postLastExchangeWrite = {
        lastExchange: compactLastExchange(world)
      };
    }

    events.push({
      type: isBlock ? 'block' : 'hit',
      attacker: att.id,
      defender: def.id,
      moveId: move.id,
      damage: dmg,
      x: contactPx.x,
      y: contactPx.y,
      contactPx: contactPx,
      strength: strength,
      moveType: move.type || 'normal',
      isSpecial: move.type === 'special',
      advOnHit: advHit,
      advOnBlock: advBlock,
      punishable: (isBlock ? advBlock : advHit) < 0,
      contactFrame: world.frame
    });

    if (targetCombosEnabled(world, route) && tcfg.enabled && dial && dial.chainId !== '') {
      var cIdx = parseInt(dial.chainId, 10);
      if (isFinite(cIdx) && mkCombos[cIdx]) {
        var chain = mkCombos[cIdx];
        var idx = (dial.step <= 0) ? 0 : (dial.step - 1);
        if (chain[idx] === move.id && dial.step < chain.length) {
          dial.window = Math.max(1, Math.floor(tcfg.inputWindowFrames || 8));
        } else if (chain[idx] !== move.id) {
          mkResetDial(dial, route, 'consequence-mismatch');
        }
      } else {
        mkResetDial(dial, route, 'invalid-chain');
      }
    }

    if (trace) {
      trace.postSideEffects = {
        sideEffects: sideEffectSummary(world, att, def),
        attacker: compactFighter(att),
        defender: compactFighter(def)
      };
    }
  }

  function applyExchange(world, att, def, move, blocked, inputDef, events, contact, opts){
    var o = opts || {};
    var probe = o.probeOut || null;
    var forceLegacy = !!o.forceLegacyExchangeBridge;
    var ownerLegacy = forceLegacy || !!(world && world.__exchangeBridgeOwner === 'legacy');
    var canLegacy = typeof global._fightApplyExchange === 'function';
    var startIdx = events ? events.length : 0;
    var hitstopBefore = world && world.interaction ? (world.interaction.hitstop | 0) : 0;
    var defenderBefore = compactFighter(def);
    var attackerBefore = compactFighter(att);
    var sideBefore = sideEffectSummary(world, att, def);
    var moveId = String(move && move.id || '');
    var blockedBool = !!blocked;
    var contactCompact = compactContact(contact);
    var trace = { helperCalls: [], telemetryHelperCalls: [] };
    var executed = false;

    var entry = {
      frame: world ? (world.frame | 0) : 0,
      attacker: String(att && att.id || ''),
      defender: String(def && def.id || ''),
      moveId: moveId,
      blocked: blockedBool,
      contact: contactCompact,
      moveHitRegisteredBefore: att ? !!att.moveHitRegistered : false,
      attackerState: String(att && att.state || ''),
      defenderState: String(def && def.state || '')
    };

    if (probe) {
      probe.postEntry = entry;
      probe.postHandoffEntry = {
        attacker: entry.attacker,
        defender: entry.defender,
        moveId: entry.moveId,
        normalized: {
          blocked: blockedBool,
          hasContact: !!contactCompact,
          hasInputDef: !!inputDef
        },
        blocked: blockedBool,
        contact: contactCompact,
        moveHitRegisteredBefore: entry.moveHitRegisteredBefore
      };
    }

    if (ownerLegacy && canLegacy) {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'exchange',
        op: 'applyExchange',
        path: 'legacy',
        reason: forceLegacy ? 'forced-legacy-exchange-bridge' : 'owner-legacy-exchange-bridge',
        detail: moveId
      });
      var prevHint = global.__fightHitstopCallerHint;
      global.__fightHitstopCallerHint = 'exchange-legacy';
      try {
        global._fightApplyExchange(world, att, def, move, blocked, inputDef, events, contact);
        executed = true;
      } finally {
        global.__fightHitstopCallerHint = prevHint;
      }
    } else {
      applyExchangeModule(world, att, def, move, blocked, inputDef, events, contact, {
        trace: trace,
        forceLegacyHitstop: !!o.forceLegacyHitstop,
        hitstopProbeOut: o.hitstopProbeOut || null,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers
      });
      executed = true;
    }

    if (!executed) {
      if (probe) {
        probe.postHandoffResult = {
          exchangeCalled: false,
          eventDeltaNonEmpty: false
        };
      }
      return false;
    }

    var hitstopAfter = world && world.interaction ? (world.interaction.hitstop | 0) : 0;
    var delta = exchangeEventDigest(events, startIdx);
    var defenderAfter = compactFighter(def);
    var attackerAfter = compactFighter(att);
    var sideAfter = sideEffectSummary(world, att, def);

    if (probe) {
      probe.postBranchSelection = trace.postBranchSelection || {
        isBlock: blockedBool,
        branch: blockedBool ? 'block' : 'hit',
        strength: strengthFromMove(move),
        moveType: String(move && move.type || 'normal'),
        sfEnabled: !!(world && world.sf && world.sf.enabled),
        data: consequenceDataSummary(blockedBool ? ((move && move.onBlock) || {}) : ((move && move.onHit) || {}), sfAttackPreset(world, strengthFromMove(move)), !!(world && world.sf && world.sf.enabled), blockedBool)
      };
      probe.postMainMutation = trace.postMainMutation || {
        attacker: attackerAfter,
        defender: defenderAfter
      };
      probe.postLastExchangeWrite = trace.postLastExchangeWrite || {
        lastExchange: compactLastExchange(world)
      };
      probe.postSideEffects = trace.postSideEffects || {
        sideEffects: sideAfter,
        attacker: attackerAfter,
        defender: defenderAfter
      };
      probe.postEventEmission = {
        exchangeEvents: delta
      };
      probe.helperCalls = Array.isArray(trace.helperCalls) ? trace.helperCalls.slice() : [];
      probe.telemetryHelperCalls = Array.isArray(trace.telemetryHelperCalls) ? trace.telemetryHelperCalls.slice() : [];

      probe.postLegacyCall = {
        lastExchange: compactLastExchange(world),
        hitstopBefore: hitstopBefore,
        hitstopAfter: hitstopAfter,
        defenderBefore: defenderBefore,
        defenderAfter: defenderAfter,
        attackerBefore: attackerBefore,
        attackerAfter: attackerAfter,
        sideBefore: sideBefore,
        sideAfter: sideAfter
      };
      probe.exchangeEventDelta = delta;
      probe.postHandoffResult = {
        exchangeCalled: true,
        eventDeltaNonEmpty: !!delta.length
      };
    }

    return true;
  }

  function digestExchangeProbe(probe){
    var hm = hashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyExchangeBridgeDiffPath(path){
    var p = String(path || '');
    if (!p) return 'exchange-entry';
    if (p.indexOf('interaction.lastExchange') === 0) return 'last-exchange';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-bridge';
    if (p.indexOf('mkGba.comboDial') >= 0) return 'dial-side-effect';
    if (p.indexOf('l15Stats.round') >= 0) return 'telemetry-side-effect';
    if (p.indexOf('cornerToastUntilFrame') >= 0) return 'corner-pressure';
    if (p.indexOf('mkGba.juggle') >= 0 || p.indexOf('AirHitsTaken') >= 0) return 'juggle-side-effect';
    if (
      p.indexOf('dizzyFramesLeft') >= 0 ||
      p.indexOf('stunMeter') >= 0 ||
      p.indexOf('dizzyWarned') >= 0
    ) return 'dizzy-side-effect';
    if (p.indexOf('health') >= 0) return 'damage-write';
    if (p.indexOf('knockdownFramesLeft') >= 0) return 'knockdown-write';
    if (p.indexOf('hitstunFramesLeft') >= 0 || p.indexOf('blockstunFramesLeft') >= 0) return 'stun-write';
    if (p.indexOf('.x') >= 0) return 'pushback-write';
    if (p.indexOf('state') >= 0) return 'block-hit-branch';
    return 'exchange-event-order';
  }

  function hasType(arr, t){
    var i;
    var src = arr || [];
    for (i = 0; i < src.length; i++) {
      if (String(src[i] && src[i].t || '') === t) return true;
    }
    return false;
  }

  function classifyExchangeProbeMismatch(a, b){
    if (!a || !b) return 'exchange-event-order';

    var forced = String((a && a.__forcedKind) || (b && b.__forcedKind) || '');
    if (forced) return forced;

    var ea = a.postEntry || a.postHandoffEntry || {};
    var eb = b.postEntry || b.postHandoffEntry || {};
    if (
      String(ea.attacker || '') !== String(eb.attacker || '') ||
      String(ea.defender || '') !== String(eb.defender || '') ||
      String(ea.moveId || '') !== String(eb.moveId || '') ||
      JSON.stringify(ea.contact || null) !== JSON.stringify(eb.contact || null)
    ) return 'exchange-entry';
    if (!!ea.blocked !== !!eb.blocked) return 'block-hit-branch';

    var ba = a.postBranchSelection || {};
    var bb = b.postBranchSelection || {};
    if (String(ba.branch || '') !== String(bb.branch || '') || !!ba.isBlock !== !!bb.isBlock) {
      return 'block-hit-branch';
    }

    var bdA = ba.data || {};
    var bdB = bb.data || {};
    if ((bdA.damage | 0) !== (bdB.damage | 0)) return 'damage-write';
    if ((bdA.hitstun | 0) !== (bdB.hitstun | 0) || (bdA.blockstun | 0) !== (bdB.blockstun | 0)) return 'stun-write';
    if ((bdA.knockdown | 0) !== (bdB.knockdown | 0)) return 'knockdown-write';

    var ma = a.postMainMutation || {};
    var mb = b.postMainMutation || {};
    var da = ma.defender || {};
    var db = mb.defender || {};
    if ((da.health | 0) !== (db.health | 0)) return 'damage-write';
    if (
      (da.hitstunFramesLeft | 0) !== (db.hitstunFramesLeft | 0) ||
      (da.blockstunFramesLeft | 0) !== (db.blockstunFramesLeft | 0)
    ) return 'stun-write';
    if ((da.knockdownFramesLeft | 0) !== (db.knockdownFramesLeft | 0)) return 'knockdown-write';
    if ((da.x | 0) !== (db.x | 0)) return 'pushback-write';

    var lcA = a.postLegacyCall || {};
    var lcB = b.postLegacyCall || {};
    if ((lcA.hitstopBefore | 0) !== (lcB.hitstopBefore | 0) || (lcA.hitstopAfter | 0) !== (lcB.hitstopAfter | 0)) {
      return 'hitstop-bridge';
    }

    var lxA = (a.postLastExchangeWrite && a.postLastExchangeWrite.lastExchange) || lcA.lastExchange || null;
    var lxB = (b.postLastExchangeWrite && b.postLastExchangeWrite.lastExchange) || lcB.lastExchange || null;
    if (JSON.stringify(lxA) !== JSON.stringify(lxB)) return 'last-exchange';

    var sa = (a.postSideEffects && a.postSideEffects.sideEffects) || lcA.sideAfter || {};
    var sb = (b.postSideEffects && b.postSideEffects.sideEffects) || lcB.sideAfter || {};
    var tdA = sa.telemetry || {};
    var tdB = sb.telemetry || {};
    var dlA = sa.dial || {};
    var dlB = sb.dial || {};

    if ((sa.airHitsTaken | 0) !== (sb.airHitsTaken | 0)) return 'juggle-side-effect';
    if (!!sa.dizzyWarned !== !!sb.dizzyWarned) return 'dizzy-side-effect';
    if ((sa.cornerToastUntilFrame | 0) !== (sb.cornerToastUntilFrame | 0)) return 'corner-pressure';
    if (
      String(dlA.chainId || '') !== String(dlB.chainId || '') ||
      (dlA.step | 0) !== (dlB.step | 0) ||
      (dlA.window | 0) !== (dlB.window | 0)
    ) return 'dial-side-effect';
    if (JSON.stringify(tdA) !== JSON.stringify(tdB)) return 'telemetry-side-effect';

    var evA = a.exchangeEventDelta || [];
    var evB = b.exchangeEventDelta || [];
    if (JSON.stringify(evA) !== JSON.stringify(evB)) {
      if (hasType(evA, 'juggleCapReached') || hasType(evB, 'juggleCapReached')) return 'juggle-side-effect';
      if (hasType(evA, 'dizzyWarn') || hasType(evB, 'dizzyWarn')) return 'dizzy-side-effect';
      if (hasType(evA, 'cornerPressure') || hasType(evB, 'cornerPressure')) return 'corner-pressure';
      if (hasType(evA, 'hit') || hasType(evA, 'block') || hasType(evB, 'hit') || hasType(evB, 'block')) return 'exchange-event-order';
      return 'exchange-event-order';
    }

    var ra = a.postHandoffResult || {};
    var rb = b.postHandoffResult || {};
    if (!!ra.exchangeCalled !== !!rb.exchangeCalled) return 'exchange-entry';
    if (!!ra.eventDeltaNonEmpty !== !!rb.eventDeltaNonEmpty) return 'exchange-event-order';

    return 'exchange-event-order';
  }

  ns.core.exchange.bridge = {
    applyExchange: applyExchange,
    digestExchangeProbe: digestExchangeProbe,
    classifyExchangeBridgeDiffPath: classifyExchangeBridgeDiffPath,
    classifyExchangeProbeMismatch: classifyExchangeProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
