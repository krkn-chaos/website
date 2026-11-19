/*
 * Krkn documentation search — custom Cmd+K overlay over Hugo's built-in Lunr index.
 *
 * Hugo/Docsy generates the search index inline at build time (offlineSearch: true),
 * so this works in `hugo server` dev exactly like the old search did. We reuse that
 * index + the Lunr engine Docsy already loads, but render our OWN results UI into
 * the overlay (#krkn-search-overlay in layouts/_partials/navbar.html):
 * live-as-you-type, matched terms highlighted, snippet centered on the match, and
 * full keyboard navigation.
 *
 * This is the SITE search. It is completely independent of the AI chatbot, which
 * uses static/search-index.json via api/services/DocumentationIndex.js. Nothing
 * here touches the chatbot.
 */
(function () {
  'use strict';

  var MAX_RESULTS = 8;
  var DEBOUNCE_MS = 120;
  var SNIPPET_RADIUS = 90; // chars of context on each side of the match

  var input = null;
  var resultsEl = null;

  var idx = null;          // built Lunr index
  var docMap = {};         // ref -> { title, body, excerpt }
  var baseHref = '/';
  var loadStarted = false;
  var loadFailed = false;
  var debounceTimer = null;
  var queryToken = 0;
  var activeIndex = -1;
  var rowCount = 0;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function init() {
    input = document.getElementById('krkn-search-input');
    resultsEl = document.getElementById('krkn-search-results');
    if (!input || !resultsEl) return;

    input.addEventListener('focus', loadIndex);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeydown);
  });

  // ---- Load + build the Lunr index ---------------------------------------

  function loadIndex() {
    if (loadStarted) return;
    loadStarted = true;

    var srcEl = document.querySelector('[data-offline-search-index-json-src]');
    var url = srcEl && srcEl.getAttribute('data-offline-search-index-json-src');
    if (srcEl && srcEl.getAttribute('data-offline-search-base-href')) {
      baseHref = srcEl.getAttribute('data-offline-search-base-href');
    }
    if (!url) { failLoad(); return; }

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) { buildIndex(data); })
      .catch(function () { failLoad(); });
  }

  function buildIndex(data) {
    if (typeof window.lunr === 'undefined' || !Array.isArray(data)) { failLoad(); return; }
    var lunr = window.lunr;
    idx = lunr(function () {
      var self = this;
      self.ref('ref');
      self.field('title', { boost: 5 });
      self.field('categories', { boost: 3 });
      self.field('tags', { boost: 3 });
      self.field('description', { boost: 2 });
      self.field('body');
      data.forEach(function (doc) {
        try { self.add(doc); } catch (e) { /* skip malformed entry */ }
        docMap[doc.ref] = { title: doc.title, body: doc.body || '', excerpt: doc.excerpt || '' };
      });
    });
    // If the user already typed before the index finished loading, search now.
    if (input.value.trim()) onInput();
  }

  function failLoad() {
    loadFailed = true;
    renderState('<div class="krkn-search-msg">Search is unavailable right now.</div>');
  }

  // ---- Input handling -----------------------------------------------------

  function onInput() {
    var query = input.value.trim();
    clearTimeout(debounceTimer);

    if (!query) { renderState(''); return; }
    if (loadFailed) { failLoad(); return; }
    if (!idx) {
      loadIndex();
      renderState('<div class="krkn-search-msg">Loading search…</div>');
      return;
    }
    debounceTimer = setTimeout(function () { runSearch(query); }, DEBOUNCE_MS);
  }

  function runSearch(query) {
    var token = ++queryToken;
    var lunr = window.lunr;
    var terms = tokenize(query);

    var matches;
    try {
      matches = idx.query(function (q) {
        terms.forEach(function (term) {
          q.term(term, { boost: 100 });
          q.term(term, { wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING, boost: 10 });
          q.term(term, { editDistance: 2 });
        });
      });
    } catch (e) {
      matches = [];
    }
    if (token !== queryToken) return;
    renderResults(query, terms, matches);
  }

  // ---- Keyboard navigation ------------------------------------------------

  function onKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      var rows = resultsEl.querySelectorAll('.krkn-search-result');
      var target = rows[activeIndex] || rows[0];
      if (target) {
        e.preventDefault();
        window.location.href = target.getAttribute('href');
      }
    }
  }

  function moveActive(delta) {
    if (rowCount === 0) return;
    activeIndex += delta;
    if (activeIndex < 0) activeIndex = rowCount - 1;
    if (activeIndex >= rowCount) activeIndex = 0;
    highlightActive();
  }

  function highlightActive() {
    var rows = resultsEl.querySelectorAll('.krkn-search-result');
    for (var i = 0; i < rows.length; i++) {
      var on = i === activeIndex;
      rows[i].classList.toggle('krkn-search-result--active', on);
      rows[i].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) rows[i].scrollIntoView({ block: 'nearest' });
    }
  }

  // ---- Rendering ----------------------------------------------------------

  function renderState(html) {
    activeIndex = -1;
    rowCount = 0;
    resultsEl.innerHTML = html;
    resultsEl.classList.toggle('krkn-search-overlay__results--filled', !!html);
  }

  function renderResults(query, terms, matches) {
    if (!matches || matches.length === 0) {
      renderState('<div class="krkn-search-msg">No results for “' + escapeHtml(query) + '”</div>');
      return;
    }

    var total = matches.length;
    var top = matches.slice(0, MAX_RESULTS);
    var html = '<div class="krkn-search-count">' + total + ' result' + (total === 1 ? '' : 's') + '</div>';

    top.forEach(function (m) {
      var doc = docMap[m.ref] || {};
      var title = doc.title || m.ref;
      var href = baseHref.replace(/\/$/, '') + '/' + String(m.ref).replace(/^\//, '');
      html +=
        '<a class="krkn-search-result" role="option" aria-selected="false" href="' + escapeAttr(href) + '">' +
          '<span class="krkn-search-result__title">' + escapeHtml(title) + '</span>' +
          '<span class="krkn-search-result__path">' + breadcrumb(m.ref) + '</span>' +
          '<span class="krkn-search-result__excerpt">' + snippet(doc.body || doc.excerpt || '', terms) + '</span>' +
        '</a>';
    });

    activeIndex = -1;
    rowCount = top.length;
    resultsEl.innerHTML = html;
    resultsEl.classList.add('krkn-search-overlay__results--filled');

    var rows = resultsEl.querySelectorAll('.krkn-search-result');
    for (var j = 0; j < rows.length; j++) {
      (function (i) {
        rows[i].addEventListener('mousemove', function () {
          if (activeIndex !== i) { activeIndex = i; highlightActive(); }
        });
      })(j);
    }
  }

  // ---- Snippet + highlight ------------------------------------------------

  // Build a context snippet from `body` centered on the first matched term,
  // with every query term wrapped in <mark>.
  function snippet(body, terms) {
    if (!body) return '';
    var lower = body.toLowerCase();

    var pos = -1;
    for (var i = 0; i < terms.length; i++) {
      var p = lower.indexOf(terms[i]);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    }
    if (pos === -1) pos = 0; // stemmed/fuzzy match with no literal hit → show the start

    var start = Math.max(0, pos - SNIPPET_RADIUS);
    var end = Math.min(body.length, pos + SNIPPET_RADIUS);
    var text = body.slice(start, end).trim();

    var out = highlightTerms(escapeHtml(text), terms);
    if (start > 0) out = '… ' + out;
    if (end < body.length) out = out + ' …';
    return out;
  }

  function highlightTerms(escapedText, terms) {
    // One pass over the (already HTML-escaped) text. Longest term first in the
    // alternation so "podscenario" wins over "pod"; a single pass means we never
    // re-match inside an inserted <mark> tag.
    var alts = terms
      .filter(function (t) { return t.length >= 2; })
      .sort(function (a, b) { return b.length - a.length; })
      .map(escapeRegex);
    if (alts.length === 0) return escapedText;
    var re = new RegExp('(' + alts.join('|') + ')', 'gi');
    return escapedText.replace(re, '<mark>$1</mark>');
  }

  // ---- Helpers ------------------------------------------------------------

  function tokenize(query) {
    return query
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(function (t) { return t.length > 0; });
  }

  // "/docs/scenarios/pod-scenarios/" -> "docs › scenarios › pod-scenarios"
  function breadcrumb(ref) {
    var parts = String(ref).split('#')[0].split('?')[0].split('/').filter(Boolean);
    if (parts.length === 0) return 'Home';
    return parts.map(function (p) {
      return escapeHtml(decodeURIComponent(p).replace(/[-_]/g, ' '));
    }).join(' <span class="krkn-search-result__sep">›</span> ');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
})();
