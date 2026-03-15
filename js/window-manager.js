/**
 * WindowManager - Singleton module for managing desktop windows.
 *
 * Provides an Ubuntu-style window management experience with:
 *   - Title bar with close/minimize/maximize buttons on the left
 *   - Drag-to-move via title bar (mouse + touch)
 *   - Z-index focus management
 *   - Maximize / minimize / restore / close lifecycle
 *   - Auto-cascade positioning for new windows
 *
 * No external dependencies - pure vanilla JS.
 */

const WindowManager = {

  /** @type {Map<string, Object>} id -> windowState */
  _windows: new Map(),

  /** Auto-incrementing id counter */
  _nextId: 1,

  /** Tracks the highest z-index so each focused window lands on top */
  _topZ: 10,

  /** The desktop container element (.desktop) */
  _desktopEl: null,

  /** Running offset for auto-cascade positioning */
  _cascadeOffset: 0,

  /* ------------------------------------------------------------------ */
  /*  Initialization                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Initialize the WindowManager with a desktop container element.
   * Must be called once before creating any windows.
   * @param {HTMLElement} desktopEl - The desktop container element
   */
  init(desktopEl) {
    this._desktopEl = desktopEl;
  },

  /* ------------------------------------------------------------------ */
  /*  Window creation                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Create a new managed window and append it to the desktop.
   *
   * @param {Object}   options
   * @param {string}   options.appType        - e.g. 'terminal', 'explorer'
   * @param {string}   options.title          - Text shown in the title bar
   * @param {number}   [options.width=720]    - Initial width in px
   * @param {number}   [options.height=480]   - Initial height in px
   * @param {number}   [options.x]            - Left position (auto-cascade if omitted)
   * @param {number}   [options.y]            - Top position  (auto-cascade if omitted)
   * @param {Function} [options.onFocus]      - Called when the window receives focus
   * @param {Function} [options.onClose]      - Called when the window is closed
   * @returns {Object} windowState
   */
  createWindow(options) {
    const id = 'win-' + this._nextId++;
    const width  = options.width  || 720;
    const height = options.height || 480;

    // --- Auto-cascade positioning -----------------------------------
    let x, y;
    if (options.x !== undefined && options.y !== undefined) {
      x = options.x;
      y = options.y;
    } else {
      const CASCADE_STEP = 30;
      const desktopRect = this._desktopEl.getBoundingClientRect();

      x = 60 + this._cascadeOffset;
      y = 60 + this._cascadeOffset;

      this._cascadeOffset += CASCADE_STEP;

      // Cycle back when cascade would push window off screen
      if (x + width > desktopRect.width - 40 || y + height > desktopRect.height - 40) {
        this._cascadeOffset = 0;
        x = 60;
        y = 60;
      }
    }

    // --- Build DOM --------------------------------------------------
    const el = document.createElement('div');
    el.className = 'window focused';
    el.id = id;
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.width  = width + 'px';
    el.style.height = height + 'px';

    // Title bar
    const titlebar = document.createElement('div');
    titlebar.className = 'window-titlebar';

    // Window control buttons (Ubuntu: close, minimize, maximize - left side)
    const buttonsWrap = document.createElement('div');
    buttonsWrap.className = 'window-buttons';

    const btnClose = document.createElement('button');
    btnClose.className = 'window-btn window-btn-close';
    btnClose.title = 'Close';

    const btnMin = document.createElement('button');
    btnMin.className = 'window-btn window-btn-minimize';
    btnMin.title = 'Minimize';

    const btnMax = document.createElement('button');
    btnMax.className = 'window-btn window-btn-maximize';
    btnMax.title = 'Maximize';

    buttonsWrap.appendChild(btnClose);
    buttonsWrap.appendChild(btnMin);
    buttonsWrap.appendChild(btnMax);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'window-title';
    titleSpan.textContent = options.title || '';

    titlebar.appendChild(buttonsWrap);
    titlebar.appendChild(titleSpan);

    // Body
    const bodyEl = document.createElement('div');
    bodyEl.className = 'window-body';

    el.appendChild(titlebar);
    el.appendChild(bodyEl);

    // --- Window state object ----------------------------------------
    this._topZ++;
    const zIndex = this._topZ;
    el.style.zIndex = zIndex;

    const winState = {
      id,
      appType: options.appType || '',
      title: options.title || '',
      el,
      bodyEl,
      x,
      y,
      width,
      height,
      minimized: false,
      maximized: false,
      zIndex,
      savedBounds: null,
      onFocus: options.onFocus || null,
      onClose: options.onClose || null,
    };

    this._windows.set(id, winState);

    // Remove .focused from all other windows
    this._clearFocused();
    el.classList.add('focused');

    // --- Event wiring -----------------------------------------------

    // Focus on any mousedown / touchstart inside the window
    const onPointerDown = (e) => {
      this.focusWindow(id);
    };
    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: true });

    // Title bar button clicks
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });
    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });
    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      this.maximizeWindow(id);
    });

    // Double-click title bar to toggle maximize
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-btn')) return;
      this.maximizeWindow(id);
    });

    // Dragging (mouse)
    this._initDragMouse(titlebar, winState);

    // Dragging (touch)
    this._initDragTouch(titlebar, winState);

    // Append to desktop
    this._desktopEl.appendChild(el);

    return winState;
  },

  /* ------------------------------------------------------------------ */
  /*  Window lifecycle methods                                           */
  /* ------------------------------------------------------------------ */

  /**
   * Close a window - removes it from the DOM and internal map.
   * @param {string} id
   */
  closeWindow(id) {
    const win = this._windows.get(id);
    if (!win) return;

    if (typeof win.onClose === 'function') {
      win.onClose(win);
    }
    win.el.remove();
    this._windows.delete(id);
  },

  /**
   * Minimize a window (hides it via .minimized class).
   * @param {string} id
   */
  minimizeWindow(id) {
    const win = this._windows.get(id);
    if (!win) return;
    win.minimized = true;
    win.el.classList.add('minimized');
  },

  /**
   * Toggle maximize / restore for a window.
   * If not maximized: save bounds, apply .maximized class.
   * If already maximized: restore saved bounds.
   * @param {string} id
   */
  maximizeWindow(id) {
    const win = this._windows.get(id);
    if (!win) return;

    if (win.maximized) {
      this.restoreWindow(id);
    } else {
      // Save current bounds so we can restore later
      win.savedBounds = {
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      };

      win.maximized = true;
      win.el.classList.add('maximized');

      // The actual full-screen sizing is handled by CSS (.maximized),
      // but we also update the inline styles for consistency.
      win.el.style.left   = '0px';
      win.el.style.top    = '0px';
      win.el.style.width  = '100%';
      win.el.style.height = '100%';
    }
  },

  /**
   * Restore a window from maximized or minimized state.
   * @param {string} id
   */
  restoreWindow(id) {
    const win = this._windows.get(id);
    if (!win) return;

    if (win.maximized && win.savedBounds) {
      win.x      = win.savedBounds.x;
      win.y      = win.savedBounds.y;
      win.width  = win.savedBounds.width;
      win.height = win.savedBounds.height;

      win.el.style.left   = win.x + 'px';
      win.el.style.top    = win.y + 'px';
      win.el.style.width  = win.width + 'px';
      win.el.style.height = win.height + 'px';

      win.maximized = false;
      win.savedBounds = null;
      win.el.classList.remove('maximized');
    }

    if (win.minimized) {
      win.minimized = false;
      win.el.classList.remove('minimized');
      this.focusWindow(id);
    }
  },

  /**
   * Bring a window to the front and mark it as focused.
   * @param {string} id
   */
  focusWindow(id) {
    const win = this._windows.get(id);
    if (!win) return;

    this._topZ++;
    win.zIndex = this._topZ;
    win.el.style.zIndex = this._topZ;

    this._clearFocused();
    win.el.classList.add('focused');

    if (typeof win.onFocus === 'function') {
      win.onFocus(win);
    }
  },

  /* ------------------------------------------------------------------ */
  /*  Query helpers                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Get a window state by id.
   * @param {string} id
   * @returns {Object|undefined}
   */
  getWindow(id) {
    return this._windows.get(id);
  },

  /**
   * Get all window states that match a given appType.
   * @param {string} appType
   * @returns {Object[]}
   */
  getWindowsByApp(appType) {
    const results = [];
    for (const win of this._windows.values()) {
      if (win.appType === appType) {
        results.push(win);
      }
    }
    return results;
  },

  /* ------------------------------------------------------------------ */
  /*  Internal: drag with mouse                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Wire up mouse-based drag on a title bar element.
   * @param {HTMLElement} titlebar
   * @param {Object} winState
   */
  _initDragMouse(titlebar, winState) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    const onMouseMove = (e) => {
      if (!dragging) return;

      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Clamp top to stay below the top panel (28px)
      if (newY < 28) newY = 28;

      winState.x = newX;
      winState.y = newY;
      winState.el.style.left = newX + 'px';
      winState.el.style.top  = newY + 'px';
    };

    const onMouseUp = () => {
      dragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    titlebar.addEventListener('mousedown', (e) => {
      // Don't drag when clicking window control buttons
      if (e.target.closest('.window-btn')) return;
      // Don't drag maximized windows
      if (winState.maximized) return;

      dragging = true;
      offsetX = e.clientX - winState.x;
      offsetY = e.clientY - winState.y;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  },

  /* ------------------------------------------------------------------ */
  /*  Internal: drag with touch                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Wire up touch-based drag on a title bar element.
   * @param {HTMLElement} titlebar
   * @param {Object} winState
   */
  _initDragTouch(titlebar, winState) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    const onTouchMove = (e) => {
      if (!dragging) return;
      const touch = e.touches[0];

      let newX = touch.clientX - offsetX;
      let newY = touch.clientY - offsetY;

      // Clamp top to stay below the top panel (28px)
      if (newY < 28) newY = 28;

      winState.x = newX;
      winState.y = newY;
      winState.el.style.left = newX + 'px';
      winState.el.style.top  = newY + 'px';

      e.preventDefault();
    };

    const onTouchEnd = () => {
      dragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    titlebar.addEventListener('touchstart', (e) => {
      // Don't drag when touching window control buttons
      if (e.target.closest('.window-btn')) return;
      // Don't drag maximized windows
      if (winState.maximized) return;

      const touch = e.touches[0];
      dragging = true;
      offsetX = touch.clientX - winState.x;
      offsetY = touch.clientY - winState.y;

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: true });
  },

  /* ------------------------------------------------------------------ */
  /*  Internal: focus helper                                             */
  /* ------------------------------------------------------------------ */

  /**
   * Remove .focused class from every window element.
   */
  _clearFocused() {
    for (const win of this._windows.values()) {
      win.el.classList.remove('focused');
    }
  },
};
