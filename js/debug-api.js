window.SnakeDebugApi = {
  install(api) {
    const {
      modeOverlay,
      resultOverlay,
      pauseOverlay,
      waveOverlay,
      resultText,
      timerDisplay,
      scoreDisplay,
      FOOD_TYPES,
      MODE_CONFIGS,
      getState,
      setStateValue,
      actions
    } = api;

    function getRuntimeStateGuards() {
      return actions.runtimeStateGuards || {};
    }

    function resolveRuntimeGuard(name, fallbackName, fallbackValue) {
      const guards = getRuntimeStateGuards();
      if (typeof guards[name] === 'function') {
        return guards[name]();
      }
      if (fallbackName && typeof actions[fallbackName] === 'function') {
        return actions[fallbackName]();
      }
      return fallbackValue;
    }

    function getPrimaryGameState() {
      return resolveRuntimeGuard('getPrimaryGameState', 'getPrimaryGameState', 'IDLE');
    }

    function getSnapshot() {
      const state = getState();
      return {
        snake: state.snake.map(seg => ({ ...seg })),
        foods: state.foods.map(food => ({
          x: food.x,
          y: food.y,
          type: Object.keys(FOOD_TYPES).find((key) => FOOD_TYPES[key] === food.type) || food.type?.effect || null,
          pulsePhase: food.pulsePhase ?? 0,
          dangerShakePhase: food.dangerShakePhase ?? 0,
          windSpinPhase: food.windSpinPhase ?? 0
        })),
        obstacles: state.obstacles.map(obs => ({ ...obs })),
        snakeSkins: state.snakeSkins.map(skin => ({
          centerX: skin.centerX,
          centerY: skin.centerY,
          cells: skin.cells ? skin.cells.map(c => ({ ...c })) : [],
          spawnTime: skin.spawnTime
        })),
        foodEatenCount: state.foodEatenCount,
        teleportInvincibleSteps: state.teleportInvincibleSteps,
        direction: { ...state.direction },
        nextDirection: { ...state.nextDirection },
        score: state.score,
        remainingTime: state.remainingTime,
        gameStartTime: state.gameStartTime,
        waveStartTime: state.waveStartTime,
        currentWave: state.currentWave,
        isGameRunning: state.isGameRunning,
        isWaitingForStart: state.isWaitingForStart,
        isPaused: state.isPaused,
        isWaveTransition: state.isWaveTransition,
        waveTransitionTimer: state.waveTransitionTimer,
        waveCeremonyState: state.waveCeremonyState,
        ceremonyKey: state.ceremonyKey ? { ...state.ceremonyKey } : null,
        ceremonyChest: state.ceremonyChest ? { ...state.ceremonyChest } : null,
        shopOpen: state.shopOpen,
        shopOpening: state.shopOpening,
        currentMode: state.currentMode,
        hasSelectedMode: state.hasSelectedMode,
        isLevelComplete: state.isLevelComplete,
        isGameOver: state.isGameOver,
        showTutorial: state.showTutorial,
        tutorialTimer: state.tutorialTimer,
        currentInterval: state.currentInterval,
        backgroundHue: state.backgroundHue,
        speedBoostTimer: state.speedBoostTimer,
        isSpeedBoosted: state.isSpeedBoosted,
        poisonDebuffEnd: state.poisonDebuffEnd,
        slowDebuffEnd: state.slowDebuffEnd,
        terrainSlowActive: state.terrainSlowActive,
        terrainDotType: state.terrainDotType,
        portalTeleportCooldown: state.portalTeleportCooldown,
        totalPausedTime: state.totalPausedTime,
        startIndicator: state.startIndicator ? { ...state.startIndicator } : null,
        teleportPreview: state.teleportPreview ? { ...state.teleportPreview } : null,
        teleportTrailTimer: state.teleportTrailTimer,
        headGlowTimer: state.headGlowTimer,
        selectedModule: state.selectedModule || null,
        resultVisible: resultOverlay.classList.contains('show'),
        pauseVisible: pauseOverlay.classList.contains('show'),
        waveVisible: waveOverlay.classList.contains('show'),
        shopVisible: actions.getShopOverlayElement().classList.contains('show'),
        resultText: resultText.textContent,
        timerText: timerDisplay.textContent,
        scoreText: scoreDisplay.textContent
      };
    }

    function setSnapshot(state = {}) {
      if (Array.isArray(state.snake)) {
        setStateValue('snake', state.snake.map(seg => ({ ...seg })));
      }
      if (Array.isArray(state.foods)) {
        setStateValue('foods', state.foods.map(food => {
          const type = typeof food.type === 'string' ? FOOD_TYPES[food.type] : food.type;
          return {
            x: food.x,
            y: food.y,
            type,
            pulsePhase: food.pulsePhase ?? 0,
            dangerShakePhase: food.dangerShakePhase ?? 0,
            windSpinPhase: food.windSpinPhase ?? 0
          };
        }));
      }
      if (Array.isArray(state.obstacles)) {
        setStateValue('obstacles', state.obstacles.map(obs => ({ ...obs })));
      }
      if (Array.isArray(state.snakeSkins)) {
        setStateValue('snakeSkins', state.snakeSkins.map(skin => ({
          centerX: skin.centerX,
          centerY: skin.centerY,
          cells: skin.cells ? skin.cells.map(c => ({ ...c })) : [],
          spawnTime: skin.spawnTime
        })));
      }

      const scalarAssignments = [
        ['foodEatenCount', 'number'],
        ['teleportInvincibleSteps', 'number'],
        ['score', 'number'],
        ['remainingTime', 'number'],
        ['gameStartTime', 'number'],
        ['isGameRunning', 'boolean'],
        ['isWaitingForStart', 'boolean'],
        ['waveTransitionTimer', 'number'],
        ['currentWave', 'number'],
        ['waveStartTime', 'number'],
        ['isLevelComplete', 'boolean'],
        ['isGameOver', 'boolean'],
        ['showTutorial', 'boolean'],
        ['tutorialTimer', 'number'],
        ['currentInterval', 'number'],
        ['backgroundHue', 'number'],
        ['speedBoostTimer', 'number'],
        ['isSpeedBoosted', 'boolean'],
        ['poisonDebuffEnd', 'number'],
        ['slowDebuffEnd', 'number'],
        ['terrainSlowActive', 'boolean'],
        ['portalTeleportCooldown', 'number'],
        ['totalPausedTime', 'number'],
        ['teleportTrailTimer', 'number'],
        ['headGlowTimer', 'number']
      ];

      scalarAssignments.forEach(([key, expectedType]) => {
        if (typeof state[key] === expectedType) {
          setStateValue(key, state[key]);
        }
      });

      if (typeof state.isPaused === 'boolean' && typeof actions.setPausedState === 'function') {
        actions.setPausedState(state.isPaused);
      }
      if (typeof state.isWaveTransition === 'boolean' && typeof actions.setWaveTransitionState === 'function') {
        actions.setWaveTransitionState(state.isWaveTransition);
      }
      if (typeof state.waveCeremonyState === 'string' && typeof actions.setCeremonyState === 'function') {
        actions.setCeremonyState(state.waveCeremonyState);
      }
      if (typeof state.hasSelectedMode === 'boolean') {
        setStateValue('hasSelectedMode', state.hasSelectedMode);
        modeOverlay.classList.toggle('hidden', state.hasSelectedMode);
      }
      if (state.direction) setStateValue('direction', { ...state.direction });
      if (state.nextDirection) setStateValue('nextDirection', { ...state.nextDirection });
      if (state.ceremonyKey !== undefined) setStateValue('ceremonyKey', state.ceremonyKey ? { ...state.ceremonyKey } : null);
      if (state.ceremonyChest !== undefined) setStateValue('ceremonyChest', state.ceremonyChest ? { ...state.ceremonyChest } : null);
      if (state.terrainDotType !== undefined) setStateValue('terrainDotType', state.terrainDotType);
      if (state.startIndicator !== undefined) setStateValue('startIndicator', state.startIndicator ? { ...state.startIndicator } : null);
      if (state.teleportPreview !== undefined) setStateValue('teleportPreview', state.teleportPreview ? { ...state.teleportPreview } : null);

      const hasShopOpen = typeof state.shopOpen === 'boolean';
      const hasShopOpening = typeof state.shopOpening === 'boolean';
      if ((hasShopOpen || hasShopOpening) && typeof actions.restoreShopState === 'function') {
        actions.restoreShopState({
          shopOpen: hasShopOpen ? state.shopOpen : false,
          shopOpening: hasShopOpening ? state.shopOpening : false
        });
      }

      if (typeof state.currentMode === 'string' && MODE_CONFIGS[state.currentMode]) {
        actions.applyModeConfig(state.currentMode);
      }

      if (typeof actions.restoreOverlayVisibility === 'function') {
        actions.restoreOverlayVisibility({
          resultVisible: state.resultVisible,
          pauseVisible: state.pauseVisible,
          waveVisible: state.waveVisible,
          shopVisible: state.shopVisible
        });
      }

      const primaryState = getPrimaryGameState();
      if (typeof actions.restoreRuntimeByPrimaryState === 'function') {
        actions.restoreRuntimeByPrimaryState(primaryState);
      }
      if (typeof actions.syncPauseButtonVisibility === 'function') {
        actions.syncPauseButtonVisibility();
      }
      if (typeof actions.updateTouchHint === 'function') {
        actions.updateTouchHint();
      }
      if (typeof actions.updateStatusUI === 'function') {
        actions.updateStatusUI();
      }
    }

    function setFoods(foodDefs) {
      setStateValue('foods', foodDefs.map(food => ({
        x: food.x,
        y: food.y,
        type: FOOD_TYPES[food.type],
        pulsePhase: food.pulsePhase ?? 0,
        dangerShakePhase: food.dangerShakePhase ?? 0,
        windSpinPhase: food.windSpinPhase ?? 0
      })));
    }

    return {
      getState: getSnapshot,
      setState: setSnapshot,
      setFoods
    };
  }
};
