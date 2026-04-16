window.SnakeUiOverlays = {
  install(api) {
    const {
      modeOverlay,
      resultOverlay,
      pauseOverlay,
      waveOverlay,
      pauseBtn,
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

    function showModeOverlay() {
      modeOverlay.classList.add('show');
      modeOverlay.classList.remove('hidden');
    }

    function hideModeOverlay() {
      modeOverlay.classList.remove('show');
      modeOverlay.classList.add('hidden');
    }

    function closeAllOverlays() {
      resultOverlay.classList.remove('show');
      pauseOverlay.classList.remove('show');
      waveOverlay.classList.remove('show');
      getShopOverlayElement().classList.remove('show');
    }

    function showExclusiveOverlay(overlay) {
      closeAllOverlays();
      overlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function setOverlayVisibility(overlay, visible) {
      overlay.classList.toggle('show', !!visible);
    }

    function syncPauseButtonVisibility() {
      pauseBtn.style.display = canRunGameLoopGuarded() ? 'block' : 'none';
    }

    function showPauseOverlay() {
      showExclusiveOverlay(pauseOverlay);
    }

    function showShopOverlay() {
      showExclusiveOverlay(getShopOverlayElement());
    }

    function showWaveOverlay() {
      showExclusiveOverlay(waveOverlay);
    }

    function showOnlyResultOverlay() {
      showExclusiveOverlay(resultOverlay);
    }

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      closeAllOverlays();
      setOverlayVisibility(resultOverlay, resultVisible);
      setOverlayVisibility(pauseOverlay, pauseVisible);
      setOverlayVisibility(waveOverlay, waveVisible);
      setOverlayVisibility(getShopOverlayElement(), shopVisible);
    }

    return {
      showModeOverlay,
      hideModeOverlay,
      closeAllOverlays,
      syncPauseButtonVisibility,
      showPauseOverlay,
      showShopOverlay,
      showWaveOverlay,
      showOnlyResultOverlay,
      restoreOverlayVisibility
    };
  }
};
