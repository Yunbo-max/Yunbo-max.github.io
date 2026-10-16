# Project style

Use this reference when presenting OpenJudge as an open-source project or designing an editor interface.

## Ruflo-inspired presentation

Lead with a recognizable wordmark and a one-line purpose: **OpenJudge — AI Conference Paparazzi**. Use **Peer review has plot twists. Bring receipts.** as the optional English tagline.

Put a usable first task before architecture detail. Follow with a compact route table, newsroom responsibilities, an actual example, the source/verification contract, and installation instructions that match the files and host capabilities that really exist.

Use a dark masthead, warm light reading surfaces, one red accent, and restrained monospaced labels. Keep actual content readable. Do not copy Ruflo's assets, product claims, logo, or unsupported usage metrics. Include only verified badges and compatibility claims.

## Module boundaries

Keep one main skill as the entry point. Load the editorial, platform, and persistence references only as needed. Treat Scout, Reporter, Fact-checker, Editor, Visual desk, and Distribution desk as functional roles. Do not turn a six-stage process into a claim that six independent agents ran.

Show actual task status and source gaps in an editor view. Keep public browsing focused on the story, research topic, sources, and corrections. Preserve the existing English topic index and stable paper links when updating the site.

## Product surfaces

| Surface | Primary content |
|---|---|
| Public home | One featured daily story, topic search, archive list |
| Case page | Hook, timeline, technical disagreement, evidence and corrections |
| Editor desk, if implemented | Candidate queue, output previews, source gaps, delivery states |
| GitHub README | Brand, quick start, actual capabilities, example, source contract |

Only describe an editor console, MCP server, CLI, schedule, or publishing integration as implemented after its code and actual behavior have been verified.

## References

Consulted on 2026-10-16 for presentation and modularity patterns:

- https://github.com/ruvnet/ruflo/blob/main/README.md
- https://github.com/ruvnet/ruflo/blob/main/plugins/ruflo-workflows/README.md
- https://github.com/ruvnet/ruflo/blob/main/plugins/ruflo-core/README.md

No Ruflo runtime dependency is required by this skill. Keep future borrowed code or assets subject to their actual licenses and attribution requirements.
