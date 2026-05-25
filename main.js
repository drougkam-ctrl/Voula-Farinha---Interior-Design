/* ============================================================
   VOULA FARINHA — INTERIOR DESIGN
   main.js — Premium Interactions
   Lenis · GSAP ScrollTrigger · Canvas Particles · Cursor
   ============================================================ */

'use strict';

/* ── Register GSAP plugins ─────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ── Globals ───────────────────────────────────────────────── */
let lenis    = null;
let particles = null;

/* ============================================================
   1. PRELOADER
   ============================================================ */
function initPreloader() {
  const el       = document.getElementById('preloader');
  const counter  = document.getElementById('pre-counter');
  const fill     = document.getElementById('pre-fill');
  const spans1   = document.querySelectorAll('.pre-name-1 span');
  const spans2   = document.querySelectorAll('.pre-name-2 span');
  const sub      = document.querySelector('.pre-sub');
  const lineTop  = document.querySelector('.pre-line-top');
  const lineBot  = document.querySelector('.pre-line-bot');

  /* Fake progress counter */
  let count = 0;
  const ticker = setInterval(() => {
    count = Math.min(count + Math.floor(Math.random() * 9) + 2, 100);
    if (counter) counter.textContent = count + '%';
    if (fill)    gsap.set(fill, { width: count + '%' });
    if (count >= 100) clearInterval(ticker);
  }, 38);

  /* Animation timeline */
  const tl = gsap.timeline({
    delay: 0.2,
    onComplete: () => {
      el.style.pointerEvents = 'none';
      onPreloaderDone();
    }
  });

  tl.to(lineTop, { width: 180, duration: 0.6, ease: 'power2.inOut' })
    .to(spans1, {
      y: 0, opacity: 1,
      duration: 0.85, stagger: 0.05, ease: 'power4.out'
    }, '-=0.1')
    .to(spans2, {
      y: 0, opacity: 1,
      duration: 0.85, stagger: 0.05, ease: 'power4.out'
    }, '-=0.65')
    .to(sub, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to(lineBot, { width: 180, duration: 0.6, ease: 'power2.inOut' }, '-=0.3')
    .to(el, {
      yPercent: -105,
      duration: 1.05,
      ease: 'power4.inOut',
      delay: 0.5
    });
}

function onPreloaderDone() {
  document.getElementById('preloader').style.display = 'none';
  animateHeroEntry();
}

/* ============================================================
   2. LENIS SMOOTH SCROLL
   ============================================================ */
function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2.0,
  });

  /* Sync with GSAP ticker */
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Smooth anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.5, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
  });
}

/* ============================================================
   3. CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const dot   = document.getElementById('cursor-dot');
  const ring  = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0, labelX = 0, labelY = 0;
  let rActive = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    gsap.set(dot,   { x: mx, y: my });
    gsap.set(label, { x: mx, y: my });
  });

  /* Soft follow for ring */
  (function tickRing() {
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tickRing);
  })();

  /* Hover states */
  document.querySelectorAll('a, button, .svc-card, .p-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hovered');
      ring.classList.remove('view');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hovered');
    });
  });

  /* Gallery "view" cursor */
  document.querySelectorAll('.g-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.remove('hovered');
      ring.classList.add('view');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('view');
    });
  });

  /* Data-cursor label */
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.dataset.cursor;
      label.classList.add('show');
      dot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      label.classList.remove('show');
      dot.style.opacity = '1';
    });
  });
}

/* ============================================================
   4. HERO CANVAS PARTICLES
   ============================================================ */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W = this.H = 0;
    this.pts = [];
    this.mouse = { x: -999, y: -999 };
    this.raf = null;

    this.resize();
    this.spawn();
    this.tick();

    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    });
    document.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  resize() {
    const hero   = this.canvas.parentElement;
    const rect   = hero.getBoundingClientRect();
    this.canvas.width  = this.W = rect.width  || window.innerWidth;
    this.canvas.height = this.H = rect.height || window.innerHeight;
  }

  mkPt(x, y) {
    return {
      x:  x  ?? Math.random() * this.W,
      y:  y  ?? Math.random() * this.H,
      r:  Math.random() * 2.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.32,
      vy: -(Math.random() * 0.35 + 0.06),
      a:  Math.random() * 0.28 + 0.04,
      aT: Math.random() * 0.28 + 0.04,
      aS: Math.random() * 0.004 + 0.001,
      h:  Math.floor(Math.random() * 35) + 5,    /* warm hue 5–40  */
      s:  Math.floor(Math.random() * 30) + 55,   /* sat  55–85 %   */
      l:  Math.floor(Math.random() * 20) + 52,   /* lit  52–72 %   */
    };
  }

  spawn() {
    this.pts = [];
    const n = Math.floor(this.W / 13);
    for (let i = 0; i < n; i++) this.pts.push(this.mkPt());
  }

  tick() {
    const { ctx, W, H, pts, mouse } = this;
    ctx.clearRect(0, 0, W, H);

    for (const p of pts) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        const f = (110 - d) / 110;
        p.vx += (dx / d) * f * 0.045;
        p.vy += (dy / d) * f * 0.045;
      }

      p.vx *= 0.993;
      p.vy *= 0.993;
      if (p.vy > -0.04) p.vy -= 0.003;

      p.x += p.vx;
      p.y += p.vy;

      /* wrap / recycle */
      if (p.y < -6)     { Object.assign(p, this.mkPt()); p.y = H + 6; }
      if (p.x < -6)     p.x = W + 6;
      if (p.x > W + 6)  p.x = -6;

      /* alpha oscillation */
      const diff = p.aT - p.a;
      p.a += diff * p.aS;
      if (Math.abs(diff) < 0.01) p.aT = Math.random() * 0.28 + 0.04;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.h},${p.s}%,${p.l}%,${p.a})`;
      ctx.fill();
    }

    this.raf = requestAnimationFrame(() => this.tick());
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/* ============================================================
   5. NAVIGATION
   ============================================================ */
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');

  /* Scrolled state */
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 60)
  });

  /* Hamburger */
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      if (open) lenis?.stop(); else lenis?.start();
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.classList.remove('open');
        lenis?.start();
      });
    });
  }
}

/* ============================================================
   6. HERO ENTRY ANIMATION
   ============================================================ */
function animateHeroEntry() {
  /* Start particles */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) particles = new ParticleSystem(canvas);

  const tl = gsap.timeline({ delay: 0.1 });

  /* Tag line width reveal */
  tl.to('.tag-line', { width: 28, duration: 0.6, ease: 'power2.out' })
    .to('.hero-tag', {
      y: 0, opacity: 1,
      duration: 0.7, ease: 'power3.out'
    }, '-=0.3')
    .to('.hero-li', {
      y: 0,
      duration: 1.15,
      stagger: 0.14,
      ease: 'power4.out'
    }, '-=0.3')
    .to('.hero-caption', { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.5')
    .to('.hero-ctas',    { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.65')
    .to('#hero-img',     { opacity: 1, duration: 1.1, ease: 'power3.out' }, '-=0.8')
    .to('.hero-img-badge',{ opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .to('.hero-scroll',  { opacity: 1, duration: 0.5 }, '-=0.3');

  /* Hero title lines start clipped */
  gsap.set('.hero-li', { y: '110%' });
}

/* ============================================================
   7. SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const ease = 'power3.out';

  /* Generic reveal */
  gsap.utils.toArray('.js-reveal').forEach(el => {
    gsap.to(el, {
      y: 0, opacity: 1,
      duration: 1.1, ease,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* Reveal from left */
  gsap.utils.toArray('.js-reveal-left').forEach(el => {
    gsap.to(el, {
      x: 0, opacity: 1,
      duration: 1.2, ease,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* Fade up (smaller distance) */
  gsap.utils.toArray('.js-fade-up').forEach(el => {
    gsap.to(el, {
      y: 0, opacity: 1,
      duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  /* Gallery items stagger */
  gsap.utils.toArray('.js-g-item').forEach((el, i) => {
    gsap.to(el, {
      y: 0, opacity: 1,
      duration: 0.9, ease,
      delay: i * 0.07,
      scrollTrigger: { trigger: '.gallery-grid', start: 'top 86%', once: true }
    });
  });
}

/* ============================================================
   8. PARALLAX
   ============================================================ */
function initParallax() {
  /* Hero photo */
  gsap.to('#hero-img .hero-img-inner img', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  /* About image */
  gsap.to('#about-img', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  /* Contact CTA parallax */
  gsap.to('.contact-parallax-img img', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#contact',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
}

/* ============================================================
   9. COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = target === 98 ? '%+' : '+';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to({ v: 0 }, {
          v: target,
          duration: 1.7,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.round(this.targets()[0].v) + suffix;
          }
        });
      }
    });
  });
}

/* ============================================================
   10. PROCESS LINE
   ============================================================ */
function initProcessLine() {
  ScrollTrigger.create({
    trigger: '#process',
    start: 'top 62%',
    once: true,
    onEnter() {
      gsap.to('#connector-line', {
        width: '100%',
        duration: 1.8,
        ease: 'power2.inOut'
      });
      document.querySelectorAll('.proc-step').forEach((step, i) => {
        setTimeout(() => step.classList.add('lit'), 420 * i);
      });
    }
  });
}

/* ============================================================
   11. SERVICE CARD 3D TILT
   ============================================================ */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, {
        rotateX: -py * 10,
        rotateY:  px * 10,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 900,
        z: 20
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0, z: 0,
        duration: 0.75,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });
}

/* ============================================================
   12. MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(el, { x: dx * 0.28, y: dy * 0.28, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ============================================================
   13. TESTIMONIAL SLIDER
   ============================================================ */
function initTestimonials() {
  const data = [
    {
      text: 'In nur 3 Wochen hatte ich ein komplettes 3D-Konzept für mein Wohnzimmer — ich hätte nie gedacht, dass das online so reibungslos funktioniert. Das Ergebnis hat alle Erwartungen übertroffen und ich spare mir teure Fehleinkäufe.',
      name: 'Sarah M.',
      role: 'Hamburg · Look & Feel Paket'
    },
    {
      text: 'Ich war skeptisch ob Online-Beratung wirklich funktioniert. Nach dem ersten Gespräch war ich überzeugt. Voula hat in 2 Wochen ein Farbkonzept entwickelt, das meinen Altbau komplett verwandelt hat — für einen Bruchteil dessen, was ich erwartet hatte.',
      name: 'Thomas K.',
      role: 'München · Beratung & Planung'
    },
    {
      text: 'Unsere Büroräume wirkten unprofessionell — das hat Kunden abgeschreckt. Nach Voulas 3D-Konzept haben wir investiert und seitdem hören wir bei jedem Besuch Komplimente. Der ROI war spürbar ab dem ersten Monat.',
      name: 'Anna L.',
      role: 'Berlin · 3D Konzept · Gewerbe'
    }
  ];

  let cur = 0;
  const tText = document.getElementById('t-text');
  const tName = document.getElementById('t-name');
  const tRole = document.getElementById('t-role');
  const dots  = document.querySelectorAll('.t-dot');

  function show(i) {
    const d = data[i];
    gsap.to([tText, tName, tRole], {
      y: -18, opacity: 0,
      duration: 0.38, ease: 'power2.in',
      onComplete() {
        tText.textContent = d.text;
        tName.textContent = d.name;
        tRole.textContent = d.role;
        gsap.fromTo(
          [tText, tName, tRole],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        );
      }
    });
    dots.forEach((dot, j) => dot.classList.toggle('active', j === i));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      cur = parseInt(dot.dataset.i, 10);
      show(cur);
    });
  });

  const autoInterval = setInterval(() => {
    cur = (cur + 1) % data.length;
    show(cur);
  }, 5500);

  /* Stop auto on manual interaction */
  dots.forEach(dot => {
    dot.addEventListener('click', () => clearInterval(autoInterval));
  });
}

/* ============================================================
   14. HERO TITLE SETUP (lines hidden before entry)
   ============================================================ */
function setupHeroLines() {
  document.querySelectorAll('.hero-li').forEach(el => {
    gsap.set(el, { y: '110%' });
  });
  gsap.set('.hero-tag', { opacity: 0, y: 18 });
  gsap.set('.hero-caption', { opacity: 0, y: 18 });
  gsap.set('.hero-ctas', { opacity: 0, y: 18 });
  gsap.set('#hero-img', { opacity: 0 });
  gsap.set('.hero-img-badge', { opacity: 0 });
  gsap.set('.hero-scroll', { opacity: 0 });
  gsap.set('.tag-line', { width: 0 });
}

/* ============================================================
   15. SECTION HEADING CHAR REVEAL (bonus micro-animation)
   ============================================================ */
function initHeadingReveal() {
  document.querySelectorAll('#process .process-head h2, #contact h2').forEach(h2 => {
    ScrollTrigger.create({
      trigger: h2,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.fromTo(h2,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
      }
    });
  });
}

/* ============================================================
   16. FOOTER REVEAL
   ============================================================ */
function initFooter() {
  gsap.from('.foot-grid > *', {
    y: 36, opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#footer', start: 'top 85%', once: true }
  });
}

/* ============================================================
   INIT — run everything
   ============================================================ */
function init() {
  setupHeroLines();
  initLenis();
  initCursor();
  initNav();
  initScrollAnimations();
  initParallax();
  initCounters();
  initProcessLine();
  initTiltCards();
  initMagnetic();
  initTestimonials();
  initHeadingReveal();
  initFooter();
}

/* ============================================================
   18. FAQ ACCORDION
   ============================================================ */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';
      const answer  = btn.nextElementSibling;

      /* Close all others */
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });

      /* Toggle current */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

/* ── Boot sequence ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  init();
  initPreloader();
  initFaq();
});

/* Fallback: if preloader callback never fires after 4.5s */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre && pre.style.display !== 'none') {
      pre.style.display = 'none';
      animateHeroEntry();
    }
  }, 4500);
});

/* ============================================================
   17. CONTACT FORM — Validation & Submit
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  /* Live validation: remove error state on input */
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#cf-name');
    const email   = form.querySelector('#cf-email');
    const subject = form.querySelector('#cf-subject');
    const message = form.querySelector('#cf-message');
    const privacy = form.querySelector('#cf-privacy');
    let valid = true;

    /* Validate each field */
    [name, email, message].forEach(f => {
      if (!f.value.trim()) { f.classList.add('error'); valid = false; }
    });
    if (subject.value === '') { subject.classList.add('error'); valid = false; }
    if (!privacy.checked)    { privacy.classList.add('error'); valid = false; }

    /* Simple e-mail format check */
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    /* Animate button → loading */
    const btn = form.querySelector('.btn-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Wird gesendet …</span>';
    btn.disabled = true;
    btn.style.opacity = '.7';

    /* Simulate async send (replace with real fetch/API if needed) */
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.opacity = '1';

      /* Success message */
      success.textContent = '✓ Vielen Dank! Ich melde mich innerhalb von 24 Stunden bei dir.';
      gsap.from(success, { y: 8, opacity: 0, duration: 0.5, ease: 'power2.out' });

      /* Reset form */
      form.reset();

      /* Clear success after 6 s */
      setTimeout(() => {
        gsap.to(success, {
          opacity: 0, y: -6, duration: 0.4,
          onComplete: () => { success.textContent = ''; gsap.set(success, { opacity: 1, y: 0 }); }
        });
      }, 6000);
    }, 1200);
  });
}

/* Add to init() */
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});
