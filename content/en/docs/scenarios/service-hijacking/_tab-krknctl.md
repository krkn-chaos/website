
```bash
krknctl run service-hijacking [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="service-hijacking" source="krknctl" prefix="--" >}}


A sample scenario file can be found in the [Krkn tab](#tab-krkn) under [Sample Scenario](#sample-scenario); customize it based on your wanted response codes for API calls

{{% alert title="Note" %}} Note that the __-w0__ option in the command substitution `SCENARIO_BASE64="$(base64 -w0 <scenario_file>)"` is __mandatory__ in order to remove line breaks from the base64 command output {{% /alert %}}

To see all available scenario options 
```bash
krknctl run service-hijacking --help
```