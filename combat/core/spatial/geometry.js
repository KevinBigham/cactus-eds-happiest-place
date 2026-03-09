(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.spatial = ns.core.spatial || {};

  function constants(){
    return (ns.core && ns.core.constants) || null;
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

  function abs(v){
    if (typeof global._fightAbs === 'function') return global._fightAbs(v);
    return v < 0 ? -v : v;
  }

  function clone(v){
    var c = constants();
    if (c && typeof c.clone === 'function') return c.clone(v);
    if (typeof global._fightClone === 'function') return global._fightClone(v);
    if (v === null || v === undefined) return v;
    return JSON.parse(JSON.stringify(v));
  }

  function emptyArr(v){
    if (typeof global._fightEmptyArr === 'function') return !!global._fightEmptyArr(v);
    return !v || !v.length;
  }

  function dirIsDown(d){
    if (typeof global._fightDirIsDown === 'function') return !!global._fightDirIsDown(d);
    return d === 1 || d === 2 || d === 3;
  }

  function sfModeOn(){
    if (typeof global._fightSfModeOn === 'function') return !!global._fightSfModeOn();
    return !!(global.FEATURE_FLAGS && global.FEATURE_FLAGS.sfCombatMode);
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

  function boxesToAbs(f, rels){
    var absList = [];
    var i, b, x1, y1, w, h;
    var src = rels || [];
    for (i = 0; i < src.length; i++) {
      b = src[i];
      w = fromPx(b.w);
      h = fromPx(b.h);
      if (f.facing === 1) {
        x1 = f.x + fromPx(b.x);
      } else {
        x1 = f.x - fromPx(b.x + b.w);
      }
      y1 = f.y + fromPx(b.y);
      absList.push({ x1: x1, y1: y1, x2: x1 + w, y2: y1 + h });
    }
    return absList;
  }

  function getMoveFrameData(move, frame){
    if (!move) return null;
    if (sfModeOn() && move.frameBoxesSf && move.frameBoxesSf[frame]) return move.frameBoxesSf[frame];
    if (!move.frameBoxes) return null;
    return move.frameBoxes[frame] || null;
  }

  function refreshBoxes(world, f, input){
    var st = states();
    var roster = global.FIGHT_ROSTER && global.FIGHT_ROSTER[f.rosterKey];
    var base = roster.baseBoxes.stand;
    var move = rosterMoveById(f.rosterKey, f.moveId);
    var fd = null;
    var hurt, push, hit = [];
    var invuln = false;
    var in0 = input || { dir: 5, buttons: 0 };

    if (!f.grounded) base = roster.baseBoxes.jump;
    else if (dirIsDown(in0.dir) || f.state === st.CROUCH) base = roster.baseBoxes.crouch;

    hurt = clone(base.hurt);
    push = clone(base.push);

    if (move) {
      fd = getMoveFrameData(move, f.moveFrame);
      if (fd) {
        if (fd.hurt) hurt = clone(fd.hurt);
        if (fd.push) push = clone(fd.push);
        if (fd.hit) hit = clone(fd.hit);
        if (fd.invuln) invuln = true;
      }
      if (move.invuln && move.invuln.length === 2) {
        if (f.moveFrame >= move.invuln[0] && f.moveFrame <= move.invuln[1]) invuln = true;
      }
    }
    if (invuln || f.invulnFramesLeft > 0) hurt = [];

    f.boxes = f.boxes || { hurt: [], hit: [], push: [] };
    f.boxes.hurt = boxesToAbs(f, hurt);
    f.boxes.push = boxesToAbs(f, push);
    f.boxes.hit = boxesToAbs(f, hit);
  }

  function overlap(a, b){
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  }

  function resolvePush(world){
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    var a, b, ox, push, relV, maxPush;
    if (emptyArr(p1.boxes.push) || emptyArr(p2.boxes.push)) return;
    a = p1.boxes.push[0];
    b = p2.boxes.push[0];
    if (!overlap(a, b)) return;
    ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    if (ox <= 0) return;
    push = Math.floor(ox / 2);
    if (world && world.sf && world.sf.enabled) {
      relV = abs((p1.vx || 0) - (p2.vx || 0));
      maxPush = Math.max(fromPx(2.5), relV + fromPx(0.5));
      push = Math.min(push, maxPush);
    }
    if (p1.x <= p2.x) { p1.x -= push; p2.x += push; }
    else { p1.x += push; p2.x -= push; }
    p1.x = clamp(p1.x, world.stage.left, world.stage.right);
    p2.x = clamp(p2.x, world.stage.left, world.stage.right);
  }

  function resolveFacing(world){
    var p1 = world.fighters.p1;
    var p2 = world.fighters.p2;
    if (p1.x < p2.x) { p1.facing = 1; p2.facing = -1; }
    else if (p1.x > p2.x) { p1.facing = -1; p2.facing = 1; }
  }

  function digestBoxList(list, maxLen){
    var src = list || [];
    var max = (maxLen === undefined || maxLen === null) ? 12 : Math.max(0, maxLen | 0);
    var lim = Math.min(src.length, max);
    var out = [];
    var i, b;
    for (i = 0; i < lim; i++) {
      b = src[i] || {};
      out.push({ x1: b.x1 | 0, y1: b.y1 | 0, x2: b.x2 | 0, y2: b.y2 | 0 });
    }
    return { n: src.length | 0, d: out };
  }

  function digestFighterBoxes(f){
    var fighter = f || {};
    var boxes = fighter.boxes || {};
    return {
      moveId: String(fighter.moveId || ''),
      moveFrame: fighter.moveFrame | 0,
      facing: (fighter.facing === -1 ? -1 : 1),
      hurt: digestBoxList(boxes.hurt, 12),
      push: digestBoxList(boxes.push, 12),
      hit: digestBoxList(boxes.hit, 12)
    };
  }

  ns.core.spatial.geometry = {
    resolveFacing: resolveFacing,
    getMoveFrameData: getMoveFrameData,
    boxesToAbs: boxesToAbs,
    refreshBoxes: refreshBoxes,
    overlap: overlap,
    resolvePush: resolvePush,
    digestBoxList: digestBoxList,
    digestFighterBoxes: digestFighterBoxes
  };
})(typeof window !== 'undefined' ? window : this);
