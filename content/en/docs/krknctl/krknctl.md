---
title: Usage
weight: 1
---


## Commands:
Commands are grouped by action and may include one or more subcommands to further define the specific action.

### `list <subcommand>`:

- #### `available`:
    Builds a list of all the available scenarios in krkn-hub

    ```% krknctl list available ```

    | Name | Size | Digest | Last Modified | 
    | -------- | --- | ------- | --------- |
    | network-chaos | ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | service-disruption-scenarios | ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | node-memory-hog | ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | application-outages | ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | node-cpu-hog| ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | time-scenarios | **  | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | node-scenarios| ** |sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | service-hijacking| ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | pvc-scenarios | **  | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | chaos-recommender| ** | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | syn-flood | **  | sha256:** | 2025-01-01 00:00:00+0000 +0000 |
    | container-scenarios| ** | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | pod-network-chaos| ** | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | pod-scenarios | **  | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | node-io-hog | **  | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | power-outages | **  | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | zone-outages| ** | sha256:** |  2025-01-01 00:00:00+0000 +0000 |
    | dummy-scenario | **  |  sha256:** |  2025-01-01 00:00:00+0000 +0000 |



- #### `running`:
    Builds a list of all the scenarios currently running in the system. The scenarios are filtered based on the tool's naming conventions.

<br/>

### `describe <scenario name>`:
Describes the specified scenario giving to the user an overview of what are the actions that the scenario will perform on
the target system. It will also show all the available flags that the scenario will accept as input to modify the behaviour 
of the scenario.

<br/>

### `run <scenario name> [flags]`:
Will run the selected scenarios with the specified options

{{% alert title="Tip" %}}
Because the kubeconfig file may reference external certificates stored on the filesystem, 
which won't be accessible once mounted inside the container, it will be automatically 
copied to the directory where the tool is executed. During this process, the kubeconfig
will be flattened by encoding the certificates in base64 and inlining them directly into the file.
{{% /alert %}}

{{% alert title="Tip" %}}
if you want interrupt the scenario while running in attached mode simply hit `CTRL+C` the
container will be killed and the scenario interrupted immediately
{{% /alert %}}

__Common flags:__

| Flag              | Description                                                  |
|-------------------|--------------------------------------------------------------|
| --kubeconfig      | kubeconfig path (if empty will default to ~/.kube/config)    |
| --detached        | will run the scenario in detached mode (background) will <br/>be possible to reattach the tool to the container logs with the attach command |
| --alerts-profile  | will mount in the container a custom alert profile <br/>(check krkn [documentation](https://github.com/krkn-chaos/krkn) for further infos) |
| --metrics-profile | will mount in the container scenario a custom metrics<br/> profile (check krkn [documentation](https://github.com/krkn-chaos/krkn) for further infos) |

<br/>

### `graph <subcommand>`:
In addition to running individual scenarios, the tool can also orchestrate 
multiple scenarios in serial, parallel, or mixed execution by utilizing a 
scenario dependency graph resolution algorithm.

- #### `scaffold <scenario names> [flags]`:

Scaffolds a basic execution plan structure in json format for all the scenario names provided.
The default structure is a serial execution with a root node and each node depends on the 
other starting from the root. Starting from this configuration it is possible to define complex 
scenarios changing the dependencies between the nodes.
Will be provided a random id for each scenario and the dependency will be defined through the 
`depends_on` attribute. The scenario id is not strictly dependent on the scenario type so it's 
perfectly legit to repeat the same scenario type (with the same or different attributes) varying the
scenario Id and the dependencies accordingly.
```
./krknctl graph scaffold node-cpu-hog node-memory-hog node-io-hog service-hijacking node-cpu-hog > plan.json
```
will generate an execution plan (serial) containing all the available options for each of the scenarios mentioned with default values
when defined, or a description of the content expected for the field.

{{% alert title="Note" %}}
Any graph configuration is supported except cycles (self dependencies or transitive)
{{% /alert %}}

##### Supported flags:
| Flag              | Description                                                  |
|-------------------|--------------------------------------------------------------|
| --global-env      | if set this flag will add global environment variables to each scenario in the graph|


- #### `run <json execution plan path> [flags]`:

It will display the resolved dependency graph, detailing all the scenarios executed at each dependency step, and will instruct 
the container runtime to execute the krkn scenarios accordingly.

{{% alert title="Note" %}}
Since multiple scenarios can be executed within a single running plan, the output is redirected 
to files in the directory where the command is run. These files are named using the following 
format: krknctl-<scenario-name>-<scenario-id>-<timestamp>.log.
{{% /alert %}}


#### Supported flags:

| Flag              | Description                                                  |
|-------------------|--------------------------------------------------------------|
| --kubeconfig      | kubeconfig path (if empty will default to ~/.kube/config)    |
| --alerts-profile  | will mount in the container a custom alert profile <br/>(check krkn [documentation](https://github.com/krkn-chaos/krkn) for further infos)|
| --metrics-profile | will mount in the container scenario a custom metrics <br/>profile (check krkn [documentation](https://github.com/krkn-chaos/krkn) for further infos)|
| --exit-on-error   | if set this flag will the workflow will be interrupted and the tool will exit with a status greater than 0 |


#### Supported graph configurations:
![Execution Plans](images/execution-plans.jpg)
##### Serial execution:
All the nodes depend on each other building a chain, the execution will start from the last item of the chain.

##### Mixed execution:
The graph is structured in different "layers" so the execution will happen step-by-step executing all the scenarios of the
step in parallel and waiting the end

##### Parallel execution:
To achieve full parallel execution, where each step can run concurrently (if it involves multiple scenarios), 
the approach is to use a root scenario as the entry point, with several other scenarios dependent on it. 
While we could have implemented a completely new command to handle this, doing so would have introduced additional
code to support what is essentially a specific case of graph execution.

Instead, we developed a scenario called `dummy-scenario`. This scenario performs no actual actions but simply pauses 
for a set duration. It serves as an ideal root node, allowing all dependent nodes to execute in parallel without adding 
unnecessary complexity to the codebase.


### `random <subcommand>`
Random orchestration can be used to test parallel scenario generating random graphs from a set of preconfigured scenarios.
Differently from the graph command, the scenarios in the json plan don't have dependencies between them since the dependencies
are generated at runtime.
This is might be also helpful to run multiple chaos scenarios at large scale.


- #### `scaffold <scenario names> [flags]`

Will create the structure for a random plan execution, so without any dependency between the scenarios. Once properly configured this can
be used as a `seed` to generate large test plans for large scale tests.
This subcommand supports base scaffolding mode by allowing users to specify desired scenario names or generate a plan file of any size using pre-configured scenarios as a template (or seed). This mode is extensively covered in the [scale testing](scale-testing.md) section.



##### Supported flags:
| Flag              | Description                                                  |
|-------------------|--------------------------------------------------------------|
| --global-env      | if set this flag will add global environment variables to each scenario in the graph |
| --number-of-scenarios | the number of scenarios that will be created from the template file |
| --seed-file | template file with already configured scenarios used to generate the random test plan |

- #### `run <json execution plan path> [flags]`

##### Supported flags:
| Flag              | Description                                                  |
|-------------------|--------------------------------------------------------------|
| --alerts-profile  | custom alerts profile file path |
| --exit-on-error   | if set this flag will the workflow will be interrupted and the tool will exit with a status greater than 0 |
| --graph-dump      | specifies the name of the file where the randomly generated dependency graph will be persisted |
| --kubeconfig      | kubeconfig path (if not set will default to ~/.kube/config) |
| --max-parallel    | maximum number of parallel scenarios |
| --metrics-profile | custom metrics profile file path |
| --number-of-scenarios | allows you to specify the number of elements to select from the execution plan |


### `attach <scenario ID>`:
If a scenario has been executed in detached mode or through a graph plan and you want to attach to the container
standard output this command comes into help.

{{% alert title="Tip" %}}
to interrupt the output hit `CTRL+C`, this won't interrupt the container, but only the output 
{{% /alert %}}

{{% alert title="Tip" %}}
if shell completion is enabled, pressing TAB twice will display a list of running 
containers along with their respective IDs, helping you select the correct one.
{{% /alert %}}

<br/>

### `clean`:
will remove all the krkn containers from the container runtime, will delete all the kubeconfig files
and logfiles created by the tool in the current folder.

### `query-status <container Id or Name> [--graph <graph file path>]`:

The tool will query the container platform to retrieve information about a container by its name or ID if the `--graph` 
flag is not provided. If the `--graph` flag is set, it will instead query the status of all container names 
listed in the graph file. When a single container name or ID is specified, 
the tool will exit with the same status as that container.

{{% alert title="Tip" %}}
This function can be integrated into CI/CD pipelines to halt execution if the chaos run encounters any failure.
{{% /alert %}}

### Running krknctl on a disconnected environment with a private registry

If you're using krknctl in a disconnected environment, you can mirror the desired krkn-hub images to your private registry and configure krknctl to use that registry as the backend. Krknctl supports this through global flags or environment variables.

#### Private registry global flags

| Flag | Environment Variable | Description |
| -------------  | ------------ | ----------- |
|--private-registry |  KRKNCTL_PRIVATE_REGISTRY |  private registry URI (eg. quay.io, without any protocol schema prefix) |
|--private-registry-insecure | KRKNCTL_PRIVATE_REGISTRY_INSECURE | uses plain HTTP instead of TLS |
|--private-registry-password | KRKNCTL_PRIVATE_REGISTRY_PASSWORD |  private registry password for basic authentication |
|--private-registry-scenarios | KRKNCTL_PRIVATE_REGISTRY_SCENARIOS |  private registry krkn scenarios image repository |
|--private-registry-skip-tls | KRKNCTL_PRIVATE_REGISTRY_SKIP_TLS | skips tls verification on private registry |
|--private-registry-token |  KRKNCTL_PRIVATE_REGISTRY_TOKEN |      private registry identity token for token based authentication|
|-private-registry-username |  KRKNCTL_PRIVATE_REGISTRY_USERNAME |   private registry username for basic authentication |


{{% alert title="Note" %}}
Not all options are available on every platform due to limitations in the container runtime platform SDK:
##### Podman
Token authentication is not supported
##### Docker 
Skip TLS verfication cannot be done by CLI, docker daemon needs to be configured on that purpose please follow the [documentation](https://www.baeldung.com/ops/pull-docker-image-insecure-registry)
{{% /alert %}}


#### Example: Running krknctl on quay.io private registry
{{% alert title="Note" %}}
This example will run only on Docker since the token authentication is not yet implemented on the podman SDK
{{% /alert %}}

I will use for that example an invented private registry on quay.io: `my-quay-user/krkn-hub`

- mirror some krkn-hub scenarios on a private registry on quay.io

- obtain the quay.io token with cURL:

```
curl -s -X GET \
  --user 'user:password' \
  "https://quay.io/v2/auth?service=quay.io&scope=repository:my-quay-user/krkn-hub:pull,push" \
  -k | jq -r '.token'
```

- run krknctl with the private registry flags:

```
krknctl \ 
--private-registry quay.io \
--private-registry-scenarios my-quay-user/krkn-hub \
--private-registry-token <your token obtained in the previous step> \
list available
```

- your images should be listed on the console

{{% alert title="Note" %}}
To make krknctl commands more concise, it's more convenient to export the corresponding environment variables instead of prepending flags to every command. The relevant variables are:
- KRKNCTL_PRIVATE_REGISTRY
- KRKNCTL_PRIVATE_REGISTRY_SCENARIOS
- KRKNCTL_PRIVATE_REGISTRY_TOKEN
{{% /alert %}}