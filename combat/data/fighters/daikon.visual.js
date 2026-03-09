(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.data = ns.data || {};
  ns.data.fighters = ns.data.fighters || {};

  ns.data.fighters.daikon = {
    id: 'daikon',
    name: 'Daikon Lord',
    scale: 1.14,
    palette: {
      outline: 0x121014,
      bodyDark: 0x574d45,
      bodyMid: 0xc5b8a1,
      bodyLight: 0xf3ecd9,
      leafDark: 0x345338,
      leafMid: 0x5f8d56,
      leafLight: 0x9bcf8c,
      bruiser: 0x7c6cb0,
      root: 0x9a734f,
      accent: 0xb18bff
    },
    silhouette: {
      shoulderW: 25,
      hipW: 16,
      torsoH: 32,
      headR: 7.5,
      neck: 2,
      torsoCenterX: -2,
      torsoCenterY: 1,
      headOffsetX: 0,
      headOffsetY: 0,
      frontShoulderX: 8,
      rearShoulderX: -7,
      frontShoulderY: -2,
      rearShoulderY: 0,
      frontHipX: 5,
      rearHipX: -5,
      frontHipY: 1,
      rearHipY: 1,
      upperArm: 14,
      lowerArm: 13,
      upperLeg: 15,
      lowerLeg: 14,
      armWidth: 5,
      forearmWidth: 5,
      thighWidth: 6.4,
      shinWidth: 5,
      handR: 3,
      footW: 8.5,
      footH: 4,
      shadowW: 34,
      shadowH: 7
    },
    motion: {
      idleBob: 0.7,
      idleRate: 0.07,
      walkRate: 0.18,
      walkStride: 5,
      walkLift: 1,
      heavyLean: 11,
      jumpReach: 8,
      recoil: 9
    },
    closeContact: {
      thresholdPx: 122,
      falloffPx: 56,
      spacingPx: 3.1,
      verticalPx: 1.2,
      neutral: {
        lean: 4,
        torsoTilt: 0,
        headTilt: 1,
        torsoShiftX: 2,
        shoulderTwist: 2,
        frontShoulderLift: -1,
        rearShoulderLift: 2,
        frontHand: { x: 9, y: -22 },
        rearHand: { x: -12, y: -24 },
        frontFoot: { x: 9, y: 0 },
        rearFoot: { x: -9, y: 0 }
      },
      attacker: {
        lean: 12,
        torsoTilt: 8,
        headTilt: -2,
        torsoShiftX: 6,
        headShiftX: 2,
        shoulderTwist: 5,
        hipTwist: 4,
        frontShoulderLift: 2,
        rearShoulderLift: 3,
        frontHand: { x: 16, y: -21 },
        rearHand: { x: -7, y: -22 },
        frontFoot: { x: 10, y: 0 },
        rearFoot: { x: -11, y: 0 }
      },
      throw: {
        lean: 11,
        torsoTilt: 5,
        headTilt: -1,
        torsoShiftX: 6,
        headShiftX: 2,
        shoulderTwist: 6,
        hipTwist: 3,
        frontShoulderLift: 0,
        rearShoulderLift: 2,
        frontHand: { x: 17, y: -22 },
        rearHand: { x: 5, y: -19 },
        frontFoot: { x: 10, y: 0 },
        rearFoot: { x: -10, y: 0 }
      },
      defender: {
        lean: -7,
        torsoTilt: 9,
        headTilt: 6,
        torsoShiftX: -4,
        headShiftX: -5,
        headShiftY: -2,
        shoulderTwist: -4,
        hipTwist: 1,
        frontShoulderLift: -4,
        rearShoulderLift: -1,
        frontHand: { x: 10, y: -31 },
        rearHand: { x: -5, y: -24 },
        frontFoot: { x: 4, y: 0 },
        rearFoot: { x: -10, y: 0 }
      },
      block: {
        lean: -9,
        torsoTilt: 12,
        headTilt: 5,
        torsoShiftX: -5,
        headShiftX: -6,
        headShiftY: -2,
        shoulderTwist: -5,
        hipTwist: -2,
        frontShoulderLift: -5,
        rearShoulderLift: -3,
        frontHand: { x: 11, y: -34 },
        rearHand: { x: -3, y: -26 },
        frontFoot: { x: 3, y: 0 },
        rearFoot: { x: -12, y: 0 }
      },
      hit: {
        lean: -16,
        torsoTilt: 17,
        headTilt: 11,
        torsoShiftX: -9,
        torsoShiftY: 1,
        headShiftX: -8,
        headShiftY: -3,
        shoulderTwist: -6,
        hipTwist: 3,
        frontHand: { x: -5, y: -17 },
        rearHand: { x: -21, y: -13 },
        frontFoot: { x: -1, y: 0 },
        rearFoot: { x: -15, y: 0 }
      },
      tech: {
        lean: 5,
        torsoTilt: -5,
        headTilt: 4,
        torsoShiftX: 2,
        headShiftY: -2,
        shoulderTwist: 6,
        hipTwist: -2,
        frontShoulderLift: -7,
        rearShoulderLift: -4,
        frontHand: { x: 16, y: -34 },
        rearHand: { x: -13, y: -31 },
        frontFoot: { x: 6, y: 0 },
        rearFoot: { x: -11, y: 0 }
      },
      wakeup: {
        lean: 7,
        torsoTilt: -11,
        headTilt: -3,
        crouch: 9,
        torsoShiftX: 3,
        torsoShiftY: -2,
        headShiftY: -3,
        shoulderTwist: 2,
        frontHand: { x: 12, y: -18 },
        rearHand: { x: -8, y: -14 },
        frontFoot: { x: 7, y: -1 },
        rearFoot: { x: -10, y: 0 }
      },
      knockdown: {
        groundAngle: -8,
        frontHand: { x: 23, y: -4 },
        rearHand: { x: -18, y: -1 },
        frontFoot: { x: 23, y: 2 },
        rearFoot: { x: -18, y: 1 }
      }
    },
    stance: {
      base: {
        lean: 1,
        torsoTilt: -1,
        frontShoulderLift: -1,
        rearShoulderLift: 1,
        frontHand: { x: 10, y: -22 },
        rearHand: { x: -10, y: -24 },
        frontFoot: { x: 8, y: 0 },
        rearFoot: { x: -8, y: 0 }
      },
      crouch: {
        lean: 2,
        torsoTilt: 8,
        crouch: 12,
        frontHand: { x: 8, y: -17 },
        rearHand: { x: -12, y: -16 }
      },
      jump: {
        torsoTilt: -6,
        frontHand: { x: 9, y: -29 },
        rearHand: { x: -13, y: -25 }
      },
      block: {
        lean: -4,
        torsoTilt: 7,
        torsoShiftX: -2,
        headShiftX: -2,
        shoulderTwist: -1,
        frontHand: { x: 10, y: -30 },
        rearHand: { x: 0, y: -24 }
      },
      hit: {
        lean: -8,
        torsoTilt: 11,
        headTilt: 9,
        torsoShiftX: -3,
        headShiftX: -4,
        shoulderTwist: -2
      },
      wakeup: {
        lean: 4,
        torsoTilt: -6,
        torsoShiftX: 2,
        headShiftY: -2,
        frontHand: { x: 11, y: -20 },
        rearHand: { x: -7, y: -16 }
      },
      tech: {
        shoulderTwist: 3,
        frontHand: { x: 8, y: -29 },
        rearHand: { x: -8, y: -29 }
      }
    },
    accessories: {
      leafCrown: true,
      rootBeard: true,
      shoulderLeaf: true
    },
    moves: {
      vine_throw: {
        clip: 'daikonVineThrow',
        overlay: 'throw',
        targetPart: 'bothHands',
        effect: 'vine-grab',
        supportHand: true,
        lead: 1,
        startupReach: 0.18,
        activeReach: 0.96,
        recoveryReach: 0.46,
        startupLift: 4,
        recoveryLift: 7
      },
      insulin_upper: {
        clip: 'daikonInsulinUpper',
        overlay: 'uppercut',
        targetPart: 'frontHand',
        effect: 'root-upper',
        supportHand: true,
        lead: 1,
        startupReach: 0.22,
        activeReach: 1.02,
        recoveryReach: 0.48,
        startupLift: 6,
        recoveryLift: 9
      },
      memo_burst: {
        clip: 'daikonMemoBurst',
        overlay: 'projectile',
        targetPart: 'frontHand',
        effect: 'memo-burst',
        supportHand: true,
        lead: 0.8,
        startupReach: 0.24,
        activeReach: 0.94,
        recoveryReach: 0.38,
        startupLift: 5,
        recoveryLift: 7
      },
      brand_shoulder: {
        clip: 'daikonBrandShoulder',
        overlay: 'shoulder',
        targetPart: 'torso',
        effect: 'brand-drive',
        supportHand: true,
        lead: 1,
        startupReach: 0.18,
        activeReach: 0.92,
        recoveryReach: 0.54,
        startupLift: 3,
        recoveryLift: 5
      },
      axe_kick: {
        clip: 'daikonAxeKick',
        overlay: 'axeKick',
        targetPart: 'frontFoot',
        effect: 'axe-fall',
        lead: 1,
        startupReach: 0.16,
        activeReach: 1.08,
        recoveryReach: 0.46,
        startupLift: 8,
        recoveryLift: 10
      },
      thorn_jab: {
        clip: 'daikonThornJab',
        overlay: 'jab',
        targetPart: 'frontHand',
        effect: 'thorn-jab',
        lead: 1,
        startupReach: 0.18,
        activeReach: 0.98,
        recoveryReach: 0.42,
        startupLift: 4,
        recoveryLift: 6
      },
      root_sweep: {
        clip: 'daikonRootSweep',
        overlay: 'sweep',
        targetPart: 'frontFoot',
        effect: 'root-sweep',
        lead: 1,
        startupReach: 0.14,
        activeReach: 1.04,
        recoveryReach: 0.38,
        startupLift: 4,
        recoveryLift: 8
      },
      jump_drop: {
        clip: 'daikonJumpDrop',
        overlay: 'jumpKick',
        targetPart: 'frontFoot',
        effect: 'jump-drop',
        lead: 1,
        startupReach: 0.18,
        activeReach: 1.04,
        recoveryReach: 0.46,
        startupLift: 6,
        recoveryLift: 10
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
