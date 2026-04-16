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

    function cloneVector(value) {
      return value ? { ...value } : value;
    }

    function cloneOptionalState(value) {
      return value ? { ...value } : null;
    }

    function cloneCells(cells) {
      return Array.isArray(cells) ? cells.map(cell => ({ ...cell })) : [];
    }

    function serializeFoodType(type) {
      return Object.keys(FOOD_TYPES).find((key) => FOOD_TYPES[key] === type) || type?.effect || null;
    }

    function serializeFood(food) {
      return {
        x: food.x,
        y: food.y,
        type: serializeFoodType(food.type),
        pulsePhase: food.pulsePhase ?? 0,
        dangerShakePhase: food.dangerShakePhase ?? 0,
        windSpinPhase: food.windSpinPhase ?? 0
      };
    }

    function deserializeFood(food) {
      const type = typeof food.type === 'string' ? FOOD_TYPES[food.type] : food.type;
      return {
        x: food.x,
        y: food.y,
        type,
        pulsePhase: food.pulsePhase ?? 0,
        dangerShakePhase: food.dangerShakePhase ?? 0,
        windSpinPhase: food.windSpinPhase ?? 0
      };
    }

    function cloneSnakeSkin(skin) {
      return {
        centerX: skin.centerX,
        centerY: skin.centerY,
        cells: cloneCells(skin.cells),
        spawnTime: skin.spawnTime
      };
    }

    function applyMappedArrayAssignments(state, assignments) {
      assignments.forEach(([key, mapper]) => {
        if (Array.isArray(state[key])) {
          setStateValue(key, state[key].map(mapper));
        }
      });
    }

    function applyScalarAssignments(state, assignments) {
      assignments.forEach(([key, expectedType]) => {
        if (typeof state[key] === expectedType) {
          setStateValue(key, state[key]);
        }
      });
    }

    function applyRuntimeStateSetters(state) {
      if (typeof state.isPaused === 'boolean' && typeof actions.setPausedState === 'function') {
        actions.setPausedState(state.isPaused);
      }
      if (typeof state.isWaveTransition === 'boolean' && typeof actions.setWaveTransitionState === 'function') {
        actions.setWaveTransitionState(state.isWaveTransition);
      }
      if (typeof state.waveCeremonyState === 'string' && typeof actions.setCeremonyState === 'function') {
        actions.setCeremonyState(state.waveCeremonyState);
      }
    }

    function applyModeSelectionState(state) {
      if (typeof state.hasSelectedMode === 'boolean') {
        setStateValue('hasSelectedMode', state.hasSelectedMode);
        modeOverlay.classList.toggle('hidden', state.hasSelectedMode);
      }
    }

    function applyMappedObjectAssignments(state, assignments) {
      assignments.forEach(([key, mapper]) => {
        if (state[key] !== undefined) {
          setStateValue(key, mapper(state[key]));
        }
      });
    }

    function restoreShopState(state) {
      const hasShopOpen = typeof state.shopOpen === 'boolean';
      const hasShopOpening = typeof state.shopOpening === 'boolean';
      if ((hasShopOpen || hasShopOpening) && typeof actions.restoreShopState === 'function') {
        actions.restoreShopState({
          shopOpen: hasShopOpen ? state.shopOpen : false,
          shopOpening: hasShopOpening ? state.shopOpening : false
        });
      }
    }

    function restoreVisualState(state) {
      if (typeof actions.restoreOverlayVisibility === 'function') {
        actions.restoreOverlayVisibility({
          resultVisible: state.resultVisible,
          pauseVisible: state.pauseVisible,
          waveVisible: state.waveVisible,
          shopVisible: state.shopVisible
        });
      }
    }

    function refreshRuntimeUi() {
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

    function applySnapshotPostRestoreState(state) {
      restoreShopState(state);

      if (typeof state.currentMode === 'string' && MODE_CONFIGS[state.currentMode]) {
        actions.applyModeConfig(state.currentMode);
      }

      restoreVisualState(state);
      refreshRuntimeUi();
    }

    function getOverlayVisibilitySnapshot() {
      return {
        resultVisible: resultOverlay.classList.contains('show'),
        pauseVisible: pauseOverlay.classList.contains('show'),
        waveVisible: waveOverlay.classList.contains('show'),
        shopVisible: actions.getShopOverlayElement().classList.contains('show')
      };
    }

    function getTextSnapshot() {
      return {
        resultText: resultText.textContent,
        timerText: timerDisplay.textContent,
        scoreText: scoreDisplay.textContent
      };
    }

    const snapshotArrayAssignments = [
      ['snake', (seg) => ({ ...seg })],
      ['foods', deserializeFood],
      ['obstacles', (obs) => ({ ...obs })],
      ['snakeSkins', cloneSnakeSkin]
    ];

    const snapshotScalarAssignments = [
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

    const snapshotObjectAssignments = [
      ['ceremonyKey', cloneOptionalState],
      ['ceremonyChest', cloneOptionalState],
      ['startIndicator', cloneOptionalState],
      ['teleportPreview', cloneOptionalState]
    ];

    function applyDirectionalState(state) {
      if (state.direction) setStateValue('direction', cloneVector(state.direction));
      if (state.nextDirection) setStateValue('nextDirection', cloneVector(state.nextDirection));
    }

    function getSnapshot() {
      const state = getState();
      return {
        snake: state.snake.map(seg => ({ ...seg })),
        foods: state.foods.map(serializeFood),
        obstacles: state.obstacles.map(obs => ({ ...obs })),
        snakeSkins: state.snakeSkins.map(cloneSnakeSkin),
        foodEatenCount: state.foodEatenCount,
        teleportInvincibleSteps: state.teleportInvincibleSteps,
        direction: cloneVector(state.direction),
        nextDirection: cloneVector(state.nextDirection),
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
        ceremonyKey: cloneOptionalState(state.ceremonyKey),
        ceremonyChest: cloneOptionalState(state.ceremonyChest),
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
        startIndicator: cloneOptionalState(state.startIndicator),
        teleportPreview: cloneOptionalState(state.teleportPreview),
        teleportTrailTimer: state.teleportTrailTimer,
        headGlowTimer: state.headGlowTimer,
        selectedModule: state.selectedModule || null,
        ...getOverlayVisibilitySnapshot(),
        ...getTextSnapshot()
      };
    }

    function setSnapshot(state = {}) {
      applyMappedArrayAssignments(state, snapshotArrayAssignments);
      applyScalarAssignments(state, snapshotScalarAssignments);
      applyRuntimeStateSetters(state);
      applyModeSelectionState(state);
      applyDirectionalState(state);
      if (state.terrainDotType !== undefined) setStateValue('terrainDotType', state.terrainDotType);
      applyMappedObjectAssignments(state, snapshotObjectAssignments);
      applySnapshotPostRestoreState(state);
    }

    function setFoods(foodDefs) {
      setStateValue('foods', foodDefs.map(deserializeFood));
    }

    const debugApi = {
      getState: getSnapshot,
      setState: setSnapshot,
      setFoods
    };

    return debugApi;
  }
};
