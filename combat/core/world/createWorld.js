(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function getLegacyEngine(explicitLegacy){
    var legacy = explicitLegacy || global.__FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE;
    if (legacy && legacy.__isAdapter && legacy.__legacy) legacy = legacy.__legacy;
    return legacy;
  }

  function deepClone(v){
    var snap = ns.core && ns.core.world && ns.core.world.snapshot;
    if (snap && typeof snap.deepClone === 'function') return snap.deepClone(v);
    if (v === null || v === undefined) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function resolveModeBalance(){
    if (typeof global._fightResolveModeBalance === 'function') {
      return global._fightResolveModeBalance();
    }
    return deepClone((global.BALANCE && global.BALANCE.fight) || {});
  }

  function mkModeOn(){
    if (typeof global._fightMkModeOn === 'function') return !!global._fightMkModeOn();
    return !!(global.FEATURE_FLAGS && global.FEATURE_FLAGS.fightMkGbaMode);
  }

  function sfModeOn(){
    if (typeof global._fightSfModeOn === 'function') return !!global._fightSfModeOn();
    return !!(global.FEATURE_FLAGS && global.FEATURE_FLAGS.sfCombatMode);
  }

  function fromPx(v){
    var c = ns.core && ns.core.constants;
    if (c && typeof c.fromPx === 'function') return c.fromPx(v);
    if (typeof global._fightFromPx === 'function') return global._fightFromPx(v);
    return Math.round(Number(v || 0) * Number(global.FIGHT_FP || 256));
  }

  function neutralInput(){
    var c = ns.core && ns.core.constants;
    if (c && typeof c.neutralInput === 'function') return c.neutralInput();
    if (typeof global._fightNeutralInput === 'function') return global._fightNeutralInput();
    return { dir: 5, buttons: 0 };
  }

  function phases(){
    var c = ns.core && ns.core.constants;
    if (c && typeof c.phases === 'function') return c.phases();
    return global.FIGHT_PHASES || {
      INTRO:'INTRO', ROUND_ANNOUNCE:'ROUND_ANNOUNCE', FIGHT_START:'FIGHT_START', FIGHT:'FIGHT', KO:'KO', WIN:'WIN', LOSE:'LOSE'
    };
  }

  function lifecycleModule(){
    return (ns.core && ns.core.world && ns.core.world.lifecycle) ? ns.core.world.lifecycle : null;
  }

  function pushRouteDiagnostic(entry){
    var sink = global.__fightRouteDiagnosticsSink;
    var ev = entry || {};
    if (!Array.isArray(sink)) return;
    sink.push({
      frame: ev.frame === undefined ? 0 : (ev.frame | 0),
      ctx: String(ev.ctx || 'create-world'),
      op: String(ev.op || ''),
      path: String(ev.path || ''),
      reason: String(ev.reason || ''),
      detail: String(ev.detail || '')
    });
  }

  function createL15Stats(config){
    var cfg = config || {};
    var lc = lifecycleModule();
    var path = 'module';
    var reason = 'module-lifecycle-default';
    if (!cfg.forceLegacyTelemetryHelpers && lc && typeof lc.createL15Stats === 'function') {
      pushRouteDiagnostic({ op: 'createL15Stats', path: path, reason: reason });
      return lc.createL15Stats();
    }
    if (typeof global._fightCreateL15Stats === 'function') {
      pushRouteDiagnostic({
        op: 'createL15Stats',
        path: 'legacy',
        reason: cfg.forceLegacyTelemetryHelpers ? 'forced-legacy-telemetry-helpers' : 'module-lifecycle-createL15Stats-missing'
      });
      return global._fightCreateL15Stats();
    }
    if (lc && typeof lc.createL15Stats === 'function') {
      pushRouteDiagnostic({
        op: 'createL15Stats',
        path: 'module',
        reason: 'forced-legacy-telemetry-helper-missing'
      });
      return lc.createL15Stats();
    }
    pushRouteDiagnostic({
      op: 'createL15Stats',
      path: 'local',
      reason: cfg.forceLegacyTelemetryHelpers ? 'forced-legacy-and-module-telemetry-helper-missing' : 'module-and-legacy-telemetry-helper-missing'
    });
    return {
      match: {
        hitsLanded:{ p1: 0, p2: 0 },
        blocks:{ p1: 0, p2: 0 },
        throws:{ p1: 0, p2: 0 },
        throwWhiffs:{ p1: 0, p2: 0 },
        jumps:{ p1: 0, p2: 0 },
        heavies:{ p1: 0, p2: 0 },
        dizziesCaused:{ p1: 0, p2: 0 },
        cornerKos:{ p1: 0, p2: 0 },
        punishHits:{ p1: 0, p2: 0 },
        currentCombo:{ p1: 0, p2: 0 },
        maxCombo:{ p1: 0, p2: 0 },
        blockStreak:{ p1: 0, p2: 0 },
        maxBlockStreak:{ p1: 0, p2: 0 },
        throwDamage:{ p1: 0, p2: 0 },
        strikeDamage:{ p1: 0, p2: 0 },
        roundsWon:{ p1: 0, p2: 0 }
      },
      round: {
        hitsLanded:{ p1: 0, p2: 0 },
        blocks:{ p1: 0, p2: 0 },
        throws:{ p1: 0, p2: 0 },
        throwWhiffs:{ p1: 0, p2: 0 },
        jumps:{ p1: 0, p2: 0 },
        heavies:{ p1: 0, p2: 0 },
        dizziesCaused:{ p1: 0, p2: 0 },
        cornerKos:{ p1: 0, p2: 0 },
        punishHits:{ p1: 0, p2: 0 },
        currentCombo:{ p1: 0, p2: 0 },
        maxCombo:{ p1: 0, p2: 0 },
        blockStreak:{ p1: 0, p2: 0 },
        maxBlockStreak:{ p1: 0, p2: 0 },
        throwDamage:{ p1: 0, p2: 0 },
        strikeDamage:{ p1: 0, p2: 0 },
        roundsWon:{ p1: 0, p2: 0 }
      },
      flags: { dizzyWarned: { p1: false, p2: false }, cornerToastUntilFrame: 0 },
      lastRoundRecap: null,
      lastMatchRecap: null
    };
  }

  function lifecycleOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__lifecycleOwner || c.lifecycleOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function stepOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__stepOwner || c.stepOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function combatBodyOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__combatBodyOwner || c.combatBodyOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function geometryOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__geometryOwner || c.geometryOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function fighterOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__fighterOwner || c.fighterOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function moveBridgeOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__moveBridgeOwner || c.moveBridgeOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function strikeBridgeOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__strikeBridgeOwner || c.strikeBridgeOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function exchangeBridgeOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__exchangeBridgeOwner || c.exchangeBridgeOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function throwBridgeOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__throwBridgeOwner || c.throwBridgeOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function hitstopOwnerFromConfig(config){
    var c = config || {};
    var key = String(c.__hitstopOwner || c.hitstopOwner || 'module').toLowerCase();
    return (key === 'legacy') ? 'legacy' : 'module';
  }

  function geometryModule(){
    return (ns.core && ns.core.spatial && ns.core.spatial.geometry) ? ns.core.spatial.geometry : null;
  }

  function refreshBoxes(world, fighter, input, forceLegacy){
    var gm = geometryModule();
    if (!forceLegacy && gm && typeof gm.refreshBoxes === 'function') {
      gm.refreshBoxes(world, fighter, input);
      return;
    }
    if (typeof global._fightRefreshBoxes === 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        op: 'refreshBoxes',
        path: 'legacy',
        reason: forceLegacy ? 'forced-legacy-geometry' : 'module-geometry-refreshBoxes-missing',
        detail: String(fighter && fighter.id || '')
      });
      global._fightRefreshBoxes(world, fighter, input);
    } else if (forceLegacy || !gm || typeof gm.refreshBoxes !== 'function') {
      pushRouteDiagnostic({
        frame: world ? (world.frame | 0) : 0,
        op: 'refreshBoxes',
        path: 'unavailable',
        reason: forceLegacy ? 'legacy-geometry-refreshBoxes-missing' : 'module-and-legacy-geometry-refreshBoxes-missing',
        detail: String(fighter && fighter.id || '')
      });
    }
  }

  function createWorldInternal(seed, config){
    var createFighterMod = ns.core && ns.core.world && ns.core.world.createFighter;
    if (!createFighterMod || typeof createFighterMod.createFighter !== 'function') {
      throw new Error('combat.createWorld: createFighter module unavailable');
    }

    var cfg = resolveModeBalance();
    var startProfile = (cfg.aiProfiles && cfg.aiProfiles.aggroGremlin) ? 'aggroGremlin' : 'default';
    var mkEnabled = mkModeOn();
    var sfEnabled = sfModeOn();
    var roundSecs = Math.max(30, Math.floor((cfg.ui && cfg.ui.roundTimerSeconds) || 99));
    var p = phases();

    var lifecycleOwner = lifecycleOwnerFromConfig(config);
    var stepOwner = stepOwnerFromConfig(config);
    var combatBodyOwner = combatBodyOwnerFromConfig(config);
    var geometryOwner = geometryOwnerFromConfig(config);
    var fighterOwner = fighterOwnerFromConfig(config);
    var moveBridgeOwner = moveBridgeOwnerFromConfig(config);
    var strikeBridgeOwner = strikeBridgeOwnerFromConfig(config);
    var exchangeBridgeOwner = exchangeBridgeOwnerFromConfig(config);
    var throwBridgeOwner = throwBridgeOwnerFromConfig(config);
    var hitstopOwner = hitstopOwnerFromConfig(config);

    var world = {
      __lifecycleOwner: lifecycleOwner,
      __stepOwner: stepOwner,
      __combatBodyOwner: combatBodyOwner,
      __geometryOwner: geometryOwner,
      __fighterOwner: fighterOwner,
      __moveBridgeOwner: moveBridgeOwner,
      __strikeBridgeOwner: strikeBridgeOwner,
      __exchangeBridgeOwner: exchangeBridgeOwner,
      __throwBridgeOwner: throwBridgeOwner,
      __hitstopOwner: hitstopOwner,
      frame: 0,
      phase: p.INTRO,
      phaseTimer: 0,
      round: 1,
      score: { p1: 0, p2: 0 },
      winner: '',
      aiProfile: startProfile,
      cfg: cfg,
      rng: {
        seed: ((seed === undefined || seed === null ? 1 : seed) >>> 0),
        cursor: 0,
        enabled: !!(global.FEATURE_FLAGS && global.FEATURE_FLAGS.fightUseDeterministicRng)
      },
      stage: {
        left: fromPx(72),
        right: fromPx(888),
        floor: fromPx(472),
        cornerPush: true
      },
      fighters: {
        p1: createFighterMod.createFighter('p1', 'ed', 220, 1),
        p2: createFighterMod.createFighter('p2', 'daikon', 740, -1)
      },
      interaction: {
        hitstop: 0,
        lastExchange: {
          frame: 0,
          moveId: '',
          hitType: 'none',
          startup: 0,
          active: 0,
          recovery: 0,
          hitstun: 0,
          blockstun: 0,
          advantage: 0,
          advOnHit: 0,
          advOnBlock: 0,
          punishable: false,
          contactFrame: 0
        }
      },
      sf: {
        enabled: sfEnabled,
        parserMode: (cfg && cfg.sfParser && cfg.sfParser.overlapPolicy) ? cfg.sfParser.overlapPolicy : 'highest-priority-first'
      },
      mkGba: {
        enabled: mkEnabled,
        roundTimerFrames: roundSecs * 60,
        timerWarned: { s15: false, s10: false, s5: false },
        callout: { text: '', framesLeft: 0 },
        vfx: { heavyFlashFrames: 0, koInvertFrames: 0 },
        comboDial: {
          p1: { chainId: '', step: 0, window: 0 },
          p2: { chainId: '', step: 0, window: 0 }
        },
        juggle: { p1AirHitsTaken: 0, p2AirHitsTaken: 0 }
      },
      l15Stats: createL15Stats(config),
      debug: {
        paused: false,
        slowMoIndex: 0,
        overlayHitboxes: false,
        snapshots: [],
        snapshotEveryN: (cfg.snapshot && cfg.snapshot.saveEveryNFrames) || 0
      }
    };

    if (global.FEATURE_FLAGS && (global.FEATURE_FLAGS.fightSnapshotStress || global.FEATURE_FLAGS.fightSnapshotStress === true)) {
      world.debug.snapshotEveryN = 5;
    }

    if (mkEnabled && typeof global._fightMkSetCallout === 'function') {
      global._fightMkSetCallout(world, 'ENGAGE');
    }

    var neutral = neutralInput();
    refreshBoxes(world, world.fighters.p1, neutral, geometryOwner === 'legacy');
    refreshBoxes(world, world.fighters.p2, neutral, geometryOwner === 'legacy');

    return world;
  }

  function createWorldLegacy(seed, config, explicitLegacy){
    var legacy = getLegacyEngine(explicitLegacy);
    if (legacy && typeof legacy.createWorld === 'function') {
      pushRouteDiagnostic({ op: 'createWorld', path: 'legacy-engine', reason: 'legacy-create-world-route' });
      var w0 = legacy.createWorld(seed, config || {});
      if (w0 && w0.__lifecycleOwner === undefined) w0.__lifecycleOwner = 'legacy';
      if (w0 && w0.__stepOwner === undefined) w0.__stepOwner = 'legacy';
      if (w0 && w0.__combatBodyOwner === undefined) w0.__combatBodyOwner = 'legacy';
      if (w0 && w0.__geometryOwner === undefined) w0.__geometryOwner = 'legacy';
      if (w0 && w0.__fighterOwner === undefined) w0.__fighterOwner = 'legacy';
      if (w0 && w0.__moveBridgeOwner === undefined) w0.__moveBridgeOwner = 'legacy';
      if (w0 && w0.__strikeBridgeOwner === undefined) w0.__strikeBridgeOwner = 'legacy';
      if (w0 && w0.__exchangeBridgeOwner === undefined) w0.__exchangeBridgeOwner = 'legacy';
      if (w0 && w0.__throwBridgeOwner === undefined) w0.__throwBridgeOwner = 'legacy';
      if (w0 && w0.__hitstopOwner === undefined) w0.__hitstopOwner = 'legacy';
      return w0;
    }
    if (typeof global._fightCreateWorld === 'function') {
      pushRouteDiagnostic({ op: 'createWorld', path: 'legacy-global', reason: 'legacy-create-world-route' });
      var w1 = global._fightCreateWorld(seed, config || {});
      if (w1 && w1.__lifecycleOwner === undefined) w1.__lifecycleOwner = 'legacy';
      if (w1 && w1.__stepOwner === undefined) w1.__stepOwner = 'legacy';
      if (w1 && w1.__combatBodyOwner === undefined) w1.__combatBodyOwner = 'legacy';
      if (w1 && w1.__geometryOwner === undefined) w1.__geometryOwner = 'legacy';
      if (w1 && w1.__fighterOwner === undefined) w1.__fighterOwner = 'legacy';
      if (w1 && w1.__moveBridgeOwner === undefined) w1.__moveBridgeOwner = 'legacy';
      if (w1 && w1.__strikeBridgeOwner === undefined) w1.__strikeBridgeOwner = 'legacy';
      if (w1 && w1.__exchangeBridgeOwner === undefined) w1.__exchangeBridgeOwner = 'legacy';
      if (w1 && w1.__throwBridgeOwner === undefined) w1.__throwBridgeOwner = 'legacy';
      if (w1 && w1.__hitstopOwner === undefined) w1.__hitstopOwner = 'legacy';
      return w1;
    }
    throw new Error('combat.createWorld: legacy engine unavailable');
  }

  function createWorld(seed, config, explicitLegacy){
    var cfg = config || {};
    var forceLegacy = !!(cfg && cfg.__legacyCreate);
    if (forceLegacy) {
      pushRouteDiagnostic({ op: 'createWorld', path: 'legacy', reason: 'forced-legacy-create' });
      return createWorldLegacy(seed, cfg, explicitLegacy);
    }

    try {
      pushRouteDiagnostic({ op: 'createWorld', path: 'module', reason: 'module-create-world-default' });
      return createWorldInternal(seed, cfg);
    } catch (err) {
      pushRouteDiagnostic({
        op: 'createWorld',
        path: 'legacy',
        reason: 'module-create-world-error-fallback',
        detail: String(err && err.message ? err.message : err)
      });
      var fallback = createWorldLegacy(seed, cfg, explicitLegacy);
      fallback.__createWorldFallbackError = String(err && err.message ? err.message : err);
      return fallback;
    }
  }

  ns.core.world.createWorld = {
    createWorld: createWorld,
    createWorldInternal: createWorldInternal,
    createWorldLegacy: createWorldLegacy,
    getLegacyEngine: getLegacyEngine
  };
})(typeof window !== 'undefined' ? window : this);
