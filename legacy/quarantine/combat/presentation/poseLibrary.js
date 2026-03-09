(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var poseLibrary = ns.presentation.poseLibrary = ns.presentation.poseLibrary || {};

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function clonePoint(p){
    return { x: Number(p && p.x || 0), y: Number(p && p.y || 0) };
  }

  function clonePose(src){
    var out = {
      rootLift: 0,
      lean: 0,
      torsoTilt: 0,
      headTilt: 0,
      crouch: 0,
      torsoShiftX: 0,
      torsoShiftY: 0,
      headShiftX: 0,
      headShiftY: 0,
      shoulderTwist: 0,
      hipTwist: 0,
      frontShoulderLift: 0,
      rearShoulderLift: 0,
      frontHipLift: 0,
      rearHipLift: 0,
      groundedFlat: false,
      groundAngle: 0,
      frontHand: { x: 10, y: -22 },
      rearHand: { x: -8, y: -23 },
      frontFoot: { x: 8, y: 0 },
      rearFoot: { x: -6, y: 0 }
    };
    if (!src) return out;
    out.rootLift = Number(src.rootLift || 0);
    out.lean = Number(src.lean || 0);
    out.torsoTilt = Number(src.torsoTilt || 0);
    out.headTilt = Number(src.headTilt || 0);
    out.crouch = Number(src.crouch || 0);
    out.torsoShiftX = Number(src.torsoShiftX || 0);
    out.torsoShiftY = Number(src.torsoShiftY || 0);
    out.headShiftX = Number(src.headShiftX || 0);
    out.headShiftY = Number(src.headShiftY || 0);
    out.shoulderTwist = Number(src.shoulderTwist || 0);
    out.hipTwist = Number(src.hipTwist || 0);
    out.frontShoulderLift = Number(src.frontShoulderLift || 0);
    out.rearShoulderLift = Number(src.rearShoulderLift || 0);
    out.frontHipLift = Number(src.frontHipLift || 0);
    out.rearHipLift = Number(src.rearHipLift || 0);
    out.groundedFlat = !!src.groundedFlat;
    out.groundAngle = Number(src.groundAngle || 0);
    out.frontHand = clonePoint(src.frontHand || out.frontHand);
    out.rearHand = clonePoint(src.rearHand || out.rearHand);
    out.frontFoot = clonePoint(src.frontFoot || out.frontFoot);
    out.rearFoot = clonePoint(src.rearFoot || out.rearFoot);
    return out;
  }

  function mixNumber(a, b, t){
    return Number(a || 0) + ((Number(b || 0) - Number(a || 0)) * t);
  }

  function mixPoint(a, b, t){
    return {
      x: mixNumber(a && a.x, b && b.x, t),
      y: mixNumber(a && a.y, b && b.y, t)
    };
  }

  function blendPose(a, b, t){
    var w = clamp(Number(t || 0), 0, 1);
    var srcA = clonePose(a);
    var srcB = clonePose(b);
    var out = clonePose(srcA);
    out.rootLift = mixNumber(srcA.rootLift, srcB.rootLift, w);
    out.lean = mixNumber(srcA.lean, srcB.lean, w);
    out.torsoTilt = mixNumber(srcA.torsoTilt, srcB.torsoTilt, w);
    out.headTilt = mixNumber(srcA.headTilt, srcB.headTilt, w);
    out.crouch = mixNumber(srcA.crouch, srcB.crouch, w);
    out.torsoShiftX = mixNumber(srcA.torsoShiftX, srcB.torsoShiftX, w);
    out.torsoShiftY = mixNumber(srcA.torsoShiftY, srcB.torsoShiftY, w);
    out.headShiftX = mixNumber(srcA.headShiftX, srcB.headShiftX, w);
    out.headShiftY = mixNumber(srcA.headShiftY, srcB.headShiftY, w);
    out.shoulderTwist = mixNumber(srcA.shoulderTwist, srcB.shoulderTwist, w);
    out.hipTwist = mixNumber(srcA.hipTwist, srcB.hipTwist, w);
    out.frontShoulderLift = mixNumber(srcA.frontShoulderLift, srcB.frontShoulderLift, w);
    out.rearShoulderLift = mixNumber(srcA.rearShoulderLift, srcB.rearShoulderLift, w);
    out.frontHipLift = mixNumber(srcA.frontHipLift, srcB.frontHipLift, w);
    out.rearHipLift = mixNumber(srcA.rearHipLift, srcB.rearHipLift, w);
    out.frontHand = mixPoint(srcA.frontHand, srcB.frontHand, w);
    out.rearHand = mixPoint(srcA.rearHand, srcB.rearHand, w);
    out.frontFoot = mixPoint(srcA.frontFoot, srcB.frontFoot, w);
    out.rearFoot = mixPoint(srcA.rearFoot, srcB.rearFoot, w);
    out.groundedFlat = srcA.groundedFlat || srcB.groundedFlat;
    out.groundAngle = mixNumber(srcA.groundAngle, srcB.groundAngle, w);
    return out;
  }

  function composePose(base, overlay, weight){
    return blendPose(base, overlay, weight);
  }

  function easeOut(t){
    var c = clamp(Number(t || 0), 0, 1);
    return 1 - Math.pow(1 - c, 2);
  }

  function easeInOut(t){
    var c = clamp(Number(t || 0), 0, 1);
    return c < 0.5 ? (2 * c * c) : (1 - Math.pow(-2 * c + 2, 2) * 0.5);
  }

  function makeClip(startup, active, recovery){
    return {
      startup: clonePose(startup || active || {}),
      active: clonePose(active || startup || {}),
      recovery: clonePose(recovery || {})
    };
  }

  var BASE_POSES = {
    idle: {
      lean: 1,
      torsoTilt: -4,
      headTilt: -1,
      frontHand: { x: 10, y: -23 },
      rearHand: { x: -9, y: -24 },
      frontFoot: { x: 8, y: 0 },
      rearFoot: { x: -8, y: 0 }
    },
    walkA: {
      lean: 4,
      torsoTilt: -7,
      headTilt: -1,
      frontHand: { x: 15, y: -20 },
      rearHand: { x: -13, y: -25 },
      frontFoot: { x: 16, y: 0 },
      rearFoot: { x: -10, y: -3 }
    },
    walkB: {
      lean: -2,
      torsoTilt: 4,
      headTilt: 1,
      frontHand: { x: 8, y: -27 },
      rearHand: { x: -4, y: -18 },
      frontFoot: { x: 5, y: -3 },
      rearFoot: { x: -15, y: 0 }
    },
    crouch: {
      rootLift: 1,
      lean: 4,
      torsoTilt: 11,
      crouch: 13,
      frontHand: { x: 10, y: -17 },
      rearHand: { x: -13, y: -16 },
      frontFoot: { x: 10, y: 0 },
      rearFoot: { x: -8, y: 0 }
    },
    jumpRise: {
      rootLift: -2,
      lean: 2,
      torsoTilt: -11,
      frontHand: { x: 10, y: -31 },
      rearHand: { x: -13, y: -27 },
      frontFoot: { x: 8, y: -10 },
      rearFoot: { x: -7, y: -15 }
    },
    jumpFall: {
      rootLift: -1,
      lean: 2,
      torsoTilt: 2,
      frontHand: { x: 12, y: -23 },
      rearHand: { x: -9, y: -20 },
      frontFoot: { x: 14, y: -4 },
      rearFoot: { x: -6, y: -9 }
    },
    block: {
      lean: -8,
      torsoTilt: 13,
      headTilt: 4,
      torsoShiftX: -4,
      headShiftX: -5,
      headShiftY: -2,
      shoulderTwist: -3,
      hipTwist: -1,
      frontShoulderLift: -5,
      rearShoulderLift: -1,
      frontHand: { x: 11, y: -35 },
      rearHand: { x: -3, y: -26 },
      frontFoot: { x: 3, y: 0 },
      rearFoot: { x: -11, y: 0 }
    },
    hit: {
      lean: -14,
      torsoTilt: 18,
      headTilt: 14,
      torsoShiftX: -6,
      torsoShiftY: 1,
      headShiftX: -7,
      headShiftY: -3,
      shoulderTwist: -5,
      hipTwist: 2,
      frontShoulderLift: 2,
      rearShoulderLift: -4,
      frontHand: { x: -7, y: -18 },
      rearHand: { x: -19, y: -13 },
      frontFoot: { x: 1, y: 0 },
      rearFoot: { x: -13, y: 0 }
    },
    dizzy: {
      lean: 0,
      torsoTilt: 10,
      headTilt: 12,
      frontHand: { x: 12, y: -18 },
      rearHand: { x: -11, y: -16 },
      frontFoot: { x: 8, y: 0 },
      rearFoot: { x: -8, y: 0 }
    },
    wakeup: {
      rootLift: 2,
      lean: 8,
      torsoTilt: -14,
      headTilt: -4,
      crouch: 7,
      torsoShiftX: 4,
      torsoShiftY: -2,
      headShiftY: -4,
      shoulderTwist: 2,
      hipTwist: 1,
      frontHand: { x: 14, y: -18 },
      rearHand: { x: -9, y: -13 },
      frontFoot: { x: 8, y: -3 },
      rearFoot: { x: -10, y: 0 }
    },
    tech: {
      lean: 1,
      torsoTilt: 4,
      headTilt: 3,
      torsoShiftX: 1,
      headShiftY: -1,
      shoulderTwist: 5,
      hipTwist: -2,
      frontShoulderLift: -6,
      rearShoulderLift: -6,
      frontHand: { x: 14, y: -34 },
      rearHand: { x: -13, y: -31 },
      frontFoot: { x: 6, y: 0 },
      rearFoot: { x: -9, y: 0 }
    },
    knockdown: {
      groundedFlat: true,
      groundAngle: -11,
      torsoShiftY: 2,
      headShiftY: 3,
      frontHand: { x: 23, y: -5 },
      rearHand: { x: -18, y: -1 },
      frontFoot: { x: 23, y: 2 },
      rearFoot: { x: -18, y: 1 }
    }
  };

  var MOVE_POSES = {
    jab: {
      lean: 6,
      torsoTilt: -7,
      frontHand: { x: 26, y: -25 },
      rearHand: { x: -2, y: -21 },
      frontFoot: { x: 11, y: 0 },
      rearFoot: { x: -7, y: 0 }
    },
    lowKick: {
      lean: 8,
      torsoTilt: 7,
      crouch: 15,
      frontHand: { x: 11, y: -16 },
      rearHand: { x: -15, y: -16 },
      frontFoot: { x: 24, y: -4 },
      rearFoot: { x: -8, y: 0 }
    },
    standingKick: {
      lean: 5,
      torsoTilt: -6,
      frontHand: { x: 7, y: -24 },
      rearHand: { x: -12, y: -24 },
      frontFoot: { x: 25, y: -18 },
      rearFoot: { x: -8, y: 0 }
    },
    uppercut: {
      lean: 8,
      torsoTilt: -22,
      frontShoulderLift: -5,
      frontHand: { x: 10, y: -56 },
      rearHand: { x: -2, y: -17 },
      frontFoot: { x: 12, y: -6 },
      rearFoot: { x: -9, y: 0 }
    },
    projectile: {
      lean: 4,
      torsoTilt: -6,
      frontHand: { x: 21, y: -24 },
      rearHand: { x: 3, y: -18 },
      frontFoot: { x: 9, y: 0 },
      rearFoot: { x: -9, y: 0 }
    },
    lariat: {
      lean: 10,
      torsoTilt: 2,
      frontHand: { x: 20, y: -24 },
      rearHand: { x: 10, y: -27 },
      frontFoot: { x: 16, y: 0 },
      rearFoot: { x: -3, y: 0 }
    },
    throw: {
      lean: 8,
      torsoTilt: -5,
      frontHand: { x: 18, y: -22 },
      rearHand: { x: 12, y: -20 },
      frontFoot: { x: 12, y: 0 },
      rearFoot: { x: -6, y: 0 }
    },
    axeKick: {
      lean: 6,
      torsoTilt: 8,
      frontHand: { x: 6, y: -21 },
      rearHand: { x: -10, y: -22 },
      frontFoot: { x: 16, y: -26 },
      rearFoot: { x: -7, y: 0 }
    },
    shoulder: {
      lean: 13,
      torsoTilt: 4,
      frontHand: { x: 10, y: -18 },
      rearHand: { x: -2, y: -18 },
      frontFoot: { x: 16, y: 0 },
      rearFoot: { x: -3, y: 0 }
    },
    jumpKick: {
      lean: 5,
      torsoTilt: -10,
      frontHand: { x: 4, y: -30 },
      rearHand: { x: -11, y: -24 },
      frontFoot: { x: 20, y: -20 },
      rearFoot: { x: -5, y: -8 }
    },
    sweep: {
      lean: 7,
      torsoTilt: 7,
      crouch: 14,
      frontHand: { x: 8, y: -16 },
      rearHand: { x: -14, y: -18 },
      frontFoot: { x: 20, y: -2 },
      rearFoot: { x: -7, y: 0 }
    }
  };

  var MOVE_CLIPS = {
    blockBrace: makeClip(
      { lean: -5, torsoTilt: 8, headTilt: 1, torsoShiftX: -2, headShiftX: -2, shoulderTwist: -2, hipTwist: -1, frontShoulderLift: -3, rearShoulderLift: 0, frontHand: { x: 10, y: -29 }, rearHand: { x: -1, y: -25 }, frontFoot: { x: 5, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: -13, torsoTilt: 20, headTilt: 7, torsoShiftX: -8, torsoShiftY: 1, headShiftX: -9, headShiftY: -3, shoulderTwist: -6, hipTwist: -3, frontShoulderLift: -8, rearShoulderLift: -1, frontHand: { x: 14, y: -38 }, rearHand: { x: 1, y: -28 }, frontFoot: { x: 2, y: 0 }, rearFoot: { x: -12, y: 0 } },
      { lean: -7, torsoTilt: 11, headTilt: 3, torsoShiftX: -4, headShiftX: -5, headShiftY: -1, shoulderTwist: -3, hipTwist: -1, frontShoulderLift: -4, rearShoulderLift: 1, frontHand: { x: 10, y: -32 }, rearHand: { x: -1, y: -26 }, frontFoot: { x: 4, y: 0 }, rearFoot: { x: -11, y: 0 } }
    ),
    hitRecoil: makeClip(
      { lean: -9, torsoTilt: 11, headTilt: 8, torsoShiftX: -4, headShiftX: -4, headShiftY: -1, shoulderTwist: -3, hipTwist: 1, frontShoulderLift: 1, rearShoulderLift: -2, frontHand: { x: -3, y: -19 }, rearHand: { x: -14, y: -15 }, frontFoot: { x: 3, y: 0 }, rearFoot: { x: -11, y: 0 } },
      { lean: -20, torsoTilt: 24, headTilt: 19, torsoShiftX: -9, torsoShiftY: 3, headShiftX: -11, headShiftY: -5, shoulderTwist: -7, hipTwist: 4, frontShoulderLift: 4, rearShoulderLift: -6, frontHand: { x: -11, y: -15 }, rearHand: { x: -23, y: -10 }, frontFoot: { x: -1, y: 0 }, rearFoot: { x: -15, y: 0 } },
      { lean: -10, torsoTilt: 13, headTilt: 9, torsoShiftX: -5, torsoShiftY: 1, headShiftX: -6, headShiftY: -2, shoulderTwist: -4, hipTwist: 1, frontHand: { x: -2, y: -18 }, rearHand: { x: -15, y: -13 }, frontFoot: { x: 1, y: 0 }, rearFoot: { x: -12, y: 0 } }
    ),
    techBreak: makeClip(
      { lean: 0, torsoTilt: 2, headTilt: 1, torsoShiftX: 0, shoulderTwist: 5, hipTwist: -1, frontShoulderLift: -6, rearShoulderLift: -5, frontHand: { x: 12, y: -31 }, rearHand: { x: -10, y: -29 }, frontFoot: { x: 6, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: -3, torsoTilt: 10, headTilt: 5, torsoShiftX: -2, headShiftY: -2, shoulderTwist: 9, hipTwist: -4, frontShoulderLift: -9, rearShoulderLift: -7, frontHand: { x: 17, y: -37 }, rearHand: { x: -17, y: -33 }, frontFoot: { x: 3, y: 0 }, rearFoot: { x: -12, y: 0 } },
      { lean: 2, torsoTilt: 2, headTilt: 0, torsoShiftX: 2, headShiftX: 1, shoulderTwist: 1, hipTwist: -1, frontShoulderLift: -3, rearShoulderLift: -2, frontHand: { x: 9, y: -28 }, rearHand: { x: -8, y: -27 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -7, y: 0 } }
    ),
    knockCollapse: makeClip(
      { groundedFlat: true, groundAngle: -8, torsoShiftY: 0, headShiftY: 1, frontHand: { x: 17, y: -7 }, rearHand: { x: -12, y: -2 }, frontFoot: { x: 18, y: 1 }, rearFoot: { x: -14, y: 1 } },
      { groundedFlat: true, groundAngle: -15, torsoShiftY: 3, headShiftY: 5, frontHand: { x: 24, y: -4 }, rearHand: { x: -19, y: 0 }, frontFoot: { x: 24, y: 2 }, rearFoot: { x: -18, y: 2 } },
      { groundedFlat: true, groundAngle: -11, torsoShiftY: 2, headShiftY: 3, frontHand: { x: 22, y: -5 }, rearHand: { x: -18, y: -1 }, frontFoot: { x: 23, y: 2 }, rearFoot: { x: -18, y: 1 } }
    ),
    wakeRise: makeClip(
      { rootLift: 3, lean: 4, torsoTilt: -1, headTilt: 3, crouch: 14, torsoShiftX: 1, torsoShiftY: 3, headShiftY: 2, shoulderTwist: 1, frontShoulderLift: 1, rearShoulderLift: -2, frontHand: { x: 10, y: -14 }, rearHand: { x: -9, y: -10 }, frontFoot: { x: 7, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { rootLift: 1, lean: 9, torsoTilt: -17, headTilt: -4, crouch: 7, torsoShiftX: 6, torsoShiftY: -2, headShiftY: -6, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -3, rearShoulderLift: 2, frontHand: { x: 14, y: -18 }, rearHand: { x: -8, y: -13 }, frontFoot: { x: 8, y: -3 }, rearFoot: { x: -10, y: 0 } },
      { rootLift: 0, lean: 5, torsoTilt: -7, headTilt: -1, crouch: 3, torsoShiftX: 3, torsoShiftY: -1, headShiftY: -2, shoulderTwist: 1, frontShoulderLift: -1, rearShoulderLift: 1, frontHand: { x: 12, y: -20 }, rearHand: { x: -8, y: -16 }, frontFoot: { x: 8, y: -1 }, rearFoot: { x: -9, y: 0 } }
    ),
    confirmArmLead: makeClip(
      { lean: -3, torsoTilt: 7, headTilt: 2, torsoShiftX: -1, shoulderTwist: 3, hipTwist: 1, frontShoulderLift: 2, rearShoulderLift: -1, frontHand: { x: 3, y: -22 }, rearHand: { x: -13, y: -22 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 12, torsoTilt: -12, headTilt: -4, torsoShiftX: 6, headShiftX: 4, shoulderTwist: 7, hipTwist: 2, frontShoulderLift: -5, rearShoulderLift: 2, frontHand: { x: 31, y: -25 }, rearHand: { x: -3, y: -22 }, frontFoot: { x: 13, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 7, torsoTilt: -1, headTilt: -1, torsoShiftX: 3, headShiftX: 2, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: 1, frontHand: { x: 16, y: -22 }, rearHand: { x: -9, y: -24 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    confirmLegLead: makeClip(
      { lean: -2, torsoTilt: 6, headTilt: 1, torsoShiftX: -1, shoulderTwist: 2, hipTwist: 3, frontShoulderLift: 1, rearShoulderLift: -1, frontHand: { x: 8, y: -20 }, rearHand: { x: -14, y: -22 }, frontFoot: { x: 10, y: -4 }, rearFoot: { x: -9, y: 0 } },
      { lean: 11, torsoTilt: 7, headTilt: -2, torsoShiftX: 5, headShiftX: 2, shoulderTwist: 4, hipTwist: 6, frontShoulderLift: 2, rearShoulderLift: 1, frontHand: { x: 10, y: -17 }, rearHand: { x: -14, y: -20 }, frontFoot: { x: 29, y: -16 }, rearFoot: { x: -7, y: 0 } },
      { lean: 5, torsoTilt: 3, headTilt: 0, torsoShiftX: 2, shoulderTwist: 2, hipTwist: 3, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 9, y: -20 }, rearHand: { x: -12, y: -21 }, frontFoot: { x: 15, y: -5 }, rearFoot: { x: -8, y: 0 } }
    ),
    confirmReceive: makeClip(
      { lean: -8, torsoTilt: 11, headTilt: 5, torsoShiftX: -4, headShiftX: -4, shoulderTwist: -2, hipTwist: 1, frontShoulderLift: 1, rearShoulderLift: -2, frontHand: { x: 1, y: -21 }, rearHand: { x: -14, y: -18 }, frontFoot: { x: 3, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: -17, torsoTilt: 21, headTilt: 15, torsoShiftX: -9, torsoShiftY: 2, headShiftX: -10, headShiftY: -4, shoulderTwist: -6, hipTwist: 3, frontShoulderLift: 3, rearShoulderLift: -5, frontHand: { x: -7, y: -16 }, rearHand: { x: -22, y: -11 }, frontFoot: { x: -1, y: 0 }, rearFoot: { x: -14, y: 0 } },
      { lean: -9, torsoTilt: 12, headTilt: 7, torsoShiftX: -5, headShiftX: -6, headShiftY: -1, shoulderTwist: -4, hipTwist: 1, frontShoulderLift: 1, rearShoulderLift: -2, frontHand: { x: -1, y: -18 }, rearHand: { x: -15, y: -14 }, frontFoot: { x: 1, y: 0 }, rearFoot: { x: -11, y: 0 } }
    ),
    throwConnect: makeClip(
      { lean: 2, torsoTilt: 6, headTilt: 1, torsoShiftX: 1, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: -3, frontHand: { x: 8, y: -22 }, rearHand: { x: -1, y: -23 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 13, torsoTilt: -11, headTilt: -2, torsoShiftX: 7, headShiftX: 5, shoulderTwist: 8, hipTwist: 3, frontShoulderLift: -6, rearShoulderLift: -4, frontHand: { x: 22, y: -24 }, rearHand: { x: 16, y: -21 }, frontFoot: { x: 12, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 6, torsoTilt: 2, headTilt: 0, torsoShiftX: 3, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: -1, frontHand: { x: 10, y: -21 }, rearHand: { x: 4, y: -22 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    guardedRecoil: makeClip(
      { lean: 6, torsoTilt: -4, headTilt: -2, torsoShiftX: 3, headShiftX: 1, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: 1, frontHand: { x: 16, y: -23 }, rearHand: { x: -4, y: -23 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 2, torsoTilt: 6, headTilt: 2, torsoShiftX: 1, headShiftX: -2, headShiftY: -1, shoulderTwist: -1, hipTwist: -1, frontShoulderLift: -3, rearShoulderLift: 2, frontHand: { x: 11, y: -26 }, rearHand: { x: -8, y: -23 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 4, torsoTilt: 1, headTilt: 0, torsoShiftX: 2, headShiftX: 0, shoulderTwist: 1, hipTwist: 0, frontShoulderLift: -1, rearShoulderLift: 1, frontHand: { x: 10, y: -23 }, rearHand: { x: -8, y: -24 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    guardRecover: makeClip(
      { lean: -8, torsoTilt: 14, headTilt: 5, torsoShiftX: -5, headShiftX: -5, headShiftY: -1, shoulderTwist: -4, hipTwist: -1, frontShoulderLift: -6, rearShoulderLift: -1, frontHand: { x: 12, y: -34 }, rearHand: { x: 0, y: -26 }, frontFoot: { x: 4, y: 0 }, rearFoot: { x: -11, y: 0 } },
      { lean: -6, torsoTilt: 10, headTilt: 3, torsoShiftX: -4, headShiftX: -4, headShiftY: -1, shoulderTwist: -3, hipTwist: -2, frontShoulderLift: -4, rearShoulderLift: 2, frontHand: { x: 11, y: -31 }, rearHand: { x: -3, y: -26 }, frontFoot: { x: 4, y: 0 }, rearFoot: { x: -11, y: 0 } },
      { lean: -3, torsoTilt: 5, headTilt: 1, torsoShiftX: -2, headShiftX: -2, shoulderTwist: -2, hipTwist: -1, frontShoulderLift: -2, rearShoulderLift: 2, frontHand: { x: 10, y: -28 }, rearHand: { x: -4, y: -25 }, frontFoot: { x: 5, y: 0 }, rearFoot: { x: -10, y: 0 } }
    ),
    hitRecover: makeClip(
      { lean: -14, torsoTilt: 18, headTilt: 12, torsoShiftX: -6, torsoShiftY: 1, headShiftX: -7, headShiftY: -2, shoulderTwist: -5, hipTwist: 2, frontShoulderLift: 2, rearShoulderLift: -4, frontHand: { x: -5, y: -18 }, rearHand: { x: -18, y: -13 }, frontFoot: { x: 1, y: 0 }, rearFoot: { x: -13, y: 0 } },
      { lean: -11, torsoTilt: 13, headTilt: 8, torsoShiftX: -5, torsoShiftY: 1, headShiftX: -6, headShiftY: -2, shoulderTwist: -4, hipTwist: 2, frontShoulderLift: 1, rearShoulderLift: -3, frontHand: { x: -2, y: -19 }, rearHand: { x: -16, y: -15 }, frontFoot: { x: 1, y: 0 }, rearFoot: { x: -12, y: 0 } },
      { lean: -6, torsoTilt: 7, headTilt: 3, torsoShiftX: -3, headShiftX: -3, headShiftY: -1, shoulderTwist: -2, hipTwist: 1, frontShoulderLift: 0, rearShoulderLift: -1, frontHand: { x: 1, y: -21 }, rearHand: { x: -13, y: -18 }, frontFoot: { x: 3, y: 0 }, rearFoot: { x: -11, y: 0 } }
    ),
    attackerSettleArm: makeClip(
      { lean: 10, torsoTilt: -9, headTilt: -3, torsoShiftX: 5, headShiftX: 3, shoulderTwist: 6, hipTwist: 2, frontShoulderLift: -3, rearShoulderLift: 1, frontHand: { x: 24, y: -24 }, rearHand: { x: -5, y: -22 }, frontFoot: { x: 12, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 7, torsoTilt: -4, headTilt: -1, torsoShiftX: 4, headShiftX: 2, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: 1, frontHand: { x: 18, y: -23 }, rearHand: { x: -8, y: -24 }, frontFoot: { x: 11, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 4, torsoTilt: -1, headTilt: 0, torsoShiftX: 2, headShiftX: 1, shoulderTwist: 2, hipTwist: 1, frontShoulderLift: -1, rearShoulderLift: 1, frontHand: { x: 12, y: -22 }, rearHand: { x: -9, y: -24 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    attackerSettleLeg: makeClip(
      { lean: 9, torsoTilt: 6, headTilt: -1, torsoShiftX: 4, headShiftX: 2, shoulderTwist: 3, hipTwist: 5, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 8, y: -18 }, rearHand: { x: -14, y: -20 }, frontFoot: { x: 25, y: -12 }, rearFoot: { x: -7, y: 0 } },
      { lean: 6, torsoTilt: 4, headTilt: 0, torsoShiftX: 3, headShiftX: 1, shoulderTwist: 2, hipTwist: 3, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 8, y: -19 }, rearHand: { x: -13, y: -21 }, frontFoot: { x: 18, y: -7 }, rearFoot: { x: -8, y: 0 } },
      { lean: 3, torsoTilt: 2, headTilt: 0, torsoShiftX: 1, shoulderTwist: 1, hipTwist: 1, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 8, y: -20 }, rearHand: { x: -12, y: -21 }, frontFoot: { x: 12, y: -3 }, rearFoot: { x: -8, y: 0 } }
    ),
    throwBreakRecover: makeClip(
      { lean: -2, torsoTilt: 7, headTilt: 3, torsoShiftX: -1, headShiftX: -1, shoulderTwist: 6, hipTwist: -2, frontShoulderLift: -7, rearShoulderLift: -5, frontHand: { x: 14, y: -35 }, rearHand: { x: -14, y: -31 }, frontFoot: { x: 5, y: 0 }, rearFoot: { x: -11, y: 0 } },
      { lean: 1, torsoTilt: 2, headTilt: 1, torsoShiftX: 1, headShiftX: 0, shoulderTwist: 2, hipTwist: -1, frontShoulderLift: -3, rearShoulderLift: -2, frontHand: { x: 11, y: -29 }, rearHand: { x: -11, y: -28 }, frontFoot: { x: 7, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: -1, torsoTilt: 0, headTilt: 0, torsoShiftX: 0, shoulderTwist: 1, hipTwist: 0, frontShoulderLift: -1, rearShoulderLift: 0, frontHand: { x: 10, y: -26 }, rearHand: { x: -10, y: -26 }, frontFoot: { x: 7, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    throwAftermath: makeClip(
      { lean: 9, torsoTilt: -7, headTilt: -2, torsoShiftX: 5, headShiftX: 2, shoulderTwist: 6, hipTwist: 2, frontShoulderLift: -4, rearShoulderLift: -2, frontHand: { x: 17, y: -23 }, rearHand: { x: 10, y: -21 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 7, torsoTilt: -1, headTilt: 0, torsoShiftX: 3, headShiftX: 1, shoulderTwist: 3, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: -1, frontHand: { x: 12, y: -21 }, rearHand: { x: 5, y: -21 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 4, torsoTilt: 1, headTilt: 0, torsoShiftX: 2, shoulderTwist: 1, hipTwist: 1, frontShoulderLift: -1, rearShoulderLift: 0, frontHand: { x: 10, y: -21 }, rearHand: { x: 2, y: -22 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -8, y: 0 } }
    ),
    throwDump: makeClip(
      { groundedFlat: true, groundAngle: -14, torsoShiftX: -3, torsoShiftY: 3, headShiftY: 4, frontHand: { x: 24, y: -4 }, rearHand: { x: -20, y: 0 }, frontFoot: { x: 24, y: 2 }, rearFoot: { x: -19, y: 2 } },
      { groundedFlat: true, groundAngle: -18, torsoShiftX: -5, torsoShiftY: 4, headShiftY: 6, frontHand: { x: 26, y: -2 }, rearHand: { x: -22, y: 1 }, frontFoot: { x: 26, y: 3 }, rearFoot: { x: -21, y: 2 } },
      { groundedFlat: true, groundAngle: -12, torsoShiftX: -2, torsoShiftY: 2, headShiftY: 4, frontHand: { x: 22, y: -4 }, rearHand: { x: -18, y: 0 }, frontFoot: { x: 22, y: 2 }, rearFoot: { x: -18, y: 1 } }
    ),
    edJab: makeClip(
      { lean: -6, torsoTilt: 10, headTilt: 3, torsoShiftX: -2, headShiftX: -1, shoulderTwist: 3, hipTwist: 1, frontShoulderLift: 3, rearShoulderLift: -3, frontHand: { x: -1, y: -22 }, rearHand: { x: -14, y: -23 }, frontFoot: { x: 7, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 11, torsoTilt: -12, headTilt: -5, torsoShiftX: 5, headShiftX: 3, shoulderTwist: 8, hipTwist: 2, frontShoulderLift: -5, rearShoulderLift: 2, frontHand: { x: 35, y: -26 }, rearHand: { x: -4, y: -22 }, frontFoot: { x: 14, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 6, torsoTilt: -1, headTilt: -1, torsoShiftX: 2, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: 1, frontHand: { x: 13, y: -21 }, rearHand: { x: -10, y: -24 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    edLowKick: makeClip(
      { lean: -3, torsoTilt: 14, crouch: 16, headTilt: 3, torsoShiftX: -1, shoulderTwist: 2, hipTwist: 4, frontShoulderLift: 1, rearShoulderLift: -1, frontHand: { x: 4, y: -18 }, rearHand: { x: -16, y: -13 }, frontFoot: { x: 8, y: -1 }, rearFoot: { x: -9, y: 0 } },
      { lean: 12, torsoTilt: 9, crouch: 18, headTilt: -2, torsoShiftX: 5, headShiftX: 1, shoulderTwist: 3, hipTwist: 7, frontShoulderLift: 2, rearShoulderLift: 1, frontHand: { x: 13, y: -14 }, rearHand: { x: -18, y: -18 }, frontFoot: { x: 33, y: -5 }, rearFoot: { x: -9, y: 0 } },
      { lean: 5, torsoTilt: 9, crouch: 13, headTilt: 1, torsoShiftX: 2, shoulderTwist: 2, hipTwist: 4, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 9, y: -17 }, rearHand: { x: -14, y: -19 }, frontFoot: { x: 13, y: -1 }, rearFoot: { x: -10, y: 0 } }
    ),
    edStandingKick: makeClip(
      { lean: -2, torsoTilt: -2, headTilt: 2, frontHand: { x: 8, y: -21 }, rearHand: { x: -12, y: -25 }, frontFoot: { x: 10, y: -6 }, rearFoot: { x: -9, y: 0 } },
      { lean: 8, torsoTilt: -9, headTilt: -3, frontHand: { x: 7, y: -28 }, rearHand: { x: -13, y: -25 }, frontFoot: { x: 30, y: -22 }, rearFoot: { x: -9, y: 1 } },
      { lean: 3, torsoTilt: 2, headTilt: 1, frontHand: { x: 8, y: -22 }, rearHand: { x: -11, y: -23 }, frontFoot: { x: 12, y: -4 }, rearFoot: { x: -9, y: 0 } }
    ),
    edDragonPalm: makeClip(
      { lean: -2, torsoTilt: 10, frontHand: { x: 3, y: -18 }, rearHand: { x: -10, y: -23 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 9, torsoTilt: -24, frontShoulderLift: -6, frontHand: { x: 10, y: -61 }, rearHand: { x: -2, y: -16 }, frontFoot: { x: 13, y: -7 }, rearFoot: { x: -10, y: 0 } },
      { lean: 3, torsoTilt: -8, frontHand: { x: 14, y: -31 }, rearHand: { x: -5, y: -20 }, frontFoot: { x: 10, y: -2 }, rearFoot: { x: -9, y: 0 } }
    ),
    edCactusWave: makeClip(
      { lean: -1, torsoTilt: -4, frontHand: { x: 6, y: -22 }, rearHand: { x: -10, y: -23 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 4, torsoTilt: -6, frontHand: { x: 22, y: -24 }, rearHand: { x: 4, y: -18 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 1, torsoTilt: 0, frontHand: { x: 12, y: -22 }, rearHand: { x: -4, y: -20 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -8, y: 0 } }
    ),
    edDebtLariat: makeClip(
      { lean: -4, torsoTilt: 8, frontHand: { x: 4, y: -21 }, rearHand: { x: -12, y: -24 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 10, torsoTilt: 4, frontHand: { x: 22, y: -24 }, rearHand: { x: 10, y: -28 }, frontFoot: { x: 18, y: 0 }, rearFoot: { x: -2, y: -1 } },
      { lean: 6, torsoTilt: 6, frontHand: { x: 15, y: -22 }, rearHand: { x: 4, y: -24 }, frontFoot: { x: 11, y: 0 }, rearFoot: { x: -4, y: 0 } }
    ),
    edReceiptToss: makeClip(
      { lean: -2, torsoTilt: 8, headTilt: 2, torsoShiftX: 0, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -3, rearShoulderLift: -4, frontHand: { x: 7, y: -23 }, rearHand: { x: -5, y: -23 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 12, torsoTilt: -14, headTilt: -4, torsoShiftX: 6, headShiftX: 4, shoulderTwist: 9, hipTwist: 3, frontShoulderLift: -8, rearShoulderLift: -5, frontHand: { x: 25, y: -24 }, rearHand: { x: 18, y: -21 }, frontFoot: { x: 11, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 5, torsoTilt: 2, headTilt: 1, torsoShiftX: 2, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -2, rearShoulderLift: -1, frontHand: { x: 12, y: -21 }, rearHand: { x: 2, y: -23 }, frontFoot: { x: 9, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    edJumpKick: makeClip(
      { rootLift: -3, lean: 1, torsoTilt: -12, frontHand: { x: 5, y: -31 }, rearHand: { x: -13, y: -24 }, frontFoot: { x: 10, y: -10 }, rearFoot: { x: -6, y: -16 } },
      { rootLift: -2, lean: 7, torsoTilt: -12, frontHand: { x: 4, y: -27 }, rearHand: { x: -10, y: -23 }, frontFoot: { x: 28, y: -21 }, rearFoot: { x: -2, y: -8 } },
      { rootLift: -1, lean: 2, torsoTilt: -4, frontHand: { x: 7, y: -24 }, rearHand: { x: -9, y: -22 }, frontFoot: { x: 12, y: -10 }, rearFoot: { x: -6, y: -8 } }
    ),
    daikonThornJab: makeClip(
      { lean: -6, torsoTilt: 8, headTilt: 3, torsoShiftX: -2, shoulderTwist: 3, hipTwist: 1, frontShoulderLift: 2, rearShoulderLift: -1, frontHand: { x: 1, y: -22 }, rearHand: { x: -13, y: -21 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 9, torsoTilt: -6, headTilt: -2, torsoShiftX: 6, headShiftX: 2, shoulderTwist: 7, hipTwist: 2, frontShoulderLift: -2, rearShoulderLift: 3, frontHand: { x: 31, y: -24 }, rearHand: { x: -4, y: -21 }, frontFoot: { x: 12, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 6, torsoTilt: 2, headTilt: 1, torsoShiftX: 3, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -1, rearShoulderLift: 1, frontHand: { x: 15, y: -21 }, rearHand: { x: -9, y: -22 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    daikonRootSweep: makeClip(
      { lean: -1, torsoTilt: 10, crouch: 14, frontHand: { x: 5, y: -17 }, rearHand: { x: -14, y: -15 }, frontFoot: { x: 9, y: -1 }, rearFoot: { x: -9, y: 0 } },
      { lean: 7, torsoTilt: 8, crouch: 17, frontHand: { x: 9, y: -16 }, rearHand: { x: -16, y: -16 }, frontFoot: { x: 25, y: -3 }, rearFoot: { x: -8, y: 0 } },
      { lean: 3, torsoTilt: 8, crouch: 13, frontHand: { x: 7, y: -17 }, rearHand: { x: -12, y: -16 }, frontFoot: { x: 15, y: -2 }, rearFoot: { x: -8, y: 0 } }
    ),
    daikonAxeKick: makeClip(
      { lean: -5, torsoTilt: 13, headTilt: 2, torsoShiftX: -1, shoulderTwist: 2, hipTwist: 5, frontShoulderLift: 1, rearShoulderLift: -1, frontHand: { x: 4, y: -19 }, rearHand: { x: -13, y: -21 }, frontFoot: { x: 15, y: -20 }, rearFoot: { x: -8, y: 0 } },
      { lean: 13, torsoTilt: 16, headTilt: -3, torsoShiftX: 6, headShiftX: 2, shoulderTwist: 4, hipTwist: 8, frontShoulderLift: 3, rearShoulderLift: 1, frontHand: { x: 7, y: -16 }, rearHand: { x: -13, y: -20 }, frontFoot: { x: 23, y: -36 }, rearFoot: { x: -7, y: 0 } },
      { lean: 8, torsoTilt: 7, headTilt: 1, torsoShiftX: 3, shoulderTwist: 2, hipTwist: 4, frontShoulderLift: 1, rearShoulderLift: 1, frontHand: { x: 6, y: -21 }, rearHand: { x: -12, y: -20 }, frontFoot: { x: 14, y: -7 }, rearFoot: { x: -8, y: 0 } }
    ),
    daikonInsulinUpper: makeClip(
      { lean: -3, torsoTilt: 12, frontHand: { x: 2, y: -17 }, rearHand: { x: -11, y: -23 }, frontFoot: { x: 7, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 7, torsoTilt: -18, frontShoulderLift: -5, frontHand: { x: 8, y: -56 }, rearHand: { x: -1, y: -16 }, frontFoot: { x: 10, y: -5 }, rearFoot: { x: -11, y: 0 } },
      { lean: 2, torsoTilt: -7, frontHand: { x: 12, y: -31 }, rearHand: { x: -5, y: -19 }, frontFoot: { x: 9, y: -2 }, rearFoot: { x: -9, y: 0 } }
    ),
    daikonMemoBurst: makeClip(
      { lean: -2, torsoTilt: -2, frontHand: { x: 4, y: -22 }, rearHand: { x: -10, y: -22 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -9, y: 0 } },
      { lean: 4, torsoTilt: -4, frontHand: { x: 20, y: -24 }, rearHand: { x: 6, y: -18 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 1, torsoTilt: 1, frontHand: { x: 10, y: -22 }, rearHand: { x: -2, y: -19 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -8, y: 0 } }
    ),
    daikonBrandShoulder: makeClip(
      { lean: -6, torsoTilt: 8, frontHand: { x: 2, y: -18 }, rearHand: { x: -11, y: -19 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -8, y: 0 } },
      { lean: 16, torsoTilt: 6, frontHand: { x: 12, y: -17 }, rearHand: { x: -2, y: -19 }, frontFoot: { x: 20, y: 0 }, rearFoot: { x: -1, y: 0 } },
      { lean: 7, torsoTilt: 5, frontHand: { x: 9, y: -18 }, rearHand: { x: -4, y: -19 }, frontFoot: { x: 12, y: 0 }, rearFoot: { x: -4, y: 0 } }
    ),
    daikonVineThrow: makeClip(
      { lean: -2, torsoTilt: 6, headTilt: 2, torsoShiftX: 0, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -1, rearShoulderLift: -4, frontHand: { x: 7, y: -21 }, rearHand: { x: -4, y: -22 }, frontFoot: { x: 8, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 13, torsoTilt: -9, headTilt: -2, torsoShiftX: 6, headShiftX: 3, shoulderTwist: 8, hipTwist: 3, frontShoulderLift: -5, rearShoulderLift: -5, frontHand: { x: 24, y: -23 }, rearHand: { x: 19, y: -21 }, frontFoot: { x: 11, y: 0 }, rearFoot: { x: -10, y: 0 } },
      { lean: 8, torsoTilt: 3, headTilt: 1, torsoShiftX: 3, shoulderTwist: 4, hipTwist: 1, frontShoulderLift: -1, rearShoulderLift: -2, frontHand: { x: 13, y: -20 }, rearHand: { x: 4, y: -22 }, frontFoot: { x: 10, y: 0 }, rearFoot: { x: -9, y: 0 } }
    ),
    daikonJumpDrop: makeClip(
      { rootLift: -3, lean: 1, torsoTilt: -8, frontHand: { x: 5, y: -28 }, rearHand: { x: -12, y: -24 }, frontFoot: { x: 10, y: -12 }, rearFoot: { x: -7, y: -15 } },
      { rootLift: -1, lean: 6, torsoTilt: 3, frontHand: { x: 6, y: -24 }, rearHand: { x: -10, y: -22 }, frontFoot: { x: 23, y: -20 }, rearFoot: { x: -2, y: -4 } },
      { rootLift: 0, lean: 2, torsoTilt: 1, frontHand: { x: 7, y: -22 }, rearHand: { x: -8, y: -19 }, frontFoot: { x: 12, y: -8 }, rearFoot: { x: -6, y: -5 } }
    )
  };

  function poseByName(name){
    var key = String(name || 'idle');
    if (key === 'jump') key = 'jumpRise';
    if (key === 'blockstun') key = 'block';
    if (key === 'hitstun') key = 'hit';
    return clonePose(BASE_POSES[key] || BASE_POSES.idle);
  }

  function moveByName(name){
    var key = String(name || '');
    if (MOVE_CLIPS[key] && MOVE_CLIPS[key].active) return clonePose(MOVE_CLIPS[key].active);
    return clonePose(MOVE_POSES[key] || BASE_POSES.idle);
  }

  function clipByName(name){
    var key = String(name || '');
    return MOVE_CLIPS[key] || null;
  }

  function sampleClip(basePose, name, phaseInfo){
    var clip = clipByName(name);
    var base = clonePose(basePose);
    var phase = phaseInfo && phaseInfo.phase ? phaseInfo.phase : 'startup';
    var t = clamp(phaseInfo && phaseInfo.phaseT !== undefined ? phaseInfo.phaseT : (phaseInfo && phaseInfo.t !== undefined ? phaseInfo.t : 0), 0, 1);
    if (!clip) return composePose(base, moveByName(name), t);
    if (phase === 'startup') return blendPose(base, clip.startup || clip.active || base, easeInOut(t));
    if (phase === 'active') return blendPose(clip.startup || base, clip.active || clip.startup || base, easeOut(t));
    if (phase === 'recovery') return blendPose(clip.active || clip.startup || base, clip.recovery || base, easeInOut(t));
    return blendPose(base, clip.active || base, t);
  }

  function walkPose(frame, motion){
    var rate = motion && motion.walkRate ? Number(motion.walkRate) : 0.2;
    var phase = (Math.sin(Number(frame || 0) * rate) + 1) * 0.5;
    var pose = blendPose(BASE_POSES.walkA, BASE_POSES.walkB, phase);
    if (motion && motion.walkLift) {
      pose.rootLift += Math.sin(Number(frame || 0) * rate * 2) * Number(motion.walkLift || 0) * 0.18;
    }
    return pose;
  }

  poseLibrary.clonePose = clonePose;
  poseLibrary.poseByName = poseByName;
  poseLibrary.moveByName = moveByName;
  poseLibrary.clipByName = clipByName;
  poseLibrary.sampleClip = sampleClip;
  poseLibrary.walkPose = walkPose;
  poseLibrary.blendPose = blendPose;
  poseLibrary.composePose = composePose;
  poseLibrary.easeOut = easeOut;
  poseLibrary.easeInOut = easeInOut;
  poseLibrary.clamp = clamp;
})(typeof window !== 'undefined' ? window : this);
