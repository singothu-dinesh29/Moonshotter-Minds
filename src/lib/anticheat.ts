export interface AntiCheatIncident {
  incident_type: 'TAB_SWITCH' | 'BLUR' | 'COPY_PASTE' | 'FULLSCREEN_EXIT' | 'PASTE_ATTEMPT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: Record<string, any>;
  timestamp: string;
}

export type AntiCheatCallback = (incident: AntiCheatIncident) => void;

export class AntiCheatMonitor {
  private onIncidentCallback: AntiCheatCallback;
  private isListening: boolean = false;
  private focusLostTime: number | null = null;

  constructor(onIncident: AntiCheatCallback) {
    this.onIncidentCallback = onIncident;
  }

  public start() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    // 1. Visibility change listener (Tab Switch)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 2. Window Blur listener
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    // 3. Clipboard copy/paste guard
    document.addEventListener('paste', this.handlePasteAttempt);
    document.addEventListener('copy', this.handleCopyAttempt);

    // 4. Context Menu lock
    document.addEventListener('contextmenu', this.handleContextMenu);

    // 5. Fullscreen exit monitor
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  public stop() {
    if (typeof window === 'undefined' || !this.isListening) return;
    this.isListening = false;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('paste', this.handlePasteAttempt);
    document.removeEventListener('copy', this.handleCopyAttempt);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.focusLostTime = Date.now();
      this.onIncidentCallback({
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
      this.onIncidentCallback({
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
      console.log(`Focus restored after ${durationSecs}s`);
    }
  };

  private handlePasteAttempt = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    this.onIncidentCallback({
      incident_type: 'PASTE_ATTEMPT',
      severity: 'HIGH',
      metadata: { length: pastedText.length, snippet: pastedText.substring(0, 50) },
      timestamp: new Date().toISOString()
    });
  };

  private handleCopyAttempt = (e: ClipboardEvent) => {
    e.preventDefault();
    this.onIncidentCallback({
      incident_type: 'COPY_PASTE',
      severity: 'LOW',
      metadata: { action: 'blocked_copy_attempt' },
      timestamp: new Date().toISOString()
    });
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      this.onIncidentCallback({
        incident_type: 'FULLSCREEN_EXIT',
        severity: 'CRITICAL',
        metadata: { message: 'Candidate exited forced fullscreen mode' },
        timestamp: new Date().toISOString()
      });
    }
  };
}
