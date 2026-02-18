---
title: Adding New Scenario to Krknctl
description: Adding Scenario to Krknctl
weight: 3
categories: [New scenarios, Placeholders]
tags: [docs]
---


# Adding a New Scenario to Krknctl
For krknctl to find the parameters of the scenario it uses a krknctl input json file. Once this file is added to krkn-hub, krknctl will be able to find it along with the details of how to run the scenario. 

## Add KrknCtl Input Json
This file adds every environment variable that is set up for krkn-hub to be defined as a flag to the krknctl cli command. There are a number of different type of variables that you can use, each with their own required fields. See below for an example of the different variable types 

An example krknctl-input.json file can be found [here](https://github.com/krkn-chaos/krkn-hub/blob/main/application-outages/krknctl-input.json)

Enum Type Required Key/Values 
```json
{
    "name": "<name>",
    "short_description":"<short-description>",
    "description":"<longer-description>",
    "variable":"<variable_name>", //this needs to match environment variable in krkn-hub
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
    "variable":"<variable_name>", //this needs to match environment variable in krkn-hub
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
    "variable": "<variable_name>", //this needs to match environment variable in krkn-hub
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
    "variable":"<variable_name>", //this needs to match environment variable in krkn-hub
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
    "variable":"<variable_name>", //this needs to match environment variable in krkn-hub
    "type":"file_base64",  
    "required":"<true_or_false>" // true or false if required to set when running
}
```

