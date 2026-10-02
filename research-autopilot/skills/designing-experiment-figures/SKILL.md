---
name: designing-experiment-figures
description: Use when a user provides experimental results, tables, logs, plots, paper text, screenshots, or an existing scientific results figure and asks for alternative chart layouts, a detailed visual specification, a generation prompt, a code-rendered result figure, or editable draw.io assembly for benchmark comparisons, ablations, scaling, trade-offs, mechanism evidence, qualitative results, robustness, or error analysis.
---

# Designing Experiment Figures

## Core principle

Choose the visual form from the scientific question and the available evidence. Preserve every measurement and uncertainty disclosure while producing three publication-ready, narratively distinct ways to communicate the result. Quantitative marks come from verified data and plotting code; draw.io may assemble and annotate those outputs but never becomes the data-rendering authority.

## Required references

- Read [references/style-catalog.md](references/style-catalog.md) before choosing chart families.
- Read [references/output-contract.md](references/output-contract.md) before writing the deliverable.
- Read [references/worked-example.md](references/worked-example.md) when calibrating detail or handling incomplete result summaries.
- Read [references/drawio-production.md](references/drawio-production.md) whenever the user requests an editable draw.io composite, vector export, or mixed result-and-mechanism figure.

## Workflow

1. **Inspect the source.** Read supplied tables, logs, captions, and relevant experiment text. Visually inspect attached figures or PDF pages at legible resolution; do not infer chart values from OCR alone when the image is readable.
2. **Build an evidence inventory.** Record methods, comparators, metrics, units, better direction, observations, aggregation, seeds or sample size, uncertainty, statistical tests, budgets, interventions, qualitative cases, and selection rules. Tag every item `MEASURED`, `DERIVED`, `CONCEPTUAL`, or `MISSING`.
3. **Choose one principal claim.** State the scientific question and the strongest source-supported answer in one sentence. One dominant panel must occupy at least half of the figure; every secondary panel must test, explain, or qualify that same claim.
4. **Infer the data topology.** Identify matched pairs, common-baseline deltas, two-objective trade-offs, ordered trajectories, scale sweeps, component breakdowns, structural matrices, controlled interventions, aligned examples, or heterogeneous evidence sources.
5. **Select three compatible styles.** Eliminate styles whose data requirements are absent. Then choose or rotate among three different evidence narratives: headline comparison, relationship or robustness, and mechanism or diagnostic evidence. Randomness may vary composition, never values, metrics, comparisons, uncertainty, or claims.
6. **Design statistical semantics first.** Fix axes, baselines, transformations, uncertainty marks, tie rule, sample unit, and legend before adding decoration. Show raw values beside derived effects when normalization could hide scale.
7. **Write the design artifact.** Follow the output contract. Each option must include a standalone prompt/specification that can be copied directly into a figure-production workflow. If only planning or comparison was requested, stop after the artifact.
8. **Render quantitative panels from evidence.** When an actual figure is requested, use verified source data and plotting code for bars, points, curves, intervals, matrices, and heatmaps. Preserve the source data and script.
9. **Assemble only when useful.** Use draw.io for panel composition, labels, callouts, arrows, qualitative examples, or a schematic inset. Import code-rendered panels without manually recreating or adjusting quantitative marks.
10. **Render and inspect.** Inspect the final composite at full size and intended paper width. Verify values, uncertainty, axes, legends, clipping, alignment, and legibility. When no renderer exists, report structural validation separately from visual verification.
11. **Audit evidence fidelity.** Recompute simple derived values when inputs are available. Otherwise use `[INSERT VERIFIED VALUE]` and mark the gap. Never reconstruct raw distributions from means or invent significance, error bars, sample sizes, or operating points.

## Routing boundaries

- Use this skill when measured or qualitative evidence is the main content.
- Use `designing-pipeline-figures` when the main question is how a method, architecture, training loop, or agent works.
- A compact method inset is allowed only when it explains the plotted result. A compact result inset is allowed in a pipeline only when it closes the method story.
- Skip draw.io for a simple single-panel chart unless the user explicitly asks for it. Use draw.io when editable multi-panel assembly or schematic annotation adds real value.
- For an existing figure, preserve its data and scientific semantics. A redesign may change chart family only when the underlying values support the new encoding.

## Non-negotiable output properties

- The three alternatives must differ in evidence organization or scientific reading path, not merely palette or panel order.
- Every option uses the same evidence inventory and exposes missing information.
- `MEASURED` values remain exact; `DERIVED` values show their formula or transformation; `CONCEPTUAL` marks only explanatory structure; `MISSING` never becomes a plotted number.
- Metric direction, units, comparator, aggregation, uncertainty definition, sample unit, and tie rule appear in the figure or caption when relevant.
- The dominant panel owns at least 50% of the usable area.
- Methods keep the same color, marker, and line identity across panels. Color is reinforced by shape, hatch, label, or line style.
- All axes and baselines remain honest at final paper width.
- Numeric marks are generated from data and code, never placed or adjusted manually in draw.io.
- Every produced non-table figure retains a separate prompt/specification, source data, plotting code, and editable assembly source when assembly is used.

## Common mistakes

| Mistake | Correction |
|---|---|
| Building a dashboard before choosing the claim | Select one principal question and let one panel dominate. |
| Blindly sampling three chart types | Filter by data topology and evidence availability first. |
| Adding plausible confidence intervals or significance stars | Use only reported or computable uncertainty; otherwise mark `MISSING`. |
| Treating unpaired runs as paired | Use independent intervals or distributions unless the pairing key is confirmed. |
| Drawing a Pareto frontier without two measured objectives | Use a one-axis comparison or request the missing cost measure. |
| Fitting a scaling law to a few decorative points | Require adequate scale coverage, a stated model, fit range, and extrapolation disclosure. |
| Comparing unlike metrics with raw deltas | Use separate facets or a clearly defined direction-corrected transformation. |
| Truncated bars exaggerate small differences | Start quantitative bars at zero; use dot or interval plots for nonzero baselines. |
| Dual y-axes manufacture correlation | Prefer aligned panels with a shared x-axis or a direct two-axis scatter. |
| Qualitative examples look cherry-picked | State the selection rule, IDs, alignment, and failure cases. |
| Heatmaps used as decoration | Require real matrix values, defined row/column semantics, and a labeled color scale. |
| Using draw.io as a chart engine | Generate quantitative panels from data and code; use draw.io only for assembly and annotations. |
| Moving a bar or error bar during layout polish | Regenerate the panel from code. Never alter quantitative geometry by hand. |
| Calling an assembled SVG fully data-editable | State that data geometry is controlled by the source script; draw.io edits the composition and annotations. |
| Sending unpublished results to a hosted renderer silently | Prefer a local route; obtain user approval before using a hosted draw.io service for sensitive material. |
