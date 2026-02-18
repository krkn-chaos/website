/**
 * Krkn Scroll Animations
 * Uses Intersection Observer to reveal elements with .reveal class
 * Respects prefers-reduced-motion
 */
(function() {
  'use strict';

  // Bail if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make all reveal elements visible immediately
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('reveal--visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function() {
          entry.target.classList.add('reveal--visible');
        }, delay);
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all elements with .reveal class
  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });
})();
