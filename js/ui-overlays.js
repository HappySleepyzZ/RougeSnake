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

    function syncPauseButtonVisibility() {
      pauseBtn.style.display = canRunGameLoopGuarded() ? 'block' : 'none';
    }

    function showPauseOverlay() {
      closeAllOverlays();
      pauseOverlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function showShopOverlay() {
      closeAllOverlays();
      getShopOverlayElement().classList.add('show');
      syncPauseButtonVisibility();
    }

    function showWaveOverlay() {
      closeAllOverlays();
      waveOverlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function showOnlyResultOverlay() {
      closeAllOverlays();
      resultOverlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      closeAllOverlays();
      resultOverlay.classList.toggle('show', !!resultVisible);
      pauseOverlay.classList.toggle('show', !!pauseVisible);
      waveOverlay.classList.toggle('show', !!waveVisible);
      getShopOverlayElement().classList.toggle('show', !!shopVisible);
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
