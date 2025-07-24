---
title: krknctl
description: how to install, build and configure the CLI
weight: 2
---


## Binary distribution (Recommended):
The krknctl binary is available for download from [GitHub releases](https://github.com/krkn-chaos/krknctl/releases/latest) for supported operating systems and architectures. Extract the tarball and add the binary to your `$PATH`.

## Build from sources :

### Fork and Clone the Repository
Fork the repository 
```bash
$ git clone https://github.com/<github_user_id>/krknctl.git
$ cd krknctl
```

Set your cloned local to track the upstream repository:
```bash
git remote add upstream https://github.com/krkn-chaos/krknctl
```


### Linux:
#### Dictionaries:
To generate the random words we use the american dictionary, it is often available but if that's not the case:
- **Fedora/RHEL**: `sudo dnf install words`
- **Ubuntu/Debian**: `sudo apt-get install wamerican`

## Building from sources:
### Linux:
To build the only system package required is libbtrfs:

- **Fedora/RHEL**: `sudo dnf install btrfs-progs-devel`
- **Ubuntu/Debian**: `sudo apt-get install libbtrfs-dev`
### MacOS:
- **gpgme**: `brew install gpgme` 

## Build command: 
`go build -tags containers_image_openpgp -ldflags="-w -s" -o bin/ ./...`

{{% alert title="Note" %}}
To build for different operating systems/architectures refer to `GOOS` `GOARCH` [golang variables](https://pkg.go.dev/internal/platform)
{{% /alert %}}

## Configure Autocompletion:
The first step to have the best experience with the tool is to install the autocompletion in the shell so that the tool
will be able to suggest to the user the available command and the description simply hitting `tab` twice.

### Bash (linux):
```
source <(./krknctl completion bash)
```
{{% alert title="Tip" %}}
To install autocompletion permanently add this command to `.bashrc` (setting the krknctl binary path correctly)
{{% /alert %}}

### zsh (MacOS):
```
autoload -Uz compinit
compinit
source <(./krknctl completion zsh)
```
{{% alert title="Tip" %}}
To install autocompletion permanently add this command to `.zshrc` (setting the krknctl binary path correctly)
{{% /alert %}}
<br/>

## Container Runtime:
The tool supports both Podman and Docker to run the krkn-hub scenario containers. The tool interacts with the container
runtime through Unix socket. If both container runtimes are installed in the system the tool will default on `Podman`.

### Podman:
Steps required to enable the Podman support
#### Linux:
- enable and activate the podman API daemon
```
sudo systemctl enable --now podman
```
- activate the user socket
```
systemctl enable --user --now podman.socket 
```

#### MacOS:
If both Podman and Docker are installed be sure that the docker compatibility is disabled

### Docker:
#### Linux:
Check that the user has been added to the `docker` group and can correctly connect to the Docker unix socket  
running the comman `podman ps` if an error is returned  run the command `sudo usermod -aG docker $USER`


### What's next?
Please refer to the [getting started guide](/docs/getting-started/_index.md), pick the [scenarios](/docs/scenarios/_index.md) of interest and follow the instructions to run them via Krkn, Krkn-hub or Krknctl. Running via Krkn-hub or Krknctl are recommended for ease of use and better user experience.
