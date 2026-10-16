# OpenJudge

**AI Conference Paparazzi**

### Peer review has plot twists. Bring receipts.

Turn public papers, reviews, rebuttals, and decisions into a daily research story for Xiaohongshu, X, and the OpenJudge archive.

**Project design and README draft · 16 October 2026 · English-first public presentation**

[Explore OpenJudge](https://openjudge.longyunbo218.chatgpt.site) · [Research homepage](https://yunbo-max.github.io/openjudge/) · [Design reference: Ruflo](https://github.com/ruvnet/ruflo)

## Start with one story

Ask an agent with the OpenJudge Daily skill:

> Use $openjudge-daily to find three public peer-review stories about language-model architecture. Select the strongest supported story and prepare a Chinese Xiaohongshu edition, an English X thread, and an English evidence page. Keep the voice sharp and funny. Save a handoff so the next edition does not repeat this case.

The skill is an editorial workflow for an existing agent. It is not a standalone model, background worker, npm package, or connected social publisher. The operation names below are conversational routes, not installed shell commands.

## Meet the newsroom

| Desk | Responsibility | Deliverable |
|---|---|---|
| Scout | Find public disagreements worth following | Three candidate briefs |
| Reporter | Reconstruct the review and decision timeline | Source-linked case record |
| Fact-checker | Test the hook against the full record | Claim-by-claim checks and limitations |
| Editor | Write the story with an identifiable voice | Chinese and English editions |
| Visual desk | Structure the six-card reading sequence | Cover and card copy with source footers |
| Distribution desk | Package outputs and track delivery | Exports and separate platform states |

These are responsibilities. One agent can perform them in sequence. Multi-agent execution is optional and depends on the host's supported capabilities and the task's authorization.

## A small command vocabulary

| Route | What to ask for |
|---|---|
| `/daily` | Run one editorial edition end to end |
| `/scout` | Find and compare three candidate stories |
| `/case` | Investigate one public paper or discussion |
| `/draft` | Write Chinese Xiaohongshu and English X copy |
| `/visuals` | Prepare six cards and, when requested, render them |
| `/check` | Audit the claims, dates, framing, and platform packaging |
| `/export` | Save the edition and its source record |
| `/memory` | Update the case history, corrections, and next action |
| `/status` | Show the actual source, editorial, and publishing states |
| `/publish` | Use an authorized, connected publishing tool when available |

Example: “Use $openjudge-daily /scout: attention and sequence models, three candidates.”

## One case, three editions

| Destination | Editorial format |
|---|---|
| Xiaohongshu | Two title choices, a Chinese post, six card scripts, and a discussion question |
| X | An English opening post and a compact thread, with the necessary context and source links |
| OpenJudge | An English evidence page with the paper, timeline, arguments, interpretation, and corrections |

The Chinese and English versions share a fact record. Their jokes and pacing are written for their audiences rather than translated word for word.

## Follow the story through the system

Each edition has a stable case identifier and an explicit stage: proposed, researched, draft, checked, exported, or published. Source access is tracked separately from editorial progress. A well-formatted draft can still have an unresolved evidence gap.

When an original review is inaccessible, retain its URL and the accessible archive, attribute the archive explicitly, and mark the missing verification. Complete the supported writing; do not claim that the original was inspected.

Track Xiaohongshu and X publication independently. Exported files do not mean a post is live. A partially posted thread keeps the confirmed post identifiers so a retry can continue without duplicating the beginning.

## Story shelves

Keep the existing research topics as the primary retrieval axis. Add a secondary editorial classification:

- **Scores vs. outcomes:** a surprising result whose reasons deserve examination.
- **Reviewers disagree:** incompatible assessments of the same contribution.
- **Rebuttal plot twists:** an objection changes after evidence or clarification.
- **Claims meet experiments:** paper claims face their actual evaluation scope.
- **Conference process:** official procedure changes that alter how a case should be read.

Choose for conflict, a consequential turn, source quality, and explainability. These are editorial judgments, not measurements of misconduct or paper quality.

## Voice

Be technically literate, concise, playful, and specific. Build the joke around an observable contradiction. Keep quotations, translations, paraphrases, and editorial commentary distinguishable.

Illustrative recurring lines:

> 今日顶会大戏，原文链接已备好。

> I brought a calculator to peer review. The AC brought an argument.

Use the strongest counter-evidence inside the story. If it changes the meaning of the hook, include it on the opening card and in the opening post. Anonymous reviewers remain anonymous. Do not turn a numerical discrepancy into an unsupported accusation.

## The visual direction

Borrow Ruflo's strong identity, immediate start point, readable capability tables, concrete examples, and visible task state. Adapt the control-console idea into a compact editorial desk.

For the public site, use a dark masthead, a warm light reading surface, and one restrained red accent. Reserve monospaced labels for edition numbers and status. Keep paper text readable, limit decorative motion, and respect reduced-motion preferences.

The home page has one featured daily story, topic search, and an archive list. On mobile these stack vertically. Each story card shows a title, a short hook, the research topic, and an honest evidence label. Do not fill the homepage with an agent graph or operational logs.

For social cards, keep one claim per frame. Place the supporting evidence or material qualification beside it. Exact quotations and numbers use text typesetting or faithful captures of original sources; generated illustrations are decorative, not evidence.

## Scope of the first release

The first implementation is the `openjudge-daily` instructional skill: a main entry point, host-facing metadata, an edition template, and four focused references covering editorial evidence, platform editions, state/delivery, and project style. It produces content through the host agent's tools and records a handoff using the specified output contract. Publishing remains an adapter to actual host tools.

The following require separate implementation and verification before being advertised as live: a redesigned public website, native slash-command registration, a standalone CLI/MCP service, connected X/Xiaohongshu posting, and recurring scheduling.

For requested GitHub persistence, use normal reads and commits/pushes with results in log files. Do not create or invoke GitHub Actions, workflow runs, or `.github/workflows`. If persistence is unavailable, preserve the work and provide the agreed downloadable fallback.

## Implementation choices

| Approach | Trade-off | Decision |
|---|---|---|
| Skill inside an existing agent | Small setup; uses the host's research and writing tools | First release |
| Skill plus an editorial web console | Easier visual management; requires application work | Follow after the editorial contract is proven |
| Full orchestration platform | More runtime control; substantial maintenance and integration work | Only if actual usage demands it |

## Acceptance checks

1. A case produces complete Chinese and English copy, six card scripts, and a linked evidence record.
2. Archived scores, final decisions, and predicted score changes remain separate.
3. An inaccessible primary source stays explicitly unverified.
4. The same case is recognized on a later run; a material update is labeled as a follow-up.
5. No publication or background execution is claimed without a corresponding tool result.
6. Skill metadata and internal references validate; a fresh agent can follow the workflow from a supplied case.

## Design references

- [Ruflo main README](https://github.com/ruvnet/ruflo/blob/main/README.md): strong identity, start-first documentation, modular capability presentation.
- [Ruflo workflows](https://github.com/ruvnet/ruflo/blob/main/plugins/ruflo-workflows/README.md): lifecycle and resumability.
- [Ruflo core](https://github.com/ruvnet/ruflo/blob/main/plugins/ruflo-core/README.md): explicit component responsibilities and verification contracts.
- [Xiaohongshu operations skill](https://github.com/Xiangyu-CAS/xiaohongshu-ops-skill): editorial positioning and platform-specific packaging.
- [Baoyu XHS images](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-xhs-images): a consistent multi-card sequence.
- [X skills](https://github.com/sergebulaev/x-skills): native English post/thread formats and separated drafting/publishing.

References were consulted for design patterns. This document does not imply affiliation, a dependency on Ruflo, or reuse of its implementation.
