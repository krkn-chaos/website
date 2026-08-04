(function () {
  'use strict';

  var API_ENDPOINT = '/.netlify/functions/feedback';

  var REQUIRED_FIELDS = [
    { id: 'fb-name', label: 'Name' },
    { id: 'fb-email', label: 'Email' },
    { id: 'fb-user-type', label: 'User type' },
    { id: 'fb-usage-path', label: 'Usage path' },
    { id: 'fb-type', label: 'Feedback type' },
    { id: 'fb-summary', label: 'Short summary' },
    { id: 'fb-details', label: 'Details' },
  ];

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(fieldId, message) {
    var errorEl = document.getElementById(fieldId + '-error');
    var fieldEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    if (fieldEl && fieldEl.parentElement) {
      fieldEl.parentElement.classList.add('krkn-feedback__field--error');
    }
  }

  function clearError(fieldId) {
    var errorEl = document.getElementById(fieldId + '-error');
    var fieldEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    if (fieldEl && fieldEl.parentElement) {
      fieldEl.parentElement.classList.remove('krkn-feedback__field--error');
    }
  }

  function validateField(fieldId, label) {
    var el = document.getElementById(fieldId);
    if (!el) return true;

    var value = el.value.trim();

    if (!value) {
      showError(fieldId, label + ' is required');
      return false;
    }

    if (fieldId === 'fb-email' && !validateEmail(value)) {
      showError(fieldId, 'Please enter a valid email address');
      return false;
    }

    clearError(fieldId);
    return true;
  }

  function validateForm() {
    var valid = true;
    var firstInvalid = null;

    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
      var field = REQUIRED_FIELDS[i];
      if (!validateField(field.id, field.label)) {
        valid = false;
        if (!firstInvalid) firstInvalid = field.id;
      }
    }

    if (firstInvalid) {
      var el = document.getElementById(firstInvalid);
      if (el) el.focus();
    }

    return valid;
  }

  function collectFormData() {
    function val(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    var contactRadios = document.querySelectorAll('input[name="contact_ok"]');
    var contactOk = 'yes';
    for (var i = 0; i < contactRadios.length; i++) {
      if (contactRadios[i].checked) {
        contactOk = contactRadios[i].value;
        break;
      }
    }

    return {
      name: val('fb-name'),
      email: val('fb-email'),
      organization: val('fb-org'),
      github_username: val('fb-github'),
      user_type: val('fb-user-type'),
      usage_path: val('fb-usage-path'),
      feedback_type: val('fb-type'),
      summary: val('fb-summary'),
      details: val('fb-details'),
      k8s_version: val('fb-k8s-version'),
      acm_ocm_version: val('fb-acm-version'),
      operator_version: val('fb-operator-version'),
      use_case: val('fb-use-case'),
      impact: val('fb-impact'),
      contact_ok: contactOk,
      website_url: val('krkn-website-url'),
    };
  }

  function hideBanner() {
    var banner = document.getElementById('krkn-feedback-banner');
    if (banner) banner.style.display = 'none';
  }

  function showBanner(message) {
    var banner = document.getElementById('krkn-feedback-banner');
    if (banner) {
      banner.textContent = message;
      banner.style.display = 'block';
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function submitForm(e) {
    e.preventDefault();
    hideBanner();

    if (!validateForm()) return;

    var submitBtn = document.getElementById('krkn-feedback-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectFormData()),
    })
      .then(function (response) {
        var contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          if (!response.ok) throw new Error('Submission failed');
          return {};
        }
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || 'Submission failed');
          }
          return data;
        });
      })
      .then(function () {
        document.getElementById('krkn-feedback-form').style.display = 'none';
        var success = document.getElementById('krkn-feedback-success');
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (error) {
        showBanner(error.message || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
      });
  }

  function init() {
    var form = document.getElementById('krkn-feedback-form');
    if (!form) return;

    form.addEventListener('submit', submitForm);

    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
      (function (field) {
        var el = document.getElementById(field.id);
        if (el) {
          el.addEventListener('blur', function () {
            if (el.value.trim()) {
              validateField(field.id, field.label);
            }
          });
          el.addEventListener('input', function () {
            if (
              el.parentElement &&
              el.parentElement.classList.contains('krkn-feedback__field--error')
            ) {
              validateField(field.id, field.label);
            }
          });
        }
      })(REQUIRED_FIELDS[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
