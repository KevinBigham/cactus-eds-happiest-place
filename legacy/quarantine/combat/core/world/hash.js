(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function stableStringify(obj){
    if (obj === null || obj === undefined) return 'null';
    var t = typeof obj;
    if (t === 'number' || t === 'boolean') return String(obj);
    if (t === 'string') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      var ai = [];
      var i;
      for (i = 0; i < obj.length; i++) ai.push(stableStringify(obj[i]));
      return '[' + ai.join(',') + ']';
    }
    if (t !== 'object') return JSON.stringify(obj);
    var keys = [];
    var k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) keys.push(k);
    }
    keys.sort();
    var parts = [];
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      parts.push(JSON.stringify(k) + ':' + stableStringify(obj[k]));
    }
    return '{' + parts.join(',') + '}';
  }

  function fnv1a32(str) {
    var h = 0x811c9dc5;
    var i;
    for (i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  function digestHistory(history, maxTail){
    var arr = history || [];
    var max = Math.max(0, Math.floor(maxTail || 0));
    if (!max) return { n: arr.length | 0, tail: [] };
    var start = Math.max(0, arr.length - max);
    var out = [];
    var i;
    for (i = start; i < arr.length; i++) {
      var it = arr[i] || {};
      out.push({
        f: (it.frame | 0),
        d: (it.dir | 0),
        b: (it.buttons | 0)
      });
    }
    return { n: arr.length | 0, tail: out };
  }

  function digestParserDecision(parser){
    var p = parser || {};
    return {
      motionType: String(p.motionType || 'none'),
      moveId: String(p.moveId || ''),
      rejected: Array.isArray(p.rejected) ? p.rejected.slice(0) : []
    };
  }

  function digestFighter(f){
    f = f || {};
    return {
      id: String(f.id || ''),
      x: f.x | 0,
      y: f.y | 0,
      vx: f.vx | 0,
      vy: f.vy | 0,
      facing: (f.facing === -1 ? -1 : 1),
      state: String(f.state || ''),
      stateFrame: f.stateFrame | 0,
      moveId: f.moveId || '',
      moveFrame: f.moveFrame | 0,
      moveHitRegistered: !!f.moveHitRegistered,
      hp: f.health | 0,
      maxHp: f.maxHealth | 0,
      stun: f.stunMeter | 0,
      dizzy: f.dizzyFramesLeft | 0,
      hs: f.hitstunFramesLeft | 0,
      bs: f.blockstunFramesLeft | 0,
      kd: f.knockdownFramesLeft | 0,
      throwTech: f.throwTechFramesLeft | 0,
      throwInvul: f.wakeupThrowInvulFramesLeft | 0,
      invuln: f.invulnFramesLeft | 0,
      hitFlash: f.hitFlashFrames | 0,
      grounded: (f.grounded === undefined) ? true : !!f.grounded,
      lastMoveContact: String(f.lastMoveContact || 'none'),
      prevDir: f.prevDir | 0,
      prevButtons: f.prevButtons | 0,
      charge: {
        back: f.charge && f.charge.back ? (f.charge.back | 0) : 0,
        down: f.charge && f.charge.down ? (f.charge.down | 0) : 0,
        backReady: f.charge && f.charge.backReady ? (f.charge.backReady | 0) : 0,
        downReady: f.charge && f.charge.downReady ? (f.charge.downReady | 0) : 0
      },
      parser: digestParserDecision(f.lastParserDecision),
      inputHistory: digestHistory(f.inputHistory, 10),
      inputEdgeHistory: digestHistory(f.inputEdgeHistory, 10)
    };
  }

  function digestMk(world){
    var mk = world && world.mkGba ? world.mkGba : {};
    return {
      enabled: !!mk.enabled,
      timer: mk.roundTimerFrames | 0,
      timerWarned: {
        s15: !!(mk.timerWarned && mk.timerWarned.s15),
        s10: !!(mk.timerWarned && mk.timerWarned.s10),
        s5: !!(mk.timerWarned && mk.timerWarned.s5)
      },
      callout: mk.callout ? String(mk.callout.text || '') : '',
      calloutFrames: mk.callout ? (mk.callout.framesLeft | 0) : 0,
      heavyFlash: mk.vfx ? (mk.vfx.heavyFlashFrames | 0) : 0,
      invert: mk.vfx ? (mk.vfx.koInvertFrames | 0) : 0,
      dial: {
        p1: mk.comboDial && mk.comboDial.p1 ? {
          chainId: String(mk.comboDial.p1.chainId || ''),
          step: mk.comboDial.p1.step | 0,
          window: mk.comboDial.p1.window | 0
        } : { chainId: '', step: 0, window: 0 },
        p2: mk.comboDial && mk.comboDial.p2 ? {
          chainId: String(mk.comboDial.p2.chainId || ''),
          step: mk.comboDial.p2.step | 0,
          window: mk.comboDial.p2.window | 0
        } : { chainId: '', step: 0, window: 0 }
      },
      juggle: {
        p1: mk.juggle ? (mk.juggle.p1AirHitsTaken | 0) : 0,
        p2: mk.juggle ? (mk.juggle.p2AirHitsTaken | 0) : 0
      }
    };
  }

  function stateDigest(world) {
    if (!world) {
      return {
        frame: 0, phase: '', phaseTimer: 0, round: 0, winner: '',
        score: { p1: 0, p2: 0 },
        rng: { seed: 0, cursor: 0, enabled: false },
        aiProfile: '',
        stage: { left: 0, right: 0, floor: 0, cornerPush: false },
        interaction: { hitstop: 0, lastExchange: null },
        p1: digestFighter(null),
        p2: digestFighter(null),
        mkGba: digestMk(null),
        sf: { enabled: false, parserMode: '' },
        l15: {}
      };
    }

    return {
      frame: world.frame | 0,
      phase: String(world.phase || ''),
      phaseTimer: world.phaseTimer | 0,
      round: world.round | 0,
      winner: String(world.winner || ''),
      score: {
        p1: world.score ? (world.score.p1 | 0) : 0,
        p2: world.score ? (world.score.p2 | 0) : 0
      },
      rng: {
        seed: world.rng ? (world.rng.seed | 0) : 0,
        cursor: world.rng ? (world.rng.cursor | 0) : 0,
        enabled: !!(world.rng && world.rng.enabled)
      },
      aiProfile: String(world.aiProfile || ''),
      stage: {
        left: world.stage ? (world.stage.left | 0) : 0,
        right: world.stage ? (world.stage.right | 0) : 0,
        floor: world.stage ? (world.stage.floor | 0) : 0,
        cornerPush: !!(world.stage && world.stage.cornerPush)
      },
      interaction: {
        hitstop: world.interaction ? (world.interaction.hitstop | 0) : 0,
        lastExchange: world.interaction && world.interaction.lastExchange ? world.interaction.lastExchange : null
      },
      p1: digestFighter(world.fighters && world.fighters.p1),
      p2: digestFighter(world.fighters && world.fighters.p2),
      mkGba: digestMk(world),
      sf: {
        enabled: !!(world.sf && world.sf.enabled),
        parserMode: world.sf ? String(world.sf.parserMode || '') : ''
      },
      l15: {
        matchMaxCombo: {
          p1: world.l15Stats && world.l15Stats.match && world.l15Stats.match.maxCombo ? (world.l15Stats.match.maxCombo.p1 | 0) : 0,
          p2: world.l15Stats && world.l15Stats.match && world.l15Stats.match.maxCombo ? (world.l15Stats.match.maxCombo.p2 | 0) : 0
        },
        roundCombo: {
          p1: world.l15Stats && world.l15Stats.round && world.l15Stats.round.currentCombo ? (world.l15Stats.round.currentCombo.p1 | 0) : 0,
          p2: world.l15Stats && world.l15Stats.round && world.l15Stats.round.currentCombo ? (world.l15Stats.round.currentCombo.p2 | 0) : 0
        },
        dizzyWarned: {
          p1: !!(world.l15Stats && world.l15Stats.flags && world.l15Stats.flags.dizzyWarned && world.l15Stats.flags.dizzyWarned.p1),
          p2: !!(world.l15Stats && world.l15Stats.flags && world.l15Stats.flags.dizzyWarned && world.l15Stats.flags.dizzyWarned.p2)
        }
      }
    };
  }

  function firstDiff(a, b, path){
    var p = path || '';
    if (a === b) return null;
    var ta = typeof a;
    var tb = typeof b;
    if (ta !== tb) return { path: p || '(root)', a: a, b: b };
    if (a === null || b === null) return { path: p || '(root)', a: a, b: b };

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b)) return { path: p || '(root)', a: a, b: b };
      if (a.length !== b.length) return { path: (p ? p + '.length' : 'length'), a: a.length, b: b.length };
      var i;
      for (i = 0; i < a.length; i++) {
        var d = firstDiff(a[i], b[i], p + '[' + i + ']');
        if (d) return d;
      }
      return null;
    }

    if (ta === 'object') {
      var ka = [];
      var kb = [];
      var k;
      for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) ka.push(k);
      for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) kb.push(k);
      ka.sort();
      kb.sort();
      var sa = ka.join('|');
      var sb = kb.join('|');
      if (sa !== sb) return { path: (p ? p + '.__keys' : '__keys'), a: ka, b: kb };
      for (var j = 0; j < ka.length; j++) {
        k = ka[j];
        var childPath = p ? (p + '.' + k) : k;
        var dd = firstDiff(a[k], b[k], childPath);
        if (dd) return dd;
      }
      return null;
    }

    return { path: p || '(root)', a: a, b: b };
  }

  function diffDigest(a, b) {
    return firstDiff(a, b, '');
  }

  function stateHash(world) {
    var s = stableStringify(stateDigest(world));
    return ('00000000' + fnv1a32(s).toString(16)).slice(-8);
  }

  function classifyDiffPath(path){
    var p = String(path || '');
    if (
      p.indexOf('inputHistory') >= 0 ||
      p.indexOf('inputEdgeHistory') >= 0 ||
      p.indexOf('prevDir') >= 0 ||
      p.indexOf('prevButtons') >= 0 ||
      p.indexOf('charge') >= 0 ||
      p.indexOf('parser') >= 0
    ) {
      return 'input-stack';
    }
    if (
      p.indexOf('rng') >= 0 ||
      p.indexOf('frame') === 0 ||
      p.indexOf('phase') === 0 ||
      p.indexOf('round') === 0 ||
      p.indexOf('score') === 0 ||
      p.indexOf('mkGba.timerWarned') >= 0
    ) {
      return 'world-hash-snapshot';
    }
    return 'resolution-or-phase';
  }

  ns.core.world.hash = {
    stableStringify: stableStringify,
    fnv1a32: fnv1a32,
    stateHash: stateHash,
    stateDigest: stateDigest,
    diffDigest: diffDigest,
    classifyDiffPath: classifyDiffPath
  };
})(typeof window !== 'undefined' ? window : this);
