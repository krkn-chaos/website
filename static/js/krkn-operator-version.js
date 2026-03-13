(function() {
  async function fetchLatestVersion() {
    try {
      const response = await fetch('/.netlify/functions/krkn-operator-version');
      const data = await response.json();

      if (data.version) {
        // Update the version display
        const versionElement = document.getElementById('krkn-operator-version');
        if (versionElement) {
          versionElement.textContent = data.version;
        }

        // Replace <VERSION> placeholder in all code blocks
        document.querySelectorAll('pre code, code').forEach(function(el) {
          if (el.textContent.includes('<VERSION>')) {
            el.textContent = el.textContent.replace(/<VERSION>/g, data.version);
          }
        });
      }
    } catch (error) {
      const versionElement = document.getElementById('krkn-operator-version');
      if (versionElement) {
        versionElement.innerHTML =
          '<a href="https://github.com/krkn-chaos/krkn-operator/releases/latest" target="_blank" rel="noopener">check latest</a>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLatestVersion);
  } else {
    fetchLatestVersion();
  }
})();
