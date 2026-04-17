window.SnakeUiOverlays = {
  install(api) {
    const {
      modeOverlay,
      resultOverlay,
      pauseOverlay,
      waveOverlay,
      pauseBtn,
      waveText,
      waveCountdown,
      waveTransitionDuration,
      UI_TEXT,
      getCurrentWave,
      getShopOverlayElement,
      actions,
      canRunGameLoop
    } = api;

    function getRuntimeStateGuards() {
      return actions && actions.runtimeStateGuards ? actions.runtimeStateGuards : {};
    }

    function resolveRuntimeGuard(name, fallbackFn, fallbackValue) {
      const guards = getRuntimeStateGuards();
      if (typeof guards[name] === 'function') {
        return guards[name]();
      }
      if (typeof fallbackFn === 'function') {
        return fallbackFn();
      }
      return fallbackValue;
    }

    function canRunGameLoopGuarded() {
      return resolveRuntimeGuard('canRunGameLoop', canRunGameLoop, false);
    }

    function setModeOverlayVisibility(visible) {
      modeOverlay.classList.toggle('show', !!visible);
      modeOverlay.classList.toggle('hidden', !visible);
    }

    function showModeOverlay() {
      setModeOverlayVisibility(true);
    }

    function hideModeOverlay() {
      setModeOverlayVisibility(false);
    }

    function getOverlayVisibilityEntries() {
      return [
        ['resultVisible', resultOverlay],
        ['pauseVisible', pauseOverlay],
        ['waveVisible', waveOverlay],
        ['shopVisible', getShopOverlayElement()]
      ];
    }

    function closeAllOverlays() {
      getOverlayVisibilityEntries().forEach(([, overlay]) => {
        overlay.classList.remove('show');
      });
    }

    function showExclusiveOverlay(overlay) {
      closeAllOverlays();
      overlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function createExclusiveOverlayAction(getOverlay) {
      return function showOverlay() {
        showExclusiveOverlay(getOverlay());
      };
    }

    function setOverlayVisibility(overlay, visible) {
      overlay.classList.toggle('show', !!visible);
    }

    function syncPauseButtonVisibility() {
      pauseBtn.style.display = canRunGameLoopGuarded() ? 'block' : 'none';
    }

    const showPauseOverlay = createExclusiveOverlayAction(() => pauseOverlay);
    const showShopOverlay = createExclusiveOverlayAction(getShopOverlayElement);
    const showWaveOverlay = createExclusiveOverlayAction(() => waveOverlay);
    const showOnlyResultOverlay = createExclusiveOverlayAction(() => resultOverlay);

    function renderWaveTransitionOverlay() {
      waveText.textContent = UI_TEXT.wave.complete(getCurrentWave());
      waveCountdown.textContent = UI_TEXT.wave.nextIn(Math.ceil(waveTransitionDuration / 1000));
      showWaveOverlay();
    }

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      closeAllOverlays();
      const visibilityState = { resultVisible, pauseVisible, waveVisible, shopVisible };
      getOverlayVisibilityEntries().forEach(([key, overlay]) => {
        setOverlayVisibility(overlay, visibilityState[key]);
      });
    }

    function getOverlayVisibilitySnapshot() {
      return getOverlayVisibilityEntries().reduce((snapshot, [key, overlay]) => {
        snapshot[key] = overlay.classList.contains('show');
        return snapshot;
      }, {});
    }

    const overlayApi = {
      showModeOverlay,
      hideModeOverlay,
      closeAllOverlays,
      syncPauseButtonVisibility,
      showPauseOverlay,
      showShopOverlay,
      showWaveOverlay,
      renderWaveTransitionOverlay,
      showOnlyResultOverlay,
      getOverlayVisibilitySnapshot,
      restoreOverlayVisibility
    };

    return overlayApi;
  }
};
