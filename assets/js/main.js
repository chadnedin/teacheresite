// Main JS for navigation, theme toggle, and lightbox gallery
document.addEventListener('DOMContentLoaded', function () {
  // --- Mobile nav toggle(s) ---
  const toggles = document.querySelectorAll('.nav-toggle');
  const closeNav = () => {
    const navList = document.querySelector('#primaryNav .nav-list') || document.querySelector('.nav-list');
    const toggle = document.querySelector('.nav-toggle[aria-expanded="true"]');
    if (navList) navList.setAttribute('data-open', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const controls = btn.getAttribute('aria-controls') || 'primaryNav';
      const nav = document.getElementById(controls) || document.querySelector('.primary-nav');
      if (!nav) return;
      const navList = nav.querySelector('.nav-list') || nav;
      const isOpen = navList.getAttribute('data-open') === 'true';
      navList.setAttribute('data-open', String(!isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        const firstLink = navList.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  });

  // --- Insert theme toggle into header (if not present in markup) ---
  function createThemeToggle() {
    if (document.getElementById('themeToggle')) return;
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Toggle dark mode');

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = '🌙';

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'Theme';

    btn.appendChild(icon);
    btn.appendChild(label);

    headerInner.appendChild(btn);

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // --- Theme handling (improved to set immediate background color) ---
  function applyTheme(theme) {
    var darkBg = '#0f1e17';   // keep in sync with head snippet & CSS
    var lightBg = '#f8f5ec';

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.backgroundColor = darkBg;
      var toggle = document.getElementById('themeToggle');
      if (toggle) toggle.setAttribute('aria-pressed', 'true');
      try {
        var icon = toggle?.querySelector('.icon');
        if (icon) icon.textContent = '☀️';
      } catch (e) { /* ignore */ }
      try {
        var meta = document.querySelector('meta[name="theme-color"]') || (function () {
          var m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); return m;
        })();
        meta.content = darkBg;
      } catch (e) { /* ignore */ }
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.backgroundColor = lightBg;
      var toggle = document.getElementById('themeToggle');
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
      try {
        var icon = toggle?.querySelector('.icon');
        if (icon) icon.textContent = '🌙';
      } catch (e) { /* ignore */ }
      try {
        var meta = document.querySelector('meta[name="theme-color"]') || (function () {
          var m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); return m;
        })();
        meta.content = lightBg;
      } catch (e) { /* ignore */ }
    }
    try { localStorage.setItem('portfolio-theme', theme); } catch (e) { /* ignore */ }
  }

  // Choose initial theme: user preference > localStorage > system preference
  (function initTheme() {
    createThemeToggle();
    var stored = null;
    try { stored = localStorage.getItem('portfolio-theme'); } catch (e) { stored = null; }

    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  })();

  // Close nav when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    const nav = document.querySelector('.nav-list[data-open="true"]');
    if (!nav) return;
    const toggle = document.querySelector('.nav-toggle[aria-expanded="true"]');
    if (!toggle) return;
    const header = document.querySelector('.site-header');
    if (!header.contains(e.target)) closeNav();
  });

  // Close nav after selecting a link (mobile)
  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => closeNav());
  });

  // --- Smooth scroll for anchor links (header offset) ---
  const header = document.querySelector('.site-header');
  const offset = header ? header.offsetHeight + 8 : 0;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // --- Contact form: endpoint-ready with mailto fallback ---
  const form = document.getElementById('contactForm');
  if (form) {
    const statusEl = document.getElementById('contactStatus');
    const setStatus = (message, type) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove('success', 'error');
      if (type) statusEl.classList.add(type);
    };

    const getField = (selector) => form.querySelector(selector)?.value.trim() || '';
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    form.addEventListener('submit', function (e) {
      const name = getField('#name');
      const email = getField('#email');
      const message = getField('#message');

      if (!name || !email || !message || !isValidEmail(email)) {
        e.preventDefault();
        setStatus('Please enter a valid name, email, and message.', 'error');
        return;
      }

      const endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint) {
        setStatus('Opening your default email app to send this message...', 'success');
        return;
      }

      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Sending message...', null);

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })
        .then((res) => {
          if (!res.ok) throw new Error('Request failed');
          setStatus('Thanks. Your message was sent successfully.', 'success');
          form.reset();
        })
        .catch(() => {
          setStatus('Message could not be sent right now. Please email directly at chadnedin@gmail.com.', 'error');
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // --- Artifacts filter chips ---
  const filterButtons = Array.from(document.querySelectorAll('.artifact-filter'));
  if (filterButtons.length) {
    const cards = Array.from(document.querySelectorAll('.artifact-card[data-category]'));

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-filter') || 'all';
        filterButtons.forEach((item) => item.classList.remove('is-active'));
        btn.classList.add('is-active');

        cards.forEach((card) => {
          const category = card.getAttribute('data-category');
          const show = selected === 'all' || category === selected;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // --- Lightbox gallery for artifact images ---
  const gallerySelector = '.artifact-thumb[data-full]';
  const galleryItems = Array.from(document.querySelectorAll(gallerySelector));

  // Build lightbox DOM (lazy create)
  let lightbox = null;
  function buildLightbox() {
    if (lightbox) return lightbox;
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.display = 'none';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    const img = document.createElement('img');
    img.className = 'lightbox-img';
    img.alt = '';

    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close btn';
    closeBtn.setAttribute('aria-label', 'Close image');
    closeBtn.textContent = 'Close';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.textContent = '‹';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.textContent = '›';

    const nav = document.createElement('div');
    nav.className = 'lightbox-controls';
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    content.appendChild(img);
    content.appendChild(caption);
    overlay.appendChild(content);
    overlay.appendChild(nav);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    lightbox = { overlay, img, caption, prevBtn, nextBtn, closeBtn };
    return lightbox;
  }

  let currentIndex = -1;
  function openLightbox(index) {
    // refresh galleryItems reference in case DOM changed
    const items = Array.from(document.querySelectorAll(gallerySelector));
    if (!items.length) return;
    index = Math.max(0, Math.min(index, items.length - 1));
    const lb = buildLightbox();
    const item = items[index];
    const src = item.getAttribute('data-full') || item.getAttribute('src');
    const alt = item.getAttribute('alt') || '';
    const title = item.closest('.artifact-card')?.querySelector('h4')?.textContent || '';

    lb.img.src = src;
    lb.img.alt = alt || title;
    lb.caption.textContent = title || alt || '';
    lb.overlay.classList.add('open');
    lb.overlay.style.display = 'flex';
    currentIndex = index;

    // focus for accessibility
    lb.closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.overlay.classList.remove('open');
    setTimeout(() => { lightbox.overlay.style.display = 'none'; }, 200);
    currentIndex = -1;
  }

  function showNext(delta) {
    const items = Array.from(document.querySelectorAll(gallerySelector));
    if (!items.length || currentIndex < 0) return;
    let next = (currentIndex + delta + items.length) % items.length;
    openLightbox(next);
  }

  // Delegate click on thumbnails
  document.addEventListener('click', function (e) {
    const thumb = e.target.closest(gallerySelector);
    if (thumb) {
      e.preventDefault();
      const items = Array.from(document.querySelectorAll(gallerySelector));
      const index = items.indexOf(thumb);
      if (index >= 0) openLightbox(index);
    }
  });

  // Lightbox controls (delegated)
  document.addEventListener('click', function (e) {
    if (!lightbox) return;
    const lb = lightbox;
    if (e.target === lb.closeBtn) closeLightbox();
    if (e.target === lb.nextBtn) showNext(1);
    if (e.target === lb.prevBtn) showNext(-1);
    if (e.target === lb.overlay && e.target === lightbox.overlay) {
      closeLightbox();
    }
  });

  // Keyboard controls
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.overlay || !lightbox.overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext(1);
    if (e.key === 'ArrowLeft') showNext(-1);
  });

  // --- Scroll reveal for key content blocks ---
  const revealTargets = Array.from(document.querySelectorAll(
    '.card, .artifact-card, .timeline-card, .metric-card, .hero-panel, .video-embed'
  ));
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in-view'));
  }

  // --- Top progress bar and back-to-top control ---
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  const topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.textContent = '↑';
  document.body.appendChild(topBtn);

  const updateScrollUI = () => {
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    progressBar.style.transform = `scaleX(${progress})`;

    if (window.scrollY > 450) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);
  updateScrollUI();

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Observe DOM for updates to gallery items
  const galleryObserver = new MutationObserver(() => {
    // no-op here; gallery selectors are queried when opening
  });
  galleryObserver.observe(document.body, { childList: true, subtree: true });
});