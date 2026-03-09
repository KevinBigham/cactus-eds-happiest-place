(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.data = ns.data || {};
  ns.data.fighters = ns.data.fighters || {};

  ns.data.fighters.ed = {
    id: 'ed',
    name: 'Cactus Ed',
    scale: 1.1,
    palette: {
      outline: 0x081108,
      bodyDark: 0x213d1f,
      bodyMid: 0x4f7c44,
      bodyLight: 0x95c66f,
      bone: 0xe7ddba,
      clothDark: 0x392318,
      clothMid: 0x6c4528,
      clothLight: 0xa67339,
      accent: 0xffa33f,
      smoke: 0xd5d2ca,
      glove: 0xf1e5cb
    },
    silhouette: {
      shoulderW: 20,
      hipW: 13,
      torsoH: 29,
      headR: 6.5,
      neck: 2,
      torsoCenterX: -1,
      torsoCenterY: -1,
      headOffsetX: -1,
      headOffsetY: -1,
      frontShoulderX: 7,
      rearShoulderX: -6,
      frontShoulderY: -1,
      rearShoulderY: 1,
      frontHipX: 5,
      rearHipX: -4,
      frontHipY: 0,
      rearHipY: 1,
      upperArm: 13,
      lowerArm: 13,
      upperLeg: 14,
      lowerLeg: 13,
      armWidth: 3.8,
      forearmWidth: 3.8,
      thighWidth: 5,
      shinWidth: 4,
      handR: 3,
      footW: 7,
      footH: 3,
      shadowW: 30,
      shadowH: 6
    },
    motion: {
      idleBob: 1.1,
      idleRate: 0.09,
      walkRate: 0.22,
      walkStride: 6,
      walkLift: 2,
      heavyLean: 8,
      jumpReach: 10,
      recoil: 7
    },
    closeContact: {
      thresholdPx: 118,
      falloffPx: 52,
      spacingPx: 2.5,
      verticalPx: 1.4,
      neutral: {
        lean: -3,
        torsoTilt: 4,
        headTilt: 2,
        torsoShiftX: -2,
        headShiftX: -2,
        shoulderTwist: 2,
        frontShoulderLift: -3,
        rearShoulderLift: 1,
        frontHand: { x: 9, y: -26 },
        rearHand: { x: -13, y: -26 },
        frontFoot: { x: 7, y: 0 },
        rearFoot: { x: -10, y: 0 }
      },
      attacker: {
        lean: 8,
        torsoTilt: -8,
        headTilt: -5,
        torsoShiftX: 5,
        headShiftX: 3,
        shoulderTwist: 8,
        hipTwist: 2,
        frontShoulderLift: -5,
        rearShoulderLift: 2,
        frontHand: { x: 18, y: -28 },
        rearHand: { x: -4, y: -24 },
        frontFoot: { x: 10, y: -1 },
        rearFoot: { x: -11, y: 0 }
      },
      throw: {
        lean: 6,
        torsoTilt: -11,
        headTilt: -4,
        torsoShiftX: 5,
        headShiftX: 3,
        shoulderTwist: 8,
        hipTwist: 2,
        frontShoulderLift: -6,
        rearShoulderLift: -2,
        frontHand: { x: 16, y: -26 },
        rearHand: { x: 3, y: -22 },
        frontFoot: { x: 9, y: 0 },
        rearFoot: { x: -11, y: 0 }
      },
      defender: {
        lean: -9,
        torsoTilt: 10,
        headTilt: 7,
        torsoShiftX: -5,
        headShiftX: -6,
        headShiftY: -2,
        shoulderTwist: -5,
        hipTwist: 1,
        frontShoulderLift: -6,
        rearShoulderLift: -2,
        frontHand: { x: 11, y: -32 },
        rearHand: { x: -5, y: -25 },
        frontFoot: { x: 3, y: 0 },
        rearFoot: { x: -12, y: 0 }
      },
      block: {
        lean: -11,
        torsoTilt: 15,
        headTilt: 6,
        torsoShiftX: -7,
        headShiftX: -7,
        headShiftY: -3,
        shoulderTwist: -7,
        hipTwist: -3,
        frontShoulderLift: -8,
        rearShoulderLift: -4,
        frontHand: { x: 12, y: -35 },
        rearHand: { x: -4, y: -28 },
        frontFoot: { x: 2, y: 0 },
        rearFoot: { x: -13, y: 0 }
      },
      hit: {
        lean: -14,
        torsoTilt: 19,
        headTilt: 14,
        torsoShiftX: -8,
        torsoShiftY: 1,
        headShiftX: -9,
        headShiftY: -3,
        shoulderTwist: -7,
        hipTwist: 3,
        frontHand: { x: -7, y: -17 },
        rearHand: { x: -22, y: -14 },
        frontFoot: { x: -1, y: 0 },
        rearFoot: { x: -14, y: 0 }
      },
      tech: {
        lean: -5,
        torsoTilt: 10,
        headTilt: 5,
        torsoShiftX: -1,
        headShiftY: -2,
        shoulderTwist: 7,
        hipTwist: -2,
        frontShoulderLift: -8,
        rearShoulderLift: -5,
        frontHand: { x: 14, y: -35 },
        rearHand: { x: -14, y: -31 },
        frontFoot: { x: 5, y: 0 },
        rearFoot: { x: -11, y: 0 }
      },
      wakeup: {
        lean: 10,
        torsoTilt: -15,
        headTilt: -4,
        crouch: 11,
        torsoShiftX: 4,
        torsoShiftY: -2,
        headShiftY: -4,
        shoulderTwist: 2,
        frontHand: { x: 14, y: -18 },
        rearHand: { x: -8, y: -13 },
        frontFoot: { x: 8, y: -2 },
        rearFoot: { x: -10, y: 0 }
      },
      knockdown: {
        groundAngle: -12,
        frontHand: { x: 22, y: -5 },
        rearHand: { x: -17, y: -1 },
        frontFoot: { x: 22, y: 2 },
        rearFoot: { x: -18, y: 1 }
      }
    },
    stance: {
      base: {
        torsoTilt: -4,
        frontShoulderLift: -1,
        rearShoulderLift: 1,
        frontHand: { x: 12, y: -24 },
        rearHand: { x: -11, y: -25 },
        frontFoot: { x: 9, y: 0 },
        rearFoot: { x: -8, y: 0 }
      },
      crouch: {
        lean: 4,
        torsoTilt: 10,
        crouch: 10,
        frontHand: { x: 10, y: -18 },
        rearHand: { x: -12, y: -17 }
      },
      jump: {
        torsoTilt: -11,
        frontHand: { x: 12, y: -32 },
        rearHand: { x: -14, y: -27 }
      },
      block: {
        lean: -5,
        torsoTilt: 8,
        torsoShiftX: -2,
        headShiftX: -2,
        shoulderTwist: -2,
        frontHand: { x: 11, y: -31 },
        rearHand: { x: 1, y: -24 }
      },
      hit: {
        lean: -9,
        torsoTilt: 13,
        headTilt: 10,
        torsoShiftX: -3,
        headShiftX: -4,
        shoulderTwist: -3
      },
      wakeup: {
        lean: 6,
        torsoTilt: -8,
        torsoShiftX: 2,
        headShiftY: -2,
        frontHand: { x: 13, y: -21 },
        rearHand: { x: -6, y: -16 }
      },
      tech: {
        shoulderTwist: 3,
        frontHand: { x: 9, y: -30 },
        rearHand: { x: -7, y: -30 }
      }
    },
    accessories: {
      cigarette: true,
      shoulderSpikes: true,
      ponchoTail: true
    },
    moves: {
      front_throw: {
        clip: 'edReceiptToss',
        overlay: 'throw',
        targetPart: 'bothHands',
        effect: 'receipt',
        supportHand: true,
        lead: 1,
        startupReach: 0.18,
        activeReach: 0.92,
        recoveryReach: 0.42,
        startupLift: 4,
        recoveryLift: 6
      },
      dragon_palm: {
        clip: 'edDragonPalm',
        overlay: 'uppercut',
        targetPart: 'frontHand',
        effect: 'aloe-upper',
        supportHand: true,
        lead: 1,
        startupReach: 0.22,
        activeReach: 1.05,
        recoveryReach: 0.48,
        startupLift: 6,
        recoveryLift: 9
      },
      cactus_wave: {
        clip: 'edCactusWave',
        overlay: 'projectile',
        targetPart: 'frontHand',
        effect: 'cactus-wave',
        supportHand: true,
        lead: 0.86,
        startupReach: 0.26,
        activeReach: 0.92,
        recoveryReach: 0.38,
        startupLift: 5,
        recoveryLift: 7
      },
      debt_lariat: {
        clip: 'edDebtLariat',
        overlay: 'lariat',
        targetPart: 'bothHands',
        effect: 'debt-spin',
        supportHand: true,
        lead: 1,
        startupReach: 0.2,
        activeReach: 0.98,
        recoveryReach: 0.52,
        startupLift: 3,
        recoveryLift: 5
      },
      standing_kick: {
        clip: 'edStandingKick',
        overlay: 'standingKick',
        targetPart: 'frontFoot',
        effect: 'kick-arc',
        lead: 1,
        startupReach: 0.16,
        activeReach: 1.08,
        recoveryReach: 0.48,
        startupLift: 7,
        recoveryLift: 10
      },
      jab: {
        clip: 'edJab',
        overlay: 'jab',
        targetPart: 'frontHand',
        effect: 'jab-line',
        lead: 1,
        startupReach: 0.2,
        activeReach: 1,
        recoveryReach: 0.42,
        startupLift: 4,
        recoveryLift: 6
      },
      low_kick: {
        clip: 'edLowKick',
        overlay: 'lowKick',
        targetPart: 'frontFoot',
        effect: 'low-swipe',
        lead: 1,
        startupReach: 0.14,
        activeReach: 1.02,
        recoveryReach: 0.36,
        startupLift: 4,
        recoveryLift: 8
      },
      jump_kick: {
        clip: 'edJumpKick',
        overlay: 'jumpKick',
        targetPart: 'frontFoot',
        effect: 'jump-arc',
        lead: 1,
        startupReach: 0.2,
        activeReach: 1.04,
        recoveryReach: 0.44,
        startupLift: 5,
        recoveryLift: 9
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
