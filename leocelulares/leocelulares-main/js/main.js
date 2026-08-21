/* =============================================
/* =============================================
   LEO CELULARES — JAVASCRIPT (ENHANCED)
   ============================================= */

(function () {
  'use strict';

  // ---- Back to top reference (needed in onScroll) ----
  const backToTop = document.getElementById('backToTop');

  // ---- Scroll progress bar ----
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / total * 100) + '%';
  }

  // ---- Header scrolled class ----
  const header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
    updateProgress();
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Menu mobile (hamburger) ----
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    nav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ---- Typewriter effect ----
  const typeEl = document.getElementById('typeText');
  const phrases = ['Assistência Técnica', 'iPhone & Android', 'Busca e Entrega', 'Garantia no Serviço'];
  let phraseIdx = 0, charIdx = 0, deleting = false, lastTime = 0;

  function type() {
    const current = phrases[phraseIdx];
    typeEl.textContent = deleting
      ? current.slice(0, charIdx--)
      : current.slice(0, charIdx++);

    if (!deleting && charIdx > current.length) {
      setTimeout(() => { deleting = true; requestAnimationFrame(tick); }, 1800);
      return;
    }
    if (deleting && charIdx < 0) {
      deleting = false;
      charIdx = 0;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
    requestAnimationFrame(tick);
  }

  function tick(ts = 0) {
    const delay = deleting ? 45 : 90;
    if (ts - lastTime >= delay) { lastTime = ts; type(); }
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---- Canvas Particles ----
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [];

    function resizeCanvas() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    new ResizeObserver(resizeCanvas).observe(canvas);

    for (let i = 0; i < 70; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + .5,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        alpha: Math.random() * .45 + .1
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,197,94,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,197,94,${.07 * (1 - dist / 110)})`;
            ctx.lineWidth = .5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ---- Animate on Scroll ----
  const aosCandidates = document.querySelectorAll(
    '[data-aos], .service-card, .diferencial, .contato-card, .sobre-image-wrap, .sobre-content'
  );
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...(entry.target.parentElement?.children ?? [])];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 100);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  aosCandidates.forEach(el => observer.observe(el));

  // ---- Counter animation ----
  document.querySelectorAll('.counter[data-count]').forEach(el => {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const target = parseInt(el.dataset.count);
      const start = performance.now();
      const duration = 1800;
      (function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = '+' + Math.floor(ease * target);
        if (t < 1) requestAnimationFrame(step);
        else { el.textContent = '+' + target; el.classList.add('done'); }
      })(performance.now());
      io.disconnect();
    }, { threshold: .5 });
    io.observe(el);
  });

  // ---- Testimonials Carousel ----
  const track = document.getElementById('testimonialsTrack');
  const dots  = document.querySelectorAll('#testimonialsDots .dot');
  let current = 0, autoTimer;

  function goTo(idx) {
    current = ((idx % dots.length) + dots.length) % dots.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5000); }

  document.getElementById('nextBtn').addEventListener('click', () => { clearInterval(autoTimer); goTo(current + 1); startAuto(); });
  document.getElementById('prevBtn').addEventListener('click', () => { clearInterval(autoTimer); goTo(current - 1); startAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { clearInterval(autoTimer); goTo(+d.dataset.index); startAuto(); }));
  startAuto();

  // Swipe support
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { clearInterval(autoTimer); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });
  }

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---- Smooth scroll para links âncora ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Active nav link ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) link.style.color = 'var(--green)';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => sectionObserver.observe(sec));

  // ---- Back to top ----
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
