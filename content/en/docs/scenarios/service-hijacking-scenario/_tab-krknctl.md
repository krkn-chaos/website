
```bash
krknctl run service-hijacking (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
`--scenario-file-path` | The absolute path of the scenario file compiled following the documentation |file_base64 |


A sample scenario file can be found [here](service-hijacking-scenarios-krkn.md#sample-scenario), you'll need to customize it based on your wanted response codes for API calls

{{% alert title="Note" %}} Note that the __-w0__ option in the command substitution `SCENARIO_BASE64="$(base64 -w0 <scenario_file>)"` is __mandatory__ in order to remove line breaks from the base64 command output {{% /alert %}}

To see all available scenario options 
```bash
krknctl run service-hijacking --help
```