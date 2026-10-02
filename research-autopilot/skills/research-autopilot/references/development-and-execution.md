# Development, Gate A and recoverable execution

Read gate-a.md for authoritative gate conditions. Development is a loop, not a
one-shot pass requirement. Preserve the existing state machine and exact caller
route. The phases below are workflow descriptions, not new enum values.

## G01 Minimum informative design

Choose the cheapest valid contrast that distinguishes the core prediction from
the strongest competitor. Minimum means decision-capable, not a fixed tiny n.
Define unit, endpoint, control, practical effect, uncertainty and budget. Route
implementation needs to E; return to this same question with exact task identity.

## G02 Development before confirmation

Use discovery/dev data for code repair, qualified baseline tuning and prespecified
exploratory ranges. Allow repeated attempts within agreed time/cost/attempt bounds;
record failed and unselected trials, changed parameters and reasons. Human may
revise the development budget with a recorded decision. Do not kill a scientific
hypothesis because the first implementation crashed.

Separate development loop → qualification → frozen confirmation → verdict.
Freeze all result-affecting setup, hypotheses, metrics, tolerance/uncertainty,
eligibility, exclusions, budgets and verdict rules before seeing confirmation.
Previously viewed results stay developmental. A result-affecting repair or new
hyperparameter after unblinding creates a child protocol and new valid confirmation,
never retroactively turns the old result into a prespecified test. Preserve lineage.

## G03 Qualification

Check paper-to-code semantics, metric/evaluator canaries, hand-computable cases,
correct baseline, positive control where appropriate and resource feasibility.
Failure to qualify is INCONCLUSIVE/repair, not scientific falsification. Confirm
that disabled modules really remove the intended function and no held-out label
or unauthorized information enters inference. Record actual scope of checks.

## G04 Executing the chosen route

Use the project's real prompt, inference or training command and appropriate
harness; don't introduce a framework just for uniformity. Bind protocol/code/config
digests and authorized resource limits to a unique run/job ID. Capture raw outputs,
predictions, stderr, timestamps, failures and costs. A planned command or submitted
job is not completed evidence. Reconcile provider status before retry after an
unknown acknowledgment. Record unsupported adapters rather than simulate success.

## G05 Verdict and next branch

Evaluate only eligible confirmation evidence with frozen rules. PASS justifies
specified next-stage work; REVISE requires a substantive developmental revision;
KILL is scientific or importance failure under valid conditions; INCONCLUSIVE
is inadequate/invalid evidence. Distinguish engineering failure, insufficient
power/resources and contradicted hypothesis. Unexpected result loops to H/M or
B if the cause/problem changes; always preserve frozen Parent and IPCG obligations.

## E01 Environments and file isolation

For each project/protocol family use an explicit conda/venv/container environment,
locked dependencies and recorded interpreter, CUDA/driver/library versions. Use
separate working directories, output roots, temporary paths, caches when writes
can clash, ports and checkpoint names. Reuse read-only model/data caches only
when safe; do not duplicate huge data without need. Avoid mutating one shared
environment during other running jobs. Capture full command and dirty patch.

Containers/conda do not reserve GPUs. Inspect actual device IDs and scheduler
allocations. CUDA_VISIBLE_DEVICES scopes processes but does not prevent other
jobs using the same hardware. Use exclusive allocations, memory reservations or
agreed concurrency limits, actual peak measurements and OOM recovery. Multiple
programs on one GPU require distinct run IDs and output roots. Do not describe
these norms as an implemented cluster scheduler. Inspect Docker sandboxes isolate
only operations routed through sandbox(); host tools/network have separate bounds.

## E02 Semantic checks and canaries

Check properties that can change scientific results: dimensions, train/test split,
masking, gradient flow, normalization, information access, scorer denominators,
disabled-component behavior and restore equivalence. Prefer hand-computable
examples and positive controls. Do not spend the development budget testing every
implementation detail or count mocks as model performance evidence.

## E03 Queue and monitoring

Record resource request/reservation vs actual allocation, project/protocol/job ID,
env/workdir/device, owner, dependencies, limits, log path, heartbeat, costs and
status from real provider receipts. Queue conflicting tasks or adjust with P04.
Measure CPU/RAM/storage/GPU memory and utilization as relevant. Stop/retry only
according to real job state and requested scope. No scheduler, API or paid run
is presumed available because a node exists.

## E04 Diagnosis and protocol branching

Classify environment, implementation, evaluator, data, resource, optimization or
hypothesis failure. Find the smallest causal explanation from real logs and a
minimal reproduction. Change one justified cause, recheck affected semantics,
and retain before/after evidence. Changes affecting predictions, samples or scores
invalidate affected confirmation and require child protocol qualification; pure
display changes need only artifact checks. Repeated failures can trigger a human
discussion about feasibility or scope; not repeated blanket permissions.

## E05 Recovery and repository maintenance

Save immutable run manifest, logs, predictions, configs, environment, checkpoints,
random state, protocol lineage and next action. Separate private data/secrets from
publishable artifacts. Resume by reconciling committed code, dirty patches and
actual provider status. Restore only a compatible checkpoint and record resumed
work without double-counting samples/runs. Use branches/releases and issues on
GitHub; record HF model/data/Space revisions/cards with the same release identity.
Link fixes to affected experiments and releases; never overwrite negative evidence.
