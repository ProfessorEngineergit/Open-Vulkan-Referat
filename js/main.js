/**
 * main.js
 * Application logic:
 *  - Sticky navbar scroll effect
 *  - Mobile menu toggle
 *  - Intersection Observer → fade-in animations
 *  - Count-up number animations
 *  - Active nav-link tracking
 */

(function () {
  'use strict';

  /* ── Navbar scroll shadow ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 2px 32px rgba(0,0,0,0.7)';
    } else {
      navbar.style.boxShadow = '';
    }
  }, { passive: true });

  /* ── Mobile menu toggle ─────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    /* Close on link click */
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ── Intersection Observer – fade-in ────────────────────── */
  const fadeEls = document.querySelectorAll(
    '.metric-card, .chart-card, .finding-card, .case-study-banner, ' +
    '.source-group, .vis-card, .subsection-header, .info-panel, ' +
    '.volcano-3d-wrap, .section-header'
  );

  fadeEls.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), idx * 40);
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ── Count-up animation ─────────────────────────────────── */
  function animateCount(el) {
    const target   = parseFloat(el.dataset.target);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out quad */
      const eased    = 1 - (1 - progress) * (1 - progress);
      const current  = Math.round(eased * target);
      el.textContent = current.toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const countEls = document.querySelectorAll('.count-up, .hero-stat-num');
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  countEls.forEach(el => countObserver.observe(el));

  /* ── Active nav-link tracking ───────────────────────────── */
  const sections  = document.querySelectorAll('section[id], div[id]');
  const allLinks  = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          allLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => navObserver.observe(s));

  /* ── Slider label for glacier canvas is wired in three-scenes.js ── */

})();
