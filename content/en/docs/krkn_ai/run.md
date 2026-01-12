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
