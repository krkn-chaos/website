import os
import re
import requests
import sys

REPORT_FILE = 'broken_links_report.md'
IGNORE_DOMAINS = ['127.0.0.1', 'localhost', 'example.com']

# Regex to catch [text](http...)
LINK_REGEX = re.compile(r'\[.*?\]\((https?://.*?)\)')

def main():
    if not os.path.exists('pr.diff'):
        print("No pr.diff found. Nothing to check.")
        return

    print("Analyzing PR Diff for newly added links...")
    
    # Read the git diff
    with open('pr.diff', 'r', encoding='utf-8') as f:
        diff_lines = f.readlines()

    new_links = set()
    
    # Extract links ONLY from lines added in this PR (lines starting with '+' but not '+++')
    for line in diff_lines:
        if line.startswith('+') and not line.startswith('+++'):
            urls = LINK_REGEX.findall(line)
            for url in urls:
                new_links.add(url)

    if not new_links:
        print("No new external links added in this PR. Exiting.")
        return

    print(f"Found {len(new_links)} new links to check.")
    bad_links = []

    for url in new_links:
        # Skip ignored domains
        if any(domain in url for domain in IGNORE_DOMAINS):
            continue
            
        try:
            headers = {'User-Agent': 'krkn-chaos-link-bot'}
            resp = requests.get(url, headers=headers, timeout=5)
            
            if resp.status_code >= 400:
                print(f"[BROKEN] {url} (Status: {resp.status_code})")
                bad_links.append(f"- {url} (HTTP {resp.status_code})")
            else:
                print(f"[OK] {url}")
                
        except Exception as e:
            print(f"[ERROR] Failed to reach {url}")
            bad_links.append(f"- {url} (Connection failed)")

    # Generate the report if bad links are found
    if bad_links:
        print(f"\nYikes, found {len(bad_links)} bad links. Writing to report...")
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            f.write("### ⚠️ Documentation Link Warning\n\n")
            f.write("Hey! We noticed you added some new external links in this PR, but they seem to be broken. ")
            f.write("Please double check them:\n\n")
            for link in bad_links:
                f.write(link + "\n")
            f.write("\n*(This is just a warning, your PR can still be merged!)*")
    else:
        print("\nAwesome, all new links look good!")

if __name__ == "__main__":
    main()
