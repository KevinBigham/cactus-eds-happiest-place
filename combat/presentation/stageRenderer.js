(function(global){
  'use strict';

  var ns = global.CEHP_COMBAT = global.CEHP_COMBAT || {};
  ns.presentation = ns.presentation || {};

  var stageRenderer = ns.presentation.stageRenderer = ns.presentation.stageRenderer || {};

  function q(opts, col){
    if (opts && typeof opts.quantizeFn === 'function') return opts.quantizeFn(col);
    return col;
  }

  function drawChecker(g, x, y, w, h, a, b, step, opts){
    var xx, yy, size = Math.max(1, step || 2);
    for (yy = y; yy < y + h; yy += size) {
      for (xx = x; xx < x + w; xx += size) {
        g.fillStyle(q(opts, ((((xx / size) + (yy / size)) & 1) ? a : b)), 1);
        g.fillRect(xx, yy, size, size);
      }
    }
  }

  stageRenderer.renderStage = function(scene, ctx){
    var stage = ns.data && ns.data.stages ? ns.data.stages.tournamentFlat : null;
    var g = ctx && ctx.graphics;
    var v = ctx && ctx.viewport;
    var pal, i, x, jx, jy, lane, arenaW, centerX;
    if (!g || !v || !stage) return false;
    pal = stage.palette;
    jx = Math.floor(ctx.jitterX || 0);
    jy = Math.floor(ctx.jitterY || 0);
    arenaW = (v.arenaRight - v.arenaLeft);
    centerX = Math.round((v.arenaLeft + v.arenaRight) * 0.5);

    g.clear();
    g.fillStyle(q(ctx, pal.skyTop), 1);
    g.fillRect(0, 0, v.vw, 22);
    g.fillStyle(q(ctx, pal.skyMid), 1);
    g.fillRect(0, 22, v.vw, 26);
    g.fillStyle(q(ctx, pal.skyBottom || pal.skyMid), 1);
    g.fillRect(0, 48, v.vw, 24);
    g.fillStyle(q(ctx, pal.backdropMatte || pal.wallDark), 1);
    g.fillRect(0, 72 + jy, v.vw, Math.max(8, v.floorY - 78));
    g.fillStyle(q(ctx, pal.wallLight), 0.08);
    g.fillEllipse(centerX + jx, 88 + jy, arenaW * 0.78, 32);
    drawChecker(g, 0, 74 + jy, v.vw, Math.max(8, v.floorY - 82), pal.wallDark, pal.wallMid, 2, ctx);
    g.fillStyle(q(ctx, pal.backdropMatte || pal.wallDark), 0.28);
    g.fillRect(0, 74 + jy, v.vw, Math.max(8, v.floorY - 86));
    g.fillStyle(q(ctx, pal.wallShadow || pal.wallDark), 0.35);
    g.fillRect(0, v.floorY - 42 + jy, v.vw, 18);
    g.fillStyle(q(ctx, pal.wallLight), 1);
    g.fillRect(0, v.floorY - 32 + jy, v.vw, 3);

    g.fillStyle(q(ctx, pal.rail), 1);
    g.fillRect(v.arenaLeft - 8 + jx, v.floorY - 36 + jy, arenaW + 16, 4);
    for (i = 0; i < stage.crowdBands; i++) {
      x = 6 + (i * 17) + (jx * 0.2);
      g.fillStyle(q(ctx, (i % 3 === 0) ? pal.crowdLight : ((i & 1) ? pal.crowdDark : pal.crowdMid)), 0.95);
      g.fillRect(x, 72 + (i % 3), 9 + (i % 4), 14 + (i % 5));
      g.fillRect(x + 4, 68 + (i % 2), 3, 5);
    }

    g.fillStyle(q(ctx, pal.bannerBg), 1);
    g.fillRect(8 + jx, 8 + jy, 48, 12);
    g.fillRect(v.vw - 56 + jx, 8 + jy, 48, 12);
    g.fillStyle(q(ctx, pal.bannerFg), 1);
    g.fillRect(12 + jx, 12 + jy, 14, 4);
    g.fillRect(v.vw - 50 + jx, 12 + jy, 18, 4);

    g.fillStyle(q(ctx, pal.floorDark), 1);
    g.fillRect(0, v.floorY - 4 + jy, v.vw, v.vh - v.floorY + 4);
    g.fillStyle(q(ctx, pal.floorMid), 1);
    g.fillRect(0, v.floorY - 10 + jy, v.vw, 14);
    drawChecker(g, 0, v.floorY + jy, v.vw, v.vh - v.floorY, pal.floorStripeA, pal.floorStripeB, 3, ctx);
    g.fillStyle(q(ctx, pal.floorDark), 0.28);
    g.fillRect(0, v.floorY + jy, v.vw, v.vh - v.floorY);
    g.fillStyle(q(ctx, pal.floorLight), 1);
    g.fillRect(0, v.floorY - 8 + jy, v.vw, 2);
    g.fillStyle(q(ctx, pal.fighterLane || pal.floorDark), 0.72);
    g.fillRect(v.arenaLeft - 8 + jx, v.floorY - 2 + jy, arenaW + 16, 5);
    g.fillStyle(q(ctx, pal.floorLight), 0.11);
    g.fillRect(v.arenaLeft - 18 + jx, v.floorY - 14 + jy, arenaW + 36, 10);

    lane = Math.max(10, stage.laneSpacing || 18);
    for (x = v.arenaLeft; x <= v.arenaRight; x += lane) {
      g.fillStyle(q(ctx, (x === centerX) ? pal.centerLine : pal.floorLight), x === centerX ? 0.72 : 0.2);
      g.fillRect(x + jx, v.floorY + jy, 1, v.vh - v.floorY);
    }

    g.fillStyle(q(ctx, pal.leftCorner), 1);
    g.fillRect(v.arenaLeft - 5 + jx, v.floorY - 24 + jy, 3, 24);
    g.fillStyle(q(ctx, pal.rightCorner), 1);
    g.fillRect(v.arenaRight + 2 + jx, v.floorY - 24 + jy, 3, 24);
    g.fillStyle(q(ctx, pal.leftCorner), 0.14);
    g.fillRect(v.arenaLeft - 12 + jx, v.floorY - 8 + jy, 8, 8);
    g.fillStyle(q(ctx, pal.rightCorner), 0.14);
    g.fillRect(v.arenaRight + 4 + jx, v.floorY - 8 + jy, 8, 8);

    g.fillStyle(q(ctx, pal.shadow), 0.28);
    g.fillRect(0, v.floorY - 18 + jy, v.vw, 18);
    return true;
  };
})(typeof window !== 'undefined' ? window : this);
