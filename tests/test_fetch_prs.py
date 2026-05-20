import unittest
from unittest.mock import patch, MagicMock
from scripts.fetch_prs import PRFetcher

class TestPRFetcher(unittest.TestCase):

    @patch('scripts.fetch_prs.requests.get')
    def test_fetch_merged_prs(self, mock_get):
        # Mock GitHub API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "items": [
                {
                    "title": "New feature X",
                    "number": 123,
                    "html_url": "https://github.com/krkn-chaos/krkn/pull/123",
                    "user": {"login": "user1"},
                    "closed_at": "2026-05-10T10:00:00Z",
                    "labels": []
                },
                {
                    "title": "bump dependency Y",
                    "number": 124,
                    "html_url": "https://github.com/krkn-chaos/krkn/pull/124",
                    "user": {"login": "dependabot"},
                    "closed_at": "2026-05-10T11:00:00Z",
                    "labels": [{"name": "dependencies"}]
                }
            ]
        }
        mock_get.return_value = mock_response

        fetcher = PRFetcher(token="fake-token")
        # Override repos for faster testing
        fetcher.repos = ["krkn"]
        
        prs = fetcher.fetch_merged_prs(days=30)

        # Should only have 1 PR (the non-noise one)
        self.assertEqual(len(prs), 1)
        self.assertEqual(prs[0]["title"], "New feature X")
        self.assertEqual(prs[0]["repo"], "krkn-chaos/krkn")

    def test_is_noise(self):
        fetcher = PRFetcher(token="fake-token")
        
        noise_pr = {"title": "fix typo in readme", "labels": []}
        real_pr = {"title": "Implement new chaos scenario", "labels": [{"name": "feature"}]}
        dep_pr = {"title": "Bump library version", "labels": [{"name": "dependencies"}]}
        
        self.assertTrue(fetcher._is_noise(noise_pr))
        self.assertFalse(fetcher._is_noise(real_pr))
        self.assertTrue(fetcher._is_noise(dep_pr))

if __name__ == '__main__':
    unittest.main()
