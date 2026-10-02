## 11. Gate A: minimum falsification

Gate A determines whether the central idea is worth a larger research loop. A pass does not establish the paper claim.

Require frozen Parent Problem, Natural Gate 0 PASS and current IPCG CONCURRENT
before implementing a method or freezing this protocol. Bind all three artifact
references into the protocol digest. A synthetic positive control qualifies the
mechanics; it does not replace a natural failure census or prove problem value.

Use the frozen benchmark's actual final-task metric and resource constraints.
Auxiliary detection/selection scores may diagnose a mechanism but cannot replace
the task endpoint. An efficiency claim needs measured latency, cost or storage
and a task-quality guardrail. Compare the qualified strongest simple alternative;
memory representation changes include text storage with a reasonable
prompt/retrieval policy and an ablation replacing latent state with text. Match
information access and the declared compute/call/context limits, report any
unavoidable differences, and preserve the full task population rather than a
post-hoc favorable subset. Baseline tuning uses discovery data; confirmation stays
held out. Equal performance with greater complexity supports simplification.

Before execution, freeze:

- intervention and strongest executable baseline;
- mandatory controls;
- context, dataset, split, scale, and seed policy;
- primary metric, aggregation, and minimum meaningful effect;
- hard resource guardrails;
- pass, revise, kill, and inconclusive rules;
- debugging allowance and changes that require a new protocol version.

The protocol also fixes metric direction, threshold inclusivity, aggregation, paired/unpaired design, minimum valid runs, variance or confidence rule, missing/NaN/Inf handling, rounding policy, run eligibility, confirmatory versus developmental evidence, and decision-rule precedence. It receives an immutable protocol ID and semantic digest. Every run and decision carries that digest plus exact Git tree and dirty-patch digests, data/model revisions, environment, command, seed, hardware, metric-code digest, checkpoints, and raw-output digests.

Previously inspected runs are developmental evidence. Confirmatory evidence requires a freeze event before result unblinding. Any result-affecting change to method, baseline, data, split, seed policy, metric, threshold, aggregation, controls, checkpoint rule, or allowed tuning space creates a child protocol with a new digest. Earlier runs stay visible but are ineligible as confirmatory evidence for the child.

Execution ladder:

1. semantic and mathematical checks;
2. dependency, data, memory, and license checks;
3. shape, dtype, device, seed, checkpoint, gradient, and unit tests;
4. tiny overfit or synthetic positive control;
5. resource canary;
6. baseline qualification;
7. paired treatment/control runs;
8. deterministic metric calculation and gate decision.

Decisions:

- `PASS`: the predeclared effect and central discriminating contrast pass;
- `REVISE`: a specific new boundary or corrected formulation survives, but the original scope or mechanism does not;
- `KILL`: a clean result contradicts an indispensable claim or hard constraint;
- `INCONCLUSIVE`: implementation, baseline, variance, access, or budget prevents valid judgment.

There is no weak pass. Development results cannot be relabeled as confirmatory. All runs, crashes, OOMs, and negative outcomes remain in an append-only ledger.

`evaluate_gate.py` is a pure function from one frozen protocol plus verified eligible run manifests to one decision and stable reason codes. It applies this precedence:

1. corrupt, missing, stale, digest-mismatched, incomplete, or ineligible input → `INCONCLUSIVE`;
2. unqualified baseline or failed positive control → `INCONCLUSIVE`;
3. intrinsic violation of a predeclared fatal mathematical/resource constraint, or adequately precise evidence that the indispensable primary effect is below its minimum threshold → `KILL`;
4. primary effect passes but a predeclared severable mechanism, scope, or modularity contrast fails and a prospective child hypothesis is specified → `REVISE`;
5. every indispensable primary and mechanism rule passes and all guardrails hold → `PASS`;
6. every other combination → `INCONCLUSIVE`.

The evaluator never infers `REVISE` from prose after results. Threshold equality, mixed pairs, excessive variance, OOMs, duplicate records, record ordering, and non-finite values have golden fixtures.

## 15. Handoffs after Gate A

After Gate A `PASS`, the orchestrator may propose full experiments. It creates a claim–evidence roadmap, experiment tracker, resource estimate, replication requirement, and stop criteria. Gate A does not permanently authorize the paper claim.

### 15.1 Full-validation evidence gate

Before confirmatory full experiments are unblinded, freeze `full-validation-protocol.yaml` against `full-validation-protocol.schema.json`. It binds the claim set and indispensable claim IDs, evidence mode (`prospective_confirmatory` or `retrospective_audit`), external or held-out replications, strongest baselines and matching rules, datasets/splits/regimes, mandatory controls and ablations, robustness and uncertainty criteria, multiple-comparison policy where applicable, resource guardrails, negative-result handling, minimum evidence per claim, eligibility rules, and exact `PASS`, `REVISE`, `KILL`, and `INCONCLUSIVE` conditions. It carries an immutable ID and semantic digest; result-affecting edits create a child protocol.

Use `prospective_confirmatory` for new runs: previously inspected results remain developmental and cannot be relabeled. Use `retrospective_audit` for an existing mature or rejected project when rerunning everything is neither required nor justified. That mode registers the complete pre-existing result inventory before evaluation, binds claims to the submitted or pre-audit manuscript rather than a result-selected rewrite, preserves full positive/mixed/negative tables, and may authorize only claims supported by audited provenance and frozen external criteria. Its `PASS` means “adequate evidence for this bounded claim and writing stage,” never “preregistered confirmation”; the handoff must retain that distinction.

`evaluate_gate.py --gate full-validation` is the same kind of pure, deterministic evaluator used for Gate A and emits `full-validation-decision.json` against its dedicated schema. Precedence is:

1. corrupt, missing, stale, digest-mismatched, ineligible, or incomplete evidence → `INCONCLUSIVE`;
2. failed baseline qualification, control, or required replication → `INCONCLUSIVE` when validity is unresolved, otherwise `KILL` when a valid replication directly contradicts an indispensable claim under the frozen rule;
3. valid evidence below a frozen indispensable effect, robustness, safety, or resource threshold → `KILL`;
4. all indispensable claims pass but a predeclared severable scope or mechanism claim fails and a prospective child claim set is specified → `REVISE`;
5. every indispensable claim, replication, control, uncertainty, and guardrail rule passes → `PASS`;
6. every other combination → `INCONCLUSIVE`.

Only full-validation `PASS`, a freshly committed evidence snapshot, and a successful claim-to-evidence closure check authorize `writing_state: evidence_frozen`. Other outcomes follow the normative state table in Section 7. Golden fixtures cover conflicting replications, missing controls, newly discovered confounds, weakened effects, stale literature snapshots, and all four outcomes.

Every downstream handoff validates against `handoff.schema.json` and includes project and method versions, evidence-snapshot digest, allowed and forbidden claims, limitations, negative results, source data and artifact IDs, venue/stage, unresolved risks, and provenance. Writing receives only claims supported by that handoff. Every non-table figure receives a retained standalone prompt or deterministic plotting source. Tables stay as editable manuscript objects. Appendix or Extended Data is planned from evidence obligations, not used to hide inconvenient results.

After `REVISE`, create a new idea/protocol version and require fresh evidence. After `KILL`, preserve reusable assets and offer stop, negative-result, measurement, or constrained-repurpose routes. After `INCONCLUSIVE`, report the exact missing evidence and cost of resolving it.
