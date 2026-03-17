/* ============================================================
   DevOS — Terminal App
   ============================================================
   Windowed terminal that mounts inside a WindowManager window.
   Uses the shared VFS (filesystem.js) and CONFIG globals.
   ============================================================ */

class TerminalApp {
  /**
   * @param {Object} winState - from WindowManager.createWindow()
   *   winState.bodyEl is the container to mount in
   */
  constructor(winState) {
    this.winState = winState;
    this.cwd = '~';
    this.history = [];
    this.historyIdx = -1;
    this.tempBuffer = '';
    this.booted = false;
    this.chatHistory = [];
    this._chatPending = false;

    this.createDOM();
    this.setupListeners();
    this.boot();
  }

  /* ------------------------------------------------------------------ */
  /*  DOM creation                                                       */
  /* ------------------------------------------------------------------ */

  createDOM() {
    const body = this.winState.bodyEl;

    // Main terminal wrapper
    this.terminalEl = document.createElement('div');
    this.terminalEl.className = 'terminal-app';

    // Scroll container (sits below CRT overlay pseudo-elements)
    this.scrollEl = document.createElement('div');
    this.scrollEl.className = 'terminal-scroller';

    // Output area
    this.outputEl = document.createElement('div');
    this.outputEl.className = 'terminal-output';

    // Input line
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';

    this.promptEl = document.createElement('span');
    this.promptEl.className = 'terminal-prompt';

    this.inputDisplay = document.createElement('span');
    this.inputDisplay.className = 'terminal-input-display';

    this.cursorEl = document.createElement('span');
    this.cursorEl.className = 'terminal-cursor';
    this.cursorEl.textContent = '\u2588';

    inputLine.appendChild(this.promptEl);
    inputLine.appendChild(this.inputDisplay);
    inputLine.appendChild(this.cursorEl);

    this.scrollEl.appendChild(this.outputEl);
    this.scrollEl.appendChild(inputLine);
    this.terminalEl.appendChild(this.scrollEl);

    // Hidden textarea for actual input capture
    this.hiddenInput = document.createElement('textarea');
    this.hiddenInput.className = 'terminal-hidden-input';
    this.hiddenInput.setAttribute('autocomplete', 'off');
    this.hiddenInput.setAttribute('autocorrect', 'off');
    this.hiddenInput.setAttribute('autocapitalize', 'off');
    this.hiddenInput.setAttribute('spellcheck', 'false');

    body.appendChild(this.terminalEl);
    body.appendChild(this.hiddenInput);

    this.containerEl = body;
  }

  /* ------------------------------------------------------------------ */
  /*  Event listeners                                                    */
  /* ------------------------------------------------------------------ */

  setupListeners() {
    this._isMobile = window.innerWidth <= 768;
    this._onKeyDown = (e) => this.onKeyDown(e);
    this._onInput = () => this.syncInput();

    this.hiddenInput.addEventListener('keydown', this._onKeyDown);
    this.hiddenInput.addEventListener('input', this._onInput);

    if (this._isMobile) {
      // Mobile: track touch to distinguish tap vs scroll.
      // iOS Safari only opens the keyboard from a 'click' event handler,
      // so we use click (not touchend) to call focus(), gated by _touchMoved.
      this._touchMoved = false;
      this._onTouchStart = () => {
        this._touchMoved = false;
      };
      this._onTouchMove = () => {
        this._touchMoved = true;
      };
      this._onClick = () => {
        // Only open keyboard if it was a tap (no scroll movement)
        if (!this._touchMoved && !window.getSelection().toString()) {
          this.focus();
        }
      };

      this.terminalEl.addEventListener('touchstart', this._onTouchStart, { passive: true });
      this.terminalEl.addEventListener('touchmove', this._onTouchMove, { passive: true });
      this.terminalEl.addEventListener('click', this._onClick);
    } else {
      // Desktop: focus on click
      this._onClick = (e) => {
        if (!window.getSelection().toString()) {
          this.focus();
        }
      };
      this.terminalEl.addEventListener('click', this._onClick);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Boot sequence                                                      */
  /* ------------------------------------------------------------------ */

  async boot() {
    const bootLines = [
      { text: '<span class="boot-ok">[  OK  ]</span> Started DevOS Terminal Service', delay: 80 },
      { text: '<span class="boot-ok">[  OK  ]</span> Reached target Developer Marketing', delay: 80 },
      { text: '<span class="boot-ok">[  OK  ]</span> Loading portfolio data...', delay: 120 },
      { text: '', delay: 60 },
    ];

    for (const line of bootLines) {
      this.printHTML(line.text);
      await this.sleep(line.delay);
    }

    this.printNeofetch();
    this.print('');
    this.printHTML('<span class="dim">Type \'help\' to see available commands. Use Tab to autocomplete.</span>');
    this.printHTML('<span class="dim">Or just type naturally — I know everything about Sida.</span>');
    this.print('');
    this.booted = true;
    this.updatePrompt();
    // Don't auto-focus on mobile — let user tap to show keyboard
    if (!this._isMobile) this.focus();
  }

  /* ------------------------------------------------------------------ */
  /*  Neofetch                                                           */
  /* ------------------------------------------------------------------ */

  printNeofetch() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: stack logo on top, info below
      let html = '';
      for (const line of LOGO_LINES) {
        html += '<span class="logo">' + VFS.escapeHtml(line) + '</span>\n';
      }
      html += '\n';
      for (const item of NEOFETCH_INFO) {
        if (item.label) {
          html += '<span class="label">' + item.label + ':</span> ' + item.value + '\n';
        } else {
          html += item.value + '\n';
        }
      }
      this.printHTML(html.trimEnd());
    } else {
      // Desktop: side-by-side logo + info
      const maxLogoWidth = Math.max(...LOGO_LINES.map(l => l.length));
      const pad = 4;
      const maxLines = Math.max(LOGO_LINES.length, NEOFETCH_INFO.length);

      let html = '';
      for (let i = 0; i < maxLines; i++) {
        const logoRaw = LOGO_LINES[i] || '';
        const logoEsc = VFS.escapeHtml(logoRaw);
        const logoPadded = logoEsc + ' '.repeat(Math.max(0, maxLogoWidth - logoRaw.length));
        const spacer = ' '.repeat(pad);

        let infoHTML = '';
        if (i < NEOFETCH_INFO.length) {
          const item = NEOFETCH_INFO[i];
          if (item.label) {
            infoHTML = '<span class="label">' + item.label + ':</span> ' + item.value;
          } else {
            infoHTML = item.value;
          }
        }

        html += '<span class="logo">' + logoPadded + '</span>' + spacer + infoHTML + '\n';
      }
      this.printHTML(html.trimEnd());
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Output                                                             */
  /* ------------------------------------------------------------------ */

  print(text, className) {
    const div = document.createElement('div');
    div.className = 'terminal-line' + (className ? ' ' + className : '');
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  printHTML(html) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = html;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  scrollToBottom() {
    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
  }

  /* ------------------------------------------------------------------ */
  /*  Prompt                                                             */
  /* ------------------------------------------------------------------ */

  getPromptHTML() {
    const path = this.cwd === '~' ? '~' : this.cwd;
    return '<span class="prompt">' +
      '<span class="user">' + CONFIG.user + '</span>' +
      '<span class="sep">@</span>' +
      '<span class="host">' + CONFIG.host + '</span>' +
      '<span class="sep">:</span>' +
      '<span class="path">' + VFS.escapeHtml(path) + '</span>' +
      '<span class="sep">$ </span>' +
      '</span>';
  }

  updatePrompt() {
    if (this.booted) {
      this.promptEl.innerHTML = this.getPromptHTML();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Input handling                                                     */
  /* ------------------------------------------------------------------ */

  onKeyDown(e) {
    if (!this.booted) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.execute();
        break;
      case 'Tab':
        e.preventDefault();
        this.tabComplete();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.historyPrev();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.historyNext();
        break;
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          this.cancel();
        }
        break;
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          this.clear();
        }
        break;
      case 'u':
        if (e.ctrlKey) {
          e.preventDefault();
          this.hiddenInput.value = '';
          this.syncInput();
        }
        break;
    }
  }

  syncInput() {
    this.inputDisplay.textContent = this.hiddenInput.value;
    this.scrollToBottom();
  }

  setInput(value) {
    this.hiddenInput.value = value;
    this.syncInput();
  }

  /* ------------------------------------------------------------------ */
  /*  Execution                                                          */
  /* ------------------------------------------------------------------ */

  execute() {
    const raw = this.hiddenInput.value;
    const cmd = raw.trim();

    // Echo the command line to output
    this.printHTML(this.getPromptHTML() + VFS.escapeHtml(raw));

    if (cmd) {
      this.history.push(cmd);
      this.processCommand(cmd);
    }

    this.historyIdx = this.history.length;
    this.tempBuffer = '';
    this.hiddenInput.value = '';
    this.syncInput();
    this.scrollToBottom();
  }

  cancel() {
    this.printHTML(this.getPromptHTML() + VFS.escapeHtml(this.hiddenInput.value) + '^C');
    this.hiddenInput.value = '';
    this.syncInput();
  }

  /* ------------------------------------------------------------------ */
  /*  History                                                            */
  /* ------------------------------------------------------------------ */

  historyPrev() {
    if (this.history.length === 0) return;
    if (this.historyIdx === this.history.length) {
      this.tempBuffer = this.hiddenInput.value;
    }
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.setInput(this.history[this.historyIdx]);
    }
  }

  historyNext() {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this.setInput(this.history[this.historyIdx]);
    } else if (this.historyIdx === this.history.length - 1) {
      this.historyIdx = this.history.length;
      this.setInput(this.tempBuffer);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Tab completion                                                     */
  /* ------------------------------------------------------------------ */

  tabComplete() {
    const input = this.hiddenInput.value;
    const parts = input.split(/\s+/);

    if (parts.length <= 1) {
      // Complete command name
      const partial = parts[0].toLowerCase();
      const allCmds = [
        'help', 'whoami', 'neofetch', 'ls', 'cd', 'cat', 'pwd',
        'clear', 'history', 'echo', 'date', 'uname', 'theme',
        'open', 'blog', 'talks', 'contact',
      ];
      const matches = allCmds.filter(c => c.startsWith(partial));
      if (matches.length === 1) {
        this.setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        this.printHTML(this.getPromptHTML() + VFS.escapeHtml(input));
        this.print(matches.join('  '));
      }
    } else {
      // Complete file/directory path
      const pathPart = parts[parts.length - 1];
      const lastSlash = pathPart.lastIndexOf('/');
      let dirPath, prefix;
      if (lastSlash >= 0) {
        dirPath = pathPart.substring(0, lastSlash) || '/';
        prefix = pathPart.substring(lastSlash + 1);
      } else {
        dirPath = '';
        prefix = pathPart;
      }

      const resolvedDir = dirPath ? VFS.resolvePath(dirPath, this.cwd) : this.cwd;
      const node = VFS.getNode(resolvedDir);
      if (!node || node.type !== 'dir') return;

      const entries = Object.keys(node.children);
      const matches = entries.filter(e => e.startsWith(prefix));

      if (matches.length === 1) {
        const match = matches[0];
        const isDir = node.children[match].type === 'dir';
        const completed = (dirPath ? dirPath + '/' : '') + match + (isDir ? '/' : '');
        parts[parts.length - 1] = completed;
        this.setInput(parts.join(' '));
      } else if (matches.length > 1) {
        this.printHTML(this.getPromptHTML() + VFS.escapeHtml(input));
        const display = matches.map(m => {
          const isDir = node.children[m].type === 'dir';
          return isDir ? m + '/' : m;
        });
        this.print(display.join('  '));
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Command dispatch                                                   */
  /* ------------------------------------------------------------------ */

  processCommand(raw) {
    const parts = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd = (parts[0] || '').toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

    switch (cmd) {
      case 'help':    this.cmdHelp(); break;
      case 'whoami':  this.cmdWhoami(); break;
      case 'neofetch': this.cmdNeofetch(); break;
      case 'ls':      this.cmdLs(args); break;
      case 'cd':      this.cmdCd(args); break;
      case 'cat':     this.cmdCat(args); break;
      case 'pwd':     this.cmdPwd(); break;
      case 'clear':   this.clear(); break;
      case 'history': this.cmdHistory(); break;
      case 'echo':    this.cmdEcho(args, raw); break;
      case 'date':    this.cmdDate(); break;
      case 'uname':   this.cmdUname(args); break;
      case 'theme':   this.cmdTheme(args); break;
      case 'open':    this.cmdOpen(args); break;
      case 'blog':    this.cmdBlog(); break;
      case 'talks':   this.cmdTalks(); break;
      case 'contact': this.cmdContact(); break;
      case 'sudo':    this.cmdSudo(args); break;
      case 'vim': case 'vi': case 'nano': this.cmdEditor(cmd); break;
      case 'rm':      this.cmdRm(args); break;
      case 'exit': case 'quit': this.cmdExit(); break;
      case 'cowsay':  this.cmdCowsay(args, raw); break;
      case 'man':     this.cmdMan(args); break;
      case 'top':     this.cmdTop(); break;
      case 'ping':    this.cmdPing(args); break;
      case 'wget': case 'curl': this.cmdWget(); break;
      default:
        // Not a known command → send to LLM chat
        this.cmdChat(raw);
        break;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Commands                                                           */
  /* ------------------------------------------------------------------ */

  cmdHelp() {
    this.print('');
    this.printHTML('<span class="bold">Available Commands:</span>');
    this.print('');
    for (const c of COMMANDS_HELP) {
      const padded = ('  ' + c.cmd).padEnd(22);
      this.printHTML('<span class="accent">' + VFS.escapeHtml(padded) + '</span>' + VFS.escapeHtml(c.desc));
    }
    this.print('');
    this.printHTML('<span class="dim">Tip: Use Tab for completion, \u2191\u2193 for history, Ctrl+L to clear</span>');
    this.printHTML('<span class="dim">Hidden files exist. Try: ls -a</span>');
    if (LLM_CONFIG.endpoint) {
      this.print('');
      this.printHTML('<span class="dim">Or just type naturally to chat — I know everything about Sida.</span>');
    }
  }

  cmdWhoami() {
    this.printHTML('<span class="bold">' + VFS.escapeHtml(CONFIG.name) + '</span> \u2014 ' + VFS.escapeHtml(CONFIG.title) + ' @ ' + VFS.escapeHtml(CONFIG.company));
    this.printHTML('Developer Marketing | DevRel | Open Source | Real-Time Analytics');
    this.print('');
    this.printHTML('<span class="dim">Type \'neofetch\' for details, \'cat about.txt\' for full bio</span>');
  }

  cmdNeofetch() {
    this.printNeofetch();
  }

  cmdLs(args) {
    let showHidden = false;
    let showLong = false;
    let targetPath = null;

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showHidden = true;
        if (arg.includes('l')) showLong = true;
      } else {
        targetPath = arg;
      }
    }

    const resolved = targetPath ? VFS.resolvePath(targetPath, this.cwd) : this.cwd;
    const node = VFS.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">ls: cannot access \'' + VFS.escapeHtml(targetPath || '') + '\': No such file or directory</span>');
      return;
    }
    if (node.type !== 'dir') {
      this.print(targetPath || '');
      return;
    }

    let entries = Object.keys(node.children).sort();
    if (!showHidden) {
      entries = entries.filter(e => !e.startsWith('.'));
    }

    if (showLong) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const year = now.getFullYear();

      for (const name of entries) {
        const child = node.children[name];
        const isDir = child.type === 'dir';
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? '4096' : String(child.content.length).padStart(4);
        const display = name + (isDir ? '/' : '');
        const nameHTML = isDir
          ? '<span class="dir-name">' + VFS.escapeHtml(display) + '</span>'
          : name.startsWith('.')
          ? '<span class="hidden-file">' + VFS.escapeHtml(display) + '</span>'
          : '<span class="file-name">' + VFS.escapeHtml(display) + '</span>';
        this.printHTML(
          '<span class="dim">' + perms + '  ' + CONFIG.user + ' ' + CONFIG.user + ' ' + size + ' ' + dateStr + ' ' + year + '</span>  ' + nameHTML
        );
      }
    } else {
      const items = entries.map(name => {
        const child = node.children[name];
        const isDir = child.type === 'dir';
        const display = name + (isDir ? '/' : '');
        return { name: display, isDir, isHidden: name.startsWith('.') };
      });
      this.printHTML(this.formatColumns(items));
    }
  }

  cmdCd(args) {
    if (args.length === 0 || args[0] === '~') {
      this.cwd = '~';
      this.updatePrompt();
      return;
    }

    const target = args[0];
    if (target === '..') {
      if (this.cwd !== '~') {
        const parts = this.cwd.split('/');
        parts.pop();
        this.cwd = parts.length === 1 ? '~' : parts.join('/');
      }
      this.updatePrompt();
      return;
    }

    const resolved = VFS.resolvePath(target, this.cwd);
    const node = VFS.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">cd: ' + VFS.escapeHtml(target) + ': No such file or directory</span>');
    } else if (node.type !== 'dir') {
      this.printHTML('<span class="error">cd: ' + VFS.escapeHtml(target) + ': Not a directory</span>');
    } else {
      this.cwd = resolved;
      this.updatePrompt();
    }
  }

  cmdCat(args) {
    if (args.length === 0) {
      this.printHTML('<span class="error">cat: missing operand</span>');
      return;
    }

    const target = args[0];
    const resolved = VFS.resolvePath(target, this.cwd);
    const node = VFS.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">cat: ' + VFS.escapeHtml(target) + ': No such file or directory</span>');
    } else if (node.type === 'dir') {
      this.printHTML('<span class="error">cat: ' + VFS.escapeHtml(target) + ': Is a directory</span>');
    } else {
      this.printHTML(VFS.renderFileContent(node.content, target));
    }
  }

  cmdPwd() {
    const fullPath = this.cwd === '~'
      ? '/home/' + CONFIG.user
      : '/home/' + CONFIG.user + '/' + this.cwd.substring(2);
    this.print(fullPath);
  }

  cmdHistory() {
    for (let i = 0; i < this.history.length; i++) {
      const num = String(i + 1).padStart(4);
      this.printHTML('<span class="dim">' + num + '</span>  ' + VFS.escapeHtml(this.history[i]));
    }
  }

  cmdEcho(args, raw) {
    const text = raw.substring(raw.indexOf(' ') + 1);
    this.print(args.length ? text : '');
  }

  cmdDate() {
    this.print(new Date().toString());
  }

  cmdUname(args) {
    if (args.includes('-a') || args.includes('--all')) {
      this.print('DevOS 2.0.26 ' + CONFIG.host + ' 6.1.0-dev #1 SMP x86_64 GNU/Linux');
    } else {
      this.print('DevOS');
    }
  }

  cmdTheme(args) {
    const themes = ['green', 'amber', 'blue', 'white', 'dracula'];
    if (args.length === 0 || !themes.includes(args[0])) {
      const current = document.documentElement.getAttribute('data-theme') || 'green';
      this.printHTML('Current theme: <span class="accent">' + current + '</span>');
      this.printHTML('Available: ' + themes.map(t => '<span class="accent">' + t + '</span>').join(' | '));
      this.printHTML('Usage: theme <name>');
      return;
    }
    document.documentElement.setAttribute('data-theme', args[0]);
    this.printHTML('Theme set to <span class="accent">' + args[0] + '</span>');
  }

  cmdOpen(args) {
    if (args.length === 0) {
      this.printHTML('<span class="error">Usage: open &lt;url&gt;</span>');
      return;
    }
    let url = args[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener');
    this.printHTML('Opening <span class="link">' + VFS.escapeHtml(url) + '</span>...');
  }

  cmdBlog() {
    this.print('');
    this.printHTML('<span class="bold">Featured Writing</span>');
    this.print('');

    const posts = [
      { title: '2026 Is When Open Data, Real-Time Analytics and AI Agents Converge', tag: 'STRATEGY' },
      { title: 'Announcing StarRocks 4.0: Open, Fast, Governed', tag: 'LAUNCH' },
      { title: 'Customer-Facing Analytics Without Denormalizing Everything', tag: 'TECHNICAL' },
      { title: 'From Denormalization to Joins: Why ClickHouse Cannot Keep Up', tag: 'COMPARISON' },
      { title: 'Demandbase Ditches Denormalization by Switching off ClickHouse', tag: 'CASE STUDY' },
      { title: 'Trino vs. StarRocks: Data Warehouse Performance on the Lake', tag: 'COMPARISON' },
      { title: 'Data Warehouse Performance on the Data Lakehouse (The New Stack)', tag: 'EXTERNAL' },
      { title: 'StarRocks Kernel (Delta.io)', tag: 'EXTERNAL' },
      { title: 'Accelerating Superset Dashboards with Materialized Views (Preset)', tag: 'EXTERNAL' },
    ];

    for (let i = 0; i < posts.length; i++) {
      const num = String(i + 1).padStart(2, '0');
      this.printHTML(
        '<span class="dim">[' + num + ']</span> ' +
        '<span class="accent">[' + posts[i].tag + ']</span> ' +
        VFS.escapeHtml(posts[i].title)
      );
    }

    this.print('');
    this.printHTML('Full catalog: <a href="https://celerdata.com/blog/author/sida-shen" target="_blank" rel="noopener">celerdata.com/blog/author/sida-shen</a>');
    this.printHTML('<span class="dim">Run \'cat writing/README.md\' for all articles with links</span>');
  }

  cmdTalks() {
    this.print('');
    this.printHTML('<span class="bold">Speaking & Appearances</span>');
    this.print('');

    this.printHTML('<span class="h2">Conferences</span>');
    const confs = [
      'StarRocks Summit 2025 \u2014 Customer-Facing Analytics',
      'Databricks Data + AI Summit 2024',
      'ITU AI for Good \u2014 Milvus Vector Database',
    ];
    confs.forEach((c, i) => {
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + VFS.escapeHtml(c));
    });

    this.print('');
    this.printHTML('<span class="h2">Webinars (selected)</span>');
    const webs = [
      'Announcing StarRocks 4.0',
      'Ditching Denormalization: Superior JOIN Performance',
      'Demandbase: Switching off ClickHouse',
      'Pinterest Customer-Facing Analytics Deep Dive',
      'Real-Time Data with Ververica',
    ];
    webs.forEach((w, i) => {
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + VFS.escapeHtml(w));
    });

    this.print('');
    this.printHTML('<span class="h2">Interviews & Podcasts</span>');
    const interviews = [
      'Data Engineering Podcast \u2014 Episode 463',
      'TFiR: CelerData Enables Data Engineers To Build Faster',
      'Truth in IT: Breaking the Data Pipeline',
      'Authority Magazine: Leveraging Data',
    ];
    interviews.forEach((itv, i) => {
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + VFS.escapeHtml(itv));
    });

    this.print('');
    this.printHTML('Videos: <a href="https://www.youtube.com/playlist?list=PLTXHtKIqm__dqxZYV8oQ-l7tRpSnftjmy" target="_blank" rel="noopener">YouTube Playlist</a>');
    this.printHTML('<span class="dim">Run \'cat speaking/README.md\' for full list with links</span>');
  }

  cmdContact() {
    this.print('');
    this.printHTML('<span class="bold">Contact</span>');
    this.print('');
    this.printHTML('  <span class="label">Email:</span>    <a href="mailto:' + CONFIG.email + '">' + VFS.escapeHtml(CONFIG.email) + '</a>');
    this.printHTML('  <span class="label">LinkedIn:</span> <a href="' + CONFIG.linkedin + '" target="_blank" rel="noopener">' + VFS.escapeHtml(CONFIG.linkedin) + '</a>');
    this.printHTML('  <span class="label">Location:</span> ' + VFS.escapeHtml(CONFIG.location));
    this.print('');
  }

  /* ------------------------------------------------------------------ */
  /*  Easter eggs                                                        */
  /* ------------------------------------------------------------------ */

  cmdSudo(args) {
    if (args.length === 0) {
      this.printHTML('<span class="error">usage: sudo command</span>');
      return;
    }
    this.printHTML('<span class="accent">[sudo] password for visitor: </span>');
    this.printHTML('<span class="error">Sorry, user visitor is not in the sudoers file. This incident will be reported.</span>');
  }

  cmdEditor(name) {
    const messages = {
      vim: 'Pro tip: The best way to exit vim is to never enter it.',
      vi: 'Pro tip: The best way to exit vim is to never enter it.',
      nano: 'nano: Permission denied. This is a read-only portfolio.',
    };
    this.printHTML('<span class="accent">' + (messages[name] || '') + '</span>');
  }

  cmdRm(args) {
    const joined = args.join(' ');
    if (joined.includes('-rf') || joined.includes('-r')) {
      this.printHTML('<span class="error">rm: nice try. This portfolio is write-protected.</span>');
      this.printHTML('<span class="dim">I spent too long building this to let you delete it.</span>');
    } else {
      this.printHTML('<span class="error">rm: operation not permitted</span>');
    }
  }

  cmdExit() {
    this.printHTML('<span class="accent">There is no escape from my portfolio. Try \'help\' instead.</span>');
  }

  cmdCowsay(args, raw) {
    const msg = args.length > 0
      ? raw.substring(raw.indexOf(' ') + 1)
      : 'Hire ' + CONFIG.name + '!';
    const escaped = VFS.escapeHtml(msg);
    const border = '\u2500'.repeat(msg.length + 2);
    const cow = [
      ' \u250C' + border + '\u2510',
      ' \u2502 ' + escaped + ' \u2502',
      ' \u2514' + border + '\u2518',
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||',
    ];
    for (const line of cow) {
      this.printHTML(line);
    }
  }

  cmdMan(args) {
    if (args.length === 0) {
      this.printHTML('What manual page do you want?');
      return;
    }
    const page = args[0].toLowerCase();
    const entry = COMMANDS_HELP.find(c => c.cmd.split(' ')[0] === page);
    if (entry) {
      this.print('');
      this.printHTML('<span class="bold">' + page.toUpperCase() + '(1)</span>');
      this.print('');
      this.printHTML('  <span class="label">NAME</span>');
      this.printHTML('       ' + page + ' - ' + entry.desc);
      this.print('');
      this.printHTML('  <span class="label">SYNOPSIS</span>');
      this.printHTML('       ' + entry.cmd);
      this.print('');
    } else {
      this.printHTML('<span class="error">No manual entry for ' + VFS.escapeHtml(page) + '</span>');
    }
  }

  cmdTop() {
    this.printHTML('<span class="bold">top - DevOS Developer Marketing Process Monitor</span>');
    this.print('');
    this.printHTML('  PID  %CPU  %MEM  PROCESS');
    const procs = [
      { pid: 1, cpu: '42.0', mem: '35.2', name: 'content-strategy' },
      { pid: 2, cpu: '28.5', mem: '22.1', name: 'community-building' },
      { pid: 3, cpu: '15.3', mem: '18.7', name: 'product-launches' },
      { pid: 4, cpu: '8.2', mem: '12.4', name: 'partnership-dev' },
      { pid: 5, cpu: '4.1', mem: '8.3', name: 'user-research' },
      { pid: 6, cpu: '1.9', mem: '3.3', name: 'sales-enablement' },
    ];
    for (const p of procs) {
      this.printHTML(
        '  <span class="dim">' + String(p.pid).padStart(3) + '</span>  ' +
        '<span class="accent">' + p.cpu.padStart(5) + '</span>  ' +
        p.mem.padStart(5) + '  ' +
        '<span class="success">' + p.name + '</span>'
      );
    }
    this.print('');
    this.printHTML('<span class="dim">Total: 6 processes, all running, 0 stopped</span>');
  }

  cmdPing(args) {
    const host = args[0] || 'google.com';
    this.printHTML('PING ' + VFS.escapeHtml(host) + ': <span class="accent">Just kidding. This is a portfolio, not a network tool.</span>');
    this.printHTML('<span class="dim">But if you want to ping me: ' + VFS.escapeHtml(CONFIG.email) + '</span>');
  }

  cmdWget() {
    this.printHTML('<span class="accent">I appreciate the enthusiasm, but you can\'t download my portfolio.</span>');
    this.printHTML('<span class="dim">Try \'contact\' to reach me instead.</span>');
  }

  /* ------------------------------------------------------------------ */
  /*  LLM Chat                                                           */
  /* ------------------------------------------------------------------ */

  async cmdChat(input) {
    if (!LLM_CONFIG.endpoint) {
      this.printHTML('<span class="error">bash: ' + VFS.escapeHtml(input.split(/\s/)[0]) + ': command not found</span>');
      return;
    }

    if (this._chatPending) {
      this.printHTML('<span class="dim">Still thinking... please wait.</span>');
      return;
    }

    this._chatPending = true;

    // Add user message to history
    this.chatHistory.push({ role: 'user', content: input });

    // Trim to max history
    const maxMsgs = (LLM_CONFIG.maxHistory || 6) * 2;
    if (this.chatHistory.length > maxMsgs) {
      this.chatHistory = this.chatHistory.slice(-maxMsgs);
    }

    // Show thinking indicator
    const thinkEl = document.createElement('div');
    thinkEl.className = 'terminal-line';
    thinkEl.innerHTML = '<span class="dim">thinking</span><span class="chat-dots">...</span>';
    this.outputEl.appendChild(thinkEl);
    this.scrollToBottom();

    // Animate dots
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dotsEl = thinkEl.querySelector('.chat-dots');
      if (dotsEl) dotsEl.textContent = '.'.repeat(dotCount || 1);
    }, 400);

    // Hide input while waiting
    const inputLine = this.scrollEl.querySelector('.terminal-input-line');
    if (inputLine) inputLine.style.display = 'none';

    try {
      const resp = await fetch(LLM_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.chatHistory }),
      });

      // Remove thinking indicator
      clearInterval(dotInterval);
      thinkEl.remove();

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err.error || 'Something went wrong. Try again later.';
        this.printHTML('<span class="error">' + VFS.escapeHtml(msg) + '</span>');
        this.chatHistory.pop(); // remove failed user message
      } else {
        const data = await resp.json();
        const text = data.text || '';

        // Add assistant response to history
        this.chatHistory.push({ role: 'assistant', content: text });

        // Print response with accent color
        this.print('');
        const lines = text.split('\n');
        for (const line of lines) {
          this.printHTML('<span class="accent">' + VFS.escapeHtml(line) + '</span>');
        }
        this.print('');
      }
    } catch (err) {
      clearInterval(dotInterval);
      thinkEl.remove();
      this.printHTML('<span class="error">Network error. Check your connection.</span>');
      this.chatHistory.pop();
    } finally {
      this._chatPending = false;
      if (inputLine) inputLine.style.display = '';
      this.scrollToBottom();
      this.focus();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Formatting helpers                                                 */
  /* ------------------------------------------------------------------ */

  formatColumns(items) {
    if (items.length === 0) return '';

    const termWidth = 80;
    const maxLen = Math.max(...items.map(i => i.name.length));
    const colWidth = maxLen + 2;
    const numCols = Math.max(1, Math.floor(termWidth / colWidth));
    const numRows = Math.ceil(items.length / numCols);

    let html = '';
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const idx = col * numRows + row;
        if (idx < items.length) {
          const item = items[idx];
          const padded = item.name.padEnd(colWidth);
          if (item.isDir) {
            html += '<span class="dir-name">' + VFS.escapeHtml(padded) + '</span>';
          } else if (item.isHidden) {
            html += '<span class="hidden-file">' + VFS.escapeHtml(padded) + '</span>';
          } else {
            html += VFS.escapeHtml(padded);
          }
        }
      }
      html += '\n';
    }
    return html.trimEnd();
  }

  /* ------------------------------------------------------------------ */
  /*  Utilities                                                          */
  /* ------------------------------------------------------------------ */

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  focus() {
    this.hiddenInput.focus();
  }

  destroy() {
    this.hiddenInput.removeEventListener('keydown', this._onKeyDown);
    this.hiddenInput.removeEventListener('input', this._onInput);
    this.terminalEl.removeEventListener('click', this._onClick);
    if (this._onTouchStart) this.terminalEl.removeEventListener('touchstart', this._onTouchStart);
    if (this._onTouchMove) this.terminalEl.removeEventListener('touchmove', this._onTouchMove);

    this.terminalEl.remove();
    this.hiddenInput.remove();
  }
}
