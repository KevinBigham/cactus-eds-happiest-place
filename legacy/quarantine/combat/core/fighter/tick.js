(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.fighter = ns.core.fighter || {};

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

  function buttons(){
    var c = constants();
    if (c && typeof c.buttons === 'function') return c.buttons();
    return global.FIGHT_BTN || { PUNCH: 1, KICK: 2, THROW: 4 };
  }

  function configFor(world){
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    if (world && world.cfg) return world.cfg;
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function consequenceHelpers(){
    return (ns.core && ns.core.consequence && ns.core.consequence.helpers) ? ns.core.consequence.helpers : null;
  }

  function safeDialDigest(dial){
    if (!dial) return null;
    return {
      chainId: String(dial.chainId || ''),
      step: dial.step | 0,
      window: dial.window | 0
    };
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
      ctx: String(route.context || 'fighter'),
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
      ctx: String(route && route.context || 'fighter'),
      path: 'forced'
    });
  }

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'fighter'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function targetCombosEnabled(world, route){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var reason = '';
    var ret;
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightTargetCombosEnabled === 'function') {
      fn = global._fightTargetCombosEnabled;
      path = 'legacy';
      reason = 'forced-legacy-dial-combo-helpers';
    } else if (hm && typeof hm.targetCombosEnabled === 'function') {
      fn = hm.targetCombosEnabled;
      if (legacy) reason = 'forced-legacy-helper-missing';
    } else if (typeof global._fightTargetCombosEnabled === 'function') {
      fn = global._fightTargetCombosEnabled;
      path = 'legacy';
      reason = 'module-dial-combo-helper-missing';
    } else {
      path = 'local';
      reason = legacy ? 'forced-legacy-and-module-dial-combo-helper-missing' : 'module-and-legacy-dial-combo-helper-missing';
      fn = function(localWorld){
        var cfg = configFor(localWorld);
        var tcfg = (cfg && cfg.targetCombos) || {};
        if (
          (typeof global._fightSfModeOn === 'function' && global._fightSfModeOn()) ||
          (localWorld && localWorld.sf && localWorld.sf.enabled)
        ) return false;
        if (!(localWorld && localWorld.mkGba && localWorld.mkGba.enabled && global.FEATURE_FLAGS && global.FEATURE_FLAGS.fightMkGbaTargetCombos)) {
          return false;
        }
        return tcfg.enabled !== false;
      };
    }
    ret = !!fn(world);
    if (forcedDialMismatch('targetCombosEnabled')) ret = !ret;
    pushDialHelperTrace(route, {
      name: 'targetCombosEnabled',
      ctx: String(route && route.context || 'fighter'),
      kind: 'gate',
      path: path,
      value: ret
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'fighter'),
        op: 'targetCombosEnabled',
        path: path,
        reason: reason || 'legacy-dial-combo-helper-route',
        detail: ''
      });
    }
    return ret;
  }

  function moveBridgeModule(){
    return (ns.core && ns.core.move && ns.core.move.bridge) ? ns.core.move.bridge : null;
  }

  function countBits(v){
    if (typeof global._fightCountBits === 'function') return global._fightCountBits(v | 0);
    var n = v | 0;
    var c = 0;
    while (n) {
      c += n & 1;
      n >>= 1;
    }
    return c;
  }

  function isButtonEdge(edge, btn){
    if (typeof global._fightIsButtonEdge === 'function') return !!global._fightIsButtonEdge(edge, btn);
    return !!(edge && (((edge.buttons | 0) & (btn | 0)) !== 0));
  }

  function dirToWorldHorizontal(dir, facing){
    if (typeof global._fightDirToWorldHorizontal === 'function') return global._fightDirToWorldHorizontal(dir, facing);
    var d = dir | 0;
    var rel = 0;
    if (d === 3 || d === 6 || d === 9) rel = 1;
    else if (d === 1 || d === 4 || d === 7) rel = -1;
    if (rel === 0) return 0;
    return (facing === 1) ? rel : -rel;
  }

  function dirIsUp(d){
    if (typeof global._fightDirIsUp === 'function') return !!global._fightDirIsUp(d);
    return d === 7 || d === 8 || d === 9;
  }

  function dirIsDown(d){
    if (typeof global._fightDirIsDown === 'function') return !!global._fightDirIsDown(d);
    return d === 1 || d === 2 || d === 3;
  }

  function abs(v){
    if (typeof global._fightAbs === 'function') return global._fightAbs(v);
    return v < 0 ? -v : v;
  }

  function fromPx(v){
    var c = constants();
    if (c && typeof c.fromPx === 'function') return c.fromPx(v);
    if (typeof global._fightFromPx === 'function') return global._fightFromPx(v);
    return Math.round(Number(v || 0) * Number(global.FIGHT_FP || 256));
  }

  function clamp(v, min, max){
    if (typeof global._fightClamp === 'function') return global._fightClamp(v, min, max);
    return v < min ? min : (v > max ? max : v);
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
      ctx: String(route && route.context || 'fighter'),
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
        ctx: String(route && route.context || 'fighter'),
        op: 'l15Bump',
        path: path,
        reason: reason || 'legacy-telemetry-helper-route',
        detail: String(key || '')
      });
    }
  }

  function l15WarnThreshold(world){
    if (typeof global._fightL15WarnThreshold === 'function') return global._fightL15WarnThreshold(world);
    var cfg = configFor(world);
    var stunCfg = (cfg && cfg.stun) || { threshold: 100 };
    var warnPct = (cfg && cfg.juice && cfg.juice.warnStunPct) || 0.82;
    return Math.floor((stunCfg.threshold || 100) * warnPct);
  }

  function mkDialState(world, fighter, route){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var reason = '';
    var ret;
    var slot = (!world || !world.mkGba || !world.mkGba.comboDial || !fighter) ? null : (world.mkGba.comboDial[fighter.id] || null);
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkDialState === 'function') {
      fn = global._fightMkDialState;
      path = 'legacy';
      reason = 'forced-legacy-dial-combo-helpers';
    } else if (hm && typeof hm.mkDialState === 'function') {
      fn = hm.mkDialState;
      if (legacy) reason = 'forced-legacy-helper-missing';
    } else if (typeof global._fightMkDialState === 'function') {
      fn = global._fightMkDialState;
      path = 'legacy';
      reason = 'module-dial-combo-helper-missing';
    } else {
      path = 'local';
      reason = legacy ? 'forced-legacy-and-module-dial-combo-helper-missing' : 'module-and-legacy-dial-combo-helper-missing';
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
      ctx: String(route && route.context || 'fighter'),
      kind: 'state-access',
      path: path,
      fighter: String(fighter && fighter.id || ''),
      sameSlot: ret === slot,
      dial: safeDialDigest(ret)
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'fighter'),
        op: 'mkDialState',
        path: path,
        reason: reason || 'legacy-dial-combo-helper-route',
        detail: String(fighter && fighter.id || '')
      });
    }
    return ret;
  }

  function mkResetDial(dial, route, reason){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var routeReason = '';
    var before = safeDialDigest(dial);
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkResetDial === 'function') {
      fn = global._fightMkResetDial;
      path = 'legacy';
      routeReason = 'forced-legacy-dial-combo-helpers';
    } else if (hm && typeof hm.mkResetDial === 'function') {
      fn = hm.mkResetDial;
      if (legacy) routeReason = 'forced-legacy-helper-missing';
    } else if (typeof global._fightMkResetDial === 'function') {
      fn = global._fightMkResetDial;
      path = 'legacy';
      routeReason = 'module-dial-combo-helper-missing';
    } else {
      path = 'local';
      routeReason = legacy ? 'forced-legacy-and-module-dial-combo-helper-missing' : 'module-and-legacy-dial-combo-helper-missing';
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
      ctx: String(route && route.context || 'fighter'),
      kind: 'reset',
      path: path,
      reason: String(reason || ''),
      before: before,
      after: safeDialDigest(dial)
    });
    if (path !== 'module' || routeReason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'fighter'),
        op: 'mkResetDial',
        path: path,
        reason: routeReason || 'legacy-dial-combo-helper-route',
        detail: String(reason || '')
      });
    }
  }

  function mkAirHitsKey(fid){
    if (typeof global._fightMkAirHitsKey === 'function') return global._fightMkAirHitsKey(fid);
    return fid === 'p1' ? 'p1AirHitsTaken' : 'p2AirHitsTaken';
  }

  function rosterMoveById(rosterKey, moveId){
    if (typeof global._fightRosterMoveById === 'function') return global._fightRosterMoveById(rosterKey, moveId);
    var roster = global.FIGHT_ROSTER && global.FIGHT_ROSTER[rosterKey];
    var i;
    if (!roster || !Array.isArray(roster.moves) || !moveId) return null;
    for (i = 0; i < roster.moves.length; i++) {
      if (roster.moves[i] && roster.moves[i].id === moveId) return roster.moves[i];
    }
    return null;
  }

  function useLegacyMoveBridge(world, opts){
    if (opts && opts.forceLegacyMoveBridge) return true;
    return !!(world && world.__moveBridgeOwner === 'legacy');
  }

  function getCancelWindowForProbe(world, fighter, curr){
    var mb = moveBridgeModule();
    if (mb && typeof mb.getCancelWindow === 'function') return mb.getCancelWindow(world, fighter, curr);
    if (typeof global._fightGetCancelWindow === 'function') return global._fightGetCancelWindow(world, fighter, curr);
    return null;
  }

  function canDoChargeMoveForProbe(world, fighter, move, input){
    if (!move || !move.charge) return null;
    if (typeof global._fightCanDoChargeMove === 'function') {
      return !!global._fightCanDoChargeMove(world, fighter, move, input);
    }
    var cp = ns.core && ns.core.input && ns.core.input.chargeParser;
    if (cp && typeof cp.canDoChargeMoveForLegacy === 'function') {
      return !!cp.canDoChargeMoveForLegacy(world, fighter, move, input);
    }
    return null;
  }

  function selectMove(world, fighter, input, edge, forCancel, events, opts){
    var mb = moveBridgeModule();
    var legacy = useLegacyMoveBridge(world, opts || {});
    if (!legacy && mb && typeof mb.selectMove === 'function') {
      return mb.selectMove(world, fighter, input, edge, forCancel, events, opts || {});
    }
    if (typeof global._fightSelectMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'selectMove',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-move-bridge' : 'module-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      return global._fightSelectMove(world, fighter, input, edge, forCancel, events);
    }
    if (mb && typeof mb.selectMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'selectMove',
        path: 'module',
        reason: 'forced-legacy-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      return mb.selectMove(world, fighter, input, edge, forCancel, events, opts || {});
    }
    pushRouteDiagnostic({
      frame: world ? (world.frame | 0) : 0,
      ctx: 'fighter',
      op: 'selectMove',
      path: 'unavailable',
      reason: 'move-bridge-unavailable',
      detail: String(fighter && fighter.id || '')
    });
    return null;
  }

  function startMove(world, fighter, opp, move, fromCancel, events, opts){
    var mb = moveBridgeModule();
    var legacy = useLegacyMoveBridge(world, opts || {});
    if (!legacy && mb && typeof mb.startMove === 'function') {
      mb.startMove(world, fighter, opp, move, fromCancel, events, opts || {});
      return;
    }
    if (typeof global._fightStartMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'startMove',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-move-bridge' : 'module-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      global._fightStartMove(world, fighter, opp, move, fromCancel, events);
      return;
    }
    if (mb && typeof mb.startMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'startMove',
        path: 'module',
        reason: 'forced-legacy-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      mb.startMove(world, fighter, opp, move, fromCancel, events, opts || {});
      return;
    }
    pushRouteDiagnostic({
      frame: world ? (world.frame | 0) : 0,
      ctx: 'fighter',
      op: 'startMove',
      path: 'unavailable',
      reason: 'move-bridge-unavailable',
      detail: String(fighter && fighter.id || '')
    });
  }

  function tickMove(world, fighter, input, edge, opts){
    var mb = moveBridgeModule();
    var legacy = useLegacyMoveBridge(world, opts || {});
    if (!legacy && mb && typeof mb.tickMove === 'function') {
      mb.tickMove(fighter, input, edge, opts || {});
      return;
    }
    if (typeof global._fightTickMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'tickMove',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-move-bridge' : 'module-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      global._fightTickMove(fighter, input, edge);
      return;
    }
    if (mb && typeof mb.tickMove === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'tickMove',
        path: 'module',
        reason: 'forced-legacy-move-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      mb.tickMove(fighter, input, edge, opts || {});
      return;
    }
    pushRouteDiagnostic({
      frame: world ? (world.frame | 0) : 0,
      ctx: 'fighter',
      op: 'tickMove',
      path: 'unavailable',
      reason: 'move-bridge-unavailable',
      detail: String(fighter && fighter.id || '')
    });
  }

  function clone(v){
    if (v === null || v === undefined) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function capturePostStatus(world, fighter, statusConsumed){
    return {
      frame: world ? (world.frame | 0) : 0,
      fighter: String((fighter && fighter.id) || ''),
      state: String((fighter && fighter.state) || ''),
      stateFrame: fighter ? (fighter.stateFrame | 0) : 0,
      hitstunFramesLeft: fighter ? (fighter.hitstunFramesLeft | 0) : 0,
      blockstunFramesLeft: fighter ? (fighter.blockstunFramesLeft | 0) : 0,
      knockdownFramesLeft: fighter ? (fighter.knockdownFramesLeft | 0) : 0,
      dizzyFramesLeft: fighter ? (fighter.dizzyFramesLeft | 0) : 0,
      throwTechFramesLeft: fighter ? (fighter.throwTechFramesLeft | 0) : 0,
      wakeupThrowInvulFramesLeft: fighter ? (fighter.wakeupThrowInvulFramesLeft | 0) : 0,
      invulnFramesLeft: fighter ? (fighter.invulnFramesLeft | 0) : 0,
      statusConsumed: !!statusConsumed
    };
  }

  function capturePostMoveBridge(world, fighter, dial){
    return {
      frame: world ? (world.frame | 0) : 0,
      fighter: String((fighter && fighter.id) || ''),
      moveId: String((fighter && fighter.moveId) || ''),
      moveFrame: fighter ? (fighter.moveFrame | 0) : 0,
      state: String((fighter && fighter.state) || ''),
      moveHitRegistered: !!(fighter && fighter.moveHitRegistered),
      lastMoveContact: String((fighter && fighter.lastMoveContact) || ''),
      lastParserDecision: clone((fighter && fighter.lastParserDecision) || null),
      dial: safeDialDigest(dial)
    };
  }

  function digestStartEvents(events, startIdx){
    var out = [];
    var arr = events || [];
    var i;
    for (i = startIdx | 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'dialChainStep' || t === 'comboCancel' || t === 'comboLink' || t === 'frameTrap') {
        out.push({
          type: t,
          fighter: String(ev.fighter || ''),
          moveId: String(ev.moveId || ''),
          motionType: String(ev.motionType || ''),
          chainId: String(ev.chainId || ''),
          step: (ev.step === undefined ? 0 : (ev.step | 0)),
          window: (ev.window === undefined ? 0 : (ev.window | 0)),
          gap: (ev.gap === undefined ? 0 : (ev.gap | 0)),
          frame: (ev.frame === undefined ? 0 : (ev.frame | 0))
        });
      }
    }
    return out;
  }

  function capturePostSelect(world, fighter, input, forCancel, selectedMove, currMove){
    var cwin = forCancel ? getCancelWindowForProbe(world, fighter, currMove) : null;
    var cwinClone = null;
    var inWindow = null;
    var typeAllowed = null;
    if (cwin) {
      cwinClone = {
        start: (cwin.start === undefined ? 0 : (cwin.start | 0)),
        end: (cwin.end === undefined ? 0 : (cwin.end | 0)),
        to: Array.isArray(cwin.to) ? cwin.to.slice(0) : []
      };
      inWindow = !((fighter.moveFrame | 0) < cwinClone.start || (fighter.moveFrame | 0) > cwinClone.end);
      if (selectedMove) typeAllowed = !(cwinClone.to && cwinClone.to.length) || cwinClone.to.indexOf(selectedMove.type) >= 0;
    }
    var chargePassed = canDoChargeMoveForProbe(world, fighter, selectedMove, input || { dir: 5, buttons: 0 });
    return {
      fighter: String((fighter && fighter.id) || ''),
      forCancel: !!forCancel,
      selectedMoveId: String((selectedMove && selectedMove.id) || ''),
      lastParserDecision: clone((fighter && fighter.lastParserDecision) || null),
      rejectedOrder: (fighter && fighter.lastParserDecision && Array.isArray(fighter.lastParserDecision.rejected))
        ? fighter.lastParserDecision.rejected.slice(0)
        : [],
      cancelWindowResult: {
        hasCurrentMove: !!currMove,
        window: cwinClone,
        inWindow: inWindow,
        typeAllowed: typeAllowed
      },
      chargeCheckResult: {
        applied: !!(selectedMove && selectedMove.charge),
        passed: !!(selectedMove && selectedMove.charge) ? !!chargePassed : null,
        moveId: String((selectedMove && selectedMove.id) || '')
      }
    };
  }

  function capturePostStart(fighter, fromCancel, events, eventStart){
    return {
      moveId: String((fighter && fighter.moveId) || ''),
      moveFrame: fighter ? (fighter.moveFrame | 0) : 0,
      state: String((fighter && fighter.state) || ''),
      stateFrame: fighter ? (fighter.stateFrame | 0) : 0,
      moveHitRegistered: !!(fighter && fighter.moveHitRegistered),
      lastMoveContact: String((fighter && fighter.lastMoveContact) || ''),
      fromCancel: !!fromCancel,
      startEvents: digestStartEvents(events || [], eventStart | 0)
    };
  }

  function captureTickBefore(fighter){
    return {
      moveId: String((fighter && fighter.moveId) || ''),
      moveFrame: fighter ? (fighter.moveFrame | 0) : 0,
      state: String((fighter && fighter.state) || '')
    };
  }

  function capturePostTick(fighter, before){
    var after = {
      moveId: String((fighter && fighter.moveId) || ''),
      moveFrame: fighter ? (fighter.moveFrame | 0) : 0,
      state: String((fighter && fighter.state) || '')
    };
    return {
      before: before || null,
      after: after,
      moveCleared: !!(before && before.moveId) && !after.moveId
    };
  }

  function capturePostMoveEnd(fighter){
    return {
      moveId: String((fighter && fighter.moveId) || ''),
      state: String((fighter && fighter.state) || ''),
      grounded: !!(fighter && fighter.grounded),
      moveHitRegistered: !!(fighter && fighter.moveHitRegistered)
    };
  }

  function capturePostMovement(world, fighter){
    return {
      frame: world ? (world.frame | 0) : 0,
      fighter: String((fighter && fighter.id) || ''),
      x: fighter ? (fighter.x | 0) : 0,
      y: fighter ? (fighter.y | 0) : 0,
      vx: fighter ? (fighter.vx | 0) : 0,
      vy: fighter ? (fighter.vy | 0) : 0,
      grounded: !!(fighter && fighter.grounded),
      state: String((fighter && fighter.state) || '')
    };
  }

  function capturePostLanding(world, fighter, wasGrounded){
    var key = mkAirHitsKey(fighter && fighter.id);
    var juggle = (world && world.mkGba && world.mkGba.juggle) ? world.mkGba.juggle : null;
    return {
      frame: world ? (world.frame | 0) : 0,
      fighter: String((fighter && fighter.id) || ''),
      grounded: !!(fighter && fighter.grounded),
      landingTransition: (!!fighter && !!fighter.grounded && !wasGrounded),
      airHitsTaken: juggle && key ? (juggle[key] | 0) : 0
    };
  }

  function writeFighterProbe(opts, fighterId, probe){
    if (!opts || !opts.fighterProbeOut || !fighterId) return;
    opts.fighterProbeOut[fighterId] = probe;
  }

  function tickStatus(world, fighter, edge){
    var st = states();
    var cfg = configFor(world);
    var stunCfg = (cfg && cfg.stun) || { mashReductionPerInput: 1, dizzyFrames: 120 };
    var throwCfg = (cfg && cfg.throw) || { wakeupThrowInvulFrames: 13 };
    var flags = world && world.l15Stats && world.l15Stats.flags ? world.l15Stats.flags : null;

    if (fighter.hitFlashFrames > 0) fighter.hitFlashFrames--;
    if (fighter.throwTechFramesLeft > 0) fighter.throwTechFramesLeft--;
    if (fighter.wakeupThrowInvulFramesLeft > 0) fighter.wakeupThrowInvulFramesLeft--;
    if (fighter.invulnFramesLeft > 0) fighter.invulnFramesLeft--;

    if (fighter.dizzyFramesLeft > 0) {
      var mash = countBits(edge ? edge.buttons : 0) + (((edge && edge.dir) !== 0) ? 1 : 0);
      fighter.dizzyFramesLeft -= 1 + (mash * (stunCfg.mashReductionPerInput || 1));
      fighter.state = st.DIZZY;
      if (fighter.dizzyFramesLeft <= 0) {
        fighter.dizzyFramesLeft = 0;
        fighter.state = st.IDLE;
        fighter.stunMeter = Math.floor((stunCfg.threshold || 100) * 0.5);
        if (flags && flags.dizzyWarned) flags.dizzyWarned[fighter.id] = false;
      }
      return true;
    }

    if (fighter.knockdownFramesLeft > 0) {
      fighter.knockdownFramesLeft--;
      fighter.state = (fighter.knockdownFramesLeft <= 12) ? st.WAKEUP : st.KNOCKDOWN;
      if (fighter.knockdownFramesLeft <= 0) {
        fighter.state = st.IDLE;
        fighter.wakeupThrowInvulFramesLeft = Math.max(
          fighter.wakeupThrowInvulFramesLeft,
          Math.floor(throwCfg.wakeupThrowInvulFrames || 13)
        );
      }
      return true;
    }

    if (fighter.hitstunFramesLeft > 0) {
      fighter.hitstunFramesLeft--;
      fighter.state = st.HITSTUN;
      if (fighter.hitstunFramesLeft <= 0) fighter.state = st.IDLE;
      return true;
    }

    if (fighter.blockstunFramesLeft > 0) {
      fighter.blockstunFramesLeft--;
      fighter.state = st.BLOCKSTUN;
      if (fighter.blockstunFramesLeft <= 0) fighter.state = st.IDLE;
      return true;
    }

    return false;
  }

  function tickMovement(world, fighter, input, route){
    var st = states();
    var roster = global.FIGHT_ROSTER && fighter ? global.FIGHT_ROSTER[fighter.rosterKey] : null;
    if (!roster || !fighter || !world || !world.stage) return;

    var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
    var in0 = input || { dir: 5, buttons: 0 };
    var hDir = dirToWorldHorizontal(in0.dir, fighter.facing);
    var canMove = !fighter.moveId || fighter.state === st.RECOVERY;

    if (fighter.grounded) {
      if (dirIsUp(in0.dir) && !fighter.moveId) {
        fighter.vy = roster.jumpVel;
        fighter.grounded = false;
        fighter.state = st.JUMP;
        if (rs) l15Bump(rs, 'jumps', fighter.id, 1, route);
      } else if (canMove && dirIsDown(in0.dir) && hDir === 0) {
        fighter.state = st.CROUCH;
        fighter.vx = Math.floor(fighter.vx * 0.75);
      } else if (canMove && hDir !== 0) {
        var target = hDir * roster.walkSpeed;
        fighter.vx += Math.floor((target - fighter.vx) * 0.34);
        if (!fighter.moveId) fighter.state = st.WALK;
      } else if (canMove) {
        fighter.vx = Math.floor(fighter.vx * 0.72);
        if (abs(fighter.vx) < fromPx(0.09)) fighter.vx = 0;
        if (!fighter.moveId) fighter.state = st.IDLE;
      }
    } else {
      fighter.vy = Math.min(fighter.vy + roster.gravity, roster.maxFall);
      if (canMove && hDir !== 0) {
        var airTarget = hDir * roster.airSpeed;
        fighter.vx += Math.floor((airTarget - fighter.vx) * 0.2);
      }
    }

    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    if (fighter.y >= world.stage.floor) {
      fighter.y = world.stage.floor;
      fighter.vy = 0;
      fighter.grounded = true;
      if (world.mkGba && world.mkGba.enabled && world.mkGba.juggle) {
        world.mkGba.juggle[mkAirHitsKey(fighter.id)] = 0;
      }
      if (!fighter.moveId && fighter.state === st.JUMP) fighter.state = st.IDLE;
    } else {
      fighter.grounded = false;
      if (!fighter.moveId && fighter.state !== st.HITSTUN && fighter.state !== st.BLOCKSTUN) {
        fighter.state = st.JUMP;
      }
    }

    fighter.x = clamp(fighter.x, world.stage.left, world.stage.right);
  }

  function tickFighter(world, fighter, opp, input, edge, events, opts){
    var move = null;
    var warnThreshold = l15WarnThreshold(world);
    var flags = world && world.l15Stats && world.l15Stats.flags ? world.l15Stats.flags : null;
    var cfg = configFor(world);
    var tcfg = (cfg && cfg.targetCombos) || { enabled: true, inputWindowFrames: 8, requireHitOrBlock: true };
    var probe = {
      postStatus: null,
      postMoveBridge: null,
      postMovement: null,
      postLanding: null,
      dialHelperCalls: [],
      telemetryHelperCalls: []
    };
    var moveProbe = {
      postSelect: null,
      postStart: null,
      postTick: null,
      postMoveEnd: null,
      dialHelperCalls: []
    };
    var wasGrounded = !!(fighter && fighter.grounded);
    var fighterDialRoute = {
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      trace: probe,
      context: 'fighter-tick'
    };
    var dial = mkDialState(world, fighter, fighterDialRoute);

    fighter.stateFrame++;

    if (dial && dial.window > 0) {
      dial.window--;
      if (dial.window <= 0) mkResetDial(dial, fighterDialRoute, 'window-expired');
    }

    var statusConsumed = tickStatus(world, fighter, edge || { dir: 0, buttons: 0 });
    probe.postStatus = capturePostStatus(world, fighter, statusConsumed);

    if (statusConsumed) {
      probe.postMoveBridge = capturePostMoveBridge(world, fighter, dial);
      probe.postMovement = capturePostMovement(world, fighter);
      probe.postLanding = capturePostLanding(world, fighter, wasGrounded);
      writeFighterProbe(opts, fighter.id, probe);
      if (opts && opts.moveProbeOut && fighter && fighter.id) {
        opts.moveProbeOut[fighter.id] = moveProbe;
      }
      return;
    }

    if (isButtonEdge(edge, buttons().THROW)) {
      fighter.throwTechFramesLeft = Math.max(
        fighter.throwTechFramesLeft,
        (cfg && cfg.throw && cfg.throw.techWindow) || 7
      );
    }

    if (fighter.moveId) {
      var currInMove = rosterMoveById(fighter.rosterKey, fighter.moveId);
      move = selectMove(world, fighter, input, edge, true, events, {
        forceLegacyMoveBridge: !!(opts && opts.forceLegacyMoveBridge),
        forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
        selectProbeOut: moveProbe
      });
      moveProbe.postSelect = capturePostSelect(world, fighter, input, true, move, currInMove);
      if (move) {
        var eventStartCancel = events ? events.length : 0;
        startMove(world, fighter, opp, move, true, events, opts || {});
        moveProbe.postStart = capturePostStart(fighter, true, events, eventStartCancel);
      }
      var beforeCancelTick = captureTickBefore(fighter);
      tickMove(world, fighter, input, edge, opts || {});
      moveProbe.postTick = capturePostTick(fighter, beforeCancelTick);
    } else {
      move = selectMove(world, fighter, input, edge, false, events, {
        forceLegacyMoveBridge: !!(opts && opts.forceLegacyMoveBridge),
        forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
        selectProbeOut: moveProbe
      });
      moveProbe.postSelect = capturePostSelect(world, fighter, input, false, move, null);
      if (move) {
        var eventStartNeutral = events ? events.length : 0;
        startMove(world, fighter, opp, move, false, events, opts || {});
        moveProbe.postStart = capturePostStart(fighter, false, events, eventStartNeutral);
      }
      if (fighter.moveId) {
        var beforeNeutralTick = captureTickBefore(fighter);
        tickMove(world, fighter, input, edge, opts || {});
        moveProbe.postTick = capturePostTick(fighter, beforeNeutralTick);
      } else {
        moveProbe.postTick = capturePostTick(fighter, captureTickBefore(fighter));
      }
    }
    moveProbe.postMoveEnd = capturePostMoveEnd(fighter);

    probe.postMoveBridge = capturePostMoveBridge(world, fighter, dial);

    if (targetCombosEnabled(world, fighterDialRoute) && dial && dial.chainId !== '' && dial.window <= 0 && !fighter.moveId && tcfg.requireHitOrBlock) {
      mkResetDial(dial, fighterDialRoute, 'require-hit-or-block');
    }

    tickMovement(world, fighter, input, fighterDialRoute);
    probe.postMovement = capturePostMovement(world, fighter);

    if (
      fighter.hitstunFramesLeft <= 0 &&
      fighter.blockstunFramesLeft <= 0 &&
      fighter.dizzyFramesLeft <= 0 &&
      fighter.stunMeter > 0
    ) {
      fighter.stunMeter = Math.max(0, fighter.stunMeter - ((cfg && cfg.stun && cfg.stun.decayPerFrame) || 1));
      if (flags && fighter.stunMeter < warnThreshold && flags.dizzyWarned) {
        flags.dizzyWarned[fighter.id] = false;
      }
    }

    probe.postLanding = capturePostLanding(world, fighter, wasGrounded);
    writeFighterProbe(opts, fighter.id, probe);
    if (opts && opts.moveProbeOut && fighter && fighter.id) {
      opts.moveProbeOut[fighter.id] = moveProbe;
    }
  }

  function digestFighterProbe(probe){
    var hm = ns.core && ns.core.world && ns.core.world.hash ? ns.core.world.hash : null;
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyFighterDiffPath(path){
    var p = String(path || '');
    if (!p) return 'status-tick';
    if (
      p.indexOf('hitstunFramesLeft') >= 0 ||
      p.indexOf('blockstunFramesLeft') >= 0 ||
      p.indexOf('knockdownFramesLeft') >= 0 ||
      p.indexOf('dizzyFramesLeft') >= 0 ||
      p.indexOf('throwTechFramesLeft') >= 0 ||
      p.indexOf('invulnFramesLeft') >= 0 ||
      p.indexOf('wakeupThrowInvulFramesLeft') >= 0 ||
      p.indexOf('hitFlashFrames') >= 0 ||
      p.indexOf('stunMeter') >= 0
    ) return 'status-tick';
    if (p.indexOf('lastParserDecision') >= 0) return 'move-select-bridge';
    if (p.indexOf('moveId') >= 0) return 'move-start-bridge';
    if (p.indexOf('moveFrame') >= 0 || p.indexOf('moveHitRegistered') >= 0 || p.indexOf('lastMoveContact') >= 0) return 'move-tick-bridge';
    if (p.indexOf('grounded') >= 0) return 'grounded-state';
    if (p.indexOf('juggle') >= 0) return 'landing';
    if (
      p.indexOf('.x') >= 0 ||
      p.indexOf('.y') >= 0 ||
      p.indexOf('.vx') >= 0 ||
      p.indexOf('.vy') >= 0
    ) return 'movement-tick';
    return 'fighter-event-order';
  }

  function classifySingleProbeMismatch(a, b){
    if (!a || !b) return 'fighter-event-order';
    var as = a.postStatus || {};
    var bs = b.postStatus || {};
    if (
      (as.hitstunFramesLeft | 0) !== (bs.hitstunFramesLeft | 0) ||
      (as.blockstunFramesLeft | 0) !== (bs.blockstunFramesLeft | 0) ||
      (as.knockdownFramesLeft | 0) !== (bs.knockdownFramesLeft | 0) ||
      (as.dizzyFramesLeft | 0) !== (bs.dizzyFramesLeft | 0) ||
      (as.throwTechFramesLeft | 0) !== (bs.throwTechFramesLeft | 0) ||
      (as.wakeupThrowInvulFramesLeft | 0) !== (bs.wakeupThrowInvulFramesLeft | 0) ||
      (as.invulnFramesLeft | 0) !== (bs.invulnFramesLeft | 0) ||
      !!as.statusConsumed !== !!bs.statusConsumed ||
      String(as.state || '') !== String(bs.state || '')
    ) return 'status-tick';

    var am = a.postMoveBridge || {};
    var bm = b.postMoveBridge || {};
    if (JSON.stringify(am.lastParserDecision || null) !== JSON.stringify(bm.lastParserDecision || null)) return 'move-select-bridge';
    if (String(am.moveId || '') !== String(bm.moveId || '')) return 'move-start-bridge';
    if (
      (am.moveFrame | 0) !== (bm.moveFrame | 0) ||
      !!am.moveHitRegistered !== !!bm.moveHitRegistered ||
      String(am.lastMoveContact || '') !== String(bm.lastMoveContact || '')
    ) return 'move-tick-bridge';

    var apm = a.postMovement || {};
    var bpm = b.postMovement || {};
    if (!!apm.grounded !== !!bpm.grounded) return 'grounded-state';
    if (
      (apm.x | 0) !== (bpm.x | 0) ||
      (apm.y | 0) !== (bpm.y | 0) ||
      (apm.vx | 0) !== (bpm.vx | 0) ||
      (apm.vy | 0) !== (bpm.vy | 0) ||
      String(apm.state || '') !== String(bpm.state || '')
    ) return 'movement-tick';

    var al = a.postLanding || {};
    var bl = b.postLanding || {};
    if (!!al.grounded !== !!bl.grounded) return 'grounded-state';
    if (
      !!al.landingTransition !== !!bl.landingTransition ||
      (al.airHitsTaken | 0) !== (bl.airHitsTaken | 0)
    ) return 'landing';

    return 'fighter-event-order';
  }

  function classifyFighterProbeMismatch(a, b){
    if (!a || !b) return 'fighter-event-order';
    if (a.p1 || b.p1 || a.p2 || b.p2) {
      var p1 = classifySingleProbeMismatch(a.p1, b.p1);
      if (p1 !== 'fighter-event-order') return p1;
      return classifySingleProbeMismatch(a.p2, b.p2);
    }
    return classifySingleProbeMismatch(a, b);
  }

  ns.core.fighter.tick = {
    tickFighter: tickFighter,
    tickStatus: tickStatus,
    tickMovement: tickMovement,
    digestFighterProbe: digestFighterProbe,
    classifyFighterDiffPath: classifyFighterDiffPath,
    classifyFighterProbeMismatch: classifyFighterProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
