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

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      closeAllOverlays();
      setOverlayVisibility(resultOverlay, resultVisible);
      setOverlayVisibility(pauseOverlay, pauseVisible);
      setOverlayVisibility(waveOverlay, waveVisible);
      setOverlayVisibility(getShopOverlayElement(), shopVisible);
    }

    const overlayApi = {
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

    return overlayApi;
  }
};
