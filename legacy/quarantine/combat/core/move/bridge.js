(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.move = ns.core.move || {};

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

  function clone(v){
    var c = constants();
    if (c && typeof c.clone === 'function') return c.clone(v);
    if (typeof global._fightClone === 'function') return global._fightClone(v);
    if (v === null || v === undefined) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function consequenceHelpers(){
    return (ns.core && ns.core.consequence && ns.core.consequence.helpers) ? ns.core.consequence.helpers : null;
  }

  function configFor(world){
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    if (world && world.cfg) return world.cfg;
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function sfEnabled(world){
    return !!(world && world.sf && world.sf.enabled);
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

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'move'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
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
      ctx: String(route.context || 'move'),
      kind: 'call-order',
      path: 'forced'
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
      ctx: String(route && route.context || 'move'),
      kind: 'gate',
      path: path,
      value: ret
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'move'),
        op: 'targetCombosEnabled',
        path: path,
        reason: reason || 'legacy-dial-combo-helper-route',
        detail: ''
      });
    }
    return ret;
  }

  function moveMotionType(move){
    if (!move) return 'none';
    if (move.motionType) return String(move.motionType);
    if (move.charge) return 'charge';
    if (move.motion && move.motion.length >= 3) {
      if (move.motion[0] === 6 && move.motion[1] === 2 && move.motion[2] === 3) return 'dp';
      if (move.motion[0] === 2 && move.motion[1] === 3 && move.motion[2] === 6) return 'qcf';
    }
    return 'none';
  }

  function parserPriorityRank(world, move){
    var mt = moveMotionType(move);
    var cfg = configFor(world);
    var pCfg = (cfg && cfg.sfParser && cfg.sfParser.priorityByMotionType) || {};
    var rank = Object.prototype.hasOwnProperty.call(pCfg, mt) ? pCfg[mt] : 99;
    var order = (cfg && cfg.inputPriority) || [];
    var oi = order.indexOf(mt);
    if (oi >= 0) rank = Math.min(rank, oi);
    if (mt === 'none') rank = 200;
    return rank;
  }

  function moveOrder(rosterKey){
    if (typeof global._fightMoveOrder === 'function') return global._fightMoveOrder(rosterKey);
    var r = global.FIGHT_ROSTER && global.FIGHT_ROSTER[rosterKey];
    var out = [];
    var i;
    if (!r || !Array.isArray(r.moves)) return out;
    for (i = 0; i < r.moves.length; i++) out.push(r.moves[i] && r.moves[i].id);
    return out;
  }

  function rosterMoveById(rosterKey, moveId){
    if (typeof global._fightRosterMoveById === 'function') return global._fightRosterMoveById(rosterKey, moveId);
    var r = global.FIGHT_ROSTER && global.FIGHT_ROSTER[rosterKey];
    var i;
    if (!r || !Array.isArray(r.moves) || !moveId) return null;
    for (i = 0; i < r.moves.length; i++) {
      if (r.moves[i] && r.moves[i].id === moveId) return r.moves[i];
    }
    return null;
  }

  function dirIsDown(d){
    if (typeof global._fightDirIsDown === 'function') return !!global._fightDirIsDown(d);
    return d === 1 || d === 2 || d === 3;
  }

  function parseMotion(history, motion, windowFrames, leniency){
    if (typeof global._fightParseMotion === 'function') {
      return !!global._fightParseMotion(history, motion, windowFrames, leniency);
    }
    var mp = ns.core && ns.core.input && ns.core.input.motionParser;
    if (mp && typeof mp.parseMotionLegacy === 'function') {
      return !!mp.parseMotionLegacy(history || [], motion || [], windowFrames, leniency || {});
    }
    return false;
  }

  function canDoChargeMove(world, fighter, move, input){
    if (typeof global._fightCanDoChargeMove === 'function') {
      return !!global._fightCanDoChargeMove(world, fighter, move, input);
    }
    var cp = ns.core && ns.core.input && ns.core.input.chargeParser;
    if (cp && typeof cp.canDoChargeMoveForLegacy === 'function') {
      return !!cp.canDoChargeMoveForLegacy(world, fighter, move, input);
    }
    return false;
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
      if (ret && typeof ret === 'object') {
        ret = { chainId: String(ret.chainId || ''), step: ret.step | 0, window: ret.window | 0, __forcedDialState: true };
      } else {
        ret = { chainId: '', step: 0, window: 0, __forcedDialState: true };
      }
    }
    pushDialHelperTrace(route, {
      name: 'mkDialState',
      ctx: String(route && route.context || 'move'),
      kind: 'state-access',
      path: path,
      fighter: String(fighter && fighter.id || ''),
      sameSlot: ret === slot,
      dial: safeDialState(ret)
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'move'),
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
    var before = safeDialState(dial);
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
      ctx: String(route && route.context || 'move'),
      kind: 'reset',
      path: path,
      reason: String(reason || ''),
      before: before,
      after: safeDialState(dial)
    });
    if (path !== 'module' || routeReason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'move'),
        op: 'mkResetDial',
        path: path,
        reason: routeReason || 'legacy-dial-combo-helper-route',
        detail: String(reason || '')
      });
    }
  }

  function mkCombosFor(rosterKey, route){
    var hm = consequenceHelpers();
    var legacy = !!(route && route.forceLegacyDialComboHelpers);
    var fn = null;
    var path = 'module';
    var reason = '';
    var ret;
    maybeForceDialCallOrder(route);
    if (legacy && typeof global._fightMkCombosFor === 'function') {
      fn = global._fightMkCombosFor;
      path = 'legacy';
      reason = 'forced-legacy-dial-combo-helpers';
    } else if (hm && typeof hm.mkCombosFor === 'function') {
      fn = hm.mkCombosFor;
      if (legacy) reason = 'forced-legacy-helper-missing';
    } else if (typeof global._fightMkCombosFor === 'function') {
      fn = global._fightMkCombosFor;
      path = 'legacy';
      reason = 'module-dial-combo-helper-missing';
    } else {
      path = 'local';
      reason = legacy ? 'forced-legacy-and-module-dial-combo-helper-missing' : 'module-and-legacy-dial-combo-helper-missing';
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
      ctx: String(route && route.context || 'move'),
      kind: 'combo-lookup',
      path: path,
      rosterKey: String(rosterKey || ''),
      comboCount: Array.isArray(ret) ? (ret.length | 0) : 0,
      comboDigest: comboDigest(ret)
    });
    if (path !== 'module' || reason) {
      pushRouteDiagnostic({
        ctx: String(route && route.context || 'move'),
        op: 'mkCombosFor',
        path: path,
        reason: reason || 'legacy-dial-combo-helper-route',
        detail: String(rosterKey || '')
      });
    }
    return ret;
  }

  function mkCanSelectMove(world, fighter, move, events, route){
    var cfg = configFor(world);
    var tcfg = (cfg && cfg.targetCombos) || { enabled: true, inputWindowFrames: 8, requireHitOrBlock: true };
    var d, combos, ci, chain, expected, nextStep;

    if (!targetCombosEnabled(world, route) || !tcfg.enabled) return true;
    d = mkDialState(world, fighter, route);
    if (!d) return true;
    combos = mkCombosFor(fighter.rosterKey, route);

    if (d.window > 0 && d.chainId !== '') {
      ci = parseInt(d.chainId, 10);
      if (!isFinite(ci) || !combos[ci]) {
        mkResetDial(d, route, 'invalid-chain');
        return true;
      }
      chain = combos[ci];
      expected = chain[d.step];
      if (expected && move.id !== expected) return false;
      if (expected && move.id === expected) {
        nextStep = d.step + 1;
        d.step = nextStep;
        d.window = 0;
        if (events) {
          events.push({ type: 'dialChainStep', fighter: fighter.id, chainId: String(ci), step: nextStep, moveId: move.id });
        }
        if (nextStep >= chain.length) mkResetDial(d, route, 'chain-complete');
        return true;
      }
    }

    if (d.chainId === '') {
      for (ci = 0; ci < combos.length; ci++) {
        chain = combos[ci];
        if (chain && chain.length && chain[0] === move.id) {
          d.chainId = String(ci);
          d.step = 1;
          d.window = 0;
          break;
        }
      }
    }

    return true;
  }

  function getCancelWindow(world, fighter, curr){
    if (!curr) return null;
    if (!sfEnabled(world)) {
      return curr.cancelWindow || curr.cancelOnHit || null;
    }
    if (fighter.lastMoveContact === 'hit') return curr.cancelOnHit || null;
    if (fighter.lastMoveContact === 'block') return curr.cancelOnBlock || null;
    return curr.cancelOnWhiff || null;
  }

  function buildSelectProbe(fighter, forCancel, selectedMove, currMove, cwin, input, chargePassed){
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
      if (selectedMove) {
        typeAllowed = !(cwinClone.to && cwinClone.to.length) || cwinClone.to.indexOf(selectedMove.type) >= 0;
      }
    }

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
        passed: (selectedMove && selectedMove.charge) ? !!chargePassed : null,
        moveId: String((selectedMove && selectedMove.id) || '')
      },
      input: {
        dir: input ? (input.dir | 0) : 5,
        buttons: input ? (input.buttons | 0) : 0
      }
    };
  }

  function selectMove(world, fighter, input, edge, forCancel, events, opts){
    var order = moveOrder(fighter.rosterKey);
    var i, move, cwin, curr, cand = [];
    var cfg = configFor(world);
    var sfOn = sfEnabled(world);
    var attackEdge = (edge.buttons | 0) & (buttons().PUNCH | buttons().KICK | buttons().THROW);
    var picked = null;
    var rej = [];
    var ri;
    var chargePassed = null;
    var probeOut = opts && opts.selectProbeOut;
    var dialRoute = {
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      trace: probeOut || null,
      context: forCancel ? 'move-select-cancel' : 'move-select'
    };

    if (!attackEdge) {
      fighter.lastParserDecision = { motionType: 'none', moveId: '', rejected: [] };
      if (probeOut) {
        probeOut.postSelect = buildSelectProbe(fighter, forCancel, null, null, null, input, null);
      }
      return null;
    }

    curr = rosterMoveById(fighter.rosterKey, fighter.moveId);

    for (i = 0; i < order.length; i++) {
      move = rosterMoveById(fighter.rosterKey, order[i]);
      if (!move) continue;
      if (move.button && !(attackEdge & move.button)) continue;
      if (move.airOnly && fighter.grounded) continue;
      if (move.groundOnly && !fighter.grounded) continue;
      if (move.requireCrouch && !dirIsDown(input.dir)) continue;
      if (move.motion && !parseMotion(fighter.inputHistory, move.motion, (move.motionWindowFrames || cfg.motionWindowFrames || 12), cfg.leniency)) continue;
      if (move.charge && !canDoChargeMove(world, fighter, move, input)) continue;
      if (forCancel) {
        cwin = getCancelWindow(world, fighter, curr);
        if (!curr || !cwin) continue;
        if (fighter.moveFrame < cwin.start || fighter.moveFrame > cwin.end) continue;
        if (cwin.to && cwin.to.length && cwin.to.indexOf(move.type) < 0) continue;
      }
      if (!mkCanSelectMove(world, fighter, move, events, dialRoute)) continue;
      cand.push(move);
    }

    if (!cand.length) {
      fighter.lastParserDecision = { motionType: 'none', moveId: '', rejected: [] };
      if (probeOut) {
        probeOut.postSelect = buildSelectProbe(fighter, forCancel, null, curr, getCancelWindow(world, fighter, curr), input, null);
      }
      return null;
    }

    if (!sfOn) {
      picked = cand[0];
      fighter.lastParserDecision = { motionType: moveMotionType(picked), moveId: picked.id, rejected: [] };
      chargePassed = picked.charge ? canDoChargeMove(world, fighter, picked, input) : null;
      if (probeOut) {
        probeOut.postSelect = buildSelectProbe(fighter, forCancel, picked, curr, getCancelWindow(world, fighter, curr), input, chargePassed);
      }
      return picked;
    }

    cand.sort(function(a, b){
      var pa = parserPriorityRank(world, a);
      var pb = parserPriorityRank(world, b);
      if (pa !== pb) return pa - pb;
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

    picked = cand[0];
    for (ri = 1; ri < cand.length; ri++) rej.push(cand[ri].id + ':' + moveMotionType(cand[ri]));
    fighter.lastParserDecision = { motionType: moveMotionType(picked), moveId: picked.id, rejected: rej };
    chargePassed = picked.charge ? canDoChargeMove(world, fighter, picked, input) : null;

    if (probeOut) {
      probeOut.postSelect = buildSelectProbe(fighter, forCancel, picked, curr, getCancelWindow(world, fighter, curr), input, chargePassed);
    }

    return picked;
  }

  function startMove(world, fighter, opp, move, fromCancel, events, opts){
    if (!move) return;

    var sfOn = sfEnabled(world);
    var startup = (move.startup || 0);
    var probeOut = opts && opts.startProbeOut;
    var eventStart = events ? events.length : 0;

    fighter.lastMoveContact = 'whiff';
    fighter.moveId = move.id;
    fighter.moveFrame = 0;
    fighter.state = (move.type === 'throw') ? states().THROW : states().STARTUP;
    fighter.stateFrame = 0;
    fighter.moveHitRegistered = false;

    if (sfOn && events) {
      if (fromCancel) {
        events.push({ type: 'comboCancel', fighter: fighter.id, moveId: move.id, motionType: moveMotionType(move), frame: world.frame });
      } else {
        if (opp && opp.hitstunFramesLeft > 0 && startup <= opp.hitstunFramesLeft) {
          events.push({ type: 'comboLink', fighter: fighter.id, moveId: move.id, window: opp.hitstunFramesLeft - startup, frame: world.frame });
        }
        if (opp && opp.blockstunFramesLeft > 0) {
          var gap = startup - opp.blockstunFramesLeft;
          if (gap > 0 && gap <= 6) {
            events.push({ type: 'frameTrap', fighter: fighter.id, moveId: move.id, gap: gap, frame: world.frame });
          }
        }
      }
    }

    if (probeOut) {
      probeOut.postStart = {
        moveId: String(fighter.moveId || ''),
        moveFrame: fighter.moveFrame | 0,
        state: String(fighter.state || ''),
        stateFrame: fighter.stateFrame | 0,
        moveHitRegistered: !!fighter.moveHitRegistered,
        lastMoveContact: String(fighter.lastMoveContact || ''),
        fromCancel: !!fromCancel,
        startEvents: (events ? events.slice(eventStart) : []).map(function(ev){
          return {
            type: String(ev.type || ''),
            fighter: String(ev.fighter || ''),
            moveId: String(ev.moveId || ''),
            motionType: String(ev.motionType || ''),
            chainId: String(ev.chainId || ''),
            step: (ev.step === undefined ? 0 : (ev.step | 0)),
            window: (ev.window === undefined ? 0 : (ev.window | 0)),
            gap: (ev.gap === undefined ? 0 : (ev.gap | 0)),
            frame: (ev.frame === undefined ? 0 : (ev.frame | 0))
          };
        })
      };
    }
  }

  function tickMove(fighter, input, edge, opts){
    var move = rosterMoveById(fighter.rosterKey, fighter.moveId);
    var total;
    var probeOut = opts && opts.tickProbeOut;
    var before = probeOut ? {
      moveId: String(fighter.moveId || ''),
      moveFrame: fighter.moveFrame | 0,
      state: String(fighter.state || '')
    } : null;

    if (!move) {
      fighter.moveId = null;
      fighter.moveFrame = 0;
      if (probeOut) {
        probeOut.postTick = {
          before: before,
          after: { moveId: '', moveFrame: 0, state: String(fighter.state || '') },
          moveCleared: true
        };
        probeOut.postMoveEnd = {
          moveId: '',
          state: String(fighter.state || ''),
          grounded: !!fighter.grounded,
          moveHitRegistered: !!fighter.moveHitRegistered
        };
      }
      return;
    }

    fighter.moveFrame++;
    total = move.totalFrames || 0;

    if (fighter.moveFrame <= move.startup) {
      fighter.state = (move.type === 'throw') ? states().THROW : states().STARTUP;
    } else if (fighter.moveFrame <= move.startup + move.active) {
      fighter.state = (move.type === 'throw') ? states().THROW : states().ACTIVE;
    } else if (fighter.moveFrame <= total) {
      fighter.state = states().RECOVERY;
    } else {
      fighter.moveId = null;
      fighter.moveFrame = 0;
      fighter.moveHitRegistered = false;
      fighter.state = fighter.grounded ? states().IDLE : states().JUMP;
    }

    if (probeOut) {
      var after = {
        moveId: String(fighter.moveId || ''),
        moveFrame: fighter.moveFrame | 0,
        state: String(fighter.state || '')
      };
      var cleared = !!before.moveId && !after.moveId;
      probeOut.postTick = { before: before, after: after, moveCleared: cleared };
      probeOut.postMoveEnd = {
        moveId: after.moveId,
        state: after.state,
        grounded: !!fighter.grounded,
        moveHitRegistered: !!fighter.moveHitRegistered
      };
    }
  }

  function digestMoveProbe(probe){
    var hm = ns.core && ns.core.world && ns.core.world.hash ? ns.core.world.hash : null;
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyMoveBridgeDiffPath(path){
    var p = String(path || '');
    if (!p) return 'move-select';
    if (p.indexOf('lastParserDecision') >= 0) return 'parser-decision';
    if (p.indexOf('moveHitRegistered') >= 0 || p.indexOf('lastMoveContact') >= 0 || p.indexOf('moveFrame') >= 0) return 'move-tick';
    if (p.indexOf('moveId') >= 0 || p.indexOf('stateFrame') >= 0) return 'move-start';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'move-end';
    if (p.indexOf('charge') >= 0) return 'charge-check';
    return 'move-event-order';
  }

  function classifySingleMoveProbeMismatch(a, b){
    if (!a || !b) return 'move-event-order';

    var sa = a.postSelect || {};
    var sb = b.postSelect || {};
    if (String(sa.selectedMoveId || '') !== String(sb.selectedMoveId || '')) return 'move-select';
    if (JSON.stringify(sa.lastParserDecision || null) !== JSON.stringify(sb.lastParserDecision || null)) return 'parser-decision';
    if (JSON.stringify(sa.cancelWindowResult || null) !== JSON.stringify(sb.cancelWindowResult || null)) return 'cancel-window';
    if (JSON.stringify(sa.chargeCheckResult || null) !== JSON.stringify(sb.chargeCheckResult || null)) return 'charge-check';

    var sta = a.postStart || {};
    var stb = b.postStart || {};
    if (
      String(sta.moveId || '') !== String(stb.moveId || '') ||
      (sta.moveFrame | 0) !== (stb.moveFrame | 0) ||
      String(sta.state || '') !== String(stb.state || '') ||
      (sta.stateFrame | 0) !== (stb.stateFrame | 0) ||
      !!sta.moveHitRegistered !== !!stb.moveHitRegistered ||
      String(sta.lastMoveContact || '') !== String(stb.lastMoveContact || '') ||
      !!sta.fromCancel !== !!stb.fromCancel
    ) return 'move-start';

    if (JSON.stringify(sta.startEvents || []) !== JSON.stringify(stb.startEvents || [])) return 'move-event-order';

    var ta = a.postTick || {};
    var tb = b.postTick || {};
    if (JSON.stringify(ta) !== JSON.stringify(tb)) return 'move-tick';

    var ea = a.postMoveEnd || {};
    var eb = b.postMoveEnd || {};
    if (JSON.stringify(ea) !== JSON.stringify(eb)) return 'move-end';

    return 'move-event-order';
  }

  function classifyMoveProbeMismatch(a, b){
    if (!a || !b) return 'move-event-order';
    if (a.p1 || b.p1 || a.p2 || b.p2) {
      var p1 = classifySingleMoveProbeMismatch(a.p1, b.p1);
      if (p1 !== 'move-event-order') return p1;
      return classifySingleMoveProbeMismatch(a.p2, b.p2);
    }
    return classifySingleMoveProbeMismatch(a, b);
  }

  ns.core.move.bridge = {
    selectMove: selectMove,
    startMove: startMove,
    tickMove: tickMove,
    mkCanSelectMove: mkCanSelectMove,
    getCancelWindow: getCancelWindow,
    parserPriorityRank: parserPriorityRank,
    moveMotionType: moveMotionType,
    digestMoveProbe: digestMoveProbe,
    classifyMoveBridgeDiffPath: classifyMoveBridgeDiffPath,
    classifyMoveProbeMismatch: classifyMoveProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
