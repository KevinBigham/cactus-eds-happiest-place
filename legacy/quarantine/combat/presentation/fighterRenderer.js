(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var fighterRenderer = ns.presentation.fighterRenderer = ns.presentation.fighterRenderer || {};

  function q(opts, col){
    if (opts && typeof opts.quantizeFn === 'function') return opts.quantizeFn(col);
    return col;
  }

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function segmentQuad(a, b, width){
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt((dx * dx) + (dy * dy)) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var half = Math.max(1, Number(width || 1) * 0.5);
    return [
      { x: a.x + (nx * half), y: a.y + (ny * half) },
      { x: b.x + (nx * half), y: b.y + (ny * half) },
      { x: b.x - (nx * half), y: b.y - (ny * half) },
      { x: a.x - (nx * half), y: a.y - (ny * half) }
    ];
  }

  function fillPoly(g, pts, col, alpha){
    g.fillStyle(col, alpha === undefined ? 1 : alpha);
    g.fillPoints(pts, true);
  }

  function strokePoly(g, pts, col, alpha){
    g.lineStyle(1, col, alpha === undefined ? 1 : alpha);
    g.strokePoints(pts, true);
  }

  function polyCenter(pts){
    var i;
    var x = 0;
    var y = 0;
    for (i = 0; i < pts.length; i++) {
      x += pts[i].x;
      y += pts[i].y;
    }
    return {
      x: x / Math.max(1, pts.length),
      y: y / Math.max(1, pts.length)
    };
  }

  function shrinkPoly(pts, amount){
    var center = polyCenter(pts);
    var out = [];
    var i, dx, dy, len;
    for (i = 0; i < pts.length; i++) {
      dx = pts[i].x - center.x;
      dy = pts[i].y - center.y;
      len = Math.sqrt((dx * dx) + (dy * dy)) || 1;
      out.push({
        x: pts[i].x - ((dx / len) * amount),
        y: pts[i].y - ((dy / len) * amount)
      });
    }
    return out;
  }

  function drawSegment(g, a, b, fill, outline, width){
    fillPoly(g, segmentQuad(a, b, width + 2), outline, 1);
    fillPoly(g, segmentQuad(a, b, width), fill, 1);
  }

  function attackHeat(cache, part){
    var focus = cache && cache.motion ? cache.motion.focusPart : '';
    var phase = cache && cache.motion && cache.motion.phase ? cache.motion.phase.phase : '';
    var base = 0;
    if (!focus || !phase || phase === 'idle') return 0;
    if (focus === 'frontHand' && part === 'frontArm') base = 1;
    else if (focus === 'frontFoot' && part === 'frontLeg') base = 1;
    else if (focus === 'bothHands' && (part === 'frontArm' || part === 'rearArm')) base = 0.95;
    else if (focus === 'torso' && part === 'torso') base = 1;
    if (!base) return 0;
    if (phase === 'startup') return 0.35 + ((cache.motion.phase.phaseT || 0) * 0.35);
    if (phase === 'active') return 0.78 + ((cache.motion.phase.phaseT || 0) * 0.22);
    return 0.22 + ((1 - (cache.motion.phase.phaseT || 0)) * 0.26);
  }

  function deriveColors(cache, opts){
    var pal = cache.visual.palette || {};
    var colors = {
      outline: q(opts, pal.outline || 0x050505),
      bodyDark: q(opts, pal.bodyDark || 0x444444),
      bodyMid: q(opts, pal.bodyMid || 0x888888),
      bodyLight: q(opts, pal.bodyLight || 0xd8d8d8),
      bone: q(opts, pal.bone || pal.bodyLight || 0xd8d8d8),
      clothDark: q(opts, pal.clothDark || pal.leafDark || pal.bodyDark || 0x555555),
      clothMid: q(opts, pal.clothMid || pal.leafMid || pal.bodyMid || 0x888888),
      clothLight: q(opts, pal.clothLight || pal.leafLight || pal.bodyLight || 0xd8d8d8),
      accent: q(opts, pal.accent || pal.bruiser || 0xffc95d),
      smoke: q(opts, pal.smoke || 0xd0d0d0),
      leafDark: q(opts, pal.leafDark || pal.clothDark || 0x547654),
      leafMid: q(opts, pal.leafMid || pal.clothMid || 0x8abe75),
      leafLight: q(opts, pal.leafLight || pal.bodyLight || 0xcfe0b8),
      root: q(opts, pal.root || pal.clothDark || 0x8a684a)
    };
    if ((cache.fighter.hitFlashFrames | 0) > 0 && (((cache.fighter.hitFlashFrames | 0) & 1) === 0)) {
      colors.bodyDark = q(opts, 0x8e8e8e);
      colors.bodyMid = q(opts, 0xe6e6e6);
      colors.bodyLight = q(opts, 0xffffff);
      colors.clothDark = q(opts, 0xc5c5c5);
      colors.clothMid = q(opts, 0xf2f2f2);
      colors.clothLight = q(opts, 0xffffff);
    } else if (cache.fighter.state === 'blockstun') {
      colors.accent = q(opts, 0x7ab6ff);
    } else if (cache.fighter.state === 'dizzy') {
      colors.accent = q(opts, 0xffd564);
    } else if (cache.fighter.state === 'wakeup') {
      colors.accent = q(opts, 0x9cd97a);
    }
    return colors;
  }

  function drawTorsoShell(g, rig, colors, cache, opts){
    var outer = rig.torsoPoints;
    var inner = shrinkPoly(outer, 1.35);
    var chest = shrinkPoly(inner, 2.5);
    var hipPanel = [
      { x: inner[3].x + (rig.facing * -1), y: inner[3].y - 2 },
      { x: inner[2].x + (rig.facing * 1), y: inner[2].y - 2 },
      { x: inner[2].x - 1, y: inner[2].y + 6 },
      { x: inner[3].x + 1, y: inner[3].y + 6 }
    ];
    fillPoly(g, outer, colors.outline, 1);
    fillPoly(g, inner, colors.bodyMid, 1);
    fillPoly(g, chest, colors.bodyLight, 0.9);
    fillPoly(g, hipPanel, colors.clothDark, 0.92);
    if (attackHeat(cache, 'torso') > 0.45) {
      g.lineStyle(1, colors.accent, 0.9);
      g.strokePoints(chest, true);
    }
    g.fillStyle(q(opts, 0xffffff), 0.12);
    g.fillEllipse(rig.torsoCenter.x - (rig.facing * 2), rig.torsoCenter.y - 4, 8, 4);
  }

  function drawStatusMarker(g, cache, opts){
    var fighter = cache.fighter;
    var state = String(fighter && fighter.state || 'idle');
    var col = 0;
    var width = 14;
    var x = Math.floor(cache.rig.head.x) - 7;
    var y = Math.floor(cache.rig.head.y) - 15;
    if (cache.motion && cache.motion.techPoseActive) col = 0x96dfff;
    else if (state === 'startup') col = 0xe8cf68;
    else if (state === 'active' || state === 'throw') col = 0xee6b55;
    else if (state === 'recovery') col = 0x6eb8ee;
    else if (state === 'blockstun') col = 0x7ab6ff;
    else if (state === 'hitstun') col = 0xff9a64;
    else if (state === 'wakeup') col = 0x9cd97a;
    else if (state === 'knockdown') col = 0xb8a78c;
    if (!col) return;
    col = q(opts, col);
    g.fillStyle(q(opts, 0x040404), 0.9);
    g.fillRect(x - 1, y - 1, width + 2, 6);
    g.fillStyle(col, 0.95);
    g.fillRect(x, y, width, 4);
    if (cache.motion && cache.fighter.moveId && cache.motion.phase && (state === 'startup' || state === 'active' || state === 'recovery')) {
      g.fillStyle(q(opts, 0xffffff), 0.55);
      g.fillRect(x + 1, y + 1, Math.max(2, Math.floor((width - 2) * clamp(cache.motion.phase.phaseT || 0, 0, 1))), 1);
    }
  }

  function drawHandsAndFeet(g, cache, colors){
    var sil = cache.visual.silhouette || {};
    var handHot = attackHeat(cache, 'frontArm');
    var rearHandHot = attackHeat(cache, 'rearArm');
    var footHot = attackHeat(cache, 'frontLeg');
    var frontHandR = Math.max(2, (sil.handR || 3) + (handHot > 0.45 ? 1 : 0));
    var rearHandR = Math.max(2, (sil.handR || 3) + (rearHandHot > 0.45 ? 1 : 0));
    var frontFootW = Math.max(5, (sil.footW || 7) + (footHot > 0.45 ? 2 : 0));
    var frontFootH = Math.max(3, sil.footH || 3);
    var rearFootW = Math.max(5, sil.footW || 7);
    var rearFootH = Math.max(3, sil.footH || 3);

    g.fillStyle(colors.outline, 1);
    g.fillCircle(cache.rig.frontHand.x, cache.rig.frontHand.y, frontHandR + 1);
    g.fillCircle(cache.rig.rearHand.x, cache.rig.rearHand.y, rearHandR + 1);
    g.fillStyle(handHot > 0.45 ? colors.accent : colors.bone, 1);
    g.fillCircle(cache.rig.frontHand.x, cache.rig.frontHand.y, frontHandR);
    g.fillStyle(rearHandHot > 0.45 ? colors.accent : colors.bodyLight, 1);
    g.fillCircle(cache.rig.rearHand.x, cache.rig.rearHand.y, rearHandR);

    g.fillStyle(colors.outline, 1);
    g.fillEllipse(cache.rig.frontFoot.x, cache.rig.frontFoot.y, frontFootW + 2, frontFootH + 2);
    g.fillEllipse(cache.rig.rearFoot.x, cache.rig.rearFoot.y, rearFootW + 2, rearFootH + 2);
    g.fillStyle(footHot > 0.45 ? colors.accent : colors.bodyMid, 1);
    g.fillEllipse(cache.rig.frontFoot.x, cache.rig.frontFoot.y, frontFootW, frontFootH);
    g.fillStyle(colors.bodyDark, 1);
    g.fillEllipse(cache.rig.rearFoot.x, cache.rig.rearFoot.y, rearFootW, rearFootH);
  }

  function drawContactRim(g, cache, opts){
    var contact = cache && cache.motion ? cache.motion.contact : null;
    var role = contact ? String(contact.role || '') : '';
    var alpha;
    var col;
    if (!contact || (contact.intensity || 0) < 0.16 || !cache.rig) return;
    alpha = clamp(0.16 + (contact.intensity * 0.30), 0.16, 0.46);
    col = cache.visual && cache.visual.palette ? (cache.visual.palette.accent || 0xffcf7a) : 0xffcf7a;
    if (role === 'block') col = 0x7ab6ff;
    else if (role === 'hit') col = 0xff9a64;
    else if (role === 'tech') col = 0x96dfff;
    else if (role === 'wakeup') col = 0x9cd97a;
    else if (role === 'throw') col = 0xffd887;
    col = q(opts, col);
    strokePoly(g, cache.rig.torsoPoints, col, alpha);
    g.lineStyle(1, col, alpha * 0.92);
    g.strokeCircle(cache.rig.head.x, cache.rig.head.y, cache.rig.headR + 2);
    if (role === 'block' || role === 'hit' || role === 'tech') {
      g.lineStyle(1, q(opts, 0x050505), 0.18 + (contact.intensity * 0.14));
      g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y, cache.rig.rearHip.x, cache.rig.rearHip.y);
      g.lineBetween(cache.rig.rearShoulder.x, cache.rig.rearShoulder.y, cache.rig.frontHip.x, cache.rig.frontHip.y);
      if (contact.intensity > 0.4 && (role === 'block' || role === 'hit')) {
        g.lineStyle(1, col, alpha * 0.5);
        g.lineBetween(cache.rig.rearHip.x, cache.rig.rearHip.y, cache.rig.rearKnee.x, cache.rig.rearKnee.y);
      }
    } else if (role === 'attacker' || role === 'throw') {
      g.lineStyle(1, col, alpha * 0.65);
      g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y, cache.rig.frontHip.x, cache.rig.frontHip.y);
    }
  }

  function drawReactionRead(g, cache, colors, opts){
    var contact = cache && cache.motion ? cache.motion.contact : null;
    var stateKey = cache && cache.motion ? String(cache.motion.stateKey || '') : '';
    var role = contact ? String(contact.role || '') : '';
    var intensity = clamp(contact && contact.intensity || 0, 0, 1);
    var accent = colors.accent;
    if (!cache || !cache.rig) return;
    if (stateKey === 'block') {
      fillPoly(g, [
        { x: cache.rig.frontShoulder.x + (cache.rig.facing * 1), y: cache.rig.frontShoulder.y - 4 },
        { x: cache.rig.frontHand.x + (cache.rig.facing * 3), y: cache.rig.frontHand.y - 2 },
        { x: cache.rig.frontHand.x + (cache.rig.facing * -1), y: cache.rig.frontHand.y + 7 },
        { x: cache.rig.torsoCenter.x + (cache.rig.facing * 2), y: cache.rig.torsoCenter.y + 5 }
      ], q(opts, 0x0d1622), 0.28 + (intensity * 0.10));
      fillPoly(g, [
        { x: cache.rig.frontShoulder.x + (cache.rig.facing * 2), y: cache.rig.frontShoulder.y - 2 },
        { x: cache.rig.frontHand.x + (cache.rig.facing * 2), y: cache.rig.frontHand.y - 1 },
        { x: cache.rig.frontHand.x + (cache.rig.facing * -2), y: cache.rig.frontHand.y + 6 },
        { x: cache.rig.torsoCenter.x + (cache.rig.facing * 4), y: cache.rig.torsoCenter.y + 2 }
      ], q(opts, 0x7ab6ff), 0.18 + (intensity * 0.10));
      g.lineStyle(1, q(opts, 0x7ab6ff), 0.46 + (intensity * 0.14));
      g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y, cache.rig.frontHand.x, cache.rig.frontHand.y);
      g.lineBetween(cache.rig.frontHand.x, cache.rig.frontHand.y, cache.rig.torsoCenter.x + (cache.rig.facing * 3), cache.rig.torsoCenter.y + 2);
      if (intensity > 0.35) {
        g.lineStyle(1, q(opts, 0x7ab6ff), 0.22 + (intensity * 0.08));
        g.lineBetween(cache.rig.rearShoulder.x, cache.rig.rearShoulder.y, cache.rig.rearHand.x, cache.rig.rearHand.y);
      }
    } else if (stateKey === 'hit') {
      fillPoly(g, [
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 6), y: cache.rig.torsoCenter.y - 8 },
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 14), y: cache.rig.torsoCenter.y - 1 },
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 8), y: cache.rig.torsoCenter.y + 10 },
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 1), y: cache.rig.torsoCenter.y + 5 }
      ], q(opts, 0x1a0d08), 0.24);
      fillPoly(g, [
        { x: cache.rig.head.x - (cache.rig.facing * 2), y: cache.rig.head.y + 2 },
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 9), y: cache.rig.torsoCenter.y - 5 },
        { x: cache.rig.torsoCenter.x - (cache.rig.facing * 6), y: cache.rig.torsoCenter.y + 7 },
        { x: cache.rig.head.x - (cache.rig.facing * 6), y: cache.rig.head.y + 7 }
      ], q(opts, 0x3d180a), 0.20 + (intensity * 0.10));
      g.lineStyle(1, q(opts, 0xff9a64), 0.44 + (intensity * 0.14));
      g.lineBetween(cache.rig.head.x - (cache.rig.facing * 4), cache.rig.head.y + 1, cache.rig.torsoCenter.x - (cache.rig.facing * 8), cache.rig.torsoCenter.y - 3);
      g.lineBetween(cache.rig.torsoCenter.x - (cache.rig.facing * 4), cache.rig.torsoCenter.y + 2, cache.rig.rearHip.x, cache.rig.rearHip.y + 1);
      if (intensity > 0.35) {
        g.lineStyle(1, q(opts, 0xff9a64), 0.2 + (intensity * 0.08));
        g.lineBetween(cache.rig.rearHip.x, cache.rig.rearHip.y, cache.rig.rearShoulder.x, cache.rig.rearShoulder.y);
      }
    } else if (role === 'tech') {
      g.lineStyle(1, q(opts, 0x96dfff), 0.48 + (intensity * 0.1));
      g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y, cache.rig.rearHand.x, cache.rig.rearHand.y);
      g.lineBetween(cache.rig.rearShoulder.x, cache.rig.rearShoulder.y, cache.rig.frontHand.x, cache.rig.frontHand.y);
      g.lineBetween(cache.rig.head.x - (cache.rig.facing * 4), cache.rig.head.y + 1, cache.rig.head.x + (cache.rig.facing * 4), cache.rig.head.y - 2);
    } else if (role === 'attacker' || role === 'throw') {
      fillPoly(g, [
        { x: cache.rig.frontShoulder.x + (cache.rig.facing * 1), y: cache.rig.frontShoulder.y - 2 },
        { x: cache.rig.torsoCenter.x + (cache.rig.facing * 8), y: cache.rig.torsoCenter.y - 4 },
        { x: cache.rig.frontHip.x + (cache.rig.facing * 4), y: cache.rig.frontHip.y + 1 },
        { x: cache.rig.torsoCenter.x + (cache.rig.facing * 2), y: cache.rig.torsoCenter.y + 5 }
      ], accent, 0.1 + (intensity * 0.08));
      g.lineStyle(1, accent, 0.28 + (intensity * 0.18));
      g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y, cache.rig.torsoCenter.x + (cache.rig.facing * 7), cache.rig.torsoCenter.y - 2);
      g.lineBetween(cache.rig.frontHip.x, cache.rig.frontHip.y, cache.rig.torsoCenter.x + (cache.rig.facing * 6), cache.rig.torsoCenter.y + 5);
    } else if (stateKey === 'wakeup') {
      g.lineStyle(1, q(opts, 0x9cd97a), 0.44 + (intensity * 0.08));
      g.lineBetween(cache.rig.torsoCenter.x, cache.rig.torsoCenter.y + 8, cache.rig.head.x, cache.rig.head.y + 4);
    } else if (stateKey === 'knockdown') {
      g.lineStyle(1, q(opts, 0xc7b496), 0.36 + (intensity * 0.08));
      g.lineBetween(cache.rig.rearHip.x, cache.rig.rearHip.y + 2, cache.rig.frontShoulder.x, cache.rig.frontShoulder.y + 3);
    }
  }

  function renderEdDetails(g, cache, colors){
    var rig = cache.rig;
    var facing = rig.facing;
    var hipDrop = attackHeat(cache, 'torso') > 0.4 ? 4 : 2;
    var cigX = rig.head.x + (facing * 6);
    var cigY = rig.head.y + 2;
    fillPoly(g, [
      { x: rig.frontShoulder.x + (facing * 2), y: rig.frontShoulder.y - 5 },
      { x: rig.frontShoulder.x + (facing * 8), y: rig.frontShoulder.y - 1 },
      { x: rig.frontShoulder.x + (facing * 3), y: rig.frontShoulder.y + 6 }
    ], colors.clothLight, 0.96);
    fillPoly(g, [
      { x: rig.rearShoulder.x + (facing * -1), y: rig.rearShoulder.y - 4 },
      { x: rig.rearShoulder.x + (facing * -7), y: rig.rearShoulder.y + 1 },
      { x: rig.rearShoulder.x + (facing * -2), y: rig.rearShoulder.y + 5 }
    ], colors.bodyLight, 0.9);
    fillPoly(g, [
      { x: rig.torsoCenter.x + (facing * -3), y: rig.torsoCenter.y + 7 },
      { x: rig.torsoCenter.x + (facing * -12), y: rig.torsoCenter.y + 14 + hipDrop },
      { x: rig.torsoCenter.x + (facing * -2), y: rig.torsoCenter.y + 14 }
    ], colors.clothDark, 0.95);
    g.lineStyle(1, colors.bone, 0.88);
    g.lineBetween(cigX, cigY, cigX + (facing * 5), cigY + 1);
    g.fillStyle(colors.accent, 1);
    g.fillRect(cigX + (facing * 5) - 1, cigY, 2, 2);
    g.fillStyle(colors.smoke, 0.55 + (Math.sin((cache.motion.frame || 0) * 0.12) * 0.08));
    g.fillCircle(cigX + (facing * 8), cigY - 2, 2);
  }

  function renderDaikonDetails(g, cache, colors){
    var rig = cache.rig;
    var facing = rig.facing;
    fillPoly(g, [
      { x: rig.head.x, y: rig.head.y - 12 },
      { x: rig.head.x + (facing * 8), y: rig.head.y - 4 },
      { x: rig.head.x + (facing * 2), y: rig.head.y }
    ], colors.leafMid, 0.95);
    fillPoly(g, [
      { x: rig.head.x, y: rig.head.y - 12 },
      { x: rig.head.x + (facing * -8), y: rig.head.y - 4 },
      { x: rig.head.x + (facing * -2), y: rig.head.y }
    ], colors.leafLight, 0.95);
    fillPoly(g, [
      { x: rig.head.x - 3, y: rig.head.y + 6 },
      { x: rig.head.x + 4, y: rig.head.y + 6 },
      { x: rig.head.x, y: rig.head.y + 14 }
    ], colors.root, 0.96);
    fillPoly(g, [
      { x: rig.rearShoulder.x + (facing * -2), y: rig.rearShoulder.y - 4 },
      { x: rig.rearShoulder.x + (facing * -11), y: rig.rearShoulder.y + 2 },
      { x: rig.rearShoulder.x + (facing * -3), y: rig.rearShoulder.y + 8 }
    ], colors.leafDark, 0.9);
    fillPoly(g, [
      { x: rig.frontHip.x + (facing * 2), y: rig.frontHip.y + 1 },
      { x: rig.rearHip.x + (facing * -2), y: rig.rearHip.y + 1 },
      { x: rig.rearHip.x + (facing * -7), y: rig.rearHip.y + 9 },
      { x: rig.frontHip.x + (facing * 7), y: rig.frontHip.y + 9 }
    ], colors.root, 0.82);
  }

  fighterRenderer.renderFighter = function(scene, fighter, opts){
    var anim = ns.presentation && ns.presentation.animPlayer;
    var rigBuilder = ns.presentation && ns.presentation.fighterRig;
    var motion;
    var rig;
    var cache;
    var colors;
    var sil;
    var frontArmHot;
    var rearArmHot;
    var frontLegHot;
    var rearLegHot;
    var g = opts && opts.graphics;
    if (!anim || !rigBuilder || typeof anim.resolve !== 'function' || typeof rigBuilder.build !== 'function' || !fighter || !g) return null;
    motion = anim.resolve(scene, fighter);
    if (!motion || !motion.visual) return null;
    rig = rigBuilder.build(motion, opts || {});
    cache = {
      fighter: fighter,
      motion: motion,
      rig: rig,
      visual: motion.visual
    };
    colors = deriveColors(cache, opts || {});
    sil = motion.visual.silhouette || {};
    frontArmHot = attackHeat(cache, 'frontArm');
    rearArmHot = attackHeat(cache, 'rearArm');
    frontLegHot = attackHeat(cache, 'frontLeg');
    rearLegHot = attackHeat(cache, 'rearLeg');

    scene._fightPresentationCache = scene._fightPresentationCache || {};
    scene._fightPresentationCache[fighter.id] = cache;

    g.fillStyle(q(opts, 0x050607), 0.4);
    g.fillEllipse(rig.shadow.x, rig.shadow.y, Math.max(12, rig.shadow.w), Math.max(3, rig.shadow.h));

    drawSegment(g, rig.rearHip, rig.rearKnee, colors.clothDark, colors.outline, (sil.thighWidth || 4) + (rearLegHot * 0.8));
    drawSegment(g, rig.rearKnee, rig.rearFoot, colors.bodyDark, colors.outline, (sil.shinWidth || 4) + (rearLegHot * 0.8));
    drawSegment(g, rig.rearShoulder, rig.rearElbow, colors.clothDark, colors.outline, (sil.armWidth || 4) + (rearArmHot * 0.8));
    drawSegment(g, rig.rearElbow, rig.rearHand, rearArmHot > 0.45 ? colors.accent : colors.bodyMid, colors.outline, (sil.forearmWidth || 4) + (rearArmHot * 1.1));

    drawTorsoShell(g, rig, colors, cache, opts || {});
    drawContactRim(g, cache, opts || {});
    drawReactionRead(g, cache, colors, opts || {});

    if (motion.visual.id === 'ed') renderEdDetails(g, cache, colors);
    else if (motion.visual.id === 'daikon') renderDaikonDetails(g, cache, colors);

    g.fillStyle(colors.outline, 1);
    g.fillCircle(rig.head.x, rig.head.y, rig.headR + 1);
    g.fillStyle(colors.bodyLight, 1);
    g.fillCircle(rig.head.x, rig.head.y, rig.headR);
    g.fillStyle(colors.outline, 0.95);
    g.fillRect(Math.floor(rig.head.x + (rig.facing * 1)), Math.floor(rig.head.y) - 1, 2, 2);
    g.fillStyle(colors.bodyDark, 0.7);
    g.fillRect(Math.floor(rig.head.x - (rig.facing * 1)), Math.floor(rig.head.y + 3), 3, 1);

    drawSegment(g, rig.frontHip, rig.frontKnee, frontLegHot > 0.45 ? colors.accent : colors.clothMid, colors.outline, (sil.thighWidth || 5) + (frontLegHot * 1.2));
    drawSegment(g, rig.frontKnee, rig.frontFoot, frontLegHot > 0.35 ? colors.bodyLight : colors.bodyMid, colors.outline, (sil.shinWidth || 4) + (frontLegHot * 1.2));
    drawSegment(g, rig.frontShoulder, rig.frontElbow, frontArmHot > 0.45 ? colors.accent : colors.clothMid, colors.outline, (sil.armWidth || 4) + (frontArmHot * 1.2));
    drawSegment(g, rig.frontElbow, rig.frontHand, frontArmHot > 0.35 ? colors.bodyLight : colors.bone, colors.outline, (sil.forearmWidth || 4) + (frontArmHot * 1.35));

    drawHandsAndFeet(g, cache, colors);
    drawStatusMarker(g, cache, opts || {});
    return cache;
  };
})(typeof window !== 'undefined' ? window : this);
