import unittest
from unittest.mock import patch, MagicMock
from scripts.generate_digest import DigestGenerator

class TestDigestGenerator(unittest.TestCase):

    @patch('scripts.generate_digest.os.getenv')
    @patch('scripts.generate_digest.genai')
    def test_generate_success(self, mock_genai, mock_getenv):
        # Mock env
        mock_getenv.return_value = "fake-key"
        
        # Mock LLM response
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """---
title: "What's New in krkn-chaos — May 2026"
date: 2026-05-12
draft: false
description: "Monthly digest of updates across krkn-chaos repos"
tags: ["release-notes", "whats-new"]
categories: ["Articles"]
type: "blog"
---

# Updates
🚀 New Features
- Added stuff
"""
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        generator = DigestGenerator()
        prs_data = [{"repo": "krkn", "title": "feature 1", "number": 1, "user": "u1"}]
        
        content = generator.generate(prs_data)
        
        self.assertIn("What's New in krkn-chaos — May 2026", content)
        self.assertIn("🚀 New Features", content)

    def test_validate_hugo_frontmatter(self):
        generator = DigestGenerator()
        
        valid_content = """---
title: "What's New in krkn-chaos — May 2026"
date: 2026-05-12
draft: false
description: "Monthly digest"
tags: ["tag"]
categories: ["cat"]
type: "blog"
---
Content
"""
        invalid_content = "Just some markdown without frontmatter"
        
        self.assertTrue(generator._validate_hugo_frontmatter(valid_content))
        self.assertFalse(generator._validate_hugo_frontmatter(invalid_content))

if __name__ == '__main__':
    unittest.main()
