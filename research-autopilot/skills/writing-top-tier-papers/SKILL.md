---
name: writing-top-tier-papers
description: Use when planning, drafting, restructuring, revising, or retargeting a complete Nature-style research article or leading AI-conference paper from evidence, notes, figures, tables, references, LaTeX, DOCX, PDFs, or reviewer feedback, where full-manuscript coherence or cross-section revision is required. Use for narrative, section architecture, claim–evidence alignment, citation placement, figure/table planning, appendix or Extended Data design, and venue-aware layout. Do not use for isolated paragraph or section polishing, a standalone rebuttal or response letter without manuscript revision, a single figure alone, generic academic-writing advice, literature review alone, or running new experiments.
---

# Writing Top-Tier Papers

## Purpose

Build the strongest complete manuscript the supplied evidence supports. Treat the paper as a claim–evidence system, not as prose expansion or a chronological lab report. Calibrate scope first, then state supported claims directly.

Choose one primary narrative profile:

- **Nature-journal profile** for flagship Nature or another Nature-family journal after the exact journal, article type, and stage are identified.
- **AI-conference profile** for venues such as ICML, NeurIPS, ICLR, ACL, CVPR, or AAAI after the exact year, track, and stage are identified.
- **Provisional venue-neutral profile** when the target is missing. It supplies scientific architecture only; every format decision remains provisional.

The **hybrid treatment is an overlay, not a peer mode**. For a Nature-family AI journal, use the Nature-journal profile as primary and add AI technical/evidence traceability. For an AI conference seeking broad interdisciplinary framing, use the AI-conference profile as primary and add Nature-style accessibility. The exact venue always controls format and policy.

The manuscript language follows the user's requested language and target venue. Planning artifacts may use the user's working language unless asked otherwise.

## Non-negotiable principles

1. **Evidence before eloquence.** Never invent experiments, results, statistics, implementation details, citations, quotations, licenses, or reviewer expectations.
2. **One defensible thesis.** Title, summary or abstract, introduction, results, limitations, and conclusion must express the same central contribution at compatible strength.
3. **Argument, not chronology.** Organize results by scientific or technical questions and their evidentiary duties, not by the order experiments were run.
4. **Confident prose, honest limits.** Narrow a claim until the evidence supports it, then state it directly. Preserve material assumptions and unfavorable results.
5. **Current rules beat remembered conventions.** Never treat Nature titles, Nature Communications, other Nature-family journals, or different conference years and tracks as interchangeable.
6. **Core evidence stays visible.** Do not move evidence essential to the headline claim into optional supplementary material merely to save space.
7. **Visuals are evidence-bearing objects.** Every numbered non-table figure gets its own grounded design record and three independently executable candidate design specifications. Tables remain native tables and get no image-generation prompt.

## Scope and authorization

This skill handles writing and full-manuscript layout by default. It may inspect supplied artifacts, verify public venue rules, map citations, design visuals, edit an authorized manuscript, and render it for layout review.

Unless explicitly requested, do not:

- run training, experiments, evaluation, or statistical tests;
- perform an exhaustive literature review or make priority claims;
- alter raw evidence to improve the narrative;
- decide authorship or contributor credit;
- submit a manuscript, contact editors or coauthors, or upload external artifacts;
- expose identities in an anonymous submission.

When evidence is missing, use precise markers such as `[RESULT NEEDED: comparison and setting]`, `[CITATION NEEDED: claim]`, or `[TO CONFIRM: implementation detail]`. Do not silently fill gaps.

## Skill-composition recipes

This skill owns manuscript argument, evidence state, and cross-artifact consistency. Compose other skills only for their specialized mechanics:

| Situation | Combine, in order | Responsibility split |
|---|---|---|
| Prior shared draft, decision, or “continue our paper” | `personal-context`, then `openai-library:library` only for Library-backed artifacts | Recover prior decisions/files; this skill rebuilds the paper argument |
| PDF sources or compiled paper | `pdf` → this skill → `pdf` | Inspect source/page structure, synthesize manuscript, then render and verify |
| DOCX manuscript | this skill + `documents` | This skill controls scholarly structure; `documents` edits and visually verifies Word |
| XLSX/CSV/Sheets results | `Spreadsheets` → this skill → `designing-experiment-figures` → plotting/code | Validate data first, then map claims, design evidence, and produce exact plots |
| Method plus experimental figures | this skill → `designing-pipeline-figures` and `designing-experiment-figures`, one figure class at a time | Do not force method diagrams and evidence plots into one visual grammar |
| Conceptual motivation illustration | `designing-pipeline-figures` or `designing-experiment-figures` by dominant content → optional `imagegen` → `pdf`/`documents` QA | Design first; generate only non-quantitative raster art; audit at final size |
| Current venue rules or external citations | web research on official/primary sources → this skill | Search verifies policy/evidence; this skill controls placement and claim strength |
| arXiv or Hugging Face paper page supplied | `hugging-face:huggingface-papers` when available → this skill | Retrieve structured paper information; verify claim support before citation |

Do not invoke every skill by default. Use the smallest composition that covers the supplied artifact types and requested deliverables.

## Start by choosing the operation

Classify the request before touching prose:

| Operation | Use when | Required output emphasis |
|---|---|---|
| `build` | Notes, results, and fragments must become a paper | Thesis, blueprint, then manuscript |
| `restructure` | A complete draft has weak order or argument | Claim map, move/merge/split map, revised structure |
| `revise` | The structure is usable but writing/evidence alignment is weak | Tracked change map, calibrated prose, consistency audit |
| `retarget` | A manuscript is moving to another venue or article type | New venue contract, evidence-preserving remap, compliance deltas |
| `diagnose` | The user wants analysis without edits, or evidence is too incomplete | Failure diagnosis, exact missing inputs, repair plan |

Operation controls deliverables:

| Operation | Manuscript mutation | Minimum handoff |
|---|---|---|
| `build` | Create only when requested/authorized | Blueprint, manuscript, ledgers, visual/supplement plan |
| `restructure` | Revise an authorized artifact or return a proposed revision | Blueprint, change map, revised manuscript, audits |
| `revise` | Revise an authorized artifact or return a proposed revision | Issue-to-change map, revised manuscript, audits |
| `retarget` | Revise an authorized artifact or return a proposed revision | Venue delta, remap, revised manuscript, audits |
| `diagnose` | **No manuscript edits** unless the user separately expands scope | Diagnosis, claim/evidence gaps, repair blueprint, exact next inputs |

Then choose the primary profile and any overlay. Read only the relevant mode reference:

- Nature: [references/nature-mode.md](references/nature-mode.md)
- AI conference: [references/ai-conference-mode.md](references/ai-conference-mode.md)
- Hybrid overlay: read both and explicitly resolve conflicts in favor of the primary venue's official instructions.
- Provisional venue-neutral: do not load venue-specific structure as a rule; use only the invariant workflow and mark formatting provisional.

Load detailed references only when their branch applies:

- Claims, citations, drafting, or evidence diagnosis: [references/evidence-citations-prose.md](references/evidence-citations-prose.md)
- Figures, tables, appendix/Extended Data visuals, or full-paper visual planning: [references/visual-orchestration.md](references/visual-orchestration.md)
- Full blueprint, manuscript package, restructure/revise/retarget handoff: [references/output-contract.md](references/output-contract.md)

Read [references/source-entrypoints.md](references/source-entrypoints.md) whenever venue rules, literature, or external source verification is required.

## Intake and venue contract

Inventory the supplied artifacts before drafting. Record:

- target venue, journal, article type, year, track, and submission stage;
- official template or manuscript format;
- research question and intended audience;
- candidate contribution and the user's non-negotiable claims;
- available manuscript, notes, code description, figures, tables, raw or aggregated results, bibliography, reviews, and supplementary files;
- anonymous/non-anonymous status and any restricted identifiers;
- facts that are measured, derived, illustrative, missing, or disputed.

If a formatting-sensitive target is named, verify the official author instructions for that exact target year, track/article type, and stage—not merely the newest page available. Record the URL, page update/access date, stage, and rule affected. Check at minimum:

- article or track eligibility;
- template and allowed modifications;
- what counts toward length limits;
- title, summary/abstract, section, and reference constraints;
- anonymity, self-citation, external-link, and acknowledgement rules;
- current authorship and AI-assistance disclosure policy when applicable;
- Methods, data/code availability, ethics, limitations, reproducibility, checklist, appendix, Extended Data, and supplementary-material policies;
- figure, table, caption, resolution, font, file-format, and accessibility requirements;
- differences between initial submission, revision, accepted manuscript, and camera-ready.

If venue, year, track/article type, or stage is missing, ask when the answer materially changes the deliverable; otherwise create a venue-neutral scientific blueprint and label the entire format contract provisional. If official pages conflict, prefer the more stage-specific instruction, then the later-updated instruction; record the conflict and block `Complete` or format-complete status until it is resolved. If live verification is unavailable, do not state remembered rules as current facts.

## End-to-end workflow

### 1. Normalize the evidence

Extract claims, methods, numbers, comparisons, uncertainty, datasets, cases, and citations into a source ledger. Preserve exact units, metric directions, evaluation conditions, aggregation, sample unit, and provenance. Separate supplied facts from interpretations.

Use appropriate artifact skills when needed:

- `pdf` to inspect source or compiled PDFs where page and visual structure matter;
- `documents` to edit and visually verify DOCX manuscripts;
- `Spreadsheets` to inspect XLSX, CSV, TSV, or Sheets-based evidence before plotting;
- ordinary code or manuscript tools to inspect LaTeX, BibTeX, logs, and plot data.

### 2. Write the paper brief

Produce:

- one-sentence thesis: setting/problem → central idea or discovery → principal outcome → evidence basis;
- causal or argumentative spine: importance → gap → response → evidence → implication;
- intended reader and assumed knowledge;
- scope boundary and what the paper does not establish;
- smallest coherent set of contributions.

Reject a contribution that is only an implementation detail, a section summary, an unsupported novelty claim, or a result without intellectual significance.

### 3. Build the claim–evidence matrix

For every headline and supporting claim, record:

| Field | Meaning |
|---|---|
| Claim ID and exact wording | The proposition the paper asks readers to accept |
| Importance | Primary, supporting, contextual, or boundary |
| Required evidence | What would logically support this kind of claim |
| Available evidence | Exact table, figure, derivation, observation, or source locator |
| Scope and assumptions | Where the proposition applies |
| Manuscript locations | Title, abstract/summary, introduction, results, conclusion, etc. |
| Status | Supported, narrow, qualify, missing, contradictory, or cut |
| Action | Draft, request input, move, add citation, or remove |

Different verbs demand different evidence. “Improves,” “generalizes,” “is robust,” “explains,” “causes,” “is efficient,” and “is state of the art” are not interchangeable. If the evidence cannot support the verb, narrow or remove the claim.

### 4. Design the full-paper blueprint before long prose

Build the section and paragraph architecture from the thesis and claim matrix. For every section state:

- the question it answers;
- its one-sentence takeaway;
- claims advanced and evidence used;
- paragraph jobs in reading order;
- citation anchors;
- equations, figures, and tables with first-callout positions;
- transition into the next section;
- a relative space budget derived from the verified limit.

Do not hard-code a universal number of introduction paragraphs, main figures, result subsections, pages, ablations, or appendix sections. Allocate space by argumentative value. Protect the evidence for primary claims first.

### 5. Plan citations at claim level

Build a citation ledger before final prose. Cite the smallest proposition supported by a source. Use primary sources for named methods and original findings; use reviews for synthesis. Verify both metadata and entailment. Follow [references/evidence-citations-prose.md](references/evidence-citations-prose.md).

### 6. Orchestrate figures and tables

Create a visual/table manifest while building the blueprint, not after drafting. The Introduction receives a motivation or hero Figure 1 when the user asks for one; its precise form depends on evidence, not convention.

For every numbered main-text, appendix, Extended Data, or supplementary non-table figure, create a separate design pack such as `figure-prompts/fig-01-motivation.md`. Make two explicit routing decisions.

**Design route:**

- `designing-pipeline-figures` for motivation mechanisms, methods, architectures, systems, agents, training, or inference flows;
- `designing-experiment-figures` for benchmarks, ablations, scaling, trade-offs, mechanisms supported by measurements, robustness, qualitative results, or error analysis.

Use both skills when a paper contains both artifact classes, processing one figure class at a time. For a hybrid figure, route by its dominant content or split it if neither content type is subordinate.

**Production route:** choose plotting/code, editable vector/diagram tooling, deterministic composition, or—only for genuinely conceptual raster art—`imagegen`. Every quantitative figure still passes through `designing-experiment-figures` for design, then uses plotting/code for production; `imagegen` is never its production route.

Each design pack must contain exactly three fact-compatible candidate designs, each with a fully standalone executable specification, caption, alt text, accessibility rules, and negative constraints. Use an **image-generation prompt** only for conceptual raster art, a **programmatic-figure-spec** for quantitative evidence, and a **vector-diagram-spec** for exact pipelines. Tables have a native layout specification and caption, never an image prompt. Follow the complete contract in [references/visual-orchestration.md](references/visual-orchestration.md).

### 7. Draft in dependency order

Draft the paper body from stable evidence, then synchronize the framing:

1. results/evidence narrative and method dependencies;
2. method or discovery explanation;
3. introduction and related positioning;
4. title and summary/abstract;
5. limitations/discussion and conclusion;
6. captions, cross-references, availability statements, appendix or Extended Data.

This is a drafting order, not necessarily the final section order. Keep notation, terminology, metrics, dataset names, numerical values, and claim strength consistent throughout.

### 8. Apply the anti-overdefense pass

For each central sentence:

1. identify the exact evidence boundary;
2. narrow the proposition to that boundary;
3. replace vague hedging with a direct supported statement;
4. retain local qualifications that materially change interpretation;
5. move only generic or paper-wide caveats into Limitations.

Do not hide null, negative, or contradictory results. Preserve the complete underlying result matrix and all materially adverse entries. A full secondary table may move to an allowed supplement, but the main text must retain any null, negative, or contradictory result that changes interpretation. Call an outcome a “trade-off” only when the evidence establishes two opposing quantities under comparable conditions; otherwise report the pattern neutrally and narrow the claim. Never expose design specifications, revision history, failed drafts, or writing instructions in the manuscript.

### 9. Build the appendix, Extended Data, or supplementary package

Use the exact venue's allowed artifact classes. Map every supplementary item to one of four duties:

- reproducibility;
- proof or methodological depth;
- secondary evidence and robustness;
- transparent boundaries, failures, ethics, or disclosures.

Main-text claims must remain interpretable without optional material. Cross-reference supplementary items precisely. Apply the same fact, citation, caption, design-pack, and accessibility standards to every numbered appendix, Extended Data, and supplementary non-table figure.

### 10. Render and audit

Use the authoring-format skill to create or edit the manuscript and inspect the final rendering:

- LaTeX/PDF: compile, then use `pdf` for page-by-page and final-size figure review;
- DOCX: use `documents` and its render-and-verify workflow;
- spreadsheet-backed evidence: use `Spreadsheets` before any definitive table or plot;
- exact quantitative visual: use plotting/code, export editable/vector output when possible, and inspect at manuscript size;
- conceptual raster illustration only: `imagegen`, followed by scientific-fidelity audit.

Audit float order, first callouts, caption legibility, panel labels, cross-references, bibliography, equations, line breaks, widows/orphans, anonymity, margins, font sizes, and all stage-specific requirements. Never “fix” overflow by violating the template.

## Quality gates

Do not call the manuscript complete until all applicable gates pass:

- **Argument:** one thesis; every section advances it; contributions are coherent and falsifiable.
- **Evidence:** every headline claim maps to traceable evidence; missing or contradictory evidence is visible.
- **Prose:** direct wording with honest boundaries; no generic apology loops or unsupported superlatives.
- **Citations:** adjacent claim support, verified metadata, no fabricated entries, and correct visual provenance.
- **Visuals:** every numbered non-table figure has its own three-option design pack and fact lock; exact data are never rendered by generative imagery.
- **Tables:** exact provenance, metric direction, uncertainty/aggregation, emphasis rule, notes, caption, and native editable form.
- **Supplement:** main claims do not depend on inaccessible optional material.
- **Consistency:** claims, terminology, notation, numbers, and captions agree across the full paper.
- **Compliance:** exact venue, article/track, year, and stage checked against current official sources or marked unverified.
- **Rendering:** manuscript inspected at normal reading scale and figures at final reproduction size.

## Completion state

Lead the handoff with one of:

- **Complete:** all requested artifacts and applicable quality gates pass; no unresolved placeholder remains in a clean manuscript.
- **Complete with named gaps:** the manuscript is usable, but enumerated evidence, citation, or compliance items remain.
- **Diagnostic only:** insufficient evidence or authorization for manuscript edits; provide the repair blueprint and exact missing inputs.

Placeholders may remain inside a clearly labeled working draft. Before a clean handoff, remove them from the manuscript and report unresolved gaps externally; any remaining placeholder blocks submission-ready status. Never describe a paper as submission-ready while blocking gaps remain. Use the complete deliverable structure in [references/output-contract.md](references/output-contract.md).
