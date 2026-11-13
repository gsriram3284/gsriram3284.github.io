(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close −' : 'Menu +';
    nav.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = 'Menu +';
    nav.classList.remove('open');
  }));

  const rows = [...document.querySelectorAll('.publication')];
  const tabs = [...document.querySelectorAll('.filter-tab')];
  const input = document.querySelector('#publication-search');
  const year = document.querySelector('#publication-year');
  const count = document.querySelector('#publication-count');
  const empty = document.querySelector('#publication-empty');
  let filter = 'selected';
  function applyFilters() {
    const query = (input?.value || '').trim().toLocaleLowerCase();
    const selectedYear = year?.value || 'all';
    let visible = 0;
    rows.forEach(row => {
      const typeMatches = filter === 'all' || (filter === 'selected' && row.dataset.selected === 'true') || row.dataset.type === filter;
      const yearMatches = selectedYear === 'all' || row.dataset.year === selectedYear;
      const textMatches = !query || row.textContent.toLocaleLowerCase().includes(query);
      const show = typeMatches && yearMatches && textMatches;
      row.hidden = !show;
      if (show) {
        visible += 1;
        row.querySelector('.pub-number').textContent = String(visible).padStart(2, '0');
      }
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'work' : 'works'} shown · ${rows.length} works in the complete list`;
    if (empty) empty.hidden = visible !== 0;
  }
  tabs.forEach(tab => tab.addEventListener('click', () => {
    filter = tab.dataset.filter;
    tabs.forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }));
  input?.addEventListener('input', applyFilters);
  year?.addEventListener('change', applyFilters);
  document.querySelectorAll('[data-publication-filter]').forEach(link => link.addEventListener('click', () => {
    filter = link.dataset.publicationFilter;
    tabs.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (input) input.value = '';
    if (year) year.value = 'all';
    applyFilters();
  }));
  if (rows.length) applyFilters();
  document.querySelector('[data-print-cv]')?.addEventListener('click', () => window.print());
})();


// The carousel uses the original figures and remains readable without JavaScript.
(() => {
  const carousel = document.querySelector('[data-paper-carousel]');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.paper-slide')];
  const dots = [...carousel.querySelectorAll('[data-paper-slide]')];
  const counter = carousel.querySelector('[data-paper-count]');
  const status = carousel.querySelector('[data-paper-status]');
  const play = carousel.querySelector('[data-paper-play]');
  const playLabel = carousel.querySelector('[data-paper-play-label]');
  const playSymbol = carousel.querySelector('[data-paper-play-symbol]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let userPaused = reducedMotion.matches;
  let pointerPaused = false;
  let focusPaused = false;
  let timer;

  function schedule() {
    window.clearTimeout(timer);
    if (!userPaused && !pointerPaused && !focusPaused && !document.hidden) {
      timer = window.setTimeout(() => show(index + 1), 8000);
    }
  }
  function updatePlayControl() {
    const label = userPaused ? 'Play' : 'Pause';
    playLabel.textContent = label;
    playSymbol.textContent = userPaused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', `${label} automatic slideshow`);
  }
  function show(next, manual = false) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (manual) status.textContent = `Paper ${index + 1} of ${slides.length}: ${slides[index].querySelector('.paper-slide-title').textContent}`;
    schedule();
  }
  carousel.querySelector('[data-paper-prev]').addEventListener('click', () => show(index - 1, true));
  carousel.querySelector('[data-paper-next]').addEventListener('click', () => show(index + 1, true));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.paperSlide), true)));
  play.addEventListener('click', () => {
    userPaused = !userPaused;
    if (!userPaused) focusPaused = false;
    updatePlayControl();
    schedule();
  });
  carousel.addEventListener('mouseenter', () => { pointerPaused = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { pointerPaused = false; schedule(); });
  carousel.addEventListener('focusin', () => { focusPaused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focusPaused = false; schedule(); }
  });
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) userPaused = true;
    updatePlayControl();
    schedule();
  });
  updatePlayControl();
  schedule();
})();
