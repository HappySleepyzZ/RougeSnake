window.SNAKE_VISUAL_STYLE_MAP = {
    terrain: {
        poison: {
            baseFillRgb: '100, 20, 120',
            particleRgb: '180, 80, 220',
            borderRgb: '180, 50, 180',
            centerGlow: 'rgba(196, 84, 255, 0.55)'
        },
        slow: {
            baseFillRgb: '20, 80, 160',
            particleRgb: '100, 180, 255',
            borderRgb: '80, 160, 255',
            centerGlow: 'rgba(136, 211, 255, 0.55)'
        }
    },
    obstacleRock: {
        shadow: 'rgba(40, 48, 56, 0.45)',
        fill: '#5d6d7e',
        highlightStroke: 'rgba(223, 230, 233, 0.4)',
        symbolColor: '#c0392b',
        symbol: '!'
    },
    snakeSkin: {
        gradientStops: [
            { offset: 0, color: '#8b5e3c' },
            { offset: 0.52, color: '#a5714a' },
            { offset: 1, color: '#6b3a1f' }
        ],
        shadow: 'rgba(200, 140, 60, 0.6)',
        outerBorder: 'rgba(255, 200, 100, 0.5)',
        innerBorder: 'rgba(234, 186, 120, 0.28)',
        bandFill: 'rgba(33, 15, 6, 0.18)',
        emberStrokeRgb: '255, 184, 92',
        ridgeStroke: 'rgba(24, 10, 4, 0.30)',
        sparkle: 'rgba(255, 214, 168, 0.08)'
    }
};
