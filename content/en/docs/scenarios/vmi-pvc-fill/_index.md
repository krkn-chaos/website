---
title: VMI PVC Fill
description: Fills filesystem or block PVC storage attached to a KubeVirt VirtualMachineInstance
date: 2026-10-28
weight: 4
---

<krkn-hub-scenario id="vmi-pvc-fill">

VMI PVC Fill creates a temporary file on a PVC attached to a KubeVirt VirtualMachineInstance and removes it after the configured hold duration. It supports filesystem PVCs resolved through the VMI's launcher pod and block PVCs filled from inside the guest.

</krkn-hub-scenario>

## Choose a storage mode

- **Filesystem PVC:** the PVC is mounted as a filesystem in a pod. Krkn resolves the PVC mount and fills it through the pod. Guest SSH settings and `device_path` are not needed.
- **Block PVC:** the PVC is attached as a raw block device to the VMI. Krkn connects to the guest with `virtctl ssh`, formats the guest device only when requested, mounts it, fills it, and cleans up the temporary file.

## Prerequisites for block PVCs

- The VMI must be running and have the target PVC attached.
- `device_path` must be the guest device path, such as `/dev/vdb`, not a path from the virt-launcher pod.
- `virtctl ssh` must be able to connect to the guest using the configured username and private key. The matching public key must be authorized in the guest.
- The guest user must be able to run the needed storage commands with passwordless `sudo`.
- Set `format_device: true` only for a disposable data disk. Formatting erases existing data on the selected device. With formatting disabled, the device must already contain the configured filesystem.

## Configuration

```yaml
vmi_pvc_fill_scenario:
  vmi_name: my-vmi
  namespace: default
  pvc_name: my-vmi-data
  # Required for block PVCs; ignored for filesystem PVCs.
  device_path: /dev/vdb
  mount_path: /mnt/krkn-data
  filesystem: ext4
  fill_percentage: 50
  duration: 60
  format_device: false
  username: fedora
  # Path inside the krkn-hub container; mount the key there for block mode.
  identity_file: /home/krkn/.ssh/vmi-pvc-fill-key
  pod_name: ""
```

`fill_percentage` defaults to `50` when omitted or blank. It must be between `1` and `99` and above the filesystem's current utilization. Quoted numeric values such as `"50"` are accepted.

## Supported parameters

| Parameter | Description | Default |
|---|---|---|
| `vmi_name` | Target VMI. Required for block PVCs; may identify the launcher pod for filesystem PVCs. | `""` |
| `pvc_name` | PVC attached to the VMI or mounted by the target pod. | `""` |
| `pod_name` | Pod mounting a filesystem PVC when not resolving via VMI or PVC name. | `""` |
| `namespace` | Namespace containing the VMI, PVC, or pod. | `default` |
| `device_path` | Guest block-device path, such as `/dev/vdb`. | `""` |
| `mount_path` | Guest mount path for block mode. | `/mnt/krkn-data` |
| `filesystem` | Guest filesystem type: `ext4` or `xfs`. | `ext4` |
| `fill_percentage` | Target filesystem usage, 1–99 and above current utilization. | `50` |
| `duration` | Hold duration in seconds. | `60` |
| `format_device` | Format the block device before filling; destroys its existing data. | `false` |
| `username` | Guest SSH username for block mode. | `root` |
| `identity_file` | Private key path inside the container for block mode. | empty |

### Target selection

Set at least one of `vmi_name`, `pvc_name`, or `pod_name`. Block mode requires `vmi_name` and `device_path`; specify `pvc_name` when the VMI has multiple PVCs so the intended disk is selected. Filesystem mode can resolve the target using a VMI, PVC, or pod.

## How to run

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
