(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var fighterRig = ns.presentation.fighterRig = ns.presentation.fighterRig || {};

  function degToRad(v){ return Number(v || 0) * (Math.PI / 180); }

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function rotatePoint(point, deg){
    var r = degToRad(deg);
    var c = Math.cos(r);
    var s = Math.sin(r);
    return {
      x: (point.x * c) - (point.y * s),
      y: (point.x * s) + (point.y * c)
    };
  }

  function localToWorld(root, local, facing){
    return {
      x: root.x + (local.x * facing),
      y: root.y + local.y
    };
  }

  function scalePoint(point, scale){
    return {
      x: Number(point && point.x || 0) * scale,
      y: Number(point && point.y || 0) * scale
    };
  }

  function solveTwoBone(origin, target, lenA, lenB, bendDir){
    var dx = target.x - origin.x;
    var dy = target.y - origin.y;
    var dist = Math.sqrt((dx * dx) + (dy * dy)) || 0.0001;
    var maxReach = Math.max(1, lenA + lenB - 0.001);
    var minReach = Math.max(0.001, Math.abs(lenA - lenB) + 0.001);
    var reach = clamp(dist, minReach, maxReach);
    var base = Math.atan2(dy, dx);
    var shoulderOffset = Math.acos(clamp(((reach * reach) + (lenA * lenA) - (lenB * lenB)) / (2 * reach * lenA), -1, 1));
    var upper = base - (shoulderOffset * bendDir);
    var joint = {
      x: origin.x + (Math.cos(upper) * lenA),
      y: origin.y + (Math.sin(upper) * lenA)
    };
    return {
      joint: joint,
      end: { x: target.x, y: target.y }
    };
  }

  function torsoPoints(center, shoulderW, hipW, torsoH, tilt, facing, root){
    var pts = [
      rotatePoint({ x: -shoulderW * 0.5, y: -torsoH * 0.5 }, tilt),
      rotatePoint({ x: shoulderW * 0.5, y: -torsoH * 0.5 }, tilt),
      rotatePoint({ x: hipW * 0.5, y: torsoH * 0.5 }, tilt),
      rotatePoint({ x: -hipW * 0.5, y: torsoH * 0.5 }, tilt)
    ];
    var i;
    for (i = 0; i < pts.length; i++) {
      pts[i] = localToWorld(root, { x: center.x + pts[i].x, y: center.y + pts[i].y }, facing);
    }
    return pts;
  }

  function buildGroundRig(root, pose, visual, facing, scale){
    var sil = visual.silhouette;
    var torsoCenterLocal = {
      x: (Number(sil.groundTorsoX || -2) * scale) + Number(pose.torsoShiftX || 0),
      y: (Number(sil.groundTorsoY || -6) * scale) + Number(pose.torsoShiftY || 0)
    };
    var headLocal = {
      x: (Number(sil.groundHeadX || -15) * scale) + Number(pose.headShiftX || 0),
      y: (Number(sil.groundHeadY || -9) * scale) + Number(pose.headShiftY || 0)
    };
    var shoulderFrontLocal = {
      x: (Number(sil.groundFrontShoulderX || 5) * scale) + Number(pose.shoulderTwist || 0),
      y: Number(sil.groundFrontShoulderY || -8) * scale
    };
    var shoulderRearLocal = {
      x: (Number(sil.groundRearShoulderX || -7) * scale) - Number(pose.shoulderTwist || 0),
      y: Number(sil.groundRearShoulderY || -8) * scale
    };
    var hipFrontLocal = {
      x: (Number(sil.groundFrontHipX || 6) * scale) + Number(pose.hipTwist || 0),
      y: Number(sil.groundFrontHipY || -4) * scale
    };
    var hipRearLocal = {
      x: (Number(sil.groundRearHipX || -6) * scale) - Number(pose.hipTwist || 0),
      y: Number(sil.groundRearHipY || -4) * scale
    };
    var handFrontLocal = {
      x: Number(sil.groundFrontHandX || 16) * scale,
      y: Number(sil.groundFrontHandY || -2) * scale
    };
    var handRearLocal = {
      x: Number(sil.groundRearHandX || -13) * scale,
      y: Number(sil.groundRearHandY || -3) * scale
    };
    var footFrontLocal = {
      x: Number(sil.groundFrontFootX || 18) * scale,
      y: Number(sil.groundFrontFootY || 1) * scale
    };
    var footRearLocal = {
      x: Number(sil.groundRearFootX || -15) * scale,
      y: Number(sil.groundRearFootY || 1) * scale
    };
    return {
      root: root,
      facing: facing,
      torsoCenter: localToWorld(root, torsoCenterLocal, facing),
      torsoPoints: torsoPoints(torsoCenterLocal, (sil.shoulderW + 6) * scale, (sil.hipW + 5) * scale, 11 * scale, pose.groundAngle || -8, facing, root),
      head: localToWorld(root, headLocal, facing),
      headR: sil.headR * scale,
      rearShoulder: localToWorld(root, shoulderRearLocal, facing),
      frontShoulder: localToWorld(root, shoulderFrontLocal, facing),
      rearHip: localToWorld(root, hipRearLocal, facing),
      frontHip: localToWorld(root, hipFrontLocal, facing),
      rearElbow: localToWorld(root, { x: -10, y: -2 }, facing),
      frontElbow: localToWorld(root, { x: 9, y: -1 }, facing),
      rearKnee: localToWorld(root, { x: -11, y: 0 }, facing),
      frontKnee: localToWorld(root, { x: 10, y: 0 }, facing),
      rearHand: localToWorld(root, handRearLocal, facing),
      frontHand: localToWorld(root, handFrontLocal, facing),
      rearFoot: localToWorld(root, footRearLocal, facing),
      frontFoot: localToWorld(root, footFrontLocal, facing),
      shadow: {
        x: root.x + (facing * -3),
        y: root.y + 2,
        w: (sil.shadowW * scale) + 10,
        h: (sil.shadowH * scale) + 4
      },
      localToWorld: function(local){
        return localToWorld(root, local, facing);
      }
    };
  }

  fighterRig.build = function(renderState, opts){
    var visual = renderState.visual;
    var pose = renderState.pose;
    var sil = visual.silhouette;
    var scale = Math.max(0.9, Number(visual.scale || sil.scale || 1));
    var facing = renderState.fighter && renderState.fighter.facing === -1 ? -1 : 1;
    var presentationOffset = renderState && renderState.presentationOffset ? renderState.presentationOffset : null;
    var root = {
      x: Number(opts && opts.rootX || 0) + Number(presentationOffset && presentationOffset.x || 0),
      y: Number(opts && opts.rootY || 0) + Number(presentationOffset && presentationOffset.y || 0)
    };
    var totalLeg = (sil.upperLeg + sil.lowerLeg) * scale;
    var hipCenterLocal;
    var torsoCenterLocal;
    var headCenterLocal;
    var frontShoulderLocal;
    var rearShoulderLocal;
    var frontHipLocal;
    var rearHipLocal;
    var frontArm;
    var rearArm;
    var frontLeg;
    var rearLeg;
    var contact = renderState && renderState.contact ? renderState.contact : null;
    var contactRole = contact ? String(contact.role || '') : '';
    var contactIntensity = clamp(Number(contact && contact.intensity || 0), 0, 1);
    var phaseName = renderState && renderState.phase ? String(renderState.phase.phase || '') : '';
    var focusPart = String(renderState && renderState.focusPart || '');
    var identityBias = visual && visual.id === 'daikon' ? 1.16 : 0.92;
    var scaledPose = {
      lean: pose.lean * scale,
      rootLift: pose.rootLift * scale,
      crouch: pose.crouch * scale,
      torsoTilt: pose.torsoTilt,
      headTilt: pose.headTilt,
      torsoShiftX: Number(pose.torsoShiftX || 0) * scale,
      torsoShiftY: Number(pose.torsoShiftY || 0) * scale,
      headShiftX: Number(pose.headShiftX || 0) * scale,
      headShiftY: Number(pose.headShiftY || 0) * scale,
      shoulderTwist: Number(pose.shoulderTwist || 0) * scale,
      hipTwist: Number(pose.hipTwist || 0) * scale,
      frontShoulderLift: pose.frontShoulderLift * scale,
      rearShoulderLift: pose.rearShoulderLift * scale,
      frontHipLift: pose.frontHipLift * scale,
      rearHipLift: pose.rearHipLift * scale,
      groundedFlat: pose.groundedFlat,
      groundAngle: pose.groundAngle,
      frontHand: scalePoint(pose.frontHand, scale),
      rearHand: scalePoint(pose.rearHand, scale),
      frontFoot: scalePoint(pose.frontFoot, scale),
      rearFoot: scalePoint(pose.rearFoot, scale)
    };
    if (contactIntensity > 0.01) {
      if (contactRole === 'attacker' || contactRole === 'throw') {
        scaledPose.torsoShiftX += 3.1 * scale * contactIntensity * identityBias;
        scaledPose.headShiftX += 2.6 * scale * contactIntensity * identityBias;
        scaledPose.headShiftY -= 0.9 * scale * contactIntensity;
        scaledPose.shoulderTwist += 3.6 * scale * contactIntensity * identityBias;
        scaledPose.hipTwist += 1.6 * scale * contactIntensity * identityBias;
        scaledPose.frontShoulderLift -= 2.4 * scale * contactIntensity;
        scaledPose.rearShoulderLift += 1.2 * scale * contactIntensity;
        if (focusPart === 'frontHand') {
          scaledPose.rearHand.x -= 4.6 * scale * contactIntensity;
          scaledPose.rearHand.y -= 1.8 * scale * contactIntensity;
          scaledPose.frontHand.y -= 0.8 * scale * contactIntensity;
        } else if (focusPart === 'frontFoot') {
          scaledPose.rearHand.x -= 3.4 * scale * contactIntensity;
          scaledPose.rearHand.y -= 2.3 * scale * contactIntensity;
          scaledPose.frontHand.x -= 1.6 * scale * contactIntensity;
          scaledPose.frontHipLift -= 1.8 * scale * contactIntensity;
          scaledPose.rearHipLift += 1.2 * scale * contactIntensity;
        } else if (focusPart === 'bothHands') {
          scaledPose.rearHand.x += 1.6 * scale * contactIntensity;
          scaledPose.rearHand.y -= 1.4 * scale * contactIntensity;
          scaledPose.frontHand.y -= 1.2 * scale * contactIntensity;
        }
        if (phaseName === 'recovery') {
          scaledPose.torsoShiftX -= 1.2 * scale * contactIntensity;
          scaledPose.headShiftX -= 0.8 * scale * contactIntensity;
          scaledPose.rearHand.x -= 1.4 * scale * contactIntensity;
        }
      } else if (contactRole === 'block') {
        scaledPose.lean -= 1.5 * scale * contactIntensity;
        scaledPose.torsoShiftX -= 4.3 * scale * contactIntensity;
        scaledPose.torsoShiftY += 0.6 * scale * contactIntensity;
        scaledPose.headShiftX -= 5.2 * scale * contactIntensity;
        scaledPose.headShiftY -= 1.5 * scale * contactIntensity;
        scaledPose.shoulderTwist -= 3.2 * scale * contactIntensity;
        scaledPose.hipTwist -= 1.6 * scale * contactIntensity;
        scaledPose.frontShoulderLift -= 3.1 * scale * contactIntensity;
        scaledPose.rearShoulderLift += 2.1 * scale * contactIntensity;
        scaledPose.frontHand.x -= 3.6 * scale * contactIntensity;
        scaledPose.frontHand.y -= 4.6 * scale * contactIntensity;
        scaledPose.rearHand.x += 2.2 * scale * contactIntensity;
        scaledPose.rearHand.y -= 1.8 * scale * contactIntensity;
        if (phaseName === 'recovery') {
          scaledPose.rearHand.x += 1.4 * scale * contactIntensity;
          scaledPose.rearShoulderLift += 0.8 * scale * contactIntensity;
          scaledPose.hipTwist -= 0.6 * scale * contactIntensity;
        }
      } else if (contactRole === 'hit') {
        scaledPose.lean -= 2.1 * scale * contactIntensity;
        scaledPose.torsoShiftX -= 4.8 * scale * contactIntensity;
        scaledPose.torsoShiftY += 1.3 * scale * contactIntensity;
        scaledPose.headShiftX -= 6.2 * scale * contactIntensity;
        scaledPose.headShiftY -= 2.3 * scale * contactIntensity;
        scaledPose.shoulderTwist -= 4 * scale * contactIntensity;
        scaledPose.hipTwist += 2.6 * scale * contactIntensity;
        scaledPose.frontShoulderLift += 2.6 * scale * contactIntensity;
        scaledPose.rearShoulderLift -= 3.2 * scale * contactIntensity;
        scaledPose.frontHand.x -= 4.8 * scale * contactIntensity;
        scaledPose.frontHand.y += 2.2 * scale * contactIntensity;
        scaledPose.rearHand.x -= 5.2 * scale * contactIntensity;
        scaledPose.rearHand.y += 3.4 * scale * contactIntensity;
        scaledPose.rearHipLift += 1.4 * scale * contactIntensity;
        if (phaseName === 'recovery') {
          scaledPose.rearHand.x -= 1.6 * scale * contactIntensity;
          scaledPose.rearShoulderLift -= 0.9 * scale * contactIntensity;
          scaledPose.hipTwist += 0.8 * scale * contactIntensity;
        }
      } else if (contactRole === 'tech') {
        scaledPose.torsoShiftX -= 1.8 * scale * contactIntensity;
        scaledPose.headShiftY -= 1.8 * scale * contactIntensity;
        scaledPose.shoulderTwist += 5.1 * scale * contactIntensity;
        scaledPose.hipTwist -= 2.2 * scale * contactIntensity;
        scaledPose.frontShoulderLift -= 2.4 * scale * contactIntensity;
        scaledPose.rearShoulderLift -= 2.4 * scale * contactIntensity;
        scaledPose.frontHand.x += 2.8 * scale * contactIntensity;
        scaledPose.frontHand.y -= 2.8 * scale * contactIntensity;
        scaledPose.rearHand.x -= 2.8 * scale * contactIntensity;
        scaledPose.rearHand.y -= 2.4 * scale * contactIntensity;
      } else if (contactRole === 'wakeup') {
        scaledPose.torsoShiftX += 2.1 * scale * contactIntensity;
        scaledPose.torsoShiftY -= 1.8 * scale * contactIntensity;
        scaledPose.headShiftY -= 2.2 * scale * contactIntensity;
      } else if (contactRole === 'knockdown') {
        scaledPose.torsoShiftX -= 1.4 * scale * contactIntensity;
        scaledPose.headShiftY += 0.8 * scale * contactIntensity;
      }
    }
    if (pose.groundedFlat || renderState.stateKey === 'knockdown') {
      return buildGroundRig(root, scaledPose, visual, facing, scale);
    }
    hipCenterLocal = {
      x: (scaledPose.lean * 0.35) + (Number(sil.hipCenterX || 0) * scale),
      y: (-totalLeg) + (scaledPose.crouch * 0.65) + scaledPose.rootLift + (Number(sil.hipCenterY || 0) * scale)
    };
    torsoCenterLocal = {
      x: scaledPose.lean + scaledPose.torsoShiftX + (Number(sil.torsoCenterX || 0) * scale),
      y: hipCenterLocal.y - ((sil.torsoH * scale) * 0.5) + (3 * scale) - (scaledPose.crouch * 0.1) + scaledPose.torsoShiftY + (Number(sil.torsoCenterY || 0) * scale)
    };
    headCenterLocal = rotatePoint({
      x: (Number(sil.headOffsetX || 0) * scale) + scaledPose.headShiftX + (scaledPose.torsoShiftX * 0.18),
      y: torsoCenterLocal.y - ((sil.torsoH * scale) * 0.58) - (sil.headR * scale) + scaledPose.headShiftY + (Number(sil.headOffsetY || 0) * scale)
    }, scaledPose.torsoTilt + (scaledPose.headTilt * 0.35));
    frontShoulderLocal = rotatePoint({
      x: torsoCenterLocal.x + (sil.frontShoulderX * scale) + scaledPose.shoulderTwist,
      y: torsoCenterLocal.y - ((sil.torsoH * scale) * 0.3) + scaledPose.frontShoulderLift + (Number(sil.frontShoulderY || 0) * scale)
    }, scaledPose.torsoTilt * 0.25);
    rearShoulderLocal = rotatePoint({
      x: torsoCenterLocal.x + (sil.rearShoulderX * scale) - scaledPose.shoulderTwist,
      y: torsoCenterLocal.y - ((sil.torsoH * scale) * 0.18) + scaledPose.rearShoulderLift + (Number(sil.rearShoulderY || 0) * scale)
    }, scaledPose.torsoTilt * 0.25);
    frontHipLocal = rotatePoint({
      x: hipCenterLocal.x + (sil.frontHipX * scale) + scaledPose.hipTwist,
      y: hipCenterLocal.y + scaledPose.frontHipLift + (Number(sil.frontHipY || 0) * scale)
    }, scaledPose.torsoTilt * 0.15);
    rearHipLocal = rotatePoint({
      x: hipCenterLocal.x + (sil.rearHipX * scale) - scaledPose.hipTwist,
      y: hipCenterLocal.y + scaledPose.rearHipLift + (Number(sil.rearHipY || 0) * scale)
    }, scaledPose.torsoTilt * 0.15);
    frontArm = solveTwoBone(frontShoulderLocal, scaledPose.frontHand, sil.upperArm * scale, sil.lowerArm * scale, -1);
    rearArm = solveTwoBone(rearShoulderLocal, scaledPose.rearHand, sil.upperArm * scale, sil.lowerArm * scale, 1);
    frontLeg = solveTwoBone(frontHipLocal, scaledPose.frontFoot, sil.upperLeg * scale, sil.lowerLeg * scale, 1);
    rearLeg = solveTwoBone(rearHipLocal, scaledPose.rearFoot, sil.upperLeg * scale, sil.lowerLeg * scale, -1);
    return {
      root: root,
      facing: facing,
      torsoCenter: localToWorld(root, torsoCenterLocal, facing),
      torsoPoints: torsoPoints(torsoCenterLocal, sil.shoulderW * scale, sil.hipW * scale, (sil.torsoH * scale) - (scaledPose.crouch * 0.25), scaledPose.torsoTilt, facing, root),
      head: localToWorld(root, headCenterLocal, facing),
      headR: sil.headR * scale,
      frontShoulder: localToWorld(root, frontShoulderLocal, facing),
      rearShoulder: localToWorld(root, rearShoulderLocal, facing),
      frontHip: localToWorld(root, frontHipLocal, facing),
      rearHip: localToWorld(root, rearHipLocal, facing),
      frontElbow: localToWorld(root, frontArm.joint, facing),
      rearElbow: localToWorld(root, rearArm.joint, facing),
      frontHand: localToWorld(root, frontArm.end, facing),
      rearHand: localToWorld(root, rearArm.end, facing),
      frontKnee: localToWorld(root, frontLeg.joint, facing),
      rearKnee: localToWorld(root, rearLeg.joint, facing),
      frontFoot: localToWorld(root, frontLeg.end, facing),
      rearFoot: localToWorld(root, rearLeg.end, facing),
      shadow: {
        x: root.x + (scaledPose.lean * facing * 0.25),
        y: root.y + 1,
        w: (sil.shadowW * scale) + Math.max(0, scaledPose.lean * 0.18),
        h: (sil.shadowH * scale) + Math.max(0, scaledPose.crouch * 0.12)
      },
      localToWorld: function(local){
        return localToWorld(root, local, facing);
      }
    };
  };
})(typeof window !== 'undefined' ? window : this);
