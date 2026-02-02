---
title: Stopping Criteria
description: Configuring Stopping Criteria for the Genetic Algorithm
weight: 2
---

The stopping criteria framework lets users define when the genetic algorithm should terminate, allowing for more flexible control beyond strictly generation count or time limits. By configuring these parameters, you can ensure the algorithm stops once it achieves a target fitness or if it reaches a state of saturation where no further improvements or discoveries are being made.

### Configurations

You can configure the following options under the `stopping_criteria` section of the Krkn-AI config file. All fields are optional and, with the exception of `saturation_threshold`, default to disabled (`null`).

#### `fitness_threshold`

- **Description:** Stops the algorithm when the best fitness score reaches or exceeds this specific value.
- **Default:** Disabled (`null`)

This is useful when you have a specific target fitness score (e.g., an SLO violation count) that, once reached, indicates the objective has been met.

#### `generation_saturation`

- **Description:** Stops the algorithm if there is no significant improvement in the best fitness score for _N_ consecutive generations.
- **Default:** Disabled (`null`)

This helps prevent the algorithm from running needlessly after it has converged to a solution.

#### `exploration_saturation`

- **Description:** Stops the algorithm if no new unique scenarios (test cases) are discovered for _N_ consecutive generations.
- **Default:** Disabled (`null`)

This indicates that the algorithm has likely exhausted its search space given the current configuration and is engaging in redundant exploration.

#### `saturation_threshold`

- **Description:** Configures the minimum fitness improvement required to consider a fitness change as "significant" for the purpose of resetting the saturation counter.
- **Default:** `0.0001`

If the improvement in fitness is less than this threshold, it is treated as stagnation.

### Example Configuration

```yaml
stopping_criteria:
  fitness_threshold: 200        # stop when fitness >= 200
  generation_saturation: 5      # stop if no improvement for 5 generations
  exploration_saturation: 3     # stop if no new scenarios for 3 generations
  saturation_threshold: 0.0001  # minimum improvement to reset saturation counter
```
