---
title: Run Krkn-AI
description: Execute automated resilience and chaos testing using the Krkn-AI run command.
weight: 3
---

The `run` command executes automated resilience and chaos testing using Krkn-AI. It initializes a random population samples containing Chaos Experiments based on your Krkn-AI configuration file, then starts the [evolutionary algorithm](./config/evolutionary_algorithm.md) to run the experiments, gather feedback, and continue evolving existing scenarios until stopping criteria is met.

### CLI Usage

```bash
$ uv run krkn_ai run --help
Usage: krkn_ai run [OPTIONS]

  Run Krkn-AI tests

Options:
  -k, --kubeconfig TEXT                 Path to cluster kubeconfig file. Overrides value in config file.
  -c, --config TEXT                     Path to Krkn-AI config file.
  -o, --output TEXT                     Directory to save results.
  -f, --format [json|yaml]              Format of the output file.  [default: yaml]
  -r, --runner-type [krknctl|krknhub]   Type of chaos engine to use.
  -p, --param TEXT                      Additional parameters for config file in key=value format.
  -s, --seed INTEGER                    Random seed for reproducible runs. Overrides seed in config file.
  -v, --verbose                         Increase verbosity of output.  [default: 0]
  -m, --monitoring                      Launch live monitoring dashboard in the background.
  --port INTEGER                        Port to run Streamlit server on when monitoring is enabled.  [default: 8501]
  --help                                Show this message and exit.
```

### Example

The following command runs Krkn-AI with verbose output (`-vv`), specifies the configuration file (`-c`), sets the output directory for results (`-o`), and passes an additional parameter (`-p`) to override the HOST variable in the config file:

```bash
$ uv run krkn_ai run -vv -c ./krkn-ai.yaml -o ./tmp/results/ -p HOST=$HOST
```

By default, Krkn-AI uses [krknctl](../krknctl/) as engine. You can switch to [krknhub](../krkn-hub.md) by using the following flag:

```bash
$ uv run krkn_ai run -r krknhub -c ./krkn-ai.yaml -o ./tmp/results/
```

### Output Structure

Each run creates a UUID-named subdirectory under the path passed to `-o`, so multiple runs don't overwrite each other.

```text
tmp/results/
└── <run-uuid>/
    ├── krkn-ai.yaml         # config snapshot (useful for re-running)
    ├── reports/
    │   ├── health_check_report.csv  # app health across scenarios
    │   ├── all.csv                  # metrics for every scenario
    │   ├── best_scenarios.yaml      # top scenarios found by the algorithm
    │   └── graphs/                  # per-scenario PNG plots
    ├── yaml/
    │   ├── generation_0/    # scenario files for gen 0
    │   ├── generation_1/    # scenario files for gen 1
    │   └── ...
    └── log/                 # per-scenario logs
```
