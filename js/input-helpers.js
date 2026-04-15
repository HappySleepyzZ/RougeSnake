window.SnakeInputHelpers = {
  install(api) {
    const {
      touchControls,
      canvas,
      getState,
      setStateValue,
      actions,
      shouldHandleDirectionInput,
      directionInputMap
    } = api;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchTracking = false;
    let touchStartedOnControl = false;

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

    function canAcceptGameplayInput() {
      return resolveRuntimeGuard('canAcceptGameplayInput', 'canAcceptGameplayInput', false);
    }

    function isInTerminalOverlayState() {
      return resolveRuntimeGuard('isInTerminalOverlayState', 'isInTerminalOverlayState', false);
    }

    function isInWaitingTutorialState() {
      return resolveRuntimeGuard('isInWaitingTutorialState', 'isInWaitingTutorialState', false);
    }

    function canQueueDirection() {
      if (!getState().hasSelectedMode) return false;
      if (getPrimaryGameState() === 'PAUSED') return false;
      return true;
    }

    function submitDirectionInput(inputKey) {
      if (!shouldHandleDirectionInput()) return;
      const next = directionInputMap[inputKey];
      if (!next) return;
      queueDirection(next);
    }

    function handlePreGameDirectionInput(next) {
      if (getState().showTutorial) {
        setStateValue('showTutorial', false);
      }
      setStateValue('nextDirection', next);
      actions.startGame();
    }

    function tryApplyAxisDirection(next) {
      const state = getState();
      if (next.x !== 0 && state.direction.x !== -next.x) {
        setStateValue('nextDirection', next);
        return state.direction.x !== next.x || state.direction.y !== next.y;
      }
      if (next.y !== 0 && state.direction.y !== -next.y) {
        setStateValue('nextDirection', next);
        return state.direction.x !== next.x || state.direction.y !== next.y;
      }
      return false;
    }

    function handleInGameDirectionInput(next) {
      if (!canAcceptGameplayInput() || !getState().isGameRunning) return;
      const directionChanged = tryApplyAxisDirection(next);
      if (directionChanged) {
        actions.triggerDashBurst();
      }
    }

    function queueDirection(next) {
      if (!next || !canQueueDirection()) return;
      if (getPrimaryGameState() === 'WAITING') {
        handlePreGameDirectionInput(next);
        return;
      }
      handleInGameDirectionInput(next);
    }

    function handleKeyboardDirectionInput(e) {
      const primaryState = getPrimaryGameState();
      if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && (primaryState === 'RUNNING' || primaryState === 'PAUSED')) {
        if (primaryState === 'PAUSED') actions.resumeGame(); else actions.pauseGame();
        return;
      }
      if (!getState().hasSelectedMode) return;
      if (primaryState === 'PAUSED') return;
      if (isInTerminalOverlayState()) {
        if (e.key === 'Enter' || e.key === ' ') {
          actions.resetToWaitingState();
        }
        return;
      }
      if (isInWaitingTutorialState()) {
        setStateValue('showTutorial', false);
        return;
      }
      if (!shouldHandleDirectionInput()) return;
      submitDirectionInput(e.key);
    }

    function isInteractiveTouchTarget(target) {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest('[data-direction], button, .mode-overlay, .result-overlay, #pauseBtn, #legend');
    }

    function handleTouchStart(e) {
      if (!e.touches || !e.touches.length) return;
      touchStartedOnControl = isInteractiveTouchTarget(e.target);
      touchTracking = !touchStartedOnControl;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      if (touchTracking) {
        e.preventDefault();
      }
    }

    function handleSwipeDirectionInput(e) {
      if (!touchTracking || touchStartedOnControl) {
        touchTracking = false;
        touchStartedOnControl = false;
        return;
      }
      if (!getState().hasSelectedMode) {
        touchTracking = false;
        return;
      }
      if (getPrimaryGameState() === 'PAUSED') {
        touchTracking = false;
        return;
      }
      if (isInTerminalOverlayState()) {
        actions.resetToWaitingState();
        touchTracking = false;
        return;
      }
      if (isInWaitingTutorialState()) {
        setStateValue('showTutorial', false);
        touchTracking = false;
        return;
      }
      if (!shouldHandleDirectionInput()) {
        touchTracking = false;
        return;
      }
      if (!e.changedTouches || !e.changedTouches.length) {
        touchTracking = false;
        return;
      }
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      touchTracking = false;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        submitDirectionInput(dx > 0 ? 'right' : 'left');
      } else {
        submitDirectionInput(dy > 0 ? 'down' : 'up');
      }
    }

    function handleCanvasClick() {
      if (!getState().hasSelectedMode) return;
      if (isInWaitingTutorialState()) {
        setStateValue('showTutorial', false);
      }
    }

    function handleButtonDirectionInput(button) {
      if (!button) return;
      if (!getState().hasSelectedMode) return;
      if (getPrimaryGameState() === 'PAUSED') return;
      if (isInTerminalOverlayState()) {
        actions.resetToWaitingState();
        return;
      }
      if (isInWaitingTutorialState()) {
        setStateValue('showTutorial', false);
      }
      if (!shouldHandleDirectionInput()) return;
      const key = button.dataset.direction;
      submitDirectionInput(key);
    }

    function bind() {
      document.addEventListener('keydown', handleKeyboardDirectionInput);
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleSwipeDirectionInput, { passive: true });
      canvas.addEventListener('click', handleCanvasClick);
      touchControls.forEach((button) => {
        button.addEventListener('click', () => {
          handleButtonDirectionInput(button);
        });
        button.addEventListener('touchstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
          touchStartedOnControl = true;
          touchTracking = false;
          handleButtonDirectionInput(button);
        }, { passive: false });
        button.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') {
            e.preventDefault();
            touchStartedOnControl = true;
            touchTracking = false;
            handleButtonDirectionInput(button);
          }
        });
      });
    }

    return {
      canQueueDirection,
      submitDirectionInput,
      handlePreGameDirectionInput,
      tryApplyAxisDirection,
      handleInGameDirectionInput,
      queueDirection,
      handleKeyboardDirectionInput,
      handleSwipeDirectionInput,
      handleButtonDirectionInput,
      bind
    };
  }
};
