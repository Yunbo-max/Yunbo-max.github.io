# Source comparison and integration record

Read date: 2026-10-02. These are reference designs, not installed integrations or
experimentally validated skills. Our four personal research/writing/figure skills
remain authoritative. Adapted contracts live in the sibling references linked
from SKILL.md. Source provenance is distinct from research-result evidence.

## Interaction and method sources

| Original skill | Read version and actual scope | Adopt | Do not import |
|---|---|---|---|
| [Anthropic scientific-problem-selection](https://github.com/anthropics/knowledge-work-plugins/blob/8444efcd48f7012f09797778a36a33e73d0861f4/bio-research/skills/scientific-problem-selection/SKILL.md) | full SKILL + intuition/parameter/decision-tree references at shown commit | multiple entry modes, progressive purpose/approach/importance/risk discussion | compulsory biology search, fixed weeks or repeat interview |
| [K-Dense scientific-brainstorming](https://github.com/K-Dense-AI/scientific-agent-skills/blob/154988403bb5a18e9d3c0ce4e6d5e2e4b184a298/skills/scientific-brainstorming/SKILL.md) | full v1.4, reviewed 2026-10-01 | distinguish ideas/assumptions/evidence; independent generation; dissent; seen-data exploration | false independence in one shared context; auto winner or forced agents |
| [K-Dense scientific-critical-thinking](https://github.com/K-Dense-AI/scientific-agent-skills/blob/154988403bb5a18e9d3c0ce4e6d5e2e4b184a298/skills/scientific-critical-thinking/SKILL.md) | full v1.5, reviewed 2026-10-01 | unit/claim type, measurement/confounds, locator-consequence-remedy | clinical grading mechanically applied to ML |
| [ARIS idea-creator](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep/blob/2132036060e03e8d0df69a4b21e5971819c0c2d6/skills/idea-creator/SKILL.md) | full phases/output at shown commit | mechanism lenses, structural dedup, pilot information under either sign | mandatory paid pilots/fixed GPU budgets; contradictory negative-pilot elimination template |
| [ARIS experiment-plan](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep/blob/2132036060e03e8d0df69a4b21e5971819c0c2d6/skills/experiment-plan/SKILL.md) | full phases at shown commit | claim → evidence → experiment → run order; anti-claim, simple replacement | fixed claims/blocks/seeds as conference requirements |
| [ARIS result-to-claim](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep/blob/2132036060e03e8d0df69a4b21e5971819c0c2d6/skills/result-to-claim/SKILL.md) | full entry at shown commit | verify numeric source then interpret yes/partial/no; preserve scope | continuing past our evidence gates or treating file absence as misconduct |

## Writing comparison

| Skill | Strength for this project | Integration decision |
|---|---|---|
| Our writing-top-tier-papers | Nature/AI-conference mode, venue/template, main/appendix, section/paragraph, narrative, result-driven change map | retain as primary writer |
| [K-Dense scientific-writing](https://github.com/K-Dense-AI/scientific-agent-skills/blob/154988403bb5a18e9d3c0ce4e6d5e2e4b184a298/skills/scientific-writing/SKILL.md) | full v2.3: evidence IDs, numerical consistency, methods-results link, reference audit, review changes | adopt provenance/consistency concepts; do not import clinical authorship/reporting instruments or compulsory human verification for every routine extraction as universal AI-conference law |
| ARIS result-to-claim + experiment-plan | binds planning and actual evidence to supported scope before prose | combine with V closure, never substitute for full-paper consistency |
| Our pipeline/experiment figure skills | several design candidates, scientific fact lock, editable tables/plot source and render QA | retain and add live-text SVG/source exports |

No standalone citation-management skill was adopted without a readable verified
source. Final-version resolution is specified in our literature-harnesses.md with
official proceedings/DOI checks rather than a citation generator's guesses.

## Harness and metadata references

| Source | Actual inspected scope | Use and limit |
|---|---|---|
| [HF Papers](https://github.com/huggingface/skills) | installed official Papers SKILL in plugin 1.0.0 plus public repository listing; main SKILL fetch unavailable | search/text/asset links; inspect full-text vs summary fallback |
| [Crossref REST](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) and [relationships](https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/relationships/) | endpoints/provenance/version relations; pages show update 2020-04-08 | metadata candidate resolution; official content match still needed |
| [PaperBench](https://github.com/openai/frontier-evals/blob/main/project/paperbench/README.md) | code/execution/result match, setup, artifacts, Code-Dev | separated reproduction stages; a benchmark, not arbitrary-paper certification |
| [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md) | configs/splits/prompts/output/filters/metrics/aggregation plus README samples | reproducible evaluator adapter; not task validity or fair baseline proof |
| [Inspect AI](https://inspect.aisi.org.uk/tasks.html) | tasks/scorers/scoring-policy/logs/sandboxing | identity, denominator/error distinctions, sandbox boundaries |
| [NeurIPS Paper Checklist](https://neurips.cc/public/guides/PaperChecklist) | claims/limits/theory/reproducibility/settings/statistics/compute | current reporting obligations, no acceptance guarantee |
| [arXiv submission](https://info.arxiv.org/help/submit/index.html) and [versions](https://info.arxiv.org/help/replace.html) | preparation/account/version/publication record | prepare package, use actual account/human handoff for complex portal tasks |
| [SIGSIM-PADS 2024 artifact review](https://sigsim.acm.org/conf/pads/2024/blog/artifact-evaluation/) | that official venue's criteria/badges/two stages | distinguish functional/available/reproduced; no claim to have read all ACM policy |

Online/main harness docs were read on the date above; no fixed commit claimed
where not resolved. Freeze the actual adapter/task/config version per experiment.
Readiness, service cost, accounts and model/data licenses require actual project
checks; no tool installation or paid run is implied by this comparison.
