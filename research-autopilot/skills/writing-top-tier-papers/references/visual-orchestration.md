# Visual and Table Orchestration

## Governing order

Choose visuals in this order:

> scientific claim → evidence/information topology → figure role → compatible layout family → production route → manuscript placement → final-size QA

Never choose a visual merely because a tool can generate it. Scientific facts, numerical evidence, causal strength, ordering, and metric semantics stay fixed; candidate designs may vary composition, reading path, and visual center.

## Two-stage router

First choose a **design route** for every non-table figure:

| Information topology | Mandatory design skill |
|---|---|
| Motivation mechanism, method, architecture, agent, training/inference process, system or causal flow | `designing-pipeline-figures` |
| Benchmark, ablation, scaling, trade-off, mechanism evidence, robustness, qualitative result, or error analysis | `designing-experiment-figures` |

Then choose a separate **production and QA route**:

| Need | Production/QA route | Constraint |
|---|---|---|
| Exact quantitative plot, heatmap, uncertainty, fitted curve, paired data, or statistical annotation | Plotting/code | Mandatory for measured quantitative evidence; export PDF/SVG when possible plus a raster preview |
| Exact pipeline labels, equations, arrows, branches, or dense notation | Editable vector/diagram tooling | Preserve editability and exact semantics |
| Real qualitative samples or evidence panels | Deterministic composition/code | Never substitute generated examples for observations |
| Conceptual illustration or illustration-led schematic | `imagegen` | Only when every scientific object can be audited; never a quantitative production route |
| Simple single-chart discussion preview | `answers-charts` | Preview only, never the authoritative paper figure |
| Source/final PDF inspection | `pdf` | Inspect source context and final manuscript-size rendering |
| DOCX assembly and visual QA | `documents` | Check placement, captions, cross-references, alt text, and page layout |
| Tabular/raw evidence | `Spreadsheets` | Inspect and verify before plotting or table formatting |

Every quantitative figure therefore uses `designing-experiment-figures` for scientific design and plotting/code for production. The design skill and production route are never alternatives to each other.

For a hybrid figure:

- route through `designing-pipeline-figures` when a small measured inset merely closes a process story;
- route through `designing-experiment-figures` when a small method inset merely explains the dominant evidence plot;
- split into two numbered figures when neither side is subordinate, unless the paper's argument truly needs one composite.

## Placement rules

1. Mention each figure or table in the body before it appears.
2. Place it close after the first substantive callout, following the paragraph that establishes why the reader needs it.
3. Put textual claim citations beside the relevant sentence; put reused visual provenance in the caption.
4. Define all non-obvious encodings, abbreviations, error bars, lines, fills, and selection rules in the caption.
5. Test legibility at final paper width, not only while zoomed in.

### Motivation or hero Figure 1

When requested, place Figure 1 in the Introduction after the problem, gap, and proposed response have been stated. Its three-second job is “why this paper matters.” It can show:

- baseline/problem → failure or unmet need → key intervention → intended consequence;
- phenomenon or representative observation → unresolved explanation → proposed resolution;
- a measured headline contrast when evidence, rather than mechanism, is the true motivation;
- a restrained composite with at most one compact, supplied-data result inset.

Do not turn it into an overcrowded mini-poster or duplicate a later result figure. Use the pipeline skill if mechanism is dominant; use the experiment skill if measured evidence is dominant.

### Method figure

Place after the Methods opening paragraph has named inputs, outputs, and novelty, before detailed component subsections. Preserve exact module order, state identity, branch/merge points, feedback destinations, training-only versus inference paths, and accepted/rejected/skipped states.

### Results figure

Place after the paragraph that poses the question and gives enough setup to interpret the axes. One panel must dominate at least 50% of usable area. Every supporting panel must test, explain, or qualify the same claim.

### Qualitative panel

Place after or beside the quantitative result it explains, not as an isolated gallery. Preserve case IDs, alignment, crop, preprocessing, scale, color mapping, and selection rule. Include failures when they materially qualify the claim.

### Appendix, Extended Data, or supplementary figure

Use the local numbering scheme and place after its first callout. Apply the same fact lock, three-option design, provenance, accessibility, caption, and final-size QA as for main figures.

## One design pack per numbered figure

Create a separate record/file for every main-text, appendix, Extended Data, or supplementary non-table numbered figure, for example:

```text
figure-prompts/
├── fig-01-motivation.md
├── fig-02-method.md
├── fig-03-main-results.md
└── fig-s01-robustness.md
```

A multi-panel numbered figure receives one design pack describing the complete composite and all panels. Different figure numbers never share a mega-specification.

Each pack must contain:

1. figure number, role, section, and intended width;
2. scientific question and three-second takeaway;
3. first-callout anchor and placement reason;
4. fact/evidence lock with source locators;
5. visual center and information/data topology;
6. separate design route and production route;
7. exactly three compatible candidates A/B/C;
8. for each candidate: independent executable specification, caption, alt text, accessibility checks, and negative constraints;
9. recommended candidate and trade-off among candidates;
10. required formats and final-size QA status;
11. unresolved items.

## Fact locks

Use this vocabulary for pipeline/method visuals:

- `CONFIRMED`: directly supported by paper, code, supplied figure, or author statement.
- `ILLUSTRATIVE`: generic example used only to make the mechanism visible.
- `TO CONFIRM`: required detail absent, unreadable, or inconsistent.

Use this vocabulary for result/qualitative visuals:

- `MEASURED`: directly reported or present in supplied data.
- `DERIVED`: computed from measured inputs; record formula and sign convention.
- `CONCEPTUAL`: explanatory structure, not an observation.
- `MISSING`: required value or statistical detail unavailable.

A hybrid figure keeps separate ledgers. `TO CONFIRM` and `MISSING` items remain placeholders in the design source and must not become visible facts. Production code must fail validation, omit the incomplete optional panel, or wait for verified input; final artwork must never display bracketed internal placeholders.

## Three candidate rule

All three candidates must respect the same locked facts. Vary at least two of:

- macro-topology;
- reading path;
- visual center;
- evidence organization.

Palette, icon style, orientation, or rounded corners alone do not make a distinct candidate. If only one scientific topology is valid, vary macro-composition without inventing modules or evidence. For experiment figures, each candidate names a dominant panel occupying at least half the usable canvas.

## Standalone design-specification contract

Each candidate must be copyable without surrounding text. It must repeat:

1. figure number, role, venue style, and three-second claim;
2. all relevant locked facts and unresolved placeholders;
3. canvas ratio, target manuscript width, white background, margins, gutters, proportions, and reading direction;
4. region/panel contents and hierarchy;
5. exact labels, notation, and panel letters;
6. module/state/arrow semantics or data-to-mark mapping;
7. axes, units, transformations, aggregation, uncertainty, sample unit, and statistical definitions when applicable;
8. restrained semantic color system and redundant encodings;
9. caption draft and alt text;
10. accessibility requirements;
11. negative constraints;
12. fidelity instruction not to invent or omit scientific content.

Never write “use the facts above,” “same as option A,” or “choose among these layouts.”

### Specification kind

- `programmatic-figure-spec`: mandatory for measured values, exact axes, uncertainty, heatmaps, distributions, significance, or quantitative annotations. It instructs plotting/vector code, not a generative model.
- `image-generation`: allowed for conceptual or illustration-led visuals where every scientific object and label can be checked.
- `vector-diagram-spec`: preferred for exact method diagrams, equations, dense labels, or routing logic.

The user's request for a “prompt” means an independently executable figure instruction. It does not imply that generative image production is appropriate.

## Visual system

Use a restrained scientific style unless the venue or existing manuscript defines another system:

- white or near-white background;
- one neutral text/structure color, one primary semantic color, and one accent or warning color;
- consistent meaning for every color across figures;
- flat shapes, clean lines, controlled whitespace, and clear grouping;
- readable horizontal labels at final size;
- typography aligned with the manuscript where possible;
- no meaning carried by color alone;
- grayscale survival through line style, marker, hatch, shape, border, or direct labeling;
- minimal legends and direct labels where practical.

Avoid glossy 3D, generic brains, commercial logos, neon/dashboard styling, decorative gradients, clip-art laboratory objects, tangled arrows, duplicated modules, and dense prose inside figures.

## Negative constraints

Every prompt must prohibit:

- fabricated numbers, error bars, significance, seeds, sample sizes, equations, modules, datasets, or causal claims;
- converting `TO CONFIRM` or `MISSING` into facts;
- cropped/truncated bars that exaggerate differences;
- unsupported dual axes, fits, laws, Pareto frontiers, raw distributions, or heatmaps;
- cherry-picked qualitative examples or concealed negative results;
- inconsistent notation and metric direction;
- tiny or rotated text, illegible panel letters, and decorative arrows;
- dependence on another candidate's prompt.

## Caption and alt-text contract

A caption should be self-contained enough to state:

- the question or setup;
- what each panel and encoding represents;
- data, aggregation, uncertainty, and statistical definitions;
- the main supported takeaway;
- material boundary or selection rule;
- visual provenance and citation where applicable.

Alt text should state the claim, reading order, essential contrasts, and major encodings without repeating every decorative detail.

## Table contract

Tables receive no image-generation prompt. Produce them natively in LaTeX, DOCX, or the target authoring system. Every table record includes:

- scientific role and first-callout placement;
- exact source fields and provenance;
- rows, columns, grouping, units, and metric direction;
- aggregation, sample unit, uncertainty, and significance definitions;
- precision, missing-value, and incomparable-setting rules;
- bold/underline/shading logic;
- row/cell citations for externally reported values;
- caption and notes;
- accessibility and final-width QA.

Use figures for pattern, trend, distribution, mechanism, or visual examples; use tables when exact values or compact multidimensional comparison are the reader's primary need.

## Validation invariants

- Figure/table numbers and IDs are unique.
- Every non-table figure has exactly candidates A, B, and C.
- Every candidate is fully standalone.
- Every experiment candidate has a dominant panel share of at least 0.5.
- Every `DERIVED` fact gives a formula and sign convention.
- No unresolved fact becomes a visual assertion.
- Every citation key exists or remains an explicit placeholder.
- `answers-charts` is preview-only.
- Tables have no image prompt.
- No figure passes until inspected at final manuscript size through `pdf` or `documents` as appropriate.
