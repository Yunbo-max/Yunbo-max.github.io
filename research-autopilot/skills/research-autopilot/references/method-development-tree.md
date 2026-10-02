# Idea routes and method design

Use after or alongside problem discovery; preserve Parent Problem/Natural Gate 0,
collision/IPCG and evidence constraints. The tree is an exploration index, not a
guarantee of novelty or improvement. Multiple routes can support one hypothesis.

## H01 Eight routes

| Route | Starting material | Mechanism question | First discriminating check |
|---|---|---|---|
| Real-condition baseline gap | strong open baseline, reproducible natural failures | which implicit assumption fails under a real condition? | reproduce baseline, measure prevalence, intervene on that condition |
| Complementary composition | two mechanisms with distinct responsibilities | what information/function is missing, and why are mechanisms compatible? | A, B, A+B, budget-matched replacement and relevant interaction controls |
| Experiment-driven discovery | unexpected result/error clusters/negative finding | which competing explanations fit the observation? | predictive controlled contrast on fresh data |
| Cross-domain mechanism transfer | root cause translated into abstract variables | which external mechanism addresses the same constraint? | verify assumptions/interface and compare simple in-domain substitute |
| Mathematical derivation | identified objective/inconsistency/constraint | which derivation changes behavior and under which assumptions? | limiting cases, counterexample and computationally valid prediction |
| Efficiency or system constraint | latency/memory/communication/failure bottleneck | where is real end-to-end cost and what can be removed/shared? | matched quality-cost frontier and complete measured overhead |
| Data or evaluation redesign | measurement blind spot/coverage/label problem | does the current instrument measure the desired property? | validity checks, natural distribution and independent baseline reassessment |
| Simplification or unification | redundant components/inconsistent explanations | can a simpler account preserve utility or reveal necessity? | removal/replacement and strongest simple model under matched conditions |

The user's screenshot supplies route 1: recent strong open baseline → successful
reproduction → real condition omitted by its assumptions → publicly testable
condition → smallest intervention. Distribution shift, occlusion, missing modality
or scarce labels are candidates, not automatically established important problems.
Do not infer that one or two added modules will probably succeed. Reproduction,
natural prevalence and mechanism tests decide whether to continue.

## H02 Composition and competing explanations

For any combination, write component responsibilities, representations, available
information, training/inference coupling and expected interaction. Test whether
gains come from extra parameters, budget, labels, retrieval or tuning. Ablation
does not alone prove causal mechanism. Include replacement and prediction tests
where claimed. Do not call packaging or renamed old computation a new mechanism.
Function-level collision review remains mandatory across all routes.

## H03 Idea atom from observation

Return observation, uncertainty, important failure, two or more structurally
different explanations, smallest intervention, distinguishing prediction,
falsifier, strongest simple competitor, resource estimate and collision status.
New hypotheses generated from results are developmental until tested on fresh,
appropriately independent confirmation. A valid negative/null result can support
boundary or measurement contributions; don't discard candidates by result sign.

## M01 Causal intervention

Map failure → proposed cause → available signal/state → intervention → predicted
behavior → task consequence. For each component record its one scientific duty,
information dependencies and evidence obligation. Remove components with no
defensible duty. Explain why the strongest simple alternative is insufficient.
Keep observation, mechanism hypothesis and experimentally supported inference
separate. Use multiple plausible interventions when uncertainty warrants it.

## M02 Mathematical and computational specification

Define symbols, units, shapes, domains, objectives, conditioning, normalization,
optimization and train/test information. Check dimensions, sign, boundedness,
denominators, empty/degenerate cases, gradients and limiting cases. State all
assumptions and where they hold. A theorem requires proof or a clearly marked
conjecture; an equation is not proof of efficacy. Derive an algorithm that can
actually be computed with available information. Record approximation and error.

## M03 Minimum algorithm and interface

Specify inputs/outputs/state, initialization, update and termination, train vs
inference vs prompt route, pseudocode and a paper-to-code mapping. Preserve the
baseline interface and isolate the intervention. Name precision/batching/random
state effects, invalid input behavior and serialization needed for recovery.
Propose semantic checks on a hand-computable example and a qualified canary.

## M04 Complexity and boundaries

Derive time/memory in relevant variables for complete training and inference;
measure wall time, peak memory, data movement, API/call cost and communication
when material. Parallel kernels and overhead may reverse Big-O rankings. Compare
complete quality-cost frontiers and state hardware/warmup/batch conditions. Predict
failure/success regimes and test boundaries rather than claiming universal gains.

## M05 Evidence obligations by contribution

Methods need fair baselines, mechanism/replacement controls and scope evidence;
theory needs assumptions, proofs, counterexamples and relevant numerical checks;
phenomena need prevalence, controls and independent confirmation; systems need
end-to-end cost/utility and failure recovery; data/benchmarks need construction,
validity, coverage and contamination audits. Close each component's obligation
or narrow/remove its claim. Hand the obligations to G and V before paper framing.
