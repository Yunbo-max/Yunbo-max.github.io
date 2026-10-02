# Experiment figure style catalog

Use this catalog as an evidence grammar, not as a tracing library. Abstract the scientific relationship, hierarchy, and encoding; never copy a paper's exact artwork, geometry, or palette.

## Compatibility router

| Style ID | Primary question | Required evidence | Do not use when |
|---|---|---|---|
| `aligned-qualitative-filmstrip` | What changes across time, scale, or step? | aligned samples with a real shared index | samples or crops are not matched |
| `mechanism-hypothesis-pair` | Does a measurable proxy move with the proposed mechanism? | proxy plus aligned outcome or behavior | only the final score exists |
| `operating-point-small-multiples` | How does performance change across thresholds or budgets? | ordered sweep, metric, and chosen-point rule | there is only one operating point |
| `paired-small-multiples` | Does the method improve matched tasks, cases, or settings? | explicit pairing key and common conditions | runs are independent or pairing is unknown |
| `pareto-dominated-regions` | Is quality higher at lower cost? | two measured continuous objectives and directions | either axis is conceptual or missing |
| `streaming-metric-matrix` | How do metrics evolve across an ordered sequence? | time/step order and repeated measurements | order is only cosmetic |
| `bottleneck-breakdown-suite` | Which component dominates cost or error? | compatible components whose accounting is defined | parts and total use inconsistent scopes |
| `grouped-benchmark-comparison` | Who performs best across a small benchmark set? | common methods and exact benchmark values | categories are numerous or uncertainty is central |
| `survival-mechanism-curve` | Where do candidates persist or fail along an ordered process? | event position/time and at-risk population | only a mean endpoint is known |
| `structure-heatmap-matrix` | Where is mass, activity, or allocation in a 2D structure? | real matrix, meaningful rows/columns, color unit | the heatmap would be decorative |
| `ranked-diverging-delta` | Where does one method gain or lose against a fixed comparator? | common baseline and comparable signed effects | units or directions cannot be reconciled |
| `evidence-law-operating-point` | What scaling relation does raw evidence support? | adequate scale points, fit model/range, target budget | a law or extrapolation is unverified |
| `highlighted-family-frontier` | Does an ordered model family trace a better frontier? | multiple configurations with performance and resource measures | points have no real family order |
| `qualitative-intervention-ladder` | Does a controlled intervention change both appearance and metrics? | fixed samples, ordered intervention, aligned quantitative outcomes | images or interventions are unmatched |
| `triangulated-evidence-storyboard` | Do complementary evidence sources resolve metric ambiguity? | one main result plus relevant oracle, human, qualitative, or budget evidence | panels answer unrelated questions |
| `semantic-correspondence-atlas` | Are learned representations semantically consistent across cases? | real features, maps, correspondences, or embeddings | only class scores exist |

## Selection procedure

1. Extract signatures: `paired`, `common-baseline`, `two-objective`, `ordered`, `multi-scale`, `component-sum`, `matrix`, `controlled-intervention`, `aligned-qualitative`, `multi-evidence`, `representation-map`.
2. Remove every style whose required signature is absent.
3. Choose three candidates with different scientific reading paths where possible:
   - **headline-first:** direct comparison, delta, or frontier;
   - **relationship/robustness:** operating sweep, pairing, scaling, or breakdown;
   - **mechanism/diagnostic:** survival, heatmap, intervention ladder, filmstrip, or triangulated storyboard.
4. If only one family is valid, produce three macro-compositions inside it without changing the data: for example ranked vertical delta, faceted dot intervals, and a main delta panel with raw-value inset.
5. Rotate among equally compatible styles so repeated requests are visually varied. Use novelty of reading path as the tie-breaker, not arbitrary decoration.
6. Recommend the option that makes the strongest supported answer easiest to verify, including its limitations.

## Primary-source exemplars

### AutoGaze

[Paper](https://arxiv.org/abs/2603.12254)

- Figure 2: `aligned-qualitative-filmstrip`; aligned temporal and scale evidence makes selective observation inspectable.
- Figures 4–5: `mechanism-hypothesis-pair`; intermediate behavior is plotted beside the hypothesis it is meant to support.
- Figures 7–10: `operating-point-small-multiples`; thresholds, efficiency, and scaling are shown as operating choices rather than isolated scores.

### JIT-Agent

[Paper](https://arxiv.org/abs/2608.25593)

- Figure 3: `pareto-dominated-regions`; cost and task performance define an explicit operating space.
- Figure 4: `paired-small-multiples`; matched tasks keep local changes visible.
- Figure 6: `streaming-metric-matrix`; metrics are repeated over an ordered process and dataset grid.

### DARTree

[Paper](https://arxiv.org/abs/2608.13524)

- Figure 1: `bottleneck-breakdown-suite`; headline latency is decomposed before scaling diagnostics explain the bottleneck.
- Figure 2: `grouped-benchmark-comparison`; proposed variants receive redundant color and hatch emphasis.
- Figure 5: `survival-mechanism-curve`; position-wise survival shows where acceptance gains occur.
- Figure 7: `structure-heatmap-matrix`; multiple real tree shapes turn an abstract depth/width claim into population evidence.

### CLIP

[ICML paper](https://proceedings.mlr.press/v139/radford21a.html)

- Figure 4 in the camera-ready PDF: `ranked-diverging-delta`; datasets are sorted around a zero line so wins and failures remain visible.
- Reusable lesson: use a signed effect only when the comparator and interpretation are common; otherwise facet native metrics.

### Chinchilla

[NeurIPS paper](https://proceedings.neurips.cc/paper_files/paper/2022/hash/c1e2faff6f588870935f114ebe04a3e5-Abstract-Conference.html)

- Figure 2: `evidence-law-operating-point`; raw runs lead to fitted relationships and then an actionable compute-budget point.
- Reusable lesson: visually distinguish observations, fitted range, and extrapolation; a decision line must correspond to a real target budget.

### EfficientNet

[ICML paper](https://proceedings.mlr.press/v97/tan19a.html)

- Figure 1: `highlighted-family-frontier`; one ordered model family forms a saturated accuracy–parameter frontier while baselines recede.
- Reusable lesson: connect only configurations with a real order and label the desirable direction.

### Vision Transformers Need Registers

[ICLR paper](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0b408293619f725fd30162af057e531a-Abstract-Conference.html)

- Figure 8: `qualitative-intervention-ladder`; fixed-input maps above align with separate task metrics below for the same intervention values.
- Reusable lesson: preserve crop, preprocessing, and color scale across the ladder; do not synthesize heatmaps when none exist.

### Segment Anything

[ICCV paper](https://openaccess.thecvf.com/content/ICCV2023/html/Kirillov_Segment_Anything_ICCV_2023_paper.html)

- Figure 7: `triangulated-evidence-storyboard`; a dominant cross-dataset result is qualified by oracle behavior, human ratings, prompt curves, and real examples.
- Reusable lesson: complementary panels must resolve one metric ambiguity, not form a general-purpose dashboard.

### DINOv2

[Paper](https://arxiv.org/abs/2304.07193)

- Figure 1: `semantic-correspondence-atlas`; real feature projections and correspondences show semantic structure across images.
- Reusable lesson: keep the feature-to-color mapping stable and include hard or anomalous cases.

## Encoding and statistical integrity

| Scientific meaning | Preferred encoding |
|---|---|
| proposed method | one saturated color plus distinctive marker or hatch |
| baselines | neutral gray family with direct labels for key comparators |
| measured observation | solid point, bar, cell, image, or trace |
| aggregate | larger mark or darker line, with defined aggregation |
| uncertainty | whisker, ribbon, interval, or distribution with named meaning |
| derived effect | centered axis or secondary annotation with formula |
| fitted relation | distinct line style and explicit fit range |
| extrapolation | lighter or dashed continuation with boundary marker |
| selected operating point | outlined marker and rule-based annotation |
| missing information | visible placeholder in the specification, never a synthetic mark |
| qualitative success/failure | matched case ID, selection rule, and non-color status cue |

Do not use color simultaneously for method identity, sign of effect, dataset, and uncertainty. Prefer direct labels and redundant encoding. A caption must disclose what every interval, ribbon, shade, or selected example means.
