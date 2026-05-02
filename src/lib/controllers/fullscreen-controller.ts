import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the document's fullscreen state and exposes a `toggle()` action.
 * Host components read `controller.isFullscreen` and call `controller.toggle`
 * from their render output instead of wiring the `fullscreenchange`
 * listener directly.
 */
export class FullscreenController implements ReactiveController {
  isFullscreen = false;

  private readonly host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    document.addEventListener('fullscreenchange', this.handleChange);
    const next = Boolean(document.fullscreenElement);
    if (next !== this.isFullscreen) {
      this.isFullscreen = next;
      this.host.requestUpdate();
    }
  }

  hostDisconnected(): void {
    document.removeEventListener('fullscreenchange', this.handleChange);
  }

  readonly toggle = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  private readonly handleChange = () => {
    const next = Boolean(document.fullscreenElement);
    if (next === this.isFullscreen) return;
    this.isFullscreen = next;
    this.host.requestUpdate();
  };
}
