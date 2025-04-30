---
title: Contribution Guidelines
type: "docs/scenarios"
description: 
weight: 5
description: How to contribute and get started
---

# How to contribute

We're excited to have you consider contributing to our chaos! Contributions are always appreciated. 

# Krkn 

## Contributing to Krkn

If you would like to contribute to Krkn, but are not sure exactly what to work on, you can find a number of open issues that are awaiting contributions in
[issues.](https://github.com/krkn-chaos/krkn/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)

## Adding New Scenarios and Configurations

### New Scenarios 

We are always looking for new scenarios to make krkn better and more usable for our chaos community. If you have any ideas, please first open an issue to explain the new scenario you are wanting to add. We will review and respond with ideas of how to get started. 

If adding a new scenario or tweaking the main config, be sure to add in updates into the CI to be sure the CI is up to date.
Please read [this file](https://krkn-chaos.dev/docs/getting-started/#adding-new-scenarios) for more information on updates.

#### Scenario Plugin Development

If you're gearing up to develop new scenarios, take a moment to review our
[Scenario Plugin API Documentation](/docs/contribution-guidelines/scenario_plugin_api.md).
It’s the perfect starting point to tap into your chaotic creativity!

### New Configuration to Scenarios 

If you are currently using a scenario but want more configuration options, please open a [github issue](https://github.com/krkn-chaos/krkn/issues) describing your use case and what fields and functionality you would like to see added. We will review the sugguestion and give pointers on how to add the functionality. If you feel inclined, you can start working on the feature and we'll help if you get stuck along the way. 

## Work in Progress PR's 
If you are working on a contribution in any capacity and would like to get a new set of eyes on your work, go ahead and open a PR with '[WIP]' at the start of the tite in your PR and tag the [maintainers](https://github.com/krkn-chaos/krkn/blob/main/MAINTAINERS.md) for review. We will review your changes and give you sugguestions to keep you moving! 

## Good PR Checklist 
Here's a quick checklist for a good PR, more details below:
- One feature/change per PR
- One commit per PR [squash your commits](contribute.md#squash-commits)
- PR rebased on main ([git rebase](contribute.md#rebase-with-upstream), not git pull)
- Good descriptive commit message, with link to issue
- No changes to code not directly related to your PR
- Includes functional/integration test (more applicable to krkn-lib)
- Includes link to documentation PR (documentation hosted in https://github.com/krkn-chaos/website)

## Helpful Documents
Refer to the docs below to be able to test your own images with any changes and be able to contribute them to the repository
- [Getting Started](/docs/contribution-guidelines/getting-started.md)
- [Contribute - Git Pointers](/docs/contribution-guidelines/contribute.md)
- [Testing Your Krkn-hub Changes](/docs/contribution-guidelines/testing-changes.md)

