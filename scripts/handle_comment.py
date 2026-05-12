import os
import logging
import json
import sys
from typing import Optional, Dict, Any
from github import Github, GithubException
from dotenv import load_dotenv

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

class CommentHandler:
    """Handles PR comments starting with @krkn-bot to refine content."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        if not self.token:
            raise ValueError("GITHUB_TOKEN not found.")
        
        self.gh = Github(self.token)
        self.repo_name = os.getenv("TARGET_REPO", "krkn-chaos/website")
        self.repo = self.gh.get_repo(self.repo_name)
        
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")

        if self.gemini_key and genai:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            
        if self.openai_key and OpenAI:
            self.openai_client = OpenAI(api_key=self.openai_key)

    def process_comment(self, payload: Dict[str, Any]):
        """Processes an issue_comment webhook payload."""
        comment_body = payload["comment"]["body"].strip()
        
        if not comment_body.startswith("@krkn-bot"):
            logger.info("Comment does not start with @krkn-bot. Ignoring.")
            return

        instruction = comment_body.replace("@krkn-bot", "").strip()
        pr_number = payload["issue"]["number"]
        comment_id = payload["comment"]["id"]

        try:
            pr = self.repo.get_pull(pr_number)
            logger.info(f"Processing refinement for PR #{pr_number}")

            # 1. Get the changed markdown file in the PR
            files = pr.get_files()
            md_file = next((f for f in files if f.filename.endswith(".md") and "blog/whats-new" in f.filename), None)
            
            if not md_file:
                logger.warning("No relevant markdown file found in this PR.")
                self._reply(pr, "I couldn't find a 'What's New' markdown file to refine in this PR.")
                return

            # 2. Fetch current content
            current_content = self.repo.get_contents(md_file.filename, ref=pr.head.ref).decoded_content.decode("utf-8")

            # 3. Refine content via LLM
            refined_content = self._refine_content(current_content, instruction)

            # 4. Update file
            self.repo.update_file(
                path=md_file.filename,
                message=f"Refine blog post based on comment {comment_id}",
                content=refined_content,
                sha=self.repo.get_contents(md_file.filename, ref=pr.head.ref).sha,
                branch=pr.head.ref
            )

            # 5. Reply to comment
            self._reply(pr, f"✅ I've updated the blog post based on your instruction: *\"{instruction}\"*")
            logger.info("Refinement complete and reply posted.")

        except Exception as e:
            logger.error(f"Error processing comment: {e}")
            if 'pr' in locals():
                self._reply(pr, f"❌ Sorry, I encountered an error while trying to refine the post: {str(e)}")

    def _refine_content(self, current_content: str, instruction: str) -> str:
        """Uses LLM to refine the markdown content based on instruction."""
        prompt = f"""
        You are a Technical Writer. I have an existing Hugo blog post and I need you to modify it according to the following instruction.
        
        INSTRUCTION: {instruction}
        
        CURRENT CONTENT:
        {current_content}
        
        Please return the FULL updated markdown content, preserving the frontmatter and structure unless the instruction asks to change them.
        Output ONLY the markdown content.
        """
        
        if self.openai_key and OpenAI:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        elif self.gemini_key and genai:
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
        else:
            raise ValueError("No LLM client configured.")

    def _reply(self, pr, message: str):
        """Posts a comment to the PR."""
        pr.create_issue_comment(message)

def main():
    # Typically run via GitHub Action with GITHUB_EVENT_PATH
    event_path = os.getenv("GITHUB_EVENT_PATH")
    if not event_path:
        logger.error("GITHUB_EVENT_PATH not set.")
        return

    with open(event_path, "r") as f:
        payload = json.load(f)

    handler = CommentHandler()
    handler.process_comment(payload)

if __name__ == "__main__":
    main()
