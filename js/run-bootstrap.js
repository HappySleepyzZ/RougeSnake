window.SnakeRunBootstrap = {
  install(api) {
    const {
      BASE_SPEED,
      getTileCount,
      getCurrentLevelConfig,
      getSelectedModule,
      getNow,
      generateWaveEnvironment
    } = api;

    function createStartingSnake(tileCount) {
      const centerX = Math.floor(tileCount / 2);
      const centerY = Math.floor(tileCount / 2);
      return [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
      ];
    }

    function getPortalWidth(selectedModule, currentLevelConfig) {
      return selectedModule && selectedModule.special === 'widePortal'
        ? 5
        : currentLevelConfig.portalWidth;
    }

    function getInitialFoodCount(initialFood) {
      const { min, max } = initialFood;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createStartState() {
      const tileCount = getTileCount();
      const currentLevelConfig = getCurrentLevelConfig();
      const selectedModule = getSelectedModule();
      const now = getNow();
      const currentWave = 1;

      return {
        state: {
          snake: createStartingSnake(tileCount),
          direction: { x: 1, y: 0 },
          nextDirection: { x: 1, y: 0 },
          startIndicator: null,
          foods: [],
          obstacles: [],
          snakeSkins: [],
          foodEatenCount: 0,
          score: 0,
          currentInterval: BASE_SPEED,
          backgroundHue: 240,
          speedBoostTimer: 0,
          isSpeedBoosted: false,
          dashBurstTicks: 0,
          isLevelComplete: false,
          isGameOver: false,
          teleportInvincibleSteps: 0,
          portalTeleportCooldown: 0,
          teleportPreview: null,
          teleportTrailTimer: 0,
          headGlowTimer: 0,
          remainingTime: Infinity,
          gameStartTime: now,
          waveStartTime: now,
          currentWave,
          portalWidth: getPortalWidth(selectedModule, currentLevelConfig)
        },
        waveEnvironment: generateWaveEnvironment(currentWave),
        initialFoodCount: getInitialFoodCount(currentLevelConfig.initialFood)
      };
    }

    return {
      createStartState
    };
  }
};
