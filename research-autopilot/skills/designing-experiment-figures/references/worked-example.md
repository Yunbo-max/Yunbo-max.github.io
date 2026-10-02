# Worked example: benchmark, efficiency, ablation, and budget evidence

## Input brief

> A proposed method is compared with six baselines on five benchmarks over three seeds. It wins four benchmarks and ties one under the study's tie rule. It uses 45% fewer tokens than one reference method. Two ablations remove an uncertainty gate or replay. A budget sweep and representative success/failure cases are available. Exact per-benchmark values, uncertainty type, reference-method name, tie definition, budget values, and case-selection rule have not yet been supplied.

## Evidence inventory

| Status | Content |
|---|---|
| `MEASURED` | five benchmarks; six baselines; three seeds; four wins and one tie according to a study-defined rule; 45% token reduction against one reference; two named ablations; budget sweep; success and failure cases |
| `DERIVED` | `45% fewer tokens` only if computed as `100 × (tokens_reference - tokens_ours) / tokens_reference`; verify the denominator and scope |
| `CONCEPTUAL` | a mechanism annotation connecting an ablation to a result, unless the study directly measured that mechanism |
| `MISSING` | exact values; metric names, units, and directions; seed-level or aggregate data; SD/SE/CI definition; reference name; token scope; tie rule; budget grid and default point; case IDs and selection rule; statistical tests |

Principal question: **Does the proposed method improve task performance consistently while using fewer tokens, and which evidence explains the operating point?**

Source-supported answer: **The summary reports four wins and one tie plus a 45% token reduction against one unspecified reference, but exact magnitudes and uncertainty remain missing.**

## Candidate matrix

| Option | Evidence narrative | Dominant panel | Supporting evidence | Requirement check | Risk |
|---|---|---|---|---|---|
| A | benchmark-first | five native-metric dot/interval facets | token comparison and compact ablations | requires exact values and uncertainty before plotting | can become dense |
| B | efficiency-frontier | five performance-vs-token facets with budget trajectories | ablation shifts and cases | requires token/performance pairs for every plotted point | invalid if only one token total exists |
| C | reviewer-audit | grouped direction-corrected effect forest | raw-value column, ablation effects, budget response | requires a defensible effect definition and seed-level pairing | normalization can hide native scale |

Recommendation: **A until the complete table is supplied.** It directly exposes every benchmark in native units and can use explicit placeholders without pretending a Pareto frontier exists. Choose B only after verifying paired token/performance coordinates; choose C only after confirming a common, interpretable transformation.

## Excerpt from a standalone prompt

Create a full-width, double-column experiment figure on a white background. The three-second claim is that the proposed method is reported to lead on four of five benchmarks and tie one while using fewer tokens than one reference, with exact magnitudes and uncertainty still awaiting verified data. Make the five benchmark comparison facets the dominant field, occupying 65% of the canvas.

In the main field, use five aligned horizontal dot-and-interval facets, one per benchmark. Keep each benchmark in its native metric and add `↑` or `↓`. Place the proposed method first with a saturated blue diamond; show six baselines as gray circles. Insert `[INSERT VERIFIED MEAN]` and `[MISSING: uncertainty definition]` rather than drawing values or error bars. Add `WIN` to four facet headers and `TIE` to one only after the exact benchmark mapping and tie rule are supplied. If seed-level values become available, show three faint points behind a defined aggregate; otherwise do not fabricate replicate dots.

Use a compact right panel titled `Token use vs [MISSING: reference method]`. Show no quantitative bar until absolute token totals or a verified indexed pair is supplied. Retain the statement `45% fewer tokens` as a text callout marked `DERIVED—verify denominator and scope`, and print the formula below it. Under the main plot, reserve two narrow ablation rows for `without uncertainty gate` and `without replay`, but use `[INSERT VERIFIED EFFECT]` at every mark. Do not imply additive or causal contributions. Place two matched case cards only after case IDs and the selection rule are supplied; otherwise display `[MISSING: representative case selection]` in the specification, not in the final art.

Use one colorblind-safe blue for the proposed method, neutral gray baselines, orange and teal shapes for the two ablations, charcoal axes, sparse horizontal gridlines, and no gradients. Prohibit invented metrics, values, intervals, p-values, significance stars, token counts, benchmark assignments, case content, truncated bars, dual y-axes, decorative heatmaps, and equal-weight dashboard panels. Preserve the comparison set, reported win/tie count, token-reduction scope, seed count, and all missing-data placeholders exactly.

This excerpt demonstrates evidence-safe detail. A delivered option must also include complete canvas dimensions, exact text list, caption/statistical disclosure, negative constraints, and the final evidence-fidelity sentence required by `output-contract.md`.
