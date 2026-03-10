(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function constants(){
    return (ns.core && ns.core.constants) || null;
  }

  function phases(){
    var c = constants();
    if (c && typeof c.phases === 'function') return c.phases();
    return global.FIGHT_PHASES || {
      INTRO:'INTRO', ROUND_ANNOUNCE:'ROUND_ANNOUNCE', FIGHT_START:'FIGHT_START',
      FIGHT:'FIGHT', KO:'KO', WIN:'WIN', LOSE:'LOSE'
    };
  }

  function clone(v){
    var c = constants();
    if (c && typeof c.clone === 'function') return c.clone(v);
    if (typeof global._fightClone === 'function') return global._fightClone(v);
    if (v === null || v === undefined) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function cfgFor(world){
    if (world && world.cfg) return world.cfg;
    if (typeof global._fightConfigFor === 'function') return global._fightConfigFor(world);
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function fromPx(v){
    var c = constants();
    if (c && typeof c.fromPx === 'function') return c.fromPx(v);
    if (typeof global._fightFromPx === 'function') return global._fightFromPx(v);
    return Math.round(Number(v || 0) * Number(global.FIGHT_FP || 256));
  }

  function mkCalloutFrames(){
    var b = global.BALANCE || {};
    var f = global.FEATURE_FLAGS || {};
    if (f.fightVisualRevampV3 && b.fight && b.fight.visualV3 && b.fight.visualV3.hud) {
      return Math.max(1, Math.floor(b.fight.visualV3.hud.calloutFrames || 60));
    }
    return Math.max(1, Math.floor((b.fight && b.fight.ui && b.fight.ui.calloutFrames) || 60));
  }

  function setCallout(world, msg){
    if (!world || !world.mkGba || !world.mkGba.enabled) return;
    world.mkGba.callout = world.mkGba.callout || { text: '', framesLeft: 0 };
    world.mkGba.callout.text = String(msg || '');
    world.mkGba.callout.framesLeft = mkCalloutFrames();
  }

  function l15SideMap(v){ return { p1: v, p2: v }; }

  function l15StatBlock(){
    return {
      hitsLanded:l15SideMap(0),
      blocks:l15SideMap(0),
      throws:l15SideMap(0),
      throwWhiffs:l15SideMap(0),
      jumps:l15SideMap(0),
      heavies:l15SideMap(0),
      dizziesCaused:l15SideMap(0),
      cornerKos:l15SideMap(0),
      punishHits:l15SideMap(0),
      currentCombo:l15SideMap(0),
      maxCombo:l15SideMap(0),
      blockStreak:l15SideMap(0),
      maxBlockStreak:l15SideMap(0),
      throwDamage:l15SideMap(0),
      strikeDamage:l15SideMap(0),
      roundsWon:l15SideMap(0)
    };
  }

  function createL15Stats(){
    return {
      match: l15StatBlock(),
      round: l15StatBlock(),
      flags: {
        dizzyWarned: { p1: false, p2: false },
        cornerToastUntilFrame: 0
      },
      lastRoundRecap: null,
      lastMatchRecap: null
    };
  }

  function l15Bump(block, key, side, amt){
    if (!block || !block[key] || block[key][side] === undefined) return;
    block[key][side] += Math.floor(amt === undefined ? 1 : amt);
  }

  function ensureL15(world){
    if (!world) return null;
    world.l15Stats = world.l15Stats || createL15Stats();
    world.l15Stats.match = world.l15Stats.match || l15StatBlock();
    world.l15Stats.round = world.l15Stats.round || l15StatBlock();
    world.l15Stats.flags = world.l15Stats.flags || { dizzyWarned: { p1: false, p2: false }, cornerToastUntilFrame: 0 };
    world.l15Stats.flags.dizzyWarned = world.l15Stats.flags.dizzyWarned || { p1: false, p2: false };
    return world.l15Stats;
  }

  function resetL15Round(world){
    var l15 = ensureL15(world);
    if (!l15) return;
    l15.round = l15StatBlock();
    l15.flags.dizzyWarned = { p1: false, p2: false };
    l15.flags.cornerToastUntilFrame = 0;
  }

  function buildL15Summary(world, winner, isMatch){
    var l15 = ensureL15(world);
    var src = isMatch ? l15.match : l15.round;
    var tag = isMatch ? 'match' : 'round';
    return {
      kind: tag,
      frame: world ? (world.frame | 0) : 0,
      round: world ? (world.round | 0) : 0,
      winner: winner || '',
      p1: {
        hits: src.hitsLanded.p1, blocks: src.blocks.p1, throws: src.throws.p1, throwWhiffs: src.throwWhiffs.p1, jumps: src.jumps.p1,
        heavies: src.heavies.p1, dizzies: src.dizziesCaused.p1, cornerKos: src.cornerKos.p1, punishHits: src.punishHits.p1,
        maxCombo: src.maxCombo.p1, maxBlockStreak: src.maxBlockStreak.p1, throwDamage: src.throwDamage.p1, strikeDamage: src.strikeDamage.p1,
        roundsWon: src.roundsWon.p1
      },
      p2: {
        hits: src.hitsLanded.p2, blocks: src.blocks.p2, throws: src.throws.p2, throwWhiffs: src.throwWhiffs.p2, jumps: src.jumps.p2,
        heavies: src.heavies.p2, dizzies: src.dizziesCaused.p2, cornerKos: src.cornerKos.p2, punishHits: src.punishHits.p2,
        maxCombo: src.maxCombo.p2, maxBlockStreak: src.maxBlockStreak.p2, throwDamage: src.throwDamage.p2, strikeDamage: src.strikeDamage.p2,
        roundsWon: src.roundsWon.p2
      }
    };
  }

  function accumulateL15Round(world, winner){
    var l15 = ensureL15(world);
    var m = l15.match;
    var r = l15.round;
    var keys = ['hitsLanded','blocks','throws','throwWhiffs','jumps','heavies','dizziesCaused','cornerKos','punishHits','throwDamage','strikeDamage','roundsWon'];
    var sides = ['p1','p2'];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      for (var s = 0; s < sides.length; s++) {
        var side = sides[s];
        m[k][side] += r[k][side];
      }
    }
    if (winner === 'p1' || winner === 'p2') m.roundsWon[winner] += 1;
    for (s = 0; s < sides.length; s++) {
      side = sides[s];
      if (r.maxCombo[side] > m.maxCombo[side]) m.maxCombo[side] = r.maxCombo[side];
      if (r.maxBlockStreak[side] > m.maxBlockStreak[side]) m.maxBlockStreak[side] = r.maxBlockStreak[side];
    }
  }

  function finalizeRound(world, events){
    if (!world) return;
    var winner = world.winner || '';
    var summary = buildL15Summary(world, winner, false);
    ensureL15(world).lastRoundRecap = clone(summary);
    if (events) events.push({ type: 'roundRecap', summary: clone(summary) });
    accumulateL15Round(world, winner);
  }

  function setPhase(world, phase, events){
    if (!world) return;
    var p = phases();
    world.phase = phase;
    world.phaseTimer = 0;
    if (world.mkGba && world.mkGba.enabled) {
      if (phase === p.FIGHT_START) setCallout(world, 'ENGAGE');
      else if (phase === p.KO) setCallout(world, 'DECISIVE WINDOW');
    }
    if (events) {
      events.push({
        type: 'phase',
        phase: phase,
        round: world.round,
        score: { p1: world.score ? world.score.p1 : 0, p2: world.score ? world.score.p2 : 0 }
      });
    }
  }

  function resolveTimerWinner(world){
    if (!world || !world.fighters) return 'p1';
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    if (p1.health > p2.health) return 'p1';
    if (p2.health > p1.health) return 'p2';
    if (p1.stunMeter < p2.stunMeter) return 'p1';
    if (p2.stunMeter < p1.stunMeter) return 'p2';
    return ((((world.rng.seed + world.frame) >>> 0) & 1) === 0) ? 'p1' : 'p2';
  }

  function resetRound(world){
    var rr = ns.core && ns.core.world && ns.core.world.resetRound;
    if (rr && typeof rr.resetRound === 'function') {
      rr.resetRound(world);
      return;
    }
    if (typeof global._fightResetRoundLegacy === 'function') {
      global._fightResetRoundLegacy(world);
      return;
    }
    if (typeof global._fightResetRound === 'function') {
      global._fightResetRound(world);
    }
  }

  function phaseAdvance(world, events){
    if (!world) return false;
    var p = phases();
    world.phaseTimer++;

    if (world.phase === p.INTRO && world.phaseTimer >= 120) {
      setPhase(world, p.ROUND_ANNOUNCE, events);
      return true;
    }
    if (world.phase === p.ROUND_ANNOUNCE && world.phaseTimer >= 36) {
      setPhase(world, p.FIGHT_START, events);
      return true;
    }
    if (world.phase === p.FIGHT_START && world.phaseTimer >= 48) {
      setPhase(world, p.FIGHT, events);
      return true;
    }

    if (world.phase === p.KO && world.phaseTimer >= 150) {
      finalizeRound(world, events);
      if (world.winner === 'p1') world.score.p1++;
      else world.score.p2++;

      if (world.score.p1 >= 2) {
        ensureL15(world).lastMatchRecap = buildL15Summary(world, world.winner || 'p1', true);
        if (events) events.push({ type: 'matchRecap', summary: clone(world.l15Stats.lastMatchRecap), winner: world.winner || 'p1' });
        setPhase(world, p.WIN, events);
      } else if (world.score.p2 >= 2) {
        ensureL15(world).lastMatchRecap = buildL15Summary(world, world.winner || 'p2', true);
        if (events) events.push({ type: 'matchRecap', summary: clone(world.l15Stats.lastMatchRecap), winner: world.winner || 'p2' });
        setPhase(world, p.LOSE, events);
      } else {
        world.round++;
        resetRound(world);
        setPhase(world, p.ROUND_ANNOUNCE, events);
      }
      return true;
    }

    return false;
  }

  function classifyLifecycleDiffPath(path){
    var pth = String(path || '');
    if (!pth) return 'phase';
    if (pth.indexOf('phase') === 0 || pth.indexOf('phaseTimer') === 0) return 'phase';
    if (pth.indexOf('mkGba.timer') === 0 || pth.indexOf('mkGba.timerWarned') === 0 || pth.indexOf('rng') === 0) return 'timer-winner';
    if (pth.indexOf('score') === 0 || pth.indexOf('winner') === 0 || pth.indexOf('round') === 0) return 'score-flow';
    if (pth.indexOf('l15') === 0 || pth.indexOf('lastRoundRecap') >= 0 || pth.indexOf('lastMatchRecap') >= 0) return 'recap';
    if (pth.indexOf('mkGba.juggle') >= 0 || pth.indexOf('mkGba.comboDial') >= 0 || pth.indexOf('fighters.p1') >= 0 || pth.indexOf('fighters.p2') >= 0) return 'round-reset';
    return 'phase';
  }

  ns.core.world.lifecycle = {
    mkCalloutFrames: mkCalloutFrames,
    setCallout: setCallout,
    createL15Stats: createL15Stats,
    l15Bump: l15Bump,
    resetL15Round: resetL15Round,
    buildL15Summary: buildL15Summary,
    accumulateL15Round: accumulateL15Round,
    finalizeRound: finalizeRound,
    setPhase: setPhase,
    resolveTimerWinner: resolveTimerWinner,
    phaseAdvance: phaseAdvance,
    classifyLifecycleDiffPath: classifyLifecycleDiffPath
  };
})(typeof window !== 'undefined' ? window : this);
