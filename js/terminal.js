/* ============================================================
   SidaOS Terminal — JavaScript
   ============================================================ */

// =================================================================
// FILESYSTEM DATA
// =================================================================

const FS = {
  type: 'dir',
  children: {
    'about.txt': {
      type: 'file',
      content: [
        'Sida Shen',
        'Developer Marketing | Product Marketing | DevRel',
        'Menlo Park, CA',
        '',
        'I bridge the gap between deeply technical products and the',
        'developers who use them.',
        '',
        'Currently leading Product Marketing, Developer Relations, and',
        'Technology Partnerships at CelerData -- the company behind',
        'StarRocks, a high-performance open-source analytics database',
        'used by companies like Airbnb, Lenovo, and Pinterest.',
        '',
        'Previously: Solution Architect at Zilliz (Milvus vector database),',
        'where I helped teams at Walmart, eBay, and LINE integrate vector',
        'search into production ML pipelines.',
        '',
        'Before that: Founded a learning management system for international',
        'medical students, growing it from zero to $30K ARR during COVID-19.',
        '',
        'Education: MS & BS in Industrial Engineering, Penn State University.',
      ].join('\n'),
    },
    'resume.txt': {
      type: 'file',
      content: [
        '================================================================',
        '  SIDA SHEN - Resume',
        '================================================================',
        '',
        '  EXPERIENCE',
        '  ----------',
        '',
        '  CelerData Inc. | Product Marketing Manager | May 2023 - Present',
        '    - Leading Product Marketing, DevRel, and Tech Partnerships',
        '    - Achieved 3x ARR growth in 2024',
        '    - Scaled StarRocks Slack community to 4,000+ members',
        '    - Built partnerships with Databricks, Apache Iceberg ecosystem',
        '    - Published 25+ technical articles, delivered 15+ talks',
        '    - Conducted 40+ user interviews to shape product direction',
        '',
        '  CelerData Inc. | Product Manager | Mar 2022 - Apr 2023',
        '    - Led feature design and GTM for real-time analytics',
        '    - Worked on StarRocks core: github.com/StarRocks/starrocks',
        '    - Created tutorials, release notes, and feature deep dives',
        '',
        '  Zilliz | Solution Architect | May 2021 - Mar 2022',
        '    - Drove enterprise adoption at Walmart, LINE, eBay',
        '    - Grew Milvus GitHub stars from 5K to 10K in 10 months',
        '    - Maintained: github.com/milvus-io/bootcamp',
        '',
        '  REEL | Founding Data Scientist | Feb 2020 - Apr 2021',
        '    - Bootstrapped quiz-based LMS for medical students',
        '    - Grew to $30K ARR within first year',
        '    - Built backend with spaced learning algorithm (Python, MySQL)',
        '',
        '  EDUCATION',
        '  ---------',
        '  Penn State University | MS Industrial Eng. & Operations Research',
        '  Penn State University | BS Industrial Engineering',
        '',
        '  SKILLS',
        '  ------',
        '  Python, SQL, Linux, Distributed Systems, OLAP, Apache Iceberg,',
        '  Machine Learning, Vector Databases, Technical Writing, DevRel',
        '',
        '================================================================',
      ].join('\n'),
    },
    'contact.txt': {
      type: 'file',
      content: [
        'Email:    shenstan1@gmail.com',
        'LinkedIn: https://www.linkedin.com/in/sida-shen-165303193/',
        'Location: Menlo Park, CA, USA',
        '',
        'Open to: Developer Marketing, DevRel, Product Marketing roles',
        '         Advisory / consulting in open-source GTM strategy',
      ].join('\n'),
    },
    'skills.txt': {
      type: 'file',
      content: [
        'PROGRAMMING',
        '  Python (NumPy, Pandas, Matplotlib, Torch, Spark)',
        '  SQL',
        '',
        'TECHNOLOGIES',
        '  Distributed Systems, Linux',
        '  OLAP Databases (StarRocks, ClickHouse, Druid)',
        '  Apache Iceberg, Delta Lake, Hudi',
        '  Machine Learning, Vector Databases (Milvus)',
        '',
        'MARKETING & GTM',
        '  Product Positioning & Messaging',
        '  Developer Relations & Community Building',
        '  Technical Content Strategy',
        '  Product Launches & Campaigns',
        '  Sales Enablement',
        '  Partnership Development',
        '  User Research (40+ interviews)',
      ].join('\n'),
    },
    '.bashrc': {
      type: 'file',
      content: [
        '# ~/.bashrc - SidaOS configuration',
        '',
        'export ROLE="Product Marketing Manager"',
        'export COMPANY="CelerData"',
        'export PASSION="open-source"',
        'export EDITOR="vim"',
        'export LANG="en_US.UTF-8"',
        '',
        'alias work="cd ~/projects/starrocks"',
        'alias blog="cat ~/writing/README.md"',
        'alias coffee="echo ☕ Brewing..."',
        '',
        '# Fortune cookie',
        '# "The best developer tools are the ones developers actually enjoy using."',
      ].join('\n'),
    },
    '.plan': {
      type: 'file',
      content: [
        'Building bridges between engineering and adoption.',
        'Making real-time analytics accessible to every developer.',
        '',
        '2026 goals:',
        '  - Scale StarRocks community to 10K+ members',
        '  - Launch AI-native analytics developer experience',
        '  - Speak at 5+ major data/AI conferences',
        '  - Continue writing about open data architecture',
      ].join('\n'),
    },
    'projects': {
      type: 'dir',
      children: {
        'starrocks.md': {
          type: 'file',
          content: [
            '# StarRocks @ CelerData',
            '',
            'High-performance, real-time analytics database',
            'https://github.com/StarRocks/starrocks',
            '',
            '## My Role',
            'Product Manager (2022-2023) -> Product Marketing Manager (2023-Present)',
            '',
            '## Key Achievements',
            '  - Achieved 3x ARR growth in 2024',
            '  - Scaled open-source Slack community to 4,000+ members',
            '  - Published 25+ technical articles',
            '  - Delivered 15+ webinars, conference talks, and podcasts',
            '  - Built partnerships with Databricks, Confluent, Iceberg ecosystem',
            '  - Conducted 40+ user interviews shaping product direction',
            '  - Spoke at Databricks Data+AI Summit, StarRocks Summit, and more',
          ].join('\n'),
        },
        'milvus.md': {
          type: 'file',
          content: [
            '# Milvus @ Zilliz',
            '',
            'Open-source vector database for AI applications',
            'https://github.com/milvus-io/milvus',
            '',
            '## My Role',
            'Solution Architect & Bootcamp Maintainer (2021-2022)',
            'https://github.com/milvus-io/bootcamp',
            '',
            '## Key Achievements',
            '  - Drove enterprise adoption at Walmart, LINE, and eBay',
            '  - Built and scaled open-source community',
            '  - Grew GitHub stars from 5,000 to 10,000 in 10 months',
            '  - Contributed to Zilliz B+ round funding success',
            '  - Presented at ITU AI for Good on Milvus',
          ].join('\n'),
        },
        'reel.md': {
          type: 'file',
          content: [
            '# REEL - Regenerative Education Evolution Lab',
            '',
            'B2B learning management system for medical schools',
            '',
            '## My Role',
            'Founding Data Scientist (2020-2021)',
            '',
            '## Key Achievements',
            '  - Bootstrapped and launched quiz-based LMS',
            '  - Grew to $30K ARR within first year',
            '  - Built core backend (Python, MySQL) with spaced learning algorithm',
            '  - Drove 100%+ increase in student engagement',
            '  - Secured seed funding during COVID-19',
          ].join('\n'),
        },
      },
    },
    'writing': {
      type: 'dir',
      children: {
        'README.md': {
          type: 'file',
          content: [
            '# Published Writing',
            '',
            '## CelerData / StarRocks Blog',
            '',
            '  [01] 2026 Is When Open Data, Real-Time Analytics and AI Agents Converge',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [02] Announcing StarRocks 4.0: Open, Fast, Governed',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [03] Analytical Agents: New Challenges for Data Infrastructure',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [04] Customer-Facing Analytics Without Denormalizing Everything',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [05] Ditching Denormalization in Real-Time Analytics',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [06] From Denormalization to Joins: Why ClickHouse Cannot Keep Up',
            '       https://celerdata.com/blog/from-denormalization-to-joins-why-clickhouse-cannot-keep-up',
            '  [07] Trino vs. StarRocks: Data Warehouse Performance on the Lake',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [08] StarRocks vs. Apache Druid',
            '       https://celerdata.com/blog/author/sida-shen',
            '  [09] Demandbase Ditches Denormalization by Switching off ClickHouse',
            '       https://celerdata.com/blog/demandbase-ditches-denormalization-by-switching-off-clickhouse',
            '  [10] How NAVER Changed Their Data Infra with JOINs',
            '       https://celerdata.com/blog/author/sida-shen',
            '',
            '  Full catalog: https://celerdata.com/blog/author/sida-shen',
            '                https://www.starrocks.io/blog/author/sida-shen',
            '',
            '## External Publications',
            '',
            '  [01] The New Stack - Data Warehouse Performance on the Data Lakehouse',
            '       https://thenewstack.io/how-to-get-data-warehouse-performance-on-the-data-lakehouse/',
            '  [02] Delta.io - StarRocks Kernel',
            '       https://delta.io/blog/starrocks-kernel/',
            '  [03] Preset Blog - Accelerating Superset Dashboards with Materialized Views',
            '       https://preset.io/blog/accelerating-apache-superset-dashboards-with-materialized-views/',
            '  [04] insideAI News - The Solution to Data in Motion Is to Just Stop',
            '       http://insideainews.com/2024/04/22/the-solution-to-data-in-motion-is-to-just-stop/',
            '  [05] Medium - Databricks Iceberg Managed Table Explained',
            '       https://medium.com/starrocks-engineering/databricks-iceberg-managed-table-explained-8b86551b2703',
          ].join('\n'),
        },
      },
    },
    'speaking': {
      type: 'dir',
      children: {
        'README.md': {
          type: 'file',
          content: [
            '# Speaking & Appearances',
            '',
            '## Conference Talks',
            '',
            '  [01] StarRocks Summit 2025 - Customer-Facing Analytics with StarRocks',
            '       https://summit.starrocks.io/2025',
            '  [02] Databricks Data + AI Summit 2024',
            '       https://www.databricks.com/dataaisummit/speaker/sida-shen',
            '  [03] ITU AI for Good - Milvus Vector Database',
            '       https://aiforgood.itu.int/speaker/sida-shen/',
            '',
            '## Webinars',
            '',
            '  [01] Announcing StarRocks 4.0 (with Ron Kapoor)',
            '  [02] Introducing StarRocks 3.4 & 3.5',
            '  [03] Ditching Denormalization: Superior JOIN Performance',
            '  [04] Demandbase: Switching off ClickHouse (with Nick Reich)',
            '  [05] Pinterest Customer-Facing Analytics Deep Dive',
            '  [06] Real-Time Data with Ververica (with Ben Gamble)',
            '  [07] DBTA: Why Lakehouse Users Should Ditch Their Data Warehouse',
            '  [08] StarRocks 3.0 Community Call (with Albert Wong)',
            '',
            '  Video playlist:',
            '  https://www.youtube.com/playlist?list=PLTXHtKIqm__dqxZYV8oQ-l7tRpSnftjmy',
            '',
            '## Interviews & Podcasts',
            '',
            '  [01] Data Engineering Podcast - Episode 463',
            '       https://www.dataengineeringpodcast.com/episodepage/starrocks-high-performance-lakehouse-and-olap-episode-463',
            '  [02] TFiR: CelerData Enables Data Engineers To Build Faster',
            '       https://tfir.io/celerdata-enables-data-engineers-to-build-new-analytics-projects-faster-sida-shen/',
            '  [03] Truth in IT: Breaking the Data Pipeline for Real-Time Analytics',
            '       https://www.truthinit.com/index.php/video/3731/celerdata-breaking-the-data-pipeline-for-real-time-analytics/',
            '  [04] Authority Magazine: Leveraging Data to Take Your Company to the Next Level',
            '       https://medium.com/authority-magazine/sida-shen-of-celerdata-on-how-to-leverage-data-to-take-your-company-to-the-next-level-ce5a1c41d960',
          ].join('\n'),
        },
      },
    },
  },
};


// =================================================================
// NEOFETCH DATA
// =================================================================

const LOGO_LINES = [
  '   _____ _     _       ',
  '  / ____(_)   | |      ',
  ' | (___  _  __| | __ _ ',
  '  \\___ \\| |/ _` |/ _` |',
  '  ____) | | (_| | (_| |',
  ' |_____/|_|\\__,_|\\__,_|',
  '',
  '  developer marketer',
];

const NEOFETCH_INFO = [
  { label: null, value: '<span class="accent">sida</span>@<span class="accent">devmarketing</span>' },
  { label: null, value: '<span class="separator">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>' },
  { label: 'Title', value: 'Product Marketing Manager' },
  { label: 'Company', value: 'CelerData Inc. (StarRocks)' },
  { label: 'Focus', value: 'Developer Marketing & DevRel' },
  { label: 'Uptime', value: '6+ years in data infra' },
  { label: 'Packages', value: '25+ blogs, 15+ talks' },
  { label: 'Shell', value: 'Python, SQL, Linux' },
  { label: 'Location', value: 'Menlo Park, CA' },
  { label: 'Education', value: 'Penn State (MS + BS)' },
  { label: null, value: '' },
  { label: null, value: '<span class="color-block-1">\u2588\u2588</span><span class="color-block-2">\u2588\u2588</span><span class="color-block-3">\u2588\u2588</span><span class="color-block-4">\u2588\u2588</span><span class="color-block-5">\u2588\u2588</span><span class="color-block-6">\u2588\u2588</span><span class="color-block-7">\u2588\u2588</span><span class="color-block-8">\u2588\u2588</span>' },
];


// =================================================================
// HELP TEXT
// =================================================================

const COMMANDS_HELP = [
  { cmd: 'help', desc: 'Show this help message' },
  { cmd: 'whoami', desc: 'Brief introduction' },
  { cmd: 'neofetch', desc: 'System info display' },
  { cmd: 'ls [path]', desc: 'List directory contents' },
  { cmd: 'cd <path>', desc: 'Change directory' },
  { cmd: 'cat <file>', desc: 'Read file contents' },
  { cmd: 'pwd', desc: 'Print working directory' },
  { cmd: 'clear', desc: 'Clear terminal (Ctrl+L)' },
  { cmd: 'history', desc: 'Command history' },
  { cmd: 'echo <text>', desc: 'Print text' },
  { cmd: 'date', desc: 'Current date/time' },
  { cmd: 'uname [-a]', desc: 'System information' },
  { cmd: 'theme <name>', desc: 'Switch theme (green|amber|blue|white|dracula)' },
  { cmd: 'open <url>', desc: 'Open URL in browser' },
  { cmd: 'blog', desc: 'Featured articles' },
  { cmd: 'talks', desc: 'Talks & webinars' },
  { cmd: 'contact', desc: 'Contact information' },
];


// =================================================================
// TERMINAL CLASS
// =================================================================

class Terminal {
  constructor() {
    this.outputEl = document.getElementById('output');
    this.promptEl = document.getElementById('prompt');
    this.inputDisplay = document.getElementById('input-display');
    this.cursorEl = document.getElementById('cursor');
    this.hiddenInput = document.getElementById('hidden-input');
    this.terminalEl = document.getElementById('terminal');

    this.cwd = '~';
    this.history = [];
    this.historyIdx = -1;
    this.tempBuffer = '';
    this.booted = false;

    this.setupListeners();
    this.boot();
  }

  // --- Setup ---

  setupListeners() {
    this.hiddenInput.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.hiddenInput.addEventListener('input', () => this.syncInput());

    document.addEventListener('click', (e) => {
      if (!window.getSelection().toString()) {
        this.focus();
      }
    });

    document.addEventListener('touchend', (e) => {
      if (!window.getSelection().toString()) {
        this.focus();
      }
    });
  }

  focus() {
    this.hiddenInput.focus();
  }

  // --- Boot Sequence ---

  async boot() {
    const bootLines = [
      { text: '<span class="boot-ok">[  OK  ]</span> Started SidaOS Terminal Service', delay: 80 },
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
    this.print('');
    this.booted = true;
    this.updatePrompt();
    this.focus();
  }

  // --- Neofetch ---

  printNeofetch() {
    const maxLogoWidth = Math.max(...LOGO_LINES.map(l => l.length));
    const pad = 4;
    const maxLines = Math.max(LOGO_LINES.length, NEOFETCH_INFO.length);

    let html = '';
    for (let i = 0; i < maxLines; i++) {
      const logoRaw = LOGO_LINES[i] || '';
      const logoEsc = this.escapeHtml(logoRaw);
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

  // --- Output ---

  print(text, className) {
    const div = document.createElement('div');
    div.className = 'line' + (className ? ' ' + className : '');
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  printHTML(html) {
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = html;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  scrollToBottom() {
    this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
  }

  // --- Prompt ---

  getPromptHTML() {
    const path = this.cwd === '~' ? '~' : this.cwd;
    return '<span class="prompt"><span class="user">sida</span><span class="sep">@</span><span class="host">devmarketing</span><span class="sep">:</span><span class="path">' + this.escapeHtml(path) + '</span><span class="sep">$ </span></span>';
  }

  updatePrompt() {
    if (this.booted) {
      this.promptEl.innerHTML = this.getPromptHTML();
    }
  }

  // --- Input Handling ---

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

  // --- Execution ---

  execute() {
    const raw = this.hiddenInput.value;
    const cmd = raw.trim();

    // Echo the command line to output
    this.printHTML(this.getPromptHTML() + this.escapeHtml(raw));

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
    this.printHTML(this.getPromptHTML() + this.escapeHtml(this.hiddenInput.value) + '^C');
    this.hiddenInput.value = '';
    this.syncInput();
  }

  // --- History ---

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

  // --- Tab Completion ---

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
        this.printHTML(this.getPromptHTML() + this.escapeHtml(input));
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

      const resolvedDir = dirPath ? this.resolvePath(dirPath) : this.cwd;
      const node = this.getNode(resolvedDir);
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
        this.printHTML(this.getPromptHTML() + this.escapeHtml(input));
        const display = matches.map(m => {
          const isDir = node.children[m].type === 'dir';
          return isDir ? m + '/' : m;
        });
        this.print(display.join('  '));
      }
    }
  }

  // --- Command Processing ---

  processCommand(raw) {
    const parts = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd = (parts[0] || '').toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

    switch (cmd) {
      case 'help': this.cmdHelp(); break;
      case 'whoami': this.cmdWhoami(); break;
      case 'neofetch': this.cmdNeofetch(); break;
      case 'ls': this.cmdLs(args); break;
      case 'cd': this.cmdCd(args); break;
      case 'cat': this.cmdCat(args); break;
      case 'pwd': this.cmdPwd(); break;
      case 'clear': this.clear(); break;
      case 'history': this.cmdHistory(); break;
      case 'echo': this.cmdEcho(args, raw); break;
      case 'date': this.cmdDate(); break;
      case 'uname': this.cmdUname(args); break;
      case 'theme': this.cmdTheme(args); break;
      case 'open': this.cmdOpen(args); break;
      case 'blog': this.cmdBlog(); break;
      case 'talks': this.cmdTalks(); break;
      case 'contact': this.cmdContact(); break;
      case 'sudo': this.cmdSudo(args); break;
      case 'vim': case 'vi': case 'nano': this.cmdEditor(cmd); break;
      case 'rm': this.cmdRm(args); break;
      case 'exit': case 'quit': this.cmdExit(); break;
      case 'cowsay': this.cmdCowsay(args, raw); break;
      case 'man': this.cmdMan(args); break;
      case 'top': this.cmdTop(); break;
      case 'ping': this.cmdPing(args); break;
      case 'wget': case 'curl': this.cmdWget(); break;
      default:
        this.printHTML('<span class="error">bash: ' + this.escapeHtml(cmd) + ': command not found</span>');
        break;
    }
  }

  // --- Commands ---

  cmdHelp() {
    this.print('');
    this.printHTML('<span class="bold">Available Commands:</span>');
    this.print('');
    for (const c of COMMANDS_HELP) {
      const padded = ('  ' + c.cmd).padEnd(22);
      this.printHTML('<span class="accent">' + this.escapeHtml(padded) + '</span>' + this.escapeHtml(c.desc));
    }
    this.print('');
    this.printHTML('<span class="dim">Tip: Use Tab for completion, \u2191\u2193 for history, Ctrl+L to clear</span>');
    this.printHTML('<span class="dim">Hidden files exist. Try: ls -a</span>');
  }

  cmdWhoami() {
    this.printHTML('<span class="bold">Sida Shen</span> \u2014 Product Marketing Manager @ CelerData');
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

    const resolved = targetPath ? this.resolvePath(targetPath) : this.cwd;
    const node = this.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">ls: cannot access \'' + this.escapeHtml(targetPath || '') + '\': No such file or directory</span>');
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
          ? '<span class="dir-name">' + this.escapeHtml(display) + '</span>'
          : name.startsWith('.')
          ? '<span class="hidden-file">' + this.escapeHtml(display) + '</span>'
          : '<span class="file-name">' + this.escapeHtml(display) + '</span>';
        this.printHTML(
          '<span class="dim">' + perms + '  sida sida ' + size + ' ' + dateStr + ' ' + year + '</span>  ' + nameHTML
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

    const resolved = this.resolvePath(target);
    const node = this.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">cd: ' + this.escapeHtml(target) + ': No such file or directory</span>');
    } else if (node.type !== 'dir') {
      this.printHTML('<span class="error">cd: ' + this.escapeHtml(target) + ': Not a directory</span>');
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
    const resolved = this.resolvePath(target);
    const node = this.getNode(resolved);

    if (!node) {
      this.printHTML('<span class="error">cat: ' + this.escapeHtml(target) + ': No such file or directory</span>');
    } else if (node.type === 'dir') {
      this.printHTML('<span class="error">cat: ' + this.escapeHtml(target) + ': Is a directory</span>');
    } else {
      this.printHTML(this.renderFileContent(node.content, target));
    }
  }

  cmdPwd() {
    const fullPath = this.cwd === '~' ? '/home/sida' : '/home/sida/' + this.cwd.substring(2);
    this.print(fullPath);
  }

  cmdHistory() {
    for (let i = 0; i < this.history.length; i++) {
      const num = String(i + 1).padStart(4);
      this.printHTML('<span class="dim">' + num + '</span>  ' + this.escapeHtml(this.history[i]));
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
      this.print('SidaOS 2.0.26 devmarketing 6.1.0-sida #1 SMP x86_64 GNU/Linux');
    } else {
      this.print('SidaOS');
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
    this.printHTML('Opening <span class="link">' + this.escapeHtml(url) + '</span>...');
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
        this.escapeHtml(posts[i].title)
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
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + this.escapeHtml(c));
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
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + this.escapeHtml(w));
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
      this.printHTML('  <span class="dim">[' + String(i + 1).padStart(2, '0') + ']</span> ' + this.escapeHtml(itv));
    });

    this.print('');
    this.printHTML('Videos: <a href="https://www.youtube.com/playlist?list=PLTXHtKIqm__dqxZYV8oQ-l7tRpSnftjmy" target="_blank" rel="noopener">YouTube Playlist</a>');
    this.printHTML('<span class="dim">Run \'cat speaking/README.md\' for full list with links</span>');
  }

  cmdContact() {
    this.print('');
    this.printHTML('<span class="bold">Contact</span>');
    this.print('');
    this.printHTML('  <span class="label">Email:</span>    <a href="mailto:shenstan1@gmail.com">shenstan1@gmail.com</a>');
    this.printHTML('  <span class="label">LinkedIn:</span> <a href="https://www.linkedin.com/in/sida-shen-165303193/" target="_blank" rel="noopener">linkedin.com/in/sida-shen-165303193</a>');
    this.printHTML('  <span class="label">Location:</span> Menlo Park, CA, USA');
    this.print('');
  }

  // --- Easter Eggs ---

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
      : 'Hire Sida Shen!';
    const escaped = this.escapeHtml(msg);
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
      this.printHTML('<span class="error">No manual entry for ' + this.escapeHtml(page) + '</span>');
    }
  }

  cmdTop() {
    this.printHTML('<span class="bold">top - SidaOS Developer Marketing Process Monitor</span>');
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
    this.printHTML('PING ' + this.escapeHtml(host) + ': <span class="accent">Just kidding. This is a portfolio, not a network tool.</span>');
    this.printHTML('<span class="dim">But if you want to ping me: shenstan1@gmail.com</span>');
  }

  cmdWget() {
    this.printHTML('<span class="accent">I appreciate the enthusiasm, but you can\'t download my portfolio.</span>');
    this.printHTML('<span class="dim">Try \'contact\' to reach me instead.</span>');
  }

  // --- Filesystem Helpers ---

  resolvePath(path) {
    if (path === '~' || path === '') return '~';
    if (path === '/') return '~';

    // Handle ~ prefix
    if (path.startsWith('~/')) {
      path = path.substring(2);
    } else if (path.startsWith('/')) {
      path = path.substring(1);
    }

    // Handle relative to cwd
    let base = this.cwd;
    if (!path.startsWith('~')) {
      const segments = path.split('/').filter(Boolean);
      const baseSegments = base === '~' ? ['~'] : base.split('/');

      for (const seg of segments) {
        if (seg === '..') {
          if (baseSegments.length > 1) baseSegments.pop();
        } else if (seg !== '.') {
          baseSegments.push(seg);
        }
      }

      return baseSegments.join('/');
    }

    return '~/' + path;
  }

  getNode(path) {
    if (path === '~') return FS;

    const parts = path.split('/').filter(Boolean);
    if (parts[0] === '~') parts.shift();

    let current = FS;
    for (const part of parts) {
      if (!current || current.type !== 'dir' || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    return current;
  }

  // --- Rendering Helpers ---

  renderFileContent(content, filename) {
    const lines = content.split('\n');
    const isMd = filename && filename.endsWith('.md');

    return lines.map(line => {
      let escaped = this.escapeHtml(line);

      // Markdown headers
      if (isMd) {
        if (line.startsWith('# ')) {
          return '<span class="h1">' + this.escapeHtml(line.substring(2)) + '</span>';
        }
        if (line.startsWith('## ')) {
          return '<span class="h2">' + this.escapeHtml(line.substring(3)) + '</span>';
        }
      }

      // Auto-link URLs
      escaped = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      );

      return escaped;
    }).join('\n');
  }

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
            html += '<span class="dir-name">' + this.escapeHtml(padded) + '</span>';
          } else if (item.isHidden) {
            html += '<span class="hidden-file">' + this.escapeHtml(padded) + '</span>';
          } else {
            html += this.escapeHtml(padded);
          }
        }
      }
      html += '\n';
    }
    return html.trimEnd();
  }

  // --- Utilities ---

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


// =================================================================
// INIT
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});
