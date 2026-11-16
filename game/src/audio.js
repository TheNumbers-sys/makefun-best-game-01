// STARSLING — synthesised sound.
// One job: every sound the game makes, built from WebAudio oscillators.
// No audio files, no network. The context starts on the first user
// gesture, and M toggles mute (remembered across visits).

const BEST_MUTE_KEY = 'starsling-muted';

export class Synth {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    try {
      this.muted = window.localStorage.getItem(BEST_MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  /** Create the context on a user gesture; safe to call any time. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      window.localStorage.setItem(BEST_MUTE_KEY, muted ? '1' : '0');
    } catch {
      // Storage unavailable; mute still applies for this visit.
    }
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  /** One oscillator note sliding from f0 to f1 over dur seconds. */
  tone(f0, f1, dur, type, vol, delay = 0) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, f0), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  click() {
    this.tone(660, 660, 0.06, 'square', 0.12);
  }

  launch() {
    this.tone(320, 90, 0.35, 'sawtooth', 0.22);
    this.tone(160, 480, 0.28, 'sine', 0.14);
  }

  collect() {
    this.tone(880, 880, 0.09, 'sine', 0.2);
    this.tone(1318, 1318, 0.14, 'sine', 0.2, 0.08);
  }

  crash() {
    this.tone(180, 40, 0.4, 'triangle', 0.3);
    this.tone(90, 30, 0.5, 'sawtooth', 0.14, 0.02);
  }

  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => this.tone(f, f, 0.22, 'sine', 0.2, i * 0.11));
  }

  lose() {
    this.tone(330, 110, 0.7, 'triangle', 0.22);
    this.tone(220, 82, 0.8, 'sine', 0.16, 0.12);
  }
}
