# Importance-Preserving Collision Gate (IPCG)

Contents: [Parent Problem](#freeze-the-parent-problem),
[Natural Gate 0](#natural-gate-0), [collision decisions](#after-collision-exactly-three-research-decisions),
[commands and compatibility](#commands-and-compatibility).

Preserve problem value, not only novelty survival. Ask after every functional
collision: does the remaining claim still address the original consequential
natural failure? Sunk effort, a new name or an uncovered corner supplies no answer.

Use this order: SOTA map and natural failure census; frozen Parent Problem;
hidden assumption; Natural Gate 0; collision audit of a draft atomic hypothesis;
IPCG; approved Idea Atom; frozen Gate A; method implementation. A draft hypothesis
is enough to retrieve nearby work; it is not an approved research contribution.
M/R entry retains its asset/reviewer obligations while applying the same checks.

## Freeze the Parent Problem

Create a `parent-problem-card` and commit `freeze_parent_problem` before method
design. The ledger event freezes its content hash. Fill all six fields:

| Field | Required question |
| --- | --- |
| `natural_failure` | Where does a real system fail? |
| `population_id`, `population` | Which tasks/users form the eligible population? |
| `prevalence` | What is the sampling rule, denominator and scope of the rate? |
| `consequence` | What final-task endpoint is harmed, and by how much? |
| `strong_simple_alternative` | Can rereading, retrieval, a planner, judge, checker or solver already resolve it? |
| `falsifiable_prediction` | What observable result distinguishes the explanation? |

Also freeze `benchmark_contract`: `benchmark_id`, `version`, `task`,
`primary_metric`, `evaluation_split`, nonempty `resource_constraints`,
`relevance_to_natural_failure` and captured `source_evidence_refs`. Use the user's
actual benchmark/evaluator; a newly selected one needs an explicit relevance
argument. Declare `simple_alternatives`, including `strong_simple_alternative`.
For memory representation proposals include a qualified text baseline, and
relevant simple prompt/retrieval/selectors. Read
[idea-generation.md](idea-generation.md) for the positive generation procedure.

Declare project-specific `gate_0_thresholds`: `min_cases`, `min_affected`,
`min_prevalence`, `min_mean_loss`, `min_unresolved_fraction`. Fractions are in [0,1];
the three effect/fraction thresholds must be positive. State why the sample and
meaningful-loss thresholds answer the task question. There is no universal
importance score. Changing a parent requires an explicit restart and a new card,
with `previous_parent_problem_ref` linking the archived parent.

## Natural Gate 0

Estimate P(target failure | eligible real agent failures), using a captured
failure census, rather than merely proving that an example can be constructed.
Do not describe this conditional rate as prevalence across all users/tasks.
Retain the inclusion rule, sampling coverage, dates, omissions and uncertainty.
The helper's point screen is a discovery check, not a population-level estimate
or a causal proof; stronger inference requires the project's statistical analysis.

A `natural-gate-0` binds the parent and `observations_ref`. Its captured JSON has
`sampling_kind: natural_failures`, `cases`, and `benchmark_id`,
`benchmark_version`, `evaluation_split`, `primary_metric` matching the contract.
Evidence outside a benchmark requires a documented mapping to the same task and
metric; naming the benchmark in a report alone is not that mapping.
Each case has a unique `case_id`,
`population_id`, `natural_failure`, `endpoint`, `strong_simple_alternative`,
`natural: true`, `failed_episode: true`, `affected`, nonnegative `downstream_loss`,
`alternative_solves`, and `source_ref`. The retained source JSON equals the case
without `source_ref`. The helper checks identity/scope and recomputes affected
fraction, mean loss among affected failures and the fraction the simple alternative
does not resolve. Keep all eligible cases, including unaffected ones.

Record `record_natural_gate_0`; the report's PASS/KILL/INCONCLUSIVE must agree with
recomputation. Missing/constructed observations, duplicate episodes or an
insufficient sample are INCONCLUSIVE. Adequate observed data below frozen value
thresholds is KILL. If a general solver already resolves the cases, detection
alone provides no room for a new method. Synthetic controls remain useful to
verify mechanisms; they cannot alone establish this natural pain point.
No training or new GPU allocation is required: existing logs or recorded prompt
experiments may supply the evidence. Respect their privacy and provenance.

## After collision: exactly three research decisions

Save an `importance-decision` with current parent, Natural Gate 0, candidate when
present, collision report when present, evidence and a reason. `retained_problem`
must match the parent's failure, population ID, endpoint, simple alternative and
falsifiable prediction for CONCURRENT. Explain residual task impact and what the
closest work does/does not solve; matching fields alone do not establish value.

| Decision | Required action |
| --- | --- |
| CONCURRENT | Preserve the same consequential problem; make mechanism/observable boundaries explicit; qualify the simple baseline. |
| REROUTE | Return to `explore_problem/landscape`; establish a new natural failure/parent and Gate 0. Preserve the original entry and every prior artifact. |
| KILL | Stop developing the remaining contribution; retain reusable assets and report why. Final project abandonment follows the user's explicit stop instruction. |

No fourth decision permits repeated lexical narrowing to keep novelty alive.
Low-level collision coverage can remain incomplete/provisional; that is a blocker
to deciding, not an extra way to approve the contribution. Final ADVANCE additionally
requires complete collision proofs and a CONCURRENT review bound to that report.

Record distinct major functional collisions in `functional_collision_work_refs`:
primary full-text records covering problem definition, mechanism or an essential
claim, with retained spans and an explicit equivalence rationale. Mere vocabulary,
scale or dataset overlap does not count. Canonical work IDs deduplicate repeated
mentions of the same paper. Two recorded distinct major collisions per parent
override a requested CONCURRENT with REROUTE; fresh papers do not reset the budget.

Use `exclusion_basis` for first subdomain use, another memory type, pairwise to
higher-order only, or a schema/model/benchmark-only restriction. Such labels cannot
authorize CONCURRENT. A rescue needs a newly evidenced natural failure, a distinct
falsifiable prediction and consequential final-task impact: establish those through
REROUTE, a fresh Parent Problem and Natural Gate 0 before further collision review.
Missing natural evidence remains unknown; do not claim the pain point is absent.

## Commands and compatibility

Use the existing `python3 scripts/transition_state.py --root PROJECT --request FILE`
with the normal unique ID, expected sequence, reason, refs and payload:

| Request `outcome` | Payload |
| --- | --- |
| `freeze_parent_problem` | `parent_problem_ref` |
| `record_natural_gate_0` | `natural_gate_0_ref` |
| `importance_decision` | `importance_decision_ref` |
| `restart_problem_exploration` | Empty object; disclose the reassessment to the user |

Both candidate creation and Gate freezing require Natural Gate 0 PASS; Gate
freezing also requires current CONCURRENT. Candidate changes invalidate the
importance review. Protocol digests bind parent, census and importance identities.
Old ledgers remain readable; adopt the new artifacts before further candidate
creation or Gate freezing. Use `restart_problem_exploration` for a legacy project
already past intake. Legacy REFINE/mechanism/transfer reroutes may replay as history
but are rejected as new collision decisions. `entry_origin` remains immutable:
I-style restart changes `current_route`, not the historical origin.

The helper enforces declared scope, benchmark identity, source identity, counts,
baseline-comparison declarations and workflow rules.
It cannot certify that imported episodes are genuinely natural, that inclusion is
unbiased, that labels are correct, that loss is causal or that a functional
equivalence judgment is scientifically sound. Nor can it establish baseline
quality or method necessity from a filled form. Audit these from the primary evidence;
do not create synthetic records and present them as real observations.
