# STARSLING

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/TheNumbers-sys/makefun-best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/TheNumbers-sys/makefun-best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

A gravity-slingshot arcade game. Launch a comet from its pad, let the
planets bend its flight, and collect every star in the level before your
launches run out. Ten levels, rising difficulty, a best score that
persists, and synthesised sound throughout.

## How to play

- **Drag back** from the launch pad to aim — release to launch. The
  dotted line previews your flight, bent by every planet's gravity.
- **R** restart the level · **Esc** / **P** pause · **M** mute.
- Collect all the stars in a level to clear it. Unused launches pay a
  bonus. Run out of launches and the level keeps its stars.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: `game/` is plain static files, and
every sound is synthesised in code with WebAudio.

## Entry

Built for the make.fun best-game-01 bounty:
https://make.fun/bounty/best-game-01
https://make.fun/r/erf1bht8
