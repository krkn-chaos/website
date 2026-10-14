(function() {
  var RELEASES_URL = 'https://github.com/krkn-chaos/krkn-operator/releases';
  var STABLE_VERSION = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

  function versionBlocks() {
    return Array.from(document.querySelectorAll('pre')).filter(function(block) {
      return block.textContent.includes('<VERSION>');
    });
  }

  function showReleaseFallback(versionElement) {
    if (versionElement) {
      versionElement.innerHTML = '<a href="' + RELEASES_URL + '" target="_blank" rel="noopener">choose a stable release</a>';
    }
    versionBlocks().forEach(function(block) { block.hidden = true; });
  }

  async function fetchLatestVersion() {
    var versionElement = document.getElementById('krkn-operator-version');
    try {
      var response = await fetch('/.netlify/functions/krkn-operator-version');
      if (!response.ok) throw new Error('Version lookup failed');
      var data = await response.json();
      if (!data || typeof data.version !== 'string' || !STABLE_VERSION.test(data.version)) {
        throw new Error('Version lookup returned no stable release');
      }

      if (versionElement) versionElement.textContent = data.version;
      var helmVersion = data.version.slice(1);
      document.querySelectorAll('pre code, code').forEach(function(element) {
        if (element.textContent.includes('<VERSION>')) {
          element.textContent = element.textContent.replace(/<VERSION>/g, helmVersion);
        }
      });
      versionBlocks().forEach(function(block) { block.hidden = false; });
    } catch (error) {
      showReleaseFallback(versionElement);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLatestVersion);
  } else {
    fetchLatestVersion();
  }
})();
