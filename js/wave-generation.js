window.SnakeWaveGeneration = {
  install(api) {
    const {
      TUNING,
      getSnake,
      getTileCount,
      isPositionOccupied
    } = api;

    const WAVE_PROFILES = {
      1: {
        key: 'onboarding',
        themeName: '试炼开场',
        durationMs: 12000,
        backgroundHue: 32,
        terrainCounts: { poison: 0, slow: 0 },
        portalPairCount: 0
      },
      2: {
        key: 'frost',
        themeName: '寒潮来袭',
        durationMs: 18000,
        backgroundHue: 196,
        terrainCounts: { poison: 0, slow: 1 },
        portalPairCount: 0
      },
      3: {
        key: 'poison',
        themeName: '毒雾蔓延',
        durationMs: 20000,
        backgroundHue: 286,
        terrainCounts: { poison: 1, slow: 1 },
        portalPairCount: 0
      },
      4: {
        key: 'rift',
        themeName: '裂隙开启',
        durationMs: 22000,
        backgroundHue: 156,
        terrainCounts: { poison: 1, slow: 1 },
        portalPairCount: 1
      }
    };

    function cloneProfile(wave, profile) {
      return {
        wave,
        key: profile.key,
        themeName: profile.themeName,
        durationMs: profile.durationMs,
        backgroundHue: profile.backgroundHue,
        terrainCounts: { ...profile.terrainCounts },
        portalPairCount: profile.portalPairCount
      };
    }

    function getInfiniteWaveProfile(currentWave) {
      const extraWaveIndex = currentWave - 5;
      const tier = Math.floor(extraWaveIndex / 3);
      const phase = extraWaveIndex % 3;

      if (phase === 0) {
        return {
          key: 'frost-surge',
          themeName: '寒潮加剧',
          durationMs: Math.min(30000, 24000 + tier * 1000),
          backgroundHue: 194,
          terrainCounts: { poison: 1 + tier, slow: 2 + tier },
          portalPairCount: 1 + Math.floor(tier / 2)
        };
      }

      if (phase === 1) {
        return {
          key: 'venom-tide',
          themeName: '毒潮翻涌',
          durationMs: Math.min(30000, 25000 + tier * 1000),
          backgroundHue: 292,
          terrainCounts: { poison: 2 + tier, slow: 1 + tier },
          portalPairCount: 1 + Math.floor(tier / 2)
        };
      }

      return {
        key: 'rift-storm',
        themeName: '裂隙共振',
        durationMs: Math.min(30000, 26000 + tier * 1000),
        backgroundHue: 164,
        terrainCounts: { poison: 2 + tier, slow: 2 + tier },
        portalPairCount: 2 + Math.floor(tier / 2)
      };
    }

    function getWaveProfile(currentWave) {
      if (WAVE_PROFILES[currentWave]) {
        return cloneProfile(currentWave, WAVE_PROFILES[currentWave]);
      }
      return cloneProfile(currentWave, getInfiniteWaveProfile(currentWave));
    }

    function spawnTerrainZone(type) {
      const tileCount = getTileCount();
      const padding = TUNING.terrain.spawnPadding;
      const head = getSnake()[0];
      for (let attempts = 0; attempts < TUNING.generation.terrainZoneSpawnAttempts; attempts++) {
        const cx = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
        const cy = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
        if (Math.abs(cx - head.x) + Math.abs(cy - head.y) < TUNING.terrain.minHeadDistance) continue;
        const cells = [];
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const x = cx + dx;
            const y = cy + dy;
            if (x < 0 || x >= tileCount || y < 0 || y >= tileCount) continue;
            cells.push({ x, y });
          }
        }
        return { type, centerX: cx, centerY: cy, cells };
      }
      return null;
    }

    function generateTerrainZones(currentWave) {
      const profile = getWaveProfile(currentWave);
      const counts = profile.terrainCounts;
      const terrainZones = [];
      for (let i = 0; i < counts.poison; i++) {
        const zone = spawnTerrainZone('poison');
        if (zone) terrainZones.push(zone);
      }
      for (let i = 0; i < counts.slow; i++) {
        const zone = spawnTerrainZone('slow');
        if (zone) terrainZones.push(zone);
      }
      return terrainZones;
    }

    function generatePortalPairs(currentWave) {
      const tileCount = getTileCount();
      const padding = TUNING.terrain.spawnPadding;
      const head = getSnake()[0];
      const portalPairs = [];
      const count = getWaveProfile(currentWave).portalPairCount;
      for (let i = 0; i < count; i++) {
        let pair = null;
        for (let attempts = 0; attempts < TUNING.generation.portalSpawnAttempts; attempts++) {
          const ax = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
          const ay = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
          if (Math.abs(ax - head.x) + Math.abs(ay - head.y) < TUNING.terrain.minHeadDistance) continue;
          if (isPositionOccupied(ax, ay)) continue;
          for (let partnerAttempts = 0; partnerAttempts < 50; partnerAttempts++) {
            const bx = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
            const by = Math.floor(Math.random() * (tileCount - padding * 2)) + padding;
            if (Math.abs(bx - ax) + Math.abs(by - ay) < 6) continue;
            if (Math.abs(bx - head.x) + Math.abs(by - head.y) < 5) continue;
            if (isPositionOccupied(bx, by)) continue;
            pair = {
              a: { x: ax, y: ay },
              b: { x: bx, y: by },
              hue: Math.floor(Math.random() * 360)
            };
            break;
          }
          if (pair) break;
        }
        if (pair) portalPairs.push(pair);
      }
      return portalPairs;
    }

    function generateWaveEnvironment(currentWave) {
      const profile = getWaveProfile(currentWave);
      return {
        profile,
        terrainZones: generateTerrainZones(currentWave),
        portalPairs: generatePortalPairs(currentWave)
      };
    }

    return {
      getWaveProfile,
      generateWaveEnvironment
    };
  }
};
