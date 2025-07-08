---
title: Testing your changes
# date: 2017-01-05
description: 
weight : 2
categories: [Best Practices, Placeholders]
tags: [docs]
---


- [Testing Changes in Krkn-lib](#testing-changes-in-krkn-lib)
- [Testing Changes in Krkn-hub](#testing-changes-for-krkn-hub)

This page gives details about how you can get a kind cluster configured to be able to run on krkn-lib (the lowest level of krkn-chaos repos) up through krkn-hub

## Testing Changes in Krkn-lib

### Create a kind cluster if needed
1. [Install kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)


2. Create cluster using [kind-config.yml](https://github.com/krkn-chaos/krkn-lib/blob/main/kind-config.yml) under *krkn-lib* base folder
```bash
kind create cluster --wait 300s --config=kind-config.yml
```

### Elasticsearch and Prometheus
To be able to run the full test suite of tests you need to have elasticsearch and promethues properly configured on the cluster 

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add stable https://charts.helm.sh/stable
helm repo update
```

#### Prometheus
[Configuring prometheus](https://github.com/krkn-chaos/krkn-lib/blob/a3c4833fee00a43c282fc1043b0bee24ce8def9d/.github/workflows/build.yaml#L37-L50)


#### ElasticSearch 

Set enviornment variables of elasticsearch variables
```bash
export ELASTIC_URL="https://localhost"
export ELASTIC_PORT="9091"
export ELASTIC_USER="elastic"
export ELASTIC_PASSWORD="test"
```

[Configuring elasticsearch](https://github.com/krkn-chaos/krkn-lib/blob/a3c4833fee00a43c282fc1043b0bee24ce8def9d/.github/workflows/build.yaml#L66-L80)


### Install poetry 
Using a virtual enviornment install poetry and install krkn-lib requirmenets
```bash
$ pip install poetry
$ poetry install --no-interaction
```

### Run tests

```bash
poetry run python3 -m coverage run -a -m unittest discover -v src/krkn_lib/tests/
```


## Testing Changes for Krkn-hub

### Install Podman/Docker Compose
You can use either podman-compose or docker-compose for this step

**NOTE:** Podman might not work on Mac's

``` bash
pip3 install docker-compose
```

OR 

To get latest podman-compose features we need, use this installation command

`pip3 install https://github.com/containers/podman-compose/archive/devel.tar.gz`


### Build Your Changes
1. Run [build.sh](../build.sh) to get Dockerfiles for each scenario
2. Edit the docker-compose.yaml file to point to your quay.io repository (optional; required if you want to push)

```txt
ex.) 
image: containers.krkn-chaos.dev/krkn-chaos/krkn-hub:chaos-recommender 

change to >

image: quay.io/<user>/krkn-hub:chaos-recommender
```

3. Build your image(s) from base krkn-hub directory
    
Builds all images in docker-compose file
```bash
docker-compose build
```

Builds single image defined by service/scenario name 
```bash
docker-compose build <scenario_type>
```

OR 

Builds all images in podman-compose file
```bash
podman-compose build
```

Builds single image defined by service/scenario name 
```bash
podman-compose build <scenario_type>`
```
### Push Images to your quay.io
All Images
```bash
docker-compose push
```

Single image
```bash
docker-compose push <scenario_type>
```

OR

Single Image (have to go one by one to push images through podman)
```bash
podman-compose push <scenario_type>
```

### Run your new scenario
`docker run -d -v <kube_config_path>:/root/.kube/config:Z quay.io/<username>/kraken-hub:<scenario_type>`

OR 

`podman run -d -v <kube_config_path>:/root/.kube/config:Z quay.io/<username>/kraken-hub:<scenario_type>`

See krkn-hub files for each scenario 


# Adding a New Scenario to Krknctl

## Add KrknCtl Input Json
This file adds every enviornment variable that is set up for krkn-hub to be defined as a flag to the krknctl cli commanfd. There are 

Enum Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description":"<short-description>",
    "description":"<longer-description>",
    "variable":"<variable_name>", //this needs to match enviornment variable in krkn-hub
    "type": "enum",
    "allowed_values": "<value>,<value>",
    "separator": ",",
    "default":"", // any default value
    "required":"<true_or_false>" // true or false if required to set when running
}
```
String Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description":"<short-description>",
    "description":"<longer-description>",
    "variable":"<variable_name>", //this needs to match enviornment variable in krkn-hub
    "type": "string",
    "default": "", // any default value
    "required":"<true_or_false>" // true or false if required to set when running
}
```
Number Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description": "<short-description>",
    "description": "<longer-description>",
    "variable": "<variable_name>", //this needs to match enviornment variable in krkn-hub
    "type": "number",  // options: string, number, file, file64
    "default": "", // any default value
    "required": "<true_or_false>" // true or false if required to set when running
}
```
File Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description":"<short-description>",
    "description":"<longer-description>",
    "variable":"<variable_name>", //this needs to match enviornment variable in krkn-hub
    "type":"file",  
    "mount_path": "/home/krkn/<file_loc>", // file location to mount to, using /home/krkn as the base has correct read/write locations
    "required":"<true_or_false>" // true or false if required to set when running
}
```

File Base 64 Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description":"<short-description>",
    "description":"<longer-description>",
    "variable":"<variable_name>", //this needs to match enviornment variable in krkn-hub
    "type":"file_base64",  
    "required":"<true_or_false>" // true or false if required to set when running
}
```

## Push to personal Quay
See [build your own changes](#build-your-changes) on how to build and push changes to your own quay repository for testing


## Run Krknctl with Personal Image
Once you have your images in quay, you are all set to configure krknctl to look for these new images. You'll edit the quay_org (your quay username), quay_scenario_registry (krkn-hub), quay_base_image_registry variables [here](https://github.com/krkn-chaos/krknctl/blob/main/pkg/config/config.json#L4-L6)

With these updates to your config, you'll re-build your personal [krknctl binary](../installation/krknctl.md#build-command) and you'l be all set to start testing your new scenario and config options. 

If any krknctl code changes are required, you'll have to make changes and rebuild the the krknctl binary. 


## Follow Contribution Guide

Once all you're happy with your changes, follow the [contribution](#docs/git-pointers.md) guide on how to create your own branch and squash your commits
 