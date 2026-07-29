---
type: "docs/scenarios"
title: Standalone Mode
description: Run chaos experiments on bare-metal, RHEL, and VM hosts without Kubernetes
date: 2017-01-04
weight: 12
---

Standalone mode lets krkn run chaos experiments on any Linux host reachable via SSH — no Kubernetes or OpenShift required. Use it for bare-metal servers, RHEL/CentOS VMs, VMware-to-KVM migrations, hyperconverged infrastructure, or any environment where you need to validate host resilience outside a container orchestrator.

## Architecture

The krkn controller machine connects to one or more target hosts over SSH using key-based authentication. All chaos operations (reboots, CPU stress, disk fill, network faults, time skew, file corruption) are executed remotely via paramiko SSH. No agent or daemon is installed on the target hosts.

```
   Controller (krkn)
        |
        | SSH (paramiko)
        |
   +----+----+----+
   |    |    |    |
 Host  Host Host Host
  A     B    C    D
```

The controller orchestrates all scenario execution, health checks, and rollback from a single machine. Target hosts only need an SSH server and the standard Linux utilities used by each scenario.

## Prerequisites

- Python 3.11+ on the controller machine
- SSH key-based access to all target hosts (password authentication is not supported)
- root or sudo access on target hosts (most scenarios require privileged operations)
- `stress-ng` installed on target hosts (required for hog and IO scenarios)
- Target hosts must be Linux (RHEL, CentOS, Ubuntu, Fedora, etc.)

## Configuration

Set `execution_mode: standalone` in your config file to skip Kubernetes API initialization and operate purely over SSH.

```yaml
kraken:
    execution_mode: standalone
    kubeconfig_path:        # Leave empty for standalone
    exit_on_failure: False
    chaos_scenarios:
        - node_scenarios:
            - scenarios/standalone/ssh_node_reboot.yml
        - hog_scenarios:
            - scenarios/standalone/hog_cpu.yml
        - network_chaos_scenarios:
            - scenarios/standalone/network_chaos_latency.yml
        - time_scenarios:
            - scenarios/standalone/time_skew.yml
        - standalone_disk_fill_scenarios:
            - scenarios/standalone/disk_fill.yml
        - standalone_file_scenarios:
            - scenarios/standalone/file_chmod.yml
```

{{% alert title="Note" %}}
`execution_mode: standalone` is the key setting. When set, krkn skips Kubernetes API initialization and operates purely over SSH. You do not need a kubeconfig or access to any cluster.
{{% /alert %}}

## SSH Configuration Reference

All standalone scenarios share these SSH parameters in their scenario YAML files:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ssh_user` | string | `root` | SSH username on target hosts |
| `ssh_private_key` | string | `~/.ssh/id_rsa` | Path to SSH private key |
| `ssh_port` | int | `22` | SSH port on target hosts |
| `ssh_connect_timeout` | int | `30` | Connection timeout in seconds |
| `targets` | list | required | List of target host IPs or hostnames |

## Supported Scenarios

### Node Scenarios (cloud_type: ssh)

Use `cloud_type: ssh` in the node scenario config to run node-level chaos over SSH. Supported actions:

- `node_reboot_scenario` — Hard or soft reboot via SSH (sysrq trigger or `sudo reboot`)
- `node_stop_scenario` — Graceful shutdown via `sudo shutdown -h now`
- `node_crash_scenario` — Kernel crash via sysrq trigger
- `stop_kubelet_scenario` — Stop kubelet service (if present on the host)
- `restart_kubelet_scenario` — Restart kubelet service (if present on the host)

{{% alert title="Note" %}}
`node_start_scenario` and `node_termination_scenario` are NOT supported via SSH. These actions require cloud provider APIs to power on or destroy instances.
{{% /alert %}}

Sample scenario file:

```yaml
node_scenarios:
  - actions:
      - node_reboot_scenario
    cloud_type: ssh
    targets:
      - 192.168.1.100
      - 192.168.1.101
    ssh_user: root
    ssh_private_key: ~/.ssh/id_rsa
    ssh_port: 22
    runs: 1
    timeout: 360
    kube_check: false
    soft_reboot: true
```

### Network Chaos

SSH-based network chaos using `tc` and `netem`. Injects latency, packet loss, and bandwidth restrictions on target hosts.

Sample scenario file:

```yaml
network_chaos:
  targets:
    - 192.168.1.100
  ssh_user: root
  ssh_private_key: ~/.ssh/id_rsa
  duration: 300
  interfaces: []
  execution: serial
  egress:
    latency: 100ms
```

### CPU/Memory/IO Hog

Deploys `stress-ng` workloads on target hosts via SSH. Supports CPU, memory, and IO stress types.

Sample scenario file:

```yaml
hog-type: cpu
targets:
  - 192.168.1.100
ssh_user: root
ssh_private_key: ~/.ssh/id_rsa
duration: 300
workers: 0
cpu-load-percentage: 90
```

### Time Skew

Skews system time on remote hosts via SSH. Useful for testing time-sensitive applications, certificate validation, and scheduled job behavior.

Sample scenario file:

```yaml
time_scenarios:
  - action: skew_time
    targets:
      - 192.168.1.100
    ssh_user: root
    ssh_private_key: ~/.ssh/id_rsa
    duration: 300
    disable_ntp: true
```

### Disk Fill (Standalone-Only)

Fills disk space on target hosts to a specified percentage or absolute size. Uses `fallocate` with `dd` fallback for compatibility across distributions.

Scenario type: `standalone_disk_fill_scenarios`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | list | required | List of target host IPs |
| `fill_path` | string | `/tmp` | Path to fill on target hosts |
| `fill_size` | string | | Absolute size to fill (e.g., `5G`, `500M`) |
| `fill_percentage` | int | | Fill disk to this percentage |
| `duration` | int | `60` | How long to keep the fill active (seconds) |

{{% alert title="Note" %}}
Either `fill_size` or `fill_percentage` is required. If both are provided, `fill_size` takes precedence.
{{% /alert %}}

Sample scenario file:

```yaml
targets:
  - 192.168.1.100
ssh_user: root
ssh_private_key: ~/.ssh/id_rsa
fill_path: /tmp
fill_percentage: 90
duration: 120
```

### File Chaos (Standalone-Only)

Manipulates files on remote hosts to simulate configuration corruption, permission changes, file deletion, and content injection.

Scenario type: `standalone_file_scenarios`

Supported actions: `chmod`, `rename`, `append`, `delete`

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | list | Target host IPs |
| `action` | string | One of: `chmod`, `rename`, `append`, `delete` |
| `file_path` | string | Path to the target file |
| `permissions` | string | New permissions for `chmod` action (e.g., `000`) |
| `target_path` | string | Destination path for `rename` action |
| `content` | string | Content to inject for `append` action |
| `count` | int | Number of lines to append (`append` action only) |
| `duration` | int | Seconds before automatic revert (0 = no revert) |

All actions (including `append`) are automatically reverted when `duration > 0`. When `duration` is `0`, no revert occurs for any action.

Sample scenario file:

```yaml
targets:
  - 192.168.1.100
ssh_user: root
ssh_private_key: ~/.ssh/id_rsa
action: chmod
file_path: /etc/nginx/nginx.conf
permissions: "000"
duration: 60
```

## Health Check Plugin

Standalone mode includes an SSH-based health check plugin that monitors target hosts during chaos experiments. Unlike the Kubernetes-based Cerberus health checks, this plugin connects directly to target hosts over SSH to verify service availability and host health.

Configure it in your `config.yaml`:

```yaml
standalone_health_checks:
  interval: 5
  ssh_user: root
  ssh_private_key: ~/.ssh/id_rsa
  ssh_port: 22
  config:
    - host: 192.168.1.100
      exit_on_failure: true
      checks:
        - type: tcp
          port: 8080
        - type: process
          name: nginx
        - type: http
          url: http://192.168.1.100:8080/health
        - type: host_metrics
        - type: command
          cmd: systemctl is-active myapp
```

### Supported Check Types

| Type | Description |
|------|-------------|
| `tcp` | Tests TCP connectivity to a port |
| `process` | Verifies a process is running (via `pgrep`) |
| `http` | Sends HTTP GET and checks for 200 response |
| `host_metrics` | Collects CPU load, memory, and disk usage |
| `command` | Runs an allowed command and checks exit code |

The `command` check type restricts commands to a safe allowlist: `systemctl status/is-active`, `pgrep`, `pidof`, `test`, `cat /proc/loadavg`, `uptime`, `df`, `free`, `who`, `ss`, `ip`.

## How to Run Standalone Scenarios

Choose your preferred method to run standalone scenarios:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
