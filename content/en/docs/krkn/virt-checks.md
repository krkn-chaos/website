---
title: Kube Virt Checks
description: Kube Virt Checks to analyze down times of VMIs
weight: 2
---

### Kube Virt Checks

Virt checks provide real-time visibility into the impact of chaos scenarios on VMI ssh connectivity and performance.
Virt checks are configured in the ```config.yaml``` [here](config.md#virt-checks)

The system periodically checks the VMI's in the provided namespace based on the defined interval and records the results in Telemetry. The checks will run continuously from the very beginning of krkn until all scenarios are done and wait durations are complete. The telemetry data includes:

- Success status ```True``` when the VMI is up and running and can form an ssh connection
- Failure response ```False``` if the VMI experiences downtime or errors.
- The VMI Name
- The VMI Namespace
- The VMI Ip Address and a New IP Address if the VMI is deleted
- The time of the start and end of the specific status 
- The duration the VMI had the specific status
- The node the VMI is running on

This helps users quickly identify VMI issues and take necessary actions.

### Additional Installation of VirtCtl (If running using Krkn)
It is required to have virtctl or an ssh connection via a bastion host to be able to run this option. We don't recommend using the `krew` installation type. 
This is only required if you are running locally with python Krkn version, the virtctl command will be automatically installed in the krkn-hub and krknctl images 

See virtctl installer guide from [KubeVirt](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/)
```bash
VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
ARCH=$(uname -s | tr A-Z a-z)-$(uname -m | sed 's/x86_64/amd64/') || windows-amd64.exe
echo ${ARCH}
curl -L -o virtctl https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-${ARCH}
chmod +x virtctl
sudo install virtctl /usr/local/bin
```

#### Sample health check config
```
kubevirt_checks:                                      # Utilizing virt check endpoints to observe ssh ability to VMI's during chaos injection.
    interval: 2                                       # Interval in seconds to perform virt checks, default value is 2 seconds, required
    namespace: runner                                 # Regex Namespace where to find VMI's, required for checks to be enabled
    name: "^windows-vm-.$"                            # Regex Name style of VMI's to watch, optional, if left blank will find all names in namespace
    only_failures: False                              # Boolean of whether to show all VMI's failures and successful ssh connection (False), or only failure status' (True) 
    disconnected: False                               # Boolean of how to try to connect to the VMIs; if True will use the ip_address to try ssh from within a node, if false will use the name and uses virtctl to try to connect  
    ssh_node: ""                                      # If set, will be a backup way to ssh to a node. Will want to set to a node that isn't targeted in chaos
    node_names: ""                                    # List of node names to further filter down the VM's, will only watch VMs with matching name in the given namespace that are running on node. Can put multiple by separating by a comma
    exit_on_failure:                                        # If value is True and VMI's are failing post chaos returns failure, values can be True/False
```

##### Disconnected Environment
The disconnected variable set in the config bypasses the kube-apiserver and SSH's directly to the worker nodes to test SSH connection to the VM's IP address.

When using `disconnected: true`, you must configure SSH authentication to the worker nodes. This requires passing your SSH private key to the container.

**Configuration:**
```yaml
disconnected: True                               # Boolean of how to try to connect to the VMIs; if True will use the ip_address to try ssh from within a node, if false will use the name and uses virtctl to try to connect
```

**SSH Key Setup for krkn-hub or krknctl:**

You need to mount your SSH private and/or public key into the container to enable SSH connection to the worker nodes. Pass the `id_rsa` variable with the path to your SSH keys:

```bash
# Example with krknctl
krknctl run --config config.yaml -e id_rsa=/path/to/your/id_rsa

# Example with krkn-hub
podman run --name=<container_name> --net=host \
  -v /path/to/your/id_rsa:/home/krkn/.ssh/id_rsa:Z \. # do not change path on right of colon
  -v /path/to/your/id_rsa.pub:/home/krkn/.ssh/id_rsa.pub:Z \. # do not change path on right of colon
  -v /path/to/config.yaml:/root/kraken/config/config.yaml:Z \
  -d quay.io/krkn-chaos/krkn-hub:<scenario_type>
```

**Note:** Ensure your SSH key has appropriate permissions (`chmod 644 id_rsa`) and matches the key authorized on your worker nodes.


#### Post Virt Checks
After all scenarios have finished executing, krkn will perform a final check on the VMs matching the specified namespace and name. It will attempt to reach each VM and provide a list of any that are still unreachable at the end of the run. The list can be seen in the telemetry details at the end of the run. 


#### Sample virt check telemetry
Notice here that the vm with name windows-vm-1 had a false status (not able to form an ssh connection), for the first 37 seconds (the first item in the list). And at the end of the run the vm was able to for the ssh connection and reports true status for 41 seconds. While the vm with name windows-vm-0 has a true status the whole length of the chaos run (~88 seconds).


```
"virt_checks": [
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-1",
          "ip_address": "0.0.0.0",
          "status": false,
          "start_timestamp": "2025-07-22T13:41:53.461951",
          "end_timestamp": "2025-07-22T13:42:30.696498",
          "duration": 37.234547,
          "new_ip_address": "0.0.0.2",
      },
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-0",
          "ip_address": "0.0.0.1",
          "status": true,
          "start_timestamp": "2025-07-22T13:41:49.346861",
          "end_timestamp": "2025-07-22T13:43:17.949613",
          "duration": 88.602752,
          "new_ip_address": ""
      },
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-1",
          "ip_address": "0.0.0.2",
          "status": true,
          "start_timestamp": "2025-07-22T13:42:36.260780",
          "end_timestamp": "2025-07-22T13:43:17.949613",
          "duration": 41.688833,
          "new_ip_address": ""
      }
  ],
"post_virt_checks": [
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-4",
          "ip_address": "0.0.0.3",
          "status": false,
          "start_timestamp": "2025-07-22T13:43:30.461951",
          "end_timestamp": "2025-07-22T13:43:30.461951",
          "duration": 0.0,
          "new_ip_address": "",
      }
]
```