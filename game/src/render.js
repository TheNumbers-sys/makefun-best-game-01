// STARSLING — everything drawn on the canvas.
// One job: turn the game state into a picture. It reads state, it never
// changes it. All art is procedural: gradients, glows and shapes drawn
// in code, so the game ships no image files at all.

import { FIELD_W, FIELD_H } from './config.js';

/** Deterministic pseudo-random generator, so a level's sky never shifts. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build the background starfield for a level (90 fixed stars). */
export function buildStarfield(levelIndex) {
  const rand = mulberry32(1234 + levelIndex * 777);
  const stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: rand() * FIELD_W,
      y: rand() * FIELD_H,
      r: 0.6 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
      speed: 0.5 + rand() * 1.5,
    });
  }
  return stars;
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8, 12, 32, 0.82)';
  ctx.strokeStyle = 'rgba(160, 200, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
}

function centreText(ctx, text, y, font, colour) {
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, FIELD_W / 2, y);
}

export function drawBackground(ctx, level, time, backStars) {
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD_H);
  sky.addColorStop(0, level.skyTop);
  sky.addColorStop(1, level.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  for (let i = 0; i < level.nebula.length; i++) {
    const cx = FIELD_W * (0.22 + i * 0.55);
    const cy = FIELD_H * (0.28 + i * 0.3);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
    g.addColorStop(0, level.nebula[i] + '55');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  }
  for (const s of backStars) {
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(time * s.speed + s.phase));
    ctx.globalAlpha = tw;
    ctx.fillStyle = '#dfe9ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawPlanets(ctx, level, time) {
  for (const p of level.planets) {
    if (p.ring) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-0.35);
      ctx.strokeStyle = 'rgba(220, 230, 255, 0.35)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const g = ctx.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.4, p.r * 0.1, p.x, p.y, p.r);
    g.addColorStop(0, p.top);
    g.addColorStop(1, p.bottom);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const well = ctx.createRadialGradient(p.x, p.y, p.r, p.x, p.y, p.r * 2.6);
    well.addColorStop(0, 'rgba(160, 190, 255, 0.10)');
    well.addColorStop(1, 'transparent');
    ctx.fillStyle = well;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawPad(ctx, level) {
  const { x, y } = level.pad;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9fe8ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#9fe8ff';
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 8);
  ctx.lineTo(x + 5, y + 8);
  ctx.lineTo(x, y - 6);
  ctx.closePath();
  ctx.fill();
}

export function drawStars(ctx, level, starsLeft, time) {
  for (const idx of starsLeft) {
    const s = level.stars[idx];
    const pulse = 1 + 0.18 * Math.sin(time * 3 + idx * 1.7);
    const r = 11 * pulse;
    ctx.save();
    ctx.shadowColor = '#ffe27a';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#fff6c9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x - r, s.y);
    ctx.lineTo(s.x + r, s.y);
    ctx.moveTo(s.x, s.y - r);
    ctx.lineTo(s.x, s.y + r);
    ctx.stroke();
  }
}

export function drawComet(ctx, comet, trail) {
  if (trail.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = (i / trail.length) * 0.7;
      ctx.strokeStyle = `rgba(140, 220, 255, ${a})`;
      ctx.lineWidth = 1 + (i / trail.length) * 5;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 16);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.4, '#bfe9ff');
  g.addColorStop(1, 'rgba(80, 160, 255, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawAim(ctx, pad, dragStart, dragNow, previewPath, maxDrag) {
  const dx = dragNow.x - dragStart.x;
  const dy = dragNow.y - dragStart.y;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;
  const power = Math.min(1, len / maxDrag);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(pad.x, pad.y);
  ctx.lineTo(dragNow.x, dragNow.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffe27a';
  ctx.beginPath();
  ctx.arc(pad.x, pad.y, 6 + power * 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 226, 122, 0.9)';
  ctx.fillRect(pad.x - 40, pad.y + 26, 80, 8);
  ctx.fillStyle = '#1c2a55';
  ctx.fillRect(pad.x - 40, pad.y + 26, 80 * power, 8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.strokeRect(pad.x - 40, pad.y + 26, 80, 8);
  ctx.restore();
  if (previewPath.length > 1) {
    ctx.save();
    for (let i = 0; i < previewPath.length; i++) {
      const p = previewPath[i];
      const a = Math.max(0.12, 0.75 - i * 0.012);
      ctx.fillStyle = `rgba(190, 230, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHud(ctx, hud) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 12, 32, 0.55)';
  ctx.fillRect(0, 0, FIELD_W, 34);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#eaf2ff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`LEVEL ${hud.level} / ${hud.levels}`, 14, 18);
  ctx.fillText(`★ ${hud.starsGot} / ${hud.starsTotal}`, 150, 18);
  ctx.fillText(`LAUNCHES ${hud.launches}`, 280, 18);
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${hud.score}`, FIELD_W - 150, 18);
  ctx.fillText(`BEST ${hud.best}`, FIELD_W - 14, 18);
  ctx.restore();
}

export function drawBanner(ctx, text, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  centreText(ctx, text, 70, 'bold 24px system-ui, sans-serif', '#ffffff');
  ctx.restore();
}

export function drawHint(ctx, text) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  centreText(ctx, text, 560, '16px system-ui, sans-serif', '#b9c8ea');
  ctx.restore();
}

function dimScene(ctx) {
  ctx.fillStyle = 'rgba(4, 8, 24, 0.55)';
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
}

export function drawTitle(ctx, best) {
  dimScene(ctx);
  centreText(ctx, 'STARSLING', 170, 'bold 72px system-ui, sans-serif', '#ffe27a');
  centreText(ctx, 'Bend the comet. Catch every star.', 225, '20px system-ui, sans-serif', '#dfe9ff');
  centreText(ctx, 'Drag back from the pad to aim — release to launch.', 300, '17px system-ui, sans-serif', '#b9c8ea');
  centreText(ctx, 'Gravity bends your flight. Mind the planets.', 326, '17px system-ui, sans-serif', '#b9c8ea');
  centreText(ctx, 'R restart   ·   Esc pause   ·   M mute', 372, '15px system-ui, sans-serif', '#8fa3d4');
  if (best > 0) centreText(ctx, `BEST SCORE  ${best}`, 420, 'bold 17px system-ui, sans-serif', '#9fe8c9');
  centreText(ctx, '— CLICK TO START —', 480, 'bold 22px system-ui, sans-serif', '#ffffff');
}

export function drawLevelClear(ctx, levelName, levelNumber, bonus, score) {
  dimScene(ctx);
  panel(ctx, 250, 150, 460, 300);
  centreText(ctx, 'LEVEL CLEAR', 200, 'bold 40px system-ui, sans-serif', '#ffe27a');
  centreText(ctx, `${levelNumber} — ${levelName}`, 248, '19px system-ui, sans-serif', '#dfe9ff');
  centreText(ctx, `Launch bonus  +${bonus}`, 300, '18px system-ui, sans-serif', '#9fe8c9');
  centreText(ctx, `Score  ${score}`, 332, 'bold 20px system-ui, sans-serif', '#ffffff');
  centreText(ctx, '— NEXT LEVEL: CLICK OR PRESS ENTER —', 410, '16px system-ui, sans-serif', '#b9c8ea');
}

export function drawGameOver(ctx, levelNumber) {
  dimScene(ctx);
  panel(ctx, 250, 160, 460, 280);
  centreText(ctx, 'OUT OF LAUNCHES', 210, 'bold 36px system-ui, sans-serif', '#ff9d8f');
  centreText(ctx, `Level ${levelNumber} kept its stars this time.`, 262, '18px system-ui, sans-serif', '#dfe9ff');
  centreText(ctx, 'Watch the dotted path — gravity is your friend.', 292, '16px system-ui, sans-serif', '#b9c8ea');
  centreText(ctx, '— RETRY: CLICK OR PRESS R —', 396, '16px system-ui, sans-serif', '#ffffff');
}

export function drawVictory(ctx, score, best) {
  dimScene(ctx);
  panel(ctx, 220, 130, 520, 340);
  centreText(ctx, 'YOU SLUNG THE STARS', 180, 'bold 38px system-ui, sans-serif', '#ffe27a');
  centreText(ctx, 'All ten levels clear. The sky is yours.', 232, '18px system-ui, sans-serif', '#dfe9ff');
  centreText(ctx, `FINAL SCORE  ${score}`, 292, 'bold 22px system-ui, sans-serif', '#ffffff');
  centreText(ctx, `BEST  ${best}`, 326, '18px system-ui, sans-serif', '#9fe8c9');
  centreText(ctx, '— PLAY AGAIN: CLICK OR PRESS ENTER —', 420, '16px system-ui, sans-serif', '#b9c8ea');
}

export function drawPause(ctx) {
  dimScene(ctx);
  panel(ctx, 300, 190, 360, 220);
  centreText(ctx, 'PAUSED', 240, 'bold 36px system-ui, sans-serif', '#ffffff');
  centreText(ctx, 'Esc resume  ·  R restart level', 292, '17px system-ui, sans-serif', '#dfe9ff');
  centreText(ctx, 'T title  ·  M mute', 324, '17px system-ui, sans-serif', '#b9c8ea');
}
