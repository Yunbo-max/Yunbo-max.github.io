# OpenJudge

**AI Conference Paparazzi** · AI Conference 狗仔队

### Peer review has plot twists. Bring receipts.

Turn public papers, reviews, rebuttals and decisions into sharp, funny research stories for **Xiaohongshu**, **X** and an **English evidence archive**.

[Explore the cases](https://openjudge.longyunbo218.chatgpt.site/) · [Project page](https://yunbo-max.github.io/openjudge/) · [Read the skill](skills/openjudge-daily/SKILL.md) · [Project design](docs/project-design.md)

## Start with one story

Give an agent the [OpenJudge Daily skill](skills/openjudge-daily/SKILL.md), or install the complete `skills/openjudge-daily/` folder using your host's skill installation flow. Keep its `references/`, `assets/` and `agents/` folders together.

Then ask:

> Use $openjudge-daily /daily. Find three public peer-review stories about language-model architecture. Pick the strongest supported plot twist. Prepare a Chinese Xiaohongshu post with six card scripts, an English X thread and an English evidence page. Make it funny, keep the sources visible and save a handoff for the next edition.

Already have a paper?

> Use $openjudge-daily /case with this public paper or OpenReview URL. Follow the reviews, rebuttal and final decision. Find the real disagreement before writing the hook.

**Available now:** an instructional skill, platform writing guidance, an edition template and a state/handoff contract. The host agent supplies research and file tools. Social publishing requires an authorized connection; daily scheduling requires a scheduling tool. This package does not install either service.

## One case, three editions

| Destination | What the workflow prepares |
|---|---|
| Xiaohongshu | Two Chinese titles, a post, exactly six card scripts, tags and a discussion question |
| X | A 4–6 post English thread with an opening hook, context and source links |
| OpenJudge | An English evidence page: timeline, technical disagreement, decision, sources and corrections |

The fact record is shared. The jokes and pacing are written for each audience. Card images are rendered when requested through an available image tool; the default output contains card scripts.

## Meet the newsroom

| Desk | Responsibility |
|---|---|
| Scout | Compare three candidates for evidence, conflict and a consequential turn |
| Reporter | Reconstruct the paper, review, rebuttal and decision timeline |
| Fact-checker | Check the hook and every claim, including counter-evidence |
| Editor | Write Chinese and English editions with a clear point of view |
| Visual desk | Give each of the six cards one job and the necessary context |
| Distribution desk | Export the package and track delivery separately for each platform |

These are editorial passes. One agent can carry out the workflow; separate agents are optional.

## The command vocabulary

These routes are instructions within the skill, not installed CLI commands or registered platform commands.

| Route | Result |
|---|---|
| `/daily` | One complete edition |
| `/scout` | Three candidates and an editorial recommendation |
| `/case` | A source-linked case investigation |
| `/draft` | Chinese post, English thread and evidence page |
| `/visuals` | Six card scripts; images when requested |
| `/check` | Claim, context and packaging audit |
| `/export` | Saved edition and handoff |
| `/memory` | Case history, corrections and next action |
| `/status` | Actual editorial, evidence and delivery states |
| `/publish` | Authorized posting through an available connection |

## Find the drama. Keep the context.

Research topics remain the main way to browse the collection. A second set of shelves follows the story: **Scores vs. outcomes**, **Reviewers disagree**, **Rebuttal plot twists**, **Claims meet experiments** and **Conference process**.

Build the punchline around an observable contradiction. Keep quotations, translations, paraphrases and commentary distinct. Follow a corrected misunderstanding through to any remaining objections. A score discrepancy alone does not explain a decision.

If a qualification changes the hook, put it on the cover and in the opening post. For example, the [ICLR 2026 retrospective](https://blog.iclr.cc/2026/03/31/a-retrospective-on-the-iclr-2026-review-process/) describes a pre-rebuttal score reset; archived ratings must be interpreted in that context. Keep anonymous reviewers identified only by their public labels.

## Sources, state and tomorrow's edition

Record whether each source was read directly, read through an archive, supplied as an extract or blocked. Retain the source URL and the specific claim it supports. A blocked original stays explicitly unverified.

Each edition has a stable case ID and a recorded stage: `proposed → researched → draft → checked → exported → published`. Evidence status and per-platform publication status are tracked separately. Read the case history before selecting the next story; retain confirmed post IDs if a thread was only partly published.

The [edition template](skills/openjudge-daily/assets/edition-template.md) and [delivery contract](skills/openjudge-daily/references/state-and-delivery.md) define the outputs: `case.json`, `sources.md`, `xiaohongshu.md`, `cards.md`, `x-thread.md`, `evidence-page.md`, `checks.md` and `handoff.json`, plus a project-level `case-history.jsonl`.

## Inside this project

| File | Purpose |
|---|---|
| [SKILL.md](skills/openjudge-daily/SKILL.md) | Entry point and routes |
| [Editorial guide](skills/openjudge-daily/references/editorial.md) | Sources, ratings, chronology and claims |
| [Platform guide](skills/openjudge-daily/references/platforms.md) | Xiaohongshu cards and English X threads |
| [State and delivery](skills/openjudge-daily/references/state-and-delivery.md) | Handoffs, deduplication and publishing receipts |
| [Project style](skills/openjudge-daily/references/project-style.md) | Brand, documentation and interface direction |
| [Project design](docs/project-design.md) | Scope, product surfaces and future implementation |
| [Update log](docs/github-update-log.md) | Changed files and verification scope |

## Design reference

Inspired by [Ruflo](https://github.com/ruvnet/ruflo): a strong identity, an immediate starting point, explicit responsibilities and readable workflow tables. OpenJudge adapts those presentation patterns to an editorial desk. Ruflo is not a runtime dependency, and no Ruflo code or assets are included.

The public collection and this editorial skill are separate surfaces. A full editor console, native CLI/MCP service and connected social publishers are future implementation work.
