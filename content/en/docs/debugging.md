---
title: Krkn Debugging Tips
description: Common helpful tips if you hit issues running krkn
weight: 10
---

# Common Debugging Issues


## SSL Certification

### Error
```bash
...
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='api.***.io', port=6443): Max retries exceeded with url: /apis/config.openshift.io/v1/clusterversions (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self-signed certificate in certificate chain (_ssl.c:1147)')))
```


### Fix

The user needs to have tls verification by logging in using 
``` bash
$ oc login [-u=<username>] \
  [-p=<password>] \
  [-s=<server>] \
  [-n=<project>] \
  --insecure-skip-tls-verify
```


Also verify `insecure-skip-tls-verify: true` is in the kubeconfig: 
```
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://***:6443
  name: test
contexts:
- context:
    cluster: test
    user: admin
  name: admin
current-context: admin
preferences: {}
users:
- name: admin
  user:
    client-certificate-data: ***
```

## Podman vs Docker container runtime

### Krknctl Error
```bash
...
failed to determine container runtime environment please install podman or docker and retry
```


### Fix
```bash
ln -s $(podman machine inspect --format '{{ .ConnectionInfo.PodmanSocket.Path }}') ~/.local/share/containers/podman/machine/podman.sock
```