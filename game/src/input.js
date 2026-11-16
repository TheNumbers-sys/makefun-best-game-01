// STARSLING — pointer and keyboard input.
// One job: turn mouse drags and key presses into game intents.
// The game owns what each intent means; this file only reports them.
// Dragging pulls the comet back like a slingshot: the launch flies the
// opposite way from the pull, harder the further you pull.

export class Input {
  constructor(canvas, hooks) {
    this.canvas = canvas;
    this.hooks = hooks;
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragNow = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  /** Pointer position in canvas coordinates (the canvas is scaled by CSS). */
  toCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * this.canvas.height,
    };
  }

  onDown(e) {
    this.hooks.onGesture();
    const p = this.toCanvas(e);
    this.dragging = true;
    this.dragStart = p;
    this.dragNow = p;
    this.hooks.onAimStart(p);
  }

  onMove(e) {
    if (!this.dragging) return;
    this.dragNow = this.toCanvas(e);
    this.hooks.onAimMove(this.dragNow);
  }

  onUp(e) {
    if (!this.dragging) return;
    this.dragging = false;
    this.dragNow = this.toCanvas(e);
    this.hooks.onAimEnd(this.dragStart, this.dragNow);
  }

  onKey(e) {
    if (e.repeat) return;
    this.hooks.onGesture();
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'enter') e.preventDefault();
    this.hooks.onKey(key);
  }
}
