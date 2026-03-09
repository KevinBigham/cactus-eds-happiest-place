(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.data = ns.data || {};
  ns.data.stages = ns.data.stages || {};

  ns.data.stages.tournamentFlat = {
    id: 'tournamentFlat',
    name: 'Tournament Flat',
    palette: {
      skyTop: 0x0c1823,
      skyMid: 0x162736,
      skyBottom: 0x221f29,
      backdropMatte: 0x10161d,
      fighterLane: 0x151313,
      crowdDark: 0x101216,
      crowdMid: 0x242a32,
      crowdLight: 0x303845,
      rail: 0x556170,
      wallDark: 0x1f2430,
      wallMid: 0x303745,
      wallLight: 0x4b5666,
      floorDark: 0x392d25,
      floorMid: 0x665244,
      floorLight: 0xaf9478,
      floorStripeA: 0xc2b093,
      floorStripeB: 0x7a6655,
      centerLine: 0xece1c8,
      leftCorner: 0x88c86e,
      rightCorner: 0xa88dff,
      bannerBg: 0x10151f,
      bannerFg: 0xece4cf,
      shadow: 0x050607,
      wallShadow: 0x0d1218
    },
    crowdBands: 14,
    laneSpacing: 18
  };
})(typeof window !== 'undefined' ? window : this);
