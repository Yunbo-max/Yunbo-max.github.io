"""Local, deterministic artifact helpers for research-autopilot (1.0.0)."""
import argparse
import contextlib
import copy
import datetime as dt
import fcntl
import hashlib
import json
import math
import os
import re
import statistics
import sys
import tempfile
import uuid
from pathlib import Path

VERSION = "1.0.0"
ZERO = "0" * 64
SKILL = Path(__file__).resolve().parent.parent
ORIGIN_ROUTE = {"I": "explore_problem", "M": "audit_method", "R": "audit_rejection"}
SECRET = re.compile(r"(?:gh[pousr]_[A-Za-z0-9]{20,}|hf_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|Bearer\s+[A-Za-z0-9._-]{20,})")
SIGNED_URL = re.compile(r"https?://[^\s\"<>]+[?&](?:sig|signature|X-Amz-Signature|X-Goog-Signature|token)=[^\s\"<>]+", re.I)
CREDENTIAL_URL = re.compile(r"(?:https?|ssh)://[^\s/@:]+:[^\s/@]+@",re.I)
PERSONAL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\b\d{3}-\d{2}-\d{4}\b")

class Failure(Exception):
    def __init__(self, code, path="$"):
        self.code = code
        self.path = "$" if SECRET.search(path) or SIGNED_URL.search(path) or CREDENTIAL_URL.search(path) or PERSONAL.search(path) else path
        super().__init__(code)

def fail(code, path="$"):
    raise Failure(code, path)

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")

def stamp(value):
    try:
        result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if result.tzinfo is None:
            fail("TIMESTAMP_TIMEZONE_REQUIRED")
        return result
    except (AttributeError, ValueError):
        fail("INVALID_TIMESTAMP")

def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)

def hashed(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()

def filehash(path):
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        fail("EVIDENCE_UNAVAILABLE")

def envelope(name, **fields):
    return {"schema_id": name, "schema_version": VERSION, **fields}

def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            fail("DUPLICATE_KEY")
        result[key] = value
    return result

def parse_json(text):
    try:
        return json.loads(text, object_pairs_hook=unique_keys,
                          parse_constant=lambda _: fail("NON_FINITE_NUMBER"))
    except (ValueError, TypeError):
        fail("INVALID_JSON")

def load_file(path):
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        fail("FILE_UNAVAILABLE")
    try:
        return parse_json(text)
    except Failure as error:
        if path.suffix.lower() not in {".yaml", ".yml"} or error.code != "INVALID_JSON":
            raise
    try:
        import yaml
    except ImportError:
        fail("YAML_READER_UNAVAILABLE_USE_JSON")
    class StrictLoader(yaml.SafeLoader):
        pass
    def mapping(loader, node, deep=False):
        pairs = []
        for key_node, value_node in node.value:
            key = loader.construct_object(key_node, deep=deep)
            if not isinstance(key, str):
                fail("NON_STRING_YAML_KEY")
            pairs.append((key, loader.construct_object(value_node, deep=deep)))
        return unique_keys(pairs)
    StrictLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, mapping)
    try:
        value = yaml.load(text, Loader=StrictLoader)
    except yaml.YAMLError:
        fail("UNSAFE_OR_INVALID_YAML")
    finite(value)
    return value

def finite(value, path="$"):
    if isinstance(value, float) and not math.isfinite(value):
        fail("NON_FINITE_NUMBER", path)
    if isinstance(value, dict):
        for key, child in value.items():
            finite(child, path + "." + str(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            finite(child, path + "[" + str(index) + "]")

def scan(value, path="$"):
    if isinstance(value, str):
        if SECRET.search(value) or SIGNED_URL.search(value) or CREDENTIAL_URL.search(value):
            fail("SECRET_MATERIAL_DETECTED", path)
        if PERSONAL.search(value):fail("PERSONAL_MATERIAL_REQUIRES_REDACTION",path)
    if isinstance(value, dict):
        for key, child in value.items():
            if not isinstance(key, str):
                fail("NON_STRING_KEY")
            if SECRET.search(key) or SIGNED_URL.search(key) or PERSONAL.search(key):
                fail("SECRET_MATERIAL_DETECTED")
            if key.lower() in {"password", "api_key", "access_token", "private_key", "secret_value"} and child:
                fail("SECRET_FIELD_FORBIDDEN", path + "." + key)
            if key.lower() in {"patient_id","ssn","personal_phone","contact_email","passport_number"} and child:
                fail("PERSONAL_FIELD_REQUIRES_REDACTION",path)
            scan(child, path + "." + str(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            scan(child, path + "[" + str(index) + "]")

def schema_check(value, schema, path="$"):
    for keyword in ("anyOf", "oneOf"):
        if keyword in schema:
            count = 0
            for branch in schema[keyword]:
                try:
                    schema_check(value, branch, path)
                    count += 1
                except Failure:
                    pass
            if count == 0 or (keyword == "oneOf" and count != 1):
                fail("SCHEMA_ALTERNATIVE", path)
    kind = schema.get("type")
    checks = {
        "object": lambda v: isinstance(v, dict),
        "array": lambda v: isinstance(v, list),
        "string": lambda v: isinstance(v, str),
        "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
        "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
        "boolean": lambda v: isinstance(v, bool),
        "null": lambda v: v is None,
    }
    if kind and not checks[kind](value):
        fail("SCHEMA_TYPE", path)
    if "const" in schema and value != schema["const"]:
        fail("SCHEMA_CONST", path)
    if "enum" in schema and value not in schema["enum"]:
        fail("SCHEMA_ENUM", path)
    if isinstance(value, dict):
        if len(value) < schema.get("minProperties", 0):
            fail("SCHEMA_MIN_PROPERTIES", path)
        for key in schema.get("required", []):
            if key not in value:
                fail("SCHEMA_REQUIRED", path + "." + key)
        for key, child in value.items():
            definition = schema.get("properties", {}).get(key)
            if definition is not None:
                schema_check(child, definition, path + "." + key)
            elif schema.get("additionalProperties") is False:
                fail("SCHEMA_EXTRA_PROPERTY", path + "." + key)
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            fail("SCHEMA_MIN_ITEMS", path)
        if schema.get("uniqueItems") and len({canonical(v) for v in value}) != len(value):
            fail("SCHEMA_DUPLICATE_ITEM", path)
        for index, child in enumerate(value):
            schema_check(child, schema.get("items", {}), path + "[" + str(index) + "]")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            fail("SCHEMA_MIN_LENGTH", path)
        if "pattern" in schema and not re.search(schema["pattern"], value):
            fail("SCHEMA_PATTERN", path)
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        for key, predicate in [
            ("minimum", lambda a, b: a >= b), ("maximum", lambda a, b: a <= b),
            ("exclusiveMinimum", lambda a, b: a > b),
            ("exclusiveMaximum", lambda a, b: a < b),
        ]:
            if key in schema and not predicate(value, schema[key]):
                fail("SCHEMA_RANGE", path)

def validate(value, expected=None):
    if not isinstance(value, dict):
        fail("ARTIFACT_OBJECT_REQUIRED")
    name = value.get("schema_id")
    if expected is not None and name != expected:
        fail("ARTIFACT_KIND_MISMATCH")
    if not isinstance(name, str) or not re.fullmatch(r"[a-z0-9-]+", name):
        fail("UNKNOWN_SCHEMA")
    schema_path = SKILL / "schemas" / (name + ".schema.json")
    if not schema_path.is_file():
        fail("UNKNOWN_SCHEMA")
    finite(value)
    scan(value)
    schema_check(value, load_file(schema_path))
    if name == "research-intake":
        inference = value["entry_inference"]
        if inference["status"] == "confirmed" and inference["value"] not in ORIGIN_ROUTE:
            fail("PROVISIONAL_ORIGIN_CANNOT_BE_CONFIRMED")
    if name == "research-state":
        route, phase = value["current_route"], value["lifecycle_phase"]
        compatible={"explore_problem":{"intake","landscape","candidate_generation"},"audit_method":{"intake","landscape","candidate_generation"},
            "audit_rejection":{"intake","landscape","candidate_generation"},"develop_candidate":{"candidate_generation","collision_audit"},
            "replicate_or_transfer":{"candidate_generation"},"repair_evidence":{"landscape","active_research"},
            "execute_gate_a":{"gate_a_design","gate_a_execution"},"full_experiments":{"active_research"},
            "prepare_writing":{"evidence_freeze","writing","submission_lock"},"retarget":{"writing","submission_lock"},"stopped":{"terminal"}}
        if phase not in compatible[route]:fail("ROUTE_PHASE_INCOMPATIBLE")
        if route == "repair_evidence":
            suspension = value["suspension"]
            if not isinstance(suspension, dict):
                fail("REPAIR_SUSPENSION_REQUIRED")
            schema_check(suspension, {"type":"object", "required":["return_route", "return_phase", "blocking_obligation_ids", "suspended_snapshot_digest"],
                "properties":{"return_route":{"enum":[r for r in ORIGIN_ROUTE.values()]+["develop_candidate","replicate_or_transfer","execute_gate_a","full_experiments","prepare_writing","retarget"]},
                "return_phase":{"enum":["landscape","candidate_generation","collision_audit","gate_a_design","gate_a_execution","active_research","evidence_freeze","writing","submission_lock"]},
                "blocking_obligation_ids":{"type":"array","minItems":1,"uniqueItems":True,"items":{"type":"string","minLength":1}},
                "suspended_snapshot_digest":{"type":"string","pattern":"^[0-9a-f]{64}$"}}})
        elif value["suspension"] is not None:
            fail("SUSPENSION_OUTSIDE_REPAIR")
        if route in {"prepare_writing","retarget"} and (value["validation_state"] != "pass" or value["writing_state"] == "not_ready" or not value.get("evidence_snapshot_ref")):
            fail("WRITING_EVIDENCE_REQUIRED")
        if (route == "stopped") != (phase == "terminal") or (route == "stopped") != (value["terminal_status"] != "none"):
            fail("TERMINAL_STATE_INCONSISTENT")
    if name in {"gate-a-protocol","full-validation-protocol"}:
        groups = set(value["required_groups"])
        if not any(r["indispensable"] for r in value["criteria"]):
            fail("INDISPENSABLE_CRITERION_REQUIRED")
        if len({r["id"] for r in value["criteria"]}) != len(value["criteria"]):
            fail("DUPLICATE_CRITERION_ID")
        for rule in value["criteria"]:
            selected = rule.get("groups", value["required_groups"])
            if not selected or len(set(selected)) != len(selected) or not set(selected).issubset(groups):
                fail("INVALID_CRITERION_GROUPS")
        if value.get("design", "paired") != "paired" or value.get("aggregation", "mean") != "mean":
            fail("UNSUPPORTED_STATISTICAL_DESIGN")
        if value.get("rounding_policy", "none") != "none" or value.get("missing_policy", "inconclusive") != "inconclusive":
            fail("UNSUPPORTED_NUMERICAL_POLICY")
    if name == "evidence-snapshot" and len(set(value["claim_ids"])) != len(value["claim_ids"]):
        fail("DUPLICATE_CLAIM_ID")
    if name == "full-validation-protocol":
        claims=set(value.get("claim_set",[]));indispensable=set(value.get("indispensable_claim_ids",[]))
        if not indispensable or not indispensable.issubset(claims) or not value.get("multiple_comparison_policy"):
            fail("FULL_VALIDATION_CLAIM_SET_REQUIRED")
        if not value.get("inventory_run_ids") or len(set(value["inventory_run_ids"]))!=len(value["inventory_run_ids"]):
            fail("FULL_RESULT_INVENTORY_REQUIRED")
        if any(r.get("claim_id") not in claims for r in value["criteria"]):
            fail("FULL_CRITERION_CLAIM_MISMATCH")
        if any(r["indispensable"] and set(r.get("groups",value["required_groups"]))!=set(value["required_groups"]) for r in value["criteria"]):
            fail("REQUIRED_REPLICATION_CONTRAST_MISSING")
    if name == "work-record" and value["read_depth"] in {"D2","D3"}:
        if value["full_text_status"] != "available" or not value["evidence_refs"]:
            fail("FULL_TEXT_EVIDENCE_REQUIRED")
    if name == "idea-atom" and value["kind"] == "research_candidate":
        for key in ("question", "importance", "literature_tension", "bottleneck",
                    "minimal_intervention", "causal_chain", "dominant_claim",
                    "unique_prediction", "falsifier", "simplest_alternative",
                    "closest_work_hypothesis", "decisive_test", "compute_estimate", "risks"):
            if not value.get(key):
                fail("CANDIDATE_FIELD_REQUIRED", "$." + key)
    return value

def safe_path(root, relative):
    if not isinstance(relative, str):
        fail("INVALID_PATH")
    rel = Path(relative)
    if rel.is_absolute() or ".." in rel.parts or not rel.parts:
        fail("PATH_OUTSIDE_PROJECT")
    candidate = root / rel
    for part in (candidate, *candidate.parents):
        if part == root.parent:
            break
        if part.is_symlink():
            fail("SYMLINK_FORBIDDEN")
    if not candidate.resolve().is_relative_to(root.resolve()):
        fail("PATH_OUTSIDE_PROJECT")
    return candidate

def root_path(value):
    raw = Path(value).absolute()
    if any(part.is_symlink() for part in (raw, *raw.parents)):
        fail("SYMLINK_FORBIDDEN")
    return raw.resolve()

def reference(root, path):
    path = path.resolve()
    if not path.is_relative_to(root.resolve()):
        fail("PATH_OUTSIDE_PROJECT")
    return {"path": path.relative_to(root).as_posix(), "sha256": filehash(path)}

def verify_ref(root, ref, expected=None):
    schema_check(ref, {"type": "object", "required": ["path", "sha256"]})
    path = safe_path(root, ref["path"])
    if filehash(path) != ref["sha256"]:
        fail("EVIDENCE_DIGEST_MISMATCH")
    if expected:
        return validate(load_file(path), expected)
    return path

def verify_snapshot(root, ref):
    snapshot = verify_ref(root, ref, "evidence-snapshot")
    works, units = {}, []
    for item in snapshot["artifact_refs"] + snapshot["negative_result_refs"]:
        path = verify_ref(root, item)
        if path.suffix.lower() in {".json",".yaml",".yml"}:
            artifact = load_file(path)
            if isinstance(artifact, dict) and "schema_id" in artifact:
                validate(artifact)
                if artifact["schema_id"] == "work-record":
                    if artifact["work_id"] in works:
                        fail("DUPLICATE_WORK_ID")
                    works[artifact["work_id"]] = artifact
                elif artifact["schema_id"] == "evidence-unit":
                    units.append(artifact)
                for nested in artifact.get("evidence_refs", []) + artifact.get("raw_output_refs", []):
                    verify_ref(root, nested)
    for unit in units:
        if unit["work_id"] not in works:
            fail("ORPHAN_EVIDENCE_WORK")
        if unit["claim"] not in snapshot["claim_ids"]:
            fail("ORPHAN_EVIDENCE_CLAIM")
        for locator in unit["locators"]:
            if not locator.get("artifact_ref") or not any(locator.get(key) for key in ("section","page","figure","table","lines","span")):
                fail("EVIDENCE_LOCATOR_REQUIRED")
            verify_ref(root, locator["artifact_ref"])
    return snapshot

def verify_repair(root, state, payload):
    suspension = state["suspension"]
    if "evidence_snapshot_ref" not in payload:
        fail("FRESH_REPAIR_SNAPSHOT_REQUIRED")
    ref = payload["evidence_snapshot_ref"]
    snapshot = verify_snapshot(root, ref)
    if ref["sha256"] == suspension["suspended_snapshot_digest"]:
        fail("FRESH_REPAIR_SNAPSHOT_REQUIRED")
    if stamp(snapshot["created_at"]) < stamp(suspension.get("entered_at", "1970-01-01T00:00:00Z")):
        fail("FRESH_REPAIR_SNAPSHOT_REQUIRED")
    obligations = snapshot.get("closure", {}).get("obligations", [])
    records = {item.get("obligation_id"):item for item in obligations if isinstance(item,dict)}
    retained = {(r["path"],r["sha256"]) for r in snapshot["artifact_refs"]}
    for blocker in suspension["blocking_obligation_ids"]:
        item = records.get(blocker)
        if not item or item.get("status") != "closed" or not item.get("evidence_refs"):
            fail("UNCLOSED_REPAIR_OBLIGATION")
        for evidence in item["evidence_refs"]:
            if (evidence["path"],evidence["sha256"]) not in retained:
                fail("REPAIR_PROOF_NOT_IN_SNAPSHOT")
            verify_ref(root,evidence)
    return snapshot

def protocol_hash(protocol):
    return hashed({key: value for key, value in protocol.items()
                   if key not in {"protocol_digest", "frozen_at"}})

def atomic(path, content):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temporary = tempfile.mkstemp(prefix=".write-", dir=str(path.parent))
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
        directory = os.open(str(path.parent), os.O_RDONLY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

def verify_chain(text):
    if not text or not text.endswith("\n"):
        fail("TRUNCATED_LEDGER")
    events, previous, seen = [], ZERO, set()
    prior_state = None
    for line in text.splitlines():
        event = validate(parse_json(line), "ledger-event")
        if event["sequence"] != len(events) + 1 or event["previous_event_digest"] != previous:
            fail("LEDGER_CONTINUITY")
        if event["transition_id"] in seen:
            fail("DUPLICATE_TRANSITION_ID")
        seen.add(event["transition_id"])
        digest = hashed({key: value for key, value in event.items() if key != "event_digest"})
        if event["event_digest"] != digest:
            fail("LEDGER_DIGEST_MISMATCH")
        state = validate(event["next_state"], "research-state")
        if state["sequence"] != event["sequence"]:
            fail("STATE_SEQUENCE_MISMATCH")
        if event["previous_state_digest"] != (hashed(prior_state) if prior_state else ZERO):
            fail("PREVIOUS_STATE_MISMATCH")
        if prior_state and state["entry_origin"] != prior_state["entry_origin"]:
            fail("ORIGIN_IMMUTABLE")
        check_state_event(prior_state, event)
        previous, prior_state = digest, state
        events.append(event)
    return events

def check_state_event(prior, event):
    """Reject hash-consistent histories that contradict the transition matrix."""
    state, kind = event["next_state"], event["event_type"]
    if prior is None:
        if kind != "initialize" or state["current_route"] != ORIGIN_ROUTE[state["entry_origin"]] or state["lifecycle_phase"] != "landscape":
            fail("ILLEGAL_INITIAL_STATE")
        return
    if state["project_id"] != prior["project_id"] or state["operating_mode"] != prior["operating_mode"]:
        fail("PROJECT_IDENTITY_IMMUTABLE")
    route = prior["current_route"]
    outcome = event["payload"].get("outcome")
    if kind in {"gate_decision","operation","approval"}:
        if {k:v for k,v in state.items() if k!="sequence"} != {k:v for k,v in prior.items() if k!="sequence"}:
            fail("SIDE_EVENT_CANNOT_ADVANCE_RESEARCH")
        return
    if kind == "freeze":
        gate = event["payload"].get("gate")
        if route != ("execute_gate_a" if gate == "gate-a" else "full_experiments") or state["current_route"] != route:
            fail("FREEZE_ROUTE_MISMATCH")
        return
    if kind == "redaction":
        if state["current_route"] != "repair_evidence":
            fail("REDACTION_MUST_INVALIDATE_EVIDENCE")
        return
    if kind != "transition" or prior["terminal_status"] != "none":
        fail("ILLEGAL_EVENT_TYPE_OR_TERMINAL_ADVANCE")
    matrix = {
        "explicit_stop":(None,{"stopped"}), "stop":(None,{"stopped"}),
        "update_evidence":(None,{route}), "evidence_repair":(None,{"repair_evidence"}),
        "freeze_parent_problem":({"explore_problem","audit_method","audit_rejection"},{route}),
        "record_natural_gate_0":(None,{route}),
        "importance_decision":(None,{route,"explore_problem"}),
        "restart_problem_exploration":(None,{"explore_problem"}),
        "REPAIR_VERIFIED":({"repair_evidence"},{(prior.get("suspension") or {}).get("return_route",ORIGIN_ROUTE[prior["entry_origin"]])}),
        "research_candidate":({"explore_problem","audit_method","audit_rejection","repair_evidence","develop_candidate"},{"develop_candidate"}),
        "no_new_idea_needed":({"audit_method","audit_rejection"},{"execute_gate_a","prepare_writing","repair_evidence"}),
        "retarget_writing":({"audit_method","audit_rejection"},{"prepare_writing","repair_evidence"}),
        "begin_retrospective_validation":({"audit_method","audit_rejection"},{"full_experiments"}),
        "collision_ADVANCE":({"develop_candidate"},{"execute_gate_a"}),
        "collision_REFINE":({"develop_candidate"},{"develop_candidate"}),
        "collision_REROUTE_MECHANISM":({"develop_candidate"},{"develop_candidate"}),
        "collision_REROUTE_REPLICATION_OR_TRANSFER":({"develop_candidate"},{"replicate_or_transfer"}),
        "collision_REROUTE_EVIDENCE":({"develop_candidate"},{"repair_evidence"}),
        "collision_INCONCLUSIVE_EXPAND_SEARCH":({"develop_candidate"},{"repair_evidence"}),
        "collision_KILL":({"develop_candidate"},{"develop_candidate"}),
        "REPLICATION_OR_TRANSFER_CLAIM_FROZEN":({"replicate_or_transfer"},{"develop_candidate"}),
        "venue_only_retarget":({"prepare_writing"},{"retarget"}),
        "advance_writing":({"prepare_writing","retarget"},{route}),
        "advance_phase":(None,{route}),
    }
    for prefix, source in (("gate_a_","execute_gate_a"),("full_validation_","full_experiments")):
        for verdict,target in (("PASS","full_experiments" if prefix=="gate_a_" else "prepare_writing"),("REVISE","develop_candidate"),("KILL","stopped"),("INCONCLUSIVE","repair_evidence")):
            matrix[prefix+verdict]=({source},{target})
    if outcome not in matrix:
        fail("UNKNOWN_TRANSITION_OUTCOME")
    sources, targets = matrix[outcome]
    if (sources is not None and route not in sources) or state["current_route"] not in targets:
        fail("ILLEGAL_ROUTE_TRANSITION")
    if outcome == "REPAIR_VERIFIED" and state["lifecycle_phase"] != prior["suspension"]["return_phase"]:
        fail("REPAIR_RETURN_PHASE_MISMATCH")
    change_sets={
        "update_evidence":{"asset_stage","evidence_trust","claim_clarity","literature_state","evidence_snapshot_ref"},
        "advance_phase":{"lifecycle_phase"},
        "explicit_stop":{"current_route","lifecycle_phase","terminal_status","suspension"},
        "stop":{"current_route","lifecycle_phase","terminal_status","suspension"},
        "evidence_repair":{"current_route","lifecycle_phase","suspension"},
        "REPAIR_VERIFIED":{"current_route","lifecycle_phase","evidence_snapshot_ref","suspension"},
        "research_candidate":{"current_route","lifecycle_phase","candidate_id","candidate_ref","suspension","validation_state","writing_state","gate_state","importance_decision_ref","importance_outcome"},
        "freeze_parent_problem":{"parent_problem_ref","major_collision_work_ids","importance_decision_ref","importance_outcome"},
        "record_natural_gate_0":{"natural_gate_0_ref","natural_gate_0_outcome","natural_gate_0_metrics","importance_decision_ref","importance_outcome"},
        "importance_decision":{"importance_decision_ref","importance_outcome","major_collision_work_ids","previous_parent_problem_ref",
            "parent_problem_ref","natural_gate_0_ref","natural_gate_0_outcome","natural_gate_0_metrics","candidate_id","candidate_ref",
            "gate_a_protocol_ref","full_validation_protocol_ref","current_route","lifecycle_phase","suspension","gate_state","validation_state","writing_state"},
        "restart_problem_exploration":{"importance_decision_ref","importance_outcome","previous_parent_problem_ref",
            "parent_problem_ref","natural_gate_0_ref","natural_gate_0_outcome","natural_gate_0_metrics","candidate_id","candidate_ref",
            "gate_a_protocol_ref","full_validation_protocol_ref","current_route","lifecycle_phase","suspension","gate_state","validation_state","writing_state"},
        "advance_writing":{"writing_state","lifecycle_phase"},
        "venue_only_retarget":{"current_route","lifecycle_phase","venue"},
        "collision_KILL":{"pending_collision_ref","collision_status"},
    }
    if outcome in change_sets:
        changed={k for k in set(state)|set(prior) if state.get(k)!=prior.get(k)}-{"sequence"}
        if not changed.issubset(change_sets[outcome]):fail("TRANSITION_MODIFIED_UNRELATED_STATE")

def payload_refs(value):
    if isinstance(value,dict):
        if set(value)=={"path","sha256"}:return [value]
        return [r for v in value.values() for r in payload_refs(v)]
    if isinstance(value,list):return [r for v in value for r in payload_refs(v)]
    return []

def source_fingerprints(root,refs,seen=None):
    seen=set() if seen is None else seen
    fingerprints=set()
    for ref in refs:
        key=(ref["path"],ref["sha256"])
        if key in seen:continue
        seen.add(key)
        path=verify_ref(root,ref)
        if path.suffix.lower() not in {".json",".yaml",".yml"}:
            fingerprints.add(ref["sha256"]);continue
        value=load_file(path)
        kind=value.get("schema_id") if isinstance(value,dict) else None
        if kind in {"idea-atom","evidence-snapshot"}:
            nested=value.get("source_evidence_refs",[]) if kind=="idea-atom" else value["artifact_refs"]
            fingerprints.update(source_fingerprints(root,nested,seen))
        elif kind=="search-run":fingerprints.add(value["normalized_output_digest"])
        elif kind in {"work-record","evidence-unit","run-manifest"}:
            identity={k:v for k,v in value.items() if k not in {"created_at","searched_at","read_depth"}}
            fingerprints.add(hashed(identity))
        elif kind is None:fingerprints.add(ref["sha256"])
    return fingerprints

def recover(root):
    journal_path = root / ".pending-commit.json"
    if not journal_path.exists():
        return
    journal = load_file(journal_path)
    validate(journal,"commit-journal")
    expected = journal.pop("transaction_digest", None)
    if expected != hashed(journal):
        fail("RECOVERY_JOURNAL_CORRUPT")
    files = journal["files"]
    events = verify_chain(files["event-ledger.jsonl"])
    target_anchor = validate(parse_json(files["ledger-anchor.json"]), "ledger-anchor")
    if target_anchor["head_digest"] != events[-1]["event_digest"] or target_anchor["sequence"] != len(events) or target_anchor["lineage_id"] != events[-1]["next_state"]["project_id"]:
        fail("RECOVERY_ANCHOR_MISMATCH")
    if parse_json(files["research-state.json"]) != events[-1]["next_state"]:
        fail("RECOVERY_PROJECTION_MISMATCH")
    old_anchor = root / "ledger-anchor.json"
    current_head = load_file(old_anchor)["head_digest"] if old_anchor.exists() else ZERO
    if current_head not in {journal["previous_head"], target_anchor["head_digest"]}:
        fail("RECOVERY_PRECONDITION_MISMATCH")
    for relative, content in files.items():
        safe_path(root,relative)
        scan(content)
    for relative in journal.get("deletions",[]):
        safe_path(root,relative)
        if relative in files or relative in {".state.lock",".pending-commit.json"}:
            fail("RECOVERY_DELETE_CONFLICT")
    for relative, content in files.items():
        atomic(safe_path(root, relative), content)
    for relative in journal.get("deletions",[]):
        path=safe_path(root,relative)
        if path.exists():
            if not path.is_file():fail("RECOVERY_DELETE_NOT_FILE")
            path.unlink()
            directory=os.open(str(path.parent),os.O_RDONLY)
            try:os.fsync(directory)
            finally:os.close(directory)
    journal_path.unlink()
    directory=os.open(str(root),os.O_RDONLY)
    try:os.fsync(directory)
    finally:os.close(directory)

def commit_files(root, files, previous_head, deletions=None):
    for relative, text in files.items():
        safe_path(root,relative);scan(text)
    journal=envelope("commit-journal",previous_head=previous_head,files=files,deletions=deletions or [])
    journal["transaction_digest"]=hashed(journal)
    validate(journal)
    atomic(root/".pending-commit.json",canonical(journal)+"\n")
    recover(root)

@contextlib.contextmanager
def locked(root):
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    lock_path = safe_path(root, ".state.lock")
    fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            fail("PROJECT_BUSY")
        recover(root)
        yield
    finally:
        os.close(fd)

def project(root, repair=False):
    recover(root)
    events = verify_chain((root / "event-ledger.jsonl").read_text(encoding="utf-8"))
    anchor = validate(load_file(root / "ledger-anchor.json"), "ledger-anchor")
    if anchor["sequence"] != len(events) or anchor["head_digest"] != events[-1]["event_digest"] or anchor["lineage_id"] != events[-1]["next_state"]["project_id"]:
        fail("LEDGER_TAIL_OR_ANCHOR_MISMATCH")
    state = events[-1]["next_state"]
    projection = root / "research-state.json"
    if not projection.exists() or load_file(projection) != state:
        if not repair:
            fail("STATE_PROJECTION_MISMATCH")
        atomic(projection, canonical(state) + "\n")
    for event in events:
        if event["event_type"] == "freeze":
            frozen = verify_ref(root, event["payload"]["protocol_ref"])
            value = load_file(frozen)
            if protocol_hash(value) != value.get("protocol_digest"):
                fail("FROZEN_PROTOCOL_MODIFIED")
    operation_path=root/"operations/operation-ledger.jsonl"
    operation_text="".join(canonical(e)+"\n" for e in events if e["event_type"]=="operation")
    if operation_path.exists() and operation_path.read_text()!=operation_text:
        fail("OPERATION_PROJECTION_MISMATCH")
    redacted={(e["payload"].get("path"),e["payload"].get("old_digest")) for e in events if e["event_type"]=="redaction"}
    prior=None
    from _importance import verify_event
    for event in events:
        for item in event["evidence_refs"]:
            if (item["path"],item["sha256"]) not in redacted:
                verify_ref(root,item)
        if not any((r["path"],r["sha256"]) in redacted for r in event["evidence_refs"]):verify_event(root,prior,event)
        prior=event["next_state"]
    return state, events, anchor

def append(root, state, events, kind, reason, refs, payload, next_state,
           transition_id=None, request_digest=None, extra=None):
    for ref in refs:
        verify_ref(root, ref)
    next_state = copy.deepcopy(next_state)
    next_state["sequence"] = len(events) + 1
    validate(next_state, "research-state")
    event = envelope("ledger-event", sequence=len(events) + 1,
                     transition_id=transition_id or str(uuid.uuid4()),
                     event_type=kind, reason_code=reason, evidence_refs=refs,
                     actor="orchestrator", timestamp=now(),
                     previous_event_digest=events[-1]["event_digest"] if events else ZERO,
                     previous_state_digest=hashed(state) if state else ZERO,
                     request_digest=request_digest or hashed({"kind": kind, "payload": payload, "refs": refs}),
                     next_state=next_state, payload=payload)
    event["event_digest"] = hashed(event)
    validate(event, "ledger-event")
    all_events = events + [event]
    anchor = envelope("ledger-anchor", lineage_id=next_state["project_id"],
                      sequence=len(all_events), head_digest=event["event_digest"])
    files = dict(extra or {})
    if kind == "operation":
        files["operations/operation-ledger.jsonl"]="".join(canonical(e)+"\n" for e in all_events if e["event_type"]=="operation")
    files.update({
        "event-ledger.jsonl": "".join(canonical(item) + "\n" for item in all_events),
        "ledger-anchor.json": canonical(anchor) + "\n",
        "research-state.json": canonical(next_state) + "\n",
    })
    for relative, text in files.items():
        safe_path(root, relative)
        scan(text)
    commit_files(root,files,event["previous_event_digest"])
    return next_state

def init_project(args, root):
    if (root / "event-ledger.jsonl").exists():
        state, _, _ = project(root)
        if state["entry_origin"] != args.entry:
            fail("ORIGIN_IMMUTABLE")
        return {"status": "resumed", "state": state}
    if any(path.name != ".state.lock" for path in root.iterdir()):
        fail("PROJECT_ROOT_NOT_EMPTY")
    intake = envelope("research-intake",
        project={"name": args.name, "one_sentence_goal": args.goal, "operating_mode": args.mode},
        entry_inference={"value": args.entry, "status": "confirmed", "basis": ["Explicit confirmed-origin initialization"]},
        assets={}, sources={"entry": {"source": "confirmed intake", "status": "confirmed", "updated_at": now()}})
    validate(intake)
    state = envelope("research-state", project_id=str(uuid.uuid4()), project_name=args.name,
        entry_origin=args.entry, current_route=ORIGIN_ROUTE[args.entry], lifecycle_phase="landscape",
        sequence=1, operating_mode=args.mode,
        asset_stage="A0_topic" if args.entry == "I" else "A1_method",
        evidence_trust="E0_narrative", claim_clarity="C0_topic" if args.entry == "I" else "C1_question",
        literature_state="L0_unsearched", gate_state="not_ready", validation_state="not_ready",
        writing_state="not_ready", terminal_status="none", suspension=None)
    next_state = append(root, None, [], "initialize", "ORIGIN_CONFIRMED", [], {"entry_origin": args.entry},
                        state, extra={"research-intake.yaml": canonical(intake) + "\n"})
    for folder in ("evidence/snapshots", "ideas", "audits", "gate-a/runs",
                   "operations", "experiments/full-validation/runs", "claims", "writing", "figures"):
        safe_path(root, folder).mkdir(parents=True, exist_ok=True, mode=0o700)
    return {"status": "created", "state": next_state}

def freeze_gate(args, root):
    state, events, _ = project(root)
    protocol = validate(load_file(Path(args.protocol)), args.gate + "-protocol")
    from _importance import require_ready
    require_ready(root,state)
    for key in ("parent_problem_ref","natural_gate_0_ref","importance_decision_ref"):
        if key in protocol and protocol[key]!=state[key]:fail("PROTOCOL_IMPORTANCE_BINDING_MISMATCH")
        protocol[key]=state[key]
    verify_snapshot(root, protocol["evidence_snapshot_ref"])
    if not any(rule["indispensable"] for rule in protocol["criteria"]):
        fail("INDISPENSABLE_CRITERION_REQUIRED")
    if len({rule["id"] for rule in protocol["criteria"]}) != len(protocol["criteria"]):
        fail("DUPLICATE_CRITERION_ID")
    required_route = "execute_gate_a" if args.gate == "gate-a" else "full_experiments"
    if state["current_route"] != required_route:
        fail("FREEZE_ROUTE_MISMATCH")
    protocol["protocol_digest"] = protocol_hash(protocol)
    relative = (("gate-a" if args.gate == "gate-a" else "experiments/full-validation")
                + "/protocols/" + protocol["protocol_id"] + ".json")
    destination = safe_path(root, relative)
    if destination.exists():
        old = load_file(destination)
        if old.get("protocol_digest") != protocol["protocol_digest"]:
            fail("FROZEN_PROTOCOL_IMMUTABLE_CREATE_CHILD")
        return {"status": "already_frozen", "protocol_ref": reference(root, destination)}
    prior_key = "gate_a_protocol_ref" if args.gate == "gate-a" else "full_validation_protocol_ref"
    if prior_key in state:
        parent = verify_ref(root, state[prior_key], args.gate + "-protocol")
        if protocol.get("parent_protocol_digest") != parent["protocol_digest"]:
            fail("PARENT_PROTOCOL_REQUIRED")
    protocol["frozen_at"] = now()
    text = canonical(protocol) + "\n"
    ref = {"path": relative, "sha256": hashlib.sha256(text.encode()).hexdigest()}
    next_state = copy.deepcopy(state)
    next_state[prior_key] = ref
    if args.gate == "gate-a":
        next_state.update(gate_state="gate_a_frozen", lifecycle_phase="gate_a_execution")
    else:
        next_state["validation_state"] = "frozen"
    append(root, state, events, "freeze", "PROTOCOL_FROZEN", [protocol["evidence_snapshot_ref"]],
           {"gate": args.gate, "protocol_ref": ref}, next_state, extra={relative: text})
    return {"status": "frozen", "protocol_ref": ref, "protocol_digest": protocol["protocol_digest"]}

def evaluate(root, protocol, manifests, manifest_refs, gate):
    results, eligible = [], []
    pid = protocol.get("protocol_id", "unavailable") if isinstance(protocol, dict) else "unavailable"
    digest = protocol.get("protocol_digest", ZERO) if isinstance(protocol, dict) else ZERO
    if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
        digest = ZERO
    def finish(outcome, reasons):
        body = envelope(gate + "-decision", protocol_id=pid, protocol_digest=digest,
                        outcome=outcome, reason_codes=sorted(set(reasons)),
                        eligible_run_ids=sorted(eligible),
                        run_manifest_refs=sorted(manifest_refs, key=lambda ref: (ref["path"], ref["sha256"])),
                        criteria_results=results)
        body["decision_id"] = "decision-" + hashed(body)[:20]
        return body
    try:
        validate(protocol, gate + "-protocol")
        if digest != protocol_hash(protocol) or "frozen_at" not in protocol:
            fail("PROTOCOL_NOT_FROZEN")
        freeze_time = stamp(protocol["frozen_at"])
        verify_snapshot(root, protocol["evidence_snapshot_ref"])
        if not any(item["indispensable"] for item in protocol["criteria"]):
            fail("INDISPENSABLE_CRITERION_REQUIRED")
        if len({item["id"] for item in protocol["criteria"]}) != len(protocol["criteria"]):
            fail("DUPLICATE_CRITERION_ID")
        if len(manifests) < protocol["min_valid_runs"]:
            fail("INSUFFICIENT_VALID_RUNS")
        identities, pairs = set(), set()
        ordered = sorted(manifests, key=lambda item: (str(item.get("group")), str(item.get("run_id"))))
        if len(manifests)!=len(manifest_refs):fail("MANIFEST_REF_COUNT_MISMATCH")
        verified={canonical(verify_ref(root,r,"run-manifest")) for r in manifest_refs}
        if any(canonical(m) not in verified for m in manifests):fail("MANIFEST_INPUT_DIGEST_MISMATCH")
        if gate=="full-validation" and set(protocol["inventory_run_ids"])!={m["run_id"] for m in manifests}:
            fail("FULL_RESULT_INVENTORY_INCOMPLETE")
        for manifest in ordered:
            validate(manifest, "run-manifest")
            if manifest["run_id"] in identities or (manifest["seed"], manifest["group"]) in pairs:
                fail("DUPLICATE_RUN")
            identities.add(manifest["run_id"])
            pairs.add((manifest["seed"], manifest["group"]))
            if manifest["protocol_id"] != pid or manifest["protocol_digest"] != digest:
                fail("STALE_RUN_PROTOCOL")
            if manifest["status"] != "completed":
                fail("INCOMPLETE_RUN")
            if manifest["evidence_mode"] != protocol["evidence_mode"]:
                fail("INELIGIBLE_EVIDENCE_MODE")
            if protocol["evidence_mode"] == "prospective_confirmatory" and stamp(manifest["result_recorded_at"]) <= freeze_time:
                fail("RESULT_PRECEDES_FREEZE")
            for key, expected in protocol.get("provenance_constraints", {}).items():
                if manifest["provenance"].get(key) != expected:
                    fail("PROVENANCE_CONSTRAINT_MISMATCH")
            if not manifest["raw_output_refs"]:
                fail("RAW_OUTPUT_REQUIRED")
            for ref in manifest["raw_output_refs"]:
                raw = load_file(verify_ref(root, ref))
                schema_check(raw, {"type": "object"})
                for key in ("run_id", "seed", "group", "baseline_qualified",
                            "positive_control_passed", "resources", "metrics"):
                    if raw.get(key) != manifest[key]:
                        fail("RAW_MANIFEST_DISAGREEMENT")
            for metric, values in manifest["metrics"].items():
                schema_check(values, {"type": "object", "required": ["treatment", "control"],
                                     "properties": {"treatment": {"type": "number"}, "control": {"type": "number"}}})
                finite(values)
            eligible.append(manifest["run_id"])
        seeds = set(protocol["seed_policy"]["seeds"])
        groups = set(protocol["required_groups"])
        if any(item["group"] not in groups for item in ordered):
            fail("UNDECLARED_GROUP")
        if not groups.issubset({item["group"] for item in ordered}):
            fail("MISSING_REQUIRED_GROUP")
        if not protocol["seed_policy"].get("allow_extra", False) and any(item["seed"] not in seeds for item in ordered):
            fail("UNDECLARED_SEED")
        for group in groups:
            if not seeds.issubset({item["seed"] for item in ordered if item["group"] == group}):
                fail("MISSING_REQUIRED_SEED")
        if any(not item["baseline_qualified"] for item in ordered):
            fail("BASELINE_UNQUALIFIED")
        if any(not item["positive_control_passed"] for item in ordered):
            fail("POSITIVE_CONTROL_FAILED")
        violated = False
        for key, limit in protocol["guardrails"].items():
            if isinstance(limit, bool) or not isinstance(limit, (int, float)):
                fail("UNSUPPORTED_GUARDRAIL")
            for item in ordered:
                measure = item["resources"].get(key)
                if isinstance(measure, bool) or not isinstance(measure, (int, float)):
                    fail("RESOURCE_MEASUREMENT_MISSING")
                violated = violated or measure > limit
        for rule in protocol["criteria"]:
            selected_groups = rule.get("groups", protocol["required_groups"])
            partitions = selected_groups if gate == "full-validation" else [None]
            for partition in partitions:
                subset = [item for item in ordered if item["group"] in selected_groups
                          and (partition is None or item["group"] == partition)]
                if len(subset) < rule["min_runs"]:
                    fail("CRITERION_INSUFFICIENT_RUNS")
                values = []
                for item in subset:
                    metric = item["metrics"].get(rule["metric"])
                    if metric is None:
                        fail("METRIC_MISSING")
                    delta = float(metric["treatment"]) - float(metric["control"])
                    finite(delta)
                    values.append(delta if rule["direction"] == "maximize" else -delta)
                mean = math.fsum(values) / len(values)
                lower, upper = mean, mean
                if rule["uncertainty"] == "normal":
                    if len(values) < 2:
                        fail("UNCERTAINTY_INSUFFICIENT_RUNS")
                    critical = statistics.NormalDist().inv_cdf((1 + rule["confidence"]) / 2)
                    margin = critical * statistics.stdev(values) / math.sqrt(len(values))
                    lower, upper = mean - margin, mean + margin
                finite([mean, lower, upper])
                threshold = rule["min_effect"]
                passed = lower >= threshold if rule["inclusive"] else lower > threshold
                below = upper < threshold if rule["inclusive"] else upper <= threshold
                results.append({"criterion_id": rule["id"], "group": partition,
                                "n": len(values), "effect": mean, "lower": lower, "upper": upper,
                                "passed": passed, "below_minimum": below,
                                "indispensable": rule["indispensable"]})
        if violated:
            return finish("KILL", ["FATAL_RESOURCE_GUARDRAIL"])
        if any(item["indispensable"] and item["below_minimum"] for item in results):
            return finish("KILL", ["INDISPENSABLE_EFFECT_BELOW_MINIMUM"])
        indispensable_pass = all(item["passed"] for item in results if item["indispensable"])
        severable_fail = any(not item["indispensable"] and item["below_minimum"] for item in results)
        if indispensable_pass and severable_fail and protocol.get("prospective_child_hypothesis"):
            return finish("REVISE", ["PREDECLARED_SEVERABLE_CONTRAST_FAILED"])
        if results and all(item["passed"] for item in results):
            return finish("PASS", ["ALL_REQUIRED_CONTRASTS_PASS"])
        return finish("INCONCLUSIVE", ["UNRESOLVED_THRESHOLD_OR_SCOPE"])
    except Failure as error:
        return finish("INCONCLUSIVE", [error.code])

def collision_ready(root, ref, outcome):
    report = verify_ref(root, ref, "collision-decision")
    if report["outcome"] != outcome:
        fail("COLLISION_OUTCOME_MISMATCH")
    if outcome not in {"ADVANCE", "KILL"}:
        return report
    from _evidence import verify_collision_proofs
    verify_collision_proofs(root,report)
    coverage = report["coverage"]
    if (not set(coverage["required_families"]).issubset(coverage["completed_families"])
            or coverage["no_new_high_risk_batches"] < 2
            or not coverage["decisive_full_text_verified"] or not coverage["priority_verified"]
            or not report["search_run_refs"] or not report["work_refs"]):
        fail("COLLISION_COVERAGE_INCOMPLETE")
    captured_families = set()
    for item in report["search_run_refs"]:
        search = verify_ref(root, item, "search-run")
        if not search["raw_capture_refs"]:
            fail("SEARCH_CAPTURE_REQUIRED")
        for capture in search["raw_capture_refs"]:
            verify_ref(root, capture)
        captured_families.update(search["query_families"])
    if not set(coverage["required_families"]).issubset(captured_families):
        fail("SEARCH_FAMILY_NOT_CAPTURED")
    for item in report["work_refs"]:
        work = verify_ref(root, item, "work-record")
        if not work["primary_source"] or work["full_text_status"] != "available" or work["read_depth"] not in {"D2", "D3"}:
            fail("DECISIVE_PRIMARY_TEXT_REQUIRED")
        for source in work["evidence_refs"]:
            verify_ref(root, source)
    return report

def recompute_decision(root, state, payload, gate):
    decision = verify_ref(root, payload["decision_ref"], gate + "-decision")
    protocol_key = "gate_a_protocol_ref" if gate == "gate-a" else "full_validation_protocol_ref"
    protocol = verify_ref(root, state[protocol_key], gate + "-protocol")
    manifests = [verify_ref(root, ref, "run-manifest") for ref in decision["run_manifest_refs"]]
    actual = evaluate(root, protocol, manifests, decision["run_manifest_refs"], gate)
    if actual != decision:
        fail("DECISION_RECOMPUTATION_MISMATCH")
    return actual, protocol

def transition(args, root):
    state, events, _ = project(root)
    request = load_file(Path(args.request))
    if not isinstance(request,dict):fail("TRANSITION_OBJECT_REQUIRED")
    for key in ("transition_id", "expected_sequence", "outcome", "reason_code", "evidence_refs", "payload"):
        if key not in request:
            fail("TRANSITION_FIELD_REQUIRED", "$." + key)
    finite(request)
    scan(request)
    if not isinstance(request["payload"],dict) or "outcome" in request["payload"]:
        fail("TRANSITION_PAYLOAD_RESERVED_FIELD")
    request_digest = hashed(request)
    for event in events:
        if event["transition_id"] == request["transition_id"]:
            if event["request_digest"] != request_digest:
                fail("TRANSITION_ID_REUSED_WITH_DIFFERENT_REQUEST")
            return {"status": "already_applied", "state": state}
    if state["sequence"] != request["expected_sequence"]:
        fail("STALE_STATE_SEQUENCE")
    if state["terminal_status"] != "none":
        fail("PROJECT_TERMINAL")
    refs = request["evidence_refs"]
    if not isinstance(refs, list):
        fail("EVIDENCE_REFS_REQUIRED")
    for item in refs:
        verify_ref(root, item)
    outcome, payload = request["outcome"], request["payload"]
    refs=list({(r["path"],r["sha256"]):r for r in refs+payload_refs(payload)}.values())
    for item in refs:verify_ref(root,item)
    route, phase = state["current_route"], state["lifecycle_phase"]
    new = copy.deepcopy(state)
    def repair(blockers):
        if not blockers:
            fail("REPAIR_BLOCKERS_REQUIRED")
        new.update(current_route="repair_evidence", lifecycle_phase="landscape",
                   suspension={"return_route": route, "return_phase": phase,
                               "blocking_obligation_ids": blockers,
                               "entered_at": now(),
                               "suspended_snapshot_digest": state.get("evidence_snapshot_ref", {}).get("sha256", ZERO)})
    from _importance import OUTCOMES as importance_outcomes,apply as apply_importance
    if outcome in importance_outcomes:
        new,more_refs=apply_importance(root,state,outcome,payload)
        refs=list({(r["path"],r["sha256"]):r for r in refs+more_refs}.values())
    elif outcome in {"explicit_stop","stop"}:
        new.update(current_route="stopped", lifecycle_phase="terminal", terminal_status="stopped",suspension=None)
    elif outcome == "advance_phase":
        advances={("explore_problem","landscape"):"candidate_generation",("audit_method","landscape"):"candidate_generation",
            ("audit_rejection","landscape"):"candidate_generation",("develop_candidate","candidate_generation"):"collision_audit",
            ("repair_evidence","landscape"):"active_research"}
        if payload.get("lifecycle_phase")!=advances.get((route,phase)) or not refs:fail("ILLEGAL_PHASE_ADVANCE")
        new["lifecycle_phase"]=payload["lifecycle_phase"]
    elif outcome == "update_evidence":
        allowed = {"asset_stage", "evidence_trust", "claim_clarity", "literature_state", "evidence_snapshot_ref"}
        if not refs or any(key not in allowed for key in payload):
            fail("EVIDENCE_UPDATE_SCOPE")
        if "evidence_snapshot_ref" in payload:
            snapshot=verify_snapshot(root, payload["evidence_snapshot_ref"])
        else:snapshot=None
        if payload.get("claim_clarity")=="C2_falsifiable" and (not snapshot or not snapshot["claim_ids"]):
            fail("FALSIFIABLE_CLAIM_SNAPSHOT_REQUIRED")
        if payload.get("literature_state") in {"L2_primary_verified","L3_current_snapshot"}:
            if not snapshot:fail("PRIMARY_EVIDENCE_SNAPSHOT_REQUIRED")
            works=[load_file(verify_ref(root,r)) for r in snapshot["artifact_refs"] if Path(r["path"]).suffix.lower() in {".json",".yaml",".yml"}]
            if not any(isinstance(w,dict) and w.get("schema_id")=="work-record" and w.get("primary_source") and w.get("read_depth") in {"D2","D3"} for w in works):
                fail("PRIMARY_FULL_TEXT_EVIDENCE_REQUIRED")
        if payload.get("evidence_trust") in {"E2_recomputable","E3_audited"}:
            if not snapshot or not snapshot.get("closure",{}).get("provenance_audit_refs"):
                fail("PROVENANCE_AUDIT_REQUIRED")
            for auditref in snapshot["closure"]["provenance_audit_refs"]:
                audit=load_file(verify_ref(root,auditref))
                if not isinstance(audit,dict) or not audit.get("raw_output_refs") or not audit.get("all_run_inventory") or not audit.get("recomputed_metric_refs"):
                    fail("RECOMPUTABLE_PROVENANCE_AUDIT_REQUIRED")
                for r in audit["raw_output_refs"]+audit["recomputed_metric_refs"]:verify_ref(root,r)
        new.update(payload)
    elif outcome == "research_candidate":
        if route not in {"explore_problem", "audit_method", "audit_rejection", "repair_evidence", "develop_candidate"}:
            fail("ILLEGAL_ROUTE_TRANSITION")
        candidate = verify_ref(root, payload["candidate_ref"], "idea-atom")
        from _importance import require_natural
        require_natural(root,state,candidate)
        refs+=payload_refs(candidate)
        if route == "repair_evidence":
            verify_repair(root,state,payload)
        if candidate["kind"] != "research_candidate":
            fail("RESEARCH_CANDIDATE_REQUIRED")
        new.update(current_route="develop_candidate", lifecycle_phase="collision_audit",
                   candidate_id=candidate["candidate_id"], candidate_ref=payload["candidate_ref"], suspension=None,
                   gate_state="not_ready",validation_state="not_ready",writing_state="not_ready")
        new.pop("importance_decision_ref",None);new.pop("importance_outcome",None)
    elif outcome == "evidence_repair":
        if route == "repair_evidence":
            fail("ALREADY_REPAIRING")
        repair(payload.get("blocking_obligation_ids", []))
    elif outcome == "REPAIR_VERIFIED":
        if route != "repair_evidence" or not refs:
            fail("REPAIR_VERIFICATION_REQUIRED")
        suspension = state.get("suspension")
        blockers = suspension["blocking_obligation_ids"] if suspension else []
        if not set(blockers).issubset(payload.get("closed_obligation_ids", [])):
            fail("UNCLOSED_REPAIR_OBLIGATION")
        verify_repair(root, state, payload)
        new.update(current_route=suspension["return_route"] if suspension else ORIGIN_ROUTE[state["entry_origin"]],
                   lifecycle_phase=suspension["return_phase"] if suspension else "landscape",
                   evidence_snapshot_ref=payload["evidence_snapshot_ref"], suspension=None)
    elif outcome in {"no_new_idea_needed","retarget_writing"}:
        if route not in {"audit_method", "audit_rejection"}:
            fail("ILLEGAL_ROUTE_TRANSITION")
        if state["asset_stage"]=="A3_mature" and state["evidence_trust"]=="E3_audited" and state["validation_state"]=="pass":
            from _evidence import verify_claim_closure
            decision,protocol=recompute_decision(root,state,payload,"full-validation")
            if decision["outcome"]!="PASS":fail("FULL_VALIDATION_PASS_REQUIRED")
            snapshot=verify_snapshot(root,payload["evidence_snapshot_ref"])
            verify_claim_closure(root,snapshot,protocol,decision)
            new.update(current_route="prepare_writing",lifecycle_phase="evidence_freeze",writing_state="evidence_frozen",evidence_snapshot_ref=payload["evidence_snapshot_ref"])
        elif outcome=="retarget_writing":
            repair(payload.get("blocking_obligation_ids",[]))
            new["lifecycle_phase"]="active_research"
        elif (state["claim_clarity"] == "C2_falsifiable"
                and state["literature_state"] in {"L2_primary_verified", "L3_current_snapshot"}):
            new.update(current_route="execute_gate_a", lifecycle_phase="gate_a_design", gate_state="not_ready")
        else:
            repair(payload.get("blocking_obligation_ids", []))
    elif outcome == "begin_retrospective_validation":
        if route not in {"audit_method", "audit_rejection"} or state["asset_stage"] != "A3_mature" or state["evidence_trust"] != "E3_audited" or not refs:
            fail("RETROSPECTIVE_AUDIT_PRECONDITIONS")
        verify_snapshot(root, payload["evidence_snapshot_ref"])
        new.update(current_route="full_experiments", lifecycle_phase="active_research",
                   evidence_snapshot_ref=payload["evidence_snapshot_ref"])
    elif outcome.startswith("collision_"):
        verdict = outcome[len("collision_"):]
        if route != "develop_candidate" or phase!="collision_audit":
            fail("ILLEGAL_ROUTE_TRANSITION")
        if verdict=="KILL" and payload.get("provisional") is True:
            report=verify_ref(root,payload["collision_ref"],"collision-decision")
            if report["outcome"]!="KILL":fail("COLLISION_OUTCOME_MISMATCH")
        else:report = collision_ready(root, payload["collision_ref"], verdict)
        if report["candidate_id"] != state.get("candidate_id"):
            fail("STALE_COLLISION_CANDIDATE")
        if verdict in {"ADVANCE","KILL"} and not payload.get("provisional") and report.get("candidate_ref")!=state.get("candidate_ref"):
            fail("COLLISION_NOT_BOUND_TO_CURRENT_CANDIDATE")
        if verdict == "ADVANCE":
            from _importance import require_ready
            review=require_ready(root,state)
            if review.get("collision_ref")!=payload["collision_ref"]:fail("IMPORTANCE_COLLISION_BINDING_REQUIRED")
            new.update(current_route="execute_gate_a", lifecycle_phase="gate_a_design", gate_state="not_ready")
        elif verdict in {"REFINE", "REROUTE_MECHANISM", "REROUTE_REPLICATION_OR_TRANSFER"}:
            fail("USE_IPCG_CONCURRENT_REROUTE_OR_KILL")
        elif verdict in {"REROUTE_EVIDENCE", "INCONCLUSIVE_EXPAND_SEARCH"}:
            repair(payload.get("blocking_obligation_ids", []))
        elif verdict == "KILL":
            if payload.get("provisional") is not True:fail("USE_EXPLICIT_USER_STOP_NOT_IMPORTED_APPROVAL")
            new.update(pending_collision_ref=payload["collision_ref"],collision_status="human_adjudication_pending")
        else:
            fail("UNKNOWN_COLLISION_OUTCOME")
    elif outcome == "REPLICATION_OR_TRANSFER_CLAIM_FROZEN":
        if route != "replicate_or_transfer" or not refs:
            fail("REPLICATION_CLAIM_REQUIRED")
        candidate = verify_ref(root, payload["candidate_ref"], "idea-atom")
        if candidate.get("parent_candidate_id") != state.get("candidate_id"):
            fail("CHILD_CANDIDATE_REQUIRED")
        new.update(current_route="develop_candidate", lifecycle_phase="collision_audit",
                   candidate_id=candidate["candidate_id"], candidate_ref=payload["candidate_ref"])
    elif outcome.startswith("gate_a_") or outcome.startswith("full_validation_"):
        gate = "gate-a" if outcome.startswith("gate_a_") else "full-validation"
        expected_route = "execute_gate_a" if gate == "gate-a" else "full_experiments"
        if route != expected_route:
            fail("GATE_ROUTE_MISMATCH")
        decision, protocol = recompute_decision(root, state, payload, gate)
        verdict = outcome.rsplit("_", 1)[1]
        if verdict != decision["outcome"]:
            fail("GATE_OUTCOME_MISMATCH")
        new["gate_state" if gate == "gate-a" else "validation_state"] = verdict.lower()
        if verdict == "PASS":
            if gate == "gate-a":
                new.update(current_route="full_experiments", lifecycle_phase="active_research")
            else:
                from _evidence import verify_claim_closure
                if not payload.get("evidence_snapshot_ref"):fail("POST_VALIDATION_SNAPSHOT_REQUIRED")
                snapshot = verify_snapshot(root, payload["evidence_snapshot_ref"])
                if snapshot.get("closure",{}).get("decision_ref")!=payload["decision_ref"]:
                    fail("CLOSURE_NOT_BOUND_TO_VALIDATION_DECISION")
                if stamp(snapshot["created_at"])<stamp(protocol["frozen_at"]):fail("POST_VALIDATION_SNAPSHOT_REQUIRED")
                records=[e for e in events if e["event_type"]=="gate_decision" and e["payload"].get("decision_ref")==payload["decision_ref"]]
                if not records or stamp(snapshot["created_at"])<stamp(records[-1]["timestamp"]):
                    fail("POST_DECISION_SNAPSHOT_REQUIRED")
                verify_claim_closure(root,snapshot,protocol,decision)
                new.update(current_route="prepare_writing", lifecycle_phase="evidence_freeze",
                           writing_state="evidence_frozen", evidence_snapshot_ref=payload["evidence_snapshot_ref"])
        elif verdict == "REVISE":
            candidate = verify_ref(root, payload["candidate_ref"], "idea-atom")
            if candidate.get("parent_candidate_id") != state.get("candidate_id"):
                fail("CHILD_CANDIDATE_REQUIRED")
            new.update(current_route="develop_candidate", lifecycle_phase="candidate_generation",
                       candidate_id=candidate["candidate_id"], candidate_ref=payload["candidate_ref"], writing_state="not_ready")
        elif verdict == "KILL":
            new.update(current_route="stopped", lifecycle_phase="terminal", terminal_status="stopped")
        else:
            repair(payload.get("blocking_obligation_ids", decision["reason_codes"]))
            new["suspension"]["return_phase"]="gate_a_design" if gate=="gate-a" else "active_research"
    elif outcome == "venue_only_retarget":
        if route != "prepare_writing" or state["writing_state"] not in {"evidence_frozen", "planning", "drafting"} or not refs:
            fail("RETARGET_PRECONDITIONS")
        new.update(current_route="retarget", lifecycle_phase="writing", venue=payload.get("venue"))
    elif outcome == "advance_writing":
        if route not in {"prepare_writing", "retarget"} or state["validation_state"] != "pass" or not refs:
            fail("WRITING_EVIDENCE_REQUIRED")
        verify_snapshot(root, state["evidence_snapshot_ref"])
        if state["literature_state"]=="stale":fail("WRITING_LITERATURE_REFRESH_REQUIRED")
        target = payload.get("writing_state")
        order = ["evidence_frozen", "planning", "drafting", "submission_lock"]
        current = state["writing_state"]
        if current not in order or order.index(current) + 1 >= len(order) or target != order[order.index(current) + 1]:
            fail("ILLEGAL_WRITING_ADVANCE")
        new.update(writing_state=target, lifecycle_phase="submission_lock" if target == "submission_lock" else "writing")
    else:
        fail("UNKNOWN_TRANSITION_OUTCOME")
    rerouting=outcome in {"collision_REFINE","collision_REROUTE_MECHANISM","collision_REROUTE_REPLICATION_OR_TRANSFER","gate_a_REVISE","full_validation_REVISE"}
    if rerouting:
        earlier=[]
        for event in events:earlier.extend(event["evidence_refs"])
        fresh=source_fingerprints(root,refs)-source_fingerprints(root,earlier)
        count=0 if fresh else state.get("reroutes_without_new_evidence",0)+1
        if count>2:fail("HUMAN_ADJUDICATION_REQUIRED_NO_NEW_EVIDENCE")
        new["reroutes_without_new_evidence"]=count
    result = append(root, state, events, "transition", request["reason_code"], refs,
                    {"outcome": outcome, **payload}, new, transition_id=request["transition_id"],
                    request_digest=request_digest)
    return {"status": "applied", "state": result}

def evaluate_command(args, root):
    protocol_path = Path(args.protocol).resolve()
    protocol = load_file(protocol_path)
    paths = sorted(Path(args.runs).glob("*.json")) if Path(args.runs).is_dir() else [Path(args.runs)]
    manifests, manifest_refs = [], []
    for path in paths:
        item = load_file(path)
        if item.get("schema_id") != "run-manifest":
            continue
        manifests.append(item)
        manifest_refs.append(reference(root, path))
    decision = evaluate(root, protocol, manifests, manifest_refs, args.gate)
    if args.root:
        state, events, _ = project(root)
        key = "gate_a_protocol_ref" if args.gate == "gate-a" else "full_validation_protocol_ref"
        frozen = verify_ref(root, state[key], args.gate + "-protocol")
        if frozen.get("protocol_digest") != decision["protocol_digest"] or reference(root, protocol_path) != state[key]:
            fail("DECISION_NOT_BOUND_TO_PROJECT_FREEZE")
        relative = (("gate-a" if args.gate == "gate-a" else "experiments/full-validation")
                    + "/decisions/" + decision["decision_id"] + ".json")
        destination = safe_path(root, relative)
        text = canonical(decision) + "\n"
        if destination.exists():
            if load_file(destination) != decision:
                fail("IMMUTABLE_DECISION_CONFLICT")
            return {"decision": decision, "decision_ref": reference(root, destination)}
        decision_ref = {"path": relative, "sha256": hashlib.sha256(text.encode()).hexdigest()}
        append(root, state, events, "gate_decision", "DETERMINISTIC_EVALUATION",
               [state[key]] + manifest_refs, {"decision_ref": decision_ref}, state, extra={relative: text})
        return {"decision": decision, "decision_ref": decision_ref}
    return decision

def redact(args, root):
    state, events, _ = project(root)
    target = safe_path(root, args.path)
    if target.name in {"event-ledger.jsonl", "ledger-anchor.json", "research-state.json", ".pending-commit.json", ".state.lock"} or "protocols" in target.parts or ".backups" in target.parts:
        fail("HOST_AUTHORIZED_LINEAGE_REPLACEMENT_REQUIRED")
    old_digest = filehash(target)
    replacement = load_file(Path(args.replacement))
    finite(replacement)
    scan(replacement)
    text = canonical(replacement) + "\n"
    tombstone = envelope("redaction-event", redaction_id=str(uuid.uuid4()), path=args.path,
                         old_digest=old_digest, new_digest=hashlib.sha256(text.encode()).hexdigest(),
                         reason_code="USER_REQUESTED_SIDECAR_REDACTION", timestamp=now())
    new = copy.deepcopy(state)
    new.update(evidence_trust="E0_narrative", literature_state="stale", gate_state="not_ready",
               validation_state="not_ready", writing_state="not_ready",
               current_route="repair_evidence", lifecycle_phase="landscape",
               suspension=state.get("suspension") or {
                   "return_route": state["current_route"], "return_phase": state["lifecycle_phase"],
                   "blocking_obligation_ids": ["redacted-evidence:" + old_digest],
                   "suspended_snapshot_digest": state.get("evidence_snapshot_ref", {}).get("sha256", ZERO)})
    redaction_path = "evidence/redactions/" + tombstone["redaction_id"] + ".json"
    append(root, state, events, "redaction", "EVIDENCE_REDACTED", [], tombstone, new,
           extra={args.path: text, redaction_path: canonical(tombstone) + "\n"})
    return {"status": "redacted", "redaction": tombstone, "dependent_evidence": "invalidated",
            "external_copies": "not_deleted_by_this_local_helper"}

def migrate(args, root):
    from _evidence import migrate_project
    return migrate_project(root,args.to)

class SafeArgumentParser(argparse.ArgumentParser):
    def error(self,message):
        print(canonical({"error":{"code":"INVALID_COMMAND_ARGUMENTS","path":"$"}}))
        raise SystemExit(2)

def parser_for(command):
    parser = SafeArgumentParser(description=__doc__)
    if command == "validate_artifact":
        parser.add_argument("file", nargs="?")
        parser.add_argument("--project")
        parser.add_argument("--evidence-root")
        return parser
    if command == "evaluate_gate":
        parser.add_argument("--protocol", required=True)
        parser.add_argument("--runs", required=True)
        parser.add_argument("--gate", choices=["gate-a", "full-validation"], default="gate-a")
        parser.add_argument("--root")
        parser.add_argument("--evidence-root")
        return parser
    parser.add_argument("--root", required=True)
    if command == "init_project":
        parser.add_argument("--name", required=True)
        parser.add_argument("--goal", required=True)
        parser.add_argument("--entry", required=True, choices=["I", "M", "R"])
        parser.add_argument("--mode", choices=["audit", "plan", "implement", "run", "full"], default="audit")
    elif command == "replay_state":
        parser.add_argument("--repair-projection", action="store_true")
    elif command == "transition_state":
        parser.add_argument("--request", required=True)
    elif command == "freeze_gate":
        parser.add_argument("--protocol", required=True)
        parser.add_argument("--gate", choices=["gate-a", "full-validation"], default="gate-a")
    elif command == "redact_artifact":
        parser.add_argument("--path", required=True)
        parser.add_argument("--replacement", required=True)
    elif command == "migrate_state":
        parser.add_argument("--to", required=True)
    return parser

def dispatch(command):
    args = parser_for(command).parse_args()
    try:
        if command == "validate_artifact":
            if args.project:
                root = root_path(args.project)
                with locked(root):
                    state, events, _ = project(root)
                result = {"valid": True, "sequence": len(events), "entry_origin": state["entry_origin"]}
            elif args.file:
                value = validate(load_file(Path(args.file)))
                if args.evidence_root and value["schema_id"]=="handoff":
                    from _evidence import verify_handoff
                    verify_handoff(root_path(args.evidence_root),value)
                result = {"valid": True, "schema_id": value["schema_id"], "schema_version": VERSION}
            else:
                fail("FILE_OR_PROJECT_REQUIRED")
        elif command == "evaluate_gate":
            protocol_path=Path(args.protocol).resolve()
            if args.root or args.evidence_root:inferred=None
            elif protocol_path.parent.name=="protocols" and protocol_path.parent.parent.name=="gate-a":inferred=protocol_path.parents[2]
            elif protocol_path.parent.name=="protocols" and protocol_path.parent.parent.name=="full-validation" and protocol_path.parents[2].name=="experiments":inferred=protocol_path.parents[3]
            else:fail("EVIDENCE_ROOT_REQUIRED")
            root = root_path(args.root or args.evidence_root or str(inferred))
            if args.root:
                with locked(root):
                    result = evaluate_command(args, root)
            else:
                result = evaluate_command(args, root)
        else:
            root = root_path(args.root)
            with locked(root):
                if command == "init_project":
                    result = init_project(args, root)
                elif command == "replay_state":
                    result = {"state": project(root, repair=args.repair_projection)[0]}
                elif command == "transition_state":
                    result = transition(args, root)
                elif command == "freeze_gate":
                    result = freeze_gate(args, root)
                elif command == "redact_artifact":
                    result = redact(args, root)
                elif command == "migrate_state":
                    result = migrate(args, root)
                else:
                    fail("UNKNOWN_COMMAND")
        print(canonical(result))
        return 0
    except Failure as error:
        print(canonical({"error": {"code": error.code, "path": error.path}}))
        return 2
    except (OSError, ValueError, TypeError, KeyError, IndexError, UnicodeError, AttributeError, OverflowError):
        print(canonical({"error": {"code": "INVALID_OR_UNAVAILABLE_INPUT", "path": "$"}}))
        return 2
