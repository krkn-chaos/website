---
title: Feedback
description: Share feedback on the Krkn Operator Developer Preview
weight: 5
custom_js: ["/js/feedback-form.js"]
---

## Share Feedback on Krkn Operator

We are collecting feedback from users trying Krkn Operator through OCM/ACM, upstream Krkn Operator, or community environments.

Use this form to share adoption stories, use cases, feature requests, bugs, install issues, documentation feedback, adoption blockers, or interest in demos and office hours.

For bugs, feature requests, install issues, and documentation gaps, the recommended path is to use the [Krkn Operator GitHub repository](https://github.com/krkn-chaos/krkn-operator/issues). If GitHub is not preferred due to security or sharing concerns, you can submit feedback through this form instead.

{{% notice warning %}}
**Privacy:** Please avoid sharing confidential information, production data, credentials, or sensitive logs in this form. Submissions are converted into tracked tickets for the project team.
{{% /notice %}}

<noscript>
<div class="krkn-feedback__noscript">
<p><strong>JavaScript is required to submit this form.</strong> Please enable JavaScript in your browser, or <a href="https://github.com/krkn-chaos/krkn-operator/issues" target="_blank" rel="noopener">open an issue on GitHub</a> instead.</p>
</div>
</noscript>

<div class="krkn-feedback" id="krkn-feedback">
<form id="krkn-feedback-form" class="krkn-feedback__form" novalidate>
<div class="krkn-feedback__honeypot" aria-hidden="true" tabindex="-1">
<label for="krkn-website-url">Website</label>
<input type="text" id="krkn-website-url" name="website_url" autocomplete="off" tabindex="-1">
</div>
<fieldset class="krkn-feedback__section">
<legend class="krkn-feedback__legend">About You</legend>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-name" class="krkn-feedback__label">Name <span class="krkn-feedback__required">*</span></label>
<input type="text" id="fb-name" name="name" class="form-control" required>
<div class="krkn-feedback__error" id="fb-name-error"></div>
</div>
<div class="krkn-feedback__field">
<label for="fb-email" class="krkn-feedback__label">Email <span class="krkn-feedback__required">*</span></label>
<input type="email" id="fb-email" name="email" class="form-control" required>
<div class="krkn-feedback__error" id="fb-email-error"></div>
</div>
</div>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-org" class="krkn-feedback__label">Organization</label>
<input type="text" id="fb-org" name="organization" class="form-control">
</div>
<div class="krkn-feedback__field">
<label for="fb-github" class="krkn-feedback__label">GitHub Username</label>
<input type="text" id="fb-github" name="github_username" class="form-control" placeholder="e.g. octocat">
</div>
</div>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-user-type" class="krkn-feedback__label">User Type <span class="krkn-feedback__required">*</span></label>
<select id="fb-user-type" name="user_type" class="form-select" required>
<option value="">Select...</option>
<option value="community">Community user</option>
<option value="customer">Red Hat customer</option>
<option value="partner">Partner</option>
<option value="contributor">Contributor</option>
<option value="internal">Red Hat internal</option>
<option value="other">Other</option>
</select>
<div class="krkn-feedback__error" id="fb-user-type-error"></div>
</div>
<div class="krkn-feedback__field">
<label for="fb-usage-path" class="krkn-feedback__label">Usage Path <span class="krkn-feedback__required">*</span></label>
<select id="fb-usage-path" name="usage_path" class="form-select" required>
<option value="">Select...</option>
<option value="acm-dev-preview">ACM Developer Preview</option>
<option value="ocm-community">OCM / community-facing</option>
<option value="upstream-operator">Upstream Krkn Operator</option>
<option value="exploring">Just exploring</option>
<option value="other">Other</option>
</select>
<div class="krkn-feedback__error" id="fb-usage-path-error"></div>
</div>
</div>
</fieldset>
<fieldset class="krkn-feedback__section">
<legend class="krkn-feedback__legend">Your Feedback</legend>
<div class="krkn-feedback__field">
<label for="fb-type" class="krkn-feedback__label">Feedback Type <span class="krkn-feedback__required">*</span></label>
<select id="fb-type" name="feedback_type" class="form-select" required>
<option value="">Select...</option>
<option value="feature-request">Feature request</option>
<option value="bug">Bug</option>
<option value="install-issue">Install issue</option>
<option value="doc-feedback">Documentation feedback</option>
<option value="demo-request">Demo request</option>
<option value="office-hours">Office hours request</option>
<option value="adoption-feedback">Adoption feedback</option>
<option value="other">Other</option>
</select>
<div class="krkn-feedback__error" id="fb-type-error"></div>
</div>
<div class="krkn-feedback__field">
<label for="fb-summary" class="krkn-feedback__label">Short Summary <span class="krkn-feedback__required">*</span></label>
<input type="text" id="fb-summary" name="summary" class="form-control" required maxlength="200">
<div class="krkn-feedback__error" id="fb-summary-error"></div>
</div>
<div class="krkn-feedback__field">
<label for="fb-details" class="krkn-feedback__label">Details / Description <span class="krkn-feedback__required">*</span></label>
<textarea id="fb-details" name="details" class="form-control" rows="5" required></textarea>
<div class="krkn-feedback__error" id="fb-details-error"></div>
</div>
</fieldset>
<fieldset class="krkn-feedback__section">
<legend class="krkn-feedback__legend">Environment <span class="krkn-feedback__optional">(optional)</span></legend>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-k8s-version" class="krkn-feedback__label">Kubernetes / OpenShift Version</label>
<input type="text" id="fb-k8s-version" name="k8s_version" class="form-control" placeholder="e.g. 4.16, 1.30">
</div>
<div class="krkn-feedback__field">
<label for="fb-acm-version" class="krkn-feedback__label">ACM / OCM Version</label>
<input type="text" id="fb-acm-version" name="acm_ocm_version" class="form-control" placeholder="e.g. 2.12">
</div>
</div>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-operator-version" class="krkn-feedback__label">Krkn Operator Version</label>
<input type="text" id="fb-operator-version" name="operator_version" class="form-control" placeholder="e.g. v1.0.0-beta">
</div>
<div class="krkn-feedback__field">
<label for="fb-use-case" class="krkn-feedback__label">Use Case</label>
<select id="fb-use-case" name="use_case" class="form-select">
<option value="">Select...</option>
<option value="openshift-virt">OpenShift Virtualization</option>
<option value="acm">ACM</option>
<option value="ocm">OCM</option>
<option value="general-k8s">General Kubernetes</option>
<option value="resilience-testing">Resilience testing</option>
<option value="other">Other</option>
</select>
</div>
</div>
<div class="krkn-feedback__row">
<div class="krkn-feedback__field">
<label for="fb-impact" class="krkn-feedback__label">Impact / Priority</label>
<select id="fb-impact" name="impact" class="form-select">
<option value="">Select...</option>
<option value="blocking">Blocking</option>
<option value="high">High</option>
<option value="medium">Medium</option>
<option value="low">Low</option>
</select>
</div>
<div></div>
</div>
</fieldset>
<fieldset class="krkn-feedback__section">
<legend class="krkn-feedback__legend">Follow-up</legend>
<div class="krkn-feedback__field">
<span class="krkn-feedback__label">Can we contact you for follow-up?</span>
<div class="krkn-feedback__radio-group">
<label class="krkn-feedback__radio"><input type="radio" name="contact_ok" value="yes" checked> Yes</label>
<label class="krkn-feedback__radio"><input type="radio" name="contact_ok" value="no"> No</label>
</div>
</div>
</fieldset>
<div class="krkn-feedback__actions">
<button type="submit" class="krkn-feedback__submit" id="krkn-feedback-submit">Submit Feedback</button>
</div>
</form>
<div class="krkn-feedback__success" id="krkn-feedback-success" style="display:none;">
<svg class="krkn-feedback__success-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
<polyline points="22 4 12 14.01 9 11.01"/>
</svg>
<h3>Thank You</h3>
<p>Thank you for sharing feedback on Krkn Operator. Your submission has been received and will be reviewed by the project team.</p>
<p style="margin-top: 1rem;"><a href="/docs/krkn-operator/">Back to Krkn Operator docs</a></p>
</div>
<div class="krkn-feedback__banner krkn-feedback__banner--error" id="krkn-feedback-banner" style="display:none;"></div>
</div>
