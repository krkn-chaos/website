"""Doc Sync Bot: creates website PRs from upstream krkn-chaos doc-impacting changes."""
import argparse
import base64
import glob
import os
import subprocess
import sys
from pathlib import Path

import anthropic
import requests

WEBSITE_REPO = "krkn-chaos/website"
DOCS_BASE = "content/en/docs/krkn_ai/config"
MARKER_TPL = "<!-- doc-sync-bot: upstream-pr={repo}#{number} -->"
ALLOWED_PREFIX = "content/en/docs/"

UPSTREAM_REPOS = {
    "krkn-chaos/krkn-ai": {
        "krkn_ai/models/config.py": [
            f"{DOCS_BASE}/scenarios.md",
            f"{DOCS_BASE}/fitness_function.md",
            f"{DOCS_BASE}/evolutionary_algorithm.md",
            f"{DOCS_BASE}/stopping_criteria.md",
            f"{DOCS_BASE}/elastic_search.md",
            f"{DOCS_BASE}/health_check.md",
            f"{DOCS_BASE}/output.md",
        ],
        "krkn_ai/cli/": [f"{DOCS_BASE}/scenarios.md"],
        "krkn_ai/scenarios/": [f"{DOCS_BASE}/scenarios.md"],
        "README.md": ["content/en/docs/krkn_ai/_index.md"],
        "docs/": [f"{DOCS_BASE}/"],
    },
    # TODO Phase 2: add krkn, krkn-hub, krknctl mappings
}


def gh_api(endpoint, token, method="GET", json_data=None):
    """GitHub API helper."""
    r = requests.request(
        method,
        f"https://api.github.com{endpoint}",
        headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
        json=json_data,
        timeout=30,
    )
    r.raise_for_status()
    return r.json() if r.content else None


def gh_paginated(endpoint, token, per_page=100):
    """Paginated GitHub API helper."""
    items, page = [], 1
    while True:
        sep = "&" if "?" in endpoint else "?"
        data = gh_api(f"{endpoint}{sep}per_page={per_page}&page={page}", token)
        if not data:
            break
        items.extend(data)
        if len(data) < per_page:
            break
        page += 1
    return items


def safe_path(path):
    """Validate path is within allowed doc directories."""
    n = os.path.normpath(path)
    return ".." not in n and not n.startswith("/") and n.startswith(ALLOWED_PREFIX)


def expand_targets(targets):
    """Expand directory targets (ending with /) to actual .md files."""
    workspace = os.environ.get("GITHUB_WORKSPACE", ".")
    out = []
    for t in targets:
        if t.endswith("/"):
            out.extend(
                os.path.relpath(f, workspace)
                for f in glob.glob(os.path.join(workspace, t, "*.md"))
            )
        else:
            out.append(t)
    return out


def get_impacting_files(repo, pr_number, mapping, token):
    """Return PR files that match doc-impacting paths."""
    files = gh_paginated(f"/repos/{repo}/pulls/{pr_number}/files", token)
    prefixes = list(mapping.keys())
    return [f for f in files if any(f["filename"].startswith(p) for p in prefixes)]


def pr_already_synced(repo, pr_number, token):
    """Idempotency check via GitHub Search API."""
    marker = MARKER_TPL.format(repo=repo, number=pr_number)
    q = f"repo:{WEBSITE_REPO} is:pr \"{marker}\" in:body"
    data = gh_api(f"/search/issues?q={requests.utils.quote(q)}", token)
    return data.get("total_count", 0) > 0


def find_recent_merged(repo, mapping, token):
    """Find recently merged PRs touching doc-impacting files."""
    prs = gh_api(f"/repos/{repo}/pulls?state=closed&sort=updated&per_page=10", token)
    return [
        p["number"]
        for p in prs
        if p.get("merged_at") and get_impacting_files(repo, p["number"], mapping, token)
    ][:5]


def get_website_doc(path, token):
    """Fetch a doc file from the website repo main branch."""
    try:
        data = gh_api(f"/repos/{WEBSITE_REPO}/contents/{path}?ref=main", token)
        return base64.b64decode(data["content"]).decode()
    except requests.HTTPError:
        return None


def affected_docs(changed_files, mapping):
    """Map changed upstream files to website doc paths."""
    docs = set()
    for f in changed_files:
        for prefix, targets in mapping.items():
            if f["filename"].startswith(prefix):
                docs.update(expand_targets(targets))
    return [d for d in docs if safe_path(d)]


def generate_update(diff_patch, current_doc, doc_path, client):
    """Use Claude to generate an updated doc from the diff."""
    prompt = f"""You are updating documentation for the krkn-chaos project.
The website uses Hugo/Docsy with markdown files containing YAML frontmatter.

Given the upstream code diff, update the documentation file accurately.

STRICT RULES:
1. Preserve the YAML frontmatter block (between --- markers) EXACTLY as-is
2. Preserve existing structure, heading hierarchy, and formatting
3. Only add/modify/remove content DIRECTLY affected by the diff
4. Keep parameter tables in the same markdown table format
5. Do NOT add sections, warnings, or notes not supported by the diff
6. Do NOT change wording in sections unrelated to the diff
7. Return ONLY the complete updated markdown file, nothing else

--- UPSTREAM CODE DIFF ---
{diff_patch}

--- CURRENT DOC ({doc_path}) ---
{current_doc}"""
    resp = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


def create_pr(repo, pr_number, updated_docs, changed_files, token, dry_run=False):
    """Create branch, commit updated docs, and open a draft PR."""
    repo_short = repo.split("/")[-1]
    branch = f"doc-sync/{repo_short}-pr-{pr_number}"
    workspace = os.environ.get("GITHUB_WORKSPACE", ".")

    if dry_run:
        for path, content in updated_docs.items():
            print(f"  [dry-run] {path} ({len(content)} bytes)")
        return "(dry-run)"

    subprocess.run(["git", "checkout", "-b", branch], cwd=workspace, check=True)
    for path, content in updated_docs.items():
        if not safe_path(path):
            print(f"  SECURITY: rejected path: {path}")
            continue
        p = Path(workspace) / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
    subprocess.run(["git", "add", "."], cwd=workspace, check=True)
    subprocess.run(
        ["git", "commit", "-m", f"docs: sync from {repo_short} PR #{pr_number}"],
        cwd=workspace,
        check=True,
    )
    subprocess.run(["git", "push", "origin", branch], cwd=workspace, check=True)

    marker = MARKER_TPL.format(repo=repo, number=pr_number)
    upstream_files = ", ".join(f"`{f['filename']}`" for f in changed_files)
    website_files = ", ".join(f"`{p}`" for p in updated_docs)
    body = (
        f"## Doc Sync: Auto-update from {repo_short} PR #{pr_number}\n\n"
        f"**Upstream:** {repo}#{pr_number}\n"
        f"**Changed:** {upstream_files}\n"
        f"**Updated:** {website_files}\n\n"
        f"> Review carefully. Generated by LLM from code diff.\n\n{marker}\n"
    )
    data = gh_api(
        f"/repos/{WEBSITE_REPO}/pulls",
        token,
        "POST",
        {"title": f"docs: sync from {repo_short} PR #{pr_number}", "body": body, "head": branch, "base": "main", "draft": True},
    )
    return data["html_url"]


def process_pr(repo, pr_number, mapping, token, dry_run=False):
    """Process a single upstream PR end-to-end."""
    print(f"Processing {repo} PR #{pr_number}...")
    if pr_already_synced(repo, pr_number, token):
        print("  Skip: already synced")
        return
    changed = get_impacting_files(repo, pr_number, mapping, token)
    if not changed:
        print("  Skip: no doc-impacting files")
        return
    docs = affected_docs(changed, mapping)
    if not docs:
        print("  Skip: no mappable docs")
        return

    diff = "\n".join(f"--- {f['filename']} ---\n{f.get('patch', '(binary)')}" for f in changed)
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set")
        sys.exit(1)
    client = anthropic.Anthropic(api_key=api_key)

    updated = {}
    for doc_path in docs:
        current = get_website_doc(doc_path, token) if not dry_run else f"(would fetch {doc_path})"
        if not current:
            print(f"  Warning: cannot fetch {doc_path}")
            continue
        if dry_run:
            updated[doc_path] = "(dry-run content)"
            continue
        try:
            result = generate_update(diff, current, doc_path, client)
            if result and result.strip() != current.strip():
                updated[doc_path] = result
                print(f"  Updated: {doc_path}")
        except Exception as e:
            print(f"  Error on {doc_path}: {e}")
            continue

    if not updated:
        print("  No updates generated")
        return
    url = create_pr(repo, pr_number, updated, changed, token, dry_run=dry_run)
    print(f"  PR: {url}")


def main():
    parser = argparse.ArgumentParser(description="Doc Sync Bot")
    parser.add_argument("--upstream-pr", help="repo:number or just number (defaults to krkn-ai)")
    parser.add_argument("--dry-run", action="store_true", help="No PRs created, print actions only")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("ERROR: GITHUB_TOKEN not set")
        sys.exit(1)

    pr_input = args.upstream_pr or os.environ.get("UPSTREAM_PR", "").strip()
    if pr_input:
        if ":" in pr_input:
            repo_short, num_str = pr_input.split(":", 1)
            repo = f"krkn-chaos/{repo_short}"
        else:
            repo, num_str = "krkn-chaos/krkn-ai", pr_input
        mapping = UPSTREAM_REPOS.get(repo)
        if not mapping:
            print(f"ERROR: no mapping for {repo}")
            sys.exit(1)
        process_pr(repo, int(num_str), mapping, token, dry_run=args.dry_run)
        return

    print("Polling upstream repos for recent merged PRs...")
    for repo, mapping in UPSTREAM_REPOS.items():
        print(f"  Checking {repo}...")
        for num in find_recent_merged(repo, mapping, token):
            try:
                process_pr(repo, num, mapping, token, dry_run=args.dry_run)
            except Exception as e:
                print(f"  Error on {repo}#{num}: {e}")


if __name__ == "__main__":
    main()
