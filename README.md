# Automated Cross-Repo What's New Generator

The **Automated Cross-Repo What's New Generator** is an OSS automation tool designed for the `krkn-chaos` ecosystem. It automates the collection, summarization, and publication of monthly "What's New" blog posts across multiple repositories.

## 🚀 Overview

This project uses GitHub Actions, Python, and LLMs (Google Gemini) to:
1.  **Aggregate**: Fetch merged PRs from 6 core `krkn-chaos` repositories.
2.  **Filter**: Automatically remove noise like dependency bumps, typos, and internal chores.
3.  **Summarize**: Use an LLM to categorize updates into Features, Improvements, and Bug Fixes.
4.  **Publish**: Open draft PRs on the `krkn-chaos/website` repository with Hugo-compatible markdown.
5.  **Refine**: Allow maintainers to refine the content via PR comments starting with `@krkn-bot`.

## 📁 Repository Structure

```text
.
├── .github/workflows/
│   ├── generate-digest.yml   # Monthly cron job
│   ├── bot-reply.yml         # Handles @krkn-bot comments
│   └── tests.yml             # Runs unit tests
├── content/en/blog/whats-new/# Destination for generated posts
├── scripts/
│   ├── fetch_prs.py          # GitHub Search API client
│   ├── generate_digest.py    # LLM summarizer & MD generator
│   ├── create_blog_post.py   # Git & PR automation
│   └── handle_comment.py     # PR comment interaction logic
├── tests/                    # Comprehensive unit tests
├── .env.example              # Environment variable template
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.10+
- A GitHub Personal Access Token (PAT) with `repo` and `workflow` scopes.
- A Google Gemini API Key.

### 2. Local Installation
```bash
# Clone the repository
git clone https://github.com/krkn-chaos/website.git
cd website

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your tokens
```

### 3. Running Locally
You can run the pipeline manually:
```bash
# 1. Fetch PRs
python scripts/fetch_prs.py

# 2. Generate the digest (requires Gemini API Key)
python scripts/generate_digest.py

# 3. Create the PR (requires GitHub Token)
python scripts/create_blog_post.py
```

## 🤖 Workflow Explanation

### Monthly Digest (`generate-digest.yml`)
Triggers automatically on the 1st of every month. It executes the full pipeline from fetching to PR creation.

### Interactive Refinement (`bot-reply.yml`)
When a PR is opened, you can instruct the bot to change the content.
**Example comment:**
> @krkn-bot make the "New Features" section more detailed and emphasize the multi-cluster support.

The bot will regenerate the markdown and update the PR automatically.

## 🧪 Testing
We use `unittest` with extensive mocking to ensure reliability without making real API calls.
```bash
python -m unittest discover tests
```

## 📄 Example Output
Generated files include Hugo frontmatter:
```yaml
---
title: "What's New in krkn-chaos — May 2026"
date: 2026-05-01
draft: false
description: "Monthly digest of updates across krkn-chaos repos"
tags: ["release-notes", "whats-new"]
categories: ["Articles"]
type: "blog"
---
```

## 🤝 Contributing
Please follow the standard `krkn-chaos` contribution guidelines. Ensure all new features are accompanied by unit tests.
