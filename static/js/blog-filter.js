/**
 * blog-filter.js — Krkn Blog page client-side filter
 *
 * Reads data-category and data-type attributes from .krkn-blog__card elements
 * and shows/hides them when the user clicks a filter button.
 *
 * No external dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  function init() {
    const filterBar = document.getElementById('blog-filter-bar');
    if (!filterBar) return;

    const allCards = Array.from(document.querySelectorAll('.krkn-blog__card'));
    const sections = Array.from(document.querySelectorAll('.krkn-blog__section[data-section]'));
    const emptyState = document.getElementById('blog-filter-empty');
    const resetBtn  = document.getElementById('krkn-filter-reset');

    let activeCategory = 'all';
    let activeType = 'all';

    // ─ Helper: normalise a badge text to a canonical token 
    function toToken(str) {
      return (str || '').trim().toLowerCase().replace(/\s+/g, '-');
    }

    // ─ Update visible cards based on current filters
    function applyFilter() {
      let visibleCount = 0;

      // Show / hide individual cards
      allCards.forEach(function (card) {
        const cardCategory = toToken(card.dataset.category || '');
        const cardType = toToken(card.dataset.type || '');

        const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;
        const typeMatch = activeType === 'all' || cardType === activeType;

        const visible = categoryMatch && typeMatch;
        card.classList.toggle('krkn-blog__card--hidden', !visible);
        if (visible) visibleCount++;
      });

      // Show / hide section headings: hide a section if ALL its cards are hidden
      sections.forEach(function (section) {
        const sectionCards = Array.from(section.querySelectorAll('.krkn-blog__card'));
        const anyVisible = sectionCards.some(function (c) {
          return !c.classList.contains('krkn-blog__card--hidden');
        });
        section.classList.toggle('krkn-blog__section--hidden', !anyVisible);
      });

      // Empty state
      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    }

    // Button click handler
    filterBar.addEventListener('click', function (e) {
      const btn = e.target.closest('.krkn-filter__btn');
      if (!btn) return;

      const filterValue = btn.dataset.filter;
      const filterGroup = btn.dataset.group; // 'category' | 'type'

      if (filterGroup === 'category') {
        activeCategory = filterValue;
        // Update active state within this group
        filterBar.querySelectorAll('.krkn-filter__btn[data-group="category"]').forEach(function (b) {
          b.classList.toggle('krkn-filter__btn--active', b.dataset.filter === filterValue);
          b.setAttribute('aria-pressed', b.dataset.filter === filterValue ? 'true' : 'false');
        });
      } else if (filterGroup === 'type') {
        activeType = filterValue;
        filterBar.querySelectorAll('.krkn-filter__btn[data-group="type"]').forEach(function (b) {
          b.classList.toggle('krkn-filter__btn--active', b.dataset.filter === filterValue);
          b.setAttribute('aria-pressed', b.dataset.filter === filterValue ? 'true' : 'false');
        });
      }

      applyFilter();

      // Smooth scroll back to filter bar if user is far down the page
      if (window.scrollY > filterBar.getBoundingClientRect().top + window.scrollY + 100) {
        filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Reset button — scoped to filterBar, no inline onclick
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        activeCategory = 'all';
        activeType     = 'all';

        filterBar.querySelectorAll('.krkn-filter__btn[data-group="category"]').forEach(function (b) {
          const isAll = b.dataset.filter === 'all';
          b.classList.toggle('krkn-filter__btn--active', isAll);
          b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        filterBar.querySelectorAll('.krkn-filter__btn[data-group="type"]').forEach(function (b) {
          const isAll = b.dataset.filter === 'all';
          b.classList.toggle('krkn-filter__btn--active', isAll);
          b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });

        applyFilter();
      });
    }

    // Keyboard accessibility: Space / Enter on buttons
    filterBar.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        const btn = e.target.closest('.krkn-filter__btn');
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });

    // Initial render (all visible)
    applyFilter();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
