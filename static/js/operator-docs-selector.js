(function () {
  'use strict';

  function initOperatorDocsSelector() {
    var select = document.querySelector('[data-operator-docs-version]');
    var go = document.querySelector('[data-operator-docs-version-go]');
    if (!select || !go) return;

    go.addEventListener('click', function () {
      var destination = select.value;
      if (destination) window.location.assign(destination);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOperatorDocsSelector);
  } else {
    initOperatorDocsSelector();
  }
})();
