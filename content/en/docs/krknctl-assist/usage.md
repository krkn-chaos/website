---
title: Usage
weight: 1
---

## Start the assistant

Run the interactive assist:

```bash
krknctl-assist
```
Wait for the health checks to pass.


## Ask a question

Use a plain-language request to describe the scenario you want to run.

```text
> Block a pod's outgoing MySQL and PostgreSQL traffic to disrupt aurora database connections
⏱️  Response time: 0.37s

⚡ AI assist Response

Scenario: aurora-disruption


🧭 matched scenario context: aurora-disruption

Aurora Disruption Scenario
This  scenario  blocks  a  pod's  outgoing  MySQL  and PostgreSQL
traffic,  effectively  preventing  it  from connecting to any AWS
Aurora  SQL  engine. It works just as well for standard MySQL and
PostgreSQL connections too.

Suggested command: krknctl run pod-network-filter \

📋 fetching runnable details for scenario: pod-network-filter

Pod Network Filter
This  scenario  will  create  iptables rules on the target pod to
block   incoming/outgoing   traffic   on   specified   ports  and
interfaces.

Name               Type     Description                                                                          Required  Default
--chaos-duration   number   Chaos Duration                                                                       false     60
--pod-selector     string   Pod Selector                                                                         false
--pod-name         string   Pod Name                                                                             false
--namespace        string   Namespace                                                                            false     default
--instance-count   number   Number of instances to target                                                        false     1
--execution        enum     Execution mode                                                                       false
--ingress          boolean  Filter incoming traffic                                                              true
--egress           boolean  Filter outgoing traffic                                                              true
--interfaces       string   Network interfaces to filter outgoing traffic (if more than one separated by comma)  false
--ports            string   Network ports to filter traffic (if more than one separated by comma)                true
--image            string   The network chaos injection workload container image                                 false     quay.io/krkn-chaos/krkn-network-chaos:latest
--protocols        string   The network protocols that will be filtered                                          false     tcp
--taints           string   The list of tolerations that can be assigned to the network filter workload          false
--service-account  string   The service account associated with the Node Pod Filter workload                     false

? Do you want to run the scenario?? [y/N]
```
Once a scenario is surfaced, the rest of the flow is the normal `krknctl` run path: review the runnable details, confirm the prompt, and execute the scenario with the shown flags.

## Exit

Type `exit` to stop the interactive session.
