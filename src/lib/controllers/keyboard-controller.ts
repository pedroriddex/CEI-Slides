import type {ReactiveController, ReactiveControllerHost} from 'lit';

export interface KeyboardControllerActions {
  onPrev: () => void;
  onNext: () => void;
  onEscape: () => void;
  isBlocked: () => boolean;
}

/**
 * Binds window-level keyboard navigation to a host. Arrow keys drive
 * prev/next, Escape runs the dismissive action. The host controls
 * interlocks via `isBlocked()` so navigation does not collide with an
 * in-flight transition.
 */
export class KeyboardController implements ReactiveController {
  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly actions: KeyboardControllerActions
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener('keydown', this.handleKeydown);
  }

  hostDisconnected(): void {
    window.removeEventListener('keydown', this.handleKeydown);
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.actions.onEscape();
      return;
    }

    if (this.actions.isBlocked()) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.actions.onPrev();
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.actions.onNext();
    }
  };
}
