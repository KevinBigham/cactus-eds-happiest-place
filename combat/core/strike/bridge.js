(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.strike = ns.core.strike || {};

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

  function toPx(v){
    var c = constants();
    if (c && typeof c.toPx === 'function') return c.toPx(v);
    if (typeof global._fightToPx === 'function') return global._fightToPx(v);
    var fp = Number(global.FIGHT_FP || 256);
    return Number(v || 0) / (fp > 0 ? fp : 256);
  }

  function emptyArr(v){
    if (typeof global._fightEmptyArr === 'function') return !!global._fightEmptyArr(v);
    return !v || !v.length;
  }

  function overlap(a, b){
    if (typeof global._fightOverlap === 'function') return !!global._fightOverlap(a, b);
    var gm = (ns.core && ns.core.spatial && ns.core.spatial.geometry) ? ns.core.spatial.geometry : null;
    if (gm && typeof gm.overlap === 'function') return !!gm.overlap(a, b);
    if (!a || !b) return false;
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
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

  function holdingBack(def, input){
    if (typeof global._fightHoldingBack === 'function') return !!global._fightHoldingBack(def, input);
    if (typeof global._fightDirIsBack === 'function') return !!global._fightDirIsBack(input ? input.dir : 5);
    var d = input ? (input.dir | 0) : 5;
    return d === 1 || d === 4 || d === 7;
  }

  function exchangeBridge(){
    return (ns.core && ns.core.exchange && ns.core.exchange.bridge) ? ns.core.exchange.bridge : null;
  }

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'strike'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function applyExchange(world, att, def, move, blocked, inputDef, events, contact, opts){
    var o = opts || {};
    var em = exchangeBridge();
    if (em && typeof em.applyExchange === 'function') {
      return !!em.applyExchange(world, att, def, move, blocked, inputDef, events, contact, {
        forceLegacyExchangeBridge: !!o.forceLegacyExchangeBridge,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
        probeOut: o.exchangeProbeOut || null
      });
    }
    if (typeof global._fightApplyExchange === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'strike',
        op: 'applyExchange',
        path: 'legacy',
        reason: 'module-exchange-bridge-missing',
        detail: String(move && move.id || '')
      });
      global._fightApplyExchange(world, att, def, move, blocked, inputDef, events, contact);
      return true;
    }
    pushRouteDiagnostic({
      frame: world ? (world.frame | 0) : 0,
      ctx: 'strike',
      op: 'applyExchange',
      path: 'unavailable',
      reason: 'exchange-bridge-unavailable',
      detail: String(move && move.id || '')
    });
    return false;
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

  function digestBranchEvents(events, startIdx){
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
          m: String(ev.moveId || ''),
          x: (ev.x === undefined ? 0 : (ev.x | 0)),
          y: (ev.y === undefined ? 0 : (ev.y | 0))
        });
      }
    }
    return out;
  }

  function detectContact(att, def, opts){
    var i, j, hb, hu, cx, cy;
    var o = opts || {};
    var probe = o.probeOut || null;
    var scannedHit = 0;
    var scannedHurt = 0;

    if (emptyArr(att && att.boxes ? att.boxes.hit : null) || emptyArr(def && def.boxes ? def.boxes.hurt : null)) {
      if (probe) {
        probe.postContactDetect = {
          contactFound: false,
          contact: null,
          hitIndex: -1,
          hurtIndex: -1,
          scannedHitBoxes: (att && att.boxes && att.boxes.hit ? att.boxes.hit.length : 0) | 0,
          scannedHurtBoxes: (def && def.boxes && def.boxes.hurt ? def.boxes.hurt.length : 0) | 0
        };
      }
      return null;
    }

    for (i = 0; i < att.boxes.hit.length; i++) {
      hb = att.boxes.hit[i];
      scannedHit++;
      for (j = 0; j < def.boxes.hurt.length; j++) {
        hu = def.boxes.hurt[j];
        scannedHurt++;
        if (overlap(hb, hu)) {
          cx = (Math.max(hb.x1, hu.x1) + Math.min(hb.x2, hu.x2)) * 0.5;
          cy = (Math.max(hb.y1, hu.y1) + Math.min(hb.y2, hu.y2)) * 0.5;
          var c = { x: toPx(cx), y: toPx(cy) };
          if (probe) {
            probe.postContactDetect = {
              contactFound: true,
              contact: { x: c.x, y: c.y },
              hitIndex: i | 0,
              hurtIndex: j | 0,
              scannedHitBoxes: scannedHit | 0,
              scannedHurtBoxes: scannedHurt | 0
            };
          }
          return c;
        }
      }
    }

    if (probe) {
      probe.postContactDetect = {
        contactFound: false,
        contact: null,
        hitIndex: -1,
        hurtIndex: -1,
        scannedHitBoxes: scannedHit | 0,
        scannedHurtBoxes: scannedHurt | 0
      };
    }
    return null;
  }

  function tryStrike(world, att, def, inputDef, events, opts){
    var move = rosterMoveById(att ? att.rosterKey : '', att ? att.moveId : '');
    var contact = null;
    var blocked = false;
    var st = states();
    var o = opts || {};
    var probe = o.probeOut || null;
    var eventStart = events ? events.length : 0;
    var gatePassed = true;
    var gateFailReason = '';
    var moveHitBefore = att ? !!att.moveHitRegistered : false;
    var exchangeCalled = false;

    if (!move) {
      gatePassed = false;
      gateFailReason = 'no-move';
    } else if (!att || att.state !== st.ACTIVE) {
      gatePassed = false;
      gateFailReason = 'not-active';
    } else if (move.type === 'throw') {
      gatePassed = false;
      gateFailReason = 'throw-move';
    } else if (att.moveHitRegistered && !move.multiHit) {
      gatePassed = false;
      gateFailReason = 'one-hit-gate';
    }

    if (probe) {
      probe.postStrikeGate = {
        attacker: String(att && att.id || ''),
        defender: String(def && def.id || ''),
        moveId: String(move && move.id || ''),
        attackerState: String(att && att.state || ''),
        gatePassed: gatePassed,
        gateFailReason: gateFailReason,
        moveHitRegisteredBefore: moveHitBefore,
        multiHit: !!(move && move.multiHit)
      };
    }

    if (!gatePassed) {
      if (probe) {
        probe.postStrikeResult = {
          exchangeCalled: false,
          moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
          lastExchange: compactLastExchange(world),
          branchEvents: digestBranchEvents(events, eventStart)
        };
      }
      return;
    }

    contact = detectContact(att, def, { probeOut: probe });
    if (!contact) {
      if (probe) {
        probe.preExchangeHandoff = {
          blocked: null,
          moveId: String(move.id || ''),
          attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
          moveHitRegisteredBeforeHandoff: att ? !!att.moveHitRegistered : false,
          contact: null
        };
        probe.postStrikeResult = {
          exchangeCalled: false,
          moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
          lastExchange: compactLastExchange(world),
          branchEvents: digestBranchEvents(events, eventStart)
        };
      }
      return;
    }

    blocked = holdingBack(def, inputDef) &&
      !!(def && def.grounded) &&
      def.state !== st.HITSTUN &&
      def.state !== st.KNOCKDOWN;

    if (probe) {
      probe.preExchangeHandoff = {
        blocked: !!blocked,
        moveId: String(move.id || ''),
        attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
        moveHitRegisteredBeforeHandoff: att ? !!att.moveHitRegistered : false,
        contact: { x: contact.x, y: contact.y }
      };
    }

    exchangeCalled = applyExchange(world, att, def, move, blocked, inputDef, events, contact, {
      forceLegacyExchangeBridge: !!o.forceLegacyExchangeBridge,
      forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
      forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
      forceLegacyTelemetryHelpers: !!o.forceLegacyTelemetryHelpers,
      exchangeProbeOut: o.exchangeProbeOut || null
    });
    if (exchangeCalled && att) att.moveHitRegistered = true;

    if (probe) {
      probe.postStrikeResult = {
        exchangeCalled: !!exchangeCalled,
        moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
        lastExchange: compactLastExchange(world),
        branchEvents: digestBranchEvents(events, eventStart)
      };
    }
  }

  function digestStrikeProbe(probe){
    var hm = ns.core && ns.core.world && ns.core.world.hash ? ns.core.world.hash : null;
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function classifyStrikeBridgeDiffPath(path){
    var p = String(path || '');
    if (!p) return 'strike-attempt';
    if (p.indexOf('moveHitRegistered') >= 0) return 'move-hit-registered';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-bridge';
    if (p.indexOf('interaction.lastExchange') === 0) return 'exchange-bridge';
    if (p.indexOf('boxes') >= 0) return 'contact-detect';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'active-frame';
    if (p.indexOf('health') >= 0 || p.indexOf('hitstun') >= 0 || p.indexOf('blockstun') >= 0 || p.indexOf('knockdown') >= 0) {
      return 'exchange-bridge';
    }
    return 'strike-event-order';
  }

  function classifySingleStrikeProbeMismatch(a, b){
    if (!a || !b) return 'strike-event-order';
    var ga = a.postStrikeGate || {};
    var gb = b.postStrikeGate || {};
    if (!!ga.gatePassed !== !!gb.gatePassed || String(ga.gateFailReason || '') !== String(gb.gateFailReason || '')) return 'strike-attempt';
    if (String(ga.attackerState || '') !== String(gb.attackerState || '')) return 'active-frame';
    if (!!ga.moveHitRegisteredBefore !== !!gb.moveHitRegisteredBefore) return 'move-hit-registered';

    var ca = a.postContactDetect || {};
    var cb = b.postContactDetect || {};
    if (!!ca.contactFound !== !!cb.contactFound) return 'contact-detect';
    if (JSON.stringify(ca.contact || null) !== JSON.stringify(cb.contact || null)) return 'contact-detect';
    if ((ca.hitIndex | 0) !== (cb.hitIndex | 0) || (ca.hurtIndex | 0) !== (cb.hurtIndex | 0)) return 'contact-detect';

    var ha = a.preExchangeHandoff || {};
    var hb = b.preExchangeHandoff || {};
    if (JSON.stringify(ha.contact || null) !== JSON.stringify(hb.contact || null)) return 'contact-detect';
    if (!!ha.blocked !== !!hb.blocked) return 'exchange-bridge';

    var ra = a.postStrikeResult || {};
    var rb = b.postStrikeResult || {};
    if (!!ra.exchangeCalled !== !!rb.exchangeCalled) return 'exchange-bridge';
    if (!!ra.moveHitRegisteredAfter !== !!rb.moveHitRegisteredAfter) return 'move-hit-registered';
    if (JSON.stringify(ra.lastExchange || null) !== JSON.stringify(rb.lastExchange || null)) return 'exchange-bridge';
    if (JSON.stringify(ra.branchEvents || []) !== JSON.stringify(rb.branchEvents || [])) return 'strike-event-order';
    return 'strike-event-order';
  }

  function classifyStrikeProbeMismatch(a, b){
    if (!a || !b) return 'strike-event-order';
    if (a.p1 || b.p1 || a.p2 || b.p2) {
      var p1a = (a.p1 && a.p1[0]) ? a.p1[0] : null;
      var p1b = (b.p1 && b.p1[0]) ? b.p1[0] : null;
      var c1 = classifySingleStrikeProbeMismatch(p1a, p1b);
      if (c1 !== 'strike-event-order') return c1;
      var p2a = (a.p2 && a.p2[0]) ? a.p2[0] : null;
      var p2b = (b.p2 && b.p2[0]) ? b.p2[0] : null;
      return classifySingleStrikeProbeMismatch(p2a, p2b);
    }
    return classifySingleStrikeProbeMismatch(a, b);
  }

  ns.core.strike.bridge = {
    tryStrike: tryStrike,
    detectContact: detectContact,
    digestStrikeProbe: digestStrikeProbe,
    classifyStrikeBridgeDiffPath: classifyStrikeBridgeDiffPath,
    classifyStrikeProbeMismatch: classifyStrikeProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
