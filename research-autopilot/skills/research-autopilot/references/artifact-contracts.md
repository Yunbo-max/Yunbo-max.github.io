# Artifact contracts

Supported package/schema version: 1.0.0. Registry: `schemas/*.schema.json`.
Persist schema_id and schema_version on each object. JSON is valid YAML and is
the default encoding of emitted .yaml files; optional ordinary YAML input needs
the host's existing PyYAML.

Use absolute PROJECT and SKILL_DIR paths. Scripts return JSON and stable errors.
They do not run project code, launch compute, issue grants, or save to cloud storage.

| Command | Purpose |
| --- | --- |
| `init_project.py --root PROJECT --name NAME --goal GOAL --entry I|M|R --mode audit` | Create confirmed-origin state; resume an existing matching project |
| `validate_artifact.py FILE` | Validate a registered artifact |
| `validate_artifact.py HANDOFF --evidence-root PROJECT` | Validate handoff against current full-validation closure |
| `validate_artifact.py --project PROJECT` | Verify ledger, anchor, projection, frozen artifacts |
| `replay_state.py --root PROJECT` | Display verified state; --repair-projection restores its cache |
| `transition_state.py --root PROJECT --request REQUEST` | Apply an outcome with an optimistic sequence and unique transition ID |
| `freeze_gate.py --root PROJECT --protocol INPUT --gate gate-a` | Retain immutable protocol and a freeze event |
| `evaluate_gate.py --protocol FROZEN --runs DIRECTORY --gate gate-a` | Pure deterministic decision; --root PROJECT retains it |
| `redact_artifact.py --root PROJECT --path PATH --replacement FILE` | Replace a sidecar, append a tombstone, invalidate dependent decisions |
| `migrate_state.py --root PROJECT --to 1.0.0` | Content-addressed backup and supported-version recovery |

Each command is `python3 "$SKILL_DIR/scripts/<command>"`.
Use `--gate full-validation` for the later evidence gate.

IPCG adds `parent-problem-card`, `natural-gate-0` and `importance-decision` schemas.
Use the existing transition command to freeze the parent, record recomputed Gate 0
and apply an importance decision. Read [importance-preserving-gate.md](importance-preserving-gate.md)
for exact fields, natural observation format and legacy-project reassessment.
New Gate freezes bind the current parent/census/importance references into the
protocol digest. Record their nested raw/source refs in the canonical ledger.
The Parent Problem also binds the captured benchmark/task/metric/split/resource
contract and required simple alternatives. New candidates must declare a
`necessity_case` covering those alternatives and evidence of the remaining gap;
memory representation changes include `plain_text_memory`. Older Idea Atoms remain
readable, but require this contract before further candidate advancement.

## Evidence identity and gate inputs

Local evidence references are `{"path":"evidence/raw.json","sha256":"<64 hex>"}`.
Paths are relative to PROJECT; traversal and symlinks are forbidden. Materialize
remote evidence through an authorized connector before using it in the helper.

Use `--evidence-root PROJECT` for pure evaluation, or `--root PROJECT` to retain
the decision. Use distinct run IDs and folders for each protocol; preserve earlier
manifests and raw outputs. Helpers retain protocols and decisions in immutable
`protocols/<id>.json` and `decisions/<id>.json` folders.

Protocols contain protocol_id, evidence_mode, evidence_snapshot_ref, seed_policy,
min_valid_runs, required_groups, guardrails, and criteria. A criterion contains id,
metric, direction (maximize|minimize), min_effect, inclusive, indispensable,
min_runs, uncertainty (none|normal), confidence, and optional group selectors.
Normal intervals are an explicitly chosen approximation, not a universal method.
A prospective_child_hypothesis must exist before results to permit REVISE.

Run manifests contain run_id, protocol_id/digest, seed, group, status,
baseline_qualified, positive_control_passed, result_recorded_at, provenance,
resources, metrics, and raw_output_refs. Each raw JSON output contains the same
run_id, seed, group, flags, resources, and metrics:
`metrics[metric] = {"treatment": number, "control": number}`.
Manifest measurements must agree with retained raw content. Duplicate seed/group
pairs, missing evidence, non-finite metrics, and development runs are ineligible.
A protocol's confirmatory result timestamp must follow its anchored freeze;
independently verify reported timestamps against source provenance.

Transition requests contain transition_id, expected_sequence, outcome,
reason_code, evidence_refs, and payload. They cannot patch origin or authority.
Gate transitions require the referenced decision and its recomputation.
Full-validation additionally binds claim_set, indispensable_claim_ids,
inventory_run_ids, manuscript identity for retrospective audits, and the declared
multiple-comparison policy. Each indispensable contrast covers every required
replication group in this paired helper. After PASS, commit a new snapshot whose
closure maps claims to criterion IDs and retained result references, lists all
evaluated run IDs, contains no unresolved confounds, and binds the saved decision.
A closure boolean is insufficient. `advance_writing` cannot skip a writing stage.

Hashes prove content identity, not timestamp truth, measurement validity, scientific
novelty, or host authority. Imported grants authorize nothing. The heuristic secret
scanner is a containment aid rather than a proof. Ledger/anchor contamination
requires a host-authorized replacement lineage; sidecar redaction cannot mint one.
Unsupported migration versions remain read-only. Do not claim tests were run
when the user directed skipping them.

The local anchor detects a deleted/truncated tail and mismatched projections.
It is not a signature against an attacker who can rewrite the ledger and anchor
together. Preserve the head in the host's trusted durable storage for that threat
model. Host approval and sandbox capabilities are detailed in
[host-adapters.md](host-adapters.md).

## 13. Project artifacts

Default project structure:

```text
autoresearch/
├── research-intake.yaml
├── research-state.json
├── event-ledger.jsonl
├── ledger-anchor.json
├── evidence/
│   ├── search-ledger.jsonl
│   ├── works.jsonl
│   ├── evidence-units.jsonl
│   └── snapshots/
├── ideas/
├── audits/
├── gate-a/
│   ├── protocols/
│   ├── runs/
│   └── decisions/
├── operations/
│   └── operation-ledger.jsonl
├── experiments/
│   └── full-validation/
├── claims/
├── writing/
├── figures/
└── communication/
    └── website-brief.md
```

The artifact root is disclosed before the first write, lives outside source repositories by default, uses restrictive permissions, and is isolated per project. It is protected from accidental commits. Safe export, retention, redaction, and deletion are explicit user actions.

Raw project code and large model artifacts normally remain in authoritative content-addressed storage. Every decision-bearing object must be durably available by immutable identifier and verified digest for the required retention period. A pointer and hash alone are insufficient when the object has disappeared; unavailable decision evidence invalidates recomputation and produces `INCONCLUSIVE`. Run manifests capture the Git tree and dirty patch, submodules/LFS, preprocessing, environment/container, structured command, RNG and seeds, hardware/software, metric code, checkpoint, and raw-output identities.

Every persisted artifact and JSONL event has a registered schema ID and version. Validators reject unknown versions, duplicate YAML keys, unsafe tags, non-finite numbers, truncated JSONL, invalid paths, orphaned IDs, and broken cross-file references with stable error codes and JSON paths.

For a requested website, use the optional `website` object on the existing
`handoff` schema and reference its brief/assets through retained source identities.
Read [research-websites.md](research-websites.md) for its fields, node connections
and acceptance contract. Website briefs and front-end/media sources are deliverable
assets, not new ledger events or legal research-state values. The generic handoff
validator does not check the contents of the `website` extension; review those
fields and scientific interactions against the reference and actual site.

External operations use `planned → submitted → running → completed | failed | cancelled | manual_reconciliation_required` states, stable idempotency keys, attempt IDs, provider IDs, cumulative budget reservations, bounded retries, and reconciliation before retry. Automatic retry after a lost acknowledgment is permitted only when the adapter records that the provider enforces idempotency or supports query-by-fingerprint. Otherwise the operation fails closed into manual reconciliation; interrupted acknowledgment never silently causes a duplicate job, push, PR, upload, or publication.
