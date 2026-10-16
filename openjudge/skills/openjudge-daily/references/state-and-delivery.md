# State and delivery

## Workspace and persistence

Use the user's selected project location. Otherwise use a task-scoped working directory and the host's normal persistent storage for deliverables. Read existing state before editing it. Write only task-owned paths and preserve unrelated files. A text handoff in chat is useful, but do not call it durably saved without a successful storage result.

Organize outputs as `editions/<edition-id>/` with `case.json`, `sources.md`, `xiaohongshu.md`, `cards.md`, `x-thread.md`, `evidence-page.md`, `checks.md`, and `handoff.json`. Keep a project-level `case-history.jsonl`. The host may persist this as an ordinary folder or an explicitly requested archive.

Use `openreview:<forum-id>` when known as the case ID. Otherwise derive a stable key from a DOI, canonical paper URL, or normalized title/year. Do not use the local edition date as the only case identifier.

## Case contract

`case.json` contains `case_id`, `title`, `conference`, `year`, `research_topics`, `story_category`, `edition_id`, `as_of`, `stage`, `evidence_verdict`, `sources`, `claims`, `score_snapshots`, `decision`, and `open_questions`.

Each source contains `source_id`, `url`, `kind`, `version`, `authored_at`, `retrieved_at`, `access_status`, and `supports`. Unknown dates are null; supplied extracts are not assigned fictitious retrieval times.

Each claim contains `claim_id`, `text`, `kind` (`fact`, `attributed_interpretation`, or `editorial_commentary`), `source_ids`, `support_level`, and `qualification`. Use `unresolved` for absent support. A joke cannot smuggle an unresolved factual premise into the fact record.

Each score snapshot includes the ratings, scale, stage, source IDs, snapshot date, and whether it is observed or predicted. Record the final decision separately.

## Handoff contract

`handoff.json` contains:

- `case_id`, `edition_id`, `stage`, `evidence_verdict`.
- `generated_outputs`, `saved_outputs`, and `storage_receipts` as separate fields.
- `unresolved_checks`, `next_action`, and `last_completed_action`.
- `publication` with independent `xiaohongshu`, `x`, and `website` objects. Each has `status`, `post_ids`, `urls`, and `last_confirmed_step`.
- `deduplication`: existing case IDs consulted, this case's angle, and whether it is a new edition or material follow-up.

Do not include credentials, cookies, or API tokens in any output or log.

## Lifecycle

Advance only with evidence: `proposed` → `researched` → `draft` → `checked` → `exported` → `published`. Use `draft` plus `evidence_verdict=provisional` while necessary evidence remains missing. If exporting a provisional draft, set the stage to `exported` but keep that verdict and unfinished checks intact; stage and verification are different dimensions.

Record failed actions without erasing completed ones. Reopen checks when sources or copy change. Record corrections as dated additions with affected claims and outputs; do not silently erase the old claim.

Before selecting tomorrow's case, check both drafted and published history. Reuse a case only for a material update or an explicitly requested new angle, labeled as a follow-up.

## Publishing

Discover and inspect an available service-specific publishing integration when posting is requested. Apply the user's authorization to the specified account and concrete content. If already authorized, do not demand redundant approval; if the user only requested content generation, keep publication at `not_requested`.

If no supported connection exists, deliver the complete post package and describe the missing connection accurately. Do not infer successful account access from having read a public repository. Do not install external publishing scripts, request secrets in chat, or bypass login checks as an implicit part of drafting.

For partial X threads, retain confirmed post IDs and resume the missing suffix only after checking actual remote state. Retry a failed operation at most once with the same method; then report the specific blocker and preserve the package. A visible Publish button or successful export is not a publication receipt.

`published` requires a returned post identifier/URL or equivalent confirmed remote state. Separate generated content, files saved, drafts placed in a platform editor, and public posts.

## Recurrence and GitHub

The word “daily” names the edition cadence. It does not create a scheduler. For an actual recurring request, use a supported scheduling tool, carry the timezone and persistence location into the task, and report the tool-confirmed schedule. Do not claim perpetual execution from a Markdown instruction.

Use GitHub only for authorized reads and ordinary file/commit/push persistence. Keep human-readable logs. Do not call Actions, workflow runs, `workflow_dispatch`, or create `.github/workflows`. If GitHub is blocked, keep the work and use the user's agreed downloadable fallback; never claim an unconfirmed push.
