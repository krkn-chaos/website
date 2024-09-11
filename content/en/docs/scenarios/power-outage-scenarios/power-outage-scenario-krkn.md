---
title: Power Outage Scenario using Krkn
description: 
date: 2017-01-04
weight: 2
---
Power Outage/ Cluster shut down scenario can be injected by placing the shut_down config file under cluster_shut_down_scenario option in the kraken config. Refer to [cluster_shut_down_scenario](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/cluster_shut_down_scenario.yml) config file.

Refer to [cloud setup](/docs/scenarios/cloud_setup.md) to configure your cli properly for the cloud provider of the cluster you want to shut down.

Current accepted cloud types:
* [Azure](/docs/scenarios/cloud_setup.md#azure)
* [GCP](/docs/scenarios/cloud_setup.md#gcp)
* [AWS](/docs/scenarios/cloud_setup.md#aws)
* [Openstack](/docs/scenarios/cloud_setup.md#openstack)


```yaml
cluster_shut_down_scenario:                          # Scenario to stop all the nodes for specified duration and restart the nodes.
  runs: 1                                            # Number of times to execute the cluster_shut_down scenario.
  shut_down_duration: 120                            # Duration in seconds to shut down the cluster.
  cloud_type: aws                                    # Cloud type on which Kubernetes/OpenShift runs.