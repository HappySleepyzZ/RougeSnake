window.SnakeWaveGeneration = {
  install(api) {
    const {
      TUNING,
      getSnake,
      getTileCount,
      isPositionOccupied
    } = api;

    function getTerrainCounts(currentWave) {
      if (currentWave <= 1) return { ...TUNING.terrain.baseCounts.wave1 };
      if (currentWave === 2) return { ...TUNING.terrain.baseCounts.wave2 };
      if (currentWave === 3) return { ...TUNING.terrain.baseCounts.wave3 };
      return {
        poison: 2 + Math.floor((currentWave - 3) / 2),
        slow: 2 + Math.ceil((currentWave - 3) / 2)
      };
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
      const counts = getTerrainCounts(currentWave);
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
      let count = 0;
      if (currentWave >= 1) count = 1;
      if (currentWave >= 3) count = 2;
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
      return {
        terrainZones: generateTerrainZones(currentWave),
        portalPairs: generatePortalPairs(currentWave)
      };
    }

    return {
      generateWaveEnvironment
    };
  }
};
