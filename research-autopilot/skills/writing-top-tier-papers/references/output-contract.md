# Full-Paper Output Contract

## Operation-specific deliverables

| Operation | Manuscript artifact | Required package |
|---|---|---|
| `build` | Create when requested and evidence permits | Paper brief, blueprint, manuscript, ledgers, visual/supplement plan, compliance note |
| `restructure` | Revised artifact or proposed revision | All build outputs plus source-to-destination change map |
| `revise` | Revised artifact or proposed revision | All build outputs plus issue-to-change ledger |
| `retarget` | Venue-adapted artifact or proposed revision | All build outputs plus compliance delta and evidence-preserving remap |
| `diagnose` | **None; do not mutate the manuscript** unless the user separately authorizes expansion | Diagnosis, claim/evidence gaps, repair blueprint, exact required inputs |

## Default full-package deliverables

Unless the user narrows the request, deliver:

1. manuscript state and venue contract;
2. one-sentence thesis and argumentative spine;
3. claim–evidence matrix;
4. full-paper section and paragraph blueprint;
5. revised or drafted manuscript in the requested format;
6. citation ledger/audit;
7. visual and table manifest;
8. separate design pack for every numbered non-table figure;
9. appendix, Extended Data, or supplementary plan;
10. change map for restructure/revise/retarget operations;
11. venue-compliance note with official URLs and access dates;
12. prioritized open issues.

If the user requests planning only, omit manuscript prose but retain the complete blueprint, evidence, citation, visual, and supplementary architecture. In `diagnose`, return only its operation-specific package.

## 1. State and venue contract

Begin with:

- state: `Complete`, `Complete with named gaps`, or `Diagnostic only`;
- operation and narrative mode;
- target venue/journal, article/track, year, and stage;
- target reader and manuscript language;
- verified official sources and access dates;
- current blocking gaps.

Never say “submission-ready” when any required evidence, citation, anonymity, render, or compliance check remains unresolved.

## 2. Paper brief

Include:

- one-sentence thesis;
- importance → gap → response → evidence → implication spine;
- central contribution and supporting contributions;
- explicit scope boundary;
- terms and notation that require early definition.

## 3. Claim–evidence matrix

Use one row per proposition, not one row per section:

| ID | Claim | Type/importance | Evidence required | Evidence present | Scope | Locations | Status | Action |
|---|---|---|---|---|---|---|---|---|

Make contradictions and missing evidence visible. Link every high-visibility claim to a row.

## 4. Full-paper blueprint

For every section provide:

- section purpose/question;
- reader takeaway;
- claims and evidence;
- relative word/page budget tied to the verified limit;
- figure/table/equation insertions;
- relationship to previous and next sections.

For every paragraph provide:

- paragraph ID and rhetorical job;
- topic/claim sentence;
- evidence or source needed;
- citation anchors;
- figure/table callout if any;
- required qualification;
- transition.

Do not impose a fixed number of paragraphs or figures. The blueprint must be detailed enough that prose can be drafted without rediscovering the argument.

## 5. Manuscript artifact

For `build`, `restructure`, `revise`, or `retarget`, create or edit the requested LaTeX, DOCX, Markdown, or other authorized artifact. Preserve the user's existing template unless retargeting requires a verified change. Do not overwrite unrelated work. For `diagnose`, do not create or edit a manuscript artifact unless the user explicitly expands the operation.

The manuscript must maintain:

- consistent title/abstract/introduction/results/conclusion claims;
- stable notation and terminology;
- exact numbers, units, metric directions, and comparison conditions;
- correctly ordered and called-out figures/tables;
- visible placeholders only in a clearly labeled working draft;
- anonymity and stage requirements.

Before a clean handoff, remove unresolved placeholders from manuscript prose and list the gaps externally. A working draft may retain them; any retained placeholder blocks submission-ready or `Complete` status.

## 6. Citation audit

Provide:

| Claim/anchor | Citation key/source | DOI/URL or supplied-file locator | Page/section/table/figure locator | Metadata | Entailment | Body or caption placement | Disposition |
|---|---|---|---|---|---|---|---|

List missing citations separately and specify the proposition each must support. Do not hand off fabricated or guessed bibliography entries.

## 7. Visual/table manifest

For each item record:

| ID | Role | Claim/question | Section and first callout | Source data/facts | Exact design skill | Production route | Caption/provenance | Status |
|---|---|---|---|---|---|---|---|---|

The design-skill field must name `designing-pipeline-figures` or `designing-experiment-figures`; the production field separately names plotting/code, editable vector/diagram tooling, deterministic composition, or `imagegen`. Distinguish main-text, appendix, Extended Data, and supplementary items. Record why each item earns its space and which claim loses support if it is removed.

## 8. Figure design packs

Create one file/record per non-table numbered figure. Each includes:

- fact lock;
- three-second takeaway;
- exactly three compatible candidates;
- a complete independent executable specification for every candidate: image-generation prompt only for conceptual raster art, programmatic specification for quantitative evidence, or vector-diagram specification for exact pipelines;
- caption, alt text, accessibility, negative constraints, production, and QA details;
- recommended candidate and rationale.

Tables intentionally have no image prompt.

## 9. Appendix/Extended Data/supplementary map

Use the actual venue terminology. Provide:

| Item | Duty | Main-text dependency | Destination | Callout | Why not main text | Required evidence/status |
|---|---|---|---|---|---|---|

Organize by reproducibility, methodological/proof depth, secondary evidence, and transparent boundaries. Do not use supplement as a dumping ground.

## 10. Change map

Required for `restructure`, `revise`, and `retarget`:

| Source location | Action | Destination | Reason | Claim/evidence impact | Citation/visual impact |
|---|---|---|---|---|---|

Use `keep`, `rewrite`, `split`, `merge`, `move`, or `cut`. Preserve traceability so the user can review substantive changes.

## 11. Compliance note

Record each checked rule:

| Rule | Exact venue/article/track/stage | Official source | Access date | Manuscript consequence | Status |
|---|---|---|---|---|---|

Separate verified requirements from author preference or community convention.

## 12. Open issues

Prioritize:

1. blocks submission or invalidates the central claim;
2. weakens a primary claim;
3. affects reproducibility, ethics, anonymity, or compliance;
4. improves clarity or presentation but is optional.

For every issue name the exact missing input or decision and the smallest useful resolution. Avoid vague “more work is needed.”

## Handoff checklist

- Required artifact opens and renders.
- Claim matrix and manuscript agree.
- All numbers have a source and consistent formatting.
- Citation metadata and entailment are audited or marked unresolved.
- Figures/tables are called out in order and placed appropriately.
- Each numbered main-text, appendix, Extended Data, and supplementary non-table figure has a separate three-option design pack.
- Tables remain editable native objects.
- Main claims do not depend on inaccessible supplement.
- Current venue rules are verified or marked provisional.
- Remaining gaps are named and prioritized.
