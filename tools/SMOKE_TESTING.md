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
  - `advanceWave()` terrain / portal generation
  - `gameStep()` teleport food branch in a deterministic debug scenario
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
