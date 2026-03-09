(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.tools = ns.tools || {};
  ns.tools.determinism = ns.tools.determinism || {};

  function neutralFrameInput() {
    if (typeof global._fightNeutralFrameInput === 'function') {
      return global._fightNeutralFrameInput();
    }
    return { p1: { dir: 5, buttons: 0 }, p2: { dir: 5, buttons: 0 } };
  }

  function hashModule(){
    return ns.core && ns.core.world && ns.core.world.hash ? ns.core.world.hash : null;
  }

  function classifyDiff(diff){
    var hm = hashModule();
    if (!diff || !hm || typeof hm.classifyDiffPath !== 'function') return 'resolution-or-phase';
    return hm.classifyDiffPath(diff.path || '');
  }
  function lifecycleModule(){
    return ns.core && ns.core.world && ns.core.world.lifecycle ? ns.core.world.lifecycle : null;
  }
  function classifyLifecycleDiff(diff){
    var lc = lifecycleModule();
    if (lc && typeof lc.classifyLifecycleDiffPath === 'function') {
      return lc.classifyLifecycleDiffPath(diff && diff.path ? diff.path : '');
    }
    return classifyDiff(diff);
  }
  function stepModule(){
    return ns.core && ns.core.sim && ns.core.sim.step ? ns.core.sim.step : null;
  }
  function classifyStepShellDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyStepShellDiff === 'function') {
      return sm.classifyStepShellDiff(diff, '');
    }
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
  function classifyCombatBodyDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyCombatBodyDiff === 'function') {
      return sm.classifyCombatBodyDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'fighter-tick';
    if (p.indexOf('fighters.p1.facing') === 0 || p.indexOf('fighters.p2.facing') === 0 || p.indexOf('p1.facing') === 0 || p.indexOf('p2.facing') === 0) return 'facing';
    if (p.indexOf('fighters.p1.boxes') === 0 || p.indexOf('fighters.p2.boxes') === 0 || p.indexOf('p1.boxes') === 0 || p.indexOf('p2.boxes') === 0) return 'box-refresh';
    if (p.indexOf('interaction.lastExchange') === 0 || p.indexOf('interaction.hitstop') === 0) return 'strike-order';
    if (
      p.indexOf('fighters.p1.throwTech') === 0 || p.indexOf('fighters.p2.throwTech') === 0 ||
      p.indexOf('p1.throwTech') === 0 || p.indexOf('p2.throwTech') === 0 ||
      p.indexOf('p1.throwInvul') === 0 || p.indexOf('p2.throwInvul') === 0
    ) return 'throw-order';
    if (
      p.indexOf('fighters.p1.state') === 0 || p.indexOf('fighters.p2.state') === 0 ||
      p.indexOf('p1.state') === 0 || p.indexOf('p2.state') === 0 ||
      p.indexOf('stateFrame') >= 0 || p.indexOf('moveFrame') >= 0
    ) return 'fighter-tick';
    if (p.indexOf('fighters.p1.x') === 0 || p.indexOf('fighters.p2.x') === 0 || p.indexOf('p1.x') === 0 || p.indexOf('p2.x') === 0) return 'push-order';
    return 'combat-event-order';
  }
  function classifyGeometryDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyGeometryDiff === 'function') {
      return sm.classifyGeometryDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'geometry-digest';
    if (p.indexOf('facing') >= 0) return 'facing';
    if (p.indexOf('moveId') >= 0 || p.indexOf('moveFrame') >= 0) return 'frame-data';
    if (p.indexOf('boxes') >= 0) return 'box-refresh';
    if (p.indexOf('.x') >= 0 || p.indexOf('stage') === 0) return 'push';
    return 'geometry-digest';
  }
  function classifyFighterDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyFighterDiff === 'function') {
      return sm.classifyFighterDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'status-tick';
    if (
      p.indexOf('hitstunFramesLeft') >= 0 ||
      p.indexOf('blockstunFramesLeft') >= 0 ||
      p.indexOf('knockdownFramesLeft') >= 0 ||
      p.indexOf('dizzyFramesLeft') >= 0 ||
      p.indexOf('throwTechFramesLeft') >= 0 ||
      p.indexOf('invulnFramesLeft') >= 0 ||
      p.indexOf('wakeupThrowInvulFramesLeft') >= 0 ||
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

  function classifyMoveBridgeDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyMoveBridgeDiff === 'function') {
      return sm.classifyMoveBridgeDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'move-select';
    if (p.indexOf('lastParserDecision') >= 0) return 'parser-decision';
    if (p.indexOf('moveId') >= 0) return 'move-start';
    if (p.indexOf('moveFrame') >= 0 || p.indexOf('moveHitRegistered') >= 0 || p.indexOf('lastMoveContact') >= 0) return 'move-tick';
    if (p.indexOf('charge') >= 0) return 'charge-check';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'move-end';
    return 'move-event-order';
  }

  function classifyStrikeBridgeDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyStrikeBridgeDiff === 'function') {
      return sm.classifyStrikeBridgeDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'strike-attempt';
    if (p.indexOf('moveHitRegistered') >= 0) return 'move-hit-registered';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-bridge';
    if (p.indexOf('interaction.lastExchange') === 0) return 'exchange-bridge';
    if (p.indexOf('boxes') >= 0) return 'contact-detect';
    if (p.indexOf('state') >= 0 && p.indexOf('move') >= 0) return 'active-frame';
    return 'strike-event-order';
  }

  function classifyExchangeBridgeDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyExchangeBridgeDiff === 'function') {
      return sm.classifyExchangeBridgeDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
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

  function classifyThrowBridgeDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyThrowBridgeDiff === 'function') {
      return sm.classifyThrowBridgeDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'throw-gate';
    if (p.indexOf('throwTechFramesLeft') >= 0 || p.indexOf('wakeupThrowInvulFramesLeft') >= 0) return 'throw-tech';
    if (p.indexOf('interaction.lastExchange') === 0) return 'throw-last-exchange';
    if (p.indexOf('interaction.hitstop') === 0) return 'throw-hitstop';
    if (p.indexOf('health') >= 0 || p.indexOf('knockdownFramesLeft') >= 0 || p.indexOf('.vx') >= 0 || p.indexOf('.vy') >= 0) return 'throw-connect';
    if (p.indexOf('moveHitRegistered') >= 0) return 'throw-whiff';
    return 'throw-event-order';
  }

  function classifyHitstopDiff(diff){
    var sm = stepModule();
    if (sm && typeof sm.classifyHitstopDiff === 'function') {
      return sm.classifyHitstopDiff(diff, '');
    }
    var p = String((diff && diff.path) || '');
    if (!p) return 'hitstop-value';
    if (p.indexOf('interaction.hitstop') === 0) return 'hitstop-value';
    if (p.indexOf('interaction') === 0) return 'hitstop-callsite';
    return 'hitstop-callsite';
  }

  function classifyConsequenceHelperProbeMismatch(a, b){
    var sm = stepModule();
    if (sm && typeof sm.classifyConsequenceHelperProbeMismatch === 'function') {
      return sm.classifyConsequenceHelperProbeMismatch(a, b);
    }
    return 'helper-call-order';
  }

  function classifyDialComboHelperProbeMismatch(a, b){
    var sm = stepModule();
    if (sm && typeof sm.classifyDialComboHelperProbeMismatch === 'function') {
      return sm.classifyDialComboHelperProbeMismatch(a, b);
    }
    return 'dial-helper-call-order';
  }

  function classifyTelemetryHelperProbeMismatch(a, b){
    var sm = stepModule();
    if (sm && typeof sm.classifyTelemetryHelperProbeMismatch === 'function') {
      return sm.classifyTelemetryHelperProbeMismatch(a, b);
    }
    return 'telemetry-call-order';
  }

  function digestWorld(world){
    var hm = hashModule();
    if (hm && typeof hm.stateDigest === 'function') return hm.stateDigest(world);
    if (typeof global._fightStateDigest === 'function') return global._fightStateDigest(world);
    return null;
  }

  function diffDigests(a, b){
    var hm = hashModule();
    if (hm && typeof hm.diffDigest === 'function') return hm.diffDigest(a, b);
    if (typeof global._fightDiff === 'function') return global._fightDiff(a, b);
    return null;
  }

  var DEFAULT_AUDIT_PARITY_SUITES = [
    'adapter',
    'lifecycle',
    'step-shell',
    'combat-body',
    'geometry',
    'fighter',
    'move-bridge',
    'strike-bridge',
    'exchange',
    'throw',
    'hitstop',
    'consequence-helpers',
    'dial-combo-helpers',
    'telemetry-helpers'
  ];
  var AUDIT_PRESET_REGISTRY = {
    'quick-smoke': {
      description: 'Fast smoke across adapter, lifecycle, core combat body, exchange, throw, and hitstop.',
      paritySuites: ['adapter', 'lifecycle', 'combat-body', 'exchange', 'throw', 'hitstop']
    },
    'full-audit': {
      description: 'Full audit using the default parity suite matrix and dependency audit surfaces.',
      paritySuites: null
    },
    'combat-focus': {
      description: 'Combat-focused audit covering fighter, move, strike, exchange, throw, hitstop, and helper surfaces.',
      paritySuites: [
        'fighter',
        'move-bridge',
        'strike-bridge',
        'exchange',
        'throw',
        'hitstop',
        'consequence-helpers',
        'dial-combo-helpers',
        'telemetry-helpers'
      ]
    }
  };

  function inferAuditLogName(log, opts){
    var o = opts || {};
    if (o.logName) return String(o.logName);
    if (log === global.FIGHT_TEST_LOG) return 'FIGHT_TEST_LOG';
    if (log === global.SF_TEST_LOG) return 'SF_TEST_LOG';
    return 'custom-log';
  }

  function resolveAuditLog(opts){
    var o = opts || {};
    var log = (o.log !== undefined) ? o.log : o.testLog;
    if (!Array.isArray(log)) {
      if (Array.isArray(global.FIGHT_TEST_LOG)) log = global.FIGHT_TEST_LOG;
      else if (Array.isArray(global.SF_TEST_LOG)) log = global.SF_TEST_LOG;
      else log = [];
    }
    return {
      log: log,
      logName: inferAuditLogName(log, o)
    };
  }

  function normalizeSuiteName(name){
    var key = String(name || '').toLowerCase().replace(/[\s_]+/g, '-');
    if (key === 'adapter') return 'adapter';
    if (key === 'lifecycle') return 'lifecycle';
    if (key === 'stepshell' || key === 'step-shell') return 'step-shell';
    if (key === 'combatbody' || key === 'combat-body') return 'combat-body';
    if (key === 'geometry') return 'geometry';
    if (key === 'fighter') return 'fighter';
    if (key === 'movebridge' || key === 'move-bridge') return 'move-bridge';
    if (key === 'strikebridge' || key === 'strike-bridge') return 'strike-bridge';
    if (key === 'exchange') return 'exchange';
    if (key === 'throw') return 'throw';
    if (key === 'hitstop') return 'hitstop';
    if (key === 'consequencehelpers' || key === 'consequence-helper' || key === 'consequence-helpers') return 'consequence-helpers';
    if (key === 'dialcombohelpers' || key === 'dial-combo-helper' || key === 'dial-combo-helpers') return 'dial-combo-helpers';
    if (key === 'telemetryhelpers' || key === 'telemetry-helper' || key === 'telemetry-helpers') return 'telemetry-helpers';
    return '';
  }

  function normalizeParitySuites(list){
    var src = Array.isArray(list) ? list : DEFAULT_AUDIT_PARITY_SUITES;
    var out = [];
    var invalid = [];
    var seen = {};
    var i, raw, name;
    for (i = 0; i < src.length; i++) {
      raw = src[i];
      name = normalizeSuiteName(raw);
      if (!name) {
        invalid.push(String(raw || ''));
        continue;
      }
      if (!seen[name]) {
        seen[name] = true;
        out.push(name);
      }
    }
    return { valid: out, invalid: invalid };
  }

  function suiteRegistry(){
    return {
      'adapter': runAdapterParityAgainstLegacy,
      'lifecycle': runLifecycleParityAssert,
      'step-shell': runStepShellParityAssert,
      'combat-body': runCombatBodyParityAssert,
      'geometry': runGeometryParityAssert,
      'fighter': runFighterParityAssert,
      'move-bridge': runMoveBridgeParityAssert,
      'strike-bridge': runStrikeBridgeParityAssert,
      'exchange': runExchangeParityAssert,
      'throw': runThrowParityAssert,
      'hitstop': runHitstopParityAssert,
      'consequence-helpers': runConsequenceHelperParityAssert,
      'dial-combo-helpers': runDialComboHelperParityAssert,
      'telemetry-helpers': runTelemetryHelperParityAssert
    };
  }

  function shallowCopyOpts(opts){
    var src = opts || {};
    var out = {};
    var key;
    for (key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) out[key] = src[key];
    }
    return out;
  }

  function auditPreset(name){
    var key = String(name || '').toLowerCase();
    return AUDIT_PRESET_REGISTRY[key] || null;
  }

  function compactParityResult(result){
    var r = result || {};
    var out = {
      ok: !!r.ok,
      reason: String(r.reason || ''),
      subsystem: String(r.subsystem || ''),
      firstDivergentFrame: r.firstDivergentFrame === undefined ? 0 : (r.firstDivergentFrame | 0)
    };
    if (r.snapshotParityOk !== undefined) out.snapshotParityOk = !!r.snapshotParityOk;
    if (r.error) out.error = String(r.error);
    return out;
  }

  function requirementAuditOk(entry){
    var reqs = entry && entry.requirements ? entry.requirements : null;
    var key;
    if (!reqs) return false;
    for (key in reqs) {
      if (!Object.prototype.hasOwnProperty.call(reqs, key)) continue;
      if (reqs[key] && reqs[key].needed && !reqs[key].satisfied) return false;
    }
    return true;
  }

  function dependencyAuditOk(result){
    if (!result || result.ok === false) return false;
    if (result.dependencyAudit && !requirementAuditOk(result.dependencyAudit)) return false;
    if (result.compareDependencyAudit && !requirementAuditOk(result.compareDependencyAudit)) return false;
    if (Array.isArray(result.integrityIssues) && result.integrityIssues.length > 0) return false;
    return true;
  }

  function copyOpts(opts){
    var src = opts || {};
    var out = {};
    var key;
    for (key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) out[key] = src[key];
    }
    delete out.log;
    delete out.testLog;
    delete out.logName;
    delete out.includeDependencyAudit;
    delete out.includeRouteDiagnostics;
    delete out.includeParity;
    delete out.paritySuites;
    delete out.verbose;
    delete out.download;
    delete out.fileName;
    return out;
  }

  function safeStringify(v){
    try {
      return JSON.stringify(v, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }, null, 2);
    }
  }

  function maybeDownloadBundle(bundle, opts){
    var o = opts || {};
    var info = {
      requested: !!o.download,
      attempted: false,
      supported: false,
      ok: false,
      fileName: String(o.fileName || 'fight-audit-bundle.json')
    };
    if (!o.download) return info;
    if (
      typeof global.Blob !== 'function' ||
      !global.URL ||
      typeof global.URL.createObjectURL !== 'function' ||
      !global.document ||
      typeof global.document.createElement !== 'function'
    ) {
      info.reason = 'download-api-unavailable';
      return info;
    }
    info.supported = true;
    info.attempted = true;
    try {
      var json = safeStringify(bundle);
      var blob = new global.Blob([json], { type: 'application/json' });
      var url = global.URL.createObjectURL(blob);
      var a = global.document.createElement('a');
      a.href = url;
      a.download = info.fileName;
      if (global.document.body && typeof global.document.body.appendChild === 'function') {
        global.document.body.appendChild(a);
        a.click();
        global.document.body.removeChild(a);
      } else {
        a.click();
      }
      if (typeof global.URL.revokeObjectURL === 'function') global.URL.revokeObjectURL(url);
      info.ok = true;
    } catch (err) {
      info.ok = false;
      info.reason = String(err && err.message ? err.message : err);
    }
    return info;
  }

  function attachPresetMetadata(bundle, presetName){
    var preset = auditPreset(presetName);
    if (!bundle || !preset) return bundle;
    bundle.metadata = bundle.metadata || {};
    bundle.metadata.preset = String(presetName || '');
    bundle.metadata.presetDescription = String(preset.description || '');
    return bundle;
  }

  function runPresetAudit(engine, presetName, opts){
    var preset = auditPreset(presetName);
    var runOpts = shallowCopyOpts(opts);
    var bundle;
    if (runOpts.includeParity === undefined) runOpts.includeParity = true;
    if (runOpts.includeDependencyAudit === undefined) runOpts.includeDependencyAudit = true;
    if (runOpts.includeRouteDiagnostics === undefined) runOpts.includeRouteDiagnostics = true;
    if (preset && preset.paritySuites && runOpts.paritySuites === undefined) {
      runOpts.paritySuites = preset.paritySuites.slice(0);
    }
    bundle = exportAuditBundle(engine, runOpts);
    return attachPresetMetadata(bundle, presetName);
  }

  function compactAuditForSnapshot(bundle, verbose){
    if (!bundle) return null;
    if (verbose) return bundle;
    return {
      summary: bundle.summary || null,
      dependencyAudit: bundle.dependencyAudit || null,
      routeDiagnostics: bundle.routeDiagnostics || null,
      parity: bundle.parity || {}
    };
  }

  function cloneJson(v){
    if (v === undefined) return undefined;
    if (v === null) return null;
    try {
      return JSON.parse(JSON.stringify(v));
    } catch (err) {
      return null;
    }
  }

  function compactMoveForSnapshot(move, includeRaw){
    var m = move || {};
    if (includeRaw) return cloneJson(m);
    return {
      id: String(m.id || ''),
      name: String(m.name || ''),
      type: String(m.type || ''),
      primaryRole: String(m.primaryRole || ''),
      secondaryRole: String(m.secondaryRole || ''),
      button: m.button === undefined ? null : m.button,
      startup: m.startup === undefined ? null : m.startup,
      active: m.active === undefined ? null : m.active,
      recovery: m.recovery === undefined ? null : m.recovery,
      hitstop: m.hitstop === undefined ? null : m.hitstop,
      airOnly: !!m.airOnly,
      requireCrouch: !!m.requireCrouch,
      motion: cloneJson(m.motion === undefined ? null : m.motion),
      charge: cloneJson(m.charge === undefined ? null : m.charge),
      cancelWindow: cloneJson(m.cancelWindow === undefined ? null : m.cancelWindow),
      onHit: cloneJson(m.onHit === undefined ? null : m.onHit),
      onBlock: cloneJson(m.onBlock === undefined ? null : m.onBlock)
    };
  }

  function buildRosterSnapshot(opts){
    var o = opts || {};
    var roster = global.FIGHT_ROSTER || {};
    var includeMoves = (o.includeMoves === undefined) ? true : !!o.includeMoves;
    var includeRawMoves = !!(o.includeRawMoves || o.verbose);
    var keys = Object.keys(roster);
    var out = [];
    var totalMoves = 0;
    var i, key, fighter, moves, j, entry;
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      fighter = roster[key] || {};
      moves = Array.isArray(fighter.moves) ? fighter.moves : [];
      totalMoves += moves.length;
      entry = {
        id: String(fighter.id || key),
        name: String(fighter.name || ''),
        archetype: String(fighter.archetype || ''),
        matchupRole: String(fighter.matchupRole || ''),
        trainingFocus: cloneJson(fighter.trainingFocus === undefined ? null : fighter.trainingFocus),
        maxHealth: fighter.maxHealth === undefined ? null : fighter.maxHealth,
        walkSpeed: fighter.walkSpeed === undefined ? null : fighter.walkSpeed,
        airSpeed: fighter.airSpeed === undefined ? null : fighter.airSpeed,
        jumpVel: fighter.jumpVel === undefined ? null : fighter.jumpVel,
        gravity: fighter.gravity === undefined ? null : fighter.gravity,
        maxFall: fighter.maxFall === undefined ? null : fighter.maxFall,
        moveCount: moves.length | 0
      };
      if (includeMoves) {
        entry.moves = [];
        for (j = 0; j < moves.length; j++) {
          entry.moves.push(compactMoveForSnapshot(moves[j], includeRawMoves));
        }
      }
      out.push(entry);
    }
    return {
      roster: out,
      rosterCount: out.length | 0,
      moveCount: totalMoves | 0
    };
  }

  function compactWorldContext(world){
    var w = world || {};
    var fighters = w.fighters || {};
    var ids = Object.keys(fighters);
    var outFighters = [];
    var i, id, fighter, rosterDef, maxHealth;
    for (i = 0; i < ids.length; i++) {
      id = ids[i];
      fighter = fighters[id] || {};
      rosterDef = (global.FIGHT_ROSTER && fighter.rosterKey) ? global.FIGHT_ROSTER[fighter.rosterKey] : null;
      maxHealth = fighter.maxHealth;
      if (maxHealth === undefined && rosterDef && rosterDef.maxHealth !== undefined) maxHealth = rosterDef.maxHealth;
      outFighters.push({
        id: String(fighter.id || id),
        rosterKey: String(fighter.rosterKey || ''),
        health: fighter.health === undefined ? null : fighter.health,
        maxHealth: maxHealth === undefined ? null : maxHealth,
        moveId: String(fighter.moveId || ''),
        x: fighter.x === undefined ? null : fighter.x,
        y: fighter.y === undefined ? null : fighter.y,
        state: String(fighter.state || '')
      });
    }
    return {
      frame: w.frame === undefined ? 0 : (w.frame | 0),
      round: w.round === undefined ? 0 : (w.round | 0),
      phase: String(w.phase || ''),
      winner: String(w.winner || ''),
      score: {
        p1: w.score && w.score.p1 !== undefined ? (w.score.p1 | 0) : 0,
        p2: w.score && w.score.p2 !== undefined ? (w.score.p2 | 0) : 0
      },
      stage: {
        left: w.stage && w.stage.left !== undefined ? w.stage.left : null,
        right: w.stage && w.stage.right !== undefined ? w.stage.right : null,
        floor: w.stage && w.stage.floor !== undefined ? w.stage.floor : null,
        cornerPush: !!(w.stage && w.stage.cornerPush)
      },
      modes: {
        sfEnabled: !!(w.sf && w.sf.enabled),
        mkEnabled: !!(w.mkGba && w.mkGba.enabled),
        parserMode: String(w.sf && w.sf.parserMode || ''),
        roundTimerFrames: w.mkGba && w.mkGba.roundTimerFrames !== undefined ? (w.mkGba.roundTimerFrames | 0) : 0
      },
      fighters: outFighters
    };
  }

  function balanceSnapshotAuditOpts(opts){
    var out = shallowCopyOpts(opts);
    delete out.world;
    delete out.includeAudit;
    delete out.includeRoster;
    delete out.includeMoves;
    delete out.includeCombos;
    delete out.includeRawMoves;
    delete out.download;
    delete out.fileName;
    return out;
  }

  function exportBalanceSnapshot(engine, opts){
    var e = engine || global.FIGHT_ENGINE;
    var o = opts || {};
    var logInfo = resolveAuditLog(o);
    var seed = (o.seed === undefined || o.seed === null) ? 1337 : o.seed;
    var frames = Math.max(0, Math.floor(o.frames || logInfo.log.length || 900));
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null)
      ? Math.floor(frames * 0.5)
      : Math.max(0, o.snapshotFrame | 0);
    var verbose = !!o.verbose;
    var includeAudit = (o.includeAudit === undefined) ? true : !!o.includeAudit;
    var includeRoster = (o.includeRoster === undefined) ? true : !!o.includeRoster;
    var includeCombos = !!o.includeCombos;
    var worldSource = o.world ? 'provided' : 'fresh-seed-world';
    var world = o.world || null;
    var rosterSnapshot = buildRosterSnapshot(o);
    var auditBundle = null;
    var auditCompact = null;
    var bundle;
    var summary;
    var downloadInfo;

    if (!world) {
      if (!e || typeof e.createWorld !== 'function') {
        bundle = {
          metadata: {
            engineVersion: String(ns.version || ''),
            engineSource: String(e && e.__source || ''),
            timestamp: new Date().toISOString(),
            seed: seed,
            frames: frames,
            snapshotFrame: snapshotFrame,
            logName: logInfo.logName,
            worldSource: worldSource,
            preset: 'balance-snapshot'
          },
          summary: {
            ok: false,
            auditOk: false,
            rosterCount: rosterSnapshot.rosterCount,
            moveCount: rosterSnapshot.moveCount,
            hasRoundRecap: false,
            hasMatchRecap: false,
            sfEnabled: false,
            mkEnabled: false,
            error: 'engine-createWorld-unavailable'
          },
          audit: null,
          world: null,
          roster: includeRoster ? rosterSnapshot.roster : null,
          combos: includeCombos ? cloneJson(((global.BALANCE && global.BALANCE.fight && global.BALANCE.fight.mkGbaTargetCombos) || {})) : null,
          recaps: { lastRoundRecap: null, lastMatchRecap: null }
        };
        bundle.summary.download = maybeDownloadBundle(bundle, o);
        return bundle;
      }
      try {
        world = e.createWorld(seed, {});
      } catch (err) {
        bundle = {
          metadata: {
            engineVersion: String(ns.version || ''),
            engineSource: String(e && e.__source || ''),
            timestamp: new Date().toISOString(),
            seed: seed,
            frames: frames,
            snapshotFrame: snapshotFrame,
            logName: logInfo.logName,
            worldSource: worldSource,
            preset: 'balance-snapshot'
          },
          summary: {
            ok: false,
            auditOk: false,
            rosterCount: rosterSnapshot.rosterCount,
            moveCount: rosterSnapshot.moveCount,
            hasRoundRecap: false,
            hasMatchRecap: false,
            sfEnabled: false,
            mkEnabled: false,
            error: String(err && err.message ? err.message : err)
          },
          audit: null,
          world: null,
          roster: includeRoster ? rosterSnapshot.roster : null,
          combos: includeCombos ? cloneJson(((global.BALANCE && global.BALANCE.fight && global.BALANCE.fight.mkGbaTargetCombos) || {})) : null,
          recaps: { lastRoundRecap: null, lastMatchRecap: null }
        };
        bundle.summary.download = maybeDownloadBundle(bundle, o);
        return bundle;
      }
    }

    if (includeAudit) {
      auditBundle = exportAuditBundle(e, balanceSnapshotAuditOpts(o));
      auditCompact = compactAuditForSnapshot(auditBundle, verbose);
    }

    summary = {
      ok: includeAudit ? !!(auditBundle && auditBundle.summary && auditBundle.summary.ok) : true,
      auditOk: includeAudit ? !!(auditBundle && auditBundle.summary && auditBundle.summary.ok) : true,
      rosterCount: rosterSnapshot.rosterCount,
      moveCount: rosterSnapshot.moveCount,
      hasRoundRecap: !!(world && world.l15Stats && world.l15Stats.lastRoundRecap),
      hasMatchRecap: !!(world && world.l15Stats && world.l15Stats.lastMatchRecap),
      sfEnabled: !!(world && world.sf && world.sf.enabled),
      mkEnabled: !!(world && world.mkGba && world.mkGba.enabled)
    };

    bundle = {
      metadata: {
        engineVersion: String(ns.version || ''),
        engineSource: String(e && e.__source || ''),
        timestamp: new Date().toISOString(),
        seed: seed,
        frames: frames,
        snapshotFrame: snapshotFrame,
        logName: logInfo.logName,
        worldSource: worldSource,
        preset: 'balance-snapshot'
      },
      summary: summary,
      audit: includeAudit ? auditCompact : null,
      world: compactWorldContext(world),
      roster: includeRoster ? rosterSnapshot.roster : null,
      combos: includeCombos ? cloneJson(((global.BALANCE && global.BALANCE.fight && global.BALANCE.fight.mkGbaTargetCombos) || {})) : null,
      recaps: {
        lastRoundRecap: cloneJson(world && world.l15Stats ? world.l15Stats.lastRoundRecap : null),
        lastMatchRecap: cloneJson(world && world.l15Stats ? world.l15Stats.lastMatchRecap : null)
      }
    };

    downloadInfo = maybeDownloadBundle(bundle, o);
    bundle.summary.download = downloadInfo;
    return bundle;
  }

  function exportAuditBundle(engine, opts){
    var e = engine || global.FIGHT_ENGINE;
    var o = opts || {};
    var logInfo = resolveAuditLog(o);
    var log = logInfo.log;
    var seed = (o.seed === undefined || o.seed === null) ? 1337 : o.seed;
    var frames = Math.max(0, Math.floor(o.frames || log.length || 900));
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null)
      ? Math.floor(frames * 0.5)
      : Math.max(0, o.snapshotFrame | 0);
    var includeDependencyAudit = (o.includeDependencyAudit === undefined) ? true : !!o.includeDependencyAudit;
    var includeRouteDiagnostics = (o.includeRouteDiagnostics === undefined) ? true : !!o.includeRouteDiagnostics;
    var includeParity = (o.includeParity === undefined) ? true : !!o.includeParity;
    var verbose = !!o.verbose;
    var normalizedSuites = normalizeParitySuites(o.paritySuites);
    var suites = includeParity ? normalizedSuites.valid : [];
    var registry = suiteRegistry();
    var runOpts = copyOpts(o);
    var generatedAt = new Date().toISOString();
    var depRaw = null;
    var parity = {};
    var details = verbose ? { parity: {}, dependencyAudit: null, routeDiagnostics: null } : null;
    var passedSuites = [];
    var failedSuites = [];
    var i, suiteName, suiteRunner, suiteResult;

    runOpts.snapshotFrame = snapshotFrame;

    if (!e || !e.debug) {
      return {
        metadata: {
          engineVersion: String(ns.version || ''),
          engineSource: String(e && e.__source || ''),
          timestamp: generatedAt,
          logName: logInfo.logName,
          logLength: log.length | 0,
          seed: seed,
          frames: frames,
          snapshotFrame: snapshotFrame
        },
        summary: {
          ok: false,
          generatedAt: generatedAt,
          includeDependencyAudit: includeDependencyAudit,
          includeRouteDiagnostics: includeRouteDiagnostics,
          includeParity: includeParity,
          requestedSuites: includeParity ? normalizedSuites.valid.slice(0) : [],
          executedSuites: [],
          passedSuites: [],
          failedSuites: [],
          invalidSuites: normalizedSuites.invalid.slice(0),
          dependencyAuditOk: false,
          integrityIssues: [],
          error: 'engine-debug-unavailable'
        },
        dependencyAudit: {
          included: includeDependencyAudit,
          ok: false,
          dependencyAudit: null,
          compareDependencyAudit: null,
          integrityIssues: []
        },
        routeDiagnostics: {
          included: includeRouteDiagnostics,
          routeDiagnosticSummary: [],
          compareRouteDiagnosticSummary: []
        },
        parity: {},
        details: verbose ? details : undefined
      };
    }

    if (includeDependencyAudit || includeRouteDiagnostics) {
      depRaw = runDependencyAudit(log, seed, frames, runOpts);
      if (verbose && details) {
        details.dependencyAudit = depRaw;
        details.routeDiagnostics = depRaw ? {
          routeDiagnostics: depRaw.routeDiagnostics || [],
          compareRouteDiagnostics: depRaw.compareRouteDiagnostics || []
        } : null;
      }
    }

    for (i = 0; i < suites.length; i++) {
      suiteName = suites[i];
      suiteRunner = registry[suiteName];
      if (!suiteRunner) {
        parity[suiteName] = {
          ok: false,
          reason: 'invalid-suite',
          subsystem: '',
          firstDivergentFrame: 0,
          error: 'suite-runner-unavailable'
        };
        failedSuites.push(suiteName);
        continue;
      }
      try {
        suiteResult = suiteRunner(log, seed, frames, runOpts);
      } catch (err) {
        suiteResult = {
          ok: false,
          reason: 'exception',
          subsystem: '',
          firstDivergentFrame: 0,
          error: String(err && err.message ? err.message : err)
        };
      }
      parity[suiteName] = compactParityResult(suiteResult);
      if (verbose && details) details.parity[suiteName] = suiteResult;
      if (suiteResult && suiteResult.ok) passedSuites.push(suiteName);
      else failedSuites.push(suiteName);
    }

    var depOk = (includeDependencyAudit || includeRouteDiagnostics) ? dependencyAuditOk(depRaw) : true;
    var bundle = {
      metadata: {
        engineVersion: String(ns.version || ''),
        engineSource: String(e.__source || ''),
        timestamp: generatedAt,
        logName: logInfo.logName,
        logLength: log.length | 0,
        seed: seed,
        frames: frames,
        snapshotFrame: snapshotFrame
      },
      summary: {
        ok: depOk && failedSuites.length === 0 && normalizedSuites.invalid.length === 0,
        generatedAt: generatedAt,
        includeDependencyAudit: includeDependencyAudit,
        includeRouteDiagnostics: includeRouteDiagnostics,
        includeParity: includeParity,
        requestedSuites: includeParity ? normalizedSuites.valid.slice(0) : [],
        executedSuites: suites.slice(0),
        passedSuites: passedSuites,
        failedSuites: failedSuites,
        invalidSuites: normalizedSuites.invalid.slice(0),
        dependencyAuditOk: depOk,
        integrityIssues: depRaw && Array.isArray(depRaw.integrityIssues) ? depRaw.integrityIssues : []
      },
      dependencyAudit: {
        included: includeDependencyAudit,
        ok: depOk,
        dependencyAudit: includeDependencyAudit && depRaw ? (depRaw.dependencyAudit || null) : null,
        compareDependencyAudit: includeDependencyAudit && depRaw ? (depRaw.compareDependencyAudit || null) : null,
        integrityIssues: depRaw && Array.isArray(depRaw.integrityIssues) ? depRaw.integrityIssues : []
      },
      routeDiagnostics: {
        included: includeRouteDiagnostics,
        routeDiagnosticSummary: includeRouteDiagnostics && depRaw ? (depRaw.routeDiagnosticSummary || []) : [],
        compareRouteDiagnosticSummary: includeRouteDiagnostics && depRaw ? (depRaw.compareRouteDiagnosticSummary || []) : []
      },
      parity: parity
    };

    if (verbose && details) bundle.details = details;

    bundle.summary.download = maybeDownloadBundle(bundle, o);

    return bundle;
  }

  function runDeterminism(engine, log, opts) {
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var seed = (o.seed === undefined || o.seed === null) ? 1337 : o.seed;
    var frames = o.frames || l.length || 900;
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null) ? 300 : Math.floor(o.snapshotFrame);

    var w1 = engine.createWorld(seed, {});
    var w2 = engine.createWorld(seed, {});
    var i;

    var snapshotParityOk = true;
    for (i = 0; i < frames; i++) {
      var fi = l[i] || neutralFrameInput();
      engine.step(w1, fi);
      engine.step(w2, fi);

      var h1 = engine.stateHash(w1);
      var h2 = engine.stateHash(w2);

      if (i === snapshotFrame) {
        var snap = engine.snapshot(w1);
        var before = engine.stateHash(w1);
        engine.restore(w1, snap);
        var after = engine.stateHash(w1);
        if (before !== after) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            frame: i + 1,
            firstDivergentFrame: i + 1,
            hashBefore: before,
            hashAfter: after,
            snapshotParityOk: false,
            subsystem: 'world-hash-snapshot'
          };
        }
      }

      if (o.forceFailAtFrame && (i + 1) === (o.forceFailAtFrame | 0)) {
        w2.frame = (w2.frame | 0) + 1;
      }

      if (h1 !== h2) {
        var digestA = digestWorld(w1);
        var digestB = digestWorld(w2);
        var diff = (digestA && digestB) ? diffDigests(digestA, digestB) : null;
        return {
          ok: false,
          reason: 'determinism',
          frame: i + 1,
          firstDivergentFrame: i + 1,
          hashA: h1,
          hashB: h2,
          diff: diff,
          subsystem: classifyDiff(diff),
          snapshotParityOk: snapshotParityOk
        };
      }
    }

    return {
      ok: true,
      frame: frames,
      firstDivergentFrame: 0,
      finalA: engine.stateHash(w1),
      finalB: engine.stateHash(w2),
      snapshotParityOk: snapshotParityOk
    };
  }

  function runAdapterParityAgainstLegacy(log, seed, frames, opts) {
    var legacy = global.__FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE_LEGACY;
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    var i;

    if (!legacy || typeof legacy.createWorld !== 'function') {
      return { ok: false, error: 'legacy-engine-unavailable' };
    }
    if (!adapter || typeof adapter.createWorld !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var lw = legacy.createWorld(s, {});
    var aw = adapter.createWorld(s, {});
    if (o.forceCreateMismatch) {
      aw.frame = (aw.frame | 0) + 1;
    }

    var initLegacyHash = legacy.stateHash(lw);
    var initAdapterHash = adapter.stateHash(aw);
    if (initLegacyHash !== initAdapterHash) {
      var initD1 = digestWorld(lw);
      var initD2 = digestWorld(aw);
      var initDiff = (initD1 && initD2) ? diffDigests(initD1, initD2) : null;
      return {
        ok: false,
        reason: 'world-init',
        frame: 0,
        firstDivergentFrame: 0,
        legacyHash: initLegacyHash,
        adapterHash: initAdapterHash,
        diff: initDiff,
        subsystem: 'world-init',
        snapshotParityOk: true
      };
    }

    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0);
    var snapshotParityOk = true;
    for (i = 0; i < max; i++) {
      var fi = l[i] || neutralFrameInput();
      legacy.step(lw, fi);
      adapter.step(aw, fi);

      var lh = legacy.stateHash(lw);
      var ah = adapter.stateHash(aw);

      if (i === snapshotFrame) {
        var snapLegacy = legacy.snapshot(lw);
        var lb = legacy.stateHash(lw);
        legacy.restore(lw, snapLegacy);
        var la = legacy.stateHash(lw);
        var snapAdapter = adapter.snapshot(aw);
        var ab = adapter.stateHash(aw);
        adapter.restore(aw, snapAdapter);
        var aa = adapter.stateHash(aw);
        if (lb !== la || ab !== aa) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            frame: i + 1,
            firstDivergentFrame: i + 1,
            legacySnapshotBefore: lb,
            legacySnapshotAfter: la,
            adapterSnapshotBefore: ab,
            adapterSnapshotAfter: aa,
            snapshotParityOk: false,
            subsystem: 'world-hash-snapshot'
          };
        }
      }

      if (o.forceFailAtFrame && (i + 1) === (o.forceFailAtFrame | 0)) {
        aw.frame = (aw.frame | 0) + 1;
      }

      if (lh !== ah) {
        var d1 = digestWorld(lw);
        var d2 = digestWorld(aw);
        var diff = (d1 && d2) ? diffDigests(d1, d2) : null;
        return {
          ok: false,
          frame: i + 1,
          firstDivergentFrame: i + 1,
          legacyHash: lh,
          adapterHash: ah,
          diff: diff,
          subsystem: classifyDiff(diff),
          snapshotParityOk: snapshotParityOk
        };
      }
    }

    if (o.assertPerFrame) {
      return {
        ok: true,
        frame: max,
        firstDivergentFrame: 0,
        legacyFinal: legacy.stateHash(lw),
        adapterFinal: adapter.stateHash(aw),
        snapshotParityOk: snapshotParityOk
      };
    }

    return {
      ok: true,
      firstDivergentFrame: 0,
      legacyFinal: legacy.stateHash(lw),
      adapterFinal: adapter.stateHash(aw),
      frames: max,
      snapshotParityOk: snapshotParityOk
    };
  }

  function eventDigest(events){
    var out = [];
    var arr = events || [];
    for (var i = 0; i < arr.length; i++) {
      var ev = arr[i] || {};
      var t = String(ev.type || '');
      if (t === 'phase') {
        out.push({ t: t, phase: String(ev.phase || ''), round: ev.round | 0, s1: ev.score ? (ev.score.p1 | 0) : 0, s2: ev.score ? (ev.score.p2 | 0) : 0 });
      } else if (t === 'roundRecap' || t === 'matchRecap') {
        out.push({ t: t, winner: String(ev.winner || ''), kind: ev.summary ? String(ev.summary.kind || '') : '' });
      } else if (t === 'timerWarning') {
        out.push({ t: t, sec: ev.seconds | 0, rem: ev.remainingFrames | 0 });
      } else if (t === 'timerExpired' || t === 'ko') {
        out.push({ t: t, winner: String(ev.winner || ''), timerKO: !!ev.timerKO });
      }
    }
    return out;
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

  function classifyLifecycleEventMismatch(a, b){
    var ea = (a && a.length) ? String((a[0] && a[0].t) || '') : '';
    var eb = (b && b.length) ? String((b[0] && b[0].t) || '') : '';
    var t = ea || eb;
    if (t === 'phase') return 'phase';
    if (t === 'roundRecap' || t === 'matchRecap') return 'recap';
    if (t === 'timerWarning' || t === 'timerExpired') return 'timer-winner';
    if (t === 'ko') return 'score-flow';
    return 'phase';
  }

  function applyLifecycleMismatch(world, kind){
    if (!world) return;
    var k = String(kind || '').toLowerCase();
    if (k === 'phase') {
      world.phaseTimer = (world.phaseTimer | 0) + 1;
    } else if (k === 'round-reset') {
      world.round = (world.round | 0) + 1;
    } else if (k === 'timer-winner') {
      if (world.mkGba) world.mkGba.roundTimerFrames = 0;
    } else if (k === 'recap') {
      world.l15Stats = world.l15Stats || {};
      world.l15Stats.lastRoundRecap = { forced: true, frame: world.frame | 0 };
    } else if (k === 'score-flow') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function classifyStepShellEventMismatch(a, b){
    var ea = (a && a.length) ? String((a[0] && a[0].t) || '') : '';
    var eb = (b && b.length) ? String((b[0] && b[0].t) || '') : '';
    var t = ea || eb;
    if (t === 'phase') return 'phase-shell';
    if (t === 'timerWarning') return 'timer-warning';
    if (t === 'timerExpired') return 'timer-expiry';
    if (t === 'ko') return 'ko-shell';
    if (t === 'roundRecap' || t === 'matchRecap') return 'event-order';
    return 'event-order';
  }

  function applyStepShellMismatch(world, kind){
    if (!world) return;
    var k = String(kind || '').toLowerCase();
    if (k === 'frame-order') {
      world.frame = (world.frame | 0) + 1;
    } else if (k === 'phase-shell') {
      world.phaseTimer = (world.phaseTimer | 0) + 1;
    } else if (k === 'hitstop-shell') {
      world.interaction = world.interaction || {};
      world.interaction.hitstop = (world.interaction.hitstop | 0) + 1;
    } else if (k === 'timer-warning') {
      world.mkGba = world.mkGba || {};
      world.mkGba.timerWarned = world.mkGba.timerWarned || { s15: false, s10: false, s5: false };
      world.mkGba.timerWarned.s15 = !world.mkGba.timerWarned.s15;
    } else if (k === 'timer-expiry') {
      world.mkGba = world.mkGba || {};
      world.mkGba.roundTimerFrames = 0;
    } else if (k === 'ko-shell') {
      world.winner = (world.winner === 'p1') ? 'p2' : 'p1';
    } else if (k === 'snapshot-ring') {
      world.debug = world.debug || {};
      world.debug.snapshots = Array.isArray(world.debug.snapshots) ? world.debug.snapshots : [];
      world.debug.snapshots.push({ forced: true, frame: world.frame | 0 });
    } else if (k === 'event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function applyCombatBodyMismatch(world, kind){
    if (!world || !world.fighters || !world.fighters.p1 || !world.fighters.p2) return;
    var k = String(kind || '').toLowerCase();
    if (k === 'fighter-tick') {
      world.fighters.p1.stateFrame = (world.fighters.p1.stateFrame | 0) + 1;
    } else if (k === 'facing') {
      world.fighters.p1.facing = (world.fighters.p1.facing === 1) ? -1 : 1;
    } else if (k === 'box-refresh') {
      world.fighters.p1.boxes = { hurt: [], hit: [], push: [] };
    } else if (k === 'push-order') {
      world.fighters.p1.x = (world.fighters.p1.x | 0) + 1;
    } else if (k === 'strike-order') {
      world.interaction = world.interaction || {};
      world.interaction.lastExchange = { frame: world.frame | 0, moveId: 'forced', hitType: 'hit' };
    } else if (k === 'throw-order') {
      world.fighters.p1.throwTechFramesLeft = (world.fighters.p1.throwTechFramesLeft | 0) + 1;
    } else if (k === 'combat-event-order') {
      world.score = world.score || { p1: 0, p2: 0 };
      world.score.p1 = (world.score.p1 | 0) + 1;
    }
  }

  function runLifecycleParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.createWorld !== 'function' || typeof adapter.step !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var wModule = adapter.createWorld(s, { __lifecycleOwner: 'module' });
    var wLegacy = adapter.createWorld(s, { __lifecycleOwner: 'legacy' });
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0);
    var forceKind = o.forceMismatchKind || global.__fightLifecycleForceMismatchKind || '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);
    var snapshotParityOk = true;

    var initModuleHash = adapter.stateHash(wModule);
    var initLegacyHash = adapter.stateHash(wLegacy);
    if (initModuleHash !== initLegacyHash) {
      var initDiff = diffDigests(digestWorld(wModule), digestWorld(wLegacy));
      return {
        ok: false,
        reason: 'world-init',
        firstDivergentFrame: 0,
        moduleHash: initModuleHash,
        legacyHash: initLegacyHash,
        diff: initDiff,
        subsystem: classifyLifecycleDiff(initDiff),
        snapshotParityOk: true
      };
    }

    for (var i = 0; i < max; i++) {
      var fi = l[i] || neutralFrameInput();
      var evModule = adapter.step(wModule, fi) || [];
      var evLegacy = adapter.step(wLegacy, fi) || [];

      if (forceKind && (i + 1) === forceFrame) {
        applyLifecycleMismatch(wLegacy, forceKind);
      }

      if (i === snapshotFrame) {
        var sm = adapter.snapshot(wModule);
        var hmb = adapter.stateHash(wModule);
        adapter.restore(wModule, sm);
        var hma = adapter.stateHash(wModule);
        var sl = adapter.snapshot(wLegacy);
        var hlb = adapter.stateHash(wLegacy);
        adapter.restore(wLegacy, sl);
        var hla = adapter.stateHash(wLegacy);
        if (hmb !== hma || hlb !== hla) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            firstDivergentFrame: i + 1,
            moduleSnapshotBefore: hmb,
            moduleSnapshotAfter: hma,
            legacySnapshotBefore: hlb,
            legacySnapshotAfter: hla,
            subsystem: 'phase',
            snapshotParityOk: false
          };
        }
      }

      var hm = adapter.stateHash(wModule);
      var hl = adapter.stateHash(wLegacy);
      if (hm !== hl) {
        var d1 = digestWorld(wModule);
        var d2 = digestWorld(wLegacy);
        var diff = diffDigests(d1, d2);
        return {
          ok: false,
          reason: 'determinism',
          firstDivergentFrame: i + 1,
          moduleHash: hm,
          legacyHash: hl,
          diff: diff,
          subsystem: classifyLifecycleDiff(diff),
          snapshotParityOk: snapshotParityOk
        };
      }

      var moduleSnapLen = (wModule && wModule.debug && Array.isArray(wModule.debug.snapshots)) ? wModule.debug.snapshots.length : 0;
      var legacySnapLen = (wLegacy && wLegacy.debug && Array.isArray(wLegacy.debug.snapshots)) ? wLegacy.debug.snapshots.length : 0;
      if (moduleSnapLen !== legacySnapLen) {
        return {
          ok: false,
          reason: 'snapshot-ring',
          firstDivergentFrame: i + 1,
          moduleSnapshotCount: moduleSnapLen,
          legacySnapshotCount: legacySnapLen,
          subsystem: 'snapshot-ring',
          snapshotParityOk: snapshotParityOk
        };
      }

      var edA = eventDigest(evModule);
      var edB = eventDigest(evLegacy);
      if (JSON.stringify(edA) !== JSON.stringify(edB)) {
        return {
          ok: false,
          reason: 'event-mismatch',
          firstDivergentFrame: i + 1,
          moduleEvents: edA,
          legacyEvents: edB,
          subsystem: classifyLifecycleEventMismatch(edA, edB),
          snapshotParityOk: snapshotParityOk
        };
      }
    }

    return {
      ok: true,
      reason: '',
      firstDivergentFrame: 0,
      moduleFinal: adapter.stateHash(wModule),
      legacyFinal: adapter.stateHash(wLegacy),
      subsystem: '',
      snapshotParityOk: snapshotParityOk
    };
  }

  function runStepShellParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.createWorld !== 'function' || typeof adapter.step !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var wModule = adapter.createWorld(s, { __stepOwner: 'module', __lifecycleOwner: 'module' });
    var wLegacy = adapter.createWorld(s, { __stepOwner: 'legacy', __lifecycleOwner: 'module' });
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0);
    var forceKind = o.forceMismatchKind || global.__fightStepShellForceMismatchKind || '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);
    var snapshotParityOk = true;

    var initModuleHash = adapter.stateHash(wModule);
    var initLegacyHash = adapter.stateHash(wLegacy);
    if (initModuleHash !== initLegacyHash) {
      var initDiff = diffDigests(digestWorld(wModule), digestWorld(wLegacy));
      return {
        ok: false,
        reason: 'world-init',
        firstDivergentFrame: 0,
        moduleHash: initModuleHash,
        legacyHash: initLegacyHash,
        diff: initDiff,
        subsystem: classifyStepShellDiff(initDiff),
        snapshotParityOk: true
      };
    }

    for (var i = 0; i < max; i++) {
      var fi = l[i] || neutralFrameInput();
      var evModule = adapter.step(wModule, fi) || [];
      var evLegacy = adapter.step(wLegacy, fi) || [];

      if (forceKind && (i + 1) === forceFrame) {
        applyStepShellMismatch(wLegacy, forceKind);
      }

      if (i === snapshotFrame) {
        var sm = adapter.snapshot(wModule);
        var hmb = adapter.stateHash(wModule);
        adapter.restore(wModule, sm);
        var hma = adapter.stateHash(wModule);
        var sl = adapter.snapshot(wLegacy);
        var hlb = adapter.stateHash(wLegacy);
        adapter.restore(wLegacy, sl);
        var hla = adapter.stateHash(wLegacy);
        if (hmb !== hma || hlb !== hla) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            firstDivergentFrame: i + 1,
            moduleSnapshotBefore: hmb,
            moduleSnapshotAfter: hma,
            legacySnapshotBefore: hlb,
            legacySnapshotAfter: hla,
            subsystem: 'snapshot-ring',
            snapshotParityOk: false
          };
        }
      }

      var hm = adapter.stateHash(wModule);
      var hl = adapter.stateHash(wLegacy);
      if (hm !== hl) {
        var d1 = digestWorld(wModule);
        var d2 = digestWorld(wLegacy);
        var diff = diffDigests(d1, d2);
        return {
          ok: false,
          reason: 'determinism',
          firstDivergentFrame: i + 1,
          moduleHash: hm,
          legacyHash: hl,
          diff: diff,
          subsystem: classifyStepShellDiff(diff),
          snapshotParityOk: snapshotParityOk
        };
      }

      var edA = eventDigest(evModule);
      var edB = eventDigest(evLegacy);
      if (JSON.stringify(edA) !== JSON.stringify(edB)) {
        return {
          ok: false,
          reason: 'event-mismatch',
          firstDivergentFrame: i + 1,
          moduleEvents: edA,
          legacyEvents: edB,
          subsystem: classifyStepShellEventMismatch(edA, edB),
          snapshotParityOk: snapshotParityOk
        };
      }
    }

    return {
      ok: true,
      reason: '',
      firstDivergentFrame: 0,
      moduleFinal: adapter.stateHash(wModule),
      legacyFinal: adapter.stateHash(wLegacy),
      subsystem: '',
      snapshotParityOk: snapshotParityOk
    };
  }

  function runCombatBodyParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.createWorld !== 'function' || typeof adapter.step !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var wModule = adapter.createWorld(s, { __stepOwner: 'module', __lifecycleOwner: 'module', __combatBodyOwner: 'module' });
    var wLegacy = adapter.createWorld(s, { __stepOwner: 'module', __lifecycleOwner: 'module', __combatBodyOwner: 'legacy' });
    var snapshotFrame = (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0);
    var forceKind = o.forceMismatchKind || global.__fightCombatBodyForceMismatchKind || '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);
    var snapshotParityOk = true;

    var initModuleHash = adapter.stateHash(wModule);
    var initLegacyHash = adapter.stateHash(wLegacy);
    if (initModuleHash !== initLegacyHash) {
      var initDiff = diffDigests(digestWorld(wModule), digestWorld(wLegacy));
      return {
        ok: false,
        reason: 'world-init',
        firstDivergentFrame: 0,
        moduleHash: initModuleHash,
        legacyHash: initLegacyHash,
        diff: initDiff,
        subsystem: classifyCombatBodyDiff(initDiff),
        snapshotParityOk: true
      };
    }

    for (var i = 0; i < max; i++) {
      var fi = l[i] || neutralFrameInput();
      var evModule = adapter.step(wModule, fi) || [];
      var evLegacy = adapter.step(wLegacy, fi) || [];

      if (forceKind && (i + 1) === forceFrame) {
        applyCombatBodyMismatch(wLegacy, forceKind);
      }

      if (i === snapshotFrame) {
        var sm = adapter.snapshot(wModule);
        var hmb = adapter.stateHash(wModule);
        adapter.restore(wModule, sm);
        var hma = adapter.stateHash(wModule);
        var sl = adapter.snapshot(wLegacy);
        var hlb = adapter.stateHash(wLegacy);
        adapter.restore(wLegacy, sl);
        var hla = adapter.stateHash(wLegacy);
        if (hmb !== hma || hlb !== hla) {
          snapshotParityOk = false;
          return {
            ok: false,
            reason: 'snapshot',
            firstDivergentFrame: i + 1,
            moduleSnapshotBefore: hmb,
            moduleSnapshotAfter: hma,
            legacySnapshotBefore: hlb,
            legacySnapshotAfter: hla,
            subsystem: 'combat-event-order',
            snapshotParityOk: false
          };
        }
      }

      var hm = adapter.stateHash(wModule);
      var hl = adapter.stateHash(wLegacy);
      if (hm !== hl) {
        var d1 = digestWorld(wModule);
        var d2 = digestWorld(wLegacy);
        var diff = diffDigests(d1, d2);
        return {
          ok: false,
          reason: 'determinism',
          firstDivergentFrame: i + 1,
          moduleHash: hm,
          legacyHash: hl,
          diff: diff,
          subsystem: classifyCombatBodyDiff(diff),
          snapshotParityOk: snapshotParityOk
        };
      }

      var edA = combatEventDigest(evModule);
      var edB = combatEventDigest(evLegacy);
      if (JSON.stringify(edA) !== JSON.stringify(edB)) {
        return {
          ok: false,
          reason: 'event-mismatch',
          firstDivergentFrame: i + 1,
          moduleEvents: edA,
          legacyEvents: edB,
          subsystem: 'combat-event-order',
          snapshotParityOk: snapshotParityOk
        };
      }
    }

    return {
      ok: true,
      reason: '',
      firstDivergentFrame: 0,
      moduleFinal: adapter.stateHash(wModule),
      legacyFinal: adapter.stateHash(wLegacy),
      subsystem: '',
      snapshotParityOk: snapshotParityOk
    };
  }

  function runGeometryParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightGeometryForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    if (cfg.__geometryOwner === undefined) cfg.__geometryOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      geometryMode: true,
      compareGeometryOwners: true,
      compareLegacyGeometry: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureGeometryProbes: true,
      forceGeometryMismatchKind: forceKind,
      forceGeometryMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'geometry-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase') {
        if (result.diff) subsystem = classifyGeometryDiff(result.diff);
        else subsystem = 'geometry-digest';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runFighterParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightFighterForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    if (cfg.__fighterOwner === undefined) cfg.__fighterOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      fighterMode: true,
      compareLegacyFighter: true,
      compareFighterOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureFighterProbes: true,
      forceFighterMismatchKind: forceKind,
      forceFighterMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'fighter-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'fighter-tick') {
        if (result.diff) subsystem = classifyFighterDiff(result.diff);
        else subsystem = 'fighter-event-order';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runMoveBridgeParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightMoveBridgeForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    if (cfg.__moveBridgeOwner === undefined) cfg.__moveBridgeOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      moveBridgeMode: true,
      compareLegacyMoveBridge: true,
      compareMoveBridgeOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureMoveProbes: true,
      forceMoveBridgeMismatchKind: forceKind,
      forceMoveBridgeMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'move-bridge-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'fighter-tick') {
        if (result.diff) subsystem = classifyMoveBridgeDiff(result.diff);
        else subsystem = 'move-event-order';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runStrikeBridgeParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightStrikeBridgeForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    if (cfg.__strikeBridgeOwner === undefined) cfg.__strikeBridgeOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      strikeBridgeMode: true,
      compareLegacyStrikeBridge: true,
      compareStrikeBridgeOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureStrikeProbes: true,
      forceStrikeBridgeMismatchKind: forceKind,
      forceStrikeBridgeMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'strike-bridge-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'fighter-tick') {
        if (result.diff) subsystem = classifyStrikeBridgeDiff(result.diff);
        else subsystem = 'strike-event-order';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runExchangeParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightExchangeBridgeForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    if (cfg.__exchangeBridgeOwner === undefined) cfg.__exchangeBridgeOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      exchangeBridgeMode: true,
      compareLegacyExchangeBridge: true,
      compareExchangeBridgeOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureExchangeProbes: true,
      forceExchangeBridgeMismatchKind: forceKind,
      forceExchangeBridgeMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'exchange-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'exchange-bridge') {
        if (result.diff) subsystem = classifyExchangeBridgeDiff(result.diff);
        else subsystem = 'exchange-event-order';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runThrowParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightThrowBridgeForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    cfg.__exchangeBridgeOwner = 'module';
    if (cfg.__throwBridgeOwner === undefined) cfg.__throwBridgeOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      throwBridgeMode: true,
      compareLegacyThrowBridge: true,
      compareThrowBridgeOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureThrowProbes: true,
      forceThrowBridgeMismatchKind: forceKind,
      forceThrowBridgeMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'throw-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'throw-order') {
        if (result.diff) subsystem = classifyThrowBridgeDiff(result.diff);
        else subsystem = 'throw-event-order';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runHitstopParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightHitstopForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    cfg.__exchangeBridgeOwner = 'module';
    cfg.__throwBridgeOwner = 'module';
    if (cfg.__hitstopOwner === undefined) cfg.__hitstopOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      hitstopMode: true,
      compareLegacyHitstop: true,
      compareHitstopOwners: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureHitstopProbes: true,
      forceHitstopMismatchKind: forceKind,
      forceHitstopMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'hitstop-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase' || subsystem === 'hitstop-shell') {
        if (result.diff) subsystem = classifyHitstopDiff(result.diff);
        else subsystem = 'hitstop-value';
      }
      result.subsystem = subsystem;
    }
    return result;
  }

  function runConsequenceHelperParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightConsequenceHelperForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    cfg.__exchangeBridgeOwner = 'module';
    cfg.__throwBridgeOwner = 'module';
    cfg.__hitstopOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      consequenceHelperMode: true,
      compareLegacyConsequenceHelpers: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureConsequenceHelperProbes: true,
      forceConsequenceHelperMismatchKind: forceKind,
      forceConsequenceHelperMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'consequence-helper-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase') {
        subsystem = classifyConsequenceHelperProbeMismatch(
          result.moduleConsequenceHelperProbe || null,
          result.compareConsequenceHelperProbe || null
        );
      }
      result.subsystem = subsystem || 'helper-call-order';
    }
    return result;
  }

  function runDialComboHelperParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightDialComboHelperForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    cfg.__exchangeBridgeOwner = 'module';
    cfg.__throwBridgeOwner = 'module';
    cfg.__hitstopOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      dialComboHelperMode: true,
      compareLegacyDialComboHelpers: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureDialComboHelperProbes: true,
      forceDialComboHelperMismatchKind: forceKind,
      forceDialComboHelperMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'dial-combo-helper-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase') {
        subsystem = classifyDialComboHelperProbeMismatch(
          result.moduleDialComboHelperProbe || null,
          result.compareDialComboHelperProbe || null
        );
      }
      result.subsystem = subsystem || 'dial-helper-call-order';
    }
    return result;
  }

  function runTelemetryHelperParityAssert(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }

    var forceKind = String(o.forceMismatchKind || global.__fightTelemetryHelperForceMismatchKind || '').toLowerCase();
    if (forceKind === 'none' || forceKind === 'off' || forceKind === 'clear') forceKind = '';
    var forceFrame = (o.forceMismatchFrame === undefined || o.forceMismatchFrame === null) ? 1 : Math.max(1, o.forceMismatchFrame | 0);

    var cfg = {};
    var key;
    var inCfg = o.config || {};
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    cfg.__stepOwner = 'module';
    cfg.__lifecycleOwner = 'module';
    cfg.__combatBodyOwner = 'module';
    cfg.__geometryOwner = 'module';
    cfg.__fighterOwner = 'module';
    cfg.__moveBridgeOwner = 'module';
    cfg.__strikeBridgeOwner = 'module';
    cfg.__exchangeBridgeOwner = 'module';
    cfg.__throwBridgeOwner = 'module';
    cfg.__hitstopOwner = 'module';

    var result = adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      telemetryHelperMode: true,
      compareLegacyTelemetryHelpers: true,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? Math.floor(max * 0.5) : (o.snapshotFrame | 0),
      snapshotBothWorlds: !!o.snapshotBothWorlds,
      captureHashes: !!o.captureHashes,
      captureDigests: !!o.captureDigests,
      captureTelemetryHelperProbes: true,
      forceTelemetryHelperMismatchKind: forceKind,
      forceTelemetryHelperMismatchFrame: forceFrame
    });

    if (!result) return { ok: false, error: 'telemetry-helper-parity-run-failed' };
    if (!result.ok) {
      var subsystem = String(result.subsystem || '');
      if (!subsystem || subsystem === 'resolution-or-phase') {
        subsystem = classifyTelemetryHelperProbeMismatch(
          result.moduleTelemetryHelperProbe || null,
          result.compareTelemetryHelperProbe || null
        );
      }
      result.subsystem = subsystem || 'telemetry-call-order';
    }
    return result;
  }

  function runDependencyAudit(log, seed, frames, opts){
    var adapter = global.FIGHT_ENGINE;
    var o = opts || {};
    var l = log || global.FIGHT_TEST_LOG || [];
    var s = (seed === undefined || seed === null) ? 1337 : seed;
    var max = frames || l.length || 900;
    var cfg = {};
    var key;
    var inCfg = o.config || {};
    if (!adapter || typeof adapter.runInputLog !== 'function') {
      return { ok: false, error: 'adapter-engine-unavailable' };
    }
    for (key in inCfg) {
      if (Object.prototype.hasOwnProperty.call(inCfg, key)) cfg[key] = inCfg[key];
    }
    if (cfg.__stepOwner === undefined) cfg.__stepOwner = 'module';
    if (cfg.__lifecycleOwner === undefined) cfg.__lifecycleOwner = 'module';
    if (cfg.__combatBodyOwner === undefined) cfg.__combatBodyOwner = 'module';
    if (cfg.__geometryOwner === undefined) cfg.__geometryOwner = 'module';
    if (cfg.__fighterOwner === undefined) cfg.__fighterOwner = 'module';
    if (cfg.__moveBridgeOwner === undefined) cfg.__moveBridgeOwner = 'module';
    if (cfg.__strikeBridgeOwner === undefined) cfg.__strikeBridgeOwner = 'module';
    if (cfg.__exchangeBridgeOwner === undefined) cfg.__exchangeBridgeOwner = 'module';
    if (cfg.__throwBridgeOwner === undefined) cfg.__throwBridgeOwner = 'module';
    if (cfg.__hitstopOwner === undefined) cfg.__hitstopOwner = 'module';
    return adapter.runInputLog(null, l, max, {
      seed: s,
      config: cfg,
      snapshotFrame: (o.snapshotFrame === undefined || o.snapshotFrame === null) ? -1 : (o.snapshotFrame | 0),
      captureDependencyAudit: true,
      captureRouteDiagnostics: true,
      compareLegacyCreate: !!o.compareLegacyCreate,
      compareLegacyShell: !!o.compareLegacyShell,
      compareLegacyCombatBody: !!o.compareLegacyCombatBody,
      compareLegacyGeometry: !!o.compareLegacyGeometry,
      compareLegacyFighter: !!o.compareLegacyFighter,
      compareLegacyMoveBridge: !!o.compareLegacyMoveBridge,
      compareLegacyStrikeBridge: !!o.compareLegacyStrikeBridge,
      compareLegacyExchangeBridge: !!o.compareLegacyExchangeBridge,
      compareLegacyThrowBridge: !!o.compareLegacyThrowBridge,
      compareLegacyHitstop: !!o.compareLegacyHitstop,
      compareLegacyConsequenceHelpers: !!o.compareLegacyConsequenceHelpers,
      compareLegacyDialComboHelpers: !!o.compareLegacyDialComboHelpers,
      compareLegacyTelemetryHelpers: !!o.compareLegacyTelemetryHelpers,
      consequenceHelperMode: !!o.consequenceHelperMode,
      dialComboHelperMode: !!o.dialComboHelperMode,
      telemetryHelperMode: !!o.telemetryHelperMode
    });
  }

  ns.tools.determinism.runDeterminism = runDeterminism;
  ns.tools.determinism.runAdapterParityAgainstLegacy = runAdapterParityAgainstLegacy;
  ns.tools.determinism.runLifecycleParityAssert = runLifecycleParityAssert;
  ns.tools.determinism.runStepShellParityAssert = runStepShellParityAssert;
  ns.tools.determinism.runCombatBodyParityAssert = runCombatBodyParityAssert;
  ns.tools.determinism.runGeometryParityAssert = runGeometryParityAssert;
  ns.tools.determinism.runFighterParityAssert = runFighterParityAssert;
  ns.tools.determinism.runMoveBridgeParityAssert = runMoveBridgeParityAssert;
  ns.tools.determinism.runStrikeBridgeParityAssert = runStrikeBridgeParityAssert;
  ns.tools.determinism.runExchangeParityAssert = runExchangeParityAssert;
  ns.tools.determinism.runThrowParityAssert = runThrowParityAssert;
  ns.tools.determinism.runHitstopParityAssert = runHitstopParityAssert;
  ns.tools.determinism.runConsequenceHelperParityAssert = runConsequenceHelperParityAssert;
  ns.tools.determinism.runDialComboHelperParityAssert = runDialComboHelperParityAssert;
  ns.tools.determinism.runTelemetryHelperParityAssert = runTelemetryHelperParityAssert;
  ns.tools.determinism.runDependencyAudit = runDependencyAudit;
  ns.tools.determinism.exportAuditBundle = exportAuditBundle;
  ns.tools.determinism.runQuickSmoke = runQuickSmoke;
  ns.tools.determinism.runFullAudit = runFullAudit;
  ns.tools.determinism.runCombatFocusAudit = runCombatFocusAudit;
  ns.tools.determinism.exportBalanceSnapshot = exportBalanceSnapshot;

  function runQuickSmoke(engine, opts){
    return runPresetAudit(engine, 'quick-smoke', opts);
  }

  function runFullAudit(engine, opts){
    return runPresetAudit(engine, 'full-audit', opts);
  }

  function runCombatFocusAudit(engine, opts){
    return runPresetAudit(engine, 'combat-focus', opts);
  }

  if (typeof global !== 'undefined') {
    global._fightAdapterRunDeterminism = function(log, opts) {
      var engine = global.FIGHT_ENGINE;
      if (!engine || typeof engine.createWorld !== 'function') {
        return { ok: false, error: 'adapter-engine-unavailable' };
      }
      return runDeterminism(engine, log, opts || {});
    };

    global._fightAdapterParityAgainstLegacy = function(log, seed, frames, opts) {
      return runAdapterParityAgainstLegacy(log, seed, frames, opts || {});
    };
    global._fightLifecycleParityAssert = function(log, seed, frames, opts) {
      return runLifecycleParityAssert(log, seed, frames, opts || {});
    };
    global._fightLifecycleForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightLifecycleForceMismatchKind = '';
      } else {
        global.__fightLifecycleForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightLifecycleForceMismatchKind || 'none' };
    };
    global._fightStepShellParityAssert = function(log, seed, frames, opts) {
      return runStepShellParityAssert(log, seed, frames, opts || {});
    };
    global._fightStepShellForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightStepShellForceMismatchKind = '';
      } else {
        global.__fightStepShellForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightStepShellForceMismatchKind || 'none' };
    };
    global._fightCombatBodyParityAssert = function(log, seed, frames, opts) {
      return runCombatBodyParityAssert(log, seed, frames, opts || {});
    };
    global._fightCombatBodyForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightCombatBodyForceMismatchKind = '';
      } else {
        global.__fightCombatBodyForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightCombatBodyForceMismatchKind || 'none' };
    };
    global._fightGeometryParityAssert = function(log, seed, frames, opts) {
      return runGeometryParityAssert(log, seed, frames, opts || {});
    };
    global._fightGeometryForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightGeometryForceMismatchKind = '';
      } else {
        global.__fightGeometryForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightGeometryForceMismatchKind || 'none' };
    };
    global._fightFighterParityAssert = function(log, seed, frames, opts) {
      return runFighterParityAssert(log, seed, frames, opts || {});
    };
    global._fightFighterForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightFighterForceMismatchKind = '';
      } else {
        global.__fightFighterForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightFighterForceMismatchKind || 'none' };
    };
    global._fightMoveBridgeParityAssert = function(log, seed, frames, opts) {
      return runMoveBridgeParityAssert(log, seed, frames, opts || {});
    };
    global._fightMoveBridgeForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightMoveBridgeForceMismatchKind = '';
      } else {
        global.__fightMoveBridgeForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightMoveBridgeForceMismatchKind || 'none' };
    };
    global._fightStrikeBridgeParityAssert = function(log, seed, frames, opts) {
      return runStrikeBridgeParityAssert(log, seed, frames, opts || {});
    };
    global._fightStrikeBridgeForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightStrikeBridgeForceMismatchKind = '';
      } else {
        global.__fightStrikeBridgeForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightStrikeBridgeForceMismatchKind || 'none' };
    };
    global._fightExchangeParityAssert = function(log, seed, frames, opts) {
      return runExchangeParityAssert(log, seed, frames, opts || {});
    };
    global._fightExchangeForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightExchangeBridgeForceMismatchKind = '';
      } else {
        global.__fightExchangeBridgeForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightExchangeBridgeForceMismatchKind || 'none' };
    };
    global._fightThrowParityAssert = function(log, seed, frames, opts) {
      return runThrowParityAssert(log, seed, frames, opts || {});
    };
    global._fightThrowForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightThrowBridgeForceMismatchKind = '';
      } else {
        global.__fightThrowBridgeForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightThrowBridgeForceMismatchKind || 'none' };
    };
    global._fightHitstopParityAssert = function(log, seed, frames, opts) {
      return runHitstopParityAssert(log, seed, frames, opts || {});
    };
    global._fightHitstopForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightHitstopForceMismatchKind = '';
      } else {
        global.__fightHitstopForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightHitstopForceMismatchKind || 'none' };
    };
    global._fightConsequenceHelperParityAssert = function(log, seed, frames, opts) {
      return runConsequenceHelperParityAssert(log, seed, frames, opts || {});
    };
    global._fightConsequenceHelperForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightConsequenceHelperForceMismatchKind = '';
      } else {
        global.__fightConsequenceHelperForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightConsequenceHelperForceMismatchKind || 'none' };
    };
    global._fightDialComboHelperParityAssert = function(log, seed, frames, opts) {
      return runDialComboHelperParityAssert(log, seed, frames, opts || {});
    };
    global._fightDialComboHelperForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightDialComboHelperForceMismatchKind = '';
      } else {
        global.__fightDialComboHelperForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightDialComboHelperForceMismatchKind || 'none' };
    };
    global._fightTelemetryHelperParityAssert = function(log, seed, frames, opts) {
      return runTelemetryHelperParityAssert(log, seed, frames, opts || {});
    };
    global._fightTelemetryHelperForceMismatch = function(kind) {
      var k = String(kind || '').toLowerCase();
      if (!k || k === 'none' || k === 'clear' || k === 'off') {
        global.__fightTelemetryHelperForceMismatchKind = '';
      } else {
        global.__fightTelemetryHelperForceMismatchKind = k;
      }
      return { ok: true, kind: global.__fightTelemetryHelperForceMismatchKind || 'none' };
    };
    global._fightExportAuditBundle = function(opts) {
      if (global.FIGHT_ENGINE && global.FIGHT_ENGINE.debug && typeof global.FIGHT_ENGINE.debug.exportAuditBundle === 'function') {
        return global.FIGHT_ENGINE.debug.exportAuditBundle(opts || {});
      }
      return exportAuditBundle(global.FIGHT_ENGINE, opts || {});
    };
    global._fightQuickSmoke = function(opts) {
      if (global.FIGHT_ENGINE && global.FIGHT_ENGINE.debug && typeof global.FIGHT_ENGINE.debug.runQuickSmoke === 'function') {
        return global.FIGHT_ENGINE.debug.runQuickSmoke(opts || {});
      }
      return runQuickSmoke(global.FIGHT_ENGINE, opts || {});
    };
    global._fightFullAudit = function(opts) {
      if (global.FIGHT_ENGINE && global.FIGHT_ENGINE.debug && typeof global.FIGHT_ENGINE.debug.runFullAudit === 'function') {
        return global.FIGHT_ENGINE.debug.runFullAudit(opts || {});
      }
      return runFullAudit(global.FIGHT_ENGINE, opts || {});
    };
    global._fightCombatFocusAudit = function(opts) {
      if (global.FIGHT_ENGINE && global.FIGHT_ENGINE.debug && typeof global.FIGHT_ENGINE.debug.runCombatFocusAudit === 'function') {
        return global.FIGHT_ENGINE.debug.runCombatFocusAudit(opts || {});
      }
      return runCombatFocusAudit(global.FIGHT_ENGINE, opts || {});
    };
    global._fightExportBalanceSnapshot = function(opts) {
      if (global.FIGHT_ENGINE && global.FIGHT_ENGINE.debug && typeof global.FIGHT_ENGINE.debug.exportBalanceSnapshot === 'function') {
        return global.FIGHT_ENGINE.debug.exportBalanceSnapshot(opts || {});
      }
      return exportBalanceSnapshot(global.FIGHT_ENGINE, opts || {});
    };
    global._fightCopyAuditBundle = function(opts) {
      var bundle = global._fightExportAuditBundle(opts || {});
      var json = safeStringify(bundle);
      var clip = global.navigator && global.navigator.clipboard;
      if (clip && typeof clip.writeText === 'function') {
        try {
          var writeResult = clip.writeText(json);
          if (writeResult && typeof writeResult.catch === 'function') {
            writeResult.catch(function(){});
          }
        } catch (err) {
          /* best effort only */
        }
      }
      return json;
    };
  }
})(typeof window !== 'undefined' ? window : this);
