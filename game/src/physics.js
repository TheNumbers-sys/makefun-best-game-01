// STARSLING — gravity, flight and the full-shot simulator.
// One job: move the comet under the planets and tell the game what a
// launch does. Pure functions only, so the same code runs in the browser
// and in a headless test. No DOM, no sound, no drawing here.

import { TUNING } from './config.js';

/** Launch velocity from an aim angle (radians) and a power 0..1. */
export function launchVelocity(angle, power) {
  const clamped = Math.max(0, Math.min(1, power));
  const speed = TUNING.minSpeed + clamped * (TUNING.maxSpeed - TUNING.minSpeed);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

/** Gravity acceleration at (x, y) from every planet, capped for sanity. */
export function gravityAt(x, y, planets) {
  let ax = 0;
  let ay = 0;
  for (const p of planets) {
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy;
    const floor = p.r * p.r * 0.36;
    const safe = Math.max(d2, floor);
    const pull = p.mu / (safe * Math.sqrt(safe));
    ax += dx * pull;
    ay += dy * pull;
  }
  const mag = Math.hypot(ax, ay);
  if (mag > TUNING.maxAccel) {
    ax = (ax / mag) * TUNING.maxAccel;
    ay = (ay / mag) * TUNING.maxAccel;
  }
  return { ax, ay };
}

/** One integration step of a body {x, y, vx, vy}. Returns 'ok' or 'crash'. */
export function stepBody(body, planets, dt) {
  const { ax, ay } = gravityAt(body.x, body.y, planets);
  body.vx += ax * dt;
  body.vy += ay * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  for (const p of planets) {
    const dx = body.x - p.x;
    const dy = body.y - p.y;
    if (dx * dx + dy * dy < (p.r + TUNING.cometRadius) * (p.r + TUNING.cometRadius)) {
      return 'crash';
    }
  }
  return 'ok';
}

/** True when the comet has drifted too far off the field to come back. */
export function isOutOfBounds(x, y) {
  const m = TUNING.outMargin;
  return x < -m || x > 960 + m || y < -m || y > 600 + m;
}

/**
 * Simulate one whole launch and report what happened.
 * level: the level object; starsLeft: a Set of star indexes still to take;
 * angle, power: the launch; maxSeconds: flight cap.
 * Returns { outcome, collected, path } where outcome is one of
 * 'won' | 'crash' | 'out' | 'timeout', collected lists the star indexes
 * this shot took, and path is the sampled flight for the aim preview.
 */
export function simulateShot(level, starsLeft, angle, power, maxSeconds = TUNING.maxFlightSeconds) {
  const vel = launchVelocity(angle, power);
  const body = { x: level.pad.x, y: level.pad.y, vx: vel.vx, vy: vel.vy };
  const collected = [];
  const path = [];
  const dt = TUNING.stepDt;
  const steps = Math.ceil(maxSeconds / dt);
  for (let i = 0; i < steps; i++) {
    const hit = stepBody(body, level.planets, dt);
    if (i % 4 === 0) path.push({ x: body.x, y: body.y });
    if (hit === 'crash') return { outcome: 'crash', collected, path };
    for (const idx of starsLeft) {
      const s = level.stars[idx];
      const dx = body.x - s.x;
      const dy = body.y - s.y;
      if (dx * dx + dy * dy < TUNING.starCatch * TUNING.starCatch) {
        collected.push(idx);
        starsLeft.delete(idx);
      }
    }
    if (starsLeft.size === 0) return { outcome: 'won', collected, path };
    if (isOutOfBounds(body.x, body.y)) return { outcome: 'out', collected, path };
  }
  return { outcome: 'timeout', collected, path };
}
