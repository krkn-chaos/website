---
title: AWS S3 Replication Scenarios
description: 
date: 2017-01-04
weight: 3
---

<krkn-hub-scenario id="aws-s3-replication-scenarios">

This scenario temporarily pauses S3 bucket replication to test application resilience when replication is unavailable or experiencing lag. The target S3 bucket must have replication already configured.

</krkn-hub-scenario>

## How It Works

1. **Save Configuration**: Retrieves and saves the current S3 replication configuration
2. **Pause Replication**: Disables all replication rules by setting their status to `Disabled`
3. **Chaos Period**: Waits for the specified duration while replication is paused
4. **Restore Replication**: Re-enables replication by restoring the original configuration

## Prerequisites

### AWS S3 Replication Setup

The target S3 bucket **must have replication already configured**. This scenario does not create replication configurations; it only pauses and restores existing ones.

To set up S3 replication:
1. Enable versioning on both source and destination buckets
2. Create an IAM role for S3 replication
3. Configure replication rules in the source bucket

See [AWS S3 Replication Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html) for details.

### AWS Credentials

Ensure AWS credentials are configured via one of these methods:
- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`)
- AWS credentials file (`~/.aws/credentials`)
- IAM role (if running on EC2, ECS, or Lambda)

## Required IAM Permissions

The IAM user or role running Krkn must have these permissions on the source bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "KrknS3ReplicationChaos",
      "Effect": "Allow",
      "Action": [
        "s3:GetReplicationConfiguration",
        "s3:PutReplicationConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::your-source-bucket-name"
      ]
    }
  ]
}
```

{{% alert title="Note" %}}These permissions are only needed on the **source bucket** (where replication originates), not on destination buckets.{{% /alert %}}
