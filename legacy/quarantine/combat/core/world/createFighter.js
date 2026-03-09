(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.core = ns.core || {};
  ns.core.world = ns.core.world || {};

  function constants(){
    return (ns.core && ns.core.constants) || null;
  }

  function fromPx(v){
    var c = constants();
    if (c && typeof c.fromPx === 'function') return c.fromPx(v);
    if (typeof global._fightFromPx === 'function') return global._fightFromPx(v);
    return Math.round(Number(v || 0) * 256);
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

  function getRoster(rosterKey){
    var roster = global.FIGHT_ROSTER && global.FIGHT_ROSTER[rosterKey];
    if (!roster) throw new Error('combat.createFighter: missing roster [' + String(rosterKey) + ']');
    return roster;
  }

  function createFighter(id, rosterKey, spawnXPx, facing){
    var st = states();
    var roster = getRoster(rosterKey);
    return {
      id: id,
      name: roster.name,
      rosterKey: rosterKey,
      x: fromPx(spawnXPx), y: fromPx(472), vx: 0, vy: 0,
      facing: (facing === -1 ? -1 : 1),
      state: st.IDLE,
      stateFrame: 0,
      moveId: null, moveFrame: 0, moveHitRegistered: false,
      health: roster.maxHealth, maxHealth: roster.maxHealth,
      stunMeter: 0, dizzyFramesLeft: 0,
      hitstunFramesLeft: 0, blockstunFramesLeft: 0, knockdownFramesLeft: 0,
      throwTechFramesLeft: 0, wakeupThrowInvulFramesLeft: 0, invulnFramesLeft: 0, hitFlashFrames: 0,
      charge: { back: 0, down: 0, backReady: 0, downReady: 0 },
      inputHistory: [], inputEdgeHistory: [],
      lastMoveContact: 'none',
      lastParserDecision: { motionType: 'none', moveId: '', rejected: [] },
      prevDir: 5, prevButtons: 0,
      grounded: true,
      boxes: { hurt: [], hit: [], push: [] }
    };
  }

  function resetFighterRound(fighter, spawnXPx, facing){
    if (!fighter) return null;
    var st = states();
    var roster = getRoster(fighter.rosterKey);

    fighter.x = fromPx(spawnXPx);
    fighter.y = fromPx(472);
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.facing = (facing === -1 ? -1 : 1);

    fighter.state = st.IDLE;
    fighter.stateFrame = 0;
    fighter.moveId = null;
    fighter.moveFrame = 0;
    fighter.moveHitRegistered = false;

    fighter.health = roster.maxHealth;
    fighter.maxHealth = roster.maxHealth;
    fighter.stunMeter = 0;
    fighter.dizzyFramesLeft = 0;
    fighter.hitstunFramesLeft = 0;
    fighter.blockstunFramesLeft = 0;
    fighter.knockdownFramesLeft = 0;
    fighter.throwTechFramesLeft = 0;
    fighter.wakeupThrowInvulFramesLeft = 0;
    fighter.invulnFramesLeft = 0;
    fighter.hitFlashFrames = 0;

    fighter.charge = fighter.charge || {};
    fighter.charge.back = 0;
    fighter.charge.down = 0;
    fighter.charge.backReady = 0;
    fighter.charge.downReady = 0;

    fighter.inputHistory = [];
    fighter.inputEdgeHistory = [];
    fighter.lastMoveContact = 'none';
    fighter.lastParserDecision = { motionType: 'none', moveId: '', rejected: [] };
    fighter.prevDir = 5;
    fighter.prevButtons = 0;
    fighter.grounded = true;
    fighter.boxes = { hurt: [], hit: [], push: [] };

    return fighter;
  }

  ns.core.world.createFighter = {
    createFighter: createFighter,
    resetFighterRound: resetFighterRound
  };
})(typeof window !== 'undefined' ? window : this);
