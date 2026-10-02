# Experiment figure Markdown output contract

Always create one `.md` design artifact. It must let the user compare three scientifically valid approaches and copy any option directly into a figure-production workflow. When the user requests an actual figure, also create the evidence-backed production package below; the evidence ledger remains authoritative.

## Required document structure

```markdown
# <Study or Method> - Experiment Figure Design

## A. Evidence Inventory
### Principal scientific question
### Source-supported answer
### Measurements and comparisons
### Statistics and uncertainty
### Derived quantities
### Missing information

## B. Three Candidate Visualizations
| Option | Evidence narrative | Dominant panel | Supporting evidence | Data requirements | Main risk |
| ... |

**Recommendation:** <option and scientific reason>

## C. Option 1 - <descriptive name>
### Design rationale
### Standalone generation prompt
<complete prompt>
### Caption and statistical disclosure

## D. Option 2 - <descriptive name>
...

## E. Option 3 - <descriptive name>
...

## F. Cross-option evidence-fidelity checklist

## G. Production manifest
<include when an actual figure is requested>
```

## Evidence status vocabulary

- `MEASURED`: directly reported or present in supplied raw data.
- `DERIVED`: computed from measured inputs. State the formula, normalization, sign convention, and handling of zero or missing values.
- `CONCEPTUAL`: explanatory annotation or schematic relationship, not an observed result.
- `MISSING`: required detail not supplied or not readable. Use `[INSERT VERIFIED VALUE]`; do not draw a plausible substitute.

Keep an explicit ledger with method names, benchmark names, metric direction and unit, central estimate, uncertainty type, seeds or sample size, statistical unit, comparator, tie rule, budget definition, and case-selection rule. Preserve exact capitalization and notation.

## Candidate requirements

Each candidate must:

1. answer the same principal question with the same evidence;
2. organize that evidence through a different narrative or macro-composition;
3. name one dominant panel occupying at least 50% of usable area;
4. list the data it requires and confirm those fields exist;
5. state what it emphasizes, what it compresses, and one interpretation risk;
6. avoid chart families incompatible with the evidence;
7. contain one complete, standalone prompt and caption.

Constrained randomization means rotating among compatible evidence narratives. It may change panel topology, orientation, annotation strategy, and a restrained palette. It may not change values, transformations, comparison sets, metric direction, uncertainty, case selection, or causal strength.

## Standalone prompt anatomy

Write each prompt as continuous, precise production instructions containing all of the following.

### 1. Purpose and claim

- Figure number and venue style if known.
- The principal scientific question and source-supported answer.
- The single pattern that should be visible within three seconds.

### 2. Canvas and hierarchy

- Aspect ratio or approximate dimensions.
- Single-column, double-column, or full-width placement.
- Background, gutters, panel proportions, and reading order.
- The dominant panel and its minimum share of the canvas.

### 3. Data-to-mark mapping

For every panel specify the exact input fields, x/y or row/column variables, category order, metric unit and direction, baseline or zero line, marks, grouping, faceting, labels, direct annotations, and which values appear numerically. Distinguish observations, aggregates, fitted values, extrapolations, and conceptual annotations.

### 4. Statistical semantics

State aggregation and uncertainty exactly: for example mean ± SD across seeds, median and IQR across instances, bootstrap CI, or reported interval. State sample size, statistical unit, pairing key, test, multiple-comparison correction, and tie criterion only when known. If absent, visibly write `[MISSING: ...]` in the specification instead of inventing it.

Do not create pseudo-replicates. Do not infer a confidence interval from an unspecified error bar. Do not add significance stars without a reported or validly computed test.

### 5. Transformations and axes

- Define every delta, ratio, normalized score, effect size, or Pareto criterion.
- Show raw values alongside derived values when the transformation could obscure magnitude.
- Use logarithmic axes only when justified by scale and label them explicitly.
- Quantitative bars begin at zero. Use dots, intervals, slopes, or small multiples when a nonzero baseline is scientifically useful.
- Avoid dual y-axes unless the variables share a defensible mapping; prefer aligned panels or direct scatter.

### 6. Visual system

Assign one restrained, colorblind-safe identity to the proposed method and neutral identities to baselines. Preserve those identities across panels. Reinforce color with marker, hatch, line style, border, or direct label. Specify type hierarchy, grid weight, tick density, borders, and minimum size after reduction.

### 7. Exact text list

List every title, axis label, method name, benchmark label, annotation, legend item, and placeholder that must appear verbatim. Use `↑` and `↓` in metric titles when helpful.

### 8. Negative constraints

Prohibit likely failures for the option: fabricated values, error bars, significance, seeds, samples, raw distributions, datasets, categories, operating points, fitted laws, decorative heatmaps, truncated bars, hidden negative results, arbitrary connecting lines, misleading dual axes, 3D effects, gradients, commercial logos, tiny rotated labels, or an all-equal dashboard.

### 9. Final fidelity sentence

End by requiring exact preservation of measured values, comparison set, metric direction, uncertainty semantics, transformations, selection rules, and all missing-data placeholders.

## Caption and statistical disclosure

A caption must name the evaluation question, comparison set, metric and direction, main result, aggregation and uncertainty, seeds or sample size, statistical unit, derived-value definition, and case-selection rule when relevant. It must distinguish observed, fitted, extrapolated, oracle, and human-evaluated evidence. Do not claim causality from an observational correlation or mechanism proxy.

## Evidence-backed production package

When production is requested, create the applicable files:

```text
<figure-slug>-design.md
<figure-slug>-prompt.md
<figure-slug>-data.csv|json
<figure-slug>-plot.py|R
<figure-slug>-panel.svg|pdf
<figure-slug>.drawio              # only when editable assembly is useful or requested
<figure-slug>.drawio.svg|png|pdf  # assembled export when requested
<figure-slug>-provenance.yaml
```

- All bars, points, lines, intervals, matrices, and heatmap cells must be generated programmatically from the retained data.
- Draw.io may arrange code-rendered panels and add panel letters, explanations, arrows, callouts, or schematic insets. It may not recreate or alter quantitative geometry.
- The plotting script and source data are the authority for numeric marks; the `.drawio` file is the authority for composite layout and annotations.
- Keep all three candidate prompts in the design artifact. Copy the produced option into its own prompt file.
- If no draw.io runtime exists, deliver code-rendered panels and the design package. If native XML assembly is requested, validate it structurally and state that it was not render-verified.
- Follow [drawio-production.md](drawio-production.md) for capability routing, privacy, assembly, and validation.

## Final checklist

- Is the principal claim the first visible relationship?
- Does one panel own at least half the figure?
- Do all supporting panels test or explain the same claim?
- Are there exactly three meaningfully different candidates?
- Does every mark map to a real field or an explicit placeholder?
- Are metric direction, unit, comparator, aggregation, and uncertainty unambiguous?
- Are pairing, tie rules, tests, and sample units stated only when known?
- Are transformations reproducible from the ledger?
- Are zero baselines, log axes, and Pareto directions honest?
- Are qualitative cases aligned and selected by a disclosed rule?
- Can labels and uncertainty marks survive final-size reduction?
- Can every quantitative mark be regenerated from the retained data and script?
- If draw.io was used, did it preserve the imported panel geometry exactly and limit edits to composition and annotation?
- Were structural, numerical, and visual verification reported separately and truthfully?
