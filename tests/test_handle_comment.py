import unittest
from unittest.mock import patch, MagicMock
from scripts.handle_comment import CommentHandler

class TestCommentHandler(unittest.TestCase):

    @patch('scripts.handle_comment.os.getenv')
    @patch('scripts.handle_comment.Github')
    @patch('scripts.handle_comment.genai')
    def test_process_comment_success(self, mock_genai, mock_github, mock_getenv):
        # Mock env
        mock_getenv.side_effect = lambda k, d=None: "fake-value" if k in ["GITHUB_TOKEN", "GEMINI_API_KEY", "TARGET_REPO"] else d
        
        mock_repo = MagicMock()
        mock_github.return_value.get_repo.return_value = mock_repo
        
        # Mock PR and files
        mock_pr = MagicMock()
        mock_file = MagicMock()
        mock_file.filename = "content/en/blog/whats-new/whats-new-2026-05.md"
        mock_pr.get_files.return_value = [mock_file]
        mock_repo.get_pull.return_value = mock_pr
        
        # Mock file content
        mock_contents = MagicMock()
        mock_contents.decoded_content = b"old content"
        mock_repo.get_contents.return_value = mock_contents
        
        # Mock LLM
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "new refined content"
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model
        
        handler = CommentHandler(token="fake-token")
        
        payload = {
            "comment": {"body": "@krkn-bot make it more concise", "id": 123},
            "issue": {"number": 456},
            "repository": {"full_name": "krkn-chaos/website"}
        }
        
        handler.process_comment(payload)
        
        # Verify update and reply
        mock_repo.update_file.assert_called_once()
        mock_pr.create_issue_comment.assert_called_once_with("✅ I've updated the blog post based on your instruction: *\"make it more concise\"*")

if __name__ == '__main__':
    unittest.main()
