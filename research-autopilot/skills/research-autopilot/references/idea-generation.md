## 9. Entry-specific idea generation

Every generated outcome is immutable and uses a discriminated schema:

- `research_candidate`: full `IdeaAtom` requirements apply;
- `no_new_idea_needed`: references the already adequate method/claim and next route;
- `stop`: states the blocking evidence and reusable assets;
- `evidence_repair`: states which invalid or missing evidence must be repaired before ideation;
- `retarget_writing`: identifies a writing/positioning/venue-only change and the evidence snapshot that must remain unchanged or be revalidated.

Evidence and judgments are separate envelopes.

### Start from the task, benchmark and simple baselines

Inspect the user's benchmark specifications, repository, evaluator, existing runs
and task logs before proposing a mechanism. Read the task, version, split, input
and output, primary task metric, and resource constraints. If those assets are
absent, retrieve primary benchmark documentation or ask the one essential task
question. Do not invent a benchmark or silently select an easier subset. Explain
how the evaluation represents the intended natural failure; benchmark popularity
alone does not establish importance. Keep discovery data separate from the final
confirmation split. A benchmark deficiency may justify a measurement contribution,
but requires natural evidence, an evaluator audit and an explicit new contract.

Generate ideas in this order:

1. Map SOTA and qualified simple baselines to the actual task and metric. Read
   failure examples and retained runs; separate observations from explanations.
2. Build a natural failure census with a denominator and downstream task harm.
   Identify which failures remain after the strongest simple alternative.
3. Check inexpensive remedies first: prompt changes, direct rereading, retrieval,
   recency rules, a planner/checker/solver, or a simple statistical baseline when
   applicable. Qualify their implementation, tuning and information access fairly.
4. Draft a small set of structurally different hypotheses tied to those remaining
   failures. Include simplification or no new method as a serious possible outcome.
   Use the entry-specific lenses below to explain observed gaps, not to invent a
   use for an attractive representation or module.
5. For each candidate, state why the minimal added mechanism might address a gap
   the simple baseline leaves, the strongest counterargument, and one comparison
   that could disprove this necessity. Reject candidates justified only by being
   different. Rank by consequential task value, baseline gap, evidence quality,
   falsifiability and total cost; unknown evidence stays unknown.
6. Retrieve closest work from the draft hypothesis, complete collision/IPCG, then
   approve one Idea Atom and freeze its decisive Gate A comparison.

For a memory representation change, include a qualified `plain_text_memory`
baseline: faithful text storage plus a reasonable prompt/retrieval policy, under
the same task, available information and resource limits. Also test the relevant
simple selector, such as recency, retrieval or a lightweight filter. A latent
representation must predict a specific task-success or resource benefit that
survives these comparisons and an ablation replacing it with text. A storage name,
compression ratio or selection score alone is insufficient. This does not presume
that latent representations are always useless: their advantage is a hypothesis
to test. If text is adequate under the declared constraints, prefer simplification
or `no_new_idea_needed`. Do not redesign the benchmark merely to favor the proposal.

Every candidate contains a `necessity_case`: `simple_alternatives_compared`,
`unresolved_task_failure`, `expected_advantage` (explicitly a hypothesis),
`decisive_comparison`, `memory_representation_change`, and captured
`baseline_evidence_refs`. The comparison list includes every frozen parent
`simple_alternatives` entry; memory representation changes additionally include
the canonical `plain_text_memory` entry. The refs support the observed baseline
gap or primary evidence; they do not assert an unrun candidate has already won.
Record what would kill the proposal, not just how to support it. Give a candid
verdict with uncertainty; enthusiasm or agreement with the user supplies no evidence.

Before method design, freeze the six-field Parent Problem and require Natural
Gate 0 PASS. Bind every candidate to `parent_problem_ref`. Draft only the atomic
hypothesis needed for collision retrieval; approve the complete Idea Atom after
the importance-preserving review. Reframes that change the natural failure,
population or consequence return to I-style exploration and a fresh parent/Gate 0.
See [importance-preserving-gate.md](importance-preserving-gate.md).

### `I`

Apply lenses such as phenomenon/measurement, assumption-breaking, mechanism
transfer, interface mismatch, metric blind spot, and regime boundary to the
observed task failures and baseline gaps. Generate structurally different atoms,
not stylistic variants. Isolate lenses only when the host supports the context
isolation; never claim independent generation when one context supplied all atoms.

### `M`

Audit assets and the actual benchmark before generation. An existing latent
module is an asset to evaluate, not a requirement to preserve. Valid outputs
include mechanism diagnosis, simplification, boundary law, measurement paper,
constrained reframe, or no new idea. Mature experiments with unverified provenance
do not skip evidence review.

### `R`

Create one issue card per reviewer proposition. Writing-only objections route to writing. Missing evidence routes to an evidence sprint. Novelty or mechanism failures may generate a constrained reframe. Leakage or invalid evaluation quarantines affected evidence before any new narrative is generated.

Required `research_candidate` fields include question, importance, literature tension, bottleneck, minimal intervention, causal chain, dominant claim, unique prediction, falsifier, simplest alternative, provisional closest-work delta, decisive test, compute estimate, risks, and source evidence IDs. The generator labels its closest-work delta as a hypothesis for the later collision audit, never as a novelty verdict.

The generator never judges its own novelty. `stop`, `no_new_idea_needed`, `evidence_repair`, and `retarget_writing` are valid outcomes and do not fabricate mechanism, falsifier, or novelty fields.
