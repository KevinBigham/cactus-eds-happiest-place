(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.api = ns.api || {};

  function resolveConfig() {
    if (typeof global._fightResolveModeBalance === 'function') {
      return global._fightResolveModeBalance();
    }
    return (global.BALANCE && global.BALANCE.fight) || {};
  }

  function create(opts) {
    var options = opts || {};
    var legacyEngine = options.legacyEngine || global.__FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE_LEGACY || global.FIGHT_ENGINE;
    if (legacyEngine && legacyEngine.__isAdapter && legacyEngine.__legacy) {
      legacyEngine = legacyEngine.__legacy;
    }

    var worldCreate = ns.core.world.createWorld;
    var worldSnap = ns.core.world.snapshot;
    var worldHash = ns.core.world.hash;
    var simStep = ns.core.sim.step;
    var socd = ns.core.input.socd;
    var motionParser = ns.core.input.motionParser;

    function resolveInputProfile(ctx){
      var c = ctx || {};
      return String(c.profile || c.inputProfile || 'legacy').toLowerCase();
    }

    var api = {
      createWorld: function(seedOrOpts, config) {
        if (seedOrOpts && typeof seedOrOpts === 'object' && !Array.isArray(seedOrOpts)) {
          var o = seedOrOpts;
          var seed = (o.seed === undefined || o.seed === null) ? 1337 : o.seed;
          var cfg = o.config || {};
          if (o.useLegacyCreate) cfg.__legacyCreate = true;
          return worldCreate.createWorld(seed, cfg, legacyEngine);
        }
        return worldCreate.createWorld(seedOrOpts, config || {}, legacyEngine);
      },
      step: function(world, frameInputs) {
        return simStep.step(world, frameInputs, legacyEngine);
      },
      snapshot: function(world) {
        return worldSnap.snapshot(world, legacyEngine);
      },
      restore: function(world, snap) {
        return worldSnap.restore(world, snap, legacyEngine);
      },
      stateHash: function(world) {
        return worldHash.stateHash(world, legacyEngine);
      },
      serialize: function(world) {
        return worldSnap.serialize(world, legacyEngine);
      },
      runInputLog: function(world, log, maxFrames, optsIn) {
        return simStep.runInputLog(world, log, maxFrames, optsIn || {}, legacyEngine);
      },

      buildDirection: function(rawInput, facing, socdConfig) {
        return socd.buildDirection(rawInput, facing, socdConfig);
      },
      buildInput: function(rawInput, ctx) {
        var c = ctx || {};
        var facing = (c.facing === -1) ? -1 : 1;
        var socdCfg = c.socdConfig || c.socdPolicy || resolveConfig().socd || {};
        var profile = resolveInputProfile(c);
        var inRaw = rawInput || {};
        var throwPressed = !!inRaw.throwBtn;
        if (profile === 'accessibility' && !throwPressed) {
          throwPressed = !!(inRaw.punch && inRaw.kick);
        }
        return {
          dir: socd.buildDirection(inRaw, facing, socdCfg),
          buttons: (inRaw.punch ? 1 : 0) |
                   (inRaw.kick ? 2 : 0) |
                   (throwPressed ? 4 : 0)
        };
      },
      normalizeFrameInput: function(rawFrameInput, ctx) {
        var rf = rawFrameInput || {};
        var c = ctx || {};
        var p1Facing = c.p1Facing || 1;
        var p2Facing = c.p2Facing || -1;
        return {
          p1: api.buildInput(rf.p1 || {}, { facing: p1Facing, socdConfig: c.socdConfig }),
          p2: api.buildInput(rf.p2 || {}, { facing: p2Facing, socdConfig: c.socdConfig })
        };
      },
      parseMotion: function(history, moveDef) {
        var cfg = resolveConfig();
        return motionParser.parseWithShortcuts(history, moveDef, cfg);
      },

      loadRuleset: function(defOrId) {
        var id = (typeof defOrId === 'string') ? defOrId : ((defOrId && defOrId.id) || 'inline_ruleset');
        return { ok: true, rulesetId: id, errors: [] };
      },
      loadCharacter: function(defOrId) {
        var id = (typeof defOrId === 'string') ? defOrId : ((defOrId && defOrId.id) || 'inline_character');
        return { ok: true, characterId: id, errors: [] };
      },
      loadStage: function(defOrId) {
        var id = (typeof defOrId === 'string') ? defOrId : ((defOrId && defOrId.id) || 'inline_stage');
        return { ok: true, stageId: id, errors: [] };
      },
      query: function(world, querySpec) {
        var q = querySpec || {};
        if (q.type === 'fighter' && q.fighterId && world && world.fighters) {
          return world.fighters[q.fighterId] || null;
        }
        if (q.type === 'telemetry' && world && world.l15Stats) {
          return world.l15Stats;
        }
        return null;
      },

      debug: {
        stateDigest: function(world) {
          return worldHash.stateDigest(world);
        },
        diffDigest: function(a, b) {
          return worldHash.diffDigest(a, b);
        },
        runInputLog: function(world, log, maxFrames, optsIn) {
          return simStep.runInputLog(world, log, maxFrames, optsIn || {}, legacyEngine);
        },
        runDeterminism: function(log, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runDeterminism) {
            return { ok: false, error: 'determinism-tool-unavailable' };
          }
          return det.runDeterminism(api, log, optsIn || {});
        },
        runLifecycleParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runLifecycleParityAssert) {
            return { ok: false, error: 'lifecycle-parity-tool-unavailable' };
          }
          return det.runLifecycleParityAssert(log, seed, frames, optsIn || {});
        },
        runStepShellParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runStepShellParityAssert) {
            return { ok: false, error: 'step-shell-parity-tool-unavailable' };
          }
          return det.runStepShellParityAssert(log, seed, frames, optsIn || {});
        },
        runCombatBodyParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runCombatBodyParityAssert) {
            return { ok: false, error: 'combat-body-parity-tool-unavailable' };
          }
          return det.runCombatBodyParityAssert(log, seed, frames, optsIn || {});
        },
        runGeometryParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runGeometryParityAssert) {
            return { ok: false, error: 'geometry-parity-tool-unavailable' };
          }
          return det.runGeometryParityAssert(log, seed, frames, optsIn || {});
        },
        runFighterParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runFighterParityAssert) {
            return { ok: false, error: 'fighter-parity-tool-unavailable' };
          }
          return det.runFighterParityAssert(log, seed, frames, optsIn || {});
        },
        runMoveBridgeParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runMoveBridgeParityAssert) {
            return { ok: false, error: 'move-bridge-parity-tool-unavailable' };
          }
          return det.runMoveBridgeParityAssert(log, seed, frames, optsIn || {});
        },
        runStrikeBridgeParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runStrikeBridgeParityAssert) {
            return { ok: false, error: 'strike-bridge-parity-tool-unavailable' };
          }
          return det.runStrikeBridgeParityAssert(log, seed, frames, optsIn || {});
        },
        runExchangeParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runExchangeParityAssert) {
            return { ok: false, error: 'exchange-parity-tool-unavailable' };
          }
          return det.runExchangeParityAssert(log, seed, frames, optsIn || {});
        },
        runThrowParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runThrowParityAssert) {
            return { ok: false, error: 'throw-parity-tool-unavailable' };
          }
          return det.runThrowParityAssert(log, seed, frames, optsIn || {});
        },
        runHitstopParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runHitstopParityAssert) {
            return { ok: false, error: 'hitstop-parity-tool-unavailable' };
          }
          return det.runHitstopParityAssert(log, seed, frames, optsIn || {});
        },
        runConsequenceHelperParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runConsequenceHelperParityAssert) {
            return { ok: false, error: 'consequence-helper-parity-tool-unavailable' };
          }
          return det.runConsequenceHelperParityAssert(log, seed, frames, optsIn || {});
        },
        runDialComboHelperParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runDialComboHelperParityAssert) {
            return { ok: false, error: 'dial-combo-helper-parity-tool-unavailable' };
          }
          return det.runDialComboHelperParityAssert(log, seed, frames, optsIn || {});
        },
        runTelemetryHelperParityAssert: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runTelemetryHelperParityAssert) {
            return { ok: false, error: 'telemetry-helper-parity-tool-unavailable' };
          }
          return det.runTelemetryHelperParityAssert(log, seed, frames, optsIn || {});
        },
        runDependencyAudit: function(log, seed, frames, optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runDependencyAudit) {
            return { ok: false, error: 'dependency-audit-tool-unavailable' };
          }
          return det.runDependencyAudit(log, seed, frames, optsIn || {});
        },
        exportAuditBundle: function(optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.exportAuditBundle) {
            return { ok: false, error: 'audit-bundle-tool-unavailable' };
          }
          return det.exportAuditBundle(api, optsIn || {});
        },
        runQuickSmoke: function(optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runQuickSmoke) {
            return { ok: false, error: 'quick-smoke-tool-unavailable' };
          }
          return det.runQuickSmoke(api, optsIn || {});
        },
        runFullAudit: function(optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runFullAudit) {
            return { ok: false, error: 'full-audit-tool-unavailable' };
          }
          return det.runFullAudit(api, optsIn || {});
        },
        runCombatFocusAudit: function(optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.runCombatFocusAudit) {
            return { ok: false, error: 'combat-focus-audit-tool-unavailable' };
          }
          return det.runCombatFocusAudit(api, optsIn || {});
        },
        exportBalanceSnapshot: function(optsIn) {
          var det = ns.tools && ns.tools.determinism;
          if (!det || !det.exportBalanceSnapshot) {
            return { ok: false, error: 'balance-snapshot-tool-unavailable' };
          }
          return det.exportBalanceSnapshot(api, optsIn || {});
        }
      },

      __legacy: legacyEngine,
      __isAdapter: false,
      __source: 'cehp-combat-pass22'
    };

    return api;
  }

  ns.api.CombatEngine = {
    create: create
  };
})(typeof window !== 'undefined' ? window : this);
