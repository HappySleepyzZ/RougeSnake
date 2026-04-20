# RougeSnake Smoke Testing

This repo includes a lightweight browser smoke harness at `__smoke_harness__.html`.

## What It Covers

- Loads a target page with `?test=1`
- Verifies `window.__snakeTestApi__` exists
- Verifies `getState()` / `setState()` roundtrip on the debug API
- Clicks a module button to verify module selection exits the overlay
- Sends a gameplay direction input to verify the page enters `RUNNING`
- Exercises deeper runtime hooks via the debug API:
  - `forceSpawnBarrier()`
  - `captureTimerTrace()`
  - `showResult('death')`
  - `openShop()` and shop purchase / skip close flow
  - `openShop()` clear-item behavior only removing snake skin obstacles
  - `openShop()` shield purchase plus snake-skin collision protection
  - `openShop()` heal / grow-tail purchases applying the documented body-length gains
  - `openShop()` poison-resist purchase halving poison DoT for the next wave
  - `openShop()` ice-armor purchase halving slow-terrain debuff duration
  - `openShop()` magnet purchase expanding pickup radius beyond the default 1-tile range
  - `openShop()` dash purchase granting a charge that is consumed on the next valid turn input
  - `advanceWave()` terrain / portal generation
  - `gameStep()` armor module slow-terrain score bonus branch
  - `gameStep()` armor module obstacle-break passive branch
  - `gameStep()` venom module poison-terrain immunity and score bonus branch
  - `startGame()` spirit module wide-portal passive on wave 1
  - `gameStep()` balanced module poison DoT half-damage branch
  - `gameStep()` barrier food spawning obstacles
  - `gameStep()` wind food clearing obstacles
  - `gameStep()` teleport food branch in a deterministic debug scenario
  - Ceremony state transitions: key pickup -> chest spawn -> loot burst -> shop
  - Loot burst rewards: coin gain, score gain, and shop opening when loot is exhausted
  - Runtime controls: pause / resume, reset-to-waiting, and wave-transition countdown auto-advance
  - `gameStep()` wall-death branch to verify real `gameOver()` overlay behavior
- Captures a screenshot for each target page

## Local Server

Serve the repo root before running smoke tests.

```powershell
cd C:\Users\rongyu\RougeSnake
python -m http.server 8765 --bind 127.0.0.1
```

## Run Smoke Tests

```powershell
cd C:\Users\rongyu\RougeSnake
powershell -ExecutionPolicy Bypass -File .\tools\run-smoke.ps1
```

Optional flags:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\run-smoke.ps1 `
  -BaseUrl http://127.0.0.1:8765 `
  -Pages index.html,404.html,snake-gameV23.html `
  -VirtualTimeBudgetMs 6000
```

## Outputs

- Screenshots: `artifacts/smoke/*.png`
- Run summary: `artifacts/smoke/summary.json`

These outputs are ignored by git.

## Notes

- The harness also supports `inject=1` for deeper runtime debugging when a page fails before exposing `__snakeTestApi__`.
- Browser profile directories are stored under `%TEMP%` to avoid polluting the repo.
