---
title: AWS S3 Replication Scenarios using Krkn
description: 
date: 2017-01-04
weight: 1
---

This scenario temporarily pauses S3 bucket replication to test application resilience when replication is unavailable or experiencing lag.

##### Scenario config

```yaml
aws_s3_replication_scenarios:
  bucket_name: "my-source-bucket"  # Required: Source bucket with replication
  duration: 300                     # Required: Pause duration in seconds
  region: "us-east-1"              # Optional: AWS region
```

### Configuration Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `bucket_name` | string | Yes | - | Name of the S3 source bucket with replication configured |
| `duration` | integer | Yes | - | Duration to pause replication (in seconds) |
| `region` | string | No | Default AWS region | AWS region where the bucket is located |

### Example Scenarios

#### Short Pause (5 minutes)
```yaml
aws_s3_replication_scenarios:
  bucket_name: "production-data"
  duration: 300
  region: "us-east-1"
```

#### Extended Pause (30 minutes)
```yaml
aws_s3_replication_scenarios:
  bucket_name: "backup-bucket"
  duration: 1800
  region: "us-west-2"
```

#### Multi-Region Failover Test
```yaml
aws_s3_replication_scenarios:
  bucket_name: "global-assets-bucket"
  duration: 900
  region: "ap-southeast-1"
```

### How to Use Plugin Name

Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file

```yaml
kraken:
    kubeconfig_path: ~/.kube/config
    chaos_scenarios:
        - aws_s3_replication_scenarios:
            - scenarios/s3_replication.yaml
```

### Run

```bash
python run_kraken.py --config config/config.yaml
```
