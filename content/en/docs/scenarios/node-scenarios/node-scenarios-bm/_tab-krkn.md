
Example scenario file: [baremetal_node_scenarios.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/baremetal_node_scenarios.yml)

### Configuration

For baremetal, set `cloud_type: bm` and provide IPMI credentials either at the root of the scenario entry (`bmc_user` / `bmc_password`) or per-machine inside `bmc_info`. If `bmc_addr` is omitted, Krkn falls back to the BMC value found on the matching `BareMetalHost` (`oc get bmh -o wide --all-namespaces`).

```yaml
node_scenarios:
  - actions:
      - node_stop_start_scenario           # any action listed on the parent Node Scenarios page
    label_selector: node-role.kubernetes.io/worker
    instance_count: 1
    runs: 1
    timeout: 360
    duration: 120
    parallel: false
    cloud_type: bm
    kube_check: true
    bmc_user: defaultuser                  # default IPMI user; optional if every machine sets its own
    bmc_password: defaultpass              # default IPMI password; optional if every machine sets its own
    bmc_info:                              # per-machine overrides (optional)
      node-1:
        bmc_addr: mgmt-machine1.example.com
      node-2:
        bmc_addr: mgmt-machine2.example.com
        bmc_user: user
        bmc_password: pass
```

For the full set of node-scenario fields shared with other cloud providers (actions, node_name, label_selector, instance_count, etc.) see the [parent Node Scenarios page](../_index.md).

### Baremetal-specific fields

- `cloud_type` — must be `bm`.
- `bmc_user`, `bmc_password` — default IPMI credentials. May also be supplied via environment variables (`BMC_USER`, `BMC_PASSWORD`) — Krkn falls back to env when the YAML keys are absent.
- `bmc_info` — per-machine overrides keyed by node name. Each entry accepts `bmc_addr`, `bmc_user`, `bmc_password`, and (for `node_disk_detach_attach_scenario`) a `disks` list.
- For `node_disk_detach_attach_scenario`, `bmc_info.<node>.disks` is required and `bmc_addr` is **not** used.

### Disk detach / attach

```yaml
node_scenarios:
  - actions:
      - node_disk_detach_attach_scenario
    node_name: node-1
    instance_count: 1
    runs: 1
    timeout: 360
    duration: 120
    parallel: false
    cloud_type: bm
    bmc_info:
      node-1:
        disks: ["sda", "sdb"]
```

### Usage

Enable baremetal node scenarios by adding the YAML file under `node_scenarios` in your kraken config:

```yaml
kraken:
    chaos_scenarios:
        - node_scenarios:
            - scenarios/openshift/baremetal_node_scenarios.yml
```

{{% alert title="Note" %}}
Baremetal requires `oc` (OpenShift client) installed on the host running Krkn. Some node actions can occasionally corrupt the filesystem if the node does not shut down cleanly — keep recovery procedures handy.
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
