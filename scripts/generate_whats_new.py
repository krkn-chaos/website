import os
import subprocess
import datetime
from pathlib import Path

# We will assume google-generativeai is installed in the CI environment
try:
    import google.generativeai as genai
except ImportError:
    genai = None

def get_git_commits(days=30):
    """Fetches commit messages from the last X days."""
    try:
        # Get commit messages since 30 days ago
        cmd = ["git", "log", f"--since={days} days ago", "--pretty=format:%s"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip().split('\n')
    except Exception as e:
        print(f"Error fetching git logs: {e}")
        return []

def generate_whats_new_content(commits):
    """Sends commits to Gemini and returns a professional summary."""
    if not genai:
        return "Error: google-generativeai library not found."
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY environment variable not set."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"""
    You are a professional Technical Writer for the Krkn-Chaos project (part of CNCF).
    Below is a list of raw developer commit messages from the last 30 days. 
    
    TASK:
    1. Identify the most important user-facing changes (new features, bug fixes, doc updates).
    2. Ignore internal cleanup, typos, or minor script changes.
    3. Summarize them into a friendly, professional 'What's New' blog post.
    4. Group them into '🚀 New Features', '🛠️ Improvements', and '🐛 Bug Fixes'.
    5. Output ONLY the Markdown body. Do not include a title or frontmatter.

    RAW COMMITS:
    {chr(10).join(commits)}
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error calling Gemini API: {e}"

def main():
    print("📢 Starting AI 'What's New' Generator...")
    
    commits = get_git_commits(30)
    if not commits or (len(commits) == 1 and commits[0] == ''):
        print("✅ No commits found in the last 30 days. Skipping generation.")
        return

    print(f"📄 Found {len(commits)} commits. Consulting the AI...")
    
    ai_summary = generate_whats_new_content(commits)
    
    # Hugo Frontmatter & File Setup
    today = datetime.date.today()
    month_name = today.strftime("%B %Y")
    file_name = f"whats-new-{today.strftime('%Y-%m')}.md"
    output_dir = Path("content/en/blog/whats-new")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    frontmatter = f"""---
title: "What's New in Krkn: {month_name}"
date: {today.isoformat()}
author: "Krkn Documentation Bot"
description: "A summary of the latest features, improvements, and bug fixes in the Krkn-Chaos ecosystem."
tags: ["whats-new", "community", "updates"]
---

"""
    
    full_content = frontmatter + ai_summary
    
    file_path = output_dir / file_name
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_content)
    
    print(f"✨ Success! Generated '{file_path}'")

if __name__ == "__main__":
    main()
