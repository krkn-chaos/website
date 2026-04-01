---
title: License Header & Pre-Commit
description: How to set up and run the pre-commit license header check for Krkn
weight: 4
categories: [Best Practices]
tags: [docs]
---

# License Header & Pre-Commit

Krkn enforces Apache 2.0 license headers on all Python files using a pre-commit hook. Contributors must have this set up before submitting pull requests.

## Setup (one-time)

```bash
pip install pre-commit
pre-commit install
```

## Check license headers manually

```bash
python scripts/check_license.py
```

## Auto-fix all missing headers

```bash
python scripts/check_license.py --fix
```

## Run via pre-commit against all files

```bash
pre-commit run check-license-header --all-files
```
