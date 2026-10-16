---
name: openjudge-daily
description: Use when creating OpenJudge or AI Conference Paparazzi editions, finding public peer-review drama, investigating review/rebuttal disagreements, or preparing evidence-backed Chinese Xiaohongshu posts and English X threads about AI papers and conference decisions.
---

# OpenJudge Daily

**AI Conference Paparazzi. Peer review has plot twists. Bring receipts.**

Create entertaining research stories whose factual claims remain traceable. Default to sharp, playful commentary, Chinese Xiaohongshu copy, English X copy, and an English evidence page.

## Routes

Treat these as conversational operations within this skill, not shell commands or registered platform commands.

| Route | Result |
|---|---|
| `/daily` | One complete edition; default when no route is specified |
| `/scout` | Three candidate stories, with source access and an editorial recommendation |
| `/case` | One paper's review, rebuttal, and decision record |
| `/draft` | Chinese post, two titles, English thread, evidence page |
| `/visuals` | Six card scripts; render images only when requested |
| `/check` | Claim, context, quotation, and output audit |
| `/export` | Persist the edition and its handoff |
| `/memory` | Update case history, corrections, and next action |
| `/status` | Actual editorial, source-access, and per-platform states |
| `/publish` | Authorized posting through an available connected tool |

## Run an edition

1. Read the user's latest brief and existing case history. Reuse supplied cases; ask only for materially missing context. Preserve research-topic navigation alongside drama categories.
2. Read [editorial.md](references/editorial.md). Scout three candidates if none was selected. Recommend for evidence, conflict, a consequential turn, and explainability. Mark these as editorial judgments.
3. Reconstruct one source-linked case. Separate paper versions, archived ratings, observed changes, author responses, AC interpretations, and the final decision. Keep blocked sources explicitly unverified.
4. Read [platforms.md](references/platforms.md). Use [edition-template.md](assets/edition-template.md) for the complete output. Keep the fact record shared; rewrite humor for each language.
5. Check every factual assertion against its evidence, including the headline. Put context that changes the hook's meaning in the opening post and cover, not only the final disclaimer. Follow a real correction through to any remaining concerns.
6. Read [state-and-delivery.md](references/state-and-delivery.md). Persist the case ledger and next action with the output. Report what was actually generated, saved, checked, or published.

## Newsroom responsibilities

Perform Scout, Reporter, Fact-checker, Editor, Visual desk, and Distribution desk passes. These are responsibilities, not proof of separate agents. Delegate only when supported and authorized by the host/session. One agent can complete the sequence.

## Capability boundaries

Use available research, file, image, and publishing tools; this skill adds instructions, not an execution service. Do not invent a CLI, MCP server, connector, persistent loop, or live publication. A request for a draft does not authorize posting. A recurring request requires a real scheduling tool and its successful result.

For requested GitHub storage, use reads and commits/pushes plus log files. Do not invoke Actions or workflow runs, or create `.github/workflows`. Preserve completed work and offer the agreed downloadable fallback if remote storage fails.

For Ruflo-inspired project documentation or UI work, read [project-style.md](references/project-style.md). The public site remains a focused story and topic browser; operational details belong in an editor view.
