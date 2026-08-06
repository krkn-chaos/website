
```bash
krknctl run kubevirt-outage [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
| Parameter      | Description    | Type      | Required |  Default | Possible Values | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ | :----------------:  | 
`--namespace` | VMI Namespace to target | string | Yes | default | 
`--vm-name` | Name of the VM to delete | string | Yes | | 
`--timeout` | Time that scenario will wait for VM to come back | number | No | 60 | 
`--kill-count` | Number of VMI's to kill (will perform serially) | number | No | 1| 

#### Behavior Notes

- **VM recovery:** After krkn deletes the VM, the KubeVirt controller automatically recreates the VMI unless `runStrategy` is set to `Manual`. The `--timeout` parameter controls how long krkn waits for the VM to come back before reporting failure.

To see all available scenario options 
```bash
krknctl run kubevirt-outage --help
```