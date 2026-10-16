# OpenJudge GitHub update log

Date: 2026-10-16

Repository: `Yunbo-max/Yunbo-max.github.io`

Target branch: `master`

Starting commit: `9302bbb4e368967bb80065da7508dc01cb1657f0`

## Changes

- Add the English OpenJudge project README with the AI Conference Paparazzi identity, a usable first prompt, newsroom roles and route tables inspired by Ruflo's presentation.
- Add the complete OpenJudge Daily skill, its host metadata and icon, edition template and four workflow references.
- Preserve the detailed project design as a separate scope document.
- Update the OpenJudge project page's introduction and add a three-format newsroom section and GitHub links.
- Bring the existing ICLR 2026 score-reset context into the featured case introduction. Retain the original case records, links and dated collection figures.
- Add a project link to the repository README while preserving its existing contents.

## Verification scope

- The skill package passes the skill metadata validator.
- Passed: Markdown relative links, skill asset references, HTML structure and anchor targets, preservation of all original page links and exact preservation of the existing case-stories and archive-context blocks.
- Compare the committed files with the prepared content after updating the branch.

This is a documentation, skill and project-page update. It does not implement social API adapters or a recurring worker. A full Jekyll build, production page deployment and live social publishing are outside this verification.

Persistence uses ordinary GitHub Git objects and a non-forced branch update. No Actions or workflow endpoints are invoked and no `.github/workflows` files are added.
