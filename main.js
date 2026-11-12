/**
 * TURNOUT / Landing Page Vanilla JS
 * - Interactive Mobile Sheet Menu
 * - Staggered easeOutCubic Count-Up Stats with IntersectionObserver
 * - Keyboard Accessibility
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Mobile Menu Navigation
  // -------------------------------------------------------------------------
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-sign-in');

  function openMenu() {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.removeAttribute('hidden');
    mobileOverlay.removeAttribute('hidden');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!burgerBtn || !mobileMenu || !mobileOverlay) return;
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('hidden', '');
    mobileOverlay.setAttribute('hidden', '');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const isExpanded = burgerBtn?.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', toggleMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close on window resize beyond 720px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      closeMenu();
    }
  });

  // -------------------------------------------------------------------------
  // 2. Animated Stats Count-Up
  // -------------------------------------------------------------------------
  const statElements = document.querySelectorAll('.stat-val');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cubic easing function: easeOutCubic
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(el, index) {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const duration = 1500 + index * 80; // duration: 1500 + i*80ms
    const startDelay = 480 + index * 90; // offset: 480 + i*90ms

    setTimeout(() => {
      let startTime = null;

      function updateCounter(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * target;

        el.textContent = currentValue.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    }, startDelay);
  }

  let statsAnimated = false;
  const statsFooter = document.querySelector('.stats-footer');

  if (statsFooter && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statElements.forEach((el, i) => animateStat(el, i));
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(statsFooter);
  } else {
    // Fallback if IntersectionObserver is not supported
    statElements.forEach((el, i) => animateStat(el, i));
  }
})();

