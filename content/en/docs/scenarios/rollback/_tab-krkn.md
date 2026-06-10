### Configuration Options

Add the following to your `config/config.yaml` to enable auto rollback:

**auto_rollback:** When set to `True`, krkn will automatically roll back changes made by a scenario if it fails.

**rollback_versions_directory:** Directory to store rollback version files. Leave empty to use a secure temporary directory.

```yaml
kraken:
    kubeconfig_path: ~/.kube/config
    auto_rollback: True
    rollback_versions_directory:           # leave empty to use a secure temp directory
```

### Run

List available rollback versions:

```bash
python run_kraken.py list-rollback
```

Execute rollback for a specific run:

```bash
python run_kraken.py execute-rollback --run-uuid <uuid-of-the-krkn-run>
```
