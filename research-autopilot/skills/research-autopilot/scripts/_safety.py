"""Fail-closed host adapters. There is deliberately no grant-importing CLI.

The trusted application must inject approval, budget, clock and sandbox adapters.
These helpers do not turn a model-authored object into a trusted host and cannot
replace the host's security boundary. Provider fixtures are only used in tests.
"""
import copy
import hashlib
import uuid
from pathlib import Path
import _autoresearch as C

UNITS={"cost","seconds","storage_bytes","egress_bytes"}
CLASSIFICATION={"public":0,"private":1,"restricted":2,"unknown":3}

def numeric_budget(value):
    if not isinstance(value,dict) or set(value)!=UNITS:C.fail("COMPLETE_BUDGET_REQUIRED")
    C.finite(value)
    if any(isinstance(v,bool) or not isinstance(v,(int,float)) or v<0 for v in value.values()):
        C.fail("INVALID_BUDGET")
    return value

def verify_authority(req,host,event_id):
    C.validate(req,"authority-request")
    numeric_budget(req["budget"])
    if host is None or not callable(getattr(host,"verified_approval",None)) or not callable(getattr(host,"clock",None)):
        C.fail("TRUSTED_HOST_APPROVAL_UNAVAILABLE")
    try:
        record=host.verified_approval(event_id)
    except Exception:
        C.fail("TRUSTED_HOST_APPROVAL_UNAVAILABLE")
    if not isinstance(record,(tuple,list)) or len(record)!=2:C.fail("APPROVAL_NOT_FOUND_IN_TRUSTED_HOST")
    event,grant=record
    C.validate(event,"approval-event");C.validate(grant,"authority-grant")
    current=C.stamp(host.clock())
    if event["decision"]!="approved":C.fail("APPROVAL_DENIED_OR_REVOKED")
    if event["host_identity"]!=host.identity or event["approval_event_id"]!=event_id or grant["trusted_approval_event_id"]!=event_id:
        C.fail("APPROVAL_HOST_IDENTITY_MISMATCH")
    if event["grant_id"]!=grant["grant_id"] or grant["approved_by"]!=req["account_identity"]:
        C.fail("APPROVAL_ACCOUNT_MISMATCH")
    if C.stamp(grant["approved_at"])>current or C.stamp(event["timestamp"])>current or C.stamp(grant["expires_at"])<=current:
        C.fail("APPROVAL_EXPIRED_OR_FUTURE")
    if C.stamp(req["expires_at"])<=current:C.fail("AUTHORITY_REQUEST_EXPIRED")
    digest=C.hashed(req)
    for obj in (event,grant):
        if obj["request_digest"]!=digest or obj["effect_digest"]!=req["effect_digest"] or obj["operation_id"]!=req["operation_id"]:
            C.fail("APPROVAL_REQUEST_OR_EFFECT_MISMATCH")
    for key in ("action","account_identity","target","destination_service","purpose","budget","expires_at",
                "revision_precondition","asset_scope","path_scope","persistence"):
        if grant.get(key)!=req[key]:C.fail("APPROVAL_SCOPE_MISMATCH")
    if req["persistence"]!="once":C.fail("UNSUPPORTED_GRANT_PERSISTENCE")
    if not callable(getattr(host,"precondition",None)) or host.precondition(req)!=req["revision_precondition"]:
        C.fail("LIVE_PRECONDITION_CHANGED")
    return event,grant

def operation_events(root):
    return [e for e in C.project(root)[1] if e["event_type"]=="operation"]

def persist_operation(root, record):
    C.scan(record);C.finite(record)
    state,events,_=C.project(root)
    C.append(root,state,events,"operation","OPERATION_"+record["status"].upper(),[],record,state)
    return record

def provider_receipt(response,expected_id=None):
    C.schema_check(response,{"type":"object","required":["provider_id","status"],
        "properties":{"provider_id":{"type":"string","minLength":1},"status":{"enum":["submitted","running","completed","failed","cancelled"]}}})
    C.scan(response);C.finite(response)
    if expected_id and response["provider_id"]!=expected_id:C.fail("PROVIDER_RECONCILIATION_ID_MISMATCH")
    # Provider data never owns grant consumption, reservation, attempts, or identity.
    return {"provider_id":response["provider_id"],"status":response["status"]}

def execute_operation(root, req, host, approval_event_id, provider, cumulative_limit=None):
    """Atomically consume and reserve before submission; reconcile before retry.

    A reservation remains charged when spend cannot be reconciled. This helper
    never refunds an uncertain job and never raises a budget by its own decision.
    """
    with C.locked(root):
        event,grant=verify_authority(req,host,approval_event_id)
        if provider is None or provider.identity!=req["destination_service"] or not provider.version:
            C.fail("PROVIDER_IDENTITY_MISMATCH")
        state,events,_=C.project(root)
        if state.get("external_operations_continuity")=="blocked_pending_host_reconciliation":
            C.fail("REDACTION_EFFECT_CONTINUITY_REQUIRES_HOST_RECONCILIATION")
        if not callable(getattr(host,"verified_budget",None)):C.fail("TRUSTED_CUMULATIVE_BUDGET_UNAVAILABLE")
        cap=numeric_budget(host.verified_budget(state["project_id"]))
        if cumulative_limit is not None:
            numeric_budget(cumulative_limit)
            if any(cumulative_limit[k]>cap[k] for k in UNITS):C.fail("CUMULATIVE_LIMIT_EXCEEDS_HOST_AUTHORITY")
            cap={k:min(cap[k],cumulative_limit[k]) for k in UNITS}
        req_digest=C.hashed(req)
        records={}
        for existing in events:
            if existing["event_type"]=="operation":records[existing["payload"]["operation_id"]]=existing["payload"]
        current=records.get(req["operation_id"])
        if current and current["request_digest"]!=req_digest:C.fail("OPERATION_ID_REUSED_WITH_DIFFERENT_EFFECT")
        consumed=[e for e in events if e["event_type"]=="approval" and e["payload"].get("grant_id")==grant["grant_id"]]
        if consumed and any(e["payload"].get("consumed_by")!=req["operation_id"] or e["payload"].get("request_digest")!=req_digest for e in consumed):
            C.fail("GRANT_ALREADY_CONSUMED")
        if current and (current["provider_identity"]!=provider.identity or current["provider_version"]!=provider.version):
            C.fail("PROVIDER_VERSION_CHANGED_REAPPROVAL_REQUIRED")
        if current and current["status"] in {"completed","cancelled","failed","manual_reconciliation_required"}:return current
        if current and current.get("provider_id"):
            try:status=provider.status(current["provider_id"])
            except Exception:C.fail("PROVIDER_STATUS_UNAVAILABLE")
            status=provider_receipt(status,current["provider_id"])
            if status["status"]==current["status"]:return current
            return persist_operation(root,{**current,**status})
        try:
            capabilities=provider.capabilities()
            quote=provider.quote(req)
        except Exception:C.fail("PRICE_OR_PROVIDER_CAPABILITY_UNKNOWN")
        if not isinstance(capabilities,dict) or any(not isinstance(capabilities.get(k),bool) for k in ("idempotency","lookup_by_fingerprint")):
            C.fail("PROVIDER_RETRY_CAPABILITY_UNKNOWN")
        if quote is None:C.fail("UNKNOWN_PRICE_REAPPROVAL_REQUIRED")
        numeric_budget(quote)
        if any(quote[k]>req["budget"][k] for k in UNITS):C.fail("PRICE_EXCEEDS_EXACT_GRANT")
        if current and (quote!=current["reservation"] or capabilities!=current["capabilities"]):
            C.fail("PRICE_OR_RETRY_IDENTITY_CHANGED_REAPPROVAL_REQUIRED")
        if current and current["status"]=="submitted":
            if capabilities["lookup_by_fingerprint"]:
                try:found=provider.find(current["fingerprint"])
                except Exception:return persist_operation(root,{**current,"status":"manual_reconciliation_required","reason_code":"PROVIDER_LOOKUP_UNAVAILABLE"})
                if found is not None:
                    found=provider_receipt(found)
                    return persist_operation(root,{**current,**found})
            elif not capabilities["idempotency"]:
                return persist_operation(root,{**current,"status":"manual_reconciliation_required","reason_code":"UNSAFE_RETRY_IDENTITY"})
        if current and current["attempt"]>=2:
            return persist_operation(root,{**current,"status":"failed","reason_code":"BOUNDED_RETRY_EXHAUSTED"})
        if current is None:
            used={k:sum(r["reservation"][k] for r in records.values()) for k in UNITS}
            if any(used[k]+quote[k]>cap[k] for k in UNITS):C.fail("CUMULATIVE_BUDGET_EXCEEDED")
            if not consumed:
                C.append(root,state,events,"approval","ONCE_GRANT_CONSUMED",[],
                    {"grant_id":grant["grant_id"],"request_digest":req_digest,"approval_event":event,"authority_grant":grant,
                     "authority_request":req,"consumed_by":req["operation_id"],"consumed_at":host.clock()},state)
            current={"operation_id":req["operation_id"],"request_digest":req_digest,"effect_digest":req["effect_digest"],
                "status":"planned","fingerprint":req_digest,"provider_identity":provider.identity,"provider_version":provider.version,
                "capabilities":capabilities,"reservation":quote,"attempt":0,"provider_id":None,"reason_code":"AUTHORIZED_AND_RESERVED"}
            persist_operation(root,current)
        current={**current,"status":"submitted","attempt":current["attempt"]+1,"attempt_id":str(uuid.uuid4()),"reason_code":"SUBMISSION_INTENT_COMMITTED"}
        persist_operation(root,current)
        try:
            submitted=provider.submit(copy.deepcopy(req),idempotency_key=current["fingerprint"])
            submitted=provider_receipt(submitted)
        except Exception:
            # Exception messages are untrusted and may contain credentials.
            safe=capabilities["idempotency"] or capabilities["lookup_by_fingerprint"]
            return persist_operation(root,{**current,"status":"submitted" if safe else "manual_reconciliation_required",
                "reason_code":"ACKNOWLEDGMENT_LOST_RECONCILE_FIRST"})
        return persist_operation(root,{**current,**submitted})

def derived_classification(assets):
    if not assets:return "unknown"
    names=[a.get("classification","unknown") for a in assets]
    if any(n not in CLASSIFICATION for n in names):C.fail("ASSET_CLASSIFICATION_INVALID")
    return max(names,key=lambda n:CLASSIFICATION[n])

def check_egress(assets,destination,purpose,host,event_id):
    C.scan(assets)
    classification=derived_classification(assets)
    if classification=="public":
        if any(not a.get("digest") or not a.get("asset_id") for a in assets):C.fail("ASSET_IDENTITY_REQUIRED")
        return True
    if host is None or not callable(getattr(host,"verified_processing_authority",None)):
        C.fail("PRIVATE_ASSET_NO_EGRESS_GRANT")
    authority=host.verified_processing_authority(event_id)
    if not isinstance(authority,dict) or authority.get("decision")!="approved":C.fail("PROCESSING_AUTHORITY_UNAVAILABLE")
    if authority.get("source_digests")!=sorted(a["digest"] for a in assets) or authority.get("destination")!=destination or authority.get("purpose")!=purpose:
        C.fail("PROCESSING_AUTHORITY_SCOPE_MISMATCH")
    if C.stamp(authority["expires_at"])<=C.stamp(host.clock()):C.fail("PROCESSING_AUTHORITY_EXPIRED")
    if classification in {"restricted","unknown"}:
        for key in ("consent","dua_irb_contract","residency","retention","authorized_environment"):
            if not authority.get(key):C.fail("RESTRICTED_CONTENT_METADATA_ONLY")
    return True

def declassify(assets,derived_digest,new_classification,destination,purpose,host,event_id):
    inherited=derived_classification(assets)
    if new_classification not in CLASSIFICATION:C.fail("ASSET_CLASSIFICATION_INVALID")
    if CLASSIFICATION[new_classification]>=CLASSIFICATION[inherited]:return new_classification
    if host is None or not callable(getattr(host,"verified_declassification",None)):C.fail("OWNER_DECLASSIFICATION_REQUIRED")
    grant=host.verified_declassification(event_id)
    if not isinstance(grant,dict) or grant.get("decision")!="approved":C.fail("OWNER_DECLASSIFICATION_REQUIRED")
    if any(a.get("owner")!=grant.get("approved_by") for a in assets):C.fail("DECLASSIFICATION_OWNER_MISMATCH")
    exact={"source_digests":sorted(a["digest"] for a in assets),"derived_digest":derived_digest,
        "new_classification":new_classification,"destination":destination,"purpose":purpose}
    if any(grant.get(k)!=v for k,v in exact.items()) or C.stamp(grant["expires_at"])<=C.stamp(host.clock()):
        C.fail("DECLASSIFICATION_SCOPE_OR_EXPIRY_MISMATCH")
    return new_classification

def run_isolated(root,spec,host,approval_event_id):
    """Require a host-enforced sandbox; Python resource flags alone are insufficient."""
    C.scan(spec);C.finite(spec)
    C.schema_check(spec,{"type":"object","required":["argv","source_refs","run_directory","limits","revision","dependency_lock_digest"]})
    if not isinstance(spec["argv"],list) or not spec["argv"] or any(not isinstance(a,str) for a in spec["argv"]):C.fail("STRUCTURED_ARGV_REQUIRED")
    if spec.get("network","deny")!="deny" or spec.get("trust_remote_code") or spec.get("unsafe_deserialization"):
        C.fail("UNTRUSTED_EXECUTION_CAPABILITY_FORBIDDEN")
    if any(a in {"-c","--eval","--trust-remote-code"} for a in spec["argv"]):C.fail("UNTRUSTED_DYNAMIC_EXECUTION_FORBIDDEN")
    for ref in spec["source_refs"]:C.verify_ref(root,ref)
    C.safe_path(root,spec["run_directory"])
    if host is None or not callable(getattr(host,"execute_sandbox",None)) or not callable(getattr(host,"verified_sandbox_authority",None)):
        C.fail("HOST_ENFORCED_SANDBOX_UNAVAILABLE")
    receipt=host.verified_sandbox_authority(approval_event_id)
    if not isinstance(receipt,dict) or receipt.get("spec_digest")!=C.hashed(spec) or receipt.get("decision")!="approved":
        C.fail("SANDBOX_AUTHORITY_MISMATCH")
    if C.stamp(receipt["expires_at"])<=C.stamp(host.clock()):C.fail("SANDBOX_AUTHORITY_EXPIRED")
    capabilities=host.sandbox_capabilities()
    required={"network_denied","no_inherited_secrets","read_only_sources","writes_confined","resource_limits","safe_deserialization"}
    if not all(capabilities.get(key) is True for key in required):C.fail("HOST_SANDBOX_BOUNDARY_INSUFFICIENT")
    result=host.execute_sandbox(copy.deepcopy(spec),environment={})
    C.scan(result);C.finite(result)
    return result

def redaction_request(root,paths,reason,*,account_identity,expires_at):
    """Only hashes and path identities enter the concrete reviewable request."""
    inventory={}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():C.fail("SYMLINK_FORBIDDEN")
        if path.is_file() and path.name not in {".state.lock",".pending-commit.json"}:
            inventory[path.relative_to(root).as_posix()]=C.filehash(path)
    for relative in paths:
        if relative not in inventory:C.fail("REDACTION_TARGET_UNAVAILABLE")
    C.scan(paths);C.scan(reason)
    effect={"inventory":inventory,"paths":paths,"reason_code":reason,"policy":"purge-contaminated-reachable-files-v1"}
    return C.envelope("authority-request",operation_id="redact-"+C.hashed(effect)[:20],action="replace_redacted_lineage",
        account_identity=account_identity,target="project:"+C.hashed(str(root)),revision_precondition=C.hashed(inventory),
        asset_scope=sorted(set(inventory.values())),path_scope=paths,destination_service="local-project",purpose="remove_sensitive_material",
        effect_digest=C.hashed(effect),budget={k:0 for k in UNITS},persistence="once",expires_at=expires_at,effect=effect)

def redact_lineage(root,req,host,event_id):
    with C.locked(root):
        event,grant=verify_authority(req,host,event_id)
        actual=redaction_request(root,req["path_scope"],req["effect"]["reason_code"],account_identity=req["account_identity"],expires_at=req["expires_at"])
        if actual["effect"]!=req["effect"]:C.fail("REDACTION_INVENTORY_CHANGED")
        # Only recover origin from schema-checked state fields. Sensitive payloads
        # and untrusted old events are never copied into the replacement lineage.
        old=C.load_file(root/"research-state.json")
        C.validate(old,"research-state")
        old_anchor=C.load_file(root/"ledger-anchor.json")
        try:
            old_events=C.verify_chain((root/"event-ledger.jsonl").read_text())
            if old_events[-1]["event_digest"]!=old_anchor["head_digest"] or len(old_events)!=old_anchor["sequence"]:
                C.fail("LEDGER_TAIL_OR_ANCHOR_MISMATCH")
            retained_effects=[e for e in old_events if e["event_type"] in {"approval","operation"}]
            continuity="verified"
        except C.Failure:
            # A contaminated/corrupt ledger cannot silently reset remote spend.
            retained_effects=[];continuity="blocked_pending_host_reconciliation"
        new=copy.deepcopy(old)
        new.update(project_id=str(uuid.uuid4()),current_route=C.ORIGIN_ROUTE[old["entry_origin"]],lifecycle_phase="landscape",sequence=1,
            evidence_trust="E0_narrative",literature_state="stale",gate_state="not_ready",validation_state="not_ready",
            writing_state="not_ready",terminal_status="none",suspension=None,external_operations_continuity=continuity)
        for key in ("gate_a_protocol_ref","full_validation_protocol_ref","evidence_snapshot_ref","candidate_ref","candidate_id"):
            new.pop(key,None)
        C.validate(new,"research-state")
        purged=[];deletions=[]
        for relative in req["effect"]["inventory"]:
            path=C.safe_path(root,relative)
            if relative in {"event-ledger.jsonl","research-state.json","ledger-anchor.json"}:continue
            try:
                content=path.read_text();scan_reachable_content(path,content)
                contaminated=relative in req["path_scope"]
            except (C.Failure,UnicodeError):contaminated=True
            if contaminated:
                purged.append({"path_digest":C.hashed(relative),"old_digest":C.filehash(path)})
                deletions.append(relative)
        tombstone={"previous_lineage_id":old["project_id"],"previous_head_digest":old_anchor["head_digest"],
            "approval_event":event,"grant_id":grant["grant_id"],"consumed_by":req["operation_id"],"request_digest":C.hashed(req),
            "reason_code":"SANCTIONED_REDACTION_LINEAGE_REPLACEMENT","purged":purged}
        e=C.envelope("ledger-event",sequence=1,transition_id=req["operation_id"],event_type="initialize",
            reason_code="SANCTIONED_REDACTION_LINEAGE_REPLACEMENT",evidence_refs=[],actor="trusted-host-redaction",
            timestamp=host.clock(),previous_event_digest=C.ZERO,previous_state_digest=C.ZERO,request_digest=C.hashed(req),next_state=copy.deepcopy(new),payload=tombstone)
        e["event_digest"]=C.hashed(e)
        replacement_events=[e]
        for source in retained_effects:
            previous=copy.deepcopy(new);new["sequence"]+=1
            preserved=C.envelope("ledger-event",sequence=new["sequence"],transition_id="retained-"+source["transition_id"],
                event_type=source["event_type"],reason_code="RETAINED_EFFECT_ACCOUNTING_AFTER_REDACTION",evidence_refs=[],
                actor="trusted-host-redaction",timestamp=host.clock(),previous_event_digest=replacement_events[-1]["event_digest"],
                previous_state_digest=C.hashed(previous),request_digest=source["request_digest"],next_state=copy.deepcopy(new),
                payload={**copy.deepcopy(source["payload"]),"source_lineage_id":old["project_id"],"source_event_digest":source["event_digest"]})
            preserved["event_digest"]=C.hashed(preserved);replacement_events.append(preserved)
        files={"event-ledger.jsonl":"".join(C.canonical(item)+"\n" for item in replacement_events),"research-state.json":C.canonical(new)+"\n",
            "ledger-anchor.json":C.canonical(C.envelope("ledger-anchor",lineage_id=new["project_id"],sequence=len(replacement_events),head_digest=replacement_events[-1]["event_digest"]))+"\n",
            "operations/operation-ledger.jsonl":"".join(C.canonical(item)+"\n" for item in replacement_events if item["event_type"]=="operation")}
        C.commit_files(root,files,old_anchor["head_digest"],deletions=deletions)
        C.project(root)
        return {"status":"lineage_replaced","lineage_id":new["project_id"],"purged_count":len(purged),
            "effect_continuity":continuity,
            "external_copies":"require_their_separately_authorized_deletion_route"}

def scan_reachable_content(path,content):
    """Scan both on-disk text and the data a supported reader will materialize."""
    C.scan(content)
    suffix=path.suffix.lower()
    if suffix in {".json",".yaml",".yml"}:
        C.scan(C.load_file(path));return
    if suffix==".jsonl":
        for line in content.splitlines():
            if line.strip():C.scan(C.parse_json(line))
        return
    if content.lstrip().startswith(("{","[")):
        C.scan(C.parse_json(content));return
    if suffix not in {".txt",".md",".py",".csv",".tsv",".log",".svg"} or path.name==".env":
        C.fail("UNSUPPORTED_CACHE_FORM_REQUIRES_PURGE")
    if C.re.search(r"\\u[0-9a-fA-F]{4}",content):
        C.fail("ENCODED_OPAQUE_CONTENT_REQUIRES_PURGE")
