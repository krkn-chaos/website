import os
import re
import requests
import sys
import socket
import ipaddress
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor

REPORT_FILE = 'broken_links_report.md'
# Hardcoded blocklist as requested by user
BLOCKED_PREFIXES = ["127.", "10.", "192.168.", "172.", "169.254."]
IGNORE_DOMAINS = ['localhost', 'example.com']

# Regex to catch:
# 1. Standard Markdown links and images: [text](url) or ![alt](url)
# 2. Reference-style links: [ref]: url (allows optional leading + for git diffs)
# 3. Angle bracket links: <http...>
# 4. Raw URLs: https://...
# 5. Hugo shortcodes: {{< ref "path/to/file.md" >}}
LINK_REGEX = re.compile(
    r'!?\[.*?\]\((.*?)\)|'                 # Standard & Images
    r'^\+?\[.*?\]:\s*([^\s]+)|'            # Reference style
    r'<(https?://.*?)>|'                   # Angle brackets
    r'(?<![\(<])(https?://[^\s\)\>]+)|'    # Raw URLs
    r'\{\{<\s*(?:rel)?ref\s+"(.*?)"\s*>\}\}', # Hugo refs
    re.MULTILINE
)

def get_url_safety(url):
    """
    Check if the URL is safe to check (prevents SSRF).
    Returns (is_safe, reason)
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid Hostname"

        if any(domain in hostname for domain in IGNORE_DOMAINS):
            return False, "Ignored Domain"

        # Resolve hostname to IP
        try:
            ip_str = socket.gethostbyname(hostname)
        except socket.gaierror:
            return False, "Unresolvable Domain"
        
        if any(ip_str.startswith(prefix) for prefix in BLOCKED_PREFIXES):
            return False, "Internal/Private IP (Blocked)"

        ip_obj = ipaddress.ip_address(ip_str)
        if (ip_obj.is_private or ip_obj.is_loopback or 
            ip_obj.is_reserved or ip_obj.is_link_local or 
            ip_obj.is_multicast):
            return False, "Internal/Private IP (Blocked)"

        return True, "Safe"
    except Exception as e:
        return False, f"Validation Error ({type(e).__name__})"

def check_single_url(url):
    """
    Check a single URL. Returns (url, status, message).
    Status can be 'ok', 'broken', or 'warning'.
    """
    is_safe, reason = get_url_safety(url)
    if not is_safe:
        # If it's just unresolvable, mark as broken rather than blocked
        if reason == "Unresolvable Domain":
            return (url, 'broken', "Unresolvable Domain")
        return (url, 'warning', reason)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) krkn-link-checker/1.0'
    }

    try:
        # Try HEAD first
        response = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
        
        if response.status_code == 405:
            response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)

        if 200 <= response.status_code < 400:
            return (url, 'ok', f"HTTP {response.status_code}")
        elif response.status_code == 429 or response.status_code >= 500:
            return (url, 'warning', f"Flaky (HTTP {response.status_code})")
        else:
            return (url, 'broken', f"Broken (HTTP {response.status_code})")

    except requests.exceptions.Timeout:
        return (url, 'warning', "Timeout (Slow response)")
    except Exception as e:
        return (url, 'broken', f"Connection failed ({type(e).__name__})")

def check_internal_url(url):
    """
    Check if an internal URL/ref points to a valid file.
    Returns (url, status, message)
    """
    # Remove fragments and queries
    path = url.split('#')[0].split('?')[0].strip()
    if not path:
        return (url, 'ok', "Local anchor (Skipped)")

    possible_paths = []
    
    if path.startswith('/'):
        clean_path = path[1:]
        possible_paths.extend([
            clean_path,
            os.path.join('content', clean_path),
            os.path.join('static', clean_path)
        ])
        if not clean_path.endswith('.md'):
            possible_paths.append(os.path.join('content', clean_path + '.md'))
            possible_paths.append(os.path.join('content', clean_path, '_index.md'))
    else:
        possible_paths.extend([
            path,
            os.path.join('content', path),
            os.path.join('static', path)
        ])
        if not path.endswith('.md') and not '.' in path:
            possible_paths.append(os.path.join('content', path + '.md'))
            possible_paths.append(os.path.join('content', path, '_index.md'))

    # Quick exact matches
    for p in possible_paths:
        if os.path.exists(p) and os.path.isfile(p):
            return (url, 'ok', "Local file found")

    # Deep search in content directory for Hugo refs (filename only)
    filename = os.path.basename(path)
    search_filename = filename if '.' in filename else filename + '.md'
    
    if os.path.exists('content'):
        for root, dirs, files in os.walk('content'):
            if search_filename in files:
                return (url, 'ok', f"Found in {root}")
            # check if path is a dir containing _index.md
            if path.strip('/') in root.replace('\\', '/') and '_index.md' in files:
                return (url, 'ok', f"Found _index.md in {root}")

    return (url, 'warning', "Local file/ref not found (Check if valid)")

def main():
    if not os.path.exists('pr.diff'):
        print("No pr.diff found. Nothing to check.")
        return

    print("Analyzing PR Diff for newly added links...")
    
    with open('pr.diff', 'r', encoding='utf-8') as f:
        diff_lines = f.readlines()

    unique_urls = set()
    for line in diff_lines:
        if line.startswith('+') and not line.startswith('+++'):
            matches = LINK_REGEX.findall(line)
            for match in matches:
                for url in match:
                    if url:
                        unique_urls.add(url.strip())

    if not unique_urls:
        print("No new links found. Clean diff!")
        return

    external_urls = set()
    internal_urls = set()

    for url in unique_urls:
        if url.startswith('http://') or url.startswith('https://'):
            external_urls.add(url)
        elif url.startswith('mailto:') or url.startswith('tel:'):
            continue
        else:
            internal_urls.add(url)

    print(f"Found {len(external_urls)} external links and {len(internal_urls)} internal links.")

    results = []
    
    # Check internal links sequentially (fast)
    for url in internal_urls:
        results.append(check_internal_url(url))

    # Check external links in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        ext_results = list(executor.map(check_single_url, external_urls))
        results.extend(ext_results)

    broken = [r for r in results if r[1] == 'broken']
    warnings = [r for r in results if r[1] == 'warning']

    if broken or warnings:
        print(f"Found {len(broken)} broken and {len(warnings)} warning links.")
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            f.write("## Documentation Link Validation Report\n\n")
            f.write("We automatically scanned the links added in this PR. Here is what we found:\n\n")

            if broken:
                f.write("### Broken Links (Action Required)\n")
                f.write("These links returned a 404 or failed to connect. Please verify them.\n\n")
                for url, status, msg in broken:
                    f.write(f"- `{url}` -> **{msg}**\n")
                f.write("\n")

            if warnings:
                f.write("### Warnings (Review Recommended)\n")
                f.write("These links are either slow, rate-limited, or were blocked for security reasons.\n\n")
                for url, status, msg in warnings:
                    f.write(f"- `{url}` -> **{msg}**\n")
                f.write("\n")

            f.write("---\n")
            f.write("*(This is an automated non-blocking check. If a link is valid but failing here, feel free to ignore this warning.)*")
    else:
        print("All new links are healthy!")

if __name__ == "__main__":
    main()
