---
title: Git Help For Contributions
# date: 2017-01-05
description:
weight: 3
categories: [Best Practices, Placeholders]
tags: [docs]
---
# How to contribute

Contributions are always appreciated.

How to:
* [Submit Pull Request](#pull-request)
* [Squash Commits](#squash-commits)
* [Rebase with Upstream](#rebase-with-upstream)
* [Certificate of Origin](#developers-certificate-of-origin)

## Pull request

In order to submit a change or a PR, please fork the project and follow instructions:
```bash
$ git clone http://github.com/<me>/krkn-hub
$ cd krkn-hub
$ git checkout -b <branch_name>
$ <make change>
$ git add <changes>
$ git commit -a
$ <insert good message>
$ git push
```

## Squash Commits
If there are multiple commits, please rebase/squash multiple commits
before creating the PR by following:

```bash
$ git checkout <my-working-branch>
$ git rebase -i HEAD~<num_of_commits_to_merge>
   -OR-
$ git rebase -i <commit_id_of_first_change_commit>
```

In the interactive rebase screen, set the first commit to `pick` and all others to `squash` (or whatever else you may need to do).


Push your rebased commits (you may need to force), then issue your PR.

```bash
$ git push origin <my-working-branch> --force
```


## Rebase with Upstream
If new commits were merged while you were working you'll need to rebase with upstream
before creating the PR by following:

```bash
$ git checkout <my-working-branch>
$ git remote add upstream https://github.com/krkn-chaos/krkn (or krkn-hub)
$ git fetch upstream
$ git rebase upstream/<branch_in_upstream_to_rebase> (most likely `main`)
```

If any errors occur: 
1. It’ll list off any files that have merge issues
2. Edit the files with the code blocks you want to keep
3. Add and continue rebase 
```bash
$ git add .
$ git rebase --continue
```
4. Might need to repeat steps 1-3 until you see `Successfully rebased and updated refs/heads/<my-working-branch>.`


Push your rebased commits (you may need to force), then issue your PR.

```bash
$ git push origin <my-working-branch> --force
```


## Developer's Certificate of Origin
Any contributions to Krkn must only contain code that can legally be contributed to Krkn, and which the Krkn project can distribute under its license.

Prior to contributing to Krkn please read the [Developer's Certificate of Origin](https://developercertificate.org/) and sign-off all commits with the --signoff option provided by git commit. For example:

```bash
git rebase HEAD~1 --signoff
git push origin <branch_name> --force
```

This option adds a Signed-off-by trailer at the end of the commit log message.