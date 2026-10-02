## 7. State model and routing

Ordinary phase advances accepted by `advance_phase` are the following
machine-readable matrix. All other ordinary phase advances are illegal. Freeze,
gate decisions, repair completion, and writing advancement use their dedicated
outcomes in the normative table below; a generic phase change cannot replace them.

```json
{
  "schema_version": "1.0.0",
  "phase_advances": [
    {"route": "explore_problem", "from": "landscape", "to": "candidate_generation"},
    {"route": "audit_method", "from": "landscape", "to": "candidate_generation"},
    {"route": "audit_rejection", "from": "landscape", "to": "candidate_generation"},
    {"route": "develop_candidate", "from": "candidate_generation", "to": "collision_audit"},
    {"route": "repair_evidence", "from": "landscape", "to": "active_research"}
  ],
  "default": "illegal"
}
```

For an existing mature M/R project, `begin_retrospective_validation` enters
`full_experiments/active_research` only after A3/E3 audit evidence is verified.
It then freezes and evaluates a retrospective full-validation protocol before
writing. It never imports a prose statement of PASS as a verified decision.

`I`, `M`, and `R` describe immutable intake origin. They are never transition targets. Track the current route and lifecycle separately:

```yaml
entry_origin: I | M | R
current_route: explore_problem | audit_method | audit_rejection | repair_evidence | develop_candidate | replicate_or_transfer | execute_gate_a | full_experiments | prepare_writing | retarget | stopped
lifecycle_phase: intake | landscape | candidate_generation | collision_audit | gate_a_design | gate_a_execution | active_research | evidence_freeze | writing | submission_lock | terminal
asset_stage: A0_topic | A1_method | A2_pilot | A3_mature
evidence_trust: E0_narrative | E1_tables | E2_recomputable | E3_audited
claim_clarity: C0_topic | C1_question | C2_falsifiable
literature_state: L0_unsearched | L1_mapped | L2_primary_verified | L3_current_snapshot | stale
gate_state: not_ready | gate_a_frozen | pass | revise | kill | inconclusive
validation_state: not_ready | frozen | pass | revise | kill | inconclusive
writing_state: not_ready | evidence_frozen | planning | drafting | submission_lock
terminal_status: none | completed | stopped | abandoned | superseded
suspension: null | {return_route, return_phase, blocking_obligation_ids, suspended_snapshot_digest}
```

Routing behavior follows `current_route`, not `entry_origin`. Origin changes mandatory context only: an `R` project always retains and rechecks its reviewer-issue ledger; an `M` project always retains its authoritative asset/provenance audit; an `I` project always retains its problem-selection and landscape rationale. Rerouting never erases those obligations.

Paper websites and interactive explainers are optional presentation handoffs,
specified in [research-websites.md](research-websites.md). Their Project Page
subnode IDs are navigation labels, not new routes/phases/outcomes. Reuse current
assets and evidence status without initializing a new scientific lineage or
advancing a gate merely to design a page. Website design does not certify research
validation; an actual scientific gap follows the existing repair route.

The following outcome mapping is normative. The machine-readable transition matrix in `state-and-routing.md` additionally enumerates ordinary within-route phase advances; any route/outcome combination absent from that matrix is illegal.

| Event or outcome | Allowed source | Next `current_route` | Next `lifecycle_phase` | Other state |
| --- | --- | --- | --- | --- |
| confirm origin `I` | uninitialized | `explore_problem` | `landscape` | persist `entry_origin: I` |
| confirm origin `M` | uninitialized | `audit_method` | `landscape` | persist `entry_origin: M` |
| confirm origin `R` | uninitialized | `audit_rejection` | `landscape` | persist `entry_origin: R` |
| `freeze_parent_problem` | initial exploration/audit at `landscape` | unchanged | unchanged | freeze the six fields; replacing the parent requires a restart |
| `record_natural_gate_0` | exploration/audit/candidate | unchanged | unchanged | recompute retained observations; record PASS/KILL/INCONCLUSIVE |
| `importance_decision` CONCURRENT | current nonterminal problem | unchanged | unchanged | current parent/census/candidate; original value retained |
| `importance_decision` REROUTE or second distinct major collision | current nonterminal problem | `explore_problem` | `landscape` | archive parent; invalidate candidate/gates/writing; require new parent/Gate 0 |
| `importance_decision` KILL | current nonterminal problem | unchanged | unchanged | block candidate development and Gate freezing; preserve evidence |
| `restart_problem_exploration` | any nonterminal route | `explore_problem` | `landscape` | explicit reassessment, including legacy projects; origin unchanged |
| `research_candidate` | `explore_problem`, `audit_method`, `audit_rejection`, `repair_evidence`, or `develop_candidate` | `develop_candidate` | `collision_audit` | require parent binding and Natural Gate 0 PASS; invalidate prior importance review |
| `no_new_idea_needed` with `A3`, `E3`, and full-validation `PASS` | `audit_method` or `audit_rejection` | `prepare_writing` | `evidence_freeze` | freeze a current evidence snapshot before setting `writing_state: evidence_frozen` |
| `no_new_idea_needed` with `C2` claim and current `L2+` evidence | `audit_method` or `audit_rejection` | `execute_gate_a` | `gate_a_design` | `gate_state: not_ready` |
| `no_new_idea_needed` without those preconditions | `audit_method` or `audit_rejection` | `repair_evidence` | `landscape` | record missing obligations |
| `retarget_writing` with full-validation `PASS` | `audit_rejection` or `audit_method` | `prepare_writing` | `evidence_freeze` | preserve prior decision/review lineage; freeze current evidence snapshot |
| `retarget_writing` without full-validation `PASS` | `audit_rejection` or `audit_method` | `repair_evidence` | `active_research` | record exact claim–evidence closure gaps |
| `evidence_repair` | any nonterminal route except `repair_evidence` | `repair_evidence` | `landscape` | store source route/phase and blockers in `suspension`; invalidate dependent projections |
| `REPAIR_VERIFIED` | `repair_evidence` | exact `suspension.return_route` | exact `suspension.return_phase` | require every blocker closed under a fresh snapshot, then clear `suspension` |
| `REPAIR_VERIFIED` without a prior suspended route | `repair_evidence` | origin default: `I→explore_problem`, `M→audit_method`, `R→audit_rejection` | `landscape` | require every blocker closed, then clear `suspension` |
| idea `stop` | any nonterminal route | `stopped` | `terminal` | `terminal_status: stopped` |
| collision `ADVANCE` | `develop_candidate` | `execute_gate_a` | `gate_a_design` | require complete collision proof and current IPCG CONCURRENT bound to it |
| collision `REFINE` or `REROUTE_MECHANISM` | historical only | rejected for new requests | — | use IPCG CONCURRENT/REROUTE/KILL |
| collision `REROUTE_EVIDENCE` or `INCONCLUSIVE_EXPAND_SEARCH` | `develop_candidate` | `repair_evidence` | `landscape` | preserve the candidate; suspend return to `develop_candidate/collision_audit` with blockers and snapshot digest |
| collision `REROUTE_REPLICATION_OR_TRANSFER` | historical only | rejected for new requests | — | a new natural failure needs fresh exploration |
| `REPLICATION_OR_TRANSFER_CLAIM_FROZEN` | `replicate_or_transfer` | `develop_candidate` | `collision_audit` | require a child candidate and audit the new contribution claim before Gate A |
| collision `KILL`, pending approval | `develop_candidate` | `develop_candidate` | `collision_audit` | decision remains provisional |
| explicit user stop after collision `KILL` | any nonterminal route | `stopped` | `terminal` | imported approval files cannot authorize abandonment |
| Gate A `PASS` | `execute_gate_a` | `full_experiments` | `active_research` | `gate_state: pass` |
| Gate A `REVISE` | `execute_gate_a` | `develop_candidate` | `candidate_generation` | `gate_state: revise`; require child candidate/protocol |
| Gate A `KILL` | `execute_gate_a` | `stopped` | `terminal` | `gate_state: kill`; preserve reuse options |
| Gate A `INCONCLUSIVE` | `execute_gate_a` | `repair_evidence` | `landscape` | `gate_state: inconclusive`; suspend return to `execute_gate_a/gate_a_design` and record exact missing evidence |
| full-validation `PASS` | `full_experiments` | `prepare_writing` | `evidence_freeze` | `validation_state: pass`; `writing_state: evidence_frozen` only after snapshot commit |
| full-validation `REVISE` | `full_experiments` | `develop_candidate` | `candidate_generation` | `validation_state: revise`; invalidate dependent claim projections |
| full-validation `KILL` | `full_experiments` | `stopped` | `terminal` | `validation_state: kill`; `terminal_status: stopped` |
| full-validation `INCONCLUSIVE` | `full_experiments` | `repair_evidence` | `landscape` | `validation_state: inconclusive`; suspend return to `full_experiments/active_research` and record missing replication/control/evidence |
| venue-only retarget | `prepare_writing` | `retarget` | `writing` | revalidate venue rules and snapshot freshness |
| explicit stop | any nonterminal route | `stopped` | `terminal` | preserve lineage and reusable assets |

Every transition whose destination is `repair_evidence` must either populate `suspension` with an exact return route, phase, blocker set, and pre-repair snapshot digest, or explicitly declare that no prior route exists and use the origin fallback. The validator rejects a repair entry that satisfies neither case.

Every transition requires a unique transition ID, expected prior sequence, reason code, evidence IDs, previous and next state, actor, timestamp, schema version, and previous-event digest. The append-only event ledger is canonical; `research-state.json` is an atomically replaced projection reconstructed by replay. A separately and atomically maintained trusted `ledger-anchor.json` records lineage ID, final sequence, and head digest, so deletion of a complete final event is detected. Transitions use an optimistic version check and lock so concurrent agents cannot both advance the same state. Duplicate transition IDs are idempotent. Truncation, tail deletion, reordering, altered digests, or an incompatible schema blocks progression and offers read-only recovery. Two recorded distinct major functional collisions per parent force fresh exploration regardless of new evidence. The older no-new-evidence counter additionally bounds non-collision experimental revisions; it cannot override IPCG.

### 7.1 Resume and recovery

Resume detection precedes new intake on every invocation. Locate state from an explicit path, the configured durable state root, or the current project. Validate schema versions, ledger continuity, asset hashes, permissions, pending operations, and frozen artifacts before continuing.

- If one valid state matches, show project, current route, last completed milestone, changed assets, unresolved blocker, and next safe action. Proceed without a question when that action is read-only and unambiguous.
- If multiple states match, ask one selection question.
- If state is corrupt or incompatible, preserve it unchanged and offer read-only recovery; never silently overwrite or merge it.
- “Start over” creates a new lineage and marks the earlier state `superseded` only with user approval.
- Persist accepted intake values after each answer and never re-ask confirmed, denied, or unchanged fields. Revisit a deferred field only when a later concrete action makes it blocking, explain the new dependency, and offer a skip or degraded route.
- Before resuming a side effect, reconcile its stable operation ID and provider job, commit, PR, or publication ID. An adapter is retry-safe only if the provider enforces the idempotency key or can query by an immutable request/effect fingerprint. If neither capability exists after a lost acknowledgment, enter `manual_reconciliation_required` and never retry automatically.
- Repository or Hub revision changes create a new asset version or evidence overlay rather than mutating a frozen snapshot.
