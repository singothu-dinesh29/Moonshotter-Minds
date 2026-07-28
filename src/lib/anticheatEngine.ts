export interface AntiCheatIncidentPayload {
  incident_type: 'TAB_SWITCH' | 'BLUR' | 'COPY_PASTE' | 'KEYBOARD_SHORTCUT' | 'FULLSCREEN_EXIT' | 'PASTE_ATTEMPT' | 'DEVTOOLS_ATTEMPT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
  timestamp: string;
}

export type IncidentCallback = (incident: AntiCheatIncidentPayload) => void;

export class HardenedAntiCheatEngine {
  private onIncident: IncidentCallback;
  private isListening: boolean = false;
  private focusLostTime: number | null = null;

  constructor(onIncident: IncidentCallback) {
    this.onIncident = onIncident;
  }

  public start() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    // 1. Tab Switch & Visibility Change
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 2. Window Blur & Focus
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    // 3. Clipboard & Context Menu Guard
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('cut', this.handleCut);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('contextmenu', this.handleContextMenu);

    // 4. Keyboard Shortcut Interceptor (F12, Ctrl+C/V/X/A/U, Ctrl+Shift+I)
    document.addEventListener('keydown', this.handleKeyDown);

    // 5. Fullscreen Exit Monitor
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  public stop() {
    if (typeof window === 'undefined' || !this.isListening) return;
    this.isListening = false;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('cut', this.handleCut);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.focusLostTime = Date.now();
      this.onIncident({
        incident_type: 'TAB_SWITCH',
        severity: 'HIGH',
        metadata: { visibilityState: 'hidden', url: window.location.pathname },
        timestamp: new Date().toISOString()
      });
    }
  };

  private handleWindowBlur = () => {
    if (!this.focusLostTime) {
      this.focusLostTime = Date.now();
      this.onIncident({
        incident_type: 'BLUR',
        severity: 'MEDIUM',
        metadata: { event: 'window_blur' },
        timestamp: new Date().toISOString()
      });
    }
  };

  private handleWindowFocus = () => {
    if (this.focusLostTime) {
      const durationSecs = Math.round((Date.now() - this.focusLostTime) / 1000);
      this.focusLostTime = null;
      console.log(`[ANTI-CHEAT] Focus restored after ${durationSecs}s`);
    }
  };

  private handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    this.onIncident({
      incident_type: 'COPY_PASTE',
      severity: 'LOW',
      metadata: { action: 'blocked_copy_attempt' },
      timestamp: new Date().toISOString()
    });
  };

  private handleCut = (e: ClipboardEvent) => {
    e.preventDefault();
    this.onIncident({
      incident_type: 'COPY_PASTE',
      severity: 'LOW',
      metadata: { action: 'blocked_cut_attempt' },
      timestamp: new Date().toISOString()
    });
  };

  private handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    this.onIncident({
      incident_type: 'PASTE_ATTEMPT',
      severity: 'HIGH',
      metadata: { length: pastedText.length, snippet: pastedText.substring(0, 40) },
      timestamp: new Date().toISOString()
    });
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Intercept F12
    if (e.key === 'F12') {
      e.preventDefault();
      this.onIncident({
        incident_type: 'DEVTOOLS_ATTEMPT',
        severity: 'HIGH',
        metadata: { key: 'F12' },
        timestamp: new Date().toISOString()
      });
    }

    // Intercept Ctrl/Cmd + C, V, X, A, U, Shift+I
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toUpperCase();
      if (['C', 'V', 'X', 'A', 'U', 'S', 'P'].includes(key)) {
        e.preventDefault();
        this.onIncident({
          incident_type: 'KEYBOARD_SHORTCUT',
          severity: 'MEDIUM',
          metadata: { shortcut: `Ctrl+${key}` },
          timestamp: new Date().toISOString()
        });
      }

      if (e.shiftKey && key === 'I') {
        e.preventDefault();
        this.onIncident({
          incident_type: 'DEVTOOLS_ATTEMPT',
          severity: 'CRITICAL',
          metadata: { shortcut: 'Ctrl+Shift+I' },
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  private handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      this.onIncident({
        incident_type: 'FULLSCREEN_EXIT',
        severity: 'CRITICAL',
        metadata: { message: 'Candidate exited forced fullscreen mode' },
        timestamp: new Date().toISOString()
      });
    }
  };
}
