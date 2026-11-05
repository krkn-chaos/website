import os
from pathlib import Path
import re
import subprocess
import tempfile
import textwrap
import unittest


WORKFLOW = Path(__file__).resolve().parents[1] / 'workflows' / 'rebuild-docs-index.yml'


class RebuildSummaryTest(unittest.TestCase):
    def test_manual_reason_is_text_not_shell_source(self):
        workflow = WORKFLOW.read_text()
        step = workflow.split('      - name: Summary\n', 1)[1].split('\n      - name:', 1)[0]
        script = textwrap.dedent(step.split('        run: |\n', 1)[1])
        reason = '$(printf REASON_EXECUTED >&2)'
        context = {
            '${{ github.event.inputs.reason }}': reason,
            '${{ github.event_name }}': 'workflow_dispatch',
            '${{ steps.get-url.outputs.SITE_URL }}': 'https://example.invalid',
        }
        step_env = {key: context.get(value, value) for key, value in
                    re.findall(r'^          ([A-Z_]+): (.+)$', step, re.MULTILINE)}
        for expr, value in context.items():
            script = script.replace(expr, value)
        with tempfile.TemporaryDirectory() as directory:
            summary = Path(directory) / 'summary'
            env = {key: value for key, value in os.environ.items() if key != 'REBUILD_REASON'}
            env.update({**step_env, 'GITHUB_STEP_SUMMARY': str(summary)})
            result = subprocess.run(['bash', '-e', '-o', 'pipefail', '-c', script],
                                    env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertNotIn('REASON_EXECUTED', result.stderr)
            self.assertIn(reason, summary.read_text())


if __name__ == '__main__':
    unittest.main()
