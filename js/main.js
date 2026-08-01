/**
 * C++ Internals — Main JavaScript
 * A vanilla JS application for a C++ course material website.
 * Matches IDs/classes from index.html and css/style.css
 */

// =============================================
// DATA
// =============================================

const CONTRIBUTORS = [
  { name: 'Naveen Thumati', role: 'Core Contributor', github: 'naveenthumati95', linkedin: 'https://www.linkedin.com/in/naveenthumati95/', avatar: null, bio: 'Diving deep into systems programming and C++ architecture.' },
  { name: 'Aryan Chakravorty', role: 'Core Contributor', github: 'aryanchakravorty', linkedin: 'https://www.linkedin.com/in/aryan-chakravorty-414118357/', avatar: null, bio: 'Exploring the depths of modern C++ internals.' },
  { name: 'Abhiraj Singh', role: 'Core Contributor', github: 'abhiraj-singh-154', linkedin: 'https://www.linkedin.com/in/abhirajsingh154/', avatar: null, bio: 'Passionate about understanding C++ from the ground up.' }
];

const TOPICS = [
  // Core Mechanics & OOP (Abhiraj)
  { 
    id: '01-memory-layout-and-pointers', 
    title: 'Memory Layout and Pointers', 
    file: 'topics/01-memory-pointers-intro.md', 
    category: 'Core Mechanics & OOP', 
    author: 'Abhiraj Singh', 
    difficulty: 'intermediate', 
    description: 'Deep dive into memory layout, stack vs heap, pointer arithmetic, references, pass-by-value vs reference, and memory leaks.',
    subtopics: [
      { id: 'memory-layout', title: '1. Memory Layout', file: 'topics/01a-memory-layout.md' },
      { id: 'dynamic-allocation', title: '2. Dynamic Allocation', file: 'topics/01b-dynamic-allocation.md' },
      { id: 'pointer-fundamentals', title: '3. Pointer Fundamentals', file: 'topics/01c-pointer-fundamentals.md' },
      { id: 'references', title: '4. References', file: 'topics/01d-references.md' },
      { id: 'passing-arguments', title: '5. Passing Arguments', file: 'topics/01e-passing-arguments.md' },
      { id: 'placement-new', title: '6. Placement new', file: 'topics/01f-placement-new.md' }
    ]
  },
  { id: '02-oops', title: 'Object-Oriented Programming in C++', file: 'topics/02-oops.md', category: 'Core Mechanics & OOP', author: 'Abhiraj Singh', difficulty: 'beginner', description: 'Classes, inheritance, polymorphism, encapsulation, abstraction — the OOP pillars in C++ and how they work under the hood.' },
  { id: 'rvalue-move-semantics', title: 'Rvalue References, Move Semantics & Perfect Forwarding', file: 'topics/03-rvalue-references-move-semantics.md', category: 'Core Mechanics & OOP', author: 'Abhiraj Singh', difficulty: 'advanced', description: 'Rvalue references, std::move, std::forward, reference collapsing rules, and writing move-aware classes.' },
  { id: 'const-static-volatile', title: 'const, static, volatile & Their Uses in Classes', file: 'topics/04-const-static-volatile.md', category: 'Core Mechanics & OOP', author: 'Abhiraj Singh', difficulty: 'intermediate', description: 'Deep dive into const correctness, static members, volatile semantics, mutable keyword, and their interactions in class design.' },
  
  // Templates & STL (Aryan)
  { id: 'type-deduction', title: 'Type Deduction — Templates, auto & decltype', file: 'topics/05-type-deduction.md', category: 'Templates & STL', author: 'Aryan Chakravorty', difficulty: 'intermediate', description: 'How the compiler deduces types with template type deduction, auto, and decltype. Reference collapsing rules and subtleties.' },
  { id: 'crtp-templates-sfinae', title: 'CRTP, Type Casting, TMP, SFINAE & Variadic Templates', file: 'topics/06-crtp-templates-sfinae.md', category: 'Templates & STL', author: 'Aryan Chakravorty', difficulty: 'advanced', description: 'Curiously Recurring Template Pattern, static_cast/dynamic_cast/reinterpret_cast, template metaprogramming, SFINAE, and variadic templates.' },
  { id: 'stl-containers-internals', title: 'STL Containers & Internal Complexities', file: 'topics/07-stl-containers-internals.md', category: 'Templates & STL', author: 'Aryan Chakravorty', difficulty: 'advanced', description: 'How vector, map, unordered_map, deque work internally. Custom implementations of vector and map with time complexity analysis.' },
  
  // Modern C++ & Performance (Naveen)
  { 
    id: 'smart-pointers-raii', 
    title: 'Smart Pointers, RAII & Exception handling', 
    file: 'topics/08-smart-pointers-intro.md', 
    category: 'Modern C++ & Performance', 
    author: 'Naveen Thumati', 
    difficulty: 'advanced', 
    description: 'unique_ptr, shared_ptr, weak_ptr internals, RAII pattern, exceptions.',
    subtopics: [
      { id: 'raii', title: '1. RAII', file: 'topics/08a-raii.md' },
      { id: 'unique-ptr', title: '2. std::unique_ptr', file: 'topics/08b-unique-ptr.md' },
      { id: 'shared-ptr', title: '3. std::shared_ptr', file: 'topics/08c-shared-ptr.md' },
      { id: 'weak-ptr', title: '4. std::weak_ptr', file: 'topics/08d-weak-ptr.md' },
      { id: 'make-unique-shared', title: '5. std::make_unique & std::make_shared', file: 'topics/08e-make-unique-shared.md' },
      { id: 'exceptions-handling', title: '6. Exceptions and handling', file: 'topics/08f-exceptions-handling.md' }
    ]
  },
  { id: 'performance-low-latency', title: 'Performance & Low-Latency Patterns', file: 'topics/09-performance-low-latency.md', category: 'Modern C++ & Performance', author: 'Naveen Thumati', difficulty: 'advanced', description: 'Cache lines, false sharing, alignment, branch prediction, SIMD hints, and understanding how C++ maps to assembly.' },
  { id: 'modern-cpp-best-practices', title: 'Best Modern C++ Practices', file: 'topics/10-modern-cpp-best-practices.md', category: 'Modern C++ & Performance', author: 'Naveen Thumati', difficulty: 'intermediate', description: 'Why constexpr over macros, nullptr vs NULL/0, noexcept, structured bindings, std::optional, and other modern idioms.' },
  
  // Concurrency (Unassigned)
  { id: 'concurrency-1', title: 'Concurrency Part 1 — Threads, Mutexes & Synchronization', file: 'topics/11-concurrency-1.md', category: 'Concurrency', author: 'TBD', difficulty: 'advanced', description: 'std::thread, mutexes, semaphores, latches, barriers, promise/future, condition variables, and thread-safe Singleton patterns.' },
  { id: 'concurrency-2', title: 'Concurrency Part 2 — Atomics, Memory Model & Lock-Free', file: 'topics/12-concurrency-2.md', category: 'Concurrency', author: 'TBD', difficulty: 'advanced', description: 'std::atomic, C++ memory model, memory ordering (seq_cst, acquire-release, relaxed), memory fences, and lock-free programming.' },
  
  // New Topics
  { id: '13-functors-and-lambdas', title: 'Functors & Lambdas', file: 'topics/13-functors-and-lambdas.md', category: 'Core Mechanics & OOP', author: 'Abhiraj Singh', difficulty: 'intermediate', description: 'Function pointers, callable objects, functor classes, and lambda expressions — how they relate and when to use each.' }
];

const CATEGORIES = [...new Set(TOPICS.map(t => t.category))];

// =============================================
// STATE
// =============================================
let currentSearchIndex = -1;
let currentSearchResults = [];

// =============================================
// MARKDOWN CONFIGURATION
// =============================================
function configureMarkdown() {
  if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();
    
    // Custom link renderer to support Godbolt iframes and new Marked API
    renderer.link = function(tokenOrHref, possibleTitle, possibleText) {
      let href, title, text;
      if (typeof tokenOrHref === 'object' && tokenOrHref !== null) {
        href = tokenOrHref.href;
        title = tokenOrHref.title;
        // New Marked API: parse inline tokens for bold/italic text inside links
        text = (this.parser && tokenOrHref.tokens) ? this.parser.parseInline(tokenOrHref.tokens) : tokenOrHref.text;
      } else {
        href = tokenOrHref;
        title = possibleTitle;
        text = possibleText;
      }

      if (text && text.toLowerCase() === 'godbolt' && href && href.includes('godbolt.org')) {
        return `<div class="godbolt-wrapper"><iframe src="${href}" allowfullscreen></iframe></div>`;
      }
      
      const targetAttr = (href && href.startsWith('#')) ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}" ${title ? `title="${title}"` : ''}${targetAttr}>${text}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined') {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
        return code;
      }
    });
  }
}

// =============================================
// ROUTER (Hash-based)
// =============================================
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

async function handleRoute() {
  const hash = window.location.hash || '#/';
  const mainContent = document.getElementById('mainContent');
  const toc = document.getElementById('toc');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!mainContent) return;

  // Show spinner, hide TOC
  if (loadingSpinner) loadingSpinner.style.display = 'flex';
  if (toc) toc.style.display = 'none';

  // Clear article
  const article = mainContent.querySelector('article') || mainContent;

  updateSidebarActiveItem();
  closeSidebarOnMobile();
  window.scrollTo(0, 0);

  try {
    if (hash === '#/' || hash === '' || hash === '#') {
      renderHomePage(article);
    } else if (hash.startsWith('#/topic/')) {
      const topicId = hash.replace('#/topic/', '');
      await renderTopicPage(topicId, article);
    } else if (hash === '#/contributors') {
      renderContributorsPage(article);
    } else if (hash === '#/about') {
      renderAboutPage(article);
    } else {
      article.innerHTML = '<div class="coming-soon"><h2>404 — Page Not Found</h2><p>The requested page does not exist.</p><a href="#/">← Back to Home</a></div>';
    }

    if (loadingSpinner) loadingSpinner.style.display = 'none';
    setupScrollAnimations();
  } catch (error) {
    console.error('Routing error:', error);
    article.innerHTML = '<div class="coming-soon"><h2>Error</h2><p>Failed to load the page. Please try again.</p></div>';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
  }
}

// =============================================
// HELPER: FIND TOPIC OR SUBTOPIC
// =============================================
function findTopicById(id) {
  for (const t of TOPICS) {
    if (t.id === id) return t;
    if (t.subtopics) {
      const sub = t.subtopics.find(s => s.id === id);
      if (sub) {
        // Return a proxy object so we can read author and category from parent
        return {
          ...sub,
          author: t.author,
          category: t.category,
          difficulty: t.difficulty
        };
      }
    }
  }
  return null;
}

window.toggleSubtopics = function(event, element) {
  event.preventDefault();
  event.stopPropagation();
  const link = element.closest('.sidebar-link');
  const container = link.nextElementSibling;
  if (container && container.classList.contains('sidebar-subtopics-container')) {
    container.classList.toggle('collapsed');
    element.classList.toggle('rotated');
  }
};

// =============================================
// PAGE RENDERERS
// =============================================

function renderHomePage(container) {
  const toc = document.getElementById('toc');
  if (toc) toc.style.display = 'none';

  let html = `
    <div class="hero-section fade-in">
      <h1 class="hero-title">C++ Internals</h1>
      <p class="hero-subtitle">Deep dive into the architecture, memory model, and runtime of modern C++. A course by the Coding Club, IIT Guwahati.</p>
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-number">${TOPICS.length}</div>
          <div class="stat-label">Topics</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${CATEGORIES.length}</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${CONTRIBUTORS.length}</div>
          <div class="stat-label">Contributors</div>
        </div>
      </div>
    </div>

    <div class="category-filters fade-in">
      <button class="filter-btn active" data-filter="all">All Topics</button>
      ${CATEGORIES.map(c => `<button class="filter-btn" data-filter="${c}">${c}</button>`).join('')}
    </div>

    <div class="topic-grid fade-in" id="topicGrid">
      ${renderTopicCards(TOPICS)}
    </div>

    <div class="contributors-home fade-in">
      <h2>Contributors</h2>
      <div class="contributors-section">
        ${CONTRIBUTORS.map(c => `
          <div class="contributor-card">
            <div class="contributor-avatar">
              <div class="avatar-placeholder">${c.name.charAt(0)}</div>
            </div>
            <div class="contributor-name">${c.name}</div>
            <div class="contributor-role">${c.role}</div>
            <p class="contributor-bio">${c.bio}</p>
            <a href="https://github.com/${c.github}" target="_blank" rel="noopener noreferrer" class="contributor-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              GitHub
            </a>
            ${c.linkedin ? `
            <a href="${c.linkedin}" target="_blank" rel="noopener noreferrer" class="contributor-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Filter logic
  const filterBtns = container.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      const grid = document.getElementById('topicGrid');
      const filtered = filter === 'all' ? TOPICS : TOPICS.filter(t => t.category === filter);
      grid.innerHTML = renderTopicCards(filtered);
      setupScrollAnimations();
    });
  });
}

function renderTopicCards(topics) {
  if (topics.length === 0) {
    return '<div class="coming-soon"><p>No topics in this category yet.</p></div>';
  }
  return topics.map(t => `
    <a href="#/topic/${t.id}" class="topic-card">
      <div class="topic-card-header">
        <span class="topic-author">By ${t.author}</span>
      </div>
      <h3>${t.title}</h3>
      <p>${t.description}</p>
      <span class="tag">${t.category}</span>
    </a>
  `).join('');
}

async function renderTopicPage(topicId, container) {
  const topic = findTopicById(topicId);

  if (!topic) {
    container.innerHTML = '<div class="coming-soon"><h2>404 — Topic Not Found</h2><p>This topic does not exist.</p><a href="#/">← Back to Home</a></div>';
    return;
  }

  // Breadcrumb + header
  let html = `
    <div class="breadcrumb fade-in">
      <a href="#/">Home</a>
      <span class="separator">›</span>
      <span>${topic.category}</span>
      <span class="separator">›</span>
      <span class="current">${topic.title}</span>
    </div>
    <div class="topic-page-header fade-in">
      <h1>${topic.title}</h1>
      <div class="topic-meta">
        <span class="tag">${topic.category}</span>
        <span class="topic-author">By ${topic.author}</span>
        <span class="read-time" id="readTime">⏱ Calculating...</span>
      </div>
    </div>
    <div class="article-content fade-in" id="articleBody">
      <div class="loading-spinner"><div class="spinner"></div></div>
    </div>
  `;

  // Prev / Next navigation
  const flatTopics = [];
  TOPICS.forEach(t => {
    flatTopics.push(t);
    if (t.subtopics) flatTopics.push(...t.subtopics);
  });
  const currentIndex = flatTopics.findIndex(t => t.id === topicId);
  const prevTopic = currentIndex > 0 ? flatTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < flatTopics.length - 1 ? flatTopics[currentIndex + 1] : null;

  html += `<div class="topic-navigation fade-in">`;
  if (prevTopic) {
    html += `<a href="#/topic/${prevTopic.id}" class="nav-prev"><span class="nav-label">← Previous</span><span class="nav-title">${prevTopic.title}</span></a>`;
  } else {
    html += `<div></div>`;
  }
  if (nextTopic) {
    html += `<a href="#/topic/${nextTopic.id}" class="nav-next"><span class="nav-label">Next →</span><span class="nav-title">${nextTopic.title}</span></a>`;
  }
  html += `</div>`;

  container.innerHTML = html;

  // Fetch markdown content
  const articleBody = document.getElementById('articleBody');
  try {
    const response = await fetch(topic.file);
    if (!response.ok) throw new Error('Not found');
    const mdText = await response.text();

    // Check if it's just a placeholder
    const isPlaceholder = mdText.includes('This article is currently being written') || mdText.includes('Coming soon');

    if (typeof marked !== 'undefined') {
      articleBody.innerHTML = marked.parse(mdText);
      postProcessMarkdown(articleBody);

      // Reading time
      const wordCount = mdText.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      const readTimeEl = document.getElementById('readTime');
      if (readTimeEl) readTimeEl.textContent = `⏱ ${readingTime} min read`;

      // Generate TOC if not placeholder
      if (!isPlaceholder) {
        generateTOC(articleBody);
      }
    } else {
      articleBody.innerHTML = '<p>Error: Markdown parser not loaded.</p>';
    }
  } catch (error) {
    articleBody.innerHTML = `
      <div class="coming-soon">
        <div class="coming-soon-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
        </div>
        <h2>Under Construction</h2>
        <p>The content for <strong>${topic.title}</strong> is currently being written.</p>
        <p class="coming-soon-desc">${topic.description}</p>
        <a href="#/" class="coming-soon-link">← Browse all topics</a>
      </div>
    `;
    const readTimeEl = document.getElementById('readTime');
    if (readTimeEl) readTimeEl.textContent = '';
  }
}

function postProcessMarkdown(container) {
  // Add anchor links to headings
  const headings = container.querySelectorAll('h1, h2, h3, h4');
  headings.forEach(heading => {
    const id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    heading.id = id;
    heading.style.scrollMarginTop = '90px';

    const anchor = document.createElement('a');
    anchor.href = `#${id}`;
    anchor.className = 'heading-anchor';
    anchor.innerHTML = '#';
    anchor.title = 'Link to this section';
    heading.appendChild(anchor);
  });

  // Add copy buttons to code blocks
  const preBlocks = container.querySelectorAll('pre');
  preBlocks.forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    // Detect language
    const codeEl = pre.querySelector('code');
    const langClass = codeEl ? [...codeEl.classList].find(c => c.startsWith('language-')) : null;
    const lang = langClass ? langClass.replace('language-', '') : 'code';

    // Header bar
    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `<span>${lang}</span>`;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      const code = codeEl ? codeEl.textContent : pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.color = 'var(--success)';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.color = '';
        }, 2000);
      });
    });
    header.appendChild(copyBtn);

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });

  // Apply syntax highlighting
  if (typeof hljs !== 'undefined') {
    container.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
}

function generateTOC(contentContainer) {
  const toc = document.getElementById('toc');
  const tocNav = document.getElementById('tocNav');
  if (!toc || !tocNav) return;

  const headings = contentContainer.querySelectorAll('h2, h3');
  if (headings.length < 2) {
    toc.style.display = 'none';
    return;
  }

  let tocHTML = '';
  headings.forEach(h => {
    const level = h.tagName.toLowerCase();
    const indent = level === 'h3' ? 'toc-indent' : '';
    const text = h.textContent.replace(/#$/, '').trim();
    tocHTML += `<a href="#${h.id}" class="toc-link ${indent}" data-target="${h.id}">${text}</a>`;
  });
  tocNav.innerHTML = tocHTML;
  toc.style.display = '';

  // Smooth scroll for TOC links
  tocNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(a.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active tracking
  setupTOCScrollSpy(headings, tocNav);
}

function setupTOCScrollSpy(headings, tocNav) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocNav.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
        const link = tocNav.querySelector(`[data-target="${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

function renderContributorsPage(container) {
  const toc = document.getElementById('toc');
  if (toc) toc.style.display = 'none';

  container.innerHTML = `
    <div class="fade-in">
      <h1 class="hero-title" style="font-size: 2.5rem; text-align: left;">Contributors</h1>
      <p class="hero-subtitle" style="text-align: left; margin: 0 0 2rem 0;">The amazing people building this resource together.</p>
      <div class="contributors-section">
        ${CONTRIBUTORS.map(c => `
          <div class="contributor-card contributor-card-full">
            <div class="contributor-avatar">
              <div class="avatar-placeholder">${c.name.charAt(0)}</div>
            </div>
            <div class="contributor-name">${c.name}</div>
            <div class="contributor-role">${c.role}</div>
            <p class="contributor-bio">${c.bio}</p>
            <a href="https://github.com/${c.github}" target="_blank" rel="noopener noreferrer" class="contributor-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              GitHub
            </a>
            ${c.linkedin ? `
            <a href="${c.linkedin}" target="_blank" rel="noopener noreferrer" class="contributor-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAboutPage(container) {
  const toc = document.getElementById('toc');
  if (toc) toc.style.display = 'none';

  container.innerHTML = `
    <div class="fade-in article-content about-ide-window">
      <div class="ide-header">
        <div class="ide-dots">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        </div>
        <div class="ide-filename">src/about.cpp</div>
      </div>
      <div class="ide-content">
<pre><code class="language-cpp">#include &lt;iostream&gt;
#include &lt;memory&gt;
#include &lt;stdexcept&gt;
#include "IITG_CodingClub.h"

<span class="hljs-comment">/* ========================================================================
 * WARNING: You are leaving the safe zone of Python and JS.
 * This course is designed exclusively for our college by the 
 * Coding Club, IIT Guwahati. Get ready to manage your own memory.
 * ======================================================================== */</span>

<span class="hljs-keyword">class</span> <span class="hljs-title class_">CppInternals</span> {
<span class="hljs-keyword">private</span>:
    <span class="hljs-type">const</span> <span class="hljs-type">char</span>* mission = 
        <span class="hljs-string">"To peel back the abstractions. "</span>
        <span class="hljs-string">"We don't just want you to write C++. "</span>
        <span class="hljs-string">"We want you to see the assembly, feel the cache lines, and hear the CPU weeping."</span>;

    <span class="hljs-type">int</span> difficulty_level = <span class="hljs-number">0xDEADBEEF</span>; <span class="hljs-comment">// Unforgiving.</span>

<span class="hljs-keyword">public</span>:
    <span class="hljs-built_in">CppInternals</span>() {
        std::cout &lt;&lt; <span class="hljs-string">"Initializing ${TOPICS.length} topics across ${CATEGORIES.length} categories..."</span> &lt;&lt; std::endl;
        
        <span class="hljs-comment">/* 
         * WHAT TO EXPECT:
         * -&gt; Template Metaprogramming (Turing-complete black magic)
         * -&gt; STL Internals (How std::vector really allocates)
         * -&gt; Lock-Free Concurrency (Because mutexes are for the weak)
         * -&gt; Rvalues & Perfect Forwarding (Stop copying things unnecessarily!)
         */</span>
    }

    <span class="hljs-function"><span class="hljs-type">void</span> <span class="hljs-title">execute</span><span class="hljs-params">()</span> </span>{
        <span class="hljs-keyword">while</span> (<span class="hljs-literal">true</span>) {
            <span class="hljs-keyword">try</span> {
                <span class="hljs-built_in">learn_architecture</span>();
                <span class="hljs-built_in">master_memory_model</span>();
                <span class="hljs-built_in">optimize_performance</span>();
            } <span class="hljs-keyword">catch</span> (<span class="hljs-type">const</span> std::bad_alloc&amp; e) {
                std::cerr &lt;&lt; <span class="hljs-string">"You forgot to check your heap space. Try again."</span> &lt;&lt; std::endl;
            }
        }
    }
};

<span class="hljs-function"><span class="hljs-type">int</span> <span class="hljs-title">main</span><span class="hljs-params">()</span> </span>{
    std::unique_ptr&lt;CppInternals&gt; course = std::make_unique&lt;CppInternals&gt;();
    course-&gt;<span class="hljs-built_in">execute</span>();
    <span class="hljs-keyword">return</span> <span class="hljs-number">0</span>; <span class="hljs-comment">// We never actually reach here.</span>
}</code></pre>
      </div>
    </div>
  `;
}

// =============================================
// SIDEBAR
// =============================================
function renderSidebar() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;

  let html = '';

  // Home link
  html += `<a href="#/" class="sidebar-link sidebar-home-link" data-route="#/">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </a>`;

  CATEGORIES.forEach(category => {
    const topics = TOPICS.filter(t => t.category === category);
    html += `
      <div class="sidebar-category collapsed" data-category="${category}">
        <div class="sidebar-category-header" onclick="toggleCategory(this)">
          <span>${category}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="sidebar-category-topics">
          ${topics.map(t => {
            let htmlChunk = `
            <a href="#/topic/${t.id}" class="sidebar-link" data-topic-id="${t.id}">
              <span class="sidebar-link-dot"></span>
              ${t.title}
              ${t.subtopics ? '<svg class="subtopics-chevron" onclick="toggleSubtopics(event, this)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' : ''}
            </a>
            `;
            if (t.subtopics) {
              htmlChunk += `<div class="sidebar-subtopics-container">
                ${t.subtopics.map(sub => `
                  <a href="#/topic/${sub.id}" class="sidebar-sublink" data-topic-id="${sub.id}">
                    ${sub.title}
                  </a>
                `).join('')}
              </div>`;
            }
            return htmlChunk;
          }).join('')}
        </div>
      </div>
    `;
  });

  // Contributors & About links
  html += `
    <div class="sidebar-extra-links">
      <a href="#/contributors" class="sidebar-link" data-route="#/contributors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Contributors
      </a>
      <a href="#/about" class="sidebar-link" data-route="#/about">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        About
      </a>
    </div>
  `;

  sidebarNav.innerHTML = html;
}

function toggleCategory(header) {
  const parent = header.parentElement;
  parent.classList.toggle('collapsed');
}

function updateSidebarActiveItem() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));

  if (hash.startsWith('#/topic/')) {
    const topicId = hash.replace('#/topic/', '');
    const activeLink = document.querySelector(`a[data-topic-id="${topicId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      
      // Ensure parent category is expanded
      const categoryDiv = activeLink.closest('.sidebar-category');
      if (categoryDiv) categoryDiv.classList.remove('collapsed');

      // If it's a subtopic, make sure its parent container is expanded
      const subtopicContainer = activeLink.closest('.sidebar-subtopics-container');
      if (subtopicContainer) {
        subtopicContainer.classList.remove('collapsed');
        const parentLink = subtopicContainer.previousElementSibling;
        if (parentLink) {
          const chevron = parentLink.querySelector('.subtopics-chevron');
          if (chevron) chevron.classList.remove('rotated');
        }
      }
    }
  } else {
    const activeLink = document.querySelector(`.sidebar-link[data-route="${hash}"]`);
    if (activeLink) activeLink.classList.add('active');
  }
}

function closeSidebarOnMobile() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }
}

// =============================================
// THEME TOGGLE
// =============================================
function initTheme() {
  const savedTheme = localStorage.getItem('cpp-internals-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cpp-internals-theme', next);
      updateThemeIcons(next);
    });
  }
}

function updateThemeIcons(theme) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  if (sunIcon && moonIcon) {
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

// =============================================
// SEARCH
// =============================================
function initSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchTrigger = document.getElementById('searchTrigger');

  if (!searchOverlay || !searchInput) return;

  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }

    // Arrow navigation in search results
    if (searchOverlay.classList.contains('active')) {
      handleSearchKeyNav(e);
    }
  });

  // Search trigger button
  if (searchTrigger) {
    searchTrigger.addEventListener('click', openSearch);
  }

  // Close on overlay click (outside modal)
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  // Input handler
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResults.innerHTML = '<div class="search-empty">Type to search topics...</div>';
      currentSearchResults = [];
      currentSearchIndex = -1;
      return;
    }

    currentSearchResults = TOPICS.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
    currentSearchIndex = -1;

    renderSearchResults(searchResults);
  });
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  if (overlay && input) {
    overlay.classList.add('active');
    input.value = '';
    input.focus();
    document.getElementById('searchResults').innerHTML = '<div class="search-empty">Type to search topics...</div>';
  }
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    currentSearchIndex = -1;
    currentSearchResults = [];
  }
}

function renderSearchResults(container) {
  if (currentSearchResults.length === 0) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }

  container.innerHTML = currentSearchResults.map((t, i) => `
    <a href="#/topic/${t.id}" class="search-result-item ${i === currentSearchIndex ? 'selected' : ''}" data-index="${i}">
      <div class="search-result-info">
        <div class="search-result-title">${t.title}</div>
        <div class="search-result-meta">${t.category}</div>
      </div>
    </a>
  `).join('');

  // Click handlers
  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => closeSearch());
  });
}

function handleSearchKeyNav(e) {
  const container = document.getElementById('searchResults');
  const items = container.querySelectorAll('.search-result-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentSearchIndex = (currentSearchIndex + 1) % items.length;
    updateSearchHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentSearchIndex = (currentSearchIndex - 1 + items.length) % items.length;
    updateSearchHighlight(items);
  } else if (e.key === 'Enter' && currentSearchIndex >= 0 && currentSearchIndex < items.length) {
    e.preventDefault();
    items[currentSearchIndex].click();
  }
}

function updateSearchHighlight(items) {
  items.forEach(item => item.classList.remove('selected'));
  if (currentSearchIndex >= 0 && currentSearchIndex < items.length) {
    items[currentSearchIndex].classList.add('selected');
    items[currentSearchIndex].scrollIntoView({ block: 'nearest' });
  }
}

// =============================================
// UI UTILITIES
// =============================================

// Reading progress bar
function initProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = scrolled + '%';
  });
}

// Back to top button
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Menu toggle (Mobile & Desktop)
function initMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        // Mobile behavior
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      } else {
        // Desktop behavior
        document.body.classList.toggle('sidebar-collapsed');
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}

// Scroll-triggered fade-in animations
function setupScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// =============================================
// BOOTSTRAP
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  configureMarkdown();
  initTheme();
  renderSidebar();
  initSearch();
  initProgressBar();
  initBackToTop();
  initMenuToggle();
  initRouter();
});
