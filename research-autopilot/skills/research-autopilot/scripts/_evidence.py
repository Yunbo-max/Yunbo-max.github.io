"""Versioned replay, cross-artifact closure and transactional migration.

Captured JSON is an adapter format, not a substitute for primary source text.
Unsupported provider formats require an explicit versioned parser.
"""
import copy
import hashlib
import urllib.parse
from pathlib import Path
import _autoresearch as C

VERSIONS = ("capture-json-v1", "work-v1", "identifier-v1")
FAMILIES = {"problem","mechanism","objective","operator","differentiator","assumptions",
            "observable_behavior","component_combinations","historical_aliases","cross_domain"}

def replay_search(root, search):
    C.validate(search,"search-run")
    if (search["parser_version"],search["canonicalization_version"],search["deduplication_version"]) != VERSIONS:
        C.fail("UNSUPPORTED_SEARCH_NORMALIZER")
    if not search["query_strings"] or not search["query_families"] or not search["raw_capture_refs"]:
        C.fail("SEARCH_METADATA_INCOMPLETE")
    if search["pagination"].get("complete") is not True:
        C.fail("SEARCH_PAGINATION_INCOMPLETE")
    C.stamp(search["searched_at"])
    try:
        cutoff=C.dt.date.fromisoformat(search["cutoff"])
    except ValueError:
        C.fail("SEARCH_CUTOFF_INVALID")
    if search["requested_count"] < 1 or search["returned_count"] < 0:
        C.fail("SEARCH_COUNT_INVALID")
    works, units={},{}
    raw_count=0
    for capture_ref in search["raw_capture_refs"]:
        capture=C.load_file(C.verify_ref(root,capture_ref))
        C.schema_check(capture,{"type":"object","required":["works","evidence_units"],
            "properties":{"works":{"type":"array"},"evidence_units":{"type":"array"}}})
        C.scan(capture);C.finite(capture)
        raw_count+=len(capture["works"])
        for raw in capture["works"]:
            work=copy.deepcopy(C.validate(raw,"work-record"))
            if work.get("publication_date"):
                try:
                    date=C.dt.date.fromisoformat(work["publication_date"])
                except ValueError:
                    C.fail("WORK_PUBLICATION_DATE_INVALID")
                if date>cutoff:C.fail("WORK_AFTER_SEARCH_CUTOFF")
            key=work["work_id"]
            if key.startswith("doi:"):
                key=key.lower()
            work["work_id"]=key
            work["title"]=" ".join(work["title"].split())
            url=urllib.parse.urlsplit(work["canonical_url"])
            if url.scheme not in {"http","https"} or not url.hostname:C.fail("WORK_URL_INVALID")
            work["canonical_url"]=urllib.parse.urlunsplit((url.scheme.lower(),url.netloc.lower(),url.path,url.query,""))
            if key in works and works[key]!=work:C.fail("CONFLICTING_CANONICAL_WORK")
            works[key]=work
            for evidence in work["evidence_refs"]:C.verify_ref(root,evidence)
        for raw in capture["evidence_units"]:
            unit=copy.deepcopy(C.validate(raw,"evidence-unit"));key=unit["evidence_id"]
            if unit["work_id"].startswith("doi:"):unit["work_id"]=unit["work_id"].lower()
            if key in units and units[key]!=unit:C.fail("CONFLICTING_EVIDENCE_ID")
            units[key]=unit
            for locator in unit["locators"]:
                if not locator.get("artifact_ref") or not any(locator.get(k) for k in ("section","page","figure","table","lines","span")):
                    C.fail("EVIDENCE_LOCATOR_REQUIRED")
                C.verify_ref(root,locator["artifact_ref"])
    if raw_count!=search["returned_count"]:C.fail("SEARCH_CAPTURE_COUNT_MISMATCH")
    if any(u["work_id"] not in works for u in units.values()):C.fail("ORPHAN_EVIDENCE_WORK")
    normalized={"works":[works[k] for k in sorted(works)],"evidence_units":[units[k] for k in sorted(units)]}
    if C.hashed(normalized)!=search["normalized_output_digest"]:C.fail("SEARCH_NORMALIZED_DIGEST_MISMATCH")
    return normalized

def verify_collision_proofs(root, report):
    if not report.get("candidate_ref"):C.fail("FROZEN_COLLISION_CLAIMS_REQUIRED")
    candidate=C.verify_ref(root,report["candidate_ref"],"idea-atom")
    if candidate["candidate_id"]!=report["candidate_id"]:C.fail("STALE_COLLISION_CANDIDATE")
    claim_ids=set(candidate.get("claim_ids",[candidate["dominant_claim"]]))
    if set(report.get("essential_claim_coverage",[]))!=claim_ids:C.fail("COLLISION_CLAIM_COVERAGE_INCOMPLETE")
    coverage=report["coverage"]
    if not FAMILIES.issubset(coverage["required_families"]):C.fail("COLLISION_QUERY_PROTOCOL_INCOMPLETE")
    normalized=[replay_search(root,C.verify_ref(root,r,"search-run")) for r in report["search_run_refs"]]
    primary={w["work_id"]:w for batch in normalized for w in batch["works"]}
    for wref in report["work_refs"]:
        work=C.verify_ref(root,wref,"work-record")
        if primary.get(work["work_id"])!=work:C.fail("WORK_NOT_BOUND_TO_CAPTURE")
        if not work.get("publication_date"):C.fail("PRIORITY_DATE_REQUIRED")
    batches=report.get("coverage_batches",[])
    if len(batches)<2 or any(b.get("new_high_risk_families")!=[] or not b.get("search_run_refs") for b in batches[-2:]):
        C.fail("SEARCH_STOP_EVIDENCE_REQUIRED")
    known={(r["path"],r["sha256"]) for r in report["search_run_refs"]}
    if any((r["path"],r["sha256"]) not in known for b in batches for r in b.get("search_run_refs",[])):
        C.fail("COVERAGE_BATCH_NOT_CAPTURED")
    last_sets=[{(r["path"],r["sha256"]) for r in b["search_run_refs"]} for b in batches[-2:]]
    if last_sets[0]&last_sets[1]:C.fail("SEARCH_STOP_ROUNDS_NOT_DISTINCT")
    audits=report.get("claim_audits",[])
    if {a.get("claim_id") for a in audits}!=claim_ids:C.fail("COLLISION_CLAIM_PROOFS_REQUIRED")
    contexts=set()
    expected_roles={"retriever","prosecutor","defender","equivalence_verifier","provenance_auditor","adjudicator"}
    for audit in audits:
        if not audit.get("evidence_refs") or not audit.get("work_ids") or not set(audit["work_ids"]).issubset(primary):
            C.fail("COLLISION_PRIMARY_PROOF_REQUIRED")
        for evidence in audit["evidence_refs"]:
            unit=C.verify_ref(root,evidence,"evidence-unit")
            if unit["claim"]!=audit["claim_id"] or unit["work_id"] not in audit["work_ids"]:
                C.fail("COLLISION_PROOF_CLAIM_MISMATCH")
        roles=audit.get("role_refs",{})
        if set(roles)!=expected_roles:C.fail("INDEPENDENT_COLLISION_ROLES_REQUIRED")
        for role,r in roles.items():
            record=C.load_file(C.verify_ref(root,r));C.scan(record)
            if record.get("role")!=role or not record.get("context_id") or not record.get("evidence_refs"):
                C.fail("COLLISION_ROLE_PROOF_REQUIRED")
            context=record["context_id"]
            if context in contexts:C.fail("COLLISION_ROLES_NOT_INDEPENDENT")
            contexts.add(context)
            for evidence in record["evidence_refs"]:C.verify_ref(root,evidence)
            if role=="adjudicator" and any(k in record for k in ("generator_identity","vote_counts","previous_verdict")):
                C.fail("ADJUDICATION_NOT_BLINDED")
        if report["outcome"]=="KILL" and not audit.get("one_primary_covers_essential_elements"):
            C.fail("KILL_ESSENTIAL_ELEMENTS_NOT_COVERED")
    return report

def verify_claim_closure(root, snapshot, protocol, decision):
    indispensable=set(protocol.get("indispensable_claim_ids",[]))
    if not indispensable or not indispensable.issubset(snapshot["claim_ids"]):C.fail("CLAIM_EVIDENCE_CLOSURE_REQUIRED")
    records=snapshot.get("closure",{}).get("claims",[])
    mapping={r.get("claim_id"):r for r in records if isinstance(r,dict)}
    if len(mapping)!=len(records):C.fail("DUPLICATE_CLAIM_CLOSURE")
    results={}
    for r in decision["criteria_results"]:results.setdefault(r["criterion_id"],[]).append(r)
    rules={r["id"]:r for r in protocol["criteria"]}
    retained={(r["path"],r["sha256"]) for r in snapshot["artifact_refs"]+snapshot["negative_result_refs"]}
    for claim in indispensable:
        item=mapping.get(claim)
        if not item or item.get("status")!="closed" or item.get("unresolved_confounds")!=[]:
            C.fail("UNCLOSED_INDISPENSABLE_CLAIM")
        needed={key for key,r in rules.items() if r.get("claim_id")==claim and r["indispensable"]}
        if not needed or not needed.issubset(item.get("criterion_ids",[])):
            C.fail("CLAIM_CRITERION_CLOSURE_REQUIRED")
        if any(key not in results or not all(r["passed"] for r in results[key]) for key in needed):C.fail("CLAIM_CRITERION_NOT_PASSED")
        if not item.get("evidence_refs"):C.fail("CLAIM_RAW_EVIDENCE_REQUIRED")
        for evidence in item["evidence_refs"]:
            if (evidence["path"],evidence["sha256"]) not in retained:C.fail("CLAIM_PROOF_NOT_IN_SNAPSHOT")
            C.verify_ref(root,evidence)
    if snapshot.get("closure",{}).get("result_inventory_run_ids")!=sorted(decision["eligible_run_ids"]):
        C.fail("WRITING_RESULT_INVENTORY_INCOMPLETE")
    return True

def verify_handoff(root,manifest):
    C.validate(manifest,"handoff")
    state,events,_=C.project(root)
    if state["validation_state"]!="pass" or state["current_route"] not in {"prepare_writing","retarget"}:
        C.fail("HANDOFF_FULL_VALIDATION_REQUIRED")
    if manifest["evidence_snapshot_ref"]!=state["evidence_snapshot_ref"]:C.fail("HANDOFF_SNAPSHOT_NOT_CURRENT")
    snapshot=C.verify_snapshot(root,manifest["evidence_snapshot_ref"])
    decision=C.verify_ref(root,snapshot["closure"]["decision_ref"],"full-validation-decision")
    protocol=C.verify_ref(root,state["full_validation_protocol_ref"],"full-validation-protocol")
    if decision["outcome"]!="PASS" or decision["protocol_digest"]!=protocol["protocol_digest"]:C.fail("HANDOFF_DECISION_MISMATCH")
    verify_claim_closure(root,snapshot,protocol,decision)
    closed={r["claim_id"] for r in snapshot["closure"]["claims"] if r["status"]=="closed"}
    if not manifest["allowed_claims"] or not set(manifest["allowed_claims"]).issubset(closed):C.fail("HANDOFF_UNSUPPORTED_CLAIM")
    if set(manifest["allowed_claims"])&set(manifest["forbidden_claims"]):C.fail("HANDOFF_CLAIM_CONTRADICTION")
    if manifest["provenance"].get("evidence_mode")!=protocol["evidence_mode"]:C.fail("HANDOFF_EVIDENCE_MODE_REQUIRED")
    negative={(r["path"],r["sha256"]) for r in manifest["negative_result_refs"]}
    if not {(r["path"],r["sha256"]) for r in snapshot["negative_result_refs"]}.issubset(negative):C.fail("HANDOFF_NEGATIVE_EVIDENCE_MISSING")
    for r in manifest["source_refs"]+manifest["negative_result_refs"]:C.verify_ref(root,r)
    return manifest

def migrate_project(root, target, transform=None):
    if target!=C.VERSION:C.fail("UNSUPPORTED_MIGRATION_READ_ONLY")
    # Validate the canonical ledger first. A stale projection can be reconstructed.
    events=C.verify_chain((root/"event-ledger.jsonl").read_text())
    anchor=C.validate(C.load_file(root/"ledger-anchor.json"),"ledger-anchor")
    if anchor["head_digest"]!=events[-1]["event_digest"] or anchor["sequence"]!=len(events):C.fail("LEDGER_TAIL_OR_ANCHOR_MISMATCH")
    files={};size=0
    for path in sorted(root.rglob("*")):
        if path.is_symlink():C.fail("SYMLINK_FORBIDDEN")
        if ".backups" in path.parts or path.name in {".state.lock",".pending-commit.json"}:continue
        if path.is_file():
            content=path.read_text();C.scan(content);size+=len(content.encode())
            if size>16*1024*1024:C.fail("BACKUP_REQUIRES_HOST_DURABLE_STORAGE")
            files[path.relative_to(root).as_posix()]=content
    backup=C.envelope("backup-manifest",files=files,source_head=anchor["head_digest"],source_sequence=anchor["sequence"])
    backup_digest=C.hashed(backup);backup_path=".backups/"+backup_digest+".json"
    C.validate(backup);C.atomic(C.safe_path(root,backup_path),C.canonical(backup)+"\n")
    try:
        candidate=transform(copy.deepcopy(files)) if transform else copy.deepcopy(files)
        if not isinstance(candidate,dict) or set(candidate)!=set(files):C.fail("MIGRATION_FILE_SET_CHANGED")
        replay=C.verify_chain(candidate["event-ledger.jsonl"])
        if replay[-1]["next_state"]!=events[-1]["next_state"]:C.fail("MIGRATION_STATE_SEMANTICS_CHANGED")
        for path,text in candidate.items():
            C.safe_path(root,path);C.scan(text)
            if path not in {"research-state.json"} and text!=files[path]:C.fail("SAME_VERSION_MIGRATION_CANNOT_CHANGE_EVIDENCE")
        candidate["research-state.json"]=C.canonical(events[-1]["next_state"])+"\n"
    except Exception:
        C.fail("MIGRATION_FAILED_ROLLED_BACK")
    C.commit_files(root,candidate,anchor["head_digest"])
    C.project(root)
    return {"status":"supported_version_preserved","version":target,"backup_digest":backup_digest,"backup_path":backup_path,
            "sequence":len(events)}
