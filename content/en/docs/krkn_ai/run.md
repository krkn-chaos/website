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
  -c, --config TEXT                     Path to Krkn-AI config file.
  -o, --output TEXT                     Directory to save results.
  -f, --format [json|yaml]              Format of the output file.  [default: yaml]
  -r, --runner-type [krknctl|krknhub]   Type of chaos engine to use.
  -p, --param TEXT                      Additional parameters for config file in key=value format.
  -v, --verbose                         Increase verbosity of output.  [default: 0]
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

Each run creates a uniquely named subdirectory (UUID) inside the directory specified by `-o`. This ensures results from multiple runs never overwrite each other.

```
tmp/results/
└── <run-uuid>/
    ├── run.log                  # Main execution log for the entire run
    ├── results.json             # Full results summary in JSON format
    ├── krkn-ai.yaml             # Snapshot of the config used — useful for reproducing the run
    ├── reports/
    │   ├── health_check_report.csv   # Application health data collected across all scenarios
    │   ├── all.csv                   # Aggregated metrics for every scenario that was executed
    │   ├── best_scenarios.yaml       # Top-performing chaos scenarios identified by the algorithm
    │   └── graphs/                   # PNG visualizations of fitness scores per generation
    ├── yaml/
    │   ├── generation_0/        # Scenario YAML files for generation 0
    │   ├── generation_1/        # Scenario YAML files for generation 1
    │   └── ...
    └── logs/                    # Per-scenario execution logs
```

{{% alert title="Note" %}}
The output format for `results.json` and scenario YAML files can be switched using the `-f` flag. Use `-f json` to output all scenario files as JSON instead of YAML.
{{% /alert %}}
