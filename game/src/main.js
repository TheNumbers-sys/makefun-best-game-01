// STARSLING — boot and the frame loop.
// One job: start the game and drive it at a fixed 60 Hz step, so the
// flight feels the same on every machine.

import { Game } from './game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function frame(now) {
  const elapsed = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += elapsed;
  while (acc >= STEP) {
    game.update(STEP);
    acc -= STEP;
  }
  game.render();
  requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && (game.state === 'aim' || game.state === 'flying')) game.paused = true;
});

requestAnimationFrame(frame);
