/* ============================================================
   DevOS — Desktop Shell
   ============================================================
   Manages the Ubuntu-style desktop environment:
     - Top panel with clock
     - Dock with app launchers
     - App registry and window lifecycle
     - Boot sequence
     - Mobile fallback (fullscreen terminal)
   ============================================================ */

const Desktop = {

  /** @type {Object<string, Object>} app instances keyed by window id */
  _apps: {},

  /** @type {boolean} */
  _booted: false,

  /** @type {number|null} */
  _clockInterval: null,

  /* ------------------------------------------------------------------ */
  /*  Initialization                                                     */
  /* ------------------------------------------------------------------ */

  init() {
    // Initialize window manager
    const desktopEl = document.getElementById('desktop');
    WindowManager.init(desktopEl);

    // Set up top panel clock
    this.startClock();

    // Set up Activities menu
    this.setupActivitiesMenu();

    // Set up dock
    this.setupDock();

    // Boot sequence
    this.boot();
  },

  /* ------------------------------------------------------------------ */
  /*  Boot sequence                                                      */
  /* ------------------------------------------------------------------ */

  boot() {
    // Check for mobile — open fullscreen terminal
    if (this.isMobile()) {
      this.openTerminal({ fullscreen: true });
    } else {
      // Desktop: open terminal
      this.openTerminal();
    }
    this._booted = true;
  },

  /* ------------------------------------------------------------------ */
  /*  App launchers                                                      */
  /* ------------------------------------------------------------------ */

  openTerminal(opts) {
    const win = WindowManager.createWindow({
      appType: 'terminal',
      title: CONFIG.user + '@' + CONFIG.host + ': ~',
      width: 780,
      height: 520,
      onFocus: (w) => {
        const app = this._apps[w.id];
        if (app && app.focus) app.focus();
      },
      onClose: (w) => {
        const app = this._apps[w.id];
        if (app && app.destroy) app.destroy();
        delete this._apps[w.id];
        this.updateDockIndicators();
      },
    });

    if (opts && opts.fullscreen) {
      WindowManager.maximizeWindow(win.id);
    }

    const app = new TerminalApp(win);
    this._apps[win.id] = app;
    this.updateDockIndicators();
    return win;
  },

  openExplorer(startPath) {
    const win = WindowManager.createWindow({
      appType: 'explorer',
      title: 'Home — Files',
      width: 700,
      height: 480,
      onFocus: (w) => {
        const app = this._apps[w.id];
        if (app && app.focus) app.focus();
      },
      onClose: (w) => {
        const app = this._apps[w.id];
        if (app && app.destroy) app.destroy();
        delete this._apps[w.id];
        this.updateDockIndicators();
      },
    });

    const app = new ExplorerApp(win, startPath || '~');
    this._apps[win.id] = app;
    this.updateDockIndicators();
    return win;
  },

  openViewer(filePath, filename) {
    const win = WindowManager.createWindow({
      appType: 'viewer',
      title: filename || 'Viewer',
      width: 650,
      height: 500,
      onFocus: (w) => {
        const app = this._apps[w.id];
        if (app && app.focus) app.focus();
      },
      onClose: (w) => {
        const app = this._apps[w.id];
        if (app && app.destroy) app.destroy();
        delete this._apps[w.id];
        this.updateDockIndicators();
      },
    });

    const app = new ViewerApp(win, filePath, filename);
    this._apps[win.id] = app;
    this.updateDockIndicators();
    return win;
  },

  /* ------------------------------------------------------------------ */
  /*  Activities menu                                                    */
  /* ------------------------------------------------------------------ */

  setupActivitiesMenu() {
    const btn = document.getElementById('activities-btn');
    const menu = document.getElementById('activities-menu');
    if (!btn || !menu) return;

    // Toggle menu on click
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        this.closeActivitiesMenu();
      } else {
        menu.classList.remove('hidden');
        btn.classList.add('active');
      }
    });

    // Close on click outside
    document.addEventListener('click', () => {
      this.closeActivitiesMenu();
    });

    // Prevent menu clicks from closing the menu immediately
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Handle menu item clicks
    menu.querySelectorAll('.panel-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.closeActivitiesMenu();
        this.handleMenuAction(action);
      });
    });
  },

  closeActivitiesMenu() {
    const menu = document.getElementById('activities-menu');
    const btn = document.getElementById('activities-btn');
    if (menu) menu.classList.add('hidden');
    if (btn) btn.classList.remove('active');
  },

  handleMenuAction(action) {
    switch (action) {
      case 'terminal':
        this.openTerminal();
        break;
      case 'files':
        this.openExplorer();
        break;
      case 'about':
        this.openViewer('~/about.txt', 'about.txt');
        break;
      case 'contact':
        this.openViewer('~/contact.txt', 'contact.txt');
        break;
      default:
        if (action && action.startsWith('theme-')) {
          const theme = action.substring(6);
          document.documentElement.setAttribute('data-theme', theme);
        }
        break;
    }
  },

  /* ------------------------------------------------------------------ */
  /*  Dock                                                               */
  /* ------------------------------------------------------------------ */

  setupDock() {
    const termBtn = document.getElementById('dock-terminal');
    const filesBtn = document.getElementById('dock-files');

    if (termBtn) {
      termBtn.addEventListener('click', () => {
        // If a terminal window exists and is minimized, restore it
        const existing = WindowManager.getWindowsByApp('terminal');
        const minimized = existing.find(w => w.minimized);
        if (minimized) {
          WindowManager.restoreWindow(minimized.id);
        } else {
          this.openTerminal();
        }
      });
    }

    if (filesBtn) {
      filesBtn.addEventListener('click', () => {
        const existing = WindowManager.getWindowsByApp('explorer');
        const minimized = existing.find(w => w.minimized);
        if (minimized) {
          WindowManager.restoreWindow(minimized.id);
        } else {
          this.openExplorer();
        }
      });
    }
  },

  updateDockIndicators() {
    const termBtn = document.getElementById('dock-terminal');
    const filesBtn = document.getElementById('dock-files');

    if (termBtn) {
      const hasTerminal = WindowManager.getWindowsByApp('terminal').length > 0;
      termBtn.classList.toggle('active', hasTerminal);
    }
    if (filesBtn) {
      const hasExplorer = WindowManager.getWindowsByApp('explorer').length > 0;
      filesBtn.classList.toggle('active', hasExplorer);
    }
  },

  /* ------------------------------------------------------------------ */
  /*  Top panel clock                                                    */
  /* ------------------------------------------------------------------ */

  startClock() {
    const clockEl = document.getElementById('panel-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      const opts = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      clockEl.textContent = now.toLocaleDateString('en-US', opts);
    };

    updateClock();
    this._clockInterval = setInterval(updateClock, 30000);
  },

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  isMobile() {
    return window.innerWidth <= 768;
  },
};


/* ================================================================== */
/*  Boot on DOM ready                                                  */
/* ================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Desktop.init();
});
