---
title: Network Chaos API
description: >
weight : 1
date: 2017-01-05
---

## `AbstractNetworkChaosModule` abstract module class

All the plugins must implement the `AbstractNetworkChaosModule` abstract class in order to be instantiated and ran by the Netwok Chaos NG plugin.
This abstract class implements two main abstract methods:
- `run(self, target: str, kubecli: KrknTelemetryOpenshift, error_queue: queue.Queue = None)` is the entrypoint for each Network Chaos module.
If the module is configured to be run in parallel `error_queue` must not be None
    - `target`: param is the name of the resource (Pod, Node etc.) that will be targeted by the scenario
    - `kubecli`: the `KrknTelemetryOpenshift` needed by the scenario to access to the krkn-lib methods
    - `error_queue`: a queue that will be used by the plugin to push the errors raised during the execution of parallel modules
- `get_config(self) -> (NetworkChaosScenarioType, BaseNetworkChaosConfig)` returns the common subset of settings shared by all the scenarios `BaseNetworkChaosConfig` and the type of Network Chaos Scenario that is running (Pod Scenario or Node Scenario)

## `BaseNetworkChaosConfig` base module configuration

Is the base class that contains the common parameters shared by all the Network Chaos NG modules.

- `id` is the string name of the Network Chaos NG module
- `wait_duration` if there is more than one network module config in the same config file, the plugin will wait `wait_duration` seconds before running the following one
- `test_duration` the duration in seconds of the scenario
- `label_selector` the selector used to target the resource
- `instance_count` if greater than 0 picks `instance_count` elements from the targets selected by the filters randomly
- `execution` if more than one target are selected by the selector the scenario can target the resources both in `serial` or `parallel`.
- `namespace` the namespace were the scenario workloads will be deployed