"""
Doc Sync Bot for krkn-chaos/website.

Detects doc-impacting changes in krkn-chaos/krkn-ai merged PRs and creates
draft PRs on the website repo with LLM-generated documentation updates.
"""
import argparse, base64, json, os, subprocess, sys
from pathlib import Path

import anthropic, requests

UPSTREAM_REPO = "krkn-chaos/krkn-ai"
WEBSITE_REPO = "krkn-chaos/website"
DOCS_BASE = "content/en/docs/krkn_ai/config"
MARKER_TPL = "<!-- doc-sync-bot: upstream-pr={} -->"

# krkn-ai paths -> website docs they affect
FILE_TO_DOCS = {
    "krkn_ai/models/config.py": [
        f"{DOCS_BASE}/scenarios.md", f"{DOCS_BASE}/fitness_function.md",
        f"{DOCS_BASE}/evolutionary_algorithm.md", f"{DOCS_BASE}/stopping_criteria.md",
        f"{DOCS_BASE}/elastic_search.md", f"{DOCS_BASE}/health_check.md",
        f"{DOCS_BASE}/output.md",
    ],
    "krkn_ai/cli/": [f"{DOCS_BASE}/scenarios.md"],
    "README.md": ["content/en/docs/krkn_ai/_index.md"],
    "docs/": [f"{DOCS_BASE}/"],
}


def gh_api(endpoint, token, method="GET", json_data=None):
    """GitHub API helper."""
    r = requests.request(
        method, f"https://api.github.com{endpoint}",
        headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
        json=json_data, timeout=30,
    )
    r.raise_for_status()
    return r.json() if r.content else None


def get_doc_impacting_files(pr_number, token):
    """Return PR files that match doc-impacting paths."""
    files = gh_api(f"/repos/{UPSTREAM_REPO}/pulls/{pr_number}/files", token)
    prefixes = list(FILE_TO_DOCS.keys())
    return [f for f in files if any(f["filename"].startswith(p) for p in prefixes)]


def pr_already_synced(pr_number, token):
    """Idempotency check: does a doc-sync PR already exist for this upstream PR?"""
    marker = MARKER_TPL.format(pr_number)
    for state in ("open", "closed"):
        prs = gh_api(f"/repos/{WEBSITE_REPO}/pulls?state={state}&per_page=30", token)
        if any(marker in (pr.get("body") or "") for pr in prs):
            return True
    return False


def find_recent_merged_prs(token):
    """Find recently merged krkn-ai PRs touching doc-impacting files."""
    prs = gh_api(f"/repos/{UPSTREAM_REPO}/pulls?state=closed&sort=updated&per_page=10", token)
    return [p["number"] for p in prs if p.get("merged_at") and get_doc_impacting_files(p["number"], token)][:5]


def get_website_doc(path, token):
    """Fetch a doc file from the website repo."""
    try:
        data = gh_api(f"/repos/{WEBSITE_REPO}/contents/{path}?ref=main", token)
        return base64.b64decode(data["content"]).decode()
    except requests.HTTPError:
        return None


def affected_docs(changed_files):
    """Map changed upstream files to website doc paths."""
    docs = set()
    for f in changed_files:
        for prefix, targets in FILE_TO_DOCS.items():
            if f["filename"].startswith(prefix):
                docs.update(t for t in targets if not t.endswith("/"))
    return list(docs)


def generate_update(diff_patch, current_doc, doc_path, client):
    """Use Claude to generate an updated doc from the diff."""
    prompt = f"""You are updating documentation for the krkn-chaos project.
The website uses Hugo/Docsy with markdown files containing YAML frontmatter.

Given the upstream code diff below, update the documentation file to reflect the changes.

Rules:
- Preserve YAML frontmatter exactly as-is
- Preserve existing markdown structure and formatting style
- Only add/modify/remove content directly affected by the diff
- Keep parameter tables in the same markdown table format
- If the diff adds a new config field/scenario, add it to the relevant section
- If the diff removes something, remove it from the doc
- Return ONLY the complete updated markdown file, no explanation

--- DIFF ---
{diff_patch}

--- CURRENT DOC ({doc_path}) ---
{current_doc}"""

    resp = client.messages.create(
        model="claude-sonnet-4-20250514", max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


def create_pr(pr_number, updated_docs, changed_files, token):
    """Create branch, commit updated docs, and open a draft PR."""
    branch = f"doc-sync/krkn-ai-pr-{pr_number}"
    repo_dir = os.environ.get("GITHUB_WORKSPACE", ".")
    env = {**os.environ, "GIT_AUTHOR_NAME": "doc-sync-bot", "GIT_AUTHOR_EMAIL": "doc-sync-bot@krkn-chaos.dev"}

    subprocess.run(["git", "checkout", "-b", branch], cwd=repo_dir, check=True)
    for path, content in updated_docs.items():
        p = Path(repo_dir) / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
    subprocess.run(["git", "add", "."], cwd=repo_dir, check=True)
    subprocess.run(["git", "commit", "-m", f"docs: sync from krkn-ai PR #{pr_number}"], cwd=repo_dir, check=True, env=env)
    subprocess.run(["git", "push", "origin", branch], cwd=repo_dir, check=True)

    upstream_files = ", ".join(f"`{f['filename']}`" for f in changed_files)
    website_files = ", ".join(f"`{p}`" for p in updated_docs)
    body = f"""## Doc Sync: Auto-update from krkn-ai PR #{pr_number}

This PR was automatically generated by the **Doc Sync Bot** to keep website
documentation in sync with upstream code changes.

**Upstream change:** {UPSTREAM_REPO}#{pr_number}
**Changed upstream files:** {upstream_files}
**Updated website docs:** {website_files}

> Please review the generated changes carefully. The bot uses an LLM to
> interpret code changes and update documentation accordingly.

{MARKER_TPL.format(pr_number)}
"""
    data = gh_api(f"/repos/{WEBSITE_REPO}/pulls", token, "POST", {
        "title": f"docs: sync from krkn-ai PR #{pr_number}",
        "body": body, "head": branch, "base": "main", "draft": True,
    })
    return data["html_url"]


def process_pr(pr_number, token):
    """Process a single upstream PR end-to-end."""
    print(f"Processing krkn-ai PR #{pr_number}...")
    if pr_already_synced(pr_number, token):
        print(f"  Skip: PR already synced"); return
    changed = get_doc_impacting_files(pr_number, token)
    if not changed:
        print(f"  Skip: no doc-impacting files"); return
    docs = affected_docs(changed)
    if not docs:
        print(f"  Skip: no mappable docs"); return

    diff = "\n".join(f"--- {f['filename']} ---\n{f.get('patch', '(binary)')}" for f in changed)
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("  Error: ANTHROPIC_API_KEY not set"); return
    client = anthropic.Anthropic(api_key=api_key)

    updated = {}
    for doc_path in docs:
        current = get_website_doc(doc_path, token)
        if not current:
            print(f"  Warning: cannot fetch {doc_path}"); continue
        try:
            result = generate_update(diff, current, doc_path, client)
            if result and result.strip() != current.strip():
                updated[doc_path] = result
                print(f"  Updated: {doc_path}")
        except Exception as e:
            print(f"  Error on {doc_path}: {e}"); continue

    if not updated:
        print("  No updates generated"); return
    url = create_pr(pr_number, updated, changed, token)
    print(f"  Draft PR created: {url}")


def main():
    parser = argparse.ArgumentParser(description="Doc Sync Bot for krkn-chaos")
    parser.add_argument("--upstream-pr", type=int, help="Specific krkn-ai PR number")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Error: GITHUB_TOKEN not set"); sys.exit(1)

    pr_number = args.upstream_pr or (int(v) if (v := os.environ.get("UPSTREAM_PR", "").strip()) else None)
    if pr_number:
        process_pr(pr_number, token); return

    print("Polling for recent merged PRs...")
    for num in find_recent_merged_prs(token):
        try:
            process_pr(num, token)
        except Exception as e:
            print(f"  Error on PR #{num}: {e}")


if __name__ == "__main__":
    main()
