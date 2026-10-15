---
title: Your First Chaos Experiment
description: Learn chaos engineering by running your first pod failure test
type: "docs/scenarios"
weight: 1
---

## What You'll Learn

By the end of this tutorial (about 20 minutes), you'll be able to:
- Install and use krknctl, the Krkn command-line tool
- Run a pod failure chaos scenario
- Observe how Kubernetes responds to pod failures
- Understand the basics of chaos engineering

## Prerequisites

Before starting, ensure you have:
- [ ] A Kubernetes cluster (local or remote) with `kubectl` access
- [ ] `kubectl` installed and configured
- [ ] Internet connection to download krknctl

{{% alert title="Need a Test Cluster?" color="info" %}}
If you don't have a cluster, you can create a local KinD (Kubernetes in Docker) cluster following our guide: [Configure Kind Testing Environment](../../developers-guide/testing-changes/#configure-kind-testing-environment).

Alternatively, you can use [minikube](https://minikube.sigs.k8s.io/docs/start/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/).
{{% /alert %}}

## Step 1: Install krknctl

krknctl is the recommended way to run Krkn scenarios. It provides a simple CLI interface with auto-completion and built-in validation.

### Download and Install

**On Linux or macOS:**
```bash
curl -sL https://github.com/krkn-chaos/krknctl/releases/latest/download/install.sh | bash
```

**On macOS with Homebrew:**
```bash
brew install krkn-chaos/tap/krknctl
```

### Verify Installation

Check that krknctl is installed correctly:

```bash
krknctl version
```

You should see output showing the krknctl version.

**What just happened?** You installed krknctl, a CLI tool that makes it easy to run chaos scenarios without managing configuration files or containers.

## Step 2: Deploy a Test Application

Before we can test chaos, we need an application to test! Let's deploy a simple nginx application.

### Create the Deployment

```bash
kubectl create deployment nginx --image=nginx:latest --replicas=3
```

### Expose the Deployment

```bash
kubectl expose deployment nginx --port=80 --target-port=80
```

### Verify It's Running

```bash
kubectl get pods -l app=nginx
```

You should see 3 nginx pods in the `Running` state:

```
NAME                     READY   STATUS    RESTARTS   AGE
nginx-7854ff8877-abc12   1/1     Running   0          30s
nginx-7854ff8877-def34   1/1     Running   0          30s
nginx-7854ff8877-ghi56   1/1     Running   0          30s
```

**What just happened?** You deployed a resilient nginx application with 3 replicas. Kubernetes will try to maintain exactly 3 running pods at all times.

## Step 3: Run Your First Chaos Scenario

Now for the exciting part – let's inject some chaos!

### Run a Pod Failure Scenario

```bash
krknctl pod-scenarios \
  --label-selector app=nginx \
  --namespace default \
  --kill-count 1 \
  --kill-timeout 30
```

### Watch What Happens

In another terminal window, watch the pods:

```bash
kubectl get pods -l app=nginx --watch
```

You'll see:
1. One pod gets terminated (status changes to `Terminating`)
2. Kubernetes immediately starts a replacement pod (status `ContainerCreating`)
3. The new pod becomes `Running`
4. Total count stays at 3 pods

Example output:
```
NAME                     READY   STATUS        RESTARTS   AGE
nginx-7854ff8877-abc12   1/1     Running       0          2m
nginx-7854ff8877-def34   1/1     Terminating   0          2m    ← Killed by chaos
nginx-7854ff8877-ghi56   1/1     Running       0          2m
nginx-7854ff8877-jkl78   0/1     Pending       0          1s    ← Replacement starting
nginx-7854ff8877-jkl78   0/1     ContainerCreating   0    1s
nginx-7854ff8877-def34   0/1     Terminating   0          2m
nginx-7854ff8877-jkl78   1/1     Running       0          3s    ← New pod ready
```

**What just happened?**
- krknctl found pods with label `app=nginx`
- It killed 1 pod (simulating a failure)
- Kubernetes detected the pod count dropped from 3 to 2
- The ReplicaSet controller created a replacement pod
- Your application remained available (2 pods were still serving traffic)

This demonstrates **self-healing** – a key resilience pattern in Kubernetes.

## Step 4: Understand the Results

Let's break down what made this application resilient:

### Why Didn't the Service Go Down?

1. **Multiple replicas**: We deployed 3 copies of nginx
2. **Load balancing**: The Service distributes traffic across all healthy pods
3. **Self-healing**: Kubernetes automatically replaced the failed pod

### What If We Only Had 1 Replica?

Try it yourself:

```bash
# Scale down to 1 replica
kubectl scale deployment nginx --replicas=1

# Run chaos again
krknctl pod-scenarios \
  --label-selector app=nginx \
  --namespace default \
  --kill-count 1 \
  --kill-timeout 30
```

Now there's a brief period (5-30 seconds) where nginx is unavailable. This teaches us:

{{% alert title="Lesson Learned" color="warning" %}}
**Single points of failure lead to downtime.** Always run multiple replicas of critical services.
{{% /alert %}}

### Scale Back Up

```bash
kubectl scale deployment nginx --replicas=3
```

## Step 5: Try Different Failure Modes

krknctl supports many types of chaos. Let's explore a few more.

### Kill Multiple Pods at Once

```bash
krknctl pod-scenarios \
  --label-selector app=nginx \
  --namespace default \
  --kill-count 2 \
  --kill-timeout 30
```

What happens when 2 out of 3 pods fail simultaneously?

### Repeated Failures

```bash
krknctl pod-scenarios \
  --label-selector app=nginx \
  --namespace default \
  --kill-count 1 \
  --kill-timeout 10 \
  --kill-interval 15 \
  --iterations 3
```

This kills 1 pod, waits 15 seconds, kills another, repeats 3 times total.

**What you're learning:** Different failure patterns reveal different resilience characteristics.

## Step 6: Clean Up

When you're done experimenting, clean up your test application:

```bash
kubectl delete deployment nginx
kubectl delete service nginx
```

## Summary

Congratulations! 🎉 You've completed your first chaos engineering experiment.

**You learned:**
- ✅ How to install and use krknctl
- ✅ How to run a pod failure chaos scenario
- ✅ How Kubernetes self-healing works
- ✅ Why multiple replicas matter for availability
- ✅ How to observe and interpret chaos results

**Key insights:**
1. **Chaos reveals weaknesses**: Single-replica deployments have downtime during pod failures
2. **Redundancy matters**: Multiple replicas enable zero-downtime deployments
3. **Kubernetes self-heals**: The control plane automatically replaces failed pods
4. **Testing is safe**: Chaos tests help you find issues before they become outages

## Next Steps

Now that you understand the basics, you can:

### Explore More Scenarios
- 📖 [Network Chaos](../../scenarios/network-chaos-scenario/) - Test latency, packet loss, and bandwidth
- 📖 [Node Failures](../../scenarios/node-scenarios/) - Test node failures across cloud providers
- 📖 [All Scenarios Catalog](../../scenarios/) - Browse all 20+ available scenarios

### Set Up Monitoring
- 📖 [Cerberus Monitoring](../../cerberus/) - Add cluster health monitoring to chaos tests
- 📖 [Performance Dashboards](../../performance_dashboards/) - Monitor chaos impact with Grafana

### Different Installation Methods
- 📖 [Install krkn](../../installation/krkn/) - Standalone Python for multiple scenarios
- 📖 [Install krkn-hub](../../installation/krkn-hub/) - Containerized for CI/CD
- 📖 [Installation Overview](../../installation/) - Compare all installation methods

### Learn More About Krkn
- 📖 [What is Krkn?](../../krkn/) - Understand Krkn's architecture and features
- 📖 [Chaos Testing Guide](../../chaos-testing-guide/) - Best practices and methodology
- 📖 [Developer's Guide](../../developers-guide/) - Contributing to Krkn

## Get Help

- Ask questions in [GitHub Discussions](https://github.com/krkn-chaos/krkn/discussions)
- Report issues on [GitHub Issues](https://github.com/krkn-chaos/krkn/issues)
- Join the community chat on [Slack](https://kubernetes.slack.com/messages/krkn-chaos)

---

**Feedback?** We'd love to hear how this tutorial went for you. [Open an issue](https://github.com/krkn-chaos/website/issues/new) or submit a PR with improvements!
