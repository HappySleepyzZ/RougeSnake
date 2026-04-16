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

    function createRuntimeGuardResolver(name, fallbackName, fallbackValue) {
      return function resolveGuard() {
        return resolveRuntimeGuard(name, fallbackName, fallbackValue);
      };
    }

    const getPrimaryGameState = createRuntimeGuardResolver('getPrimaryGameState', 'getPrimaryGameState', 'IDLE');
    const canAcceptGameplayInput = createRuntimeGuardResolver('canAcceptGameplayInput', 'canAcceptGameplayInput', false);
    const isInTerminalOverlayState = createRuntimeGuardResolver('isInTerminalOverlayState', 'isInTerminalOverlayState', false);
    const isInWaitingTutorialState = createRuntimeGuardResolver('isInWaitingTutorialState', 'isInWaitingTutorialState', false);

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
      dismissTutorial();
      setStateValue('nextDirection', next);
      actions.startGame();
    }

    function dismissTutorial() {
      if (getState().showTutorial) {
        setStateValue('showTutorial', false);
      }
    }

    function resetToWaitingFromTerminalState() {
      actions.resetToWaitingState();
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
          resetToWaitingFromTerminalState();
        }
        return;
      }
      if (isInWaitingTutorialState()) {
        dismissTutorial();
        return;
      }
      if (!shouldHandleDirectionInput()) return;
      submitDirectionInput(e.key);
    }

    function isInteractiveTouchTarget(target) {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest('[data-direction], button, .mode-overlay, .result-overlay, #pauseBtn, #legend');
    }

    function resetTouchTracking() {
      touchTracking = false;
      touchStartedOnControl = false;
    }

    function resolveSwipeInputKey(dx, dy) {
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
      }
      return dy > 0 ? 'down' : 'up';
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
        resetTouchTracking();
        return;
      }
      if (!getState().hasSelectedMode) {
        resetTouchTracking();
        return;
      }
      if (getPrimaryGameState() === 'PAUSED') {
        resetTouchTracking();
        return;
      }
      if (isInTerminalOverlayState()) {
        resetToWaitingFromTerminalState();
        resetTouchTracking();
        return;
      }
      if (isInWaitingTutorialState()) {
        dismissTutorial();
        resetTouchTracking();
        return;
      }
      if (!shouldHandleDirectionInput()) {
        resetTouchTracking();
        return;
      }
      if (!e.changedTouches || !e.changedTouches.length) {
        resetTouchTracking();
        return;
      }
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      resetTouchTracking();
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      submitDirectionInput(resolveSwipeInputKey(dx, dy));
    }

    function handleCanvasClick() {
      if (!getState().hasSelectedMode) return;
      if (isInWaitingTutorialState()) {
        dismissTutorial();
      }
    }

    function handleButtonDirectionInput(button) {
      if (!button) return;
      if (!getState().hasSelectedMode) return;
      if (getPrimaryGameState() === 'PAUSED') return;
      if (isInTerminalOverlayState()) {
        resetToWaitingFromTerminalState();
        return;
      }
      if (isInWaitingTutorialState()) {
        dismissTutorial();
      }
      if (!shouldHandleDirectionInput()) return;
      const key = button.dataset.direction;
      submitDirectionInput(key);
    }

    function activateTouchControl(button) {
      touchStartedOnControl = true;
      touchTracking = false;
      handleButtonDirectionInput(button);
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
          activateTouchControl(button);
        }, { passive: false });
        button.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') {
            e.preventDefault();
            activateTouchControl(button);
          }
        });
      });
    }

    const inputApi = {
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

    return inputApi;
  }
};
