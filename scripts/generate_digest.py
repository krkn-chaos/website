import os
import logging
import json
import re
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# python-dotenv>=1.0.0
# google-generativeai>=0.3.0
# openai>=1.0.0

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

class DigestGenerator:
    """Generates a monthly digest using an LLM based on fetched PRs."""

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
        if self.gemini_key and genai:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini initialized.")
        
        if self.openai_key and OpenAI:
            self.openai_client = OpenAI(api_key=self.openai_key)
            logger.info("OpenAI initialized.")
            
        if not self.gemini_key and not self.openai_key:
            logger.error("Neither GEMINI_API_KEY nor OPENAI_API_KEY found.")

    def generate(self, prs_data: List[Dict[str, Any]], retry_count: int = 3) -> str:
        """
        Generates the blog post content using the LLM with retries and validation.
        
        Args:
            prs_data: List of PR dictionaries.
            retry_count: Number of times to retry if validation fails.
            
        Returns:
            The generated markdown string.
        """
        if not prs_data:
            logger.warning("No PR data provided for digest generation.")
            return ""

        prompt = self._build_prompt(prs_data)
        
        for attempt in range(retry_count):
            logger.info(f"Generation attempt {attempt + 1}/{retry_count}")
            try:
                content = self._call_llm(prompt)
                if self._validate_hugo_frontmatter(content):
                    logger.info("Content generated and validated successfully.")
                    return content
                else:
                    logger.warning("Generated content failed Hugo frontmatter validation.")
            except Exception as e:
                logger.error(f"Error during LLM call: {e}")
            
            time.sleep(2) # Small backoff
            
        raise ValueError("Failed to generate valid content after multiple attempts.")

    def _build_prompt(self, prs_data: List[Dict[str, Any]]) -> str:
        """Builds a 6-part structured prompt for the LLM."""
        prs_summary = "\n".join([
            f"- [{pr['repo']}] {pr['title']} (PR #{pr['number']}) by {pr['user']}"
            for pr in prs_data
        ])
        
        current_month = datetime.now().strftime("%B %Y")
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        prompt = f"""
        Part 1: ROLE
        You are a Technical Content Engineer for krkn-chaos, a CNCF project focusing on Chaos Engineering for Kubernetes.
        
        Part 2: CONTEXT
        Below is a list of merged Pull Requests from the last 30 days across various repositories in the krkn-chaos ecosystem.
        
        Part 3: DATA
        {prs_summary}
        
        Part 4: TASK
        Generate a professional "What's New" blog post for {current_month}.
        Group the updates into three clear sections:
        - 🚀 New Features (Major functional additions)
        - 🛠️ Improvements (Performance, usability, or minor feature enhancements)
        - 🐛 Bug Fixes (Resolved issues)
        
        Part 5: FORMATTING REQUIREMENTS
        - Use Hugo-compatible markdown frontmatter exactly as specified below.
        - Ensure the title reflects the month: "What's New in krkn-chaos — {current_month}".
        - Keep descriptions concise and technical yet accessible.
        - Do not include internal PR numbers or usernames in the final text body, but use them to understand context.
        
        Part 6: MANDATORY FRONTMATTER STRUCTURE
        ---
        title: "What's New in krkn-chaos — {current_month}"
        date: {current_date}
        draft: false
        description: "Monthly digest of updates across krkn-chaos repos"
        tags: ["release-notes", "whats-new"]
        categories: ["Articles"]
        type: "blog"
        ---
        
        Output only the markdown content.
        """
        return prompt

    def _call_llm(self, prompt: str) -> str:
        """Calls either Gemini or OpenAI based on availability."""
        if self.openai_key and OpenAI:
            logger.info("Calling OpenAI API...")
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        elif self.gemini_key and genai:
            logger.info("Calling Gemini API...")
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
        else:
            raise ValueError("No LLM client configured. Check API keys and libraries.")

    def _validate_hugo_frontmatter(self, content: str) -> bool:
        """Validates that the content contains Hugo frontmatter."""
        # More flexible regex to handle varying quotes and spacing
        pattern = r"---[\s\S]*?title:\s*[\"'].*[\"'][\s\S]*?date:\s*\d{4}-\d{2}-\d{2}[\s\S]*?---"
        return bool(re.search(pattern, content))

def main():
    generator = DigestGenerator()
    
    # Load PR data
    data_path = "scripts/data/raw_prs.json"
    if not os.path.exists(data_path):
        logger.error(f"PR data not found at {data_path}. Run fetch_prs.py first.")
        return
        
    with open(data_path, "r") as f:
        prs_data = json.load(f)
        
    try:
        blog_content = generator.generate(prs_data)
        
        # Save output
        output_dir = "content/en/blog/whats-new"
        os.makedirs(output_dir, exist_ok=True)
        
        today = datetime.now().strftime("%Y-%m-%d")
        file_path = f"{output_dir}/whats-new-{today}.md"
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(blog_content)
            
        logger.info(f"Blog post saved to {file_path}")
        
    except Exception as e:
        logger.error(f"Failed to generate digest: {e}")

if __name__ == "__main__":
    main()
