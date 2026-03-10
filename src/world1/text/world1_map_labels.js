/**
 * World 1 Map Labels and Grid Config
 * Slice 2 extraction — behavior-preserving, data only.
 * Publishes to window.CEHP_WORLD1_TEXT
 */
(function(root){
  var ns = root.CEHP_WORLD1_TEXT || {};

  // World 1 Map — row 4 pos 8 changed to 'V' (The Void secret level)
  ns.W1_ROWS = [
    'MMMMMMMMMMMMMMMM',
    'M   M    T  5 MM',
    'M G  G  GT  P MM',
    'M GG G  GPPP4 MM',
    'M GGC G2VP  CP!M',
    'M P  1P P3P   MM',
    'M P  GPPPP    MM',
    'M PP  GG PPCG MM',
    'M  G   GG G   MM',
    'MMMMMMMMMMMMMMMM'
  ];

  ns.W1_TILES = {
    ' ':{type:'empty',   passable:true},
    'G':{type:'grass',   passable:true},
    'P':{type:'path',    passable:true},
    'M':{type:'mountain',passable:false},
    'W':{type:'water',   passable:false},
    'T':{type:'tree',    passable:false},
    '1':{type:'level',   passable:true, id:'1-1', label:'Ed Wakes Up'},
    '2':{type:'level',   passable:true, id:'1-2', label:'The Cat Rave'},
    '3':{type:'level',   passable:true, id:'1-3', label:'Daikon District'},
    '4':{type:'level',   passable:true, id:'1-4', label:'Hippie Bus Highway'},
    '5':{type:'level',   passable:true, id:'1-5', label:"Daikon's Heartbreak"},
    'V':{type:'level',   passable:true, id:'1-V', label:'THE VOID'},
    'C':{type:'catspot', passable:true},
    '!':{type:'portal',  passable:true, id:'portal-W2', label:'THE NEON DISTRICT'}
  };

  root.CEHP_WORLD1_TEXT = ns;
})(window);
