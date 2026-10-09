---
title: Job Categories & Resiliency Score Report
description: Group scenario runs with categories and compare their resiliency scores
weight: 6
---

# Job Categories & Resiliency Score Report

Use categories to organize scenario runs, then compare their resiliency scores over time in the report.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/BBEEDErUj94" title="Job Categories and Resiliency Score Report Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Create a Category

1. Open **Categories** from the left navigation menu.
2. Select **Create Category**.
3. Enter a name and choose a color in the color picker.
4. Set the category visibility and create it.

Categories help you group related runs for reporting. Choose a color to identify the category in the console.

## Assign a Category to Runs

1. Open **Jobs** and locate a scenario run.
2. Open the run's **Actions** menu and select **Category**.
3. Select one or more categories to assign them to the run.
4. Repeat for other runs you want to compare.

The category is saved on the run and can be used as a filter in the report.

For example, assign `score-category` to `pod-scenarios-99629e65` and `pod-scenarios-aedd3317` to compare their resiliency scores together.

## View the Resiliency Score Report

1. Open **Resiliency History** from the left navigation menu.
2. Select one or more categories and target clusters.
3. Select **Apply filters** to display the report.

The report plots resiliency scores over time. In **Separate configuration groups** mode, runs with the same settings appear in the same chart; runs with different settings appear in separate charts. This makes it easier to compare like-for-like runs while keeping different configurations distinct.

### Combine Configurations by Category

Select **Combine configurations by category** to put runs from the selected category into a single chart, including runs with different settings. This helps compare scores across heterogeneous configurations.

When the report includes more than one cluster, each cluster is shown as a separate line so you can compare results across clusters. The report can also be exported as a PDF.
