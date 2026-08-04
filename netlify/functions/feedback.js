const axios = require('axios');

const rateLimits = new Map();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_ENTRIES = 1000;

function pruneRateLimits() {
  if (rateLimits.size <= RATE_LIMIT_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [ip, entry] of rateLimits) {
    if (now - entry.firstRequestTime > RATE_WINDOW_MS) rateLimits.delete(ip);
  }
}

function checkRateLimit(ip) {
  pruneRateLimits();
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.firstRequestTime > RATE_WINDOW_MS) {
    rateLimits.set(ip, { count: 1, firstRequestTime: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const FEEDBACK_TYPE_LABELS = {
  'feature-request': 'Feature request',
  'bug': 'Bug',
  'install-issue': 'Install issue',
  'doc-feedback': 'Documentation feedback',
  'demo-request': 'Demo request',
  'office-hours': 'Office hours request',
  'adoption-feedback': 'Adoption feedback',
  'other': 'Other',
};

const TYPE_JIRA_LABELS = {
  'feature-request': 'feature-request',
  'bug': 'bug',
  'install-issue': 'install-issue',
  'doc-feedback': 'documentation',
  'demo-request': 'demo-request',
  'office-hours': 'office-hours',
  'adoption-feedback': 'adoption',
};

const REQUIRED_FIELDS = [
  'name',
  'email',
  'user_type',
  'usage_path',
  'feedback_type',
  'summary',
  'details',
];

const VALID_FEEDBACK_TYPES = Object.keys(FEEDBACK_TYPE_LABELS);

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, 5000);
}

function buildJiraDescription(body) {
  const lines = [
    'h3. Submitter Information',
    `*Name:* ${sanitize(body.name)}`,
    `*Email:* ${sanitize(body.email)}`,
  ];

  if (body.organization) lines.push(`*Organization:* ${sanitize(body.organization)}`);
  if (body.github_username) lines.push(`*GitHub:* ${sanitize(body.github_username)}`);

  lines.push(`*User Type:* ${sanitize(body.user_type)}`);
  lines.push(`*Usage Path:* ${sanitize(body.usage_path)}`);
  lines.push('');
  lines.push('h3. Feedback');
  lines.push(
    `*Type:* ${FEEDBACK_TYPE_LABELS[body.feedback_type] || sanitize(body.feedback_type)}`
  );
  lines.push(`*Summary:* ${sanitize(body.summary)}`);
  lines.push('');
  lines.push('*Details:*');
  lines.push(sanitize(body.details));
  lines.push('');

  if (body.k8s_version)
    lines.push(`*Kubernetes/OpenShift Version:* ${sanitize(body.k8s_version)}`);
  if (body.acm_ocm_version)
    lines.push(`*ACM/OCM Version:* ${sanitize(body.acm_ocm_version)}`);
  if (body.operator_version)
    lines.push(`*Krkn Operator Version:* ${sanitize(body.operator_version)}`);
  if (body.use_case) lines.push(`*Use Case:* ${sanitize(body.use_case)}`);
  if (body.impact) lines.push(`*Impact/Priority:* ${sanitize(body.impact)}`);

  lines.push('');
  lines.push(`*Contact OK:* ${body.contact_ok === 'no' ? 'No' : 'Yes'}`);

  return lines.join('\n');
}

function buildLabels(body) {
  const labels = ['krkn-operator', 'developer-preview', 'community-feedback'];

  if (body.usage_path === 'acm-dev-preview') labels.push('acm');
  if (body.usage_path === 'ocm-community') labels.push('ocm');

  const typeLabel = TYPE_JIRA_LABELS[body.feedback_type];
  if (typeLabel) labels.push(typeLabel);

  return labels;
}

function getIssueType(feedbackType) {
  if (feedbackType === 'bug') return 'Bug';
  if (feedbackType === 'feature-request') return 'Story';
  return 'Task';
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  try {
    if (body.website_url) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    const clientIp =
      (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      event.headers['client-ip'] ||
      'unknown';

    if (!checkRateLimit(clientIp)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many submissions. Please try again later.',
        }),
      };
    }

    for (const field of REQUIRED_FIELDS) {
      const val = body[field];
      if (!val || typeof val !== 'string' || !val.trim()) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `${field} is required` }),
        };
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    if (!VALID_FEEDBACK_TYPES.includes(body.feedback_type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid feedback type' }),
      };
    }

    const { JIRA_BASE_URL, JIRA_PROJECT_KEY, JIRA_API_TOKEN, JIRA_USER_EMAIL } =
      process.env;

    if (!JIRA_BASE_URL || !JIRA_PROJECT_KEY || !JIRA_API_TOKEN) {
      console.error('Missing Jira configuration environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const feedbackLabel =
      FEEDBACK_TYPE_LABELS[body.feedback_type] || body.feedback_type;
    const jiraSummary = `[Krkn Operator Feedback] ${feedbackLabel} - ${sanitize(body.summary).substring(0, 150)}`;

    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: jiraSummary,
        description: buildJiraDescription(body),
        issuetype: { name: getIssueType(body.feedback_type) },
        labels: buildLabels(body),
      },
    };

    const authHeader = JIRA_USER_EMAIL
      ? `Basic ${Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`
      : `Bearer ${JIRA_API_TOKEN}`;

    const jiraResponse = await axios.post(
      `${JIRA_BASE_URL}/rest/api/2/issue`,
      jiraPayload,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully',
        ticketKey: jiraResponse.data.key,
      }),
    };
  } catch (error) {
    console.error('Feedback function error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to submit feedback. Please try again later.',
      }),
    };
  }
};
