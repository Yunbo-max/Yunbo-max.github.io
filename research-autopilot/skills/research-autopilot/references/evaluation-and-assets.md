# Evaluation harness and research assets

Choose evaluator and assets to answer the human's goal and frozen problem, within
P04 resources. lm-evaluation-harness and Inspect AI are adapters, not validity
certificates. Read their current actual task/config and retain its version.

## B01 Exact task and metric contract

Freeze population, endpoint, input/output, information allowed, evaluation unit,
data/split/revision, prompt/chat template, few-shot examples, answer extraction,
normalization, scorer version, direction, aggregation and exclusions. Save
per-example outputs. Metrics with similar names can implement different tasks.

| Task | Distinctions to resolve |
|---|---|
| Multiple-choice QA | likelihood or generation; length-normalized acc vs raw acc; option ordering; letter/text parser; invalid answers |
| Short QA | exact match normalization/case/punctuation/articles; multiple references; token F1 implementation and empty answers |
| Long QA/RAG | answer correctness and citation faithfulness separately; retrieval access; rubric/judge/prompt/version; blind order and human audit |
| Math/code | final-answer parsing, symbolic tolerance or executable tests; environment/timeouts; public/hidden tests; pass@1 vs pass@k |
| Vision/segmentation | preprocessing, sample/patient grouping, IoU/Dice aggregation, prompts, thresholds and test-time information |

Record generations per example, temperature/top-p, seed policy, max tokens,
stop sequences, retries, majority/self-consistency/selection rule and compute.
A single draw, mean of draws, majority vote, best-of-k and pass@k are different
estimands. k is not a number of independent datasets. Do not compare them without
matched budgets and stated selection rules. For pass@k name the estimator and
total n/correct c; preserve all draws. Training seeds and decoding seeds differ.

Report attempted, scored, unscored and error counts, plus applicable coverage.
Under Inspect's documented policy, invalid MUT answers count incorrect, unparseable
grader verdicts are unscored, and infrastructure faults are errors. Options can
change handling; preserve effective configuration. Never silently exclude bad
model answers or score only successful infrastructure calls. Scorer error and
unscored flags may overlap other scorer outcomes; report per-scorer denominators.

## B03 Baseline and measurement qualification

Use strongest reasonable simple alternatives, not strawman prompts. Check
published evaluation scripts against the actual dataset task. Match information,
retrieval/tools, inference calls/tokens, tuning opportunities and hardware where
appropriate; disclose unmatched resources. Test the evaluator with known correct,
incorrect and malformed examples. A broken baseline or grader prevents a verdict.

## S01 Benchmark selection

Make a selection matrix linking each candidate dataset to natural failure,
population, endpoint, representative conditions, development/confirmation/external
role, size, leakage risk, license and cost. Explain exclusions and what each
dataset cannot represent. Public availability alone is insufficient. Choose a
minimum decisive set before expansion; do not switch to favorable tests after
seeing results. Synthetic diagnostics test mechanisms, not natural prevalence.

## S02 Data and split audit

Freeze dataset revision, config, split, sampling IDs and preprocessing digest.
Check cross-split duplicates/near duplicates, patient/person/task overlap, label
quality and transformation leakage. Record training/pretraining contamination as
known, tested or unknown. Restrict fit/tuning/retrieval to allowed information.
Keep development and confirmation separate; previously inspected test outcomes
remain developmental. Report filtering denominator and exclusions. Check licenses,
restricted access and privacy from actual sources; unknown is not permission.

## S03 Models and provider choices

Choose models to expose or test the mechanism, not a brand ranking. Compare
capability, modality, context, deployment, data constraints and P04 budget.
Keep model family, precise API ID/snapshot or weight revision, tokenizer/chat
template, quantization, precision, tools, decoding and access date. ChatGPT product
availability and OpenAI API availability are separate. A model switch requires
representative requalification and an explicit protocol version; no silent switch.
Proposed AI Lab roles describe configurable responsibilities, not tested superiority
or a claim that an account/endpoint is connected. No paid calls are implied.

## S04 Fair settings and tuning

Define development-only tuning ranges and budgets for each method/baseline,
selection metric and stopping rules. Resource differences must be reported and
scientifically justified. Equal parameter counts alone are not fairness. Include
modern training-free/simple alternatives when their function overlaps the method.
Avoid applying a novel module only to a weak baseline if stronger methods already
address the failure. Keep developmental and selected configurations visible.

## S05 Run manifest

The effective manifest contains project/protocol/run IDs; code/dirty-patch digest;
paper and claim versions; model/tokenizer/data revisions; sample IDs; prompts;
task/evaluator commit/config; extraction/normalization; generation and selection;
seeds; tuning provenance; precision/device placement; environment lock; hardware;
resource limits; retry/error/exclusion policy; raw logs/predictions; uncertainty
unit and aggregation; timestamps and result digests. Store secrets separately.
Retain enough to replay measured results. Documentation-only manifests are not
execution receipts. Bind the exact command and provider ID on actual execution.
