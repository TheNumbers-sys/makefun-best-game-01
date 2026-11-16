// STARSLING — the game itself.
// One job: own the state machine (title, aim, flight, clear, over,
// victory, pause), the score, the launches and the particles, and wire
// input, physics, sound and rendering together.

import { LEVELS, TUNING } from './config.js';
import { launchVelocity, stepBody, simulateShot, isOutOfBounds } from './physics.js';
import { Synth } from './audio.js';
import { Input } from './input.js';
import * as R from './render.js';

const BEST_KEY = 'starsling-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(best) {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Storage unavailable; the best score lives for this visit only.
  }
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = new Synth();
    this.state = 'title';
    this.paused = false;
    this.levelIndex = 0;
    this.level = LEVELS[0];
    this.score = 0;
    this.scoreAtLevelStart = 0;
    this.best = loadBest();
    this.launchesLeft = 0;
    this.starsLeft = new Set();
    this.comet = { x: 90, y: 300, vx: 0, vy: 0 };
    this.trail = [];
    this.particles = [];
    this.time = 0;
    this.flightTime = 0;
    this.aiming = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragNow = { x: 0, y: 0 };
    this.previewPath = [];
    this.dead = false;
    this.deadTimer = 0;
    this.levelBonus = 0;
    this.bannerTime = 0;
    this.backStars = R.buildStarfield(0);
    this.input = new Input(canvas, {
      onGesture: () => this.synth.ensure(),
      onAimStart: (p) => this.onAimStart(p),
      onAimMove: (p) => this.onAimMove(p),
      onAimEnd: (a, b) => this.onAimEnd(a, b),
      onKey: (key) => this.onKey(key),
    });
  }

  /** Aim vector from the current drag: direction opposite the pull. */
  aimFromDrag() {
    const dx = this.dragNow.x - this.dragStart.x;
    const dy = this.dragNow.y - this.dragStart.y;
    const len = Math.hypot(dx, dy);
    const power = Math.min(1, len / TUNING.maxDrag);
    return { angle: Math.atan2(-dy, -dx), power, len };
  }

  loadLevel(index) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.launchesLeft = this.level.launches;
    this.starsLeft = new Set(this.level.stars.map((_, i) => i));
    this.scoreAtLevelStart = this.score;
    this.comet = { x: this.level.pad.x, y: this.level.pad.y, vx: 0, vy: 0 };
    this.trail = [];
    this.particles = [];
    this.dead = false;
    this.aiming = false;
    this.previewPath = [];
    this.bannerTime = 2.4;
    this.backStars = R.buildStarfield(index);
    this.state = 'aim';
  }

  startCampaign() {
    this.score = 0;
    this.loadLevel(0);
  }

  retryLevel() {
    this.score = this.scoreAtLevelStart;
    this.loadLevel(this.levelIndex);
  }

  confirmOverlay() {
    if (this.state === 'title') {
      this.synth.click();
      this.startCampaign();
    } else if (this.state === 'levelClear') {
      this.synth.click();
      if (this.levelIndex + 1 >= LEVELS.length) this.state = 'victory';
      else this.loadLevel(this.levelIndex + 1);
    } else if (this.state === 'gameOver') {
      this.synth.click();
      this.retryLevel();
    } else if (this.state === 'victory') {
      this.synth.click();
      this.state = 'title';
    }
  }

  onAimStart(p) {
    if (this.paused) return;
    if (this.state !== 'aim') {
      if (['title', 'levelClear', 'gameOver', 'victory'].includes(this.state)) this.confirmOverlay();
      return;
    }
    this.aiming = true;
    this.dragStart = p;
    this.dragNow = p;
    this.updatePreview();
  }

  onAimMove(p) {
    if (!this.aiming || this.state !== 'aim') return;
    this.dragNow = p;
    this.updatePreview();
  }

  onAimEnd() {
    if (!this.aiming || this.state !== 'aim') {
      this.aiming = false;
      return;
    }
    this.aiming = false;
    const { angle, power, len } = this.aimFromDrag();
    this.previewPath = [];
    if (len < 12 || power <= 0.05) return;
    const vel = launchVelocity(angle, power);
    this.comet.vx = vel.vx;
    this.comet.vy = vel.vy;
    this.launchesLeft -= 1;
    this.flightTime = 0;
    this.trail = [{ x: this.comet.x, y: this.comet.y }];
    this.state = 'flying';
    this.synth.launch();
  }

  updatePreview() {
    const { angle, power, len } = this.aimFromDrag();
    if (len < 12) {
      this.previewPath = [];
      return;
    }
    const result = simulateShot(this.level, new Set(this.starsLeft), angle, power, 3);
    this.previewPath = result.path;
  }

  onKey(key) {
    if (key === 'm') {
      this.synth.setMuted(!this.synth.muted);
      return;
    }
    if (key === 'escape' || key === 'p') {
      if (this.state === 'aim' || this.state === 'flying') this.paused = !this.paused;
      return;
    }
    if (this.paused) {
      if (key === 'r') {
        this.paused = false;
        this.retryLevel();
      } else if (key === 't') {
        this.paused = false;
        this.state = 'title';
      }
      return;
    }
    if (key === 'r') {
      if (['aim', 'flying', 'levelClear', 'gameOver'].includes(this.state)) this.retryLevel();
      return;
    }
    if (key === 'enter' || key === ' ') {
      if (['title', 'levelClear', 'gameOver', 'victory'].includes(this.state)) this.confirmOverlay();
    }
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1,
        color,
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  collectStar(idx) {
    const s = this.level.stars[idx];
    this.starsLeft.delete(idx);
    this.score += TUNING.starPoints;
    this.burst(s.x, s.y, '#ffe27a', 14, 160);
    this.synth.collect();
  }

  endFlightAsDead(silent) {
    this.dead = true;
    this.deadTimer = 0.9;
    if (!silent) {
      this.burst(this.comet.x, this.comet.y, '#ff9d8f', 26, 220);
      this.synth.crash();
    } else {
      this.burst(this.comet.x, this.comet.y, '#9fe8ff', 10, 90);
    }
  }

  levelCleared() {
    this.levelBonus = this.launchesLeft * TUNING.launchBonus;
    this.score += this.levelBonus;
    this.best = Math.max(this.best, this.score);
    saveBest(this.best);
    this.synth.win();
    if (this.levelIndex + 1 >= LEVELS.length) this.state = 'victory';
    else this.state = 'levelClear';
  }

  gameOver() {
    this.best = Math.max(this.best, this.score);
    saveBest(this.best);
    this.synth.lose();
    this.state = 'gameOver';
  }

  update(dt) {
    this.time += dt;
    if (this.bannerTime > 0) this.bannerTime -= dt;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    if (this.paused) return;
    if (this.state === 'flying') {
      if (this.dead) {
        this.deadTimer -= dt;
        if (this.deadTimer <= 0) {
          this.dead = false;
          if (this.launchesLeft > 0) {
            this.comet = { x: this.level.pad.x, y: this.level.pad.y, vx: 0, vy: 0 };
            this.trail = [];
            this.state = 'aim';
          } else {
            this.gameOver();
          }
        }
        return;
      }
      this.flightTime += dt;
      const sub = TUNING.substepsPerFrame;
      const sdt = dt / sub;
      for (let s = 0; s < sub; s++) {
        const hit = stepBody(this.comet, this.level.planets, sdt);
        if (hit === 'crash') {
          this.endFlightAsDead(false);
          return;
        }
        for (const idx of [...this.starsLeft]) {
          const star = this.level.stars[idx];
          const dx = this.comet.x - star.x;
          const dy = this.comet.y - star.y;
          if (dx * dx + dy * dy < TUNING.starCatch * TUNING.starCatch) this.collectStar(idx);
        }
        if (this.starsLeft.size === 0) {
          this.levelCleared();
          return;
        }
        if (isOutOfBounds(this.comet.x, this.comet.y)) {
          this.endFlightAsDead(true);
          return;
        }
      }
      this.trail.push({ x: this.comet.x, y: this.comet.y });
      if (this.trail.length > 18) this.trail.shift();
      if (this.flightTime > TUNING.maxFlightSeconds) this.endFlightAsDead(true);
    }
  }

  render() {
    const ctx = this.ctx;
    R.drawBackground(ctx, this.level, this.time, this.backStars);
    R.drawPlanets(ctx, this.level, this.time);
    R.drawPad(ctx, this.level);
    R.drawStars(ctx, this.level, this.starsLeft, this.time);
    if ((this.state === 'aim' || this.state === 'flying') && !this.dead) {
      R.drawComet(ctx, this.comet, this.trail);
    }
    if (this.state === 'aim' && this.aiming) {
      R.drawAim(ctx, this.level.pad, this.dragStart, this.dragNow, this.previewPath, TUNING.maxDrag);
    }
    R.drawParticles(ctx, this.particles);
    if (['aim', 'flying'].includes(this.state) || this.paused) {
      R.drawHud(ctx, {
        level: this.levelIndex + 1,
        levels: LEVELS.length,
        starsGot: this.level.stars.length - this.starsLeft.size,
        starsTotal: this.level.stars.length,
        launches: this.launchesLeft,
        score: this.score,
        best: this.best,
      });
    }
    if (this.state === 'aim' && this.bannerTime > 0) {
      R.drawBanner(ctx, `LEVEL ${this.levelIndex + 1} — ${this.level.name}`, Math.min(1, this.bannerTime));
    }
    if (this.state === 'aim' && this.levelIndex === 0 && !this.aiming && this.bannerTime <= 0) {
      R.drawHint(ctx, 'Drag back from the pad, release to launch');
    }
    if (this.state === 'title') R.drawTitle(ctx, this.best);
    else if (this.state === 'levelClear') R.drawLevelClear(ctx, this.level.name, this.levelIndex + 1, this.levelBonus, this.score);
    else if (this.state === 'gameOver') R.drawGameOver(ctx, this.levelIndex + 1);
    else if (this.state === 'victory') R.drawVictory(ctx, this.score, this.best);
    if (this.paused) R.drawPause(ctx);
  }
}
