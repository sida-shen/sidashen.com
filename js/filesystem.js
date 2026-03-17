/* ============================================================
   DevOS — Virtual Filesystem Module
   Shared between Terminal and Desktop environments.
   ============================================================
   To customise this template for your own portfolio, edit the
   CONFIG object below — it is the ONLY place personal data lives.
   ============================================================ */

// =================================================================
// CONFIG — personalisation data (edit this for your own portfolio)
// =================================================================

const CONFIG = {
  user: 'sida',
  host: 'devmarketing',
  name: 'Sida Shen',
  title: 'Product Marketing Manager',
  company: 'CelerData Inc. (StarRocks)',
  focus: 'Developer Marketing & DevRel',
  uptime: '6+ years in data infra',
  packages: (typeof ContentUtils !== 'undefined') ? ContentUtils.countByType().blog + ' articles, ' + ContentUtils.countByType().video + ' talks' : '70+ articles, 45+ talks',
  shell: 'Python, SQL, Linux',
  location: 'Menlo Park, CA',
  education: 'Penn State (MS + BS)',
  email: 'shenstan1@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sida-shen-165303193/',
};

// LLM chat endpoint — paste your Lambda Function URL here after deploy
const LLM_CONFIG = {
  endpoint: 'https://a2de3drcogfm7uxagwfsa2jjgm0iqxdj.lambda-url.us-east-1.on.aws/',
  maxHistory: 6,
};


// =================================================================
// LOGO_LINES — ASCII art for neofetch display
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


// =================================================================
// NEOFETCH_INFO — system info labels for neofetch display
// =================================================================

const NEOFETCH_INFO = [
  { label: null, value: '<span class="accent">' + CONFIG.user + '</span>@<span class="accent">' + CONFIG.host + '</span>' },
  { label: null, value: '<span class="separator">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>' },
  { label: 'Title', value: CONFIG.title },
  { label: 'Company', value: CONFIG.company },
  { label: 'Focus', value: CONFIG.focus },
  { label: 'Uptime', value: CONFIG.uptime },
  { label: 'Packages', value: CONFIG.packages },
  { label: 'Shell', value: CONFIG.shell },
  { label: 'Location', value: CONFIG.location },
  { label: 'Education', value: CONFIG.education },
  { label: 'Content', value: (typeof ContentUtils !== 'undefined') ? ContentUtils.totalCount() + ' posts & talks' : '119 posts & talks' },
  { label: null, value: '' },
  { label: null, value: '<span class="color-block-1">\u2588\u2588</span><span class="color-block-2">\u2588\u2588</span><span class="color-block-3">\u2588\u2588</span><span class="color-block-4">\u2588\u2588</span><span class="color-block-5">\u2588\u2588</span><span class="color-block-6">\u2588\u2588</span><span class="color-block-7">\u2588\u2588</span><span class="color-block-8">\u2588\u2588</span>' },
];


// =================================================================
// COMMANDS_HELP — help text for all available commands
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
  { cmd: 'open <url|file>', desc: 'Open URL or content file in browser' },
  { cmd: 'search <keyword>', desc: 'Search content by title or tag' },
  { cmd: 'latest [n]', desc: 'Show latest content (default: 5)' },
  { cmd: 'stats', desc: 'Content portfolio statistics' },
  { cmd: 'blog', desc: 'Featured articles' },
  { cmd: 'talks', desc: 'Talks & webinars' },
  { cmd: 'contact', desc: 'Contact information' },
];


// =================================================================
// FS_TREE — the full virtual filesystem
// =================================================================

const FS_TREE = {
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
        '# ~/.bashrc - DevOS configuration',
        '',
        'export ROLE="Product Marketing Manager"',
        'export COMPANY="CelerData"',
        'export PASSION="open-source"',
        'export EDITOR="vim"',
        'export LANG="en_US.UTF-8"',
        '',
        'alias work="cd ~/projects/starrocks"',
        'alias blog="cat ~/writing/README.md"',
        'alias coffee="echo \u2615 Brewing..."',
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
    // blog, video, interviews directories are generated dynamically below
  },
};

// =================================================================
// Dynamic content directories — generated from CONTENT_DATA
// =================================================================
(function buildContentDirs() {
  if (typeof CONTENT_DATA === 'undefined') return;

  function makeFileContent(item) {
    return [
      '# ' + item.title,
      '',
      'Source:  ' + item.source,
      'Date:   ' + item.date,
      'Tags:   ' + item.tags.join(', '),
      '',
      'Link: ' + item.url,
    ].join('\n');
  }

  function buildDir(type) {
    const items = ContentUtils.byType(type);
    const children = {};
    for (const item of items) {
      children[item.id + '.md'] = {
        type: 'file',
        content: makeFileContent(item),
        meta: { date: item.date, source: item.source, url: item.url, tags: item.tags },
      };
    }
    return { type: 'dir', children: children };
  }

  FS_TREE.children['blog'] = buildDir('blog');
  FS_TREE.children['video'] = buildDir('video');
  FS_TREE.children['interviews'] = buildDir('interview');
})();


// =================================================================
// VFS — stateless virtual filesystem utilities
// =================================================================

const VFS = {

  /**
   * Resolve a path relative to a given cwd.
   * @param {string} path  - The path to resolve (absolute ~/... or relative)
   * @param {string} cwd   - The current working directory (e.g. '~', '~/projects')
   * @returns {string} Resolved canonical path (e.g. '~', '~/projects/starrocks.md')
   */
  resolvePath(path, cwd) {
    if (path === '~' || path === '') return '~';
    if (path === '/') return '~';

    // Handle ~ prefix — treat as absolute from home
    if (path.startsWith('~/')) {
      path = path.substring(2);
    } else if (path.startsWith('/')) {
      path = path.substring(1);
    }

    // Build from cwd for relative paths
    let base = cwd || '~';
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
  },

  /**
   * Get a node from the filesystem tree.
   * @param {string} path - Canonical path (e.g. '~', '~/projects/starrocks.md')
   * @returns {Object|null} The FS node or null if not found
   */
  getNode(path) {
    if (path === '~') return FS_TREE;

    const parts = path.split('/').filter(Boolean);
    if (parts[0] === '~') parts.shift();

    let current = FS_TREE;
    for (const part of parts) {
      if (!current || current.type !== 'dir' || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    return current;
  },

  /**
   * List directory contents.
   * @param {string} path - Canonical path to a directory
   * @returns {Array|null} [{name, type, node}, ...] sorted alphabetically, or null
   */
  listDir(path) {
    const node = this.getNode(path);
    if (!node || node.type !== 'dir') return null;
    return Object.keys(node.children).sort().map(name => ({
      name,
      type: node.children[name].type,
      node: node.children[name],
    }));
  },

  /**
   * Read file content.
   * @param {string} path - Canonical path to a file
   * @returns {string|null} File content string, or null if not a file
   */
  readFile(path) {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content;
  },

  /**
   * HTML escape utility.
   * @param {string} text - Raw text to escape
   * @returns {string} HTML-safe string
   */
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Render file content with basic markdown heading support and auto-linking.
   * @param {string} content  - File text content
   * @param {string} filename - For detecting .md files
   * @returns {string} HTML string
   */
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
  },
};
