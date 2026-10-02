# Pipeline figure style catalog

Use this catalog as a grammar library, not a tracing library. Abstract topology, hierarchy, and encoding; never copy a paper's exact geometry, icons, artwork, or palette.

## Compatibility router

| Style ID | Core topology | Use when the scientific structure contains | Do not use when |
|---|---|---|---|
| `baseline-ladder-frontier` | stacked baseline lanes plus outcome inset | increasingly complete systems and a clear benefit from moving the intervention earlier or deeper | there is no matched baseline hierarchy |
| `autoregressive-gate-loop` | repeated state update with stop/continue gate | sequential selection, adaptive computation, early stopping, iterative refinement | the method is one-pass |
| `adaptive-hub-spoke` | heterogeneous inputs around a shared core with different instantiations | one shared mechanism constructs task- or instance-specific structures | all outputs have the same structure |
| `stage-triptych` | three adjacent stages with distinct internal micro-topologies | customize/repair/evolve, pretrain/adapt/deploy, collect/filter/train | stages are not ordered or differ only nominally |
| `token-tree-verify-loop` | proposal tree, pruning, verification, accepted-state feedback | candidate expansion, tree search, beam pruning, speculative decoding | there is no branching candidate set |
| `lifecycle-triptych` | training, intermediate asset, deployment | training and inference reuse the same encoders, tokens, labels, or state | the paper is inference-only |
| `boxed-stage-pipeline` | strict left-to-right semantic containers | a mostly feed-forward architecture with clear tensor/state transitions | the key novelty is recurrence or feedback |
| `latent-bottleneck-swimlanes` | fixed input, latent/workspace, query/output lanes | shared memory, latent workspace, compression, cross-attention, query decoding | there is no persistent or shared intermediate state |
| `dual-lane-feedback-loop` | upper execution/data lane and lower learning/update lane | self-play, active learning, agent reflection, online data engines | training is unrelated to executed trajectories |
| `plan-act-train-triptych` | planning tree, real interaction, recurrent training alignment | agents or world models must distinguish imagination, action, and learning | the method has no planning or environment interaction |
| `curate-filter-distill-funnel` | broad sources narrow through filtering into a training asset | dataset curation, retrieval filtering, teacher-student distillation | selection is not a methodological contribution |

## Selection procedure

1. Extract observable signatures: `linear`, `staged`, `loop`, `branch`, `shared-state`, `train-infer`, `baseline-contrast`, `adaptive-stop`, `hierarchy`.
2. Remove any style whose required signature is absent.
3. Prefer candidates that place the novelty in three different roles: as the center of a linear information path, as the controller of a feedback loop, and as a contrast between baseline and proposed execution.
4. If fewer than three style families are compatible, vary the macro-composition within the compatible family without inventing structure: horizontal versus vertical, main path plus inset versus dual lane, or inference-first versus train/infer split.
5. Recommend the option with the shortest path from problem to novelty to consequence.

## Primary-source exemplars

### Attend Before Attention / AutoGaze

[Paper and PDF](https://arxiv.org/abs/2603.12254)

- Figure 1, PDF p.1: `baseline-ladder-frontier`. Three stacked systems show where token reduction occurs; a compact scatter completes the cost/performance story.
- Figure 3, PDF p.4: `autoregressive-gate-loop`. A multiscale patch dictionary feeds an autoregressive selector; reconstruction-loss prediction controls stopping; training sits in a narrow side lane.
- Reusable lesson: make the location of the intervention and its system consequence visible in the same reading path.

### JIT-Agent

[Paper and PDF](https://arxiv.org/abs/2608.25593)

- Figure 1, PDF p.2: `adaptive-hub-spoke`. Task cards enter a fixed four-module core and emerge as structurally different executable harnesses.
- Figure 2, PDF p.5: `stage-triptych`. Customize uses a filtering path, repair uses a loop, and evolve uses candidate competition plus archive update.
- Reusable lesson: adjacent stages need not reuse the same internal topology; each micro-diagram should reflect the operation it performs.

### DARTree

[Paper and PDF](https://arxiv.org/abs/2608.13524)

- Figure 3, PDF p.4: `token-tree-verify-loop`. Same-color nodes encode one depth-wise batch, opacity encodes pruning, and accepted tokens feed the next round.
- Reusable lesson: use color, border, and opacity to expose scheduling and selection, not merely decoration.

### CLIP

[ICML paper](https://proceedings.mlr.press/v139/radford21a.html) and [PDF](https://proceedings.mlr.press/v139/radford21a/radford21a.pdf)

- Figure 1, PDF p.2: `lifecycle-triptych`. Contrastive pretraining occupies the largest area; classifier construction and zero-shot use reuse the same image/text identities.
- Reusable lesson: allocate area by conceptual complexity and keep an object's color and shape stable across stages.

### DETR

[Paper](https://arxiv.org/abs/2005.12872) and [PDF](https://arxiv.org/pdf/2005.12872)

- Figure 2, PDF p.7: `boxed-stage-pipeline`. Dashed semantic containers organize backbone, encoder, decoder, and prediction heads along a monotonic main path.
- Reusable lesson: a container represents a scientific stage, not every software class; concrete input/output can bracket abstract internal states.

### Perceiver IO

[ICLR paper](https://openreview.net/forum?id=fILj7WpI-g) and [PDF](https://arxiv.org/pdf/2107.14795)

- Figure 2, PDF p.4: `latent-bottleneck-swimlanes`. Input, latent, and output-query arrays occupy stable lanes; a small inset expands the attention operation.
- Reusable lesson: pair a readable global flow with one local mechanism inset and compress repetition with `xN`.

### AlphaGo Zero

[Nature paper](https://www.nature.com/articles/nature24270) and [author manuscript](https://discovery.ucl.ac.uk/10045895/1/agz_unformatted_nature.pdf)

- Figure 1, manuscript PDF p.4: `dual-lane-feedback-loop`. Self-play above and network training below share aligned states; terminal outcome returns through a dominant outer loop.
- Reusable lesson: separate execution and learning into lanes, using a heavy system loop and lighter local arrows.

### MuZero

[Paper](https://arxiv.org/abs/1911.08265) and [PDF](https://arxiv.org/pdf/1911.08265)

- Figure 1, PDF p.3: `plan-act-train-triptych`. Planning, acting, and training share module identities while distinguishing imagined rollouts from real trajectories.
- Reusable lesson: active paths are saturated; alternatives are muted; real and imagined sequences must differ by more than color alone.

### DINOv2

[Paper](https://arxiv.org/abs/2304.07193) and [PDF](https://arxiv.org/pdf/2304.07193)

- Figure 3: `curate-filter-distill-funnel`. Curated and uncurated sources pass through embedding, deduplication, retrieval, and balancing before training.
- Reusable lesson: data construction can be the method; show set sizes or selection gates only when the paper reports them.

## Visual encoding dictionary

| Scientific meaning | Preferred encodings |
|---|---|
| real observation or transition | solid border and solid arrow |
| imagined or counterfactual state | dashed border, dashed arrow, lighter fill |
| rejected or pruned candidate | reduced opacity or dotted outline |
| selected/accepted path | saturation plus stronger border |
| one parallel batch | shared fill color and aligned depth/step |
| persistent state | stable central card, lane, or stack reused across steps |
| budget or capacity | gauge, token stack, width constraint, explicit counter |
| uncertainty or failure | restrained coral marker and a localized return path |
| training-only supervision | bottom lane or upward dashed supervision arrow |
| repeated block | one module with `xN`, stack, or ellipsis |

Do not use color simultaneously for modality, stage, correctness, and uncertainty. Select one primary semantic role for color and add shape, border, line style, or opacity for the others.
