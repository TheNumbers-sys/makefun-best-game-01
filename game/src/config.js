// STARSLING — level data and tuning.
// One job: describe every level and the numbers the physics uses.
// Coordinates live on a 960 x 600 field. A planet bends the comet with
// mu (its gravity strength); a star is collected when the comet passes
// within STAR_CATCH of its centre. Launches are the level's budget.

export const FIELD_W = 960;
export const FIELD_H = 600;

export const TUNING = {
  cometRadius: 7,
  starRadius: 11,
  starCatch: 28,
  maxDrag: 150,
  maxSpeed: 640,
  minSpeed: 40,
  stepDt: 1 / 120,
  substepsPerFrame: 2,
  maxFlightSeconds: 12,
  outMargin: 90,
  maxAccel: 4000,
  starPoints: 100,
  launchBonus: 150,
};

// A planet: x, y, centre; r, body radius; mu, gravity strength;
// top, bottom, the two gradient colours; ring, whether it wears a ring.
function planet(x, y, r, mu, top, bottom, ring = false) {
  return { x, y, r, mu, top, bottom, ring };
}

function star(x, y) {
  return { x, y };
}

export const LEVELS = [
  {
    name: 'First Light',
    skyTop: '#0b1030',
    skyBottom: '#1c2a55',
    nebula: ['#274b8f', '#3d2a6e'],
    pad: { x: 90, y: 300 },
    launches: 3,
    planets: [planet(480, 300, 34, 1.2e6, '#8fd0ff', '#2b5ea8')],
    stars: [star(700, 180), star(760, 420)],
  },
  {
    name: 'Twin Pull',
    skyTop: '#120b2e',
    skyBottom: '#3a1c5e',
    nebula: ['#5e2a8f', '#8f2a5e'],
    pad: { x: 90, y: 300 },
    launches: 4,
    planets: [
      planet(380, 200, 30, 1.0e6, '#ffd28f', '#b06a2b'),
      planet(560, 420, 30, 1.0e6, '#9fe8c9', '#2b8f6a'),
    ],
    stars: [star(640, 150), star(820, 300), star(700, 480)],
  },
  {
    name: 'The Long Way Round',
    skyTop: '#081426',
    skyBottom: '#14324f',
    nebula: ['#1f6f8f', '#274b8f'],
    pad: { x: 90, y: 300 },
    launches: 4,
    planets: [planet(480, 300, 52, 2.6e6, '#ffb08f', '#a83c2b', true)],
    stars: [star(800, 120), star(840, 300), star(800, 480)],
  },
  {
    name: 'Gauntlet',
    skyTop: '#1a0b2e',
    skyBottom: '#4f1432',
    nebula: ['#8f2a5e', '#3d2a6e'],
    pad: { x: 90, y: 300 },
    launches: 4,
    planets: [
      planet(350, 180, 26, 8.0e5, '#c9b8ff', '#6a4fb0'),
      planet(520, 330, 26, 8.0e5, '#8fd0ff', '#2b5ea8'),
      planet(680, 180, 26, 8.0e5, '#ffd28f', '#b06a2b'),
    ],
    stars: [star(600, 520), star(860, 300), star(760, 90)],
  },
  {
    name: 'Binary',
    skyTop: '#0b1a26',
    skyBottom: '#1c4f4f',
    nebula: ['#2b8f8f', '#274b8f'],
    pad: { x: 90, y: 300 },
    launches: 5,
    planets: [
      planet(400, 240, 44, 2.0e6, '#9fe8c9', '#2b8f6a', true),
      planet(620, 380, 44, 2.0e6, '#ffd28f', '#b06a2b'),
    ],
    stars: [star(850, 120), star(880, 300), star(850, 500), star(300, 520)],
  },
  {
    name: 'The Maze',
    skyTop: '#160b26',
    skyBottom: '#3a1c4f',
    nebula: ['#5e2a8f', '#8f2a5e'],
    pad: { x: 90, y: 300 },
    launches: 5,
    planets: [
      planet(300, 150, 28, 9.0e5, '#8fd0ff', '#2b5ea8'),
      planet(300, 450, 28, 9.0e5, '#ffd28f', '#b06a2b'),
      planet(560, 300, 40, 1.8e6, '#c9b8ff', '#6a4fb0', true),
      planet(780, 150, 26, 8.0e5, '#9fe8c9', '#2b8f6a'),
      planet(780, 450, 26, 8.0e5, '#ffb08f', '#a83c2b'),
    ],
    stars: [star(560, 90), star(860, 390), star(560, 520)],
  },
  {
    name: 'Slingshot Alley',
    skyTop: '#081426',
    skyBottom: '#2b3a5e',
    nebula: ['#274b8f', '#1f6f8f'],
    pad: { x: 90, y: 300 },
    launches: 4,
    planets: [
      planet(300, 300, 24, 7.0e5, '#8fd0ff', '#2b5ea8'),
      planet(480, 200, 24, 7.0e5, '#ffd28f', '#b06a2b'),
      planet(480, 400, 24, 7.0e5, '#9fe8c9', '#2b8f6a'),
      planet(660, 300, 24, 7.0e5, '#c9b8ff', '#6a4fb0'),
    ],
    stars: [star(860, 120), star(860, 480), star(860, 300)],
  },
  {
    name: 'The Well',
    skyTop: '#120b2e',
    skyBottom: '#4f1432',
    nebula: ['#8f2a5e', '#5e2a8f'],
    pad: { x: 90, y: 300 },
    launches: 5,
    planets: [planet(520, 300, 70, 4.5e6, '#ffb08f', '#8f2a3c', true)],
    stars: [star(520, 110), star(760, 140), star(520, 500), star(300, 300)],
  },
  {
    name: 'Crosswinds',
    skyTop: '#0b1a26',
    skyBottom: '#14324f',
    nebula: ['#1f6f8f', '#2b8f8f'],
    pad: { x: 90, y: 300 },
    launches: 5,
    planets: [
      planet(360, 160, 30, 1.1e6, '#8fd0ff', '#2b5ea8'),
      planet(600, 160, 30, 1.1e6, '#ffd28f', '#b06a2b'),
      planet(360, 440, 30, 1.1e6, '#9fe8c9', '#2b8f6a'),
      planet(600, 440, 30, 1.1e6, '#c9b8ff', '#6a4fb0'),
    ],
    stars: [star(480, 300), star(850, 90), star(850, 510), star(850, 300)],
  },
  {
    name: 'Starforge',
    skyTop: '#1a0b2e',
    skyBottom: '#5e1c2a',
    nebula: ['#8f2a5e', '#b06a2b'],
    pad: { x: 90, y: 300 },
    launches: 6,
    planets: [
      planet(330, 300, 36, 1.5e6, '#8fd0ff', '#2b5ea8', true),
      planet(560, 180, 30, 1.2e6, '#ffd28f', '#b06a2b'),
      planet(560, 420, 30, 1.2e6, '#9fe8c9', '#2b8f6a'),
      planet(770, 300, 44, 2.2e6, '#ffb08f', '#a83c2b'),
    ],
    stars: [star(770, 90), star(900, 300), star(770, 510), star(450, 300), star(640, 300)],
  },
];
