import os
import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

class PRFetcher:
    """Fetches merged PRs from the krkn-chaos ecosystem repositories."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        if not self.token:
            logger.warning("GITHUB_TOKEN not found. Rate limits will be severely restricted.")
        
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"
        
        self.base_url = "https://api.github.com/search/issues"
        self.repos = os.getenv("SOURCE_REPOS", "krkn,krkn-hub,krknctl,krkn-operator,cerberus,krkn-ai").split(",")
        self.org = "krkn-chaos"

    def fetch_merged_prs(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Fetches PRs merged in the last X days across all configured repositories.
        
        Args:
            days: Number of days to look back.
            
        Returns:
            A list of merged PR objects.
        """
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        all_prs = []

        for repo_name in self.repos:
            repo_full_name = f"{self.org}/{repo_name.strip()}"
            logger.info(f"Fetching merged PRs for {repo_full_name} since {since_date}")
            
            page = 1
            while True:
                query = f"repo:{repo_full_name} is:pr is:merged merged:>{since_date}"
                params = {
                    "q": query,
                    "sort": "updated",
                    "order": "desc",
                    "per_page": 100,
                    "page": page
                }
                
                try:
                    response = requests.get(self.base_url, headers=self.headers, params=params)
                    response.raise_for_status()
                    data = response.json()
                    
                    items = data.get("items", [])
                    if not items:
                        break
                    
                    for item in items:
                        if not self._is_noise(item):
                            all_prs.append({
                                "repo": repo_full_name,
                                "title": item["title"],
                                "number": item["number"],
                                "url": item["html_url"],
                                "user": item["user"]["login"],
                                "merged_at": item.get("closed_at") # Merged date for search is closed_at
                            })
                    
                    if len(items) < 100:
                        break
                    page += 1
                    
                except requests.exceptions.RequestException as e:
                    logger.error(f"Error fetching PRs for {repo_full_name}: {e}")
                    break
                    
        logger.info(f"Total relevant PRs fetched: {len(all_prs)}")
        return all_prs

    def _is_noise(self, pr: Dict[str, Any]) -> bool:
        """
        Filters out noise PRs like dependency bumps, typos, CI, and internal refactors.
        
        Args:
            pr: The PR item from GitHub API.
            
        Returns:
            True if the PR is considered noise, False otherwise.
        """
        title = pr["title"].lower()
        noise_keywords = [
            "bump", "dependency", "dependabot", "typo", "fix typo", 
            "ci:", "chore:", "internal:", "refactor:", "cleanup",
            "lint", "format", "github action"
        ]
        
        # Check title for noise keywords
        if any(keyword in title for keyword in noise_keywords):
            return True
            
        # Check labels for noise
        labels = [label["name"].lower() for label in pr.get("labels", [])]
        noise_labels = ["dependencies", "internal", "chore", "documentation"] # Documentation might be kept depending on policy
        if any(label in noise_labels for label in labels):
            # Keep documentation if specifically requested, but often excluded from "What's New" unless significant
            if "documentation" in labels and "feature" not in labels:
                return True
            return True
            
        return False

def main():
    fetcher = PRFetcher()
    prs = fetcher.fetch_merged_prs()
    
    # In a real workflow, we might save this to a file or pass it to the next script
    import json
    with open("scripts/data/raw_prs.json", "w") as f:
        json.dump(prs, f, indent=4)
    logger.info("Raw PRs saved to scripts/data/raw_prs.json")

if __name__ == "__main__":
    # Ensure data directory exists
    os.makedirs("scripts/data", exist_ok=True)
    main()
