/* ============================================================
   DevOS — File Explorer App (Nautilus-style)
   ============================================================
   Windowed file browser that mounts inside a WindowManager window.
   Uses the shared VFS (filesystem.js) and CONFIG globals.
   Each instance maintains its own cwd independently.
   ============================================================ */

class ExplorerApp {
  /**
   * @param {Object} winState - from WindowManager.createWindow()
   * @param {string} [startPath='~'] - initial directory to show
   */
  constructor(winState, startPath) {
    this.winState = winState;
    this.cwd = startPath || '~';
    this.viewMode = 'icon'; // 'icon' or 'list'
    this.selectedItem = null;

    this.createDOM();
    this.render();
  }

  /* ------------------------------------------------------------------ */
  /*  DOM creation                                                       */
  /* ------------------------------------------------------------------ */

  createDOM() {
    const body = this.winState.bodyEl;

    this.appEl = document.createElement('div');
    this.appEl.className = 'explorer-app';

    // --- Toolbar ---
    this.toolbarEl = document.createElement('div');
    this.toolbarEl.className = 'explorer-toolbar';

    // Back button
    this.backBtn = document.createElement('button');
    this.backBtn.className = 'explorer-nav-btn';
    this.backBtn.textContent = '←';
    this.backBtn.title = 'Back';
    this.backBtn.style.cssText = 'background:transparent;border:1px solid #555;color:#aaa;padding:4px 8px;cursor:pointer;border-radius:4px;font-size:14px;font-family:inherit;';
    this.backBtn.addEventListener('click', () => this.navigateUp());

    // Home button
    this.homeBtn = document.createElement('button');
    this.homeBtn.className = 'explorer-nav-btn';
    this.homeBtn.textContent = '⌂';
    this.homeBtn.title = 'Home';
    this.homeBtn.style.cssText = 'background:transparent;border:1px solid #555;color:#aaa;padding:4px 8px;cursor:pointer;border-radius:4px;font-size:14px;font-family:inherit;';
    this.homeBtn.addEventListener('click', () => this.navigateTo('~'));

    // Breadcrumb
    this.breadcrumbEl = document.createElement('div');
    this.breadcrumbEl.className = 'explorer-breadcrumb';

    // View toggle
    const viewToggle = document.createElement('div');
    viewToggle.className = 'explorer-view-toggle';

    this.iconViewBtn = document.createElement('button');
    this.iconViewBtn.className = 'explorer-view-btn active';
    this.iconViewBtn.textContent = '▦';
    this.iconViewBtn.title = 'Icon View';
    this.iconViewBtn.addEventListener('click', () => this.setViewMode('icon'));

    this.listViewBtn = document.createElement('button');
    this.listViewBtn.className = 'explorer-view-btn';
    this.listViewBtn.textContent = '☰';
    this.listViewBtn.title = 'List View';
    this.listViewBtn.addEventListener('click', () => this.setViewMode('list'));

    viewToggle.appendChild(this.iconViewBtn);
    viewToggle.appendChild(this.listViewBtn);

    this.toolbarEl.appendChild(this.backBtn);
    this.toolbarEl.appendChild(this.homeBtn);
    this.toolbarEl.appendChild(this.breadcrumbEl);
    this.toolbarEl.appendChild(viewToggle);

    // --- Content area ---
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'explorer-content';

    this.appEl.appendChild(this.toolbarEl);
    this.appEl.appendChild(this.contentEl);

    body.appendChild(this.appEl);
  }

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                         */
  /* ------------------------------------------------------------------ */

  navigateTo(path) {
    const resolved = VFS.resolvePath(path, this.cwd);
    const node = VFS.getNode(resolved);
    if (!node || node.type !== 'dir') return;

    this.cwd = resolved;
    this.selectedItem = null;
    this.render();
    this.updateWindowTitle();
  }

  navigateUp() {
    if (this.cwd === '~') return;
    const parts = this.cwd.split('/');
    parts.pop();
    this.cwd = parts.length === 1 ? '~' : parts.join('/');
    this.selectedItem = null;
    this.render();
    this.updateWindowTitle();
  }

  updateWindowTitle() {
    const dirName = this.cwd === '~' ? 'Home' : this.cwd.split('/').pop();
    const titleEl = this.winState.el.querySelector('.window-title');
    if (titleEl) {
      titleEl.textContent = dirName + ' — Files';
    }
  }

  /* ------------------------------------------------------------------ */
  /*  View mode                                                          */
  /* ------------------------------------------------------------------ */

  setViewMode(mode) {
    this.viewMode = mode;
    if (mode === 'icon') {
      this.iconViewBtn.classList.add('active');
      this.listViewBtn.classList.remove('active');
    } else {
      this.listViewBtn.classList.add('active');
      this.iconViewBtn.classList.remove('active');
    }
    this.render();
  }

  /* ------------------------------------------------------------------ */
  /*  Rendering                                                          */
  /* ------------------------------------------------------------------ */

  render() {
    this.renderBreadcrumb();
    this.renderContent();
  }

  renderBreadcrumb() {
    this.breadcrumbEl.innerHTML = '';

    const parts = this.cwd === '~' ? ['~'] : this.cwd.split('/');

    parts.forEach((part, idx) => {
      if (idx > 0) {
        const sep = document.createElement('span');
        sep.className = 'explorer-crumb-sep';
        sep.textContent = '›';
        this.breadcrumbEl.appendChild(sep);
      }

      const crumb = document.createElement('span');
      crumb.className = 'explorer-crumb' + (idx === parts.length - 1 ? ' active' : '');
      crumb.textContent = part === '~' ? '🏠 Home' : part;

      // Build path up to this crumb
      const crumbPath = parts.slice(0, idx + 1).join('/');
      crumb.addEventListener('click', () => this.navigateTo(crumbPath));

      this.breadcrumbEl.appendChild(crumb);
    });
  }

  renderContent() {
    this.contentEl.innerHTML = '';

    const entries = VFS.listDir(this.cwd);
    if (!entries || entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'explorer-empty';
      empty.textContent = 'This folder is empty';
      this.contentEl.appendChild(empty);
      return;
    }

    // Sort: dirs first, then files, alphabetically
    const sorted = entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (this.viewMode === 'icon') {
      this.renderIconView(sorted);
    } else {
      this.renderListView(sorted);
    }
  }

  renderIconView(entries) {
    const grid = document.createElement('div');
    grid.className = 'explorer-icon-view';

    for (const entry of entries) {
      const item = document.createElement('div');
      item.className = 'explorer-item';
      item.dataset.name = entry.name;

      const icon = document.createElement('div');
      icon.className = 'explorer-item-icon';
      icon.textContent = this.getIcon(entry.name, entry.type);

      const name = document.createElement('div');
      name.className = 'explorer-item-name';
      name.textContent = entry.name;
      name.title = entry.name;

      item.appendChild(icon);
      item.appendChild(name);

      // Single click to select
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(item, entry);
      });

      // Double click to open
      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openItem(entry);
      });

      grid.appendChild(item);
    }

    // Click on empty space to deselect
    this.contentEl.addEventListener('click', () => {
      this.deselectAll();
    });

    this.contentEl.appendChild(grid);
  }

  renderListView(entries) {
    const list = document.createElement('div');
    list.className = 'explorer-list-view';

    for (const entry of entries) {
      const row = document.createElement('div');
      row.className = 'explorer-list-row';
      row.dataset.name = entry.name;

      const icon = document.createElement('div');
      icon.className = 'explorer-list-icon';
      icon.textContent = this.getIcon(entry.name, entry.type);

      const name = document.createElement('div');
      name.className = 'explorer-list-name';
      name.textContent = entry.name;

      const type = document.createElement('div');
      type.className = 'explorer-list-type';
      type.textContent = entry.type === 'dir' ? 'Folder' : this.getFileType(entry.name);

      const size = document.createElement('div');
      size.className = 'explorer-list-size';
      size.textContent = entry.type === 'dir' ? '—' : this.formatSize(entry.node.content.length);

      row.appendChild(icon);
      row.appendChild(name);
      row.appendChild(type);
      row.appendChild(size);

      // Single click to select
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(row, entry);
      });

      // Double click to open
      row.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openItem(entry);
      });

      list.appendChild(row);
    }

    this.contentEl.addEventListener('click', () => {
      this.deselectAll();
    });

    this.contentEl.appendChild(list);
  }

  /* ------------------------------------------------------------------ */
  /*  Selection                                                          */
  /* ------------------------------------------------------------------ */

  selectItem(el, entry) {
    this.deselectAll();
    el.classList.add('selected');
    this.selectedItem = entry;
  }

  deselectAll() {
    const selected = this.contentEl.querySelectorAll('.selected');
    selected.forEach(s => s.classList.remove('selected'));
    this.selectedItem = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Open items                                                         */
  /* ------------------------------------------------------------------ */

  openItem(entry) {
    if (entry.type === 'dir') {
      // Navigate into directory
      const newPath = this.cwd === '~' ? '~/' + entry.name : this.cwd + '/' + entry.name;
      this.navigateTo(newPath);
    } else {
      // Open file in viewer
      const filePath = this.cwd === '~' ? '~/' + entry.name : this.cwd + '/' + entry.name;
      this.openFileInViewer(filePath, entry.name);
    }
  }

  openFileInViewer(path, filename) {
    // Use the global Desktop.openViewer if available, otherwise create directly
    if (typeof Desktop !== 'undefined' && Desktop.openViewer) {
      Desktop.openViewer(path, filename);
    } else {
      // Fallback: create viewer window directly
      const win = WindowManager.createWindow({
        appType: 'viewer',
        title: filename,
        width: 650,
        height: 500,
      });
      new ViewerApp(win, path, filename);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Icon / type helpers                                                */
  /* ------------------------------------------------------------------ */

  getIcon(name, type) {
    if (type === 'dir') return '📁';

    const ext = name.split('.').pop().toLowerCase();
    const iconMap = {
      'md': '📝',
      'txt': '📄',
      'js': '📜',
      'css': '🎨',
      'html': '🌐',
      'json': '📋',
      'sh': '⚙️',
      'bashrc': '⚙️',
      'plan': '📋',
    };

    // Handle dotfiles
    if (name.startsWith('.')) return '⚙️';

    return iconMap[ext] || '📄';
  }

  getFileType(name) {
    const ext = name.split('.').pop().toLowerCase();
    const typeMap = {
      'md': 'Markdown',
      'txt': 'Text',
      'js': 'JavaScript',
      'css': 'Stylesheet',
      'html': 'HTML',
      'json': 'JSON',
      'sh': 'Shell',
    };
    if (name.startsWith('.')) return 'Config';
    return typeMap[ext] || 'File';
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  focus() {
    // No special focus handling for explorer
  }

  destroy() {
    this.appEl.remove();
  }
}
