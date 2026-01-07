---
title: Adding to Krkn Test Suite
# date: 2017-01-05
description:
weight : 4
categories: [Best Practices ]
tags: [docs]
---

This guide covers how to add both unit tests and functional tests to the krkn project. Tests are essential for ensuring code quality and preventing regressions.

# Unit Tests

Unit tests in krkn are located in the `tests/` directory and use Python's `unittest` framework with comprehensive mocking to avoid requiring external dependencies like cloud providers or Kubernetes clusters.

## Creating a Unit Test

### 1. File Location and Naming

Place your test file in the `tests/` directory with the naming pattern `test_<feature>.py`:

```bash
tests/
├── test_kubevirt_vm_outage.py
├── test_ibmcloud_node_scenarios.py
├── test_ibmcloud_power_node_scenarios.py
└── test_<your_feature>.py
```

### 2. Basic Test Structure

```python
#!/usr/bin/env python3

"""
Test suite for <Feature Name>

IMPORTANT: These tests use comprehensive mocking and do NOT require any external
infrastructure, cloud credentials, or Kubernetes cluster. All API calls are mocked.

Test Coverage:
- Feature 1: Description
- Feature 2: Description

Usage:
    # Run all tests
    python -m unittest tests.test_<your_feature> -v

    # Run with coverage
    python -m coverage run -a -m unittest tests/test_<your_feature>.py -v

Assisted By: Claude Code
"""

import unittest
from unittest.mock import MagicMock, patch, Mock

# Import the classes you're testing
from krkn.scenario_plugins.<module> import YourClass


class TestYourFeature(unittest.TestCase):
    """Test cases for YourClass"""

    def setUp(self):
        """Set up test fixtures before each test"""
        # Mock environment variables if needed
        self.env_patcher = patch.dict('os.environ', {
            'API_KEY': 'test-api-key',
            'API_URL': 'https://test.example.com'
        })
        self.env_patcher.start()

        # Mock external dependencies
        self.mock_client = MagicMock()

        # Create instance to test
        self.instance = YourClass()

    def tearDown(self):
        """Clean up after each test"""
        self.env_patcher.stop()

    def test_success_scenario(self):
        """Test successful operation"""
        # Arrange: Set up test data
        expected_result = "success"

        # Act: Call the method being tested
        result = self.instance.your_method()

        # Assert: Verify the result
        self.assertEqual(result, expected_result)

    def test_failure_scenario(self):
        """Test failure handling"""
        # Arrange: Set up failure condition
        self.mock_client.some_method.side_effect = Exception("API Error")

        # Act & Assert: Verify exception is handled
        with self.assertRaises(Exception):
            self.instance.your_method()


if __name__ == '__main__':
    unittest.main()
```

### 3. Best Practices for Unit Tests

- **Use Comprehensive Mocking**: Mock all external dependencies (cloud APIs, Kubernetes, file I/O)
- **Add IMPORTANT Note**: Include a note in the docstring that tests don't require credentials
- **Document Test Coverage**: List what scenarios each test covers
- **Organize Tests by Category**: Use section comments like `# ==================== Core Tests ====================`
- **Test Edge Cases**: Include tests for timeouts, missing parameters, API exceptions
- **Use Descriptive Names**: Test names should clearly describe what they test

### 4. Running Unit Tests

```bash
# Run all unit tests
python -m unittest discover -s tests -v

# Run specific test file
python -m unittest tests.test_your_feature -v

# Run with coverage
python -m coverage run -a -m unittest discover -s tests -v
python -m coverage report
```

# Functional Tests

Functional tests in krkn are integration tests that run complete chaos scenarios against a real Kubernetes cluster (typically KinD in CI). They are located in the `CI/tests/` directory.

## Understanding the Functional Test Structure

```
CI/
├── run.sh                          # Main test runner
├── run_test.sh                     # Individual test executor
├── config/
│   ├── common_test_config.yaml     # Base configuration template
│   └── <scenario>_config.yaml      # Generated configs per scenario
├── tests/
│   ├── common.sh                   # Common helper functions
│   ├── functional_tests            # List of tests to run
│   └── test_*.sh                   # Individual test scripts
└── out/
    └── <test_name>.out             # Test output logs
```

## Adding a New Functional Test

### Step 1: Create the Test Script

Create a new test script in `CI/tests/` following the naming pattern `test_<scenario>.sh`:

```bash
#!/bin/bash
set -xeEo pipefail

source CI/tests/common.sh

trap error ERR
trap finish EXIT

function functional_test_<your_scenario> {
  # Set environment variables for the scenario
  export scenario_type="<scenario_type>"
  export scenario_file="scenarios/kind/<scenario_file>.yml"
  export post_config=""

  # Generate config from template with variable substitution
  envsubst < CI/config/common_test_config.yaml > CI/config/<your_scenario>_config.yaml

  # Optional: View the generated config
  cat CI/config/<your_scenario>_config.yaml

  # Run kraken with coverage
  python3 -m coverage run -a run_kraken.py -c CI/config/<your_scenario>_config.yaml

  # Success message
  echo "<Your Scenario> scenario test: Success"

  # Optional: Verify expected state
  date
  kubectl get pods -n <namespace> -l <label>=<value> -o yaml
}

# Execute the test function
functional_test_<your_scenario>
```

### Step 2: Create or Reference Scenario File

Ensure your scenario YAML file exists in `scenarios/kind/`:

```yaml
# scenarios/kind/<your_scenario>.yml
- id: my-chaos-scenario
  config:
    namespace: default
    label_selector: app=myapp
    # ... scenario-specific configuration
```

### Step 3: Update GitHub Actions Workflow

If you want the test to run on pull requests, add it to `.github/workflows/tests.yml`:

```yaml
- name: Setup Pull Request Functional Tests
  if: github.event_name == 'pull_request'
  run: |
    # ... existing tests ...
    echo "test_<your_scenario>" >> ./CI/tests/functional_tests
```

## Functional Test Patterns

### Pattern 1: Simple Scenario Test

Tests a single scenario execution:

```bash
function functional_test_simple {
  export scenario_type="pod_disruption_scenarios"
  export scenario_file="scenarios/kind/pod_simple.yml"
  export post_config=""

  envsubst < CI/config/common_test_config.yaml > CI/config/simple_config.yaml
  python3 -m coverage run -a run_kraken.py -c CI/config/simple_config.yaml

  echo "Simple scenario test: Success"
}
```

### Pattern 2: Test with Setup/Teardown

Tests that require specific cluster state:

```bash
function functional_test_with_setup {
  # Setup: Deploy test workload
  kubectl apply -f CI/templates/test_workload.yaml
  kubectl wait --for=condition=ready pod -l app=test --timeout=300s

  # Run scenario
  export scenario_type="pod_disruption_scenarios"
  export scenario_file="scenarios/kind/pod_test.yml"
  envsubst < CI/config/common_test_config.yaml > CI/config/test_config.yaml
  python3 -m coverage run -a run_kraken.py -c CI/config/test_config.yaml

  # Verify state
  kubectl get pods -l app=test

  # Teardown
  kubectl delete -f CI/templates/test_workload.yaml

  echo "Test with setup: Success"
}
```

### Pattern 3: Multi-Step Scenario Test

Tests that run multiple related scenarios:

```bash
function functional_test_multi_step {
  # Step 1: Initial disruption
  export scenario_type="node_scenarios"
  export scenario_file="scenarios/kind/node_stop.yml"
  envsubst < CI/config/common_test_config.yaml > CI/config/node_config.yaml
  python3 -m coverage run -a run_kraken.py -c CI/config/node_config.yaml

  # Wait for recovery
  sleep 30

  # Step 2: Follow-up disruption
  export scenario_file="scenarios/kind/node_start.yml"
  envsubst < CI/config/common_test_config.yaml > CI/config/node_config.yaml
  python3 -m coverage run -a run_kraken.py -c CI/config/node_config.yaml

  echo "Multi-step scenario test: Success"
}
```

## Configuration Variables

The `common_test_config.yaml` uses environment variable substitution via `envsubst`. Common variables include:

- `$scenario_type`: The chaos scenario plugin type (e.g., `pod_disruption_scenarios`)
- `$scenario_file`: Path to the scenario YAML file
- `$post_config`: Additional post-scenario configuration

Example usage in config:

```yaml
kraken:
  chaos_scenarios:
    - $scenario_type:
        - $scenario_file
```

## Running Functional Tests

### Run All Functional Tests

```bash
./CI/run.sh
```

This will:
1. Create `CI/out/` directory for logs
2. Read test names from `CI/tests/functional_tests`
3. Execute each test via `CI/run_test.sh`
4. Generate results in `CI/results.markdown`

### Run a Single Functional Test

```bash
./CI/run_test.sh test_<your_scenario> CI/results.markdown
```

### View Test Results

```bash
cat CI/results.markdown
```

Example output:

```
Test                   | Result | Duration
-----------------------|--------|---------
test_pod              | Pass   | 0:2:15
test_your_scenario    | Pass   | 0:1:45
```

### View Test Logs

```bash
cat CI/out/test_<your_scenario>.out
```

## Error Handling

Functional tests use common error handling from `CI/tests/common.sh`:

```bash
trap error ERR    # Catches errors
trap finish EXIT  # Runs on script exit

# error() function handles exit codes:
# - Exit code 1: Error logged, test fails
# - Exit code 2: Expected exit, test passes (wraps to 0)
```

## Best Practices for Functional Tests

1. **Use `set -xeEo pipefail`**: Ensures errors are caught and commands are logged
2. **Source common.sh**: Always include `source CI/tests/common.sh` for error handling
3. **Set Traps**: Use `trap error ERR` and `trap finish EXIT`
4. **Verify State**: Check cluster state before and after scenarios
5. **Clear Success Messages**: Use descriptive success messages
6. **Coverage Integration**: Run kraken with `python3 -m coverage run -a`
7. **Resource Cleanup**: Clean up any resources created during the test
8. **Timeout Values**: Use appropriate timeout values for `kubectl wait` commands

## Example: Complete Functional Test

Here's a complete example combining all the concepts:

```bash
#!/bin/bash
set -xeEo pipefail

source CI/tests/common.sh

trap error ERR
trap finish EXIT

function functional_test_my_scenario {
  # Setup: Deploy test application
  echo "Setting up test workload..."
  kubectl create namespace test-namespace || true
  kubectl apply -f CI/templates/my_test_app.yaml
  kubectl wait --for=condition=ready pod -l app=my-test-app -n test-namespace --timeout=300s

  # Configure scenario
  export scenario_type="pod_disruption_scenarios"
  export scenario_file="scenarios/kind/my_scenario.yml"
  export post_config=""

  # Generate config
  envsubst < CI/config/common_test_config.yaml > CI/config/my_scenario_config.yaml

  # Optional: Display config for debugging
  echo "Generated configuration:"
  cat CI/config/my_scenario_config.yaml

  # Run kraken scenario
  echo "Running chaos scenario..."
  python3 -m coverage run -a run_kraken.py -c CI/config/my_scenario_config.yaml

  # Verify expected state
  echo "Verifying cluster state..."
  kubectl get pods -n test-namespace -l app=my-test-app

  # Cleanup
  echo "Cleaning up..."
  kubectl delete namespace test-namespace --wait=false

  # Success
  echo "My scenario test: Success"
  date
}

# Execute the test
functional_test_my_scenario
```

## Testing in CI

The GitHub Actions workflow (`.github/workflows/tests.yml`) runs functional tests:

1. **Pull Requests**: Runs a subset of quick tests
2. **Main Branch**: Runs all tests including integration scenarios

To add your test to CI:

```yaml
- name: Setup Pull Request Functional Tests
  run: |
    echo "test_my_scenario" >> ./CI/tests/functional_tests
```

## Debugging Failed Tests

When a functional test fails:

1. **Check the output log**: `cat CI/out/test_<name>.out`
2. **Review the results**: `cat CI/results.markdown`
3. **Check cluster state**: `kubectl get pods --all-namespaces`
4. **Review kraken logs**: Look for error messages in the output
5. **Verify configuration**: Ensure variables are properly substituted in generated config

## Summary

- **Unit Tests**: Located in `tests/`, use comprehensive mocking, require no external dependencies
- **Functional Tests**: Located in `CI/tests/`, run against real Kubernetes, test full scenarios
- **Test Execution**: Unit tests via `unittest`, functional tests via `CI/run.sh`
- **Coverage**: Both test types contribute to code coverage metrics
- **CI Integration**: All tests run automatically in GitHub Actions


