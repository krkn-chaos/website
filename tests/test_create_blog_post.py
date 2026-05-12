import unittest
from unittest.mock import patch, MagicMock
from github import GithubException
from scripts.create_blog_post import BlogPostCreator

class TestBlogPostCreator(unittest.TestCase):

    @patch('scripts.create_blog_post.Github')
    def test_create_pr(self, mock_github):
        mock_repo = MagicMock()
        mock_github.return_value.get_repo.return_value = mock_repo
        
        # Mock get_contents to fail (to trigger create_file)
        mock_repo.get_contents.side_effect = GithubException(status=404, data={"message": "Not Found"})
        
        # Mock main branch
        mock_main = MagicMock()
        mock_main.commit.sha = "main-sha"
        mock_repo.get_branch.return_value = mock_main
        
        creator = BlogPostCreator(token="fake-token")
        
        creator.create_pr(
            file_path="content/blog/test.md",
            content="test content",
            branch_name="test-branch",
            title="Test PR"
        )
        
        # Verify calls
        mock_repo.create_git_ref.assert_called_once()
        mock_repo.create_file.assert_called_once()
        mock_repo.create_pull.assert_called_once()

if __name__ == '__main__':
    unittest.main()
