```bash
krknctl run rollback [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:
| Parameter | Description | Type | Required | Default |
| --------- | ----------- | ---- | :------: | ------- |
`--run-uuid` | Krkn Run UUID that needs to be rolled back | string | Yes | |

To see all available scenario options
```bash
krknctl run rollback --help
```
