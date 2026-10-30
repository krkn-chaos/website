// Override Docsy v0.12.0: preserve indentation when copying Python and YAML.
// Upstream: https://github.com/google/docsy/blob/v0.12.0/assets/js/click-to-copy.js
let codeListings = document.querySelectorAll('.highlight > pre');

for (let index = 0; index < codeListings.length; index++) {
  const codeSample = codeListings[index].querySelector('code');
  const copyButton = document.createElement('button');
  const buttonAttributes = {
    type: 'button',
    title: 'Copy to clipboard',
    'data-bs-toggle': 'tooltip',
    'data-bs-placement': 'top',
    'data-bs-container': 'body',
  };

  Object.keys(buttonAttributes).forEach((key) => {
    copyButton.setAttribute(key, buttonAttributes[key]);
  });

  copyButton.classList.add(
    'fas',
    'fa-copy',
    'btn',
    'btn-sm',
    'td-click-to-copy'
  );
  const tooltip = new bootstrap.Tooltip(copyButton);

  copyButton.onclick = () => {
    copyCode(codeSample);
    copyButton.setAttribute('data-bs-original-title', 'Copied!');
    tooltip.show();
  };

  copyButton.onmouseout = () => {
    copyButton.setAttribute('data-bs-original-title', 'Copy to clipboard');
    tooltip.hide();
  };

  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('click-to-copy');
  buttonDiv.append(copyButton);
  codeListings[index].insertBefore(buttonDiv, codeSample);
}

const copyCode = (codeSample) => {
  navigator.clipboard.writeText(codeSample.textContent);
};
