/**
 * scenario-filter.js — Scenario page category + search filtering
 * Filters scenario cards based on category pills and search input.
 */
(function () {
  'use strict';

  function init() {
    var filterRoot = document.getElementById('scenario-filter');
    if (!filterRoot) return;

    var categoryButtons = Array.prototype.slice.call(
      filterRoot.querySelectorAll('.scenario-filter__btn[data-filter]')
    );
    var searchInput = document.getElementById('scenario-filter-search');
    var resetBtn = document.getElementById('scenario-filter-reset');
    var emptyState = document.getElementById('scenario-filter-empty');
    var categorySections = Array.prototype.slice.call(
      document.querySelectorAll('.scenario-category')
    );

    if (categoryButtons.length === 0 || categorySections.length === 0) return;

    var activeCategory = 'all';
    var searchQuery = '';

    function normalize(text) {
      return (text || '').toLowerCase();
    }

    function cardMatchesSearch(card, query) {
      if (!query) return true;
      var text = normalize(card.textContent);
      return text.indexOf(query) !== -1;
    }

    function setActiveButton(nextCategory) {
      categoryButtons.forEach(function (btn) {
        var isActive = btn.getAttribute('data-filter') === nextCategory;
        btn.classList.toggle('scenario-filter__btn--active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function applyFilters() {
      var visibleCount = 0;

      categorySections.forEach(function (section) {
        var category = section.getAttribute('data-category');
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var cards = Array.prototype.slice.call(
          section.querySelectorAll('.scenario-card')
        );

        if (!matchesCategory) {
          section.classList.add('scenario-category--hidden');
          cards.forEach(function (card) {
            card.classList.add('scenario-card--hidden');
          });
          return;
        }

        var sectionVisible = false;
        cards.forEach(function (card) {
          var matchesSearch = cardMatchesSearch(card, searchQuery);
          card.classList.toggle('scenario-card--hidden', !matchesSearch);
          if (matchesSearch) {
            sectionVisible = true;
            visibleCount += 1;
          }
        });

        section.classList.toggle('scenario-category--hidden', !sectionVisible);
      });

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    }

    categoryButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCategory = btn.getAttribute('data-filter') || 'all';
        setActiveButton(activeCategory);
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = normalize(searchInput.value).trim();
        applyFilters();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        activeCategory = 'all';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        setActiveButton(activeCategory);
        applyFilters();
      });
    }

    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
