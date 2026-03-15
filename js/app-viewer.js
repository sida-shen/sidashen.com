/* ============================================================
   DevOS — Viewer App
   ============================================================
   Simple text/markdown viewer that mounts inside a WindowManager
   window. Uses the shared VFS (filesystem.js) for rendering.
   ============================================================ */

class ViewerApp {
  /**
   * @param {Object} winState  - from WindowManager.createWindow()
   * @param {string} filePath  - canonical VFS path (e.g. '~/about.txt')
   * @param {string} filename  - display name (e.g. 'about.txt')
   */
  constructor(winState, filePath, filename) {
    this.winState = winState;
    this.filePath = filePath;
    this.filename = filename;

    this.createDOM();
    this.loadFile();
  }

  /* ------------------------------------------------------------------ */
  /*  DOM creation                                                       */
  /* ------------------------------------------------------------------ */

  createDOM() {
    const body = this.winState.bodyEl;

    this.appEl = document.createElement('div');
    this.appEl.className = 'viewer-app';

    // Toolbar
    this.toolbarEl = document.createElement('div');
    this.toolbarEl.className = 'viewer-toolbar';

    // Back button (closes viewer, returns to previous window)
    this.backBtn = document.createElement('button');
    this.backBtn.className = 'viewer-back-btn';
    this.backBtn.textContent = '← Back';
    this.backBtn.addEventListener('click', () => {
      WindowManager.closeWindow(this.winState.id);
    });

    this.filenameEl = document.createElement('span');
    this.filenameEl.className = 'viewer-filename';
    this.filenameEl.textContent = this.filename;

    this.toolbarEl.appendChild(this.backBtn);
    this.toolbarEl.appendChild(this.filenameEl);

    // Content
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'viewer-content';

    this.appEl.appendChild(this.toolbarEl);
    this.appEl.appendChild(this.contentEl);

    body.appendChild(this.appEl);
  }

  /* ------------------------------------------------------------------ */
  /*  Load and render file                                               */
  /* ------------------------------------------------------------------ */

  loadFile() {
    const content = VFS.readFile(this.filePath);

    if (content === null) {
      this.contentEl.innerHTML = '<span style="color:#ff5555;">Error: Could not read file "' +
        VFS.escapeHtml(this.filePath) + '"</span>';
      return;
    }

    this.contentEl.innerHTML = VFS.renderFileContent(content, this.filename);
  }

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  focus() {
    // No special focus handling
  }

  destroy() {
    this.appEl.remove();
  }
}
