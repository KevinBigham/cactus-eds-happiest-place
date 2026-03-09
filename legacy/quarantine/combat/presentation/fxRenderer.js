(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var fxRenderer = ns.presentation.fxRenderer = ns.presentation.fxRenderer || {};

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function ensureSceneState(scene){
    if (!scene) {
      return {
        lastFrame: -1,
        techPoseFrames: { p1: 0, p2: 0 },
        pulses: []
      };
    }
    scene._fightPresentationFxState = scene._fightPresentationFxState || {
      lastFrame: -1,
      techPoseFrames: { p1: 0, p2: 0 },
      pulses: []
    };
    return scene._fightPresentationFxState;
  }

  function quantize(opts, col){
    if (opts && typeof opts.quantizeFn === 'function') return opts.quantizeFn(col);
    return col;
  }

  function toLocalWorld(cache, local){
    if (!cache || !cache.rig || !local) return { x: 0, y: 0 };
    return cache.rig.localToWorld(local);
  }

  function eventToVirtual(scene, xPx, yPx){
    var wx = typeof global._fightFromPx === 'function' ? global._fightFromPx(xPx || 0) : Number(xPx || 0);
    var wy = typeof global._fightFromPx === 'function' ? global._fightFromPx(yPx || 0) : Number(yPx || 0);
    if (scene && typeof scene._l15MkWorldToVirtualX === 'function' && typeof scene._l15MkWorldToVirtualY === 'function') {
      return {
        x: scene._l15MkWorldToVirtualX(wx),
        y: scene._l15MkWorldToVirtualY(wy)
      };
    }
    return { x: Number(xPx || 0), y: Number(yPx || 0) };
  }

  function drawRibbon(g, a, b, widthA, widthB, col, alpha){
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt((dx * dx) + (dy * dy)) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    g.fillStyle(col, alpha === undefined ? 0.88 : alpha);
    g.fillPoints([
      { x: a.x + (nx * widthA), y: a.y + (ny * widthA) },
      { x: b.x + (nx * widthB), y: b.y + (ny * widthB) },
      { x: b.x - (nx * widthB), y: b.y - (ny * widthB) },
      { x: a.x - (nx * widthA), y: a.y - (ny * widthA) }
    ], true);
  }

  function drawSlash(g, a, b, col, alpha){
    g.lineStyle(2, col, alpha === undefined ? 0.95 : alpha);
    g.lineBetween(a.x, a.y, b.x, b.y);
    g.lineStyle(1, col, (alpha === undefined ? 0.65 : alpha * 0.7));
    g.lineBetween(a.x, a.y - 2, b.x, b.y - 2);
  }

  function drawKickArc(g, foot, knee, col, alpha){
    g.lineStyle(2, col, alpha === undefined ? 0.92 : alpha);
    g.beginPath();
    g.moveTo(knee.x, knee.y);
    g.lineTo((knee.x + foot.x) * 0.5, Math.min(knee.y, foot.y) - 4, );
    g.lineTo(foot.x, foot.y);
    g.strokePath();
  }

  function drawGuardBracket(g, cache, opts){
    var head, torso, col, contact, pad, facing, foreX, foreY;
    if (!cache || !cache.rig || !cache.motion) return;
    if (cache.motion.stateKey !== 'block' && cache.motion.stateKey !== 'blockstun') return;
    contact = cache.motion.contact || null;
    head = cache.rig.head;
    torso = cache.rig.torsoCenter;
    col = quantize(opts, 0x7ab6ff);
    facing = cache.rig.facing || 1;
    pad = 4 + Math.max(0, Math.floor((contact && contact.intensity || 0) * 3));
    foreX = cache.rig.frontHand.x - (facing * 2);
    foreY = cache.rig.frontHand.y - 2;
    g.lineStyle(2, col, 0.82);
    g.lineBetween(cache.rig.frontShoulder.x + (facing * 1), cache.rig.frontShoulder.y - 2, cache.rig.frontHand.x, cache.rig.frontHand.y);
    g.lineStyle(1, col, 0.62);
    g.lineBetween(foreX, foreY - pad, foreX + (facing * 7), foreY - pad);
    g.lineBetween(foreX, foreY + pad, foreX + (facing * 7), foreY + pad);
    g.lineStyle(1, col, 0.42);
    g.lineBetween(head.x + (facing * 2), head.y - 2, torso.x + (facing * 6), torso.y - 5);
    g.lineBetween(torso.x + (facing * 3), torso.y + 1, cache.rig.frontHand.x + (facing * -1), cache.rig.frontHand.y + 3);
  }

  function drawDizzyStars(g, cache, opts){
    var i, ang, x, y, col;
    if (!cache || !cache.rig || !cache.motion || cache.motion.stateKey !== 'dizzy') return;
    col = quantize(opts, 0xffd564);
    for (i = 0; i < 3; i++) {
      ang = (((cache.motion.frame || 0) * 0.12) + (i * 2.094)) % (Math.PI * 2);
      x = cache.rig.head.x + (Math.cos(ang) * 10);
      y = cache.rig.head.y - 6 + (Math.sin(ang) * 4);
      g.fillStyle(col, 0.92);
      g.fillRect(Math.floor(x) - 1, Math.floor(y) - 1, 3, 3);
    }
  }

  function drawWakeRing(g, cache, opts){
    var col;
    if (!cache || !cache.rig || !cache.motion || cache.motion.stateKey !== 'wakeup') return;
    col = quantize(opts, 0x9cd97a);
    g.lineStyle(1, col, 0.75);
    g.strokeEllipse(cache.rig.root.x, cache.rig.root.y + 1, 30, 8);
    g.lineStyle(1, col, 0.55);
    g.lineBetween(cache.rig.root.x - 6, cache.rig.root.y - 6, cache.rig.root.x - 6, cache.rig.root.y - 11);
    g.lineBetween(cache.rig.root.x, cache.rig.root.y - 7, cache.rig.root.x, cache.rig.root.y - 13);
    g.lineBetween(cache.rig.root.x + 6, cache.rig.root.y - 6, cache.rig.root.x + 6, cache.rig.root.y - 11);
    g.lineBetween(cache.rig.root.x - 10, cache.rig.root.y - 2, cache.rig.root.x + 10, cache.rig.root.y - 2);
  }

  function drawKnockdownSkid(g, cache, opts){
    var col;
    if (!cache || !cache.rig || !cache.motion || cache.motion.stateKey !== 'knockdown') return;
    col = quantize(opts, 0xc7b496);
    g.lineStyle(1, col, 0.6);
    g.lineBetween(cache.rig.root.x - 16, cache.rig.root.y + 2, cache.rig.root.x + 16, cache.rig.root.y + 2);
    g.strokeEllipse(cache.rig.root.x, cache.rig.root.y + 2, 28, 6);
    g.lineBetween(cache.rig.root.x - 20, cache.rig.root.y + 4, cache.rig.root.x - 14, cache.rig.root.y + 7);
    g.lineBetween(cache.rig.root.x + 12, cache.rig.root.y + 4, cache.rig.root.x + 18, cache.rig.root.y + 7);
    g.lineBetween(cache.rig.root.x - 8, cache.rig.root.y + 1, cache.rig.root.x + 8, cache.rig.root.y + 1);
  }

  function drawHurtBurst(g, cache, opts){
    var col, torso;
    if (!cache || !cache.rig || !cache.motion || cache.motion.stateKey !== 'hit') return;
    col = quantize(opts, 0xff9a64);
    torso = cache.rig.torsoCenter;
    g.lineStyle(2, col, 0.85);
    g.lineBetween(torso.x - 10, torso.y - 6, torso.x - 2, torso.y - 1);
    g.lineBetween(torso.x + 10, torso.y - 6, torso.x + 2, torso.y - 1);
    g.lineBetween(torso.x - 8, torso.y + 8, torso.x - 1, torso.y + 2);
    g.lineBetween(torso.x + 8, torso.y + 8, torso.x + 1, torso.y + 2);
    g.lineStyle(1, col, 0.65);
    g.strokePoints([
      { x: torso.x, y: torso.y - 5 },
      { x: torso.x + 4, y: torso.y - 1 },
      { x: torso.x, y: torso.y + 3 },
      { x: torso.x - 4, y: torso.y - 1 }
    ], true);
    g.lineBetween(cache.rig.head.x, cache.rig.head.y + 3, torso.x - (cache.rig.facing * 4), torso.y + 1);
  }

  function drawThrowScramble(g, cache, opts){
    var col;
    if (!cache || !cache.rig || !cache.motion) return;
    if (!cache.motion.techPoseActive && cache.motion.stateKey !== 'throw') return;
    col = quantize(opts, cache.motion.techPoseActive ? 0x96dfff : 0xffd887);
    g.lineStyle(1, col, cache.motion.techPoseActive ? 0.74 : 0.58);
    g.strokeCircle(cache.rig.frontHand.x, cache.rig.frontHand.y + 1, 3);
    g.strokeCircle(cache.rig.rearHand.x, cache.rig.rearHand.y + 1, 3);
    g.lineBetween(cache.rig.frontShoulder.x, cache.rig.frontShoulder.y - 1, cache.rig.rearShoulder.x, cache.rig.rearShoulder.y - 3);
    g.lineBetween(cache.rig.frontHand.x, cache.rig.frontHand.y, cache.rig.frontHand.x + (cache.rig.facing * 6), cache.rig.frontHand.y - 5);
    g.lineBetween(cache.rig.rearHand.x, cache.rig.rearHand.y, cache.rig.rearHand.x - (cache.rig.facing * 6), cache.rig.rearHand.y - 4);
    g.lineBetween(cache.rig.frontHip.x - 4, cache.rig.root.y + 2, cache.rig.frontHip.x + 5, cache.rig.root.y + 2);
    g.lineBetween(cache.rig.head.x - (cache.rig.facing * 3), cache.rig.head.y + 1, cache.rig.head.x + (cache.rig.facing * 4), cache.rig.head.y - 2);
  }

  function pushPulse(scene, pulse){
    var state = ensureSceneState(scene);
    state.pulses.push(pulse);
    if (state.pulses.length > 24) state.pulses.splice(0, state.pulses.length - 24);
    return state;
  }

  function renderMoveFx(scene, g, cache, opts){
    var effect, lead, target, qAccent, qLight, qDark, alpha, focus;
    if (!cache || !cache.motion || !cache.motion.effect || !cache.rig) return;
    effect = cache.motion.effect;
    lead = cache.rig.frontHand;
    alpha = clamp(Number(effect.alpha || 0.4), 0.08, 1);
    focus = String(effect.focusPart || cache.motion.focusPart || '');
    qAccent = quantize(opts, cache.visual && cache.visual.palette ? (cache.visual.palette.accent || 0xffd160) : 0xffd160);
    qLight = quantize(opts, cache.visual && cache.visual.palette ? (cache.visual.palette.bodyLight || 0xd8d8d8) : 0xd8d8d8);
    qDark = quantize(opts, cache.visual && cache.visual.palette ? (cache.visual.palette.clothMid || cache.visual.palette.leafMid || 0x6d6d6d) : 0x6d6d6d);

    if (effect.type === 'jab-line' || effect.type === 'thorn-jab') {
      target = toLocalWorld(cache, effect.target || { x: 18, y: -24 });
      if (effect.phase === 'startup') target = { x: (lead.x + target.x) * 0.55, y: (lead.y + target.y) * 0.55 };
      drawSlash(g, lead, target, qAccent, alpha);
    } else if (effect.type === 'kick-arc' || effect.type === 'low-swipe' || effect.type === 'axe-fall' || effect.type === 'jump-arc' || effect.type === 'jump-drop' || effect.type === 'root-sweep') {
      drawKickArc(g, cache.rig.frontFoot, cache.rig.frontKnee, qAccent, alpha);
      if (effect.target && effect.phase !== 'startup') {
        target = toLocalWorld(cache, effect.target);
        g.lineStyle(1, qAccent, alpha * 0.42);
        g.lineBetween(cache.rig.frontFoot.x, cache.rig.frontFoot.y, target.x, target.y);
      }
      if (focus === 'frontFoot' && effect.phase === 'startup') {
        g.fillStyle(qAccent, alpha * 0.45);
        g.fillCircle(cache.rig.frontFoot.x, cache.rig.frontFoot.y, 3);
      }
    } else if (effect.type === 'aloe-upper' || effect.type === 'root-upper') {
      target = toLocalWorld(cache, effect.target || { x: cache.motion.pose.frontHand.x, y: cache.motion.pose.frontHand.y });
      drawRibbon(g, cache.rig.frontShoulder, target, 2, 6, effect.type === 'aloe-upper' ? quantize(opts, 0x70e86a) : quantize(opts, 0x9bcf8c), alpha);
      g.fillStyle(qAccent, alpha);
      g.fillTriangle(target.x - 4, target.y + 4, target.x + 2, target.y - 8, target.x + 8, target.y + 2);
    } else if (effect.type === 'cactus-wave' || effect.type === 'memo-burst') {
      target = toLocalWorld(cache, effect.target || { x: 28, y: -22 });
      drawRibbon(g, lead, target, 3, 7, effect.type === 'cactus-wave' ? quantize(opts, 0x6adf76) : quantize(opts, 0xb7a4ff), alpha);
      g.fillStyle(effect.type === 'cactus-wave' ? qAccent : qLight, alpha * 0.92);
      g.fillRect(Math.floor(target.x) - 6, Math.floor(target.y) - 4, 12, 8);
      if (effect.phase === 'startup') {
        g.fillStyle(qAccent, alpha * 0.6);
        g.fillCircle(lead.x, lead.y, 4);
      }
    } else if (effect.type === 'debt-spin' || effect.type === 'brand-drive') {
      g.lineStyle(2, effect.type === 'debt-spin' ? qAccent : qDark, alpha * 0.9);
      g.strokeCircle(cache.rig.torsoCenter.x + (cache.rig.facing * 4), cache.rig.torsoCenter.y, effect.type === 'debt-spin' ? 12 : 10);
      g.lineStyle(1, qAccent, alpha * 0.55);
      g.strokeCircle(cache.rig.torsoCenter.x, cache.rig.torsoCenter.y, effect.type === 'debt-spin' ? 16 : 14);
    } else if (effect.type === 'receipt' || effect.type === 'vine-grab') {
      target = toLocalWorld(cache, effect.target || { x: 18, y: -20 });
      drawRibbon(g, cache.rig.frontHand, target, 1, 3, effect.type === 'receipt' ? quantize(opts, 0xf3e2be) : quantize(opts, 0x74bb77), alpha);
      if (effect.type === 'receipt') {
        g.fillStyle(qLight, alpha);
        g.fillRect(Math.floor(target.x) - 4, Math.floor(target.y) - 3, 8, 6);
      } else {
        g.lineStyle(1, quantize(opts, 0xa7e19a), alpha * 0.78);
        g.strokeCircle(target.x, target.y, 4);
      }
    }
  }

  function renderPulse(g, scene, pulse, opts){
    var pt = eventToVirtual(scene, pulse.x, pulse.y);
    var alpha = clamp((pulse.ttl || 0) / Math.max(1, pulse.maxTtl || pulse.ttl || 1), 0.12, 1);
    if (pulse.type === 'hit') {
      g.lineStyle(2, quantize(opts, pulse.strength === 'heavy' ? 0xfff0a0 : 0xff9a64), 0.9 * alpha);
      g.strokeCircle(pt.x, pt.y, pulse.strength === 'heavy' ? 10 : 7);
      g.lineBetween(pt.x - 8, pt.y, pt.x + 8, pt.y);
      g.lineBetween(pt.x, pt.y - 8, pt.x, pt.y + 8);
    } else if (pulse.type === 'block') {
      g.lineStyle(2, quantize(opts, 0x7ab6ff), 0.82 * alpha);
      g.lineBetween(pt.x - 7, pt.y - 6, pt.x + 6, pt.y - 1);
      g.lineBetween(pt.x - 7, pt.y + 6, pt.x + 6, pt.y + 1);
      g.lineStyle(1, quantize(opts, 0xb8dcff), 0.55 * alpha);
      g.strokePoints([
        { x: pt.x - 5, y: pt.y - 8 },
        { x: pt.x + 7, y: pt.y - 2 },
        { x: pt.x + 4, y: pt.y + 7 },
        { x: pt.x - 8, y: pt.y + 2 }
      ], true);
    } else if (pulse.type === 'throw' || pulse.type === 'throwWhiff') {
      g.lineStyle(2, quantize(opts, pulse.type === 'throw' ? 0xffd887 : 0xcbbd9d), 0.85 * alpha);
      g.strokeCircle(pt.x, pt.y, pulse.type === 'throw' ? 10 : 7);
      g.lineBetween(pt.x - 6, pt.y + 4, pt.x + 6, pt.y - 4);
    } else if (pulse.type === 'throwTech') {
      g.lineStyle(2, quantize(opts, 0x96dfff), 0.9 * alpha);
      g.lineBetween(pt.x - 8, pt.y - 8, pt.x + 8, pt.y + 8);
      g.lineBetween(pt.x + 8, pt.y - 8, pt.x - 8, pt.y + 8);
      g.strokeCircle(pt.x, pt.y, 9);
      g.lineStyle(1, quantize(opts, 0x96dfff), 0.55 * alpha);
      g.lineBetween(pt.x - 9, pt.y + 10, pt.x + 9, pt.y + 10);
    }
  }

  fxRenderer.getSceneState = ensureSceneState;

  fxRenderer.beginFrame = function(scene){
    var frame, i, state = ensureSceneState(scene);
    frame = scene && scene._fightWorld ? (scene._fightWorld.frame | 0) : -1;
    if (state.lastFrame === frame) return state;
    state.lastFrame = frame;
    state.techPoseFrames.p1 = Math.max(0, (state.techPoseFrames.p1 | 0) - 1);
    state.techPoseFrames.p2 = Math.max(0, (state.techPoseFrames.p2 | 0) - 1);
    for (i = state.pulses.length - 1; i >= 0; i--) {
      state.pulses[i].ttl--;
      if (state.pulses[i].ttl <= 0) state.pulses.splice(i, 1);
    }
    return state;
  };

  fxRenderer.applyEvent = function(scene, ev){
    var state = ensureSceneState(scene);
    if (!ev) return state;
    if (ev.type === 'throwTech') {
      state.techPoseFrames.p1 = Math.max(state.techPoseFrames.p1 | 0, 8);
      state.techPoseFrames.p2 = Math.max(state.techPoseFrames.p2 | 0, 8);
      pushPulse(scene, { type: 'throwTech', ttl: 8, maxTtl: 8, x: ev.x, y: ev.y });
      return state;
    }
    if (ev.type === 'hit' || ev.type === 'block' || ev.type === 'throw' || ev.type === 'throwWhiff') {
      pushPulse(scene, {
        type: ev.type,
        ttl: ev.type === 'hit' ? 7 : 6,
        maxTtl: ev.type === 'hit' ? 7 : 6,
        x: ev.x,
        y: ev.y,
        strength: ev.strength || 'light'
      });
    }
    return state;
  };

  fxRenderer.renderFighterFx = function(scene, g, cache, opts){
    renderMoveFx(scene, g, cache, opts || {});
    drawGuardBracket(g, cache, opts || {});
    drawDizzyStars(g, cache, opts || {});
    drawWakeRing(g, cache, opts || {});
    drawKnockdownSkid(g, cache, opts || {});
    drawHurtBurst(g, cache, opts || {});
    drawThrowScramble(g, cache, opts || {});
  };

  fxRenderer.renderTransientFx = function(scene, g, opts){
    var state = ensureSceneState(scene);
    var i;
    for (i = 0; i < state.pulses.length; i++) {
      renderPulse(g, scene, state.pulses[i], opts || {});
    }
  };
})(typeof window !== 'undefined' ? window : this);
