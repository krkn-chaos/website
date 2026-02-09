---
title: Adding New Scenario to Krkn-hub
# date: 2017-01-05
description: 
weight : 2
categories: [Best Practices]
tags: [docs]
---


## Adding/Editing a New Scenario to Krkn-hub
1. Create folder with scenario name under [krkn-hub](https://github.com/krkn-chaos/krkn-hub/tree/main)

2. Create generic scenario template with environment variables

    a. See [scenario.yaml](https://github.com/krkn-chaos/krkn-hub/blob/main/application-outages/app_outages.yaml.template) for example
    
    b. Almost all parameters should be set using a variable (these will be set in the env.sh file or through the command line environment variables)
    
3. Add defaults for any environment variables in an "env.sh" file

    a.  See [env.sh](https://github.com/krkn-chaos/krkn-hub/blob/main/application-outages/env.sh) for example
    
4. Create script to run.sh chaos scenario
    a. See [run.sh](https://github.com/krkn-chaos/krkn-hub/blob/main/application-outages/run.sh) for example
    
    b. edit line 16 with your scenario yaml template

    c. edit line 17 and 23 with your yaml config location

5. Create Dockerfile template
    
    a. See [dockerfile template](https://github.com/krkn-chaos/krkn-hub/blob/main/application-outages/Dockerfile.template) for example
    
    b. Lines to edit
    
        i. 12: replace "application-outages" with your folder name

        ii. 14: replace "application-outages" with your folder name

        iii. 17: replace "application-outages" with your scenario name

        iv. 18: replace description with a description of your new scenario
        
6. Add service/scenario to [docker-compose.yaml](https://github.com/krkn-chaos/krkn-hub/blob/main/docker-compose.yaml) file following syntax of other services
7. Point the dockerfile parameter in your docker-compose to the Dockerfile file in your new folder
8. Add the folder name to the list of scenarios in [build.sh](https://github.com/krkn-chaos/krkn-hub/blob/main/build.sh)
9. Update the krkn website and main README with [new scenario type](https://github.com/krkn-chaos/website/tree/main/content/en/docs/scenarios)

    
NOTE: 
1. If you added any main configuration variables or new sections be sure to update [config.yaml.template](https://github.com/krkn-chaos/krkn-hub/blob/main/config.yaml.template) 
2. Similar to above, also add the default parameter values to [env.sh](https://github.com/krkn-chaos/krkn-hub/blob/main/env.sh)
