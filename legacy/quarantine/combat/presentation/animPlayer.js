(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var animPlayer = ns.presentation.animPlayer = ns.presentation.animPlayer || {};

  function toPx(v){
    if (typeof global._fightToPx === 'function') return global._fightToPx(v);
    return Number(v || 0) / Number(global.FIGHT_FP || 256);
  }

  function abs(v){
    return v < 0 ? -v : v;
  }

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function getRosterMove(fighter){
    if (!fighter || !fighter.moveId) return null;
    if (typeof global._fightRosterMoveById === 'function') {
      return global._fightRosterMoveById(fighter.rosterKey, fighter.moveId);
    }
    var roster = global.FIGHT_ROSTER && global.FIGHT_ROSTER[fighter.rosterKey];
    var i;
    if (!roster || !roster.moves) return null;
    for (i = 0; i < roster.moves.length; i++) {
      if (roster.moves[i].id === fighter.moveId) return roster.moves[i];
    }
    return null;
  }

  function getVisual(fighter){
    return ns.data && ns.data.fighters ? ns.data.fighters[fighter && fighter.rosterKey] : null;
  }

  function getPoseLib(){
    return ns.presentation && ns.presentation.poseLibrary ? ns.presentation.poseLibrary : null;
  }

  function getFxState(scene){
    var fx = ns.presentation && ns.presentation.fxRenderer;
    if (!fx || typeof fx.getSceneState !== 'function') return null;
    return fx.getSceneState(scene);
  }

  function normalizeMovePhase(fighter, move, poseLib){
    var startup = Math.max(1, Number(move && move.startup || 1));
    var active = Math.max(1, Number(move && move.active || 1));
    var recovery = Math.max(1, Number(move && move.recovery || 1));
    var total = Math.max(1, startup + active + recovery);
    var frame = Math.max(0, Number(fighter && fighter.moveFrame || 0));
    var phaseT;
    if (frame <= startup) {
      phaseT = frame / startup;
      return { phase: 'startup', phaseT: phaseT, t: poseLib.easeOut(phaseT), overall: frame / total };
    }
    if (frame <= startup + active) {
      phaseT = (frame - startup) / active;
      return { phase: 'active', phaseT: phaseT, t: 1, overall: frame / total };
    }
    phaseT = (frame - startup - active) / recovery;
    return { phase: 'recovery', phaseT: phaseT, t: 1 - poseLib.easeInOut(phaseT), overall: frame / total };
  }

  function hitTargetLocal(fighter){
    var facing = fighter && fighter.facing === -1 ? -1 : 1;
    var boxes = fighter && fighter.boxes && fighter.boxes.hit ? fighter.boxes.hit : null;
    var i, box, x1, y1, x2, y2;
    if (!boxes || !boxes.length) return null;
    x1 = boxes[0].x1;
    y1 = boxes[0].y1;
    x2 = boxes[0].x2;
    y2 = boxes[0].y2;
    for (i = 1; i < boxes.length; i++) {
      box = boxes[i];
      if (box.x1 < x1) x1 = box.x1;
      if (box.y1 < y1) y1 = box.y1;
      if (box.x2 > x2) x2 = box.x2;
      if (box.y2 > y2) y2 = box.y2;
    }
    return {
      x: toPx((((x1 + x2) * 0.5) - fighter.x)) * facing,
      y: toPx((((y1 + y2) * 0.5) - fighter.y))
    };
  }

  function nominalMoveTarget(move){
    var box;
    if (!move) return null;
    if (move.hit && move.hit.length) {
      box = move.hit[move.hit.length - 1];
      return {
        x: Number(box.x || 0) + (Number(box.w || 0) * 0.5),
        y: Number(box.y || 0) + (Number(box.h || 0) * 0.5)
      };
    }
    return null;
  }

  function blendTarget(curr, target, weight){
    return {
      x: curr.x + ((target.x - curr.x) * weight),
      y: curr.y + ((target.y - curr.y) * weight)
    };
  }

  function stateBiasKey(fighter){
    var state = String(fighter && fighter.state || 'idle');
    if (!fighter || !fighter.grounded || state === 'jump') return 'jump';
    if (state === 'blockstun') return 'block';
    if (state === 'hitstun') return 'hit';
    return state;
  }

  function applyPoseBias(poseLib, pose, bias){
    if (!bias) return pose;
    return poseLib.composePose(pose, bias, 1);
  }

  function resolveBasePose(scene, fighter, visual, poseLib){
    var vx = toPx(fighter && fighter.vx || 0);
    var vy = toPx(fighter && fighter.vy || 0);
    var state = String(fighter && fighter.state || 'idle');
    var key = stateBiasKey(fighter);
    var frame = scene && scene._fightWorld ? scene._fightWorld.frame : 0;
    var base;
    if (key === 'knockdown') base = poseLib.poseByName('knockdown');
    else if (key === 'wakeup') base = poseLib.poseByName('wakeup');
    else if (key === 'hit') base = poseLib.poseByName('hit');
    else if (key === 'block') base = poseLib.poseByName('block');
    else if (key === 'dizzy') base = poseLib.poseByName('dizzy');
    else if (!fighter.grounded || state === 'jump') base = poseLib.poseByName(vy < -0.35 ? 'jumpRise' : 'jumpFall');
    else if (state === 'crouch') base = poseLib.poseByName('crouch');
    else if (abs(vx) > 0.45 || state === 'walk') base = poseLib.walkPose(frame, visual && visual.motion);
    else base = poseLib.poseByName('idle');
    if (visual && visual.stance) {
      base = applyPoseBias(poseLib, base, visual.stance.base);
      base = applyPoseBias(poseLib, base, visual.stance[key]);
      if (abs(vx) > 0.45 && visual.stance.walk) base = applyPoseBias(poseLib, base, visual.stance.walk);
    }
    if (visual && visual.motion && (!fighter.moveId) && key === 'idle') {
      base.rootLift += Math.sin(frame * Number(visual.motion.idleRate || 0.08)) * Number(visual.motion.idleBob || 0.8);
    }
    return base;
  }

  function stateKeyFor(fighter){
    return stateBiasKey(fighter);
  }

  function getOpponent(scene, fighter){
    var world = scene && scene._fightWorld;
    if (!world || !world.fighters || !fighter) return null;
    return fighter.id === 'p1' ? world.fighters.p2 : world.fighters.p1;
  }

  function contactRoleKeyFor(fighter, opponent, move, techPoseActive){
    var state = String(fighter && fighter.state || 'idle');
    if (techPoseActive) return 'tech';
    if (state === 'blockstun') return 'block';
    if (state === 'hitstun') return 'hit';
    if (state === 'wakeup') return 'wakeup';
    if (state === 'knockdown') return 'knockdown';
    if (move && move.type === 'throw') return 'throw';
    if (move && (state === 'startup' || state === 'active' || state === 'recovery')) return 'attacker';
    if (opponent && (opponent.moveId || opponent.state === 'startup' || opponent.state === 'active' || opponent.state === 'recovery' || opponent.state === 'throw')) return 'defender';
    return 'neutral';
  }

  function recentExchangeBoost(scene){
    var info = recentExchangeInfo(scene);
    var age = info.age;
    return age <= 8 ? (0.1 + ((8 - age) * 0.02)) : 0;
  }

  function recentExchangeInfo(scene){
    var world = scene && scene._fightWorld;
    var lx = world && world.interaction ? world.interaction.lastExchange : null;
    var age = lx ? Math.max(0, (world.frame | 0) - (lx.frame | 0)) : 99;
    return {
      exchange: lx,
      age: age,
      recent: !!lx && age <= 12
    };
  }

  function sequencePhase(poseLib, frame, total){
    var progress = clamp(Number(frame || 0) / Math.max(1, Number(total || 1)), 0, 1);
    var phaseT;
    if (progress <= 0.26) {
      phaseT = progress / 0.26;
      return { phase: 'startup', phaseT: phaseT, t: poseLib.easeOut(phaseT), overall: progress };
    }
    if (progress <= 0.62) {
      phaseT = (progress - 0.26) / 0.36;
      return { phase: 'active', phaseT: clamp(phaseT, 0, 1), t: 1, overall: progress };
    }
    phaseT = (progress - 0.62) / 0.38;
    return { phase: 'recovery', phaseT: clamp(phaseT, 0, 1), t: 1 - poseLib.easeInOut(phaseT), overall: progress };
  }

  function impactPhase(poseLib, age, total){
    var progress = clamp(Number(age || 0) / Math.max(1, Number(total || 1)), 0, 1);
    var phaseT;
    if (progress <= 0.44) {
      phaseT = progress / 0.44;
      return { phase: 'active', phaseT: clamp(phaseT, 0, 1), t: 1, overall: progress };
    }
    phaseT = (progress - 0.44) / 0.56;
    return { phase: 'recovery', phaseT: clamp(phaseT, 0, 1), t: 1 - poseLib.easeInOut(phaseT), overall: progress };
  }

  function applyClipWeighted(poseLib, pose, clipName, phaseInfo, weight){
    var clipPose;
    var w = clamp(Number(weight || 0), 0, 1);
    if (!clipName || w <= 0.01) return pose;
    if (typeof poseLib.sampleClip === 'function') {
      clipPose = poseLib.sampleClip(pose, clipName, phaseInfo || { phase: 'active', phaseT: 0, t: 1, overall: 0 });
    } else {
      clipPose = poseLib.composePose(pose, poseLib.moveByName(clipName), phaseInfo && phaseInfo.t !== undefined ? phaseInfo.t : 1);
    }
    return poseLib.blendPose(pose, clipPose, w);
  }

  function confirmLeadClipName(move, desc){
    var focus = focusPartForMove(move, desc);
    if (move && move.type === 'throw') return 'throwConnect';
    return focus === 'frontFoot' ? 'confirmLegLead' : 'confirmArmLead';
  }

  function settleClipNameForMove(move, desc){
    var focus = focusPartForMove(move, desc);
    if (move && move.type === 'throw') return 'throwAftermath';
    return focus === 'frontFoot' ? 'attackerSettleLeg' : 'attackerSettleArm';
  }

  function recentExchangeMatchesMove(exchangeInfo, move){
    var lx = exchangeInfo && exchangeInfo.exchange;
    if (!lx || !move) return false;
    return String(lx.moveId || '') === String(move.id || '');
  }

  function applyReactionPresentation(scene, fighter, move, moveDesc, pose, phase, contact, techPoseActive, poseLib){
    var state = String(fighter && fighter.state || 'idle');
    var exchangeInfo = recentExchangeInfo(scene);
    var exchange = exchangeInfo.exchange || null;
    var exchangeHitType = exchange ? String(exchange.hitType || 'none') : 'none';
    var ownsExchange = !!(exchangeInfo.recent && recentExchangeMatchesMove(exchangeInfo, move));
    var recentDefender = !!(exchangeInfo.recent && exchangeHitType !== 'none' && !ownsExchange);
    var contactIntensity = clamp(contact && contact.intensity || 0, 0, 1);
    var techFrames = 0;
    var reactionPhase;
    var weight;
    var fxState;
    if (techPoseActive) {
      fxState = getFxState(scene);
      techFrames = fxState && fxState.techPoseFrames ? Math.max(fxState.techPoseFrames[fighter.id] | 0, 0) : 0;
      reactionPhase = sequencePhase(poseLib, Math.max(0, 8 - techFrames), 8);
      pose = applyClipWeighted(poseLib, pose, 'techBreak', reactionPhase, 0.82 + (contactIntensity * 0.14));
      pose = applyClipWeighted(poseLib, pose, 'throwBreakRecover', reactionPhase, 0.36 + (contactIntensity * 0.2));
    }
    if (state === 'blockstun') {
      reactionPhase = (exchangeInfo.recent && exchangeInfo.exchange && exchangeInfo.exchange.hitType === 'block') ?
        impactPhase(poseLib, exchangeInfo.age, 9) :
        sequencePhase(poseLib, fighter.stateFrame, 8);
      pose = applyClipWeighted(poseLib, pose, 'blockBrace', reactionPhase, 0.72 + (contactIntensity * 0.18));
      pose = applyClipWeighted(poseLib, pose, 'guardRecover', reactionPhase, 0.34 + (contactIntensity * 0.12));
    } else if (state === 'hitstun') {
      reactionPhase = exchangeInfo.recent ? impactPhase(poseLib, exchangeInfo.age, 10) : sequencePhase(poseLib, fighter.stateFrame, 9);
      pose = applyClipWeighted(poseLib, pose, 'hitRecoil', reactionPhase, 0.78 + (contactIntensity * 0.16));
      pose = applyClipWeighted(poseLib, pose, 'confirmReceive', reactionPhase, 0.36 + (contactIntensity * 0.12));
      pose = applyClipWeighted(poseLib, pose, 'hitRecover', reactionPhase, 0.28 + (contactIntensity * 0.14));
    } else if (state === 'wakeup') {
      reactionPhase = sequencePhase(poseLib, fighter.stateFrame, 12);
      pose = applyClipWeighted(poseLib, pose, 'wakeRise', reactionPhase, 0.7 + (contactIntensity * 0.12));
    } else if (state === 'knockdown') {
      reactionPhase = sequencePhase(poseLib, Math.min(fighter.stateFrame, 10), 10);
      pose = applyClipWeighted(poseLib, pose, 'knockCollapse', reactionPhase, 0.92);
      if (exchangeInfo.recent && exchangeHitType === 'throw') {
        pose = applyClipWeighted(poseLib, pose, 'throwDump', impactPhase(poseLib, exchangeInfo.age, 10), 0.58 + (contactIntensity * 0.12));
      }
    }
    if (move && ownsExchange) {
      if (exchangeHitType === 'hit' || exchangeHitType === 'block') {
        weight = (exchangeHitType === 'hit' ? 0.54 : 0.38) + (contactIntensity * 0.18);
        pose = applyClipWeighted(poseLib, pose, confirmLeadClipName(move, moveDesc), phase, weight);
        reactionPhase = impactPhase(poseLib, exchangeInfo.age, exchangeHitType === 'hit' ? 10 : 8);
        if (exchangeHitType === 'block') {
          pose = applyClipWeighted(poseLib, pose, 'guardedRecoil', reactionPhase, 0.6 + (contactIntensity * 0.16));
        } else {
          pose = applyClipWeighted(poseLib, pose, settleClipNameForMove(move, moveDesc), reactionPhase, 0.54 + (contactIntensity * 0.18));
        }
      } else if (exchangeHitType === 'throw' || exchangeHitType === 'throwTech') {
        pose = applyClipWeighted(poseLib, pose, 'throwConnect', phase, 0.64 + (contactIntensity * 0.18));
        pose = applyClipWeighted(poseLib, pose, 'throwAftermath', impactPhase(poseLib, exchangeInfo.age, 10), 0.52 + (contactIntensity * 0.12));
      }
    } else if (move && move.type === 'throw' && (state === 'throw' || state === 'startup' || state === 'active')) {
      pose = applyClipWeighted(poseLib, pose, 'throwConnect', phase, 0.48 + (contactIntensity * 0.16));
      if (phase.phase === 'recovery') {
        pose = applyClipWeighted(poseLib, pose, 'throwAftermath', phase, 0.4 + (contactIntensity * 0.14));
      }
    }
    if (recentDefender) {
      reactionPhase = impactPhase(poseLib, exchangeInfo.age, exchangeHitType === 'throw' ? 11 : 10);
      if (exchangeHitType === 'block' && state !== 'blockstun') {
        pose = applyClipWeighted(poseLib, pose, 'guardRecover', reactionPhase, 0.48 + (contactIntensity * 0.14));
      } else if (exchangeHitType === 'hit' && state !== 'hitstun') {
        pose = applyClipWeighted(poseLib, pose, 'hitRecover', reactionPhase, 0.56 + (contactIntensity * 0.14));
      } else if (exchangeHitType === 'throw' && (state === 'knockdown' || state === 'wakeup' || state === 'hitstun')) {
        pose = applyClipWeighted(poseLib, pose, 'throwDump', reactionPhase, 0.64 + (contactIntensity * 0.14));
      }
    }
    return pose;
  }

  function resolveContactPresentation(scene, fighter, visual, move, techPoseActive){
    var cfg = visual && visual.closeContact;
    var opponent = getOpponent(scene, fighter);
    var exchangeInfo = recentExchangeInfo(scene);
    var exchange = exchangeInfo.exchange || null;
    var exchangeHitType = exchange ? String(exchange.hitType || 'none') : 'none';
    var ownsExchange = !!(exchangeInfo.recent && recentExchangeMatchesMove(exchangeInfo, move));
    var role;
    var threshold;
    var falloff;
    var distPx;
    var intensity;
    var spacing;
    var vertical;
    var retreatScale;
    if (!cfg || !fighter || !opponent) return null;
    role = contactRoleKeyFor(fighter, opponent, move, techPoseActive);
    if (exchangeInfo.recent) {
      if (ownsExchange && (exchangeHitType === 'hit' || exchangeHitType === 'block')) role = 'attacker';
      else if (ownsExchange && exchangeHitType === 'throw') role = 'throw';
      else if (!ownsExchange && exchangeHitType === 'block') role = 'block';
      else if (!ownsExchange && exchangeHitType === 'hit') role = 'hit';
      else if (!ownsExchange && exchangeHitType === 'throw' && fighter && fighter.grounded) role = 'knockdown';
    }
    threshold = Number(cfg.thresholdPx || 112);
    falloff = Math.max(12, Number(cfg.falloffPx || 44));
    distPx = abs(toPx((opponent.x || 0) - (fighter.x || 0)));
    intensity = clamp((threshold - distPx) / falloff, 0, 1);
    if (role === 'block' || role === 'hit' || role === 'tech' || role === 'throw' || role === 'wakeup') {
      intensity = clamp(intensity + 0.22, 0, 1);
    }
    if (exchangeInfo.recent && (exchangeHitType === 'hit' || exchangeHitType === 'block' || exchangeHitType === 'throw')) {
      intensity = clamp(intensity + (ownsExchange ? 0.08 : 0.14), 0, 1);
    }
    intensity = clamp(intensity + recentExchangeBoost(scene), 0, 1);
    if (intensity <= 0) return { intensity: 0, role: role, distPx: distPx, bias: null, presentationOffset: { x: 0, y: 0 } };
    spacing = Number(cfg.spacingPx || 0);
    vertical = Number(cfg.verticalPx || 0);
    retreatScale = 0.9;
    if (role === 'attacker' || role === 'throw') retreatScale = 0.58;
    else if (role === 'block' || role === 'hit' || role === 'tech') retreatScale = 1.22;
    else if (role === 'knockdown') retreatScale = 1.05;
    if (exchangeInfo.recent && ownsExchange && exchangeHitType === 'hit') retreatScale = 0.34;
    else if (exchangeInfo.recent && ownsExchange && exchangeHitType === 'block') retreatScale = 0.44;
    else if (exchangeInfo.recent && ownsExchange && exchangeHitType === 'throw') retreatScale = 0.22;
    else if (exchangeInfo.recent && !ownsExchange && exchangeHitType === 'throw') retreatScale = 1.34;
    return {
      intensity: intensity,
      role: role,
      distPx: distPx,
      bias: cfg[role] || cfg.neutral || null,
      presentationOffset: {
        x: (-fighter.facing * spacing * retreatScale * intensity) +
          ((exchangeInfo.recent && ownsExchange && (exchangeHitType === 'hit' || exchangeHitType === 'throw')) ? (fighter.facing * spacing * 0.2 * intensity) : 0) +
          ((exchangeInfo.recent && !ownsExchange && (exchangeHitType === 'hit' || exchangeHitType === 'block' || exchangeHitType === 'throw')) ? (-fighter.facing * spacing * 0.18 * intensity) : 0),
        y: (((role === 'hit' || role === 'knockdown') ? (vertical * 0.42) : (role === 'wakeup' ? (vertical * -0.5) : (role === 'tech' ? (vertical * -0.18) : 0))) +
          ((exchangeInfo.recent && ownsExchange && exchangeHitType === 'hit') ? (vertical * -0.08) : 0) +
          ((exchangeInfo.recent && !ownsExchange && (exchangeHitType === 'block' || exchangeHitType === 'hit')) ? (vertical * 0.12) : 0)) * intensity
      }
    };
  }

  function clipNameForMove(move, desc){
    if (desc && desc.clip) return desc.clip;
    if (desc && desc.overlay) return desc.overlay;
    if (move && move.type === 'throw') return 'throw';
    if (move && move.requireCrouch) return 'lowKick';
    if (move && move.airOnly) return 'jumpKick';
    if (move && move.button === 2) return 'standingKick';
    return 'jab';
  }

  function focusPartForMove(move, desc){
    if (desc && desc.targetPart) return desc.targetPart;
    if (move && move.type === 'throw') return 'bothHands';
    return 'frontHand';
  }

  function effectAlphaForPhase(phase){
    if (!phase) return 0;
    if (phase.phase === 'startup') return clamp(0.22 + (phase.phaseT * 0.28), 0.18, 0.5);
    if (phase.phase === 'active') return clamp(0.75 + (phase.phaseT * 0.25), 0.75, 1);
    return clamp(0.12 + ((1 - phase.phaseT) * 0.33), 0.12, 0.45);
  }

  function applyMoveTargets(pose, move, desc, phase, liveTarget, nominalTarget){
    var target = liveTarget || nominalTarget;
    var focusPart = focusPartForMove(move, desc);
    var lead = clamp(Number(desc && desc.lead !== undefined ? desc.lead : 1), 0.2, 1);
    var startupReach = clamp(Number(desc && desc.startupReach !== undefined ? desc.startupReach : (focusPart === 'frontFoot' ? 0.16 : 0.24)), 0.08, 0.7);
    var activeReach = clamp(Number(desc && desc.activeReach !== undefined ? desc.activeReach : 1), 0.35, 1.15);
    var recoveryReach = clamp(Number(desc && desc.recoveryReach !== undefined ? desc.recoveryReach : 0.45), 0.15, 0.9);
    var startupLift = Number(desc && desc.startupLift !== undefined ? desc.startupLift : (focusPart === 'frontFoot' ? 5 : 3));
    var recoveryLift = Number(desc && desc.recoveryLift !== undefined ? desc.recoveryLift : 6);
    var reach;
    var yBias;
    var shapedTarget;
    var weight;
    if (!target) return pose;
    if (phase.phase === 'startup') {
      reach = startupReach + ((activeReach - startupReach) * phase.phaseT * 0.22);
      yBias = startupLift;
      weight = 0.32 + (phase.phaseT * 0.22);
    } else if (phase.phase === 'active') {
      reach = activeReach;
      yBias = 0;
      weight = 0.8 + (phase.phaseT * 0.18);
    } else {
      reach = recoveryReach + ((activeReach - recoveryReach) * (1 - phase.phaseT) * 0.18);
      yBias = recoveryLift;
      weight = 0.3 + ((1 - phase.phaseT) * 0.24);
    }
    shapedTarget = {
      x: target.x * reach,
      y: target.y + yBias
    };
    weight = clamp(weight * lead, 0.12, 1);
    if (focusPart === 'frontFoot') {
      pose.frontFoot = blendTarget(pose.frontFoot, shapedTarget, weight);
    } else if (focusPart === 'bothHands') {
      pose.frontHand = blendTarget(pose.frontHand, shapedTarget, weight);
      pose.rearHand = blendTarget(pose.rearHand, { x: shapedTarget.x * 0.72, y: shapedTarget.y + 3 }, weight * 0.9);
    } else if (focusPart === 'torso') {
      pose.lean += shapedTarget.x * 0.14 * weight;
      pose.torsoTilt += shapedTarget.x * 0.06 * weight;
      pose.frontHand = blendTarget(pose.frontHand, { x: pose.frontHand.x + 4, y: pose.frontHand.y + 1 }, weight);
      pose.rearHand = blendTarget(pose.rearHand, { x: pose.rearHand.x + 5, y: pose.rearHand.y + 2 }, weight);
    } else {
      pose.frontHand = blendTarget(pose.frontHand, shapedTarget, weight);
    }
    if (desc && desc.supportHand && focusPart !== 'bothHands') {
      pose.rearHand = blendTarget(pose.rearHand, { x: shapedTarget.x * 0.48, y: shapedTarget.y + 4 }, weight * 0.82);
    }
    return pose;
  }

  animPlayer.resolve = function(scene, fighter){
    var poseLib = getPoseLib();
    var visual = getVisual(fighter);
    var fxState = getFxState(scene);
    var move = getRosterMove(fighter);
    var moveDesc = visual && visual.moves && move ? (visual.moves[move.id] || null) : null;
    var basePose, phase, pose, liveTarget, nominalTarget, clipName, contact, contactWeight;
    var techPoseActive = !!(fxState && fxState.techPoseFrames && fxState.techPoseFrames[fighter.id] > 0);
    if (!poseLib || !fighter) return null;
    basePose = resolveBasePose(scene, fighter, visual, poseLib);
    pose = poseLib.clonePose(basePose);
    if (techPoseActive) {
      pose = poseLib.composePose(pose, poseLib.poseByName('tech'), 0.72);
    }
    if (move) {
      phase = normalizeMovePhase(fighter, move, poseLib);
      clipName = clipNameForMove(move, moveDesc);
      if (typeof poseLib.sampleClip === 'function') pose = poseLib.sampleClip(pose, clipName, phase);
      else pose = poseLib.composePose(pose, poseLib.moveByName(clipName), phase.t);
      liveTarget = hitTargetLocal(fighter);
      nominalTarget = nominalMoveTarget(move);
      pose = applyMoveTargets(pose, move, moveDesc || {}, phase, liveTarget, nominalTarget);
    } else {
      phase = { phase: 'idle', phaseT: 0, t: 0, overall: 0 };
      clipName = '';
    }
    contact = resolveContactPresentation(scene, fighter, visual, move, techPoseActive);
    if (contact && contact.intensity > 0 && contact.bias) {
      contactWeight = clamp((contact.role === 'neutral' ? 0.22 : 0.42) + (contact.intensity * 0.72), 0.18, 1);
      pose = poseLib.composePose(pose, contact.bias, contactWeight);
    }
    pose = applyReactionPresentation(scene, fighter, move, moveDesc, pose, phase, contact, techPoseActive, poseLib);
    return {
      fighter: fighter,
      visual: visual,
      move: move,
      moveDesc: moveDesc,
      clipName: clipName,
      pose: pose,
      phase: phase,
      stateKey: stateKeyFor(fighter),
      frame: scene && scene._fightWorld ? scene._fightWorld.frame : 0,
      techPoseActive: techPoseActive,
      contact: contact,
      presentationOffset: contact ? contact.presentationOffset : { x: 0, y: 0 },
      focusPart: focusPartForMove(move, moveDesc),
      effect: move ? {
        type: moveDesc && moveDesc.effect ? moveDesc.effect : '',
        phase: phase.phase,
        phaseT: phase.phaseT,
        alpha: effectAlphaForPhase(phase),
        focusPart: focusPartForMove(move, moveDesc),
        target: liveTarget || nominalTarget,
        contactRole: contact ? contact.role : '',
        moveId: move.id
      } : null
    };
  };
})(typeof window !== 'undefined' ? window : this);
