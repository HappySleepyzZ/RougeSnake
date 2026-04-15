window.SnakeRuntimeState = {
  install(api) {
    const {
      modeOverlay,
      resultOverlay,
      pauseOverlay,
      waveOverlay,
      pauseBtn,
      waveCountdown,
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

    function showModeOverlay() {
      setStateValue('hasSelectedMode', false);
      modeOverlay.classList.remove('hidden');
    }

    function hideModeOverlay() {
      setStateValue('hasSelectedMode', true);
      modeOverlay.classList.add('hidden');
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
      isCeremonyPlayingState() {
        return getCeremonyState() === 'PLAYING';
      },
      isCeremonyKeyState() {
        return getCeremonyState() === 'KEY_SPAWN';
      },
      isCeremonyChestState() {
        return getCeremonyState() === 'CHEST_SPAWN';
      },
      isCeremonyLootBurstState() {
        return getCeremonyState() === 'LOOT_BURST';
      },
      isShopState() {
        return computeShopState();
      },
      isShopOpeningState() {
        return getState().shopOpening;
      },
      isWaveTransitionState() {
        return computeWaveTransitionState();
      },
      isPausedState() {
        return computePausedState();
      }
    };

    function runRuntimeStateGuard(name, fallbackValue) {
      const guard = runtimeStateGuards[name];
      if (typeof guard !== 'function') return fallbackValue;
      return guard();
    }

    function getPrimaryGameState() {
      return runRuntimeStateGuard('getPrimaryGameState', 'IDLE');
    }

    function canRunGameLoop() {
      return runRuntimeStateGuard('canRunGameLoop', false);
    }

    function canAcceptGameplayInput() {
      return runRuntimeStateGuard('canAcceptGameplayInput', false);
    }

    function isInTerminalOverlayState() {
      return runRuntimeStateGuard('isInTerminalOverlayState', false);
    }

    function isInWaitingTutorialState() {
      return runRuntimeStateGuard('isInWaitingTutorialState', false);
    }

    function isCeremonyPlayingState() {
      return runRuntimeStateGuard('isCeremonyPlayingState', false);
    }

    function isCeremonyKeyState() {
      return runRuntimeStateGuard('isCeremonyKeyState', false);
    }

    function isCeremonyChestState() {
      return runRuntimeStateGuard('isCeremonyChestState', false);
    }

    function isCeremonyLootBurstState() {
      return runRuntimeStateGuard('isCeremonyLootBurstState', false);
    }

    function isShopState() {
      return runRuntimeStateGuard('isShopState', false);
    }

    function isShopOpeningState() {
      return runRuntimeStateGuard('isShopOpeningState', false);
    }

    function isWaveTransitionState() {
      return runRuntimeStateGuard('isWaveTransitionState', false);
    }

    function isPausedState() {
      return runRuntimeStateGuard('isPausedState', false);
    }

    function getShopOverlayElement() {
      return document.getElementById('shopOverlay');
    }

    function closeAllOverlays() {
      resultOverlay.classList.remove('show');
      pauseOverlay.classList.remove('show');
      waveOverlay.classList.remove('show');
      getShopOverlayElement().classList.remove('show');
    }

    function hideTransientOverlays() {
      closeAllOverlays();
    }

    function resetPreviewFeedbackState() {
      setStateValue('teleportPreview', null);
      setStateValue('teleportTrailTimer', 0);
      setStateValue('headGlowTimer', 0);
    }

    function resetTransientState() {
      actions.stopWaveTransitionCountdown();
      setStateValue('waveTransitionTimer', 0);
      setStateValue('pauseStartTime', 0);
      setStateValue('totalPausedTime', 0);
      setStateValue('lastSlowInterval', null);
      resetPreviewFeedbackState();
      closeAllOverlays();
    }

    function resetRunState() {
      setPausedState(false);
      setStateValue('isGameRunning', false);
      setStateValue('isGameOver', false);
      setStateValue('isLevelComplete', false);
      clearWaveTransitionState();
      actions.stopGameLoop();
      resetTransientState();
    }

    function resetToWaitingState() {
      actions.hideResult();
      setStateValue('isWaitingForStart', true);
      actions.initializeWaitingUI();
    }

    function syncPauseButtonVisibility() {
      pauseBtn.style.display = canRunGameLoop() ? 'block' : 'none';
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

    function restoreOverlayVisibility({ resultVisible = false, pauseVisible = false, waveVisible = false, shopVisible = false } = {}) {
      closeAllOverlays();
      resultOverlay.classList.toggle('show', !!resultVisible);
      pauseOverlay.classList.toggle('show', !!pauseVisible);
      waveOverlay.classList.toggle('show', !!waveVisible);
      getShopOverlayElement().classList.toggle('show', !!shopVisible);
    }

    function restoreRuntimeByPrimaryState(primaryState) {
      actions.stopGameLoop();
      actions.stopWaveTransitionCountdown();
      if (primaryState === 'WAVE_TRANSITION' && getState().waveTransitionTimer > 0) {
        actions.restartWaveTransitionCountdown();
      } else if (primaryState === 'RUNNING') {
        actions.restartGameLoopWithCurrentState();
      }
    }

    function renderPauseOverlay() {
      const state = getState();
      const surviveMin = Math.floor(state.totalSurvivalTime / 60).toString().padStart(2, '0');
      const surviveSec = Math.floor(state.totalSurvivalTime % 60).toString().padStart(2, '0');
      const modName = state.selectedModule ? `${state.selectedModule.icon}${state.selectedModule.name}` : '';
      document.getElementById('pauseInfo').textContent = UI_TEXT.pause.info(state.currentWave, state.score, `${surviveMin}:${surviveSec}`, modName);
      showPauseOverlay();
    }

    function applyPauseTimeCompensation(pauseDuration) {
      const state = getState();
      setStateValue('totalPausedTime', state.totalPausedTime + pauseDuration);
      setStateValue('waveStartTime', state.waveStartTime + pauseDuration);
      setStateValue('gameStartTime', state.gameStartTime + pauseDuration);
    }

    function restartWaveTransitionCountdown() {
      actions.stopWaveTransitionCountdown();
      waveCountdown.textContent = UI_TEXT.wave.nextIn(Math.max(0, Math.ceil(getState().waveTransitionTimer / 1000)));
      setStateValue('waveTransitionInterval', setInterval(() => {
        setStateValue('waveTransitionTimer', getState().waveTransitionTimer - 100);
        const secs = Math.max(0, Math.ceil(getState().waveTransitionTimer / 1000));
        waveCountdown.textContent = UI_TEXT.wave.nextIn(secs);
        if (getState().waveTransitionTimer <= 0) {
          actions.stopWaveTransitionCountdown();
          actions.closeAllOverlays();
          actions.advanceWave();
        }
      }, 100));
    }

    return {
      setPausedState,
      clearWaveTransitionState,
      setWaveTransitionState,
      setCeremonyState,
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
  }
};
