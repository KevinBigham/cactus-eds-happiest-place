(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.sim = ns.core.sim || {};

  function resolveLegacy(explicitLegacy){
    var legacy = explicitLegacy || global.__FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE;
    if (legacy && legacy.__isAdapter && legacy.__legacy) legacy = legacy.__legacy;
    return legacy;
  }

  function legacyStep(world, frameInputs, explicitLegacy) {
    var legacy = resolveLegacy(explicitLegacy);
    if (legacy && typeof legacy.step === 'function') {
      return legacy.step(world, normalizeFrameInput(frameInputs || neutralFrameInput()));
    }
    if (typeof global._fightEngineStep === 'function') {
      return global._fightEngineStep(world, normalizeFrameInput(frameInputs || neutralFrameInput()));
    }
    throw new Error('combat.step: legacy step unavailable');
  }

  function constants(){
    return (ns.core && ns.core.constants) || null;
  }

  function phases(){
    var c = constants();
    if (c && typeof c.phases === 'function') return c.phases();
    return global.FIGHT_PHASES || {
      INTRO:'INTRO', ROUND_ANNOUNCE:'ROUND_ANNOUNCE', FIGHT_START:'FIGHT_START', FIGHT:'FIGHT', KO:'KO', WIN:'WIN', LOSE:'LOSE'
    };
  }

  function neutralInput(){
    var c = constants();
    if (c && typeof c.neutralInput === 'function') return c.neutralInput();
    if (typeof global._fightNeutralInput === 'function') return global._fightNeutralInput();
    return { dir: 5, buttons: 0 };
  }

  function neutralFrameInput() {
    var c = constants();
    if (c && typeof c.neutralFrameInput === 'function') return c.neutralFrameInput();
    if (typeof global._fightNeutralFrameInput === 'function') return global._fightNeutralFrameInput();
    return { p1: neutralInput(), p2: neutralInput() };
  }

  function fromPx(v){
    var c = constants();
    if (c && typeof c.fromPx === 'function') return c.fromPx(v);
    if (typeof global._fightFromPx === 'function') return global._fightFromPx(v);
    return Math.round(Number(v || 0) * Number(global.FIGHT_FP || 256));
  }

  function toPx(v){
    var c = constants();
    if (c && typeof c.toPx === 'function') return c.toPx(v);
    if (typeof global._fightToPx === 'function') return global._fightToPx(v);
    return Number(v || 0) / Number(global.FIGHT_FP || 256);
  }

  function normalizeFrameInput(fi){
    var src = fi || neutralFrameInput();
    var p1 = src.p1 || { dir: 5, buttons: 0 };
    var p2 = src.p2 || { dir: 5, buttons: 0 };
    return {
      p1: { dir: (p1.dir === undefined ? 5 : (p1.dir | 0)), buttons: (p1.buttons === undefined ? 0 : (p1.buttons | 0)) },
      p2: { dir: (p2.dir === undefined ? 5 : (p2.dir | 0)), buttons: (p2.buttons === undefined ? 0 : (p2.buttons | 0)) }
    };
  }

  function configFor(world){
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    if (world && world.cfg) return world.cfg;
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function getHashModule(){
    return (ns.core && ns.core.world && ns.core.world.hash) ? ns.core.world.hash : null;
  }

  function getSnapshotModule(){
    return (ns.core && ns.core.world && ns.core.world.snapshot) ? ns.core.world.snapshot : null;
  }

  function getCreateWorldModule(){
    return (ns.core && ns.core.world && ns.core.world.createWorld) ? ns.core.world.createWorld : null;
  }

  function getLifecycleModule(){
    return (ns.core && ns.core.world && ns.core.world.lifecycle) ? ns.core.world.lifecycle : null;
  }

  function getGeometryModule(){
    return (ns.core && ns.core.spatial && ns.core.spatial.geometry) ? ns.core.spatial.geometry : null;
  }

  function getFighterModule(){
    return (ns.core && ns.core.fighter && ns.core.fighter.tick) ? ns.core.fighter.tick : null;
  }

  function getMoveBridgeModule(){
    return (ns.core && ns.core.move && ns.core.move.bridge) ? ns.core.move.bridge : null;
  }

  function getStrikeBridgeModule(){
    return (ns.core && ns.core.strike && ns.core.strike.bridge) ? ns.core.strike.bridge : null;
  }

  function getExchangeBridgeModule(){
    return (ns.core && ns.core.exchange && ns.core.exchange.bridge) ? ns.core.exchange.bridge : null;
  }

  function getThrowBridgeModule(){
    return (ns.core && ns.core.throw && ns.core.throw.bridge) ? ns.core.throw.bridge : null;
  }

  function getHitstopModule(){
    return (ns.core && ns.core.hitstop && ns.core.hitstop.bridge) ? ns.core.hitstop.bridge : null;
  }

  function routeDiagnosticSink(){
    return Array.isArray(global.__fightRouteDiagnosticsSink) ? global.__fightRouteDiagnosticsSink : null;
  }

  function pushRouteDiagnostic(entry){
    var sink = routeDiagnosticSink();
    var ev = entry || {};
    if (!sink) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || ''),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function withRouteDiagnosticSink(sink, fn){
    var prev = global.__fightRouteDiagnosticsSink;
    if (sink) global.__fightRouteDiagnosticsSink = sink;
    try {
      return fn();
    } finally {
      global.__fightRouteDiagnosticsSink = prev;
    }
  }

  function globalFunctionAvailable(name){
    return typeof global[name] === 'function';
  }

  function moduleLifecycleAvailable(){
    var lc = getLifecycleModule();
    return !!(
      lc &&
      typeof lc.phaseAdvance === 'function' &&
      typeof lc.setPhase === 'function' &&
      typeof lc.resolveTimerWinner === 'function' &&
      typeof lc.createL15Stats === 'function' &&
      typeof lc.l15Bump === 'function'
    );
  }

  function ownerSummary(world){
    return {
      step: String(world && world.__stepOwner || 'module'),
      lifecycle: String(world && world.__lifecycleOwner || 'module'),
      combatBody: String(world && world.__combatBodyOwner || 'module'),
      geometry: String(world && world.__geometryOwner || 'module'),
      fighter: String(world && world.__fighterOwner || 'module'),
      moveBridge: String(world && world.__moveBridgeOwner || 'module'),
      strikeBridge: String(world && world.__strikeBridgeOwner || 'module'),
      exchangeBridge: String(world && world.__exchangeBridgeOwner || 'module'),
      throwBridge: String(world && world.__throwBridgeOwner || 'module'),
      hitstop: String(world && world.__hitstopOwner || 'module')
    };
  }

  function buildRequirement(needed, symbols, satisfied, detail){
    var missing = [];
    var i;
    if (needed && Array.isArray(symbols)) {
      for (i = 0; i < symbols.length; i++) {
        if (!globalFunctionAvailable(symbols[i])) missing.push(symbols[i]);
      }
    }
    return {
      needed: !!needed,
      symbols: Array.isArray(symbols) ? symbols.slice(0) : [],
      satisfied: !!satisfied,
      missingSymbols: missing,
      detail: String(detail || '')
    };
  }

  function buildDependencyAuditEntry(world, opts, explicitLegacy, compareSide){
    var o = opts || {};
    var legacy = resolveLegacy(explicitLegacy);
    var owners = ownerSummary(world);
    var forceLegacyShell = compareSide ? !!o.compareLegacyShell : !!o.useLegacyShell;
    var forceLegacyCombatBody = compareSide ? !!o.compareLegacyCombatBody : !!o.useLegacyCombatBody;
    var forceLegacyGeometry = compareSide ? !!o.compareLegacyGeometry : !!o.useLegacyGeometry;
    var forceLegacyFighter = compareSide ? !!o.compareLegacyFighter : !!o.useLegacyFighterUpdate;
    var forceLegacyMove = compareSide ? !!o.compareLegacyMoveBridge : !!o.useLegacyMoveBridge;
    var forceLegacyStrike = compareSide ? !!o.compareLegacyStrikeBridge : !!o.useLegacyStrikeBridge;
    var forceLegacyExchange = compareSide ? !!o.compareLegacyExchangeBridge : !!o.useLegacyExchangeBridge;
    var forceLegacyThrow = compareSide ? !!o.compareLegacyThrowBridge : !!o.useLegacyThrowBridge;
    var forceLegacyHitstop = compareSide ? !!o.compareLegacyHitstop : !!o.useLegacyHitstop;
    var forceLegacyConsequenceHelpers = compareSide ? !!(o.compareLegacyConsequenceHelpers || o.consequenceHelperMode) : !!o.useLegacyConsequenceHelpers;
    var forceLegacyDialComboHelpers = compareSide ? !!(o.compareLegacyDialComboHelpers || o.dialComboHelperMode) : !!o.useLegacyDialComboHelpers;
    var forceLegacyTelemetryHelpers = compareSide ? !!(o.compareLegacyTelemetryHelpers || o.telemetryHelperMode) : !!o.useLegacyTelemetryHelpers;
    var forceLegacyCreate = compareSide ? !!o.compareLegacyCreate : !!o.useLegacyCreate;
    var requirements = {
      createWorld: buildRequirement(
        forceLegacyCreate,
        ['_fightCreateWorld'],
        !!((legacy && typeof legacy.createWorld === 'function') || globalFunctionAvailable('_fightCreateWorld')),
        forceLegacyCreate ? 'legacy-create-requested' : ''
      ),
      stepShell: buildRequirement(
        forceLegacyShell || owners.step === 'legacy',
        ['_fightEngineStep'],
        !!((legacy && typeof legacy.step === 'function') || globalFunctionAvailable('_fightEngineStep')),
        (forceLegacyShell || owners.step === 'legacy') ? 'legacy-step-requested' : ''
      ),
      geometry: buildRequirement(
        forceLegacyGeometry || owners.geometry === 'legacy',
        ['_fightResolveFacing', '_fightRefreshBoxes', '_fightResolvePush'],
        hasLegacyGeometryBridge(),
        (forceLegacyGeometry || owners.geometry === 'legacy') ? 'legacy-geometry-requested' : ''
      ),
      fighter: buildRequirement(
        forceLegacyFighter || owners.fighter === 'legacy',
        ['_fightTickFighter'],
        hasLegacyFighterBridge(),
        (forceLegacyFighter || owners.fighter === 'legacy') ? 'legacy-fighter-requested' : ''
      ),
      moveBridge: buildRequirement(
        forceLegacyMove || owners.moveBridge === 'legacy',
        ['_fightSelectMove', '_fightStartMove', '_fightTickMove'],
        hasLegacyMoveBridge(),
        (forceLegacyMove || owners.moveBridge === 'legacy') ? 'legacy-move-bridge-requested' : ''
      ),
      strikeBridge: buildRequirement(
        forceLegacyStrike || owners.strikeBridge === 'legacy',
        ['_fightTryStrike', '_fightDetectContact'],
        hasLegacyStrikeBridge(),
        (forceLegacyStrike || owners.strikeBridge === 'legacy') ? 'legacy-strike-bridge-requested' : ''
      ),
      exchangeBridge: buildRequirement(
        forceLegacyExchange || owners.exchangeBridge === 'legacy',
        ['_fightApplyExchange'],
        hasLegacyExchangeBridge(),
        (forceLegacyExchange || owners.exchangeBridge === 'legacy') ? 'legacy-exchange-requested' : ''
      ),
      throwBridge: buildRequirement(
        forceLegacyThrow || owners.throwBridge === 'legacy',
        ['_fightResolveThrows', '_fightCanThrow', '_fightResolveThrow'],
        hasLegacyThrowBridge(),
        (forceLegacyThrow || owners.throwBridge === 'legacy') ? 'legacy-throw-requested' : ''
      ),
      hitstop: buildRequirement(
        forceLegacyHitstop || owners.hitstop === 'legacy',
        ['_fightApplyHitstop', '_fightApplyHitstopLegacyBody'],
        hasLegacyHitstopBridge(),
        (forceLegacyHitstop || owners.hitstop === 'legacy') ? 'legacy-hitstop-requested' : ''
      ),
      consequenceHelpers: buildRequirement(
        forceLegacyConsequenceHelpers,
        ['_fightConfigFor', '_fightStrengthFromMove', '_fightSfAttackPreset', '_fightTargetCombosEnabled', '_fightMkAirHitsKey', '_fightL15WarnThreshold', '_fightFromPx', '_fightToPx', '_fightAbs', '_fightClamp', '_fightRosterMoveById'],
        (
          globalFunctionAvailable('_fightConfigFor') &&
          globalFunctionAvailable('_fightStrengthFromMove') &&
          globalFunctionAvailable('_fightSfAttackPreset') &&
          globalFunctionAvailable('_fightTargetCombosEnabled') &&
          globalFunctionAvailable('_fightMkAirHitsKey') &&
          globalFunctionAvailable('_fightL15WarnThreshold') &&
          globalFunctionAvailable('_fightFromPx') &&
          globalFunctionAvailable('_fightToPx') &&
          globalFunctionAvailable('_fightAbs') &&
          globalFunctionAvailable('_fightClamp') &&
          globalFunctionAvailable('_fightRosterMoveById')
        ),
        forceLegacyConsequenceHelpers ? 'legacy-consequence-helpers-requested' : ''
      ),
      dialComboHelpers: buildRequirement(
        forceLegacyDialComboHelpers,
        ['_fightTargetCombosEnabled', '_fightMkDialState', '_fightMkResetDial', '_fightMkCombosFor'],
        (
          globalFunctionAvailable('_fightTargetCombosEnabled') &&
          globalFunctionAvailable('_fightMkDialState') &&
          globalFunctionAvailable('_fightMkResetDial') &&
          globalFunctionAvailable('_fightMkCombosFor')
        ),
        forceLegacyDialComboHelpers ? 'legacy-dial-combo-helpers-requested' : ''
      ),
      telemetryHelpers: buildRequirement(
        forceLegacyTelemetryHelpers,
        ['_fightCreateL15Stats', '_fightL15Bump'],
        (
          globalFunctionAvailable('_fightCreateL15Stats') &&
          globalFunctionAvailable('_fightL15Bump')
        ),
        forceLegacyTelemetryHelpers ? 'legacy-telemetry-helpers-requested' : ''
      )
    };

    return {
      side: compareSide ? 'compare' : 'primary',
      owners: owners,
      forcedLegacy: {
        createWorld: forceLegacyCreate,
        shell: forceLegacyShell,
        combatBody: forceLegacyCombatBody,
        geometry: forceLegacyGeometry,
        fighter: forceLegacyFighter,
        moveBridge: forceLegacyMove,
        strikeBridge: forceLegacyStrike,
        exchangeBridge: forceLegacyExchange,
        throwBridge: forceLegacyThrow,
        hitstop: forceLegacyHitstop,
        consequenceHelpers: forceLegacyConsequenceHelpers,
        dialComboHelpers: forceLegacyDialComboHelpers,
        telemetryHelpers: forceLegacyTelemetryHelpers
      },
      moduleAvailability: {
        createWorld: !!(getCreateWorldModule() && typeof getCreateWorldModule().createWorld === 'function'),
        lifecycle: moduleLifecycleAvailable(),
        geometry: hasModuleGeometryBridge(),
        fighter: hasModuleFighterBridge(),
        moveBridge: hasModuleMoveBridge(),
        strikeBridge: hasModuleStrikeBridge(),
        exchangeBridge: hasModuleExchangeBridge(),
        throwBridge: hasModuleThrowBridge(),
        hitstop: hasModuleHitstopBridge()
      },
      legacyAvailability: {
        createWorld: !!((legacy && typeof legacy.createWorld === 'function') || globalFunctionAvailable('_fightCreateWorld')),
        stepShell: !!((legacy && typeof legacy.step === 'function') || globalFunctionAvailable('_fightEngineStep')),
        geometry: hasLegacyGeometryBridge(),
        fighter: hasLegacyFighterBridge(),
        moveBridge: hasLegacyMoveBridge(),
        strikeBridge: hasLegacyStrikeBridge(),
        exchangeBridge: hasLegacyExchangeBridge(),
        throwBridge: hasLegacyThrowBridge(),
        hitstop: hasLegacyHitstopBridge()
      },
      requirements: requirements
    };
  }

  function normalizeRouteDiagnostic(entry){
    var ev = entry || {};
    return {
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || ''),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    };
  }

  function routeDiagnosticSummary(list){
    var arr = Array.isArray(list) ? list : [];
    var map = {};
    var out = [];
    var i, key, ev;
    for (i = 0; i < arr.length; i++) {
      ev = normalizeRouteDiagnostic(arr[i]);
      key = [ev.ctx, ev.op, ev.path, ev.reason, ev.detail].join('|');
      if (!map[key]) {
        map[key] = {
          ctx: ev.ctx,
          op: ev.op,
          path: ev.path,
          reason: ev.reason,
          detail: ev.detail,
          count: 0
        };
        out.push(map[key]);
      }
      map[key].count++;
    }
    return out;
  }

  function stateHash(world){
    var hm = getHashModule();
    if (hm && typeof hm.stateHash === 'function') return hm.stateHash(world);
    if (typeof global._fightStateHashCore === 'function') return global._fightStateHashCore(world);
    return '';
  }

  function stateDigest(world){
    var hm = getHashModule();
    if (hm && typeof hm.stateDigest === 'function') return hm.stateDigest(world);
    if (typeof global._fightStateDigest === 'function') return global._fightStateDigest(world);
    return null;
  }

  function diffDigest(a, b){
    var hm = getHashModule();
    if (hm && typeof hm.diffDigest === 'function') return hm.diffDigest(a, b);
    if (typeof global._fightDiff === 'function') return global._fightDiff(a, b);
    return null;
  }

  function classifyDiff(diff, fallback){
    if (fallback) return fallback;
    var hm = getHashModule();
    if (hm && typeof hm.classifyDiffPath === 'function') {
      return hm.classifyDiffPath(diff && diff.path ? diff.path : '');
    }
    return 'resolution-or-phase';
  }

  function classifyLifecycleDiff(diff, fallback){
    if (fallback) return fallback;
    var lc = getLifecycleModule();
    if (lc && typeof lc.classifyLifecycleDiffPath === 'function') {
      return lc.classifyLifecycleDiffPath(diff && diff.path ? diff.path : '');
    }
    return classifyDiff(diff, '');
  }

  function classifyStepShellDiff(diff, fallback){
    if (fallback) return fallback;
    var p = String((diff && diff.path) || '');
    if (!p) return 'frame-order';
    if (p === 'frame' || p.indexOf('inputHistory') >= 0 || p.indexOf('inputEdgeHistory') >= 0 || p.indexOf('prevDir') >= 0 || p.indexOf('prevButtons') >= 0) return 'frame-order';
    if (p.indexOf('phase') === 0 || p.indexOf('phaseTimer') === 0 || p.indexOf('round') === 0 || p.indexOf('score') === 0) return 'phase-shell';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-shell';
    if (p.indexOf('mkGba.timerWarned') === 0) return 'timer-warning';
    if (p.indexOf('mkGba.timer') === 0) return 'timer-expiry';
    if (p.indexOf('winner') === 0) return 'ko-shell';
    if (p.indexOf('debug.snapshots') === 0) return 'snapshot-ring';
    return 'event-order';
  }

  function classifyCombatBodyDiff(diff, fallback){
    if (fallback) return fallback;
    var p = String((diff && diff.path) || '');
    if (!p) return 'fighter-tick';
    if (p.indexOf('fighters.p1.facing') === 0 || p.indexOf('fighters.p2.facing') === 0 || p.indexOf('p1.facing') === 0 || p.indexOf('p2.facing') === 0) return 'facing';
    if (p.indexOf('fighters.p1.boxes') === 0 || p.indexOf('fighters.p2.boxes') === 0 || p.indexOf('p1.boxes') === 0 || p.indexOf('p2.boxes') === 0) return 'box-refresh';
    if (
      p.indexOf('interaction.lastExchange') === 0 ||
      p.indexOf('interaction.hitstop') === 0 ||
      p.indexOf('fighters.p1.health') === 0 ||
      p.indexOf('fighters.p2.health') === 0 ||
      p.indexOf('fighters.p1.stun') === 0 ||
      p.indexOf('fighters.p2.stun') === 0 ||
      p.indexOf('p1.hp') === 0 ||
      p.indexOf('p2.hp') === 0 ||
      p.indexOf('p1.stun') === 0 ||
      p.indexOf('p2.stun') === 0
    ) return 'strike-order';
    if (
      p.indexOf('fighters.p1.throwTech') === 0 ||
      p.indexOf('fighters.p2.throwTech') === 0 ||
      p.indexOf('fighters.p1.throwInvul') === 0 ||
      p.indexOf('fighters.p2.throwInvul') === 0 ||
      p.indexOf('p1.throwTech') === 0 ||
      p.indexOf('p2.throwTech') === 0 ||
      p.indexOf('p1.throwInvul') === 0 ||
      p.indexOf('p2.throwInvul') === 0
    ) return 'throw-order';
    if (
      p.indexOf('fighters.p1.state') === 0 ||
      p.indexOf('fighters.p2.state') === 0 ||
      p.indexOf('fighters.p1.stateFrame') === 0 ||
      p.indexOf('fighters.p2.stateFrame') === 0 ||
      p.indexOf('fighters.p1.moveFrame') === 0 ||
      p.indexOf('fighters.p2.moveFrame') === 0 ||
      p.indexOf('fighters.p1.prevDir') === 0 ||
      p.indexOf('fighters.p2.prevDir') === 0 ||
      p.indexOf('p1.state') === 0 ||
      p.indexOf('p2.state') === 0 ||
      p.indexOf('p1.stateFrame') === 0 ||
      p.indexOf('p2.stateFrame') === 0 ||
      p.indexOf('p1.moveFrame') === 0 ||
      p.indexOf('p2.moveFrame') === 0 ||
      p.indexOf('p1.prevDir') === 0 ||
      p.indexOf('p2.prevDir') === 0
    ) return 'fighter-tick';
    if (p.indexOf('fighters.p1.x') === 0 || p.indexOf('fighters.p2.x') === 0 || p.indexOf('p1.x') === 0 || p.indexOf('p2.x') === 0) return 'push-order';
    return 'combat-event-order';
  }

  function classifyGeometryDiff(diff, fallback){
    if (fallback) return fallback;
    var p = String((diff && diff.path) || '');
    if (!p) return 'geometry-digest';
    if (p.indexOf('fighters.p1.facing') === 0 || p.indexOf('fighters.p2.facing') === 0 || p.indexOf('p1.facing') === 0 || p.indexOf('p2.facing') === 0) return 'facing';
    if (
      p.indexOf('fighters.p1.moveId') === 0 || p.indexOf('fighters.p2.moveId') === 0 ||
      p.indexOf('fighters.p1.moveFrame') === 0 || p.indexOf('fighters.p2.moveFrame') === 0 ||
      p.indexOf('p1.moveId') === 0 || p.indexOf('p2.moveId') === 0 ||
      p.indexOf('p1.moveFrame') === 0 || p.indexOf('p2.moveFrame') === 0
    ) return 'frame-data';
    if (p.indexOf('fighters.p1.boxes') === 0 || p.indexOf('fighters.p2.boxes') === 0 || p.indexOf('p1.boxes') === 0 || p.indexOf('p2.boxes') === 0) return 'box-refresh';
    if (p.indexOf('fighters.p1.x') === 0 || p.indexOf('fighters.p2.x') === 0 || p.indexOf('p1.x') === 0 || p.indexOf('p2.x') === 0) return 'push';
    if (p.indexOf('stage') === 0) return 'push';
    return 'geometry-digest';
  }

  function classifyFighterDiff(diff, fallback){
    if (fallback) return fallback;
    var fm = getFighterModule();
    var p = String((diff && diff.path) || '');
    if (fm && typeof fm.classifyFighterDiffPath === 'function') {
      return fm.classifyFighterDiffPath(p);
    }
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
    if (p.indexOf('.x') >= 0 || p.indexOf('.y') >= 0 || p.indexOf('.vx') >= 0 || p.indexOf('.vy') >= 0) return 'movement-tick';
    return 'fighter-event-order';
  }

  function classifyMoveBridgeDiff(diff, fallback){
    if (fallback) return fallback;
    var mm = getMoveBridgeModule();
    var p = String((diff && diff.path) || '');
    if (mm && typeof mm.classifyMoveBridgeDiffPath === 'function') {
      return mm.classifyMoveBridgeDiffPath(p);
    }
    if (!p) return 'move-select';
    if (p.indexOf('lastParserDecision') >= 0) return 'parser-decision';
    if (p.indexOf('moveId') >= 0) return 'move-start';
    if (p.indexOf('moveFrame') >= 0 || p.indexOf('moveHitRegistered') >= 0 || p.indexOf('lastMoveContact') >= 0) return 'move-tick';
    if (p.indexOf('charge') >= 0) return 'charge-check';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'move-end';
    return 'move-event-order';
  }

  function classifyStrikeBridgeDiff(diff, fallback){
    if (fallback) return fallback;
    var sm = getStrikeBridgeModule();
    var p = String((diff && diff.path) || '');
    if (sm && typeof sm.classifyStrikeBridgeDiffPath === 'function') {
      return sm.classifyStrikeBridgeDiffPath(p);
    }
    if (!p) return 'strike-attempt';
    if (p.indexOf('moveHitRegistered') >= 0) return 'move-hit-registered';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-bridge';
    if (p.indexOf('interaction.lastExchange') === 0) return 'exchange-bridge';
    if (p.indexOf('boxes') >= 0) return 'contact-detect';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'active-frame';
    return 'strike-event-order';
  }

  function classifyExchangeBridgeDiff(diff, fallback){
    if (fallback) return fallback;
    var em = getExchangeBridgeModule();
    var p = String((diff && diff.path) || '');
    if (em && typeof em.classifyExchangeBridgeDiffPath === 'function') {
      return em.classifyExchangeBridgeDiffPath(p);
    }
    if (!p) return 'exchange-entry';
    if (p.indexOf('interaction.lastExchange') === 0) return 'last-exchange';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-bridge';
    if (p.indexOf('mkGba.comboDial') >= 0) return 'dial-side-effect';
    if (p.indexOf('l15Stats.round') >= 0) return 'telemetry-side-effect';
    if (p.indexOf('cornerToastUntilFrame') >= 0) return 'corner-pressure';
    if (p.indexOf('mkGba.juggle') >= 0 || p.indexOf('AirHitsTaken') >= 0) return 'juggle-side-effect';
    if (p.indexOf('dizzyFramesLeft') >= 0 || p.indexOf('stunMeter') >= 0 || p.indexOf('dizzyWarned') >= 0) return 'dizzy-side-effect';
    if (p.indexOf('health') >= 0) return 'damage-write';
    if (p.indexOf('hitstunFramesLeft') >= 0 || p.indexOf('blockstunFramesLeft') >= 0) return 'stun-write';
    if (p.indexOf('knockdownFramesLeft') >= 0) return 'knockdown-write';
    if (p.indexOf('.x') >= 0) return 'pushback-write';
    if (p.indexOf('state') >= 0) return 'block-hit-branch';
    return 'exchange-event-order';
  }

  function classifyThrowBridgeDiff(diff, fallback){
    if (fallback) return fallback;
    var tm = getThrowBridgeModule();
    var p = String((diff && diff.path) || '');
    if (tm && typeof tm.classifyThrowBridgeDiffPath === 'function') {
      return tm.classifyThrowBridgeDiffPath(p);
    }
    if (!p) return 'throw-gate';
    if (p.indexOf('throwTechFramesLeft') >= 0 || p.indexOf('wakeupThrowInvulFramesLeft') >= 0) return 'throw-tech';
    if (p.indexOf('interaction.lastExchange') === 0) return 'throw-last-exchange';
    if (p.indexOf('interaction.hitstop') === 0) return 'throw-hitstop';
    if (p.indexOf('health') >= 0 || p.indexOf('knockdownFramesLeft') >= 0 || p.indexOf('.vx') >= 0 || p.indexOf('.vy') >= 0) return 'throw-connect';
    if (p.indexOf('moveHitRegistered') >= 0) return 'throw-whiff';
    return 'throw-event-order';
  }

  function classifyHitstopDiff(diff, fallback){
    if (fallback) return fallback;
    var hm = getHitstopModule();
    var p = String((diff && diff.path) || '');
    if (hm && typeof hm.classifyHitstopDiffPath === 'function') {
      return hm.classifyHitstopDiffPath(p);
    }
    if (!p) return 'hitstop-value';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-value';
    return 'hitstop-callsite';
  }

  function classifyFighterProbeMismatch(a, b){
    var fm = getFighterModule();
    if (fm && typeof fm.classifyFighterProbeMismatch === 'function') {
      return fm.classifyFighterProbeMismatch(a, b);
    }
    if (!a || !b) return 'fighter-event-order';
    return 'fighter-event-order';
  }

  function classifyMoveBridgeProbeMismatch(a, b){
    var mm = getMoveBridgeModule();
    if (mm && typeof mm.classifyMoveProbeMismatch === 'function') {
      return mm.classifyMoveProbeMismatch(a, b);
    }
    if (!a || !b) return 'move-event-order';
    return 'move-event-order';
  }

  function classifyStrikeProbeMismatch(a, b){
    var sm = getStrikeBridgeModule();
    if (sm && typeof sm.classifyStrikeProbeMismatch === 'function') {
      return sm.classifyStrikeProbeMismatch(a, b);
    }
    if (!a || !b) return 'strike-event-order';
    return 'strike-event-order';
  }

  function classifyExchangeProbeMismatch(a, b){
    var em = getExchangeBridgeModule();
    if (em && typeof em.classifyExchangeProbeMismatch === 'function') {
      return em.classifyExchangeProbeMismatch(a, b);
    }
    if (!a || !b) return 'exchange-event-order';
    return 'exchange-event-order';
  }

  function classifyThrowProbeMismatch(a, b){
    var tm = getThrowBridgeModule();
    if (tm && typeof tm.classifyThrowProbeMismatch === 'function') {
      return tm.classifyThrowProbeMismatch(a, b);
    }
    if (!a || !b) return 'throw-event-order';
    return 'throw-event-order';
  }

  function classifyHitstopProbeMismatch(a, b){
    var hm = getHitstopModule();
    if (hm && typeof hm.classifyHitstopProbeMismatch === 'function') {
      return hm.classifyHitstopProbeMismatch(a, b);
    }
    var pa = a || {};
    var pb = b || {};
    var ca = Array.isArray(pa.calls) ? pa.calls : [];
    var cb = Array.isArray(pb.calls) ? pb.calls : [];
    var i;
    if (ca.length !== cb.length) {
      return (ca.length < cb.length) ? 'hitstop-missing-call' : 'hitstop-double-call';
    }
    for (i = 0; i < ca.length; i++) {
      var ap = ca[i] && ca[i].preHitstopCall ? ca[i].preHitstopCall : {};
      var bp = cb[i] && cb[i].preHitstopCall ? cb[i].preHitstopCall : {};
      var ao = ca[i] && ca[i].postHitstopCall ? ca[i].postHitstopCall : {};
      var bo = cb[i] && cb[i].postHitstopCall ? cb[i].postHitstopCall : {};
      if (String(ap.caller || '') !== String(bp.caller || '')) return 'hitstop-callsite';
      if (String(ap.keyIn || '') !== String(bp.keyIn || '') || String(ao.resolvedKey || '') !== String(bo.resolvedKey || '')) {
        return 'hitstop-key';
      }
      if ((ao.resolvedValue | 0) !== (bo.resolvedValue | 0) || (ao.hitstopAfter | 0) !== (bo.hitstopAfter | 0)) {
        return 'hitstop-value';
      }
    }
    return 'hitstop-value';
  }

  function classifyGeometryProbeMismatch(a, b){
    if (!a || !b) return 'geometry-digest';

    var af = a.postFacing || {};
    var bf = b.postFacing || {};
    if ((af.p1Facing | 0) !== (bf.p1Facing | 0) || (af.p2Facing | 0) !== (bf.p2Facing | 0)) return 'facing';

    var ar = a.postRefresh || {};
    var br = b.postRefresh || {};
    if (
      String(ar.p1MoveId || '') !== String(br.p1MoveId || '') ||
      String(ar.p2MoveId || '') !== String(br.p2MoveId || '') ||
      (ar.p1MoveFrame | 0) !== (br.p1MoveFrame | 0) ||
      (ar.p2MoveFrame | 0) !== (br.p2MoveFrame | 0) ||
      (ar.p1Facing | 0) !== (br.p1Facing | 0) ||
      (ar.p2Facing | 0) !== (br.p2Facing | 0)
    ) return 'frame-data';

    var ah = ar.p1Hurt || {};
    var bh = br.p1Hurt || {};
    var ap = ar.p1Push || {};
    var bp = br.p1Push || {};
    var a2h = ar.p2Hurt || {};
    var b2h = br.p2Hurt || {};
    var a2p = ar.p2Push || {};
    var b2p = br.p2Push || {};
    if ((ah.n | 0) !== (bh.n | 0) || (ap.n | 0) !== (bp.n | 0) || (a2h.n | 0) !== (b2h.n | 0) || (a2p.n | 0) !== (b2p.n | 0)) {
      return 'box-refresh';
    }
    if (JSON.stringify(ar) !== JSON.stringify(br)) return 'box-transform';

    var apu = a.prePush || {};
    var bpu = b.prePush || {};
    if (!!apu.hasOverlap !== !!bpu.hasOverlap || (apu.oxRaw | 0) !== (bpu.oxRaw | 0)) return 'overlap';

    var apo = a.postPush || {};
    var bpo = b.postPush || {};
    if (
      (apo.p1x | 0) !== (bpo.p1x | 0) ||
      (apo.p2x | 0) !== (bpo.p2x | 0) ||
      (apo.separation | 0) !== (bpo.separation | 0) ||
      !!apo.p1Clamped !== !!bpo.p1Clamped ||
      !!apo.p2Clamped !== !!bpo.p2Clamped
    ) return 'push';

    return 'geometry-digest';
  }

  function snapshotCore(world){
    var sm = getSnapshotModule();
    if (sm && typeof sm.snapshot === 'function') return sm.snapshot(world);
    if (typeof global._fightSnapshotCore === 'function') return global._fightSnapshotCore(world);
    return null;
  }

  function writeSnapshotRing(world, b){
    if (!world || !world.debug) return;
    var every = (world.debug.snapshotEveryN | 0);
    if (!(every > 0) || (world.frame % every) !== 0) return;

    if (!Array.isArray(world.debug.snapshots)) world.debug.snapshots = [];
    var snap = snapshotCore(world);
    if (snap) world.debug.snapshots.push(snap);

    var ring = ((b && b.snapshot && b.snapshot.ringSize) | 0);
    if (!(ring > 0)) ring = 240;
    while (world.debug.snapshots.length > ring) world.debug.snapshots.shift();
  }

  function pushInputHistory(f, input, edge, limit, frame){
    if (typeof global._fightPushInputHistory === 'function') {
      global._fightPushInputHistory(f, input, edge, limit, frame);
      return;
    }
    if (!f) return;
    f.inputHistory = Array.isArray(f.inputHistory) ? f.inputHistory : [];
    f.inputEdgeHistory = Array.isArray(f.inputEdgeHistory) ? f.inputEdgeHistory : [];
    f.inputHistory.push({ frame: frame | 0, dir: input.dir | 0, buttons: input.buttons | 0 });
    f.inputEdgeHistory.push({ frame: frame | 0, dir: edge.dir | 0, buttons: edge.buttons | 0 });
    while (f.inputHistory.length > limit) f.inputHistory.shift();
    while (f.inputEdgeHistory.length > limit) f.inputEdgeHistory.shift();
  }

  function updateCharge(world, fighter, input){
    if (typeof global._fightUpdateCharge === 'function') {
      global._fightUpdateCharge(world, fighter, input);
    }
  }

  function hasModuleGeometryBridge(){
    var gm = getGeometryModule();
    return !!(
      gm &&
      typeof gm.resolveFacing === 'function' &&
      typeof gm.refreshBoxes === 'function' &&
      typeof gm.resolvePush === 'function' &&
      typeof gm.overlap === 'function'
    );
  }

  function hasLegacyGeometryBridge(){
    return (
      typeof global._fightResolveFacing === 'function' &&
      typeof global._fightRefreshBoxes === 'function' &&
      typeof global._fightResolvePush === 'function'
    );
  }

  function hasModuleFighterBridge(){
    var fm = getFighterModule();
    return !!(
      fm &&
      typeof fm.tickFighter === 'function' &&
      typeof fm.tickStatus === 'function' &&
      typeof fm.tickMovement === 'function'
    );
  }

  function hasLegacyFighterBridge(){
    return typeof global._fightTickFighter === 'function';
  }

  function hasModuleMoveBridge(){
    var mm = getMoveBridgeModule();
    return !!(
      mm &&
      typeof mm.selectMove === 'function' &&
      typeof mm.startMove === 'function' &&
      typeof mm.tickMove === 'function'
    );
  }

  function hasLegacyMoveBridge(){
    return (
      typeof global._fightSelectMove === 'function' &&
      typeof global._fightStartMove === 'function' &&
      typeof global._fightTickMove === 'function'
    );
  }

  function hasModuleStrikeBridge(){
    var sm = getStrikeBridgeModule();
    return !!(
      sm &&
      typeof sm.tryStrike === 'function' &&
      typeof sm.detectContact === 'function'
    );
  }

  function hasModuleExchangeBridge(){
    var em = getExchangeBridgeModule();
    return !!(
      em &&
      typeof em.applyExchange === 'function'
    );
  }

  function hasLegacyStrikeBridge(){
    return (
      typeof global._fightTryStrike === 'function' &&
      typeof global._fightDetectContact === 'function'
    );
  }

  function hasLegacyExchangeBridge(){
    return typeof global._fightApplyExchange === 'function';
  }

  function hasModuleThrowBridge(){
    var tm = getThrowBridgeModule();
    return !!(
      tm &&
      typeof tm.resolveThrows === 'function' &&
      typeof tm.canThrow === 'function' &&
      typeof tm.resolveThrow === 'function'
    );
  }

  function hasLegacyThrowBridge(){
    return (
      typeof global._fightResolveThrows === 'function' &&
      typeof global._fightCanThrow === 'function' &&
      typeof global._fightResolveThrow === 'function'
    );
  }

  function hasModuleHitstopBridge(){
    var hm = getHitstopModule();
    return !!(
      hm &&
      typeof hm.applyHitstop === 'function'
    );
  }

  function hasLegacyHitstopBridge(){
    return (
      typeof global._fightApplyHitstop === 'function' ||
      typeof global._fightApplyHitstopLegacyBody === 'function'
    );
  }

  function hasLegacyMechanicsBridge(){
    return true;
  }

  function useLegacyGeometry(world, opts){
    if (opts && opts.forceLegacyGeometry) return true;
    return !!(world && world.__geometryOwner === 'legacy');
  }

  function useLegacyFighterUpdate(world, opts){
    if (opts && opts.forceLegacyFighterUpdate) return true;
    return !!(world && world.__fighterOwner === 'legacy');
  }

  function useLegacyMoveBridge(world, opts){
    if (opts && opts.forceLegacyMoveBridge) return true;
    return !!(world && world.__moveBridgeOwner === 'legacy');
  }

  function useLegacyStrikeBridge(world, opts){
    if (opts && opts.forceLegacyStrikeBridge) return true;
    return !!(world && world.__strikeBridgeOwner === 'legacy');
  }

  function useLegacyExchangeBridge(world, opts){
    if (opts && opts.forceLegacyExchangeBridge) return true;
    return !!(world && world.__exchangeBridgeOwner === 'legacy');
  }

  function useLegacyThrowBridge(world, opts){
    if (opts && opts.forceLegacyThrowBridge) return true;
    return !!(world && world.__throwBridgeOwner === 'legacy');
  }

  function useLegacyHitstop(world, opts){
    if (opts && opts.forceLegacyHitstop) return true;
    return !!(world && world.__hitstopOwner === 'legacy');
  }

  function buildLegacyFighterProbe(world, fighter, wasGrounded){
    if (!fighter) return null;
    var key = (typeof global._fightMkAirHitsKey === 'function')
      ? global._fightMkAirHitsKey(fighter.id)
      : (fighter.id === 'p1' ? 'p1AirHitsTaken' : 'p2AirHitsTaken');
    var juggle = (world && world.mkGba && world.mkGba.juggle) ? world.mkGba.juggle : null;
    var out = {
      postStatus: {
        frame: world ? (world.frame | 0) : 0,
        fighter: String(fighter.id || ''),
        state: String(fighter.state || ''),
        stateFrame: fighter.stateFrame | 0,
        hitstunFramesLeft: fighter.hitstunFramesLeft | 0,
        blockstunFramesLeft: fighter.blockstunFramesLeft | 0,
        knockdownFramesLeft: fighter.knockdownFramesLeft | 0,
        dizzyFramesLeft: fighter.dizzyFramesLeft | 0,
        throwTechFramesLeft: fighter.throwTechFramesLeft | 0,
        wakeupThrowInvulFramesLeft: fighter.wakeupThrowInvulFramesLeft | 0,
        invulnFramesLeft: fighter.invulnFramesLeft | 0,
        statusConsumed: null
      },
      postMoveBridge: {
        frame: world ? (world.frame | 0) : 0,
        fighter: String(fighter.id || ''),
        moveId: String(fighter.moveId || ''),
        moveFrame: fighter.moveFrame | 0,
        state: String(fighter.state || ''),
        moveHitRegistered: !!fighter.moveHitRegistered,
        lastMoveContact: String(fighter.lastMoveContact || ''),
        lastParserDecision: fighter.lastParserDecision || null,
        dial: null
      },
      postMovement: {
        frame: world ? (world.frame | 0) : 0,
        fighter: String(fighter.id || ''),
        x: fighter.x | 0,
        y: fighter.y | 0,
        vx: fighter.vx | 0,
        vy: fighter.vy | 0,
        grounded: !!fighter.grounded,
        state: String(fighter.state || '')
      },
      postLanding: {
        frame: world ? (world.frame | 0) : 0,
        fighter: String(fighter.id || ''),
        grounded: !!fighter.grounded,
        landingTransition: (!!fighter.grounded && !wasGrounded),
        airHitsTaken: juggle && key ? (juggle[key] | 0) : 0
      }
    };
    return out;
  }

  function tickFighter(world, fighter, opp, input, edge, events, opts){
    var useLegacy = useLegacyFighterUpdate(world, opts || {});
    var fm = getFighterModule();

    if (!useLegacy && fm && typeof fm.tickFighter === 'function') {
      fm.tickFighter(world, fighter, opp, input, edge, events, opts || {});
      return;
    }

    if (typeof global._fightTickFighter === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'tickFighter',
        path: 'legacy',
        reason: useLegacy ? 'forced-legacy-fighter-bridge' : 'module-fighter-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      var wasGrounded = !!(fighter && fighter.grounded);
      global._fightTickFighter(world, fighter, opp, input, edge, events);
      if (opts && opts.fighterProbeOut && fighter && fighter.id) {
        opts.fighterProbeOut[fighter.id] = buildLegacyFighterProbe(world, fighter, wasGrounded);
      }
      return;
    }

    if (fm && typeof fm.tickFighter === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'fighter',
        op: 'tickFighter',
        path: 'module',
        reason: 'forced-legacy-fighter-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      fm.tickFighter(world, fighter, opp, input, edge, events, opts || {});
    }
  }

  function refreshBoxes(world, fighter, input, opts){
    var legacy = useLegacyGeometry(world, opts);
    var gm = getGeometryModule();
    if (!legacy && gm && typeof gm.refreshBoxes === 'function') {
      gm.refreshBoxes(world, fighter, input);
      return;
    }
    if (typeof global._fightRefreshBoxes === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'geometry',
        op: 'refreshBoxes',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-geometry' : 'module-geometry-bridge-missing',
        detail: String(fighter && fighter.id || '')
      });
      global._fightRefreshBoxes(world, fighter, input);
    }
  }

  function resolveFacing(world, opts){
    var legacy = useLegacyGeometry(world, opts);
    var gm = getGeometryModule();
    if (!legacy && gm && typeof gm.resolveFacing === 'function') {
      gm.resolveFacing(world);
      return;
    }
    if (typeof global._fightResolveFacing === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'geometry',
        op: 'resolveFacing',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-geometry' : 'module-geometry-bridge-missing',
        detail: ''
      });
      global._fightResolveFacing(world);
    }
  }

  function resolvePush(world, opts){
    var legacy = useLegacyGeometry(world, opts);
    var gm = getGeometryModule();
    if (!legacy && gm && typeof gm.resolvePush === 'function') {
      gm.resolvePush(world);
      return;
    }
    if (typeof global._fightResolvePush === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        ctx: 'geometry',
        op: 'resolvePush',
        path: 'legacy',
        reason: legacy ? 'forced-legacy-geometry' : 'module-geometry-bridge-missing',
        detail: ''
      });
      global._fightResolvePush(world);
    }
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

  function emptyArr(v){
    if (typeof global._fightEmptyArr === 'function') return !!global._fightEmptyArr(v);
    return !v || !v.length;
  }

  function overlapBox(a, b){
    if (typeof global._fightOverlap === 'function') return !!global._fightOverlap(a, b);
    var gm = getGeometryModule();
    if (gm && typeof gm.overlap === 'function') return !!gm.overlap(a, b);
    if (!a || !b) return false;
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  }

  function holdingBack(def, input){
    if (typeof global._fightHoldingBack === 'function') return !!global._fightHoldingBack(def, input);
    if (typeof global._fightDirIsBack === 'function') return !!global._fightDirIsBack(input ? input.dir : 5);
    var d = input ? (input.dir | 0) : 5;
    return d === 1 || d === 4 || d === 7;
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

  function digestStrikeBranchEvents(events, startIdx){
    var out = [];
    var arr = events || [];
    var i;
    for (i = startIdx | 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'hit' || t === 'block' || t === 'juggleCapReached' || t === 'dizzyWarn' || t === 'cornerPressure') {
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

  function probeLegacyContact(att, def){
    var i, j, hb, hu, cx, cy;
    var scannedHit = 0;
    var scannedHurt = 0;
    if (emptyArr(att && att.boxes ? att.boxes.hit : null) || emptyArr(def && def.boxes ? def.boxes.hurt : null)) {
      return {
        contactFound: false,
        contact: null,
        hitIndex: -1,
        hurtIndex: -1,
        scannedHitBoxes: (att && att.boxes && att.boxes.hit ? att.boxes.hit.length : 0) | 0,
        scannedHurtBoxes: (def && def.boxes && def.boxes.hurt ? def.boxes.hurt.length : 0) | 0
      };
    }
    for (i = 0; i < att.boxes.hit.length; i++) {
      hb = att.boxes.hit[i];
      scannedHit++;
      for (j = 0; j < def.boxes.hurt.length; j++) {
        hu = def.boxes.hurt[j];
        scannedHurt++;
        if (overlapBox(hb, hu)) {
          cx = (Math.max(hb.x1, hu.x1) + Math.min(hb.x2, hu.x2)) * 0.5;
          cy = (Math.max(hb.y1, hu.y1) + Math.min(hb.y2, hu.y2)) * 0.5;
          return {
            contactFound: true,
            contact: { x: toPx(cx), y: toPx(cy) },
            hitIndex: i | 0,
            hurtIndex: j | 0,
            scannedHitBoxes: scannedHit | 0,
            scannedHurtBoxes: scannedHurt | 0
          };
        }
      }
    }
    return {
      contactFound: false,
      contact: null,
      hitIndex: -1,
      hurtIndex: -1,
      scannedHitBoxes: scannedHit | 0,
      scannedHurtBoxes: scannedHurt | 0
    };
  }

  function tryStrike(world, att, def, inputDef, events, opts){
    var o = opts || {};
    var legacy = useLegacyStrikeBridge(world, o);
    var sm = getStrikeBridgeModule();
    var probe = o.probeOut || null;

    if (!legacy && sm && typeof sm.tryStrike === 'function') {
      sm.tryStrike(world, att, def, inputDef, events, {
        probeOut: probe,
        forceLegacyExchangeBridge: !!o.forceLegacyExchangeBridge,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        exchangeProbeOut: o.exchangeProbeOut || null
      });
      return;
    }

    if (typeof global._fightTryStrike === 'function') {
      var move = rosterMoveById(att ? att.rosterKey : '', att ? att.moveId : '');
      var st = states();
      var gatePassed = true;
      var gateFailReason = '';
      var moveHitBefore = att ? !!att.moveHitRegistered : false;
      var legacyContact = null;
      var blocked = false;
      var eventStart = events ? events.length : 0;
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
      if (gatePassed) {
        legacyContact = probeLegacyContact(att, def);
        blocked = !!(legacyContact && legacyContact.contactFound) && holdingBack(def, inputDef) &&
          !!(def && def.grounded) &&
          def.state !== st.HITSTUN &&
          def.state !== st.KNOCKDOWN;
        if (probe) {
          probe.postContactDetect = legacyContact;
          probe.preExchangeHandoff = {
            blocked: legacyContact.contactFound ? blocked : null,
            moveId: String(move && move.id || ''),
            attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
            moveHitRegisteredBeforeHandoff: att ? !!att.moveHitRegistered : false,
            contact: legacyContact.contactFound ? { x: legacyContact.contact.x, y: legacyContact.contact.y } : null
          };
        }
      } else if (probe) {
        probe.postContactDetect = {
          contactFound: false,
          contact: null,
          hitIndex: -1,
          hurtIndex: -1,
          scannedHitBoxes: 0,
          scannedHurtBoxes: 0
        };
        probe.preExchangeHandoff = {
          blocked: null,
          moveId: String(move && move.id || ''),
          attackerMoveFrame: att ? (att.moveFrame | 0) : 0,
          moveHitRegisteredBeforeHandoff: att ? !!att.moveHitRegistered : false,
          contact: null
        };
      }

      global._fightTryStrike(world, att, def, inputDef, events);

      if (probe) {
        probe.postStrikeResult = {
          exchangeCalled: (events ? events.length : 0) > eventStart,
          moveHitRegisteredAfter: att ? !!att.moveHitRegistered : false,
          lastExchange: compactLastExchange(world),
          branchEvents: digestStrikeBranchEvents(events, eventStart)
        };
      }
      return;
    }

    if (sm && typeof sm.tryStrike === 'function') {
      sm.tryStrike(world, att, def, inputDef, events, {
        probeOut: probe,
        forceLegacyExchangeBridge: !!o.forceLegacyExchangeBridge,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        exchangeProbeOut: o.exchangeProbeOut || null
      });
    }
  }

  function resolveThrows(world, inputP1, inputP2, events, opts){
    var o = opts || {};
    var legacy = useLegacyThrowBridge(world, o);
    var tm = getThrowBridgeModule();
    var probe = o.throwProbeOut || null;

    if (!legacy && tm && typeof tm.resolveThrows === 'function') {
      tm.resolveThrows(world, inputP1, inputP2, events, {
        forceLegacyThrowBridge: !!o.forceLegacyThrowBridge,
        forceLegacyConsequenceHelpers: !!o.forceLegacyConsequenceHelpers,
        forceLegacyDialComboHelpers: !!o.forceLegacyDialComboHelpers,
        probeOut: probe
      });
      return;
    }

    if (legacy && tm && typeof tm.resolveThrows === 'function') {
      tm.resolveThrows(world, inputP1, inputP2, events, {
        forceLegacyThrowBridge: true,
        forceLegacyConsequenceHelpers: true,
        forceLegacyDialComboHelpers: true,
        probeOut: probe
      });
      return;
    }

    if (typeof global._fightResolveThrows === 'function') {
      global._fightResolveThrows(world, inputP1, inputP2, events);
      return;
    }

    if (tm && typeof tm.resolveThrows === 'function') {
      tm.resolveThrows(world, inputP1, inputP2, events, {
        forceLegacyThrowBridge: true,
        forceLegacyConsequenceHelpers: true,
        forceLegacyDialComboHelpers: true,
        probeOut: probe
      });
    }
  }

  function phaseAdvance(world, events){
    if (typeof global._fightPhaseAdvance === 'function') return !!global._fightPhaseAdvance(world, events);
    var lc = getLifecycleModule();
    if (lc && typeof lc.phaseAdvance === 'function') return !!lc.phaseAdvance(world, events);
    return false;
  }

  function resolveTimerWinner(world){
    if (typeof global._fightMkResolveTimerWinner === 'function') return global._fightMkResolveTimerWinner(world);
    var lc = getLifecycleModule();
    if (lc && typeof lc.resolveTimerWinner === 'function') return lc.resolveTimerWinner(world);
    return 'p1';
  }

  function setPhase(world, phase, events){
    if (typeof global._fightSetPhase === 'function') {
      global._fightSetPhase(world, phase, events);
      return;
    }
    var lc = getLifecycleModule();
    if (lc && typeof lc.setPhase === 'function') lc.setPhase(world, phase, events);
  }

  function setCallout(world, text){
    if (typeof global._fightMkSetCallout === 'function') {
      global._fightMkSetCallout(world, text);
      return;
    }
    var lc = getLifecycleModule();
    if (lc && typeof lc.setCallout === 'function') lc.setCallout(world, text);
  }

  function pushTelemetryHelperTrace(route, entry){
    if (!route || !route.trace) return;
    if (!Array.isArray(route.trace.telemetryHelperCalls)) route.trace.telemetryHelperCalls = [];
    route.trace.telemetryHelperCalls.push(entry);
  }

  function telemetryMismatchLabel(name){
    if (name === 'createL15Stats') return 'telemetry-init';
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
      ctx: String(route && route.context || 'step-shell'),
      path: 'forced'
    });
  }

  function l15Bump(roundStats, key, side, amt, route){
    var lc = getLifecycleModule();
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
      path = 'forced';
    }
    var afterValue = (roundStats && roundStats[key] && roundStats[key][side] !== undefined) ? (roundStats[key][side] | 0) : null;
    pushTelemetryHelperTrace(route, {
      name: 'l15Bump',
      ctx: String(route && route.context || 'step-shell'),
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
        ctx: String(route && route.context || 'step-shell'),
        op: 'l15Bump',
        path: path,
        reason: reason || 'legacy-telemetry-helper-route',
        detail: String(key || '')
      });
    }
  }

  function digestBoxList(list){
    var gm = getGeometryModule();
    if (gm && typeof gm.digestBoxList === 'function') return gm.digestBoxList(list, 12);
    var src = list || [];
    var lim = Math.min(src.length, 12);
    var out = [];
    var i, b;
    for (i = 0; i < lim; i++) {
      b = src[i] || {};
      out.push({ x1: b.x1 | 0, y1: b.y1 | 0, x2: b.x2 | 0, y2: b.y2 | 0 });
    }
    return { n: src.length | 0, d: out };
  }

  function buildPrePushProbe(world, p1, p2, opts){
    var gm = getGeometryModule();
    var a = (p1 && p1.boxes && p1.boxes.push && p1.boxes.push[0]) ? p1.boxes.push[0] : null;
    var b = (p2 && p2.boxes && p2.boxes.push && p2.boxes.push[0]) ? p2.boxes.push[0] : null;
    var has = false;
    if (a && b) {
      if (!useLegacyGeometry(world, opts) && gm && typeof gm.overlap === 'function') has = !!gm.overlap(a, b);
      else if (typeof global._fightOverlap === 'function') has = !!global._fightOverlap(a, b);
      else has = (a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1);
    }
    var ox = 0;
    if (has && a && b) ox = (Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) | 0;
    return {
      hasOverlap: has,
      oxRaw: ox | 0,
      p1Push: a ? { x1: a.x1 | 0, x2: a.x2 | 0, y1: a.y1 | 0, y2: a.y2 | 0 } : null,
      p2Push: b ? { x1: b.x1 | 0, x2: b.x2 | 0, y1: b.y1 | 0, y2: b.y2 | 0 } : null
    };
  }

  function runModuleCombatBody(world, p1, p2, i1, i2, e1, e2, events, opts){
    var probe = null;
    var wantsProbe = !!(opts && Array.isArray(opts.geometryProbeOut));
    var fighterProbe = null;
    var fighterProbeMap = null;
    var wantsFighterProbe = !!(opts && Array.isArray(opts.fighterProbeOut));
    var moveProbe = null;
    var moveProbeMap = null;
    var wantsMoveProbe = !!(opts && Array.isArray(opts.moveProbeOut));
    var strikeProbe = null;
    var wantsStrikeProbe = !!(opts && Array.isArray(opts.strikeProbeOut));
    var exchangeProbe = null;
    var wantsExchangeProbe = !!(opts && Array.isArray(opts.exchangeProbeOut));
    var throwProbe = null;
    var wantsThrowProbe = !!(opts && Array.isArray(opts.throwProbeOut));
    if (wantsProbe) {
      probe = { frame: world.frame | 0 };
    }
    if (wantsFighterProbe) {
      fighterProbe = { frame: world.frame | 0, p1: null, p2: null };
      fighterProbeMap = {};
    }
    if (wantsMoveProbe) {
      moveProbe = { frame: world.frame | 0, p1: null, p2: null };
      moveProbeMap = {};
    }
    if (wantsStrikeProbe) {
      strikeProbe = { frame: world.frame | 0, p1: [], p2: [] };
    }
    if (wantsExchangeProbe) {
      exchangeProbe = { frame: world.frame | 0, p1: [], p2: [] };
    }
    if (wantsThrowProbe) {
      throwProbe = { frame: world.frame | 0, p1: {}, p2: {} };
    }

    tickFighter(world, p1, p2, i1, e1, events, {
      forceLegacyFighterUpdate: !!(opts && opts.forceLegacyFighterUpdate),
      forceLegacyMoveBridge: !!(opts && opts.forceLegacyMoveBridge),
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      fighterProbeOut: fighterProbeMap,
      moveProbeOut: moveProbeMap
    });
    tickFighter(world, p2, p1, i2, e2, events, {
      forceLegacyFighterUpdate: !!(opts && opts.forceLegacyFighterUpdate),
      forceLegacyMoveBridge: !!(opts && opts.forceLegacyMoveBridge),
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      fighterProbeOut: fighterProbeMap,
      moveProbeOut: moveProbeMap
    });
    if (fighterProbe) {
      fighterProbe.p1 = fighterProbeMap.p1 || null;
      fighterProbe.p2 = fighterProbeMap.p2 || null;
      opts.fighterProbeOut.push(fighterProbe);
    }
    if (moveProbe) {
      moveProbe.p1 = moveProbeMap.p1 || null;
      moveProbe.p2 = moveProbeMap.p2 || null;
      opts.moveProbeOut.push(moveProbe);
    }
    resolveFacing(world, opts || {});

    if (probe) {
      probe.postFacing = {
        frame: world.frame | 0,
        p1Facing: p1.facing | 0,
        p2Facing: p2.facing | 0,
        p1x: p1.x | 0,
        p2x: p2.x | 0
      };
    }

    refreshBoxes(world, p1, i1, opts || {});
    refreshBoxes(world, p2, i2, opts || {});

    if (probe) {
      probe.postRefresh = {
        p1MoveId: String(p1.moveId || ''),
        p2MoveId: String(p2.moveId || ''),
        p1MoveFrame: p1.moveFrame | 0,
        p2MoveFrame: p2.moveFrame | 0,
        p1Facing: p1.facing | 0,
        p2Facing: p2.facing | 0,
        p1Hurt: digestBoxList(p1.boxes && p1.boxes.hurt),
        p1Push: digestBoxList(p1.boxes && p1.boxes.push),
        p1Hit: digestBoxList(p1.boxes && p1.boxes.hit),
        p2Hurt: digestBoxList(p2.boxes && p2.boxes.hurt),
        p2Push: digestBoxList(p2.boxes && p2.boxes.push),
        p2Hit: digestBoxList(p2.boxes && p2.boxes.hit)
      };
      probe.prePush = buildPrePushProbe(world, p1, p2, opts || {});
    }

    var p1xBeforePush = p1.x | 0;
    var p2xBeforePush = p2.x | 0;
    resolvePush(world, opts || {});

    if (probe) {
      var stageLeft = world && world.stage ? (world.stage.left | 0) : 0;
      var stageRight = world && world.stage ? (world.stage.right | 0) : 0;
      probe.postPush = {
        p1x: p1.x | 0,
        p2x: p2.x | 0,
        separation: ((p2.x | 0) - (p1.x | 0)) | 0,
        p1Moved: ((p1.x | 0) !== p1xBeforePush),
        p2Moved: ((p2.x | 0) !== p2xBeforePush),
        p1Clamped: ((p1.x | 0) === stageLeft || (p1.x | 0) === stageRight),
        p2Clamped: ((p2.x | 0) === stageLeft || (p2.x | 0) === stageRight)
      };
      opts.geometryProbeOut.push(probe);
    }

    var p1StrikeProbe = wantsStrikeProbe ? {} : null;
    var p2StrikeProbe = wantsStrikeProbe ? {} : null;
    var p1ExchangeProbe = wantsExchangeProbe ? {} : null;
    var p2ExchangeProbe = wantsExchangeProbe ? {} : null;
    tryStrike(world, p1, p2, i2, events, {
      forceLegacyStrikeBridge: !!(opts && opts.forceLegacyStrikeBridge),
      forceLegacyExchangeBridge: !!(opts && opts.forceLegacyExchangeBridge),
      forceLegacyConsequenceHelpers: !!(opts && opts.forceLegacyConsequenceHelpers),
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      probeOut: p1StrikeProbe,
      exchangeProbeOut: p1ExchangeProbe
    });
    tryStrike(world, p2, p1, i1, events, {
      forceLegacyStrikeBridge: !!(opts && opts.forceLegacyStrikeBridge),
      forceLegacyExchangeBridge: !!(opts && opts.forceLegacyExchangeBridge),
      forceLegacyConsequenceHelpers: !!(opts && opts.forceLegacyConsequenceHelpers),
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      probeOut: p2StrikeProbe,
      exchangeProbeOut: p2ExchangeProbe
    });
    if (strikeProbe) {
      if (p1StrikeProbe) strikeProbe.p1.push(p1StrikeProbe);
      if (p2StrikeProbe) strikeProbe.p2.push(p2StrikeProbe);
      opts.strikeProbeOut.push(strikeProbe);
    }
    if (exchangeProbe) {
      if (p1ExchangeProbe) exchangeProbe.p1.push(p1ExchangeProbe);
      if (p2ExchangeProbe) exchangeProbe.p2.push(p2ExchangeProbe);
      opts.exchangeProbeOut.push(exchangeProbe);
    }
    resolveThrows(world, i1, i2, events, {
      forceLegacyThrowBridge: !!(opts && opts.forceLegacyThrowBridge),
      forceLegacyHitstop: !!(opts && opts.forceLegacyHitstop),
      forceLegacyConsequenceHelpers: !!(opts && opts.forceLegacyConsequenceHelpers),
      forceLegacyDialComboHelpers: !!(opts && opts.forceLegacyDialComboHelpers),
      forceLegacyTelemetryHelpers: !!(opts && opts.forceLegacyTelemetryHelpers),
      throwProbeOut: throwProbe
    });
    if (throwProbe) {
      opts.throwProbeOut.push(throwProbe);
    }
  }

  function runLegacyCombatBody(world, p1, p2, i1, i2, e1, e2, events){
    if (typeof global._fightLegacyCombatBody === 'function') {
      global._fightLegacyCombatBody(world, p1, p2, i1, i2, e1, e2, events);
      return;
    }
    runModuleCombatBody(world, p1, p2, i1, i2, e1, e2, events, {
      forceLegacyGeometry: true,
      forceLegacyFighterUpdate: true,
      forceLegacyMoveBridge: true,
      forceLegacyStrikeBridge: true,
      forceLegacyExchangeBridge: true,
      forceLegacyThrowBridge: true,
      forceLegacyHitstop: true,
      forceLegacyConsequenceHelpers: true,
      forceLegacyDialComboHelpers: true,
      forceLegacyTelemetryHelpers: true
    });
  }

  function combatEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (
        t === 'hit' || t === 'block' || t === 'throw' || t === 'throwTech' || t === 'throwWhiff' ||
        t === 'dizzyWarn' || t === 'juggleCapReached' || t === 'cornerPressure' ||
        t === 'dialChainStep' || t === 'comboCancel' || t === 'comboLink' || t === 'frameTrap'
      ) {
        out.push({
          t: t,
          a: String(ev.attacker || ev.fighter || ''),
          d: String(ev.defender || ''),
          m: String(ev.moveId || ''),
          w: String(ev.winner || ''),
          tk: !!ev.timerKO
        });
      }
    }
    return out;
  }

  function dialComboEventDigest(events){
    var out = [];
    var arr = events || [];
    var i;
    for (i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'dialChainStep' || t === 'comboCancel' || t === 'comboLink' || t === 'frameTrap') {
        out.push({
          t: t,
          f: String(ev.fighter || ''),
          m: String(ev.moveId || ''),
          c: String(ev.chainId || ''),
          s: ev.step === undefined ? 0 : (ev.step | 0),
          a: String(ev.attacker || ''),
          d: String(ev.defender || '')
        });
      }
    }
    return out;
  }

  function fighterEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (
        t === 'dizzyWarn' ||
        t === 'dialChainStep' ||
        t === 'comboCancel' ||
        t === 'comboLink' ||
        t === 'frameTrap'
      ) {
        out.push({
          t: t,
          f: String(ev.fighter || ''),
          m: String(ev.moveId || ''),
          mt: String(ev.motionType || ''),
          w: (ev.window === undefined ? 0 : (ev.window | 0)),
          g: (ev.gap === undefined ? 0 : (ev.gap | 0))
        });
      }
    }
    return out;
  }

  function moveBridgeEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'dialChainStep' || t === 'comboCancel' || t === 'comboLink' || t === 'frameTrap') {
        out.push({
          t: t,
          f: String(ev.fighter || ''),
          m: String(ev.moveId || ''),
          mt: String(ev.motionType || ''),
          c: String(ev.chainId || ''),
          s: (ev.step === undefined ? 0 : (ev.step | 0)),
          w: (ev.window === undefined ? 0 : (ev.window | 0)),
          g: (ev.gap === undefined ? 0 : (ev.gap | 0)),
          fr: (ev.frame === undefined ? 0 : (ev.frame | 0))
        });
      }
    }
    return out;
  }

  function strikeEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'hit' || t === 'block' || t === 'juggleCapReached' || t === 'dizzyWarn' || t === 'cornerPressure') {
        out.push({
          t: t,
          a: String(ev.attacker || ''),
          d: String(ev.defender || ''),
          m: String(ev.moveId || ''),
          x: (ev.x === undefined ? 0 : (ev.x | 0)),
          y: (ev.y === undefined ? 0 : (ev.y | 0)),
          fr: (ev.frame === undefined ? 0 : (ev.frame | 0))
        });
      }
    }
    return out;
  }

  function exchangeEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'hit' || t === 'block' || t === 'juggleCapReached' || t === 'dizzyWarn' || t === 'cornerPressure') {
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

  function throwEventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'throw' || t === 'throwTech' || t === 'throwWhiff') {
        out.push({
          t: t,
          a: String(ev.attacker || ''),
          d: String(ev.defender || ''),
          m: String(ev.moveId || ''),
          x: (ev.x === undefined ? 0 : (ev.x | 0)),
          y: (ev.y === undefined ? 0 : (ev.y | 0)),
          fr: (ev.frame === undefined ? 0 : (ev.frame | 0))
        });
      }
    }
    return out;
  }

  function step(world, frameInputs, explicitLegacy, stepOpts) {
    var fi = normalizeFrameInput(frameInputs || neutralFrameInput());
    var opts = stepOpts || {};
    var prevHitstopSink = global.__fightHitstopProbeSink;
    var prevHitstopCallerHint = global.__fightHitstopCallerHint;
    var prevForceLegacyHitstop = global.__fightForceLegacyHitstop;
    var localHitstopProbe = null;
    var localTelemetryProbe = null;
    var telemetryRoute = null;
    var i;

    if (Array.isArray(opts.hitstopProbeOut)) {
      localHitstopProbe = { frame: world ? (world.frame | 0) : 0, calls: [], callCount: 0, callerOrder: [] };
      global.__fightHitstopProbeSink = localHitstopProbe;
    }
    if (Array.isArray(opts.telemetryProbeOut)) {
      localTelemetryProbe = { frame: world ? (world.frame | 0) : 0, telemetryHelperCalls: [] };
      telemetryRoute = {
        forceLegacyTelemetryHelpers: !!opts.forceLegacyTelemetryHelpers,
        trace: localTelemetryProbe,
        context: 'step-shell'
      };
    }
    global.__fightForceLegacyHitstop = !!opts.forceLegacyHitstop;

    try {
      if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) {
        pushRouteDiagnostic({
          frame: world ? (world.frame | 0) : 0,
          ctx: 'step-shell',
          op: 'step',
          path: 'legacy',
          reason: 'invalid-world',
          detail: 'missing-fighters'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var forceLegacyShell = !!opts.forceLegacyShell || (world.__stepOwner === 'legacy');
      if (forceLegacyShell || !hasLegacyMechanicsBridge()) {
        pushRouteDiagnostic({
          frame: world ? (world.frame | 0) : 0,
          ctx: 'step-shell',
          op: 'step',
          path: 'legacy',
          reason: forceLegacyShell ? 'forced-legacy-shell' : 'legacy-mechanics-bridge-unavailable',
          detail: forceLegacyShell ? String(world.__stepOwner === 'legacy' ? 'owner-legacy' : 'force-flag') : 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (world.__combatBodyOwner === undefined) world.__combatBodyOwner = 'module';
      if (world.__geometryOwner === undefined) world.__geometryOwner = 'module';
      if (world.__fighterOwner === undefined) world.__fighterOwner = 'module';
      if (world.__moveBridgeOwner === undefined) world.__moveBridgeOwner = 'module';
      if (world.__strikeBridgeOwner === undefined) world.__strikeBridgeOwner = 'module';
      if (world.__exchangeBridgeOwner === undefined) world.__exchangeBridgeOwner = 'module';
      if (world.__throwBridgeOwner === undefined) world.__throwBridgeOwner = 'module';
      if (world.__hitstopOwner === undefined) world.__hitstopOwner = 'module';

      var needsLegacyGeometry = useLegacyGeometry(world, opts);
      if (!needsLegacyGeometry && !hasModuleGeometryBridge() && hasLegacyGeometryBridge()) {
        world.__geometryOwner = 'legacy';
        needsLegacyGeometry = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'geometry-owner',
          path: 'legacy',
          reason: 'module-geometry-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyGeometry && !hasLegacyGeometryBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'geometry-owner',
          path: 'legacy',
          reason: 'legacy-geometry-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyGeometry && !hasModuleGeometryBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'geometry-owner',
          path: 'legacy',
          reason: 'module-geometry-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyFighter = useLegacyFighterUpdate(world, opts);
      if (!needsLegacyFighter && !hasModuleFighterBridge() && hasLegacyFighterBridge()) {
        world.__fighterOwner = 'legacy';
        needsLegacyFighter = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'fighter-owner',
          path: 'legacy',
          reason: 'module-fighter-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyFighter && !hasLegacyFighterBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'fighter-owner',
          path: 'legacy',
          reason: 'legacy-fighter-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyFighter && !hasModuleFighterBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'fighter-owner',
          path: 'legacy',
          reason: 'module-fighter-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyMoveBridge = useLegacyMoveBridge(world, opts);
      if (!needsLegacyMoveBridge && !hasModuleMoveBridge() && hasLegacyMoveBridge()) {
        world.__moveBridgeOwner = 'legacy';
        needsLegacyMoveBridge = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'move-bridge-owner',
          path: 'legacy',
          reason: 'module-move-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyMoveBridge && !hasLegacyMoveBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'move-bridge-owner',
          path: 'legacy',
          reason: 'legacy-move-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyMoveBridge && !hasModuleMoveBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'move-bridge-owner',
          path: 'legacy',
          reason: 'module-move-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyStrikeBridge = useLegacyStrikeBridge(world, opts);
      if (!needsLegacyStrikeBridge && !hasModuleStrikeBridge() && hasLegacyStrikeBridge()) {
        world.__strikeBridgeOwner = 'legacy';
        needsLegacyStrikeBridge = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'strike-bridge-owner',
          path: 'legacy',
          reason: 'module-strike-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyStrikeBridge && !hasLegacyStrikeBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'strike-bridge-owner',
          path: 'legacy',
          reason: 'legacy-strike-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyStrikeBridge && !hasModuleStrikeBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'strike-bridge-owner',
          path: 'legacy',
          reason: 'module-strike-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyExchangeBridge = useLegacyExchangeBridge(world, opts);
      if (!needsLegacyExchangeBridge && !hasModuleExchangeBridge() && hasLegacyExchangeBridge()) {
        world.__exchangeBridgeOwner = 'legacy';
        needsLegacyExchangeBridge = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'exchange-bridge-owner',
          path: 'legacy',
          reason: 'module-exchange-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyExchangeBridge && !hasLegacyExchangeBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'exchange-bridge-owner',
          path: 'legacy',
          reason: 'legacy-exchange-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyExchangeBridge && !hasModuleExchangeBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'exchange-bridge-owner',
          path: 'legacy',
          reason: 'module-exchange-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyThrowBridge = useLegacyThrowBridge(world, opts);
      if (!needsLegacyThrowBridge && !hasModuleThrowBridge() && hasLegacyThrowBridge()) {
        world.__throwBridgeOwner = 'legacy';
        needsLegacyThrowBridge = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'throw-bridge-owner',
          path: 'legacy',
          reason: 'module-throw-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyThrowBridge && !hasLegacyThrowBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'throw-bridge-owner',
          path: 'legacy',
          reason: 'legacy-throw-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyThrowBridge && !hasModuleThrowBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'throw-bridge-owner',
          path: 'legacy',
          reason: 'module-throw-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var needsLegacyHitstop = useLegacyHitstop(world, opts);
      if (!needsLegacyHitstop && !hasModuleHitstopBridge() && hasLegacyHitstopBridge()) {
        world.__hitstopOwner = 'legacy';
        needsLegacyHitstop = true;
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'hitstop-owner',
          path: 'legacy',
          reason: 'module-hitstop-bridge-missing',
          detail: 'owner-downgraded'
        });
      }
      if (needsLegacyHitstop && !hasLegacyHitstopBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'hitstop-owner',
          path: 'legacy',
          reason: 'legacy-hitstop-bridge-missing',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }
      if (!needsLegacyHitstop && !hasModuleHitstopBridge()) {
        pushRouteDiagnostic({
          frame: world.frame | 0,
          ctx: 'step-shell',
          op: 'hitstop-owner',
          path: 'legacy',
          reason: 'module-hitstop-bridge-missing-no-legacy',
          detail: 'fallback-to-legacy-step'
        });
        return legacyStep(world, fi, explicitLegacy);
      }

      var b = configFor(world);
      var events = [];
      var p1 = world.fighters.p1;
      var p2 = world.fighters.p2;
      var rs = world && world.l15Stats && world.l15Stats.round ? world.l15Stats.round : null;
      var i1 = fi.p1 || neutralInput();
      var i2 = fi.p2 || neutralInput();
      var e1 = { dir: (i1.dir !== p1.prevDir) ? 1 : 0, buttons: (i1.buttons & (~p1.prevButtons)) };
      var e2 = { dir: (i2.dir !== p2.prevDir) ? 1 : 0, buttons: (i2.buttons & (~p2.prevButtons)) };
      var p = phases();

      world.frame = (world.frame | 0) + 1;
      pushInputHistory(p1, i1, e1, (b.inputHistoryFrames || 20), world.frame);
      pushInputHistory(p2, i2, e2, (b.inputHistoryFrames || 20), world.frame);
      updateCharge(world, p1, i1);
      updateCharge(world, p2, i2);
      p1.prevDir = i1.dir;
      p1.prevButtons = i1.buttons;
      p2.prevDir = i2.dir;
      p2.prevButtons = i2.buttons;

      if (world.mkGba && world.mkGba.enabled) {
        if (world.mkGba.callout && world.mkGba.callout.framesLeft > 0) world.mkGba.callout.framesLeft--;
        if (world.mkGba.vfx && world.mkGba.vfx.heavyFlashFrames > 0) world.mkGba.vfx.heavyFlashFrames--;
        if (world.mkGba.vfx && world.mkGba.vfx.koInvertFrames > 0) world.mkGba.vfx.koInvertFrames--;
      }

      phaseAdvance(world, events);

      if (world.phase !== p.FIGHT) {
        refreshBoxes(world, p1, i1, opts);
        refreshBoxes(world, p2, i2, opts);
        writeSnapshotRing(world, b);
        return events;
      }

      if (world.interaction && world.interaction.hitstop > 0) {
        if (world.mkGba && world.mkGba.enabled && world.mkGba.roundTimerFrames > 0) {
          world.mkGba.roundTimerFrames--;
        }
        world.interaction.hitstop--;
        refreshBoxes(world, p1, i1, opts);
        refreshBoxes(world, p2, i2, opts);
        writeSnapshotRing(world, b);
        return events;
      }

      var forceLegacyCombatBody = !!opts.forceLegacyCombatBody || (world.__combatBodyOwner === 'legacy');
      if (forceLegacyCombatBody) runLegacyCombatBody(world, p1, p2, i1, i2, e1, e2, events);
      else runModuleCombatBody(world, p1, p2, i1, i2, e1, e2, events, opts);

      if (world.mkGba && world.mkGba.enabled && world.phase === p.FIGHT) {
        if (world.mkGba.roundTimerFrames > 0) {
          world.mkGba.roundTimerFrames--;
          if (!world.mkGba.timerWarned.s15 && world.mkGba.roundTimerFrames <= 15 * 60) {
            world.mkGba.timerWarned.s15 = true;
            setCallout(world, 'CRITICAL');
            events.push({ type: 'timerWarning', seconds: 15, remainingFrames: world.mkGba.roundTimerFrames });
          }
          if (!world.mkGba.timerWarned.s10 && world.mkGba.roundTimerFrames <= 10 * 60) {
            world.mkGba.timerWarned.s10 = true;
            setCallout(world, 'CRITICAL');
            events.push({ type: 'timerWarning', seconds: 10, remainingFrames: world.mkGba.roundTimerFrames });
          }
          if (!world.mkGba.timerWarned.s5 && world.mkGba.roundTimerFrames <= 5 * 60) {
            world.mkGba.timerWarned.s5 = true;
            setCallout(world, 'DECISIVE WINDOW');
            events.push({ type: 'timerWarning', seconds: 5, remainingFrames: world.mkGba.roundTimerFrames });
          }
        }

        if (world.mkGba.roundTimerFrames <= 0 && p1.health > 0 && p2.health > 0) {
          world.winner = resolveTimerWinner(world);
          if (rs) {
            var tloser = (world.winner === 'p1') ? p2 : p1;
            if (tloser.x <= world.stage.left + fromPx(8) || tloser.x >= world.stage.right - fromPx(8)) {
              l15Bump(rs, 'cornerKos', world.winner, 1, telemetryRoute);
            }
          }
          setPhase(world, p.KO, events);
          events.push({ type: 'timerExpired', winner: world.winner, remainingFrames: 0 });
          events.push({ type: 'ko', winner: world.winner, timerKO: true });
        }
      }

      if (p1.health <= 0 || p2.health <= 0) {
        world.winner = (p1.health <= 0) ? 'p2' : 'p1';
        if (rs) {
          var loser = (world.winner === 'p1') ? p2 : p1;
          if (loser.x <= world.stage.left + fromPx(8) || loser.x >= world.stage.right - fromPx(8)) {
            l15Bump(rs, 'cornerKos', world.winner, 1, telemetryRoute);
          }
        }
        setPhase(world, p.KO, events);
        events.push({ type: 'ko', winner: world.winner });
      }

      writeSnapshotRing(world, b);
      return events;
    } finally {
      if (localHitstopProbe) {
        localHitstopProbe.frame = world ? (world.frame | 0) : 0;
        if (!Array.isArray(localHitstopProbe.calls)) localHitstopProbe.calls = [];
        localHitstopProbe.callCount = localHitstopProbe.calls.length | 0;
        localHitstopProbe.callerOrder = [];
        for (i = 0; i < localHitstopProbe.calls.length; i++) {
          var pre = localHitstopProbe.calls[i] && localHitstopProbe.calls[i].preHitstopCall
            ? localHitstopProbe.calls[i].preHitstopCall
            : null;
          localHitstopProbe.callerOrder.push(String(pre && pre.caller || ''));
        }
        opts.hitstopProbeOut.push(localHitstopProbe);
      }
      if (localTelemetryProbe) {
        localTelemetryProbe.frame = world ? (world.frame | 0) : 0;
        localTelemetryProbe.lastRoundRecapDigest = recapDigest(world && world.l15Stats ? world.l15Stats.lastRoundRecap : null);
        localTelemetryProbe.lastMatchRecapDigest = recapDigest(world && world.l15Stats ? world.l15Stats.lastMatchRecap : null);
        opts.telemetryProbeOut.push(localTelemetryProbe);
      }
      global.__fightHitstopProbeSink = prevHitstopSink;
      global.__fightHitstopCallerHint = prevHitstopCallerHint;
      global.__fightForceLegacyHitstop = prevForceLegacyHitstop;
    }
  }

  function ensureWorld(world, opts, explicitLegacy){
    if (world) return world;

    var o = opts || {};
    var seed = (o.seed === undefined || o.seed === null) ? 1337 : o.seed;
    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }

    if (o.useLegacyShell) cfg.__stepOwner = 'legacy';
    else if (cfg.__stepOwner === undefined) cfg.__stepOwner = 'module';
    if (o.useLegacyCombatBody) cfg.__combatBodyOwner = 'legacy';
    else if (cfg.__combatBodyOwner === undefined) cfg.__combatBodyOwner = 'module';
    if (o.useLegacyGeometry) cfg.__geometryOwner = 'legacy';
    else if (cfg.__geometryOwner === undefined) cfg.__geometryOwner = 'module';
    if (o.useLegacyFighterUpdate) cfg.__fighterOwner = 'legacy';
    else if (cfg.__fighterOwner === undefined) cfg.__fighterOwner = 'module';
    if (o.useLegacyMoveBridge) cfg.__moveBridgeOwner = 'legacy';
    else if (cfg.__moveBridgeOwner === undefined) cfg.__moveBridgeOwner = 'module';
    if (o.useLegacyStrikeBridge) cfg.__strikeBridgeOwner = 'legacy';
    else if (cfg.__strikeBridgeOwner === undefined) cfg.__strikeBridgeOwner = 'module';
    if (o.useLegacyExchangeBridge) cfg.__exchangeBridgeOwner = 'legacy';
    else if (cfg.__exchangeBridgeOwner === undefined) cfg.__exchangeBridgeOwner = 'module';
    if (o.useLegacyThrowBridge) cfg.__throwBridgeOwner = 'legacy';
    else if (cfg.__throwBridgeOwner === undefined) cfg.__throwBridgeOwner = 'module';
    if (o.useLegacyHitstop) cfg.__hitstopOwner = 'legacy';
    else if (cfg.__hitstopOwner === undefined) cfg.__hitstopOwner = 'module';
    if (o.useLegacyTelemetryHelpers) cfg.forceLegacyTelemetryHelpers = true;

    var createMod = getCreateWorldModule();

    if (o.useLegacyCreate) {
      var legacy = resolveLegacy(explicitLegacy);
      if (legacy && typeof legacy.createWorld === 'function') return legacy.createWorld(seed, cfg);
      if (typeof global._fightCreateWorld === 'function') return global._fightCreateWorld(seed, cfg);
      throw new Error('combat.runInputLog: legacy createWorld unavailable');
    }

    if (createMod && typeof createMod.createWorld === 'function') {
      return createMod.createWorld(seed, cfg, explicitLegacy);
    }

    throw new Error('combat.runInputLog: createWorld module unavailable');
  }

  function createCompareWorld(primaryWorld, opts, explicitLegacy){
    var o = opts || {};
    if (
      !o.compareLegacyCreate &&
      !o.compareLegacyShell &&
      !o.compareLegacyCombatBody &&
      !o.compareCombatBodyOwners &&
      !o.compareLegacyGeometry &&
      !o.compareGeometryOwners &&
      !o.compareLegacyFighter &&
      !o.compareFighterOwners &&
      !o.compareLegacyMoveBridge &&
      !o.compareMoveBridgeOwners &&
      !o.compareLegacyStrikeBridge &&
      !o.compareStrikeBridgeOwners &&
      !o.compareLegacyExchangeBridge &&
      !o.compareExchangeBridgeOwners &&
      !o.compareLegacyThrowBridge &&
      !o.compareThrowBridgeOwners &&
      !o.compareLegacyHitstop &&
      !o.compareHitstopOwners &&
      !o.compareLegacyConsequenceHelpers &&
      !o.consequenceHelperMode &&
      !o.compareLegacyDialComboHelpers &&
      !o.dialComboHelperMode &&
      !o.compareLegacyTelemetryHelpers &&
      !o.telemetryHelperMode &&
      !o.compareWorld
    ) return null;
    if (o.compareWorld) return o.compareWorld;

    var seed = (o.seed === undefined || o.seed === null)
      ? (((primaryWorld && primaryWorld.rng && primaryWorld.rng.seed) !== undefined) ? primaryWorld.rng.seed : 1337)
      : o.seed;
    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }

    if (o.compareLegacyShell) cfg.__stepOwner = 'legacy';
    if (o.compareLegacyCombatBody || o.compareCombatBodyOwners) cfg.__combatBodyOwner = 'legacy';
    if (o.compareLegacyGeometry || o.compareGeometryOwners) cfg.__geometryOwner = 'legacy';
    if (o.compareLegacyFighter || o.compareFighterOwners) cfg.__fighterOwner = 'legacy';
    if (o.compareLegacyMoveBridge || o.compareMoveBridgeOwners) cfg.__moveBridgeOwner = 'legacy';
    if (o.compareLegacyStrikeBridge || o.compareStrikeBridgeOwners) cfg.__strikeBridgeOwner = 'legacy';
    if (o.compareLegacyExchangeBridge || o.compareExchangeBridgeOwners) cfg.__exchangeBridgeOwner = 'legacy';
    if (o.compareLegacyThrowBridge || o.compareThrowBridgeOwners) cfg.__throwBridgeOwner = 'legacy';
    if (o.compareLegacyHitstop || o.compareHitstopOwners) cfg.__hitstopOwner = 'legacy';
    if (o.compareLegacyTelemetryHelpers || o.telemetryHelperMode) cfg.forceLegacyTelemetryHelpers = true;

    var legacy = resolveLegacy(explicitLegacy);
    if (o.compareLegacyCreate) {
      if (legacy && typeof legacy.createWorld === 'function') return legacy.createWorld(seed, cfg);
      if (typeof global._fightCreateWorld === 'function') return global._fightCreateWorld(seed, cfg);
      return null;
    }

    var createMod = getCreateWorldModule();
    if (createMod && typeof createMod.createWorld === 'function') {
      return createMod.createWorld(seed, cfg, explicitLegacy);
    }

    if (legacy && typeof legacy.createWorld === 'function') return legacy.createWorld(seed, cfg);
    if (typeof global._fightCreateWorld === 'function') return global._fightCreateWorld(seed, cfg);
    return null;
  }

  function snapshotParityCheck(world){
    var sm = getSnapshotModule();
    if (!sm || typeof sm.snapshot !== 'function' || typeof sm.restore !== 'function') {
      return { ok: false, reason: 'snapshot-module-unavailable' };
    }
    var before = stateHash(world);
    var snap = sm.snapshot(world);
    sm.restore(world, snap);
    var after = stateHash(world);
    return { ok: before === after, before: before, after: after };
  }

  function geometryProbeDigest(probe){
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function fighterProbeDigest(probe){
    var fm = getFighterModule();
    if (fm && typeof fm.digestFighterProbe === 'function') return fm.digestFighterProbe(probe || null);
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function moveProbeDigest(probe){
    var mm = getMoveBridgeModule();
    if (mm && typeof mm.digestMoveProbe === 'function') return mm.digestMoveProbe(probe || null);
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function strikeProbeDigest(probe){
    var sm = getStrikeBridgeModule();
    if (sm && typeof sm.digestStrikeProbe === 'function') return sm.digestStrikeProbe(probe || null);
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function exchangeProbeDigest(probe){
    var em = getExchangeBridgeModule();
    if (em && typeof em.digestExchangeProbe === 'function') return em.digestExchangeProbe(probe || null);
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function throwProbeDigest(probe){
    var tm = getThrowBridgeModule();
    if (tm && typeof tm.digestThrowProbe === 'function') return tm.digestThrowProbe(probe || null);
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function hitstopProbeDigest(probe){
    var hm = getHitstopModule();
    if (hm && typeof hm.digestHitstopProbe === 'function') return hm.digestHitstopProbe(probe || null);
    var wm = getHashModule();
    if (wm && typeof wm.stableStringify === 'function') return wm.stableStringify(probe || null);
    return JSON.stringify(probe || null);
  }

  function normalizeHelperCallEntry(entry){
    var ev = entry || {};
    return {
      name: String(ev.name || ''),
      ctx: String(ev.ctx || ''),
      args: ev.args || null,
      ret: ev.ret || null
    };
  }

  function collectExchangeHelperCalls(side){
    var out = [];
    var arr = Array.isArray(side) ? side : [];
    var i, j, probe, calls;
    for (i = 0; i < arr.length; i++) {
      probe = arr[i] || null;
      calls = probe && Array.isArray(probe.helperCalls) ? probe.helperCalls : [];
      for (j = 0; j < calls.length; j++) out.push(normalizeHelperCallEntry(calls[j]));
    }
    return out;
  }

  function collectThrowHelperCalls(side){
    var out = [];
    var calls = side && Array.isArray(side.helperCalls) ? side.helperCalls : [];
    var i;
    for (i = 0; i < calls.length; i++) out.push(normalizeHelperCallEntry(calls[i]));
    return out;
  }

  function buildConsequenceHelperFrameProbe(exchangeFrame, throwFrame){
    var frame = 0;
    if (exchangeFrame && exchangeFrame.frame !== undefined) frame = exchangeFrame.frame | 0;
    else if (throwFrame && throwFrame.frame !== undefined) frame = throwFrame.frame | 0;
    return {
      frame: frame,
      exchange: {
        p1: collectExchangeHelperCalls(exchangeFrame && exchangeFrame.p1),
        p2: collectExchangeHelperCalls(exchangeFrame && exchangeFrame.p2)
      },
      throw: {
        p1: collectThrowHelperCalls(throwFrame && throwFrame.p1),
        p2: collectThrowHelperCalls(throwFrame && throwFrame.p2)
      }
    };
  }

  function consequenceHelperProbeDigest(probe){
    var hm = getHashModule();
    var normalized = probe || null;
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(normalized);
    return JSON.stringify(normalized);
  }

  function helperSubsystemForName(name){
    var n = String(name || '');
    if (n === 'configFor') return 'helper-config';
    if (n === 'strengthFromMove') return 'helper-strength';
    if (n === 'sfAttackPreset') return 'helper-preset';
    if (n === 'targetCombosEnabled') return 'helper-target-combos';
    if (n === 'mkAirHitsKey') return 'helper-air-key';
    if (n === 'l15WarnThreshold') return 'helper-warn-threshold';
    if (n === 'fromPx' || n === 'toPx' || n === 'abs') return 'helper-px-math';
    if (n === 'clamp') return 'helper-clamp';
    if (n === 'rosterMoveById') return 'helper-move-lookup';
    return 'helper-call-order';
  }

  function classifyHelperCallListMismatch(a, b){
    var aa = Array.isArray(a) ? a : [];
    var bb = Array.isArray(b) ? b : [];
    var i;
    if (aa.length !== bb.length) return 'helper-call-order';
    for (i = 0; i < aa.length; i++) {
      if (String(aa[i].name || '') !== String(bb[i].name || '')) return 'helper-call-order';
      if (String(aa[i].ctx || '') !== String(bb[i].ctx || '')) return 'helper-call-order';
      if (JSON.stringify(aa[i].args || null) !== JSON.stringify(bb[i].args || null)) {
        return helperSubsystemForName(aa[i].name || bb[i].name || '');
      }
      if (JSON.stringify(aa[i].ret || null) !== JSON.stringify(bb[i].ret || null)) {
        return helperSubsystemForName(aa[i].name || bb[i].name || '');
      }
    }
    return '';
  }

  function classifyConsequenceHelperProbeMismatch(a, b){
    var pa = a || null;
    var pb = b || null;
    var mismatch = '';
    if (!pa || !pb) return 'helper-call-order';
    mismatch = classifyHelperCallListMismatch(pa.exchange && pa.exchange.p1, pb.exchange && pb.exchange.p1);
    if (mismatch) return mismatch;
    mismatch = classifyHelperCallListMismatch(pa.exchange && pa.exchange.p2, pb.exchange && pb.exchange.p2);
    if (mismatch) return mismatch;
    mismatch = classifyHelperCallListMismatch(pa.throw && pa.throw.p1, pb.throw && pb.throw.p1);
    if (mismatch) return mismatch;
    mismatch = classifyHelperCallListMismatch(pa.throw && pa.throw.p2, pb.throw && pb.throw.p2);
    if (mismatch) return mismatch;
    return 'helper-call-order';
  }

  function normalizeDialHelperCallEntry(entry){
    var ev = entry || {};
    return {
      name: String(ev.name || ''),
      ctx: String(ev.ctx || ''),
      kind: String(ev.kind || ''),
      fighter: String(ev.fighter || ''),
      sameSlot: !!ev.sameSlot,
      dial: ev.dial || null,
      rosterKey: String(ev.rosterKey || ''),
      comboCount: ev.comboCount === undefined ? 0 : (ev.comboCount | 0),
      comboDigest: String(ev.comboDigest || ''),
      reason: String(ev.reason || ''),
      before: ev.before || null,
      after: ev.after || null,
      value: ev.value === undefined ? null : !!ev.value
    };
  }

  function collectDialHelperCalls(list){
    var out = [];
    var arr = Array.isArray(list) ? list : [];
    var i;
    for (i = 0; i < arr.length; i++) out.push(normalizeDialHelperCallEntry(arr[i]));
    return out;
  }

  function collectExchangeDialHelperCalls(side){
    var out = [];
    var arr = Array.isArray(side) ? side : [];
    var i, j, probe, calls;
    for (i = 0; i < arr.length; i++) {
      probe = arr[i] || null;
      calls = probe && Array.isArray(probe.dialHelperCalls) ? probe.dialHelperCalls : [];
      for (j = 0; j < calls.length; j++) out.push(normalizeDialHelperCallEntry(calls[j]));
    }
    return out;
  }

  function buildDialComboHelperFrameProbe(moveFrame, fighterFrame, exchangeFrame, throwFrame){
    var frame = 0;
    if (moveFrame && moveFrame.frame !== undefined) frame = moveFrame.frame | 0;
    else if (fighterFrame && fighterFrame.frame !== undefined) frame = fighterFrame.frame | 0;
    else if (exchangeFrame && exchangeFrame.frame !== undefined) frame = exchangeFrame.frame | 0;
    else if (throwFrame && throwFrame.frame !== undefined) frame = throwFrame.frame | 0;
    return {
      frame: frame,
      move: {
        p1: collectDialHelperCalls(moveFrame && moveFrame.p1 && moveFrame.p1.dialHelperCalls),
        p2: collectDialHelperCalls(moveFrame && moveFrame.p2 && moveFrame.p2.dialHelperCalls)
      },
      fighter: {
        p1: collectDialHelperCalls(fighterFrame && fighterFrame.p1 && fighterFrame.p1.dialHelperCalls),
        p2: collectDialHelperCalls(fighterFrame && fighterFrame.p2 && fighterFrame.p2.dialHelperCalls)
      },
      exchange: {
        p1: collectExchangeDialHelperCalls(exchangeFrame && exchangeFrame.p1),
        p2: collectExchangeDialHelperCalls(exchangeFrame && exchangeFrame.p2)
      },
      throw: {
        p1: collectDialHelperCalls(throwFrame && throwFrame.p1 && throwFrame.p1.dialHelperCalls),
        p2: collectDialHelperCalls(throwFrame && throwFrame.p2 && throwFrame.p2.dialHelperCalls)
      }
    };
  }

  function dialComboHelperProbeDigest(probe){
    var hm = getHashModule();
    var normalized = probe || null;
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(normalized);
    return JSON.stringify(normalized);
  }

  function dialHelperSubsystemForName(name){
    var n = String(name || '');
    if (n === 'mkDialState') return 'dial-state-access';
    if (n === 'mkCombosFor') return 'combo-lookup';
    if (n === 'mkResetDial') return 'dial-reset';
    if (n === 'targetCombosEnabled') return 'target-combo-gate';
    return 'dial-helper-call-order';
  }

  function classifyDialHelperCallListMismatch(a, b){
    var aa = Array.isArray(a) ? a : [];
    var bb = Array.isArray(b) ? b : [];
    var i;
    if (aa.length !== bb.length) return 'dial-helper-call-order';
    for (i = 0; i < aa.length; i++) {
      if (String(aa[i].name || '') !== String(bb[i].name || '')) return 'dial-helper-call-order';
      if (String(aa[i].ctx || '') !== String(bb[i].ctx || '')) return 'dial-helper-call-order';
      if (String(aa[i].kind || '') !== String(bb[i].kind || '')) return 'dial-helper-call-order';
      if (JSON.stringify(aa[i]) !== JSON.stringify(bb[i])) {
        return dialHelperSubsystemForName(aa[i].name || bb[i].name || '');
      }
    }
    return '';
  }

  function classifyDialComboHelperProbeMismatch(a, b){
    var pa = a || null;
    var pb = b || null;
    var mismatch = '';
    if (!pa || !pb) return 'dial-helper-call-order';
    mismatch = classifyDialHelperCallListMismatch(pa.move && pa.move.p1, pb.move && pb.move.p1);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.move && pa.move.p2, pb.move && pb.move.p2);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.fighter && pa.fighter.p1, pb.fighter && pb.fighter.p1);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.fighter && pa.fighter.p2, pb.fighter && pb.fighter.p2);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.exchange && pa.exchange.p1, pb.exchange && pb.exchange.p1);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.exchange && pa.exchange.p2, pb.exchange && pb.exchange.p2);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.throw && pa.throw.p1, pb.throw && pb.throw.p1);
    if (mismatch) return mismatch;
    mismatch = classifyDialHelperCallListMismatch(pa.throw && pa.throw.p2, pb.throw && pb.throw.p2);
    if (mismatch) return mismatch;
    return 'dial-helper-call-order';
  }

  function stableDigest(value){
    var hm = getHashModule();
    if (hm && typeof hm.stableStringify === 'function') return hm.stableStringify(value === undefined ? null : value);
    return JSON.stringify(value === undefined ? null : value);
  }

  function recapDigest(value){
    return stableDigest(value || null);
  }

  function telemetryInitProbe(world){
    var stats = world && world.l15Stats ? world.l15Stats : null;
    return {
      matchDigest: stableDigest(stats && stats.match ? stats.match : null),
      roundDigest: stableDigest(stats && stats.round ? stats.round : null),
      flagsDigest: stableDigest(stats && stats.flags ? stats.flags : null),
      hasLastRoundRecap: !!(stats && stats.lastRoundRecap),
      hasLastMatchRecap: !!(stats && stats.lastMatchRecap),
      lastRoundRecapDigest: recapDigest(stats && stats.lastRoundRecap ? stats.lastRoundRecap : null),
      lastMatchRecapDigest: recapDigest(stats && stats.lastMatchRecap ? stats.lastMatchRecap : null)
    };
  }

  function telemetryInitProbeDigest(probe){
    return stableDigest(probe || null);
  }

  function normalizeTelemetryHelperCallEntry(entry){
    var ev = entry || {};
    return {
      name: String(ev.name || ''),
      ctx: String(ev.ctx || ''),
      path: String(ev.path || ''),
      key: String(ev.key || ''),
      side: String(ev.side || ''),
      amt: ev.amt === undefined ? null : ev.amt,
      hasBlock: !!ev.hasBlock,
      hasKey: !!ev.hasKey,
      hasSide: !!ev.hasSide,
      beforeValue: ev.beforeValue === undefined ? null : ev.beforeValue,
      afterValue: ev.afterValue === undefined ? null : ev.afterValue,
      applied: !!ev.applied,
      delta: ev.delta === undefined ? 0 : (ev.delta | 0)
    };
  }

  function collectTelemetryHelperCalls(list){
    var out = [];
    var arr = Array.isArray(list) ? list : [];
    var i;
    for (i = 0; i < arr.length; i++) out.push(normalizeTelemetryHelperCallEntry(arr[i]));
    return out;
  }

  function collectExchangeTelemetryHelperCalls(side){
    var out = [];
    var arr = Array.isArray(side) ? side : [];
    var i, j, probe, calls;
    for (i = 0; i < arr.length; i++) {
      probe = arr[i] || null;
      calls = probe && Array.isArray(probe.telemetryHelperCalls) ? probe.telemetryHelperCalls : [];
      for (j = 0; j < calls.length; j++) out.push(normalizeTelemetryHelperCallEntry(calls[j]));
    }
    return out;
  }

  function buildTelemetryHelperFrameProbe(fighterFrame, exchangeFrame, throwFrame, stepFrame){
    var frame = 0;
    if (fighterFrame && fighterFrame.frame !== undefined) frame = fighterFrame.frame | 0;
    else if (exchangeFrame && exchangeFrame.frame !== undefined) frame = exchangeFrame.frame | 0;
    else if (throwFrame && throwFrame.frame !== undefined) frame = throwFrame.frame | 0;
    else if (stepFrame && stepFrame.frame !== undefined) frame = stepFrame.frame | 0;
    return {
      frame: frame,
      fighter: {
        p1: collectTelemetryHelperCalls(fighterFrame && fighterFrame.p1 && fighterFrame.p1.telemetryHelperCalls),
        p2: collectTelemetryHelperCalls(fighterFrame && fighterFrame.p2 && fighterFrame.p2.telemetryHelperCalls)
      },
      exchange: {
        p1: collectExchangeTelemetryHelperCalls(exchangeFrame && exchangeFrame.p1),
        p2: collectExchangeTelemetryHelperCalls(exchangeFrame && exchangeFrame.p2)
      },
      throw: {
        p1: collectTelemetryHelperCalls(throwFrame && throwFrame.p1 && throwFrame.p1.telemetryHelperCalls),
        p2: collectTelemetryHelperCalls(throwFrame && throwFrame.p2 && throwFrame.p2.telemetryHelperCalls)
      },
      step: collectTelemetryHelperCalls(stepFrame && stepFrame.telemetryHelperCalls),
      summaries: {
        lastRoundRecapDigest: String(stepFrame && stepFrame.lastRoundRecapDigest || ''),
        lastMatchRecapDigest: String(stepFrame && stepFrame.lastMatchRecapDigest || '')
      }
    };
  }

  function telemetryHelperProbeDigest(probe){
    return stableDigest(probe || null);
  }

  function classifyTelemetryHelperCallListMismatch(a, b){
    var aa = Array.isArray(a) ? a : [];
    var bb = Array.isArray(b) ? b : [];
    var i;
    if (aa.length !== bb.length) return 'telemetry-call-order';
    for (i = 0; i < aa.length; i++) {
      if (String(aa[i].name || '') !== String(bb[i].name || '')) return 'telemetry-call-order';
      if (String(aa[i].ctx || '') !== String(bb[i].ctx || '')) return 'telemetry-call-order';
      if (String(aa[i].path || '') !== String(bb[i].path || '')) return 'telemetry-call-order';
      if (JSON.stringify(aa[i]) !== JSON.stringify(bb[i])) return 'telemetry-bump';
    }
    return '';
  }

  function classifyTelemetryHelperProbeMismatch(a, b){
    var pa = a || null;
    var pb = b || null;
    var mismatch = '';
    if (!pa || !pb) return 'telemetry-call-order';
    mismatch = classifyTelemetryHelperCallListMismatch(pa.fighter && pa.fighter.p1, pb.fighter && pb.fighter.p1);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.fighter && pa.fighter.p2, pb.fighter && pb.fighter.p2);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.exchange && pa.exchange.p1, pb.exchange && pb.exchange.p1);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.exchange && pa.exchange.p2, pb.exchange && pb.exchange.p2);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.throw && pa.throw.p1, pb.throw && pb.throw.p1);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.throw && pa.throw.p2, pb.throw && pb.throw.p2);
    if (mismatch) return mismatch;
    mismatch = classifyTelemetryHelperCallListMismatch(pa.step, pb.step);
    if (mismatch) return mismatch;
    if (String(pa.summaries && pa.summaries.lastRoundRecapDigest || '') !== String(pb.summaries && pb.summaries.lastRoundRecapDigest || '')) return 'telemetry-summary';
    if (String(pa.summaries && pa.summaries.lastMatchRecapDigest || '') !== String(pb.summaries && pb.summaries.lastMatchRecapDigest || '')) return 'telemetry-summary';
    return 'telemetry-call-order';
  }

  function applyGeometryMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    var k = String(kind || '').toLowerCase();
    if (k === 'facing') {
      p1.facing = (p1.facing === 1) ? -1 : 1;
    } else if (k === 'frame-data') {
      p1.moveFrame = (p1.moveFrame | 0) + 1;
    } else if (k === 'box-refresh') {
      p1.boxes = { hurt: [], hit: [], push: [] };
    } else if (k === 'box-transform') {
      if (p1.boxes && p1.boxes.push && p1.boxes.push[0]) p1.boxes.push[0].x1 = (p1.boxes.push[0].x1 | 0) + 1;
      else p1.x = (p1.x | 0) + 1;
    } else if (k === 'overlap') {
      if (p2.boxes && p2.boxes.push && p2.boxes.push[0]) p2.boxes.push[0].x1 = (p2.boxes.push[0].x1 | 0) + fromPx(1);
      else p2.x = (p2.x | 0) + fromPx(1);
    } else if (k === 'push') {
      p1.x = (p1.x | 0) + 1;
    } else if (k === 'geometry-digest') {
      p1.y = (p1.y | 0) + 1;
    }
  }

  function applyFighterMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var k = String(kind || '').toLowerCase();
    if (k === 'status-tick') {
      p1.hitstunFramesLeft = (p1.hitstunFramesLeft | 0) + 1;
    } else if (k === 'movement-tick') {
      p1.x = (p1.x | 0) + 1;
    } else if (k === 'move-select-bridge') {
      p1.lastParserDecision = { motionType: 'forced', moveId: 'forced', rejected: [] };
    } else if (k === 'move-start-bridge') {
      p1.moveId = 'forced_move';
    } else if (k === 'move-tick-bridge') {
      p1.moveFrame = (p1.moveFrame | 0) + 1;
    } else if (k === 'landing') {
      if (world.mkGba && world.mkGba.juggle) {
        var key = (typeof global._fightMkAirHitsKey === 'function')
          ? global._fightMkAirHitsKey('p1')
          : 'p1AirHitsTaken';
        world.mkGba.juggle[key] = (world.mkGba.juggle[key] | 0) + 1;
      } else {
        p1.y = (p1.y | 0) + 1;
      }
    } else if (k === 'grounded-state') {
      p1.grounded = !p1.grounded;
    } else if (k === 'fighter-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function applyMoveBridgeMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var k = String(kind || '').toLowerCase();
    if (k === 'move-select') {
      p1.lastParserDecision = { motionType: 'none', moveId: '', rejected: ['forced:select'] };
    } else if (k === 'move-start') {
      p1.moveId = 'forced_move_start';
      p1.stateFrame = (p1.stateFrame | 0) + 1;
    } else if (k === 'move-tick') {
      p1.moveFrame = (p1.moveFrame | 0) + 1;
    } else if (k === 'cancel-window') {
      p1.lastMoveContact = (p1.lastMoveContact === 'hit') ? 'whiff' : 'hit';
    } else if (k === 'charge-check') {
      p1.charge = p1.charge || {};
      p1.charge.backReady = (p1.charge.backReady | 0) + 1;
    } else if (k === 'parser-decision') {
      p1.lastParserDecision = { motionType: 'forced', moveId: 'forced_parser', rejected: [] };
    } else if (k === 'move-end') {
      p1.moveId = null;
      p1.moveFrame = 0;
      p1.moveHitRegistered = false;
    } else if (k === 'move-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function applyStrikeBridgeMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    var k = String(kind || '').toLowerCase();
    if (k === 'strike-attempt') {
      p1.moveId = null;
    } else if (k === 'active-frame') {
      p1.state = (p1.state === 'active') ? 'startup' : 'active';
    } else if (k === 'contact-detect') {
      p2.boxes = p2.boxes || {};
      p2.boxes.hurt = [];
    } else if (k === 'exchange-bridge') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced', hitType: 'hit' };
    } else if (k === 'hitstop-bridge') {
      world.interaction = world.interaction || {};
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
    } else if (k === 'move-hit-registered') {
      p1.moveHitRegistered = !p1.moveHitRegistered;
    } else if (k === 'strike-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function applyExchangeBridgeMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    var k = String(kind || '').toLowerCase();
    if (k === 'exchange-entry') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced-entry', hitType: 'hit' };
    } else if (k === 'block-hit-branch') {
      p2.blockstunFramesLeft = (p2.blockstunFramesLeft | 0) + 1;
      p2.hitstunFramesLeft = 0;
    } else if (k === 'damage-write') {
      p2.health = Math.max(0, (p2.health | 0) - 1);
    } else if (k === 'stun-write') {
      p2.hitstunFramesLeft = (p2.hitstunFramesLeft | 0) + 1;
    } else if (k === 'knockdown-write') {
      p2.knockdownFramesLeft = Math.max(p2.knockdownFramesLeft | 0, 1);
    } else if (k === 'pushback-write') {
      p2.x = (p2.x | 0) + 1;
    } else if (k === 'last-exchange') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced-last', hitType: 'block' };
    } else if (k === 'exchange-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    } else if (k === 'hitstop-bridge') {
      world.interaction = world.interaction || {};
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
    } else if (k === 'juggle-side-effect') {
      if (world.mkGba && world.mkGba.juggle) {
        world.mkGba.juggle.p2AirHitsTaken = (world.mkGba.juggle.p2AirHitsTaken | 0) + 1;
      } else {
        p2.y = (p2.y | 0) + 1;
      }
    } else if (k === 'dizzy-side-effect') {
      p2.dizzyFramesLeft = (p2.dizzyFramesLeft | 0) + 1;
    } else if (k === 'corner-pressure') {
      world.l15Stats = world.l15Stats || {};
      world.l15Stats.flags = world.l15Stats.flags || { dizzyWarned: { p1: false, p2: false }, cornerToastUntilFrame: 0 };
      world.l15Stats.flags.cornerToastUntilFrame = (world.l15Stats.flags.cornerToastUntilFrame | 0) + 1;
    } else if (k === 'dial-side-effect') {
      world.mkGba = world.mkGba || {};
      world.mkGba.comboDial = world.mkGba.comboDial || {
        p1: { chainId: '', step: 0, window: 0 },
        p2: { chainId: '', step: 0, window: 0 }
      };
      world.mkGba.comboDial.p1 = world.mkGba.comboDial.p1 || { chainId: '', step: 0, window: 0 };
      world.mkGba.comboDial.p1.window = (world.mkGba.comboDial.p1.window | 0) + 1;
    } else if (k === 'telemetry-side-effect') {
      world.l15Stats = world.l15Stats || {};
      world.l15Stats.round = world.l15Stats.round || { hitsLanded: { p1: 0, p2: 0 } };
      world.l15Stats.round.hitsLanded = world.l15Stats.round.hitsLanded || { p1: 0, p2: 0 };
      world.l15Stats.round.hitsLanded[p1.id] = (world.l15Stats.round.hitsLanded[p1.id] | 0) + 1;
    }
  }

  function applyThrowBridgeMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    var k = String(kind || '').toLowerCase();
    if (k === 'throw-gate') {
      p1.state = 'idle';
      p1.moveFrame = 0;
    } else if (k === 'throw-tech') {
      p2.throwTechFramesLeft = (p2.throwTechFramesLeft | 0) + 1;
    } else if (k === 'throw-connect') {
      p2.health = Math.max(0, (p2.health | 0) - 1);
      p2.knockdownFramesLeft = Math.max(p2.knockdownFramesLeft | 0, 1);
    } else if (k === 'throw-whiff') {
      p1.moveHitRegistered = !p1.moveHitRegistered;
    } else if (k === 'throw-last-exchange') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced-throw-last', hitType: 'throw' };
    } else if (k === 'throw-hitstop') {
      world.interaction = world.interaction || {};
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
    } else if (k === 'throw-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    } else if (k === 'throw-handoff') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced-throw-handoff', hitType: 'throw' };
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
    }
  }

  function applyHitstopMismatch(world, probe, kind){
    var k = String(kind || '').toLowerCase();
    if (!probe || typeof probe !== 'object') return;
    if (!Array.isArray(probe.calls)) probe.calls = [];
    if (!world || !world.interaction) {
      world = world || {};
      world.interaction = world.interaction || { hitstop: 0 };
    }
    var calls = probe.calls;
    var c0 = calls.length ? calls[0] : null;

    function mkDefaultCall(){
      return {
        preHitstopCall: {
          frame: world ? (world.frame | 0) : 0,
          caller: 'forced',
          keyIn: 'light',
          hitstopBefore: world && world.interaction ? (world.interaction.hitstop | 0) : 0,
          ownerPath: 'legacy'
        },
        postHitstopCall: {
          resolvedKey: 'light',
          resolvedValue: 6,
          hitstopAfter: world && world.interaction ? (world.interaction.hitstop | 0) : 0,
          applied: true
        }
      };
    }

    if (!c0) {
      c0 = mkDefaultCall();
      calls.push(c0);
    }

    if (k === 'hitstop-key') {
      c0.preHitstopCall.keyIn = 'heavy';
      c0.postHitstopCall.resolvedKey = 'heavy';
      probe.__forcedKind = 'hitstop-key';
    } else if (k === 'hitstop-value') {
      c0.postHitstopCall.resolvedValue = (c0.postHitstopCall.resolvedValue | 0) + 1;
      c0.postHitstopCall.hitstopAfter = (c0.postHitstopCall.hitstopAfter | 0) + 1;
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
      probe.__forcedKind = 'hitstop-value';
    } else if (k === 'hitstop-callsite') {
      c0.preHitstopCall.caller = 'forced-callsite';
      probe.__forcedKind = 'hitstop-callsite';
    } else if (k === 'hitstop-missing-call') {
      if (calls.length > 0) calls.shift();
      probe.__forcedKind = 'hitstop-missing-call';
    } else if (k === 'hitstop-double-call') {
      calls.push(JSON.parse(JSON.stringify(calls[0] || mkDefaultCall())));
      probe.__forcedKind = 'hitstop-double-call';
    }

    probe.callCount = calls.length | 0;
    probe.callerOrder = [];
    for (var i = 0; i < calls.length; i++) {
      var pre = calls[i] && calls[i].preHitstopCall ? calls[i].preHitstopCall : {};
      probe.callerOrder.push(String(pre.caller || ''));
    }
  }

  function runInputLog(world, log, maxFrames, opts, explicitLegacy) {
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var frames = (maxFrames === undefined || maxFrames === null)
      ? (o.frames || l.length || 0)
      : maxFrames;
    frames = Math.max(0, Math.floor(frames));
    var captureRouteDiagnostics = !!(o.captureRouteDiagnostics || o.captureDependencyAudit);
    var captureDependencyAudit = !!o.captureDependencyAudit;
    var routeDiagnostics = captureRouteDiagnostics ? [] : null;
    var compareRouteDiagnostics = captureRouteDiagnostics ? [] : null;
    var integrityIssues = [];
    var primary = withRouteDiagnosticSink(routeDiagnostics, function(){
      return ensureWorld(world, o, explicitLegacy);
    });
    var compare = withRouteDiagnosticSink(compareRouteDiagnostics, function(){
      return createCompareWorld(primary, o, explicitLegacy);
    });
    var dependencyAudit = captureDependencyAudit ? buildDependencyAuditEntry(primary, o, explicitLegacy, false) : null;
    var compareDependencyAudit = (captureDependencyAudit && compare) ? buildDependencyAuditEntry(compare, o, explicitLegacy, true) : null;

    var lifecycleMode = !!(o.lifecycleMode || o.compareLifecycleOwners || o.compareLegacyLifecycle);
    var stepShellMode = !!(o.stepShellMode || o.compareLegacyShell || o.compareStepShells);
    var combatBodyMode = !!(o.combatBodyMode || o.compareLegacyCombatBody || o.compareCombatBodyOwners);
    var geometryMode = !!(o.geometryMode || o.compareLegacyGeometry || o.compareGeometryOwners);
    var fighterMode = !!(o.fighterMode || o.compareLegacyFighter || o.compareFighterOwners);
    var moveBridgeMode = !!(o.moveBridgeMode || o.compareLegacyMoveBridge || o.compareMoveBridgeOwners);
    var strikeBridgeMode = !!(o.strikeBridgeMode || o.compareLegacyStrikeBridge || o.compareStrikeBridgeOwners);
    var exchangeBridgeMode = !!(o.exchangeBridgeMode || o.compareLegacyExchangeBridge || o.compareExchangeBridgeOwners);
    var throwBridgeMode = !!(o.throwBridgeMode || o.compareLegacyThrowBridge || o.compareThrowBridgeOwners);
    var hitstopMode = !!(o.hitstopMode || o.compareLegacyHitstop || o.compareHitstopOwners);
    var consequenceHelperMode = !!(o.consequenceHelperMode || o.compareLegacyConsequenceHelpers);
    var dialComboHelperMode = !!(o.dialComboHelperMode || o.compareLegacyDialComboHelpers);
    var telemetryHelperMode = !!(o.telemetryHelperMode || o.compareLegacyTelemetryHelpers);
    var events = 0;
    var hashes = [];
    var compareHashes = [];
    var digests = [];
    var geometryProbes = [];
    var compareGeometryProbes = [];
    var fighterProbes = [];
    var compareFighterProbes = [];
    var moveProbes = [];
    var compareMoveProbes = [];
    var strikeProbes = [];
    var compareStrikeProbes = [];
    var exchangeProbes = [];
    var compareExchangeProbes = [];
    var throwProbes = [];
    var compareThrowProbes = [];
    var hitstopProbes = [];
    var compareHitstopProbes = [];
    var consequenceHelperProbes = [];
    var compareConsequenceHelperProbes = [];
    var dialComboHelperProbes = [];
    var compareDialComboHelperProbes = [];
    var telemetryHelperProbes = [];
    var compareTelemetryHelperProbes = [];
    var moduleTelemetryInitProbe = telemetryInitProbe(primary);
    var compareTelemetryInitProbe = compare ? telemetryInitProbe(compare) : null;
    var snapshotParityOk = true;
    var diff = null;
    var subsystem = '';
    var evictions = 0;
    var forceGeometryKind = String(o.forceGeometryMismatchKind || global.__fightGeometryForceMismatchKind || '').toLowerCase();
    if (forceGeometryKind === 'none' || forceGeometryKind === 'off' || forceGeometryKind === 'clear') forceGeometryKind = '';
    var forceGeometryFrame = (o.forceGeometryMismatchFrame === undefined || o.forceGeometryMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceGeometryMismatchFrame | 0);
    var forceFighterKind = String(o.forceFighterMismatchKind || global.__fightFighterForceMismatchKind || '').toLowerCase();
    if (forceFighterKind === 'none' || forceFighterKind === 'off' || forceFighterKind === 'clear') forceFighterKind = '';
    var forceFighterFrame = (o.forceFighterMismatchFrame === undefined || o.forceFighterMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceFighterMismatchFrame | 0);
    var forceMoveBridgeKind = String(o.forceMoveBridgeMismatchKind || global.__fightMoveBridgeForceMismatchKind || '').toLowerCase();
    if (forceMoveBridgeKind === 'none' || forceMoveBridgeKind === 'off' || forceMoveBridgeKind === 'clear') forceMoveBridgeKind = '';
    var forceMoveBridgeFrame = (o.forceMoveBridgeMismatchFrame === undefined || o.forceMoveBridgeMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceMoveBridgeMismatchFrame | 0);
    var forceStrikeBridgeKind = String(o.forceStrikeBridgeMismatchKind || global.__fightStrikeBridgeForceMismatchKind || '').toLowerCase();
    if (forceStrikeBridgeKind === 'none' || forceStrikeBridgeKind === 'off' || forceStrikeBridgeKind === 'clear') forceStrikeBridgeKind = '';
    var forceStrikeBridgeFrame = (o.forceStrikeBridgeMismatchFrame === undefined || o.forceStrikeBridgeMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceStrikeBridgeMismatchFrame | 0);
    var forceExchangeBridgeKind = String(o.forceExchangeBridgeMismatchKind || global.__fightExchangeBridgeForceMismatchKind || '').toLowerCase();
    if (forceExchangeBridgeKind === 'none' || forceExchangeBridgeKind === 'off' || forceExchangeBridgeKind === 'clear') forceExchangeBridgeKind = '';
    var forceExchangeBridgeFrame = (o.forceExchangeBridgeMismatchFrame === undefined || o.forceExchangeBridgeMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceExchangeBridgeMismatchFrame | 0);
    var forceThrowBridgeKind = String(o.forceThrowBridgeMismatchKind || global.__fightThrowBridgeForceMismatchKind || '').toLowerCase();
    if (forceThrowBridgeKind === 'none' || forceThrowBridgeKind === 'off' || forceThrowBridgeKind === 'clear') forceThrowBridgeKind = '';
    var forceThrowBridgeFrame = (o.forceThrowBridgeMismatchFrame === undefined || o.forceThrowBridgeMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceThrowBridgeMismatchFrame | 0);
    var forceHitstopKind = String(o.forceHitstopMismatchKind || global.__fightHitstopForceMismatchKind || '').toLowerCase();
    if (forceHitstopKind === 'none' || forceHitstopKind === 'off' || forceHitstopKind === 'clear') forceHitstopKind = '';
    var forceHitstopFrame = (o.forceHitstopMismatchFrame === undefined || o.forceHitstopMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceHitstopMismatchFrame | 0);
    var forceConsequenceHelperKind = String(o.forceConsequenceHelperMismatchKind || global.__fightConsequenceHelperForceMismatchKind || '').toLowerCase();
    if (forceConsequenceHelperKind === 'none' || forceConsequenceHelperKind === 'off' || forceConsequenceHelperKind === 'clear') forceConsequenceHelperKind = '';
    var forceConsequenceHelperFrame = (o.forceConsequenceHelperMismatchFrame === undefined || o.forceConsequenceHelperMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceConsequenceHelperMismatchFrame | 0);
    var pendingConsequenceHelperKind = '';
    var forceDialComboHelperKind = String(o.forceDialComboHelperMismatchKind || global.__fightDialComboHelperForceMismatchKind || '').toLowerCase();
    if (forceDialComboHelperKind === 'none' || forceDialComboHelperKind === 'off' || forceDialComboHelperKind === 'clear') forceDialComboHelperKind = '';
    var forceDialComboHelperFrame = (o.forceDialComboHelperMismatchFrame === undefined || o.forceDialComboHelperMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceDialComboHelperMismatchFrame | 0);
    var pendingDialComboHelperKind = '';
    var forceTelemetryHelperKind = String(o.forceTelemetryHelperMismatchKind || global.__fightTelemetryHelperForceMismatchKind || '').toLowerCase();
    if (forceTelemetryHelperKind === 'none' || forceTelemetryHelperKind === 'off' || forceTelemetryHelperKind === 'clear') forceTelemetryHelperKind = '';
    var forceTelemetryHelperFrame = (o.forceTelemetryHelperMismatchFrame === undefined || o.forceTelemetryHelperMismatchFrame === null)
      ? 1
      : Math.max(1, o.forceTelemetryHelperMismatchFrame | 0);
    var pendingTelemetryHelperKind = '';

    if (compare && o.forceCreateMismatch) {
      compare.frame = (compare.frame | 0) + 1;
    }

    if (compare) {
      var preA = stateHash(primary);
      var preB = stateHash(compare);
      if (preA !== preB) {
        var preDA = stateDigest(primary);
        var preDB = stateDigest(compare);
        diff = (preDA && preDB) ? diffDigest(preDA, preDB) : null;
        var initSubsystem = '';
        if (telemetryHelperMode) initSubsystem = 'telemetry-init';
        else if (dialComboHelperMode) initSubsystem = 'dial-helper-call-order';
        else if (consequenceHelperMode) initSubsystem = 'helper-call-order';
        else if (hitstopMode) initSubsystem = classifyHitstopDiff(diff, 'hitstop-value');
        else if (throwBridgeMode) initSubsystem = classifyThrowBridgeDiff(diff, 'throw-gate');
        else if (exchangeBridgeMode) initSubsystem = classifyExchangeBridgeDiff(diff, 'exchange-entry');
        else if (strikeBridgeMode) initSubsystem = classifyStrikeBridgeDiff(diff, 'strike-attempt');
        else if (moveBridgeMode) initSubsystem = classifyMoveBridgeDiff(diff, 'move-select');
        else if (fighterMode) initSubsystem = classifyFighterDiff(diff, 'status-tick');
        else if (geometryMode) initSubsystem = classifyGeometryDiff(diff, 'geometry-digest');
        else if (combatBodyMode) initSubsystem = classifyCombatBodyDiff(diff, 'fighter-tick');
        else if (stepShellMode) initSubsystem = classifyStepShellDiff(diff, 'frame-order');
        else if (lifecycleMode) initSubsystem = 'phase';
        else initSubsystem = 'world-init';
        return {
          ok: false,
          reason: 'world-init',
          subsystem: initSubsystem,
          firstDivergentFrame: 0,
          frames: 0,
          events: 0,
          hashes: hashes,
          compareHashes: compareHashes,
          digests: digests,
          finalHash: preA,
          compareFinalHash: preB,
          diff: diff,
          telemetryInitProbe: telemetryHelperMode ? moduleTelemetryInitProbe : null,
          compareTelemetryInitProbe: telemetryHelperMode ? compareTelemetryInitProbe : null,
          dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
          compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
          routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
          compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
          routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
          compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
          integrityIssues: integrityIssues,
          snapshotParityOk: true,
          evictions: evictions
        };
      }
    }

    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null)
      ? -1
      : Math.max(0, Math.floor(o.snapshotFrame));

    for (var i = 0; i < frames; i++) {
      var fi = normalizeFrameInput((l && l[i]) ? l[i] : neutralFrameInput());
      var probeOutA = geometryMode ? [] : null;
      var probeOutB = geometryMode ? [] : null;
      var fighterProbeOutA = (fighterMode || dialComboHelperMode || telemetryHelperMode || o.captureFighterProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var fighterProbeOutB = (fighterMode || dialComboHelperMode || telemetryHelperMode || o.captureFighterProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var moveProbeOutA = (moveBridgeMode || dialComboHelperMode || o.captureMoveProbes || o.captureDialComboHelperProbes) ? [] : null;
      var moveProbeOutB = (moveBridgeMode || dialComboHelperMode || o.captureMoveProbes || o.captureDialComboHelperProbes) ? [] : null;
      var strikeProbeOutA = (strikeBridgeMode || o.captureStrikeProbes) ? [] : null;
      var strikeProbeOutB = (strikeBridgeMode || o.captureStrikeProbes) ? [] : null;
      var exchangeProbeOutA = (exchangeBridgeMode || consequenceHelperMode || dialComboHelperMode || telemetryHelperMode || o.captureExchangeProbes || o.captureConsequenceHelperProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var exchangeProbeOutB = (exchangeBridgeMode || consequenceHelperMode || dialComboHelperMode || telemetryHelperMode || o.captureExchangeProbes || o.captureConsequenceHelperProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var throwProbeOutA = (throwBridgeMode || consequenceHelperMode || dialComboHelperMode || telemetryHelperMode || o.captureThrowProbes || o.captureConsequenceHelperProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var throwProbeOutB = (throwBridgeMode || consequenceHelperMode || dialComboHelperMode || telemetryHelperMode || o.captureThrowProbes || o.captureConsequenceHelperProbes || o.captureDialComboHelperProbes || o.captureTelemetryHelperProbes) ? [] : null;
      var hitstopProbeOutA = (hitstopMode || o.captureHitstopProbes) ? [] : null;
      var hitstopProbeOutB = (hitstopMode || o.captureHitstopProbes) ? [] : null;
      var telemetryProbeOutA = (telemetryHelperMode || o.captureTelemetryHelperProbes) ? [] : null;
      var telemetryProbeOutB = (telemetryHelperMode || o.captureTelemetryHelperProbes) ? [] : null;

      var ev = withRouteDiagnosticSink(routeDiagnostics, function(){
        return step(primary, fi, explicitLegacy, {
          forceLegacyShell: !!o.useLegacyShell,
          forceLegacyCombatBody: !!o.useLegacyCombatBody,
          forceLegacyGeometry: !!o.useLegacyGeometry,
          forceLegacyFighterUpdate: !!o.useLegacyFighterUpdate,
          forceLegacyMoveBridge: !!o.useLegacyMoveBridge,
          forceLegacyStrikeBridge: !!o.useLegacyStrikeBridge,
          forceLegacyExchangeBridge: !!o.useLegacyExchangeBridge,
          forceLegacyThrowBridge: !!o.useLegacyThrowBridge,
          forceLegacyHitstop: !!o.useLegacyHitstop,
          forceLegacyConsequenceHelpers: !!o.useLegacyConsequenceHelpers,
          forceLegacyDialComboHelpers: !!o.useLegacyDialComboHelpers,
          forceLegacyTelemetryHelpers: !!o.useLegacyTelemetryHelpers,
          geometryProbeOut: probeOutA,
          fighterProbeOut: fighterProbeOutA,
          moveProbeOut: moveProbeOutA,
          strikeProbeOut: strikeProbeOutA,
          exchangeProbeOut: exchangeProbeOutA,
          throwProbeOut: throwProbeOutA,
          hitstopProbeOut: hitstopProbeOutA,
          telemetryProbeOut: telemetryProbeOutA
        });
      });
      events += (ev && ev.length) ? ev.length : 0;

      var compareEv = null;
      if (compare) {
        if (dialComboHelperMode && forceDialComboHelperKind && (i + 1) >= forceDialComboHelperFrame && !pendingDialComboHelperKind) {
          pendingDialComboHelperKind = forceDialComboHelperKind;
        }
        if (consequenceHelperMode && forceConsequenceHelperKind && (i + 1) >= forceConsequenceHelperFrame && !pendingConsequenceHelperKind) {
          pendingConsequenceHelperKind = forceConsequenceHelperKind;
        }
        if (telemetryHelperMode && forceTelemetryHelperKind && (i + 1) >= forceTelemetryHelperFrame && !pendingTelemetryHelperKind) {
          pendingTelemetryHelperKind = forceTelemetryHelperKind;
        }
        var prevDialComboHelperForce = global.__fightForceDialComboHelperMismatch;
        var prevConsequenceHelperForce = global.__fightForceConsequenceHelperMismatch;
        var prevTelemetryHelperForce = global.__fightForceTelemetryHelperMismatch;
        try {
          if (dialComboHelperMode && pendingDialComboHelperKind && pendingDialComboHelperKind !== 'dial-event-order') {
            global.__fightForceDialComboHelperMismatch = { kind: pendingDialComboHelperKind, used: false };
          }
          if (consequenceHelperMode && pendingConsequenceHelperKind) {
            global.__fightForceConsequenceHelperMismatch = { kind: pendingConsequenceHelperKind, used: false };
          }
          if (telemetryHelperMode && pendingTelemetryHelperKind && pendingTelemetryHelperKind !== 'telemetry-summary' && pendingTelemetryHelperKind !== 'telemetry-init') {
            global.__fightForceTelemetryHelperMismatch = { kind: pendingTelemetryHelperKind, used: false };
          }
          compareEv = withRouteDiagnosticSink(compareRouteDiagnostics, function(){
            return step(compare, fi, explicitLegacy, {
              forceLegacyShell: !!o.compareLegacyShell,
              forceLegacyCombatBody: !!o.compareLegacyCombatBody,
              forceLegacyGeometry: !!o.compareLegacyGeometry,
              forceLegacyFighterUpdate: !!o.compareLegacyFighter,
              forceLegacyMoveBridge: !!o.compareLegacyMoveBridge,
              forceLegacyStrikeBridge: !!o.compareLegacyStrikeBridge,
              forceLegacyExchangeBridge: !!o.compareLegacyExchangeBridge,
              forceLegacyThrowBridge: !!o.compareLegacyThrowBridge,
              forceLegacyHitstop: !!o.compareLegacyHitstop,
              forceLegacyConsequenceHelpers: !!(o.compareLegacyConsequenceHelpers || consequenceHelperMode),
              forceLegacyDialComboHelpers: !!(o.compareLegacyDialComboHelpers || dialComboHelperMode),
              forceLegacyTelemetryHelpers: !!(o.compareLegacyTelemetryHelpers || telemetryHelperMode),
              geometryProbeOut: probeOutB,
              fighterProbeOut: fighterProbeOutB,
              moveProbeOut: moveProbeOutB,
              strikeProbeOut: strikeProbeOutB,
              exchangeProbeOut: exchangeProbeOutB,
              throwProbeOut: throwProbeOutB,
              hitstopProbeOut: hitstopProbeOutB,
              telemetryProbeOut: telemetryProbeOutB
            });
          });
          if (dialComboHelperMode && pendingDialComboHelperKind === 'dial-event-order' && (i + 1) >= forceDialComboHelperFrame) {
            compareEv = Array.isArray(compareEv) ? compareEv : [];
            compareEv.push({ type: 'dialChainStep', fighter: 'forced', chainId: 'forced', step: 99, moveId: 'forced' });
            pendingDialComboHelperKind = '';
          } else if (dialComboHelperMode && pendingDialComboHelperKind) {
            if (global.__fightForceDialComboHelperMismatch && global.__fightForceDialComboHelperMismatch.used) {
              pendingDialComboHelperKind = '';
            }
          }
          if (consequenceHelperMode && pendingConsequenceHelperKind) {
            if (global.__fightForceConsequenceHelperMismatch && global.__fightForceConsequenceHelperMismatch.used) {
              pendingConsequenceHelperKind = '';
            }
          }
          if (telemetryHelperMode && pendingTelemetryHelperKind && pendingTelemetryHelperKind !== 'telemetry-summary' && pendingTelemetryHelperKind !== 'telemetry-init') {
            if (global.__fightForceTelemetryHelperMismatch && global.__fightForceTelemetryHelperMismatch.used) {
              pendingTelemetryHelperKind = '';
            }
          }
        } finally {
          global.__fightForceDialComboHelperMismatch = prevDialComboHelperForce;
          global.__fightForceConsequenceHelperMismatch = prevConsequenceHelperForce;
          global.__fightForceTelemetryHelperMismatch = prevTelemetryHelperForce;
          if (global.__fightForceDialComboHelperMismatch !== prevDialComboHelperForce) {
            integrityIssues.push({ frame: i + 1, kind: 'compare-force-leak', surface: 'dial-combo-helper' });
          }
          if (global.__fightForceConsequenceHelperMismatch !== prevConsequenceHelperForce) {
            integrityIssues.push({ frame: i + 1, kind: 'compare-force-leak', surface: 'consequence-helper' });
          }
          if (global.__fightForceTelemetryHelperMismatch !== prevTelemetryHelperForce) {
            integrityIssues.push({ frame: i + 1, kind: 'compare-force-leak', surface: 'telemetry-helper' });
          }
        }
      }

      if (hitstopMode && forceHitstopKind && compare && (i + 1) === forceHitstopFrame) {
        applyHitstopMismatch(compare, hitstopProbeOutB && hitstopProbeOutB.length ? hitstopProbeOutB[0] : null, forceHitstopKind);
      }

      if (throwBridgeMode && forceThrowBridgeKind && compare && (i + 1) === forceThrowBridgeFrame) {
        applyThrowBridgeMismatch(compare, forceThrowBridgeKind);
      }

      if (exchangeBridgeMode && forceExchangeBridgeKind && compare && (i + 1) === forceExchangeBridgeFrame) {
        applyExchangeBridgeMismatch(compare, forceExchangeBridgeKind);
      }

      if (strikeBridgeMode && forceStrikeBridgeKind && compare && (i + 1) === forceStrikeBridgeFrame) {
        applyStrikeBridgeMismatch(compare, forceStrikeBridgeKind);
      }

      if (moveBridgeMode && forceMoveBridgeKind && compare && (i + 1) === forceMoveBridgeFrame) {
        applyMoveBridgeMismatch(compare, forceMoveBridgeKind);
      }

      if (fighterMode && forceFighterKind && compare && (i + 1) === forceFighterFrame) {
        applyFighterMismatch(compare, forceFighterKind);
      }

      if (geometryMode && forceGeometryKind && compare && (i + 1) === forceGeometryFrame) {
        applyGeometryMismatch(compare, forceGeometryKind);
      }

      if (geometryMode) {
        geometryProbes.push(probeOutA && probeOutA.length ? probeOutA[0] : null);
        if (compare) compareGeometryProbes.push(probeOutB && probeOutB.length ? probeOutB[0] : null);
      }
      if (fighterMode || dialComboHelperMode || o.captureFighterProbes || o.captureDialComboHelperProbes) {
        fighterProbes.push(fighterProbeOutA && fighterProbeOutA.length ? fighterProbeOutA[0] : null);
        if (compare) compareFighterProbes.push(fighterProbeOutB && fighterProbeOutB.length ? fighterProbeOutB[0] : null);
      }
      if (moveBridgeMode || dialComboHelperMode || o.captureMoveProbes || o.captureDialComboHelperProbes) {
        moveProbes.push(moveProbeOutA && moveProbeOutA.length ? moveProbeOutA[0] : null);
        if (compare) compareMoveProbes.push(moveProbeOutB && moveProbeOutB.length ? moveProbeOutB[0] : null);
      }
      if (strikeBridgeMode || o.captureStrikeProbes) {
        strikeProbes.push(strikeProbeOutA && strikeProbeOutA.length ? strikeProbeOutA[0] : null);
        if (compare) compareStrikeProbes.push(strikeProbeOutB && strikeProbeOutB.length ? strikeProbeOutB[0] : null);
      }
      if (exchangeBridgeMode || dialComboHelperMode || o.captureExchangeProbes || o.captureDialComboHelperProbes) {
        exchangeProbes.push(exchangeProbeOutA && exchangeProbeOutA.length ? exchangeProbeOutA[0] : null);
        if (compare) compareExchangeProbes.push(exchangeProbeOutB && exchangeProbeOutB.length ? exchangeProbeOutB[0] : null);
      }
      if (throwBridgeMode || dialComboHelperMode || o.captureThrowProbes || o.captureDialComboHelperProbes) {
        throwProbes.push(throwProbeOutA && throwProbeOutA.length ? throwProbeOutA[0] : null);
        if (compare) compareThrowProbes.push(throwProbeOutB && throwProbeOutB.length ? throwProbeOutB[0] : null);
      }
      if (hitstopMode || o.captureHitstopProbes) {
        hitstopProbes.push(hitstopProbeOutA && hitstopProbeOutA.length ? hitstopProbeOutA[0] : null);
        if (compare) compareHitstopProbes.push(hitstopProbeOutB && hitstopProbeOutB.length ? hitstopProbeOutB[0] : null);
      }
      if (telemetryHelperMode || o.captureTelemetryHelperProbes) {
        telemetryHelperProbes.push(buildTelemetryHelperFrameProbe(
          fighterProbeOutA && fighterProbeOutA.length ? fighterProbeOutA[0] : null,
          exchangeProbeOutA && exchangeProbeOutA.length ? exchangeProbeOutA[0] : null,
          throwProbeOutA && throwProbeOutA.length ? throwProbeOutA[0] : null,
          telemetryProbeOutA && telemetryProbeOutA.length ? telemetryProbeOutA[0] : null
        ));
        if (compare) {
          compareTelemetryHelperProbes.push(buildTelemetryHelperFrameProbe(
            fighterProbeOutB && fighterProbeOutB.length ? fighterProbeOutB[0] : null,
            exchangeProbeOutB && exchangeProbeOutB.length ? exchangeProbeOutB[0] : null,
            throwProbeOutB && throwProbeOutB.length ? throwProbeOutB[0] : null,
            telemetryProbeOutB && telemetryProbeOutB.length ? telemetryProbeOutB[0] : null
          ));
        }
      }
      if (consequenceHelperMode || o.captureConsequenceHelperProbes) {
        consequenceHelperProbes.push(buildConsequenceHelperFrameProbe(
          exchangeProbeOutA && exchangeProbeOutA.length ? exchangeProbeOutA[0] : null,
          throwProbeOutA && throwProbeOutA.length ? throwProbeOutA[0] : null
        ));
        if (compare) {
          compareConsequenceHelperProbes.push(buildConsequenceHelperFrameProbe(
            exchangeProbeOutB && exchangeProbeOutB.length ? exchangeProbeOutB[0] : null,
            throwProbeOutB && throwProbeOutB.length ? throwProbeOutB[0] : null
          ));
        }
      }
      if (dialComboHelperMode || o.captureDialComboHelperProbes) {
        dialComboHelperProbes.push(buildDialComboHelperFrameProbe(
          moveProbeOutA && moveProbeOutA.length ? moveProbeOutA[0] : null,
          fighterProbeOutA && fighterProbeOutA.length ? fighterProbeOutA[0] : null,
          exchangeProbeOutA && exchangeProbeOutA.length ? exchangeProbeOutA[0] : null,
          throwProbeOutA && throwProbeOutA.length ? throwProbeOutA[0] : null
        ));
        if (compare) {
          compareDialComboHelperProbes.push(buildDialComboHelperFrameProbe(
            moveProbeOutB && moveProbeOutB.length ? moveProbeOutB[0] : null,
            fighterProbeOutB && fighterProbeOutB.length ? fighterProbeOutB[0] : null,
            exchangeProbeOutB && exchangeProbeOutB.length ? exchangeProbeOutB[0] : null,
            throwProbeOutB && throwProbeOutB.length ? throwProbeOutB[0] : null
          ));
        }
      }

      if (compare && telemetryHelperMode && pendingTelemetryHelperKind === 'telemetry-summary' && (i + 1) >= forceTelemetryHelperFrame) {
        var forcedSummaryProbe = compareTelemetryHelperProbes.length ? compareTelemetryHelperProbes[compareTelemetryHelperProbes.length - 1] : null;
        if (forcedSummaryProbe) {
          forcedSummaryProbe.summaries = forcedSummaryProbe.summaries || {};
          forcedSummaryProbe.summaries.lastRoundRecapDigest = String(forcedSummaryProbe.summaries.lastRoundRecapDigest || '') + '|forced-summary';
          pendingTelemetryHelperKind = '';
        }
      }

      if (compare && telemetryHelperMode && pendingTelemetryHelperKind === 'telemetry-init' && (i + 1) >= forceTelemetryHelperFrame) {
        compareTelemetryInitProbe = compareTelemetryInitProbe || telemetryInitProbe(compare);
        compareTelemetryInitProbe.flagsDigest = String(compareTelemetryInitProbe.flagsDigest || '') + '|forced-init';
        pendingTelemetryHelperKind = '';
      }

      if (snapshotFrame === i) {
        var snapResult = snapshotParityCheck(primary);
        if (!snapResult.ok) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            subsystem: 'world-hash-snapshot',
            firstDivergentFrame: i + 1,
            frames: i + 1,
            events: events,
            hashes: hashes,
            compareHashes: compareHashes,
            digests: digests,
            finalHash: snapResult.before || stateHash(primary),
            compareFinalHash: compare ? stateHash(compare) : '',
            hashBefore: snapResult.before || '',
            hashAfter: snapResult.after || '',
            diff: null,
            dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
            compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
            routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
            compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
            routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
            compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
            integrityIssues: integrityIssues,
            snapshotParityOk: false,
            evictions: evictions
          };
        }

        if (compare && o.snapshotBothWorlds) {
          var cmpSnap = snapshotParityCheck(compare);
          if (!cmpSnap.ok) {
            snapshotParityOk = false;
            return {
              ok: false,
              reason: 'snapshot-compare',
              subsystem: 'world-hash-snapshot',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: stateHash(primary),
              compareFinalHash: cmpSnap.before || stateHash(compare),
              hashBefore: cmpSnap.before || '',
              hashAfter: cmpSnap.after || '',
              diff: null,
              dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
              compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
              routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
              compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
              routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
              compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
              integrityIssues: integrityIssues,
              snapshotParityOk: false,
              evictions: evictions
            };
          }
        }
      }

      var hA = stateHash(primary);
      if (o.captureHashes) hashes.push(hA);
      if (o.captureDigests) digests.push(stateDigest(primary));

      if (compare) {
        var hB = stateHash(compare);
        if (o.captureHashes) compareHashes.push(hB);
        if (hA !== hB) {
          var dA = stateDigest(primary);
          var dB = stateDigest(compare);
          diff = (dA && dB) ? diffDigest(dA, dB) : null;
          var telemetryProbeA = telemetryHelperProbes.length ? telemetryHelperProbes[telemetryHelperProbes.length - 1] : null;
          var telemetryProbeB = compareTelemetryHelperProbes.length ? compareTelemetryHelperProbes[compareTelemetryHelperProbes.length - 1] : null;
          var dialProbeA = dialComboHelperProbes.length ? dialComboHelperProbes[dialComboHelperProbes.length - 1] : null;
          var dialProbeB = compareDialComboHelperProbes.length ? compareDialComboHelperProbes[compareDialComboHelperProbes.length - 1] : null;
          var helperProbeA = consequenceHelperProbes.length ? consequenceHelperProbes[consequenceHelperProbes.length - 1] : null;
          var helperProbeB = compareConsequenceHelperProbes.length ? compareConsequenceHelperProbes[compareConsequenceHelperProbes.length - 1] : null;

          if (telemetryHelperMode && telemetryInitProbeDigest(moduleTelemetryInitProbe) !== telemetryInitProbeDigest(compareTelemetryInitProbe)) {
            subsystem = 'telemetry-init';
          } else if (telemetryHelperMode && telemetryHelperProbeDigest(telemetryProbeA) !== telemetryHelperProbeDigest(telemetryProbeB)) {
            subsystem = classifyTelemetryHelperProbeMismatch(telemetryProbeA, telemetryProbeB);
          } else if (dialComboHelperMode && dialComboHelperProbeDigest(dialProbeA) !== dialComboHelperProbeDigest(dialProbeB)) {
            subsystem = classifyDialComboHelperProbeMismatch(dialProbeA, dialProbeB);
          } else if (dialComboHelperMode && JSON.stringify(dialComboEventDigest(ev)) !== JSON.stringify(dialComboEventDigest(compareEv))) {
            subsystem = 'dial-event-order';
          } else if (consequenceHelperMode && consequenceHelperProbeDigest(helperProbeA) !== consequenceHelperProbeDigest(helperProbeB)) {
            subsystem = classifyConsequenceHelperProbeMismatch(helperProbeA, helperProbeB);
          } else if (hitstopMode) subsystem = classifyHitstopDiff(diff, 'hitstop-value');
          else if (throwBridgeMode) subsystem = classifyThrowBridgeDiff(diff, 'throw-gate');
          else if (exchangeBridgeMode) subsystem = classifyExchangeBridgeDiff(diff, 'exchange-entry');
          else if (strikeBridgeMode) subsystem = classifyStrikeBridgeDiff(diff, 'strike-attempt');
          else if (moveBridgeMode) subsystem = classifyMoveBridgeDiff(diff, 'move-select');
          else if (fighterMode) subsystem = classifyFighterDiff(diff, 'status-tick');
          else if (geometryMode) subsystem = classifyGeometryDiff(diff, 'geometry-digest');
          else if (combatBodyMode) subsystem = classifyCombatBodyDiff(diff, 'fighter-tick');
          else if (stepShellMode) subsystem = classifyStepShellDiff(diff, 'frame-order');
          else if (lifecycleMode) subsystem = classifyLifecycleDiff(diff, '');
          else subsystem = classifyDiff(diff, '');

          return {
            ok: false,
            reason: 'determinism',
            subsystem: subsystem,
            firstDivergentFrame: i + 1,
            frames: i + 1,
            events: events,
            hashes: hashes,
            compareHashes: compareHashes,
            digests: digests,
            finalHash: hA,
            compareFinalHash: hB,
            diff: diff,
              dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
              compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
              routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
              compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
              routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
              compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
              integrityIssues: integrityIssues,
              telemetryInitProbe: telemetryHelperMode ? moduleTelemetryInitProbe : null,
              compareTelemetryInitProbe: telemetryHelperMode ? compareTelemetryInitProbe : null,
              moduleTelemetryHelperProbe: telemetryHelperMode ? telemetryProbeA : null,
              compareTelemetryHelperProbe: telemetryHelperMode ? telemetryProbeB : null,
              moduleHitstopProbe: hitstopMode ? hitstopProbes[hitstopProbes.length - 1] : null,
              compareHitstopProbe: hitstopMode ? compareHitstopProbes[compareHitstopProbes.length - 1] : null,
              moduleGeometryProbe: geometryMode ? geometryProbes[geometryProbes.length - 1] : null,
              compareGeometryProbe: geometryMode ? compareGeometryProbes[compareGeometryProbes.length - 1] : null,
              moduleStrikeProbe: strikeBridgeMode ? strikeProbes[strikeProbes.length - 1] : null,
              compareStrikeProbe: strikeBridgeMode ? compareStrikeProbes[compareStrikeProbes.length - 1] : null,
              moduleExchangeProbe: exchangeBridgeMode ? exchangeProbes[exchangeProbes.length - 1] : null,
              compareExchangeProbe: exchangeBridgeMode ? compareExchangeProbes[compareExchangeProbes.length - 1] : null,
              moduleThrowProbe: throwBridgeMode ? throwProbes[throwProbes.length - 1] : null,
              compareThrowProbe: throwBridgeMode ? compareThrowProbes[compareThrowProbes.length - 1] : null,
              moduleDialComboHelperProbe: dialComboHelperMode ? dialProbeA : null,
              compareDialComboHelperProbe: dialComboHelperMode ? dialProbeB : null,
              moduleConsequenceHelperProbe: consequenceHelperMode ? helperProbeA : null,
              compareConsequenceHelperProbe: consequenceHelperMode ? helperProbeB : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

        if (telemetryHelperMode) {
          var thA = telemetryHelperProbes.length ? telemetryHelperProbes[telemetryHelperProbes.length - 1] : null;
          var thB = compareTelemetryHelperProbes.length ? compareTelemetryHelperProbes[compareTelemetryHelperProbes.length - 1] : null;
          if (telemetryInitProbeDigest(moduleTelemetryInitProbe) !== telemetryInitProbeDigest(compareTelemetryInitProbe)) {
            return {
              ok: false,
              reason: 'telemetry-init-mismatch',
              subsystem: 'telemetry-init',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              telemetryInitProbe: moduleTelemetryInitProbe,
              compareTelemetryInitProbe: compareTelemetryInitProbe,
              moduleTelemetryHelperProbe: thA,
              compareTelemetryHelperProbe: thB,
              dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
              compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
              routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
              compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
              routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
              compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
              integrityIssues: integrityIssues,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
          if (telemetryHelperProbeDigest(thA) !== telemetryHelperProbeDigest(thB)) {
            return {
              ok: false,
              reason: 'telemetry-helper-probe-mismatch',
              subsystem: classifyTelemetryHelperProbeMismatch(thA, thB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              telemetryInitProbe: moduleTelemetryInitProbe,
              compareTelemetryInitProbe: compareTelemetryInitProbe,
              moduleTelemetryHelperProbe: thA,
              compareTelemetryHelperProbe: thB,
              dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
              compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
              routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
              compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
              routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
              compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
              integrityIssues: integrityIssues,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (dialComboHelperMode) {
          var dhA = dialComboHelperProbes.length ? dialComboHelperProbes[dialComboHelperProbes.length - 1] : null;
          var dhB = compareDialComboHelperProbes.length ? compareDialComboHelperProbes[compareDialComboHelperProbes.length - 1] : null;
          if (dialComboHelperProbeDigest(dhA) !== dialComboHelperProbeDigest(dhB)) {
            return {
              ok: false,
              reason: 'dial-combo-helper-probe-mismatch',
              subsystem: classifyDialComboHelperProbeMismatch(dhA, dhB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleDialComboHelperProbe: dhA,
              compareDialComboHelperProbe: dhB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var dEvA = dialComboEventDigest(ev);
          var dEvB = dialComboEventDigest(compareEv);
          if (JSON.stringify(dEvA) !== JSON.stringify(dEvB)) {
            return {
              ok: false,
              reason: 'dial-event-mismatch',
              subsystem: 'dial-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleDialEvents: dEvA,
              compareDialEvents: dEvB,
              moduleDialComboHelperProbe: dhA,
              compareDialComboHelperProbe: dhB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (consequenceHelperMode) {
          var chA = consequenceHelperProbes.length ? consequenceHelperProbes[consequenceHelperProbes.length - 1] : null;
          var chB = compareConsequenceHelperProbes.length ? compareConsequenceHelperProbes[compareConsequenceHelperProbes.length - 1] : null;
          if (consequenceHelperProbeDigest(chA) !== consequenceHelperProbeDigest(chB)) {
            return {
              ok: false,
              reason: 'consequence-helper-probe-mismatch',
              subsystem: classifyConsequenceHelperProbeMismatch(chA, chB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleConsequenceHelperProbe: chA,
              compareConsequenceHelperProbe: chB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (hitstopMode) {
          var hpA = hitstopProbes.length ? hitstopProbes[hitstopProbes.length - 1] : null;
          var hpB = compareHitstopProbes.length ? compareHitstopProbes[compareHitstopProbes.length - 1] : null;
          if (hitstopProbeDigest(hpA) !== hitstopProbeDigest(hpB)) {
            return {
              ok: false,
              reason: 'hitstop-probe-mismatch',
              subsystem: classifyHitstopProbeMismatch(hpA, hpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleHitstopProbe: hpA,
              compareHitstopProbe: hpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (throwBridgeMode) {
          var tEvA = throwEventDigest(ev);
          var tEvB = throwEventDigest(compareEv);
          if (JSON.stringify(tEvA) !== JSON.stringify(tEvB)) {
            return {
              ok: false,
              reason: 'throw-event-mismatch',
              subsystem: 'throw-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleThrowEvents: tEvA,
              compareThrowEvents: tEvB,
              moduleThrowProbe: throwProbes.length ? throwProbes[throwProbes.length - 1] : null,
              compareThrowProbe: compareThrowProbes.length ? compareThrowProbes[compareThrowProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var tpA = throwProbes.length ? throwProbes[throwProbes.length - 1] : null;
          var tpB = compareThrowProbes.length ? compareThrowProbes[compareThrowProbes.length - 1] : null;
          if (throwProbeDigest(tpA) !== throwProbeDigest(tpB)) {
            return {
              ok: false,
              reason: 'throw-probe-mismatch',
              subsystem: classifyThrowProbeMismatch(tpA, tpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleThrowProbe: tpA,
              compareThrowProbe: tpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (exchangeBridgeMode) {
          var xEvA = exchangeEventDigest(ev);
          var xEvB = exchangeEventDigest(compareEv);
          if (JSON.stringify(xEvA) !== JSON.stringify(xEvB)) {
            return {
              ok: false,
              reason: 'exchange-event-mismatch',
              subsystem: 'exchange-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleExchangeEvents: xEvA,
              compareExchangeEvents: xEvB,
              moduleExchangeProbe: exchangeProbes.length ? exchangeProbes[exchangeProbes.length - 1] : null,
              compareExchangeProbe: compareExchangeProbes.length ? compareExchangeProbes[compareExchangeProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var xpA = exchangeProbes.length ? exchangeProbes[exchangeProbes.length - 1] : null;
          var xpB = compareExchangeProbes.length ? compareExchangeProbes[compareExchangeProbes.length - 1] : null;
          if (exchangeProbeDigest(xpA) !== exchangeProbeDigest(xpB)) {
            return {
              ok: false,
              reason: 'exchange-probe-mismatch',
              subsystem: classifyExchangeProbeMismatch(xpA, xpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleExchangeProbe: xpA,
              compareExchangeProbe: xpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (strikeBridgeMode) {
          var sEvA = strikeEventDigest(ev);
          var sEvB = strikeEventDigest(compareEv);
          if (JSON.stringify(sEvA) !== JSON.stringify(sEvB)) {
            return {
              ok: false,
              reason: 'strike-event-mismatch',
              subsystem: 'strike-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleStrikeEvents: sEvA,
              compareStrikeEvents: sEvB,
              moduleStrikeProbe: strikeProbes.length ? strikeProbes[strikeProbes.length - 1] : null,
              compareStrikeProbe: compareStrikeProbes.length ? compareStrikeProbes[compareStrikeProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var spA = strikeProbes.length ? strikeProbes[strikeProbes.length - 1] : null;
          var spB = compareStrikeProbes.length ? compareStrikeProbes[compareStrikeProbes.length - 1] : null;
          if (strikeProbeDigest(spA) !== strikeProbeDigest(spB)) {
            return {
              ok: false,
              reason: 'strike-probe-mismatch',
              subsystem: classifyStrikeProbeMismatch(spA, spB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleStrikeProbe: spA,
              compareStrikeProbe: spB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (combatBodyMode) {
          var eA = combatEventDigest(ev);
          var eB = combatEventDigest(compareEv);
          if (JSON.stringify(eA) !== JSON.stringify(eB)) {
            return {
              ok: false,
              reason: 'event-mismatch',
              subsystem: 'combat-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleEvents: eA,
              compareEvents: eB,
              moduleGeometryProbe: geometryMode ? geometryProbes[geometryProbes.length - 1] : null,
              compareGeometryProbe: geometryMode ? compareGeometryProbes[compareGeometryProbes.length - 1] : null,
              moduleMoveProbe: moveBridgeMode ? moveProbes[moveProbes.length - 1] : null,
              compareMoveProbe: moveBridgeMode ? compareMoveProbes[compareMoveProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (moveBridgeMode) {
          var mEvA = moveBridgeEventDigest(ev);
          var mEvB = moveBridgeEventDigest(compareEv);
          if (JSON.stringify(mEvA) !== JSON.stringify(mEvB)) {
            return {
              ok: false,
              reason: 'move-event-mismatch',
              subsystem: 'move-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleMoveEvents: mEvA,
              compareMoveEvents: mEvB,
              moduleMoveProbe: moveProbes.length ? moveProbes[moveProbes.length - 1] : null,
              compareMoveProbe: compareMoveProbes.length ? compareMoveProbes[compareMoveProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var mpA = moveProbes.length ? moveProbes[moveProbes.length - 1] : null;
          var mpB = compareMoveProbes.length ? compareMoveProbes[compareMoveProbes.length - 1] : null;
          if (moveProbeDigest(mpA) !== moveProbeDigest(mpB)) {
            return {
              ok: false,
              reason: 'move-probe-mismatch',
              subsystem: classifyMoveBridgeProbeMismatch(mpA, mpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleMoveProbe: mpA,
              compareMoveProbe: mpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (fighterMode) {
          var fEvA = fighterEventDigest(ev);
          var fEvB = fighterEventDigest(compareEv);
          if (JSON.stringify(fEvA) !== JSON.stringify(fEvB)) {
            return {
              ok: false,
              reason: 'fighter-event-mismatch',
              subsystem: 'fighter-event-order',
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleFighterEvents: fEvA,
              compareFighterEvents: fEvB,
              moduleFighterProbe: fighterProbes.length ? fighterProbes[fighterProbes.length - 1] : null,
              compareFighterProbe: compareFighterProbes.length ? compareFighterProbes[compareFighterProbes.length - 1] : null,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }

          var fpA = fighterProbes.length ? fighterProbes[fighterProbes.length - 1] : null;
          var fpB = compareFighterProbes.length ? compareFighterProbes[compareFighterProbes.length - 1] : null;
          if (fighterProbeDigest(fpA) !== fighterProbeDigest(fpB)) {
            return {
              ok: false,
              reason: 'fighter-probe-mismatch',
              subsystem: classifyFighterProbeMismatch(fpA, fpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleFighterProbe: fpA,
              compareFighterProbe: fpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }

        if (geometryMode) {
          var gpA = geometryProbes.length ? geometryProbes[geometryProbes.length - 1] : null;
          var gpB = compareGeometryProbes.length ? compareGeometryProbes[compareGeometryProbes.length - 1] : null;
          if (geometryProbeDigest(gpA) !== geometryProbeDigest(gpB)) {
            return {
              ok: false,
              reason: 'geometry-probe-mismatch',
              subsystem: classifyGeometryProbeMismatch(gpA, gpB),
              firstDivergentFrame: i + 1,
              frames: i + 1,
              events: events,
              hashes: hashes,
              compareHashes: compareHashes,
              digests: digests,
              finalHash: hA,
              compareFinalHash: hB,
              diff: null,
              moduleGeometryProbe: gpA,
              compareGeometryProbe: gpB,
              snapshotParityOk: snapshotParityOk,
              evictions: evictions
            };
          }
        }
      }
    }

    return {
      ok: true,
      reason: '',
      subsystem: '',
      firstDivergentFrame: 0,
      frames: frames,
      events: events,
      hashes: hashes,
      compareHashes: compareHashes,
      digests: digests,
      finalHash: stateHash(primary),
      compareFinalHash: compare ? stateHash(compare) : '',
      diff: null,
      geometryProbes: (o.captureGeometryProbes || geometryMode) ? geometryProbes : [],
      compareGeometryProbes: (o.captureGeometryProbes || geometryMode) ? compareGeometryProbes : [],
      fighterProbes: (o.captureFighterProbes || fighterMode) ? fighterProbes : [],
      compareFighterProbes: (o.captureFighterProbes || fighterMode) ? compareFighterProbes : [],
      moveProbes: (o.captureMoveProbes || moveBridgeMode) ? moveProbes : [],
      compareMoveProbes: (o.captureMoveProbes || moveBridgeMode) ? compareMoveProbes : [],
      strikeProbes: (o.captureStrikeProbes || strikeBridgeMode) ? strikeProbes : [],
      compareStrikeProbes: (o.captureStrikeProbes || strikeBridgeMode) ? compareStrikeProbes : [],
      exchangeProbes: (o.captureExchangeProbes || exchangeBridgeMode) ? exchangeProbes : [],
      compareExchangeProbes: (o.captureExchangeProbes || exchangeBridgeMode) ? compareExchangeProbes : [],
      throwProbes: (o.captureThrowProbes || throwBridgeMode) ? throwProbes : [],
      compareThrowProbes: (o.captureThrowProbes || throwBridgeMode) ? compareThrowProbes : [],
      hitstopProbes: (o.captureHitstopProbes || hitstopMode) ? hitstopProbes : [],
      compareHitstopProbes: (o.captureHitstopProbes || hitstopMode) ? compareHitstopProbes : [],
      telemetryInitProbe: (o.captureTelemetryHelperProbes || telemetryHelperMode) ? moduleTelemetryInitProbe : null,
      compareTelemetryInitProbe: (o.captureTelemetryHelperProbes || telemetryHelperMode) ? compareTelemetryInitProbe : null,
      telemetryHelperProbes: (o.captureTelemetryHelperProbes || telemetryHelperMode) ? telemetryHelperProbes : [],
      compareTelemetryHelperProbes: (o.captureTelemetryHelperProbes || telemetryHelperMode) ? compareTelemetryHelperProbes : [],
      consequenceHelperProbes: (o.captureConsequenceHelperProbes || consequenceHelperMode) ? consequenceHelperProbes : [],
      compareConsequenceHelperProbes: (o.captureConsequenceHelperProbes || consequenceHelperMode) ? compareConsequenceHelperProbes : [],
      dialComboHelperProbes: (o.captureDialComboHelperProbes || dialComboHelperMode) ? dialComboHelperProbes : [],
      compareDialComboHelperProbes: (o.captureDialComboHelperProbes || dialComboHelperMode) ? compareDialComboHelperProbes : [],
      dependencyAudit: captureDependencyAudit ? dependencyAudit : null,
      compareDependencyAudit: captureDependencyAudit ? compareDependencyAudit : null,
      routeDiagnostics: captureRouteDiagnostics ? routeDiagnostics : [],
      compareRouteDiagnostics: captureRouteDiagnostics ? compareRouteDiagnostics : [],
      routeDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(routeDiagnostics) : [],
      compareRouteDiagnosticSummary: captureRouteDiagnostics ? routeDiagnosticSummary(compareRouteDiagnostics) : [],
      integrityIssues: integrityIssues,
      snapshotParityOk: snapshotParityOk,
      evictions: evictions
    };
  }

  ns.core.sim.step = {
    step: step,
    runInputLog: runInputLog,
    neutralFrameInput: neutralFrameInput,
    normalizeFrameInput: normalizeFrameInput,
    resolveLegacy: resolveLegacy,
    classifyStepShellDiff: classifyStepShellDiff,
    classifyCombatBodyDiff: classifyCombatBodyDiff,
    classifyGeometryDiff: classifyGeometryDiff,
    classifyGeometryProbeMismatch: classifyGeometryProbeMismatch,
    classifyFighterDiff: classifyFighterDiff,
    classifyFighterProbeMismatch: classifyFighterProbeMismatch,
    classifyMoveBridgeDiff: classifyMoveBridgeDiff,
    classifyMoveBridgeProbeMismatch: classifyMoveBridgeProbeMismatch,
    classifyStrikeBridgeDiff: classifyStrikeBridgeDiff,
    classifyStrikeProbeMismatch: classifyStrikeProbeMismatch,
    classifyExchangeBridgeDiff: classifyExchangeBridgeDiff,
    classifyExchangeProbeMismatch: classifyExchangeProbeMismatch,
    classifyThrowBridgeDiff: classifyThrowBridgeDiff,
    classifyThrowProbeMismatch: classifyThrowProbeMismatch,
    classifyHitstopDiff: classifyHitstopDiff,
    classifyHitstopProbeMismatch: classifyHitstopProbeMismatch,
    telemetryHelperProbeDigest: telemetryHelperProbeDigest,
    classifyTelemetryHelperProbeMismatch: classifyTelemetryHelperProbeMismatch,
    dialComboHelperProbeDigest: dialComboHelperProbeDigest,
    classifyDialComboHelperProbeMismatch: classifyDialComboHelperProbeMismatch,
    consequenceHelperProbeDigest: consequenceHelperProbeDigest,
    classifyConsequenceHelperProbeMismatch: classifyConsequenceHelperProbeMismatch
  };
})(typeof window !== 'undefined' ? window : this);
