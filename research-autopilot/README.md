# Research Autopilot

Founded and maintained by Yunbo Long. Release 1.1.0, 2 October 2026.

An authored research workflow with 16 regions, 84 node contracts and 221 conditional task relationships. Includes a stage-aware 52-question bank, literature/reproduction/QA evaluation contracts, eight method routes, debug-to-confirmation loops, claim-driven validation, evidence-driven writing, editable figures and release/communication handoffs.

## Start

Copy the four directories inside `skills/` to the skill location supported by your agent. Keep them together: node-level source retrieval resolves each skill by its SKILL.md name. Invoke `research-autopilot` with a question, existing assets and the decision you want to make. ChatGPT/API/other hosts have their own installation and tool conventions; this package does not connect accounts.

```sh
python3 skills/research-autopilot/scripts/research_nodes.py check
python3 skills/research-autopilot/scripts/research_nodes.py show L03
```

The other specialists are `writing-top-tier-papers`, `designing-pipeline-figures` and `designing-experiment-figures`. No external skill pack is automatically installed.

## Evidence and limitations

The 84 source bindings are checked. 125 tests passed in the personal skill checkout, and three independent read-only scenarios inspected literature claims, developmental tuning and publication handoffs. These checks do not certify 84 executed tasks, autonomous scientific performance, a GPU scheduler, connected model accounts, or paper acceptance. Execution depends on actual adapters, permissions, budgets and project evidence.

Unreproduced arXiv experimental results remain author reports/leads. Publication, Oral/Spotlight, reading and reproduction are separate axes. A verified final conference/journal citation is preferred when it supports the statement.

## Project

[Website and interactive map](https://yunbo-max.github.io/research-autopilot/) · [AI Lab](https://yunbo-max.github.io/lab/) · [OpenJudge](https://yunbo-max.github.io/openjudge/) · [Earlier AI-Supervisor architecture paper](https://arxiv.org/abs/2603.24402)

AI-Supervisor is an arXiv preprint. Its reported experiments have not been independently reproduced for this release. See `references/capability-source-catalog.md` in the Research Autopilot skill for original design sources and read scope. External tools/documentation retain their own licenses and conditions.

## Versions

`manifest.json` records shipped file digests and release scope. Retain actual project code/data/model/protocol versions independently from this workflow release.
