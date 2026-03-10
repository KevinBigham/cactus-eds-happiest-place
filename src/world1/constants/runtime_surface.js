(function(root){
  var ns = root.CEHP_WORLD1_RUNTIME_SURFACE || {};

  ns.GFX_BASELINE_SHOT_NAMES = [
    'title_full','idle_backdrop','apex_jump','dash_occluder','cave_lightshaft',
    'water_strip','hit_confirm','parallax_vista','hud_overlay','notification_event'
  ];

  ns.SCENE_KEYS = {
    boot:'Boot', title:'Title',
    worldMap:'WorldMap', worldMap2:'WorldMap2', worldMap3:'WorldMap3', worldMap4:'WorldMap4', worldMap5:'WorldMap5', worldMap6:'WorldMap6',
    level11:'Level11', level12:'Level12', level13:'Level13', level14:'Level14', level15:'Level15', level15CombatLab:'Level15CombatLab', levelVoid:'LevelVoid',
    level21:'Level21', level22:'Level22', level23:'Level23', level24:'Level24',
    level31:'Level31', level32:'Level32', level33:'Level33', level34:'Level34', level35:'Level35', level36:'Level36',
    level41:'Level41', level42:'Level42', level43:'Level43', level44:'Level44', level45:'Level45', level46:'Level46',
    level51:'Level51', level52:'Level52', level53:'Level53', level54:'Level54', level55:'Level55', level56:'Level56',
    level61:'Level61', level62:'Level62', level63:'Level63', level64:'Level64',
    handtowel:'HandtowelScene', mochiQueen:'MochiQueenScene', insulin:'InsulinAdmiralScene', rasta:'RastaCorpBossScene',
    catDemocracy:'CatDemocracy', fzero:'FZero', infiniteBus:'InfiniteBus',
    mainModeFeelLab:'MainModeFeelLab', mainModeSlice:'MainModeSlice', mainModeMomentumLab:'MainModeMomentumLab', mainModeRaymanLab:'MainModeRaymanLab', mainModeContraLab:'MainModeContraLab', mainModeMegaManEncounterLab:'MainModeMegaManEncounterLab', mainModeDkcBackgroundLab:'MainModeDkcBackgroundLab', visualLab:'VisualLab', level15AtmosLab:'Level15AtmosLab',
    mochiSmash:'MochiSmash', slotMachine:'SlotMachine', scratch:'Scratch', nuclearQuiz:'NuclearQuiz', ghostDodge:'GhostDodge',
    cigSales:'CigSales', epilogue:'LHCEpilogue', darkEpilogue:'DarkEpilogue',
    commercial:'CommercialBreak', rastaAd:'RastaCorpAd',
    saveManager:'SaveManager', journal:'Journal', achievementsBoard:'AchievementsBoard', fzeroResults:'FZeroResults', fzeroGhostLab:'FZeroGhostLab'
  };

  ns.BEAT_KEYS = {
    w11:'1-1', w12:'1-2', w13:'1-3', w14:'1-4', w15:'1-5',
    w21:'2-1', w22:'2-2', w23:'2-3', w24:'2-4',
    w31:'3-1', w32:'3-2', w33:'3-3', w34:'3-4', w35:'3-5', w36:'3-6',
    w41:'4-1', w42:'4-2', w43:'4-3', w44:'4-4', w45:'4-5', w46:'4-6',
    w51:'5-1', w52:'5-2', w53:'5-3', w54:'5-4', w55:'5-5', w56:'5-6',
    w61:'6-1', w62:'6-2', w63:'6-3', w64:'6-4',
    handtowel:'3-boss', mochiQueen:'4-boss', insulin:'5-boss', rasta:'rasta-boss', rastaLegacy:'rcboss'
  };

  ns.ALERT_COLORS = {
    ok:'#00ff66',
    warn:'#ffd700',
    danger:'#ff4444',
    info:'#66ddff'
  };

  ns.SFX_KEYS = {
    click:'click',
    punch:'punch',
    kick:'kick',
    explode:'explode',
    cash:'cash'
  };

  ns.SAVE_KEYS = {
    auto:'CEHP_SAVE_AUTO',
    backup:'CEHP_SAVE_BACKUP',
    backup1:'CEHP_SAVE_BACKUP_1',
    backup2:'CEHP_SAVE_BACKUP_2',
    slotA:'CEHP_SAVE_A',
    slotB:'CEHP_SAVE_B',
    quick:'CEHP_SAVE_QUICK'
  };

  root.CEHP_WORLD1_RUNTIME_SURFACE = ns;
})(window);
