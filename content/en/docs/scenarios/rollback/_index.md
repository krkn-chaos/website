---
title: Rollback
description: Roll back the side effects of a previous krkn chaos run
date: 2024-01-01
weight: 10
---

The rollback scenario undoes the side effects left behind by a previous krkn chaos run. Given the UUID of a completed run, it restores the cluster to the state it was in before that run executed.

This is useful when a chaos experiment leaves the cluster in an unclean state, or when you need to quickly recover after testing without waiting for natural recovery.

## How to Run

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
