window.SnakeRuntimeState = {
  install(api) {
    const {
      modeOverlay,
      resultOverlay,
      pauseOverlay,
      waveOverlay,
      pauseBtn,
      waveCountdown,
      waveTransitionDuration,
      UI_TEXT,
      getState,
      setStateValue,
      actions
    } = api;

    function setPausedState(nextPaused) {
      setStateValue('isPaused', nextPaused);
    }

    function clearWaveTransitionState() {
      setStateValue('isWaveTransition', false);
    }

    function setWaveTransitionState(nextTransitioning) {
      if (nextTransitioning) {
        setStateValue('isWaveTransition', true);
      } else {
        clearWaveTransitionState();
      }
    }

    function setCeremonyState(nextState) {
      setStateValue('waveCeremonyState', nextState);
    }

    function setShopOpenState(nextOpen) {
      setStateValue('shopOpen', nextOpen);
    }

    function setShopOpeningState(nextOpening) {
      setStateValue('shopOpening', nextOpening);
    }

    function closeShopState() {
      setShopOpeningState(false);
      setShopOpenState(false);
    }

    function restoreShopState({ shopOpen = false, shopOpening = false } = {}) {
      closeShopState();
      if (shopOpen) {
        setShopOpenState(true);
      }
      if (shopOpening) {
        setShopOpeningState(true);
      }
    }

    function finishShopOpening() {
      setShopOpeningState(false);
    }

    function beginShopOpening() {
      setCeremonyState('SHOP');
      closeShopState();
      setShopOpenState(true);
      setShopOpeningState(true);
    }

    function enterShopState() {
      if (isShopState() || isShopOpeningState()) return false;
      beginShopOpening();
      return true;
    }

    function enterWaveTransition() {
      if (isWaveTransitionState()) return false;
      setWaveTransitionState(true);
      setStateValue('waveTransitionTimer', waveTransitionDuration);
      return true;
    }

    function resetCeremonyState() {
      setCeremonyState('PLAYING');
      setStateValue('ceremonyKey', null);
      setStateValue('ceremonyChest', null);
      if (actions && typeof actions.resetLootBurstState === 'function') {
        actions.resetLootBurstState();
      }
      closeShopState();
    }

    function callActionOrFallback(name, fallback, ...args) {
      if (actions && typeof actions[name] === 'function') {
        return actions[name](...args);
      }
      return fallback(...args);
    }

    function setModeSelectionVisibility(hasSelectedMode) {
      setStateValue('hasSelectedMode', hasSelectedMode);
      modeOverlay.classList.toggle('hidden', hasSelectedMode);
    }

    function showModeOverlay() {
      return callActionOrFallback('showModeOverlay', () => setModeSelectionVisibility(false));
    }

    function hideModeOverlay() {
      return callActionOrFallback('hideModeOverlay', () => setModeSelectionVisibility(true));
    }

    function getCeremonyState() {
      return getState().waveCeremonyState;
    }

    function computeShopState() {
      const state = getState();
      return state.shopOpen || getCeremonyState() === 'SHOP';
    }

    function computeWaveTransitionState() {
      return getState().isWaveTransition;
    }

    function computePausedState() {
      return getState().isPaused;
    }

    function createCeremonyStateGuard(expectedState) {
      return function checkCeremonyState() {
        return getCeremonyState() === expectedState;
      };
    }

    function createComputedStateGuard(computeState) {
      return function checkComputedState() {
        return computeState();
      };
    }

    const runtimeStateGuards = {
      getPrimaryGameState() {
        const state = getState();
        if (state.isGameOver) return 'GAME_OVER';
        if (state.isLevelComplete) return 'LEVEL_COMPLETE';
        if (runtimeStateGuards.isShopState()) return 'SHOP';
        if (runtimeStateGuards.isWaveTransitionState()) return 'WAVE_TRANSITION';
        if (computePausedState()) return 'PAUSED';
        if (state.isWaitingForStart) return 'WAITING';
        if (state.isGameRunning) return 'RUNNING';
        return 'IDLE';
      },
      canRunGameLoop() {
        return runtimeStateGuards.getPrimaryGameState() === 'RUNNING';
      },
      canAcceptGameplayInput() {
        const primaryState = runtimeStateGuards.getPrimaryGameState();
        return getState().hasSelectedMode && primaryState !== 'PAUSED' && primaryState !== 'LEVEL_COMPLETE' && primaryState !== 'GAME_OVER';
      },
      isInTerminalOverlayState() {
        const primaryState = runtimeStateGuards.getPrimaryGameState();
        return primaryState === 'LEVEL_COMPLETE' || primaryState === 'GAME_OVER';
      },
      isInWaitingTutorialState() {
        return getState().showTutorial && runtimeStateGuards.getPrimaryGameState() === 'WAITING';
      },
      isCeremonyPlayingState: createCeremonyStateGuard('PLAYING'),
      isCeremonyKeyState: createCeremonyStateGuard('KEY_SPAWN'),
      isCeremonyChestState: createCeremonyStateGuard('CHEST_SPAWN'),
      isCeremonyLootBurstState: createCeremonyStateGuard('LOOT_BURST'),
      isShopState: createComputedStateGuard(computeShopState),
      isShopOpeningState() {
        return getState().shopOpening;
      },
      isWaveTransitionState: createComputedStateGuard(computeWaveTransitionState),
      isPausedState: createComputedStateGuard(computePausedState)
    };

    function runRuntimeStateGuard(name, fallbackValue) {
      const guard = runtimeStateGuards[name];
      if (typeof guard !== 'function') return fallbackValue;
      return guard();
    }

    function createRuntimeStateGuardRunner(name, fallbackValue) {
      return function runGuard() {
        return runRuntimeStateGuard(name, fallbackValue);
      };
    }

    const getPrimaryGameState = createRuntimeStateGuardRunner('getPrimaryGameState', 'IDLE');
    const canRunGameLoop = createRuntimeStateGuardRunner('canRunGameLoop', false);
    const canAcceptGameplayInput = createRuntimeStateGuardRunner('canAcceptGameplayInput', false);
    const isInTerminalOverlayState = createRuntimeStateGuardRunner('isInTerminalOverlayState', false);
    const isInWaitingTutorialState = createRuntimeStateGuardRunner('isInWaitingTutorialState', false);
    const isCeremonyPlayingState = createRuntimeStateGuardRunner('isCeremonyPlayingState', false);
    const isCeremonyKeyState = createRuntimeStateGuardRunner('isCeremonyKeyState', false);
    const isCeremonyChestState = createRuntimeStateGuardRunner('isCeremonyChestState', false);
    const isCeremonyLootBurstState = createRuntimeStateGuardRunner('isCeremonyLootBurstState', false);
    const isShopState = createRuntimeStateGuardRunner('isShopState', false);
    const isShopOpeningState = createRuntimeStateGuardRunner('isShopOpeningState', false);
    const isWaveTransitionState = createRuntimeStateGuardRunner('isWaveTransitionState', false);
    const isPausedState = createRuntimeStateGuardRunner('isPausedState', false);

    function getShopOverlayElement() {
      return document.getElementById('shopOverlay');
    }

    function applyStateAssignments(assignments) {
      assignments.forEach(([key, value]) => {
        setStateValue(key, value);
      });
    }

    function closeAllOverlays() {
      return callActionOrFallback('closeAllOverlays', () => {
        resultOverlay.classList.remove('show');
        pauseOverlay.classList.remove('show');
        waveOverlay.classList.remove('show');
        getShopOverlayElement().classList.remove('show');
      });
    }

    function showOverlayWithPauseSync(overlay) {
      closeAllOverlays();
      overlay.classList.add('show');
      syncPauseButtonVisibility();
    }

    function createOverlayAction(actionName, getOverlay) {
      return function showOverlay() {
        return callActionOrFallback(actionName, () => showOverlayWithPauseSync(getOverlay()));
      };
    }

    function setOverlayVisibility(overlay, visible) {
      overlay.classList.toggle('show', !!visible);
    }

    function hideTransientOverlays() {
      closeAllOverlays();
    }

    function resetPreviewFeedbackState() {
      applyStateAssignments([
        ['teleportPreview', null],
        ['teleportTrailTimer', 0],
        ['headGlowTimer', 0]
      ]);
    }

    function resetTeleportPreviewState() {
      applyStateAssignments([
        ['portalTeleportCooldown', 0],
        ['teleportPreview', null],
        ['teleportTrailTimer', 0]
      ]);
    }

    function resetWaveDebuffState() {
      applyStateAssignments([
        ['poisonDebuffEnd', 0],
        ['slowDebuffEnd', 0],
        ['terrainDotType', null]
      ]);
    }

    function resetWaveProgressState() {
      clearWaveTransitionState();
      applyStateAssignments([
        ['waveStartTime', Date.now()],
        ['foodSpawnTimer', 0]
      ]);
    }

    function clearWavePlayfieldState() {
      resetTeleportPreviewState();
      applyStateAssignments([
        ['foods', []],
        ['obstacles', []],
        ['snakeSkins', []],
        ['terrainZones', []],
        ['portalPairs', []]
      ]);
      resetWaveDebuffState();
    }

    function resetLootBurstState() {
      applyStateAssignments([
        ['lootFoods', []],
        ['lootEatenCount', 0],
        ['lootTotalCount', 0],
        ['lootBurstEndTime', 0]
      ]);
    }

    function stopActiveRuntimeLoops() {
      actions.stopGameLoop();
      actions.stopWaveTransitionCountdown();
    }

    function resetTransientState() {
      stopActiveRuntimeLoops();
      applyStateAssignments([
        ['waveTransitionTimer', 0],
        ['pauseStartTime', 0],
        ['totalPausedTime', 0],
        ['lastSlowInterval', null]
      ]);
      resetPreviewFeedbackState();
      closeAllOverlays();
    }

    function resetRunState() {
      setPausedState(false);
      applyStateAssignments([
        ['isGameRunning', false],
        ['isGameOver', false],
        ['isLevelComplete', false]
      ]);
      clearWaveTransitionState();
      resetTransientState();
    }

    function resetToWaitingState() {
      resetRunState();
      actions.hideResult();
      setStateValue('isWaitingForStart', true);
      actions.initializeWaitingUI();
      syncPauseButtonVisibility();
    }

    function syncPauseButtonVisibility() {
      return callActionOrFallback('syncPauseButtonVisibility', () => {
        pauseBtn.style.display = canRunGameLoop() ? 'block' : 'none';
      });
    }

    const showPauseOverlay = createOverlayAction('showPauseOverlay', () => pauseOverlay);
    const showShopOverlay = createOverlayAction('showShopOverlay', getShopOverlayElement);
    const showWaveOverlay = createOverlayAction('showWaveOverlay', () => waveOverlay);

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      return callActionOrFallback('restoreOverlayVisibility', () => {
        closeAllOverlays();
        setOverlayVisibility(resultOverlay, resultVisible);
        setOverlayVisibility(pauseOverlay, pauseVisible);
        setOverlayVisibility(waveOverlay, waveVisible);
        setOverlayVisibility(getShopOverlayElement(), shopVisible);
      }, { resultVisible, pauseVisible, waveVisible, shopVisible });
    }

    function restoreRuntimeByPrimaryState(primaryState) {
      stopActiveRuntimeLoops();
      if (primaryState === 'WAVE_TRANSITION' && getState().waveTransitionTimer > 0) {
        actions.restartWaveTransitionCountdown();
      } else if (primaryState === 'RUNNING') {
        actions.restartGameLoopWithCurrentState();
      }
    }

    function formatPauseSurvivalTime(totalSurvivalTime) {
      const surviveMin = Math.floor(totalSurvivalTime / 60).toString().padStart(2, '0');
      const surviveSec = Math.floor(totalSurvivalTime % 60).toString().padStart(2, '0');
      return `${surviveMin}:${surviveSec}`;
    }

    function getSelectedModuleLabel(selectedModule) {
      return selectedModule ? `${selectedModule.icon}${selectedModule.name}` : '';
    }

    function getPauseOverlayInfoText(state) {
      return UI_TEXT.pause.info(
        state.currentWave,
        state.score,
        formatPauseSurvivalTime(state.totalSurvivalTime),
        getSelectedModuleLabel(state.selectedModule)
      );
    }

    function renderPauseOverlay() {
      const state = getState();
      document.getElementById('pauseInfo').textContent = getPauseOverlayInfoText(state);
      showPauseOverlay();
    }

    function applyPauseTimeCompensation(pauseDuration) {
      const state = getState();
      applyStateAssignments([
        ['totalPausedTime', state.totalPausedTime + pauseDuration],
        ['waveStartTime', state.waveStartTime + pauseDuration],
        ['gameStartTime', state.gameStartTime + pauseDuration]
      ]);
    }

    function getWaveTransitionCountdownSeconds() {
      return Math.max(0, Math.ceil(getState().waveTransitionTimer / 1000));
    }

    function updateWaveCountdownText() {
      waveCountdown.textContent = UI_TEXT.wave.nextIn(getWaveTransitionCountdownSeconds());
    }

    function tickWaveTransitionTimer() {
      setStateValue('waveTransitionTimer', getState().waveTransitionTimer - 100);
      updateWaveCountdownText();
    }

    function restartWaveTransitionCountdown() {
      actions.stopWaveTransitionCountdown();
      updateWaveCountdownText();
      setStateValue('waveTransitionInterval', setInterval(() => {
        tickWaveTransitionTimer();
        if (getState().waveTransitionTimer <= 0) {
          actions.stopWaveTransitionCountdown();
          actions.closeAllOverlays();
          actions.advanceWave();
        }
      }, 100));
    }

    const runtimeApi = {
      setPausedState,
      clearWaveTransitionState,
      setWaveTransitionState,
      setCeremonyState,
      setShopOpenState,
      setShopOpeningState,
      closeShopState,
      restoreShopState,
      finishShopOpening,
      beginShopOpening,
      enterShopState,
      enterWaveTransition,
      resetCeremonyState,
      renderPauseOverlay,
      applyPauseTimeCompensation,
      showModeOverlay,
      hideModeOverlay,
      runtimeStateGuards,
      getPrimaryGameState,
      canRunGameLoop,
      canAcceptGameplayInput,
      isInTerminalOverlayState,
      isInWaitingTutorialState,
      isCeremonyPlayingState,
      isCeremonyKeyState,
      isCeremonyChestState,
      isCeremonyLootBurstState,
      isShopState,
      isShopOpeningState,
      isWaveTransitionState,
      isPausedState,
      getShopOverlayElement,
      closeAllOverlays,
      hideTransientOverlays,
      resetPreviewFeedbackState,
      resetTeleportPreviewState,
      resetWaveDebuffState,
      resetWaveProgressState,
      clearWavePlayfieldState,
      resetLootBurstState,
      resetTransientState,
      resetRunState,
      resetToWaitingState,
      syncPauseButtonVisibility,
      showPauseOverlay,
      showShopOverlay,
      showWaveOverlay,
      restoreOverlayVisibility,
      restoreRuntimeByPrimaryState,
      restartWaveTransitionCountdown
    };

    return runtimeApi;
  }
};
