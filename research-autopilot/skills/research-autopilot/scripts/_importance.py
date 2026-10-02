"""Importance-preserving workflow checks, not a scientific importance oracle."""
import copy
import math
import _autoresearch as C

OUTCOMES={"freeze_parent_problem","record_natural_gate_0","importance_decision","restart_problem_exploration"}

def parent(root,state):
    ref=state.get("parent_problem_ref")
    if not ref:C.fail("FROZEN_PARENT_PROBLEM_REQUIRED")
    card=C.verify_ref(root,ref,"parent-problem-card")
    if card["strong_simple_alternative"] not in card["simple_alternatives"]:
        C.fail("STRONG_SIMPLE_ALTERNATIVE_MUST_BE_INCLUDED")
    for r in card["benchmark_contract"]["source_evidence_refs"]:C.verify_ref(root,r)
    return card


def natural_gate(root,pref,gref):
    card=C.verify_ref(root,pref,"parent-problem-card")
    report=C.verify_ref(root,gref,"natural-gate-0")
    if report["parent_problem_ref"]!=pref:C.fail("NATURAL_GATE_PARENT_MISMATCH")
    raw=C.load_file(C.verify_ref(root,report["observations_ref"]))
    metrics={"cases":0,"affected":0,"prevalence":0.0,"mean_loss":0.0,"unresolved_fraction":0.0}
    reasons=[]
    rows=raw.get("cases") if isinstance(raw,dict) else None
    benchmark=card["benchmark_contract"]
    identity={"benchmark_id":benchmark["benchmark_id"],"benchmark_version":benchmark["version"],
        "evaluation_split":benchmark["evaluation_split"],"primary_metric":benchmark["primary_metric"]}
    if isinstance(raw,dict) and any(raw.get(k)!=v for k,v in identity.items()):
        reasons=["NATURAL_CENSUS_BENCHMARK_BINDING_REQUIRED"]
    elif not isinstance(raw,dict) or raw.get("sampling_kind")!="natural_failures" or not isinstance(rows,list) or not rows:
        reasons=["NATURAL_FAILURE_CENSUS_REQUIRED"]
    else:
        seen=set();eligible=[]
        scope={"population_id":card["population_id"],"natural_failure":card["natural_failure"],
            "endpoint":card["consequence"]["endpoint"],"strong_simple_alternative":card["strong_simple_alternative"]}
        for row in rows:
            if not isinstance(row,dict) or not isinstance(row.get("case_id"),str) or not row["case_id"] or row["case_id"] in seen:
                reasons.append("INVALID_OR_DUPLICATE_NATURAL_EPISODE");break
            seen.add(row["case_id"])
            if any(row.get(k)!=v for k,v in scope.items()) or row.get("natural") is not True or row.get("failed_episode") is not True:
                reasons.append("NATURAL_EPISODE_SCOPE_UNVERIFIED");break
            loss=row.get("downstream_loss")
            if type(row.get("affected")) is not bool or type(row.get("alternative_solves")) is not bool or type(loss) not in (float,int) or not math.isfinite(loss) or loss<0:
                reasons.append("NATURAL_EPISODE_MEASUREMENTS_REQUIRED");break
            if not row.get("source_ref"):
                reasons.append("NATURAL_EPISODE_SOURCE_REQUIRED");break
            source=C.load_file(C.verify_ref(root,row["source_ref"]))
            expected={k:v for k,v in row.items() if k!="source_ref"}
            if source!=expected:C.fail("NATURAL_EPISODE_RAW_DISAGREEMENT")
            eligible.append(row)
        if not reasons:
            affected=[r for r in eligible if r["affected"]]
            n,a=len(eligible),len(affected)
            metrics.update(cases=n,affected=a,prevalence=a/n,
                mean_loss=sum(r["downstream_loss"] for r in affected)/a if a else 0.0,
                unresolved_fraction=sum(not r["alternative_solves"] for r in affected)/a if a else 0.0)
            t=card["gate_0_thresholds"]
            if n<t["min_cases"]:reasons.append("NATURAL_SAMPLE_INSUFFICIENT")
    if reasons:outcome="INCONCLUSIVE"
    else:
        t=card["gate_0_thresholds"]
        checks=((metrics["affected"]>=t["min_affected"],"NATURAL_FAILURE_TOO_RARE"),
            (metrics["prevalence"]>=t["min_prevalence"],"NATURAL_PREVALENCE_TOO_LOW"),
            (metrics["mean_loss"]>=t["min_mean_loss"],"DOWNSTREAM_CONSEQUENCE_TOO_SMALL"),
            (metrics["unresolved_fraction"]>=t["min_unresolved_fraction"],"SIMPLE_ALTERNATIVE_SUFFICIENT"))
        reasons=[reason for passed,reason in checks if not passed]
        outcome="KILL" if reasons else "PASS"
    if report["outcome"]!=outcome:C.fail("NATURAL_GATE_OUTCOME_MISMATCH")
    return {"outcome":outcome,"metrics":metrics,"reason_codes":reasons or ["NATURAL_PROBLEM_SCREEN_PASSES"]}


def require_natural(root,state,candidate=None):
    card=parent(root,state)
    if not state.get("natural_gate_0_ref"):C.fail("NATURAL_GATE_0_REQUIRED")
    result=natural_gate(root,state["parent_problem_ref"],state["natural_gate_0_ref"])
    if result["outcome"]!="PASS":C.fail("NATURAL_GATE_0_PASS_REQUIRED")
    if state.get("importance_outcome")=="KILL":C.fail("IMPORTANCE_KILL_REQUIRES_STOP_OR_REROUTE")
    if candidate is None and state.get("candidate_ref"):
        candidate=C.verify_ref(root,state["candidate_ref"],"idea-atom")
    if candidate is not None:
        if candidate.get("parent_problem_ref")!=state["parent_problem_ref"]:
            C.fail("CANDIDATE_PARENT_PROBLEM_MISMATCH")
        case=candidate.get("necessity_case")
        if not isinstance(case,dict):C.fail("CANDIDATE_NECESSITY_COMPARISON_REQUIRED")
        compared=set(case["simple_alternatives_compared"])
        if not set(card["simple_alternatives"]).issubset(compared):
            C.fail("FROZEN_SIMPLE_ALTERNATIVES_COMPARISON_REQUIRED")
        if case["memory_representation_change"] and "plain_text_memory" not in compared:
            C.fail("PLAIN_TEXT_MEMORY_COMPARISON_REQUIRED")
        for r in case["baseline_evidence_refs"]:C.verify_ref(root,r)
    return result


def assess(root,state,ref):
    card=parent(root,state)
    report=C.verify_ref(root,ref,"importance-decision")
    if report["parent_problem_ref"]!=state["parent_problem_ref"] or report["natural_gate_0_ref"]!=state.get("natural_gate_0_ref"):
        C.fail("IMPORTANCE_NOT_BOUND_TO_CURRENT_PROBLEM")
    if report.get("candidate_ref")!=state.get("candidate_ref"):C.fail("IMPORTANCE_NOT_BOUND_TO_CURRENT_CANDIDATE")
    for r in report["evidence_refs"]:C.verify_ref(root,r)
    outcome=report["outcome"]
    ids=set(state.get("major_collision_work_ids",[]))
    for r in report["functional_collision_work_refs"]:
        work=C.verify_ref(root,r,"work-record")
        if not work["primary_source"] or work["read_depth"] not in {"D2","D3"} or not work["evidence_refs"]:
            C.fail("MAJOR_FUNCTIONAL_COLLISION_PRIMARY_EVIDENCE_REQUIRED")
        for evidence in work["evidence_refs"]:C.verify_ref(root,evidence)
        ids.add(work["work_id"])
    if outcome=="CONCURRENT":
        require_natural(root,state)
        expected={"natural_failure":card["natural_failure"],"population_id":card["population_id"],
            "endpoint":card["consequence"]["endpoint"],"strong_simple_alternative":card["strong_simple_alternative"],
            "falsifiable_prediction":card["falsifiable_prediction"]}
        if report["retained_problem"]!=expected:C.fail("PARENT_SCOPE_CHANGED_RESTART_REQUIRED")
        if report["exclusion_basis"]:C.fail("NOVELTY_BY_EXCLUSION_REQUIRES_NEW_NATURAL_PROBLEM")
    # Fresh papers do not reset this per-parent budget. The second distinct
    # declared major functional collision forces I-style exploration.
    if len(ids)>=2 and outcome!="KILL":outcome="REROUTE"
    return report,outcome,sorted(ids)


def require_ready(root,state):
    require_natural(root,state)
    ref=state.get("importance_decision_ref")
    if not ref or state.get("importance_outcome")!="CONCURRENT":C.fail("CURRENT_IMPORTANCE_DECISION_REQUIRED")
    report,outcome,ids=assess(root,state,ref)
    if outcome!="CONCURRENT":C.fail("COLLISION_BUDGET_RESTART_REQUIRED")
    return report


def reset_for_exploration(state):
    new=copy.deepcopy(state)
    if state.get("parent_problem_ref"):new["previous_parent_problem_ref"]=state["parent_problem_ref"]
    for k in ("parent_problem_ref","natural_gate_0_ref","natural_gate_0_outcome","natural_gate_0_metrics",
              "candidate_id","candidate_ref","gate_a_protocol_ref","full_validation_protocol_ref"):
        new.pop(k,None)
    new.update(current_route="explore_problem",lifecycle_phase="landscape",suspension=None,
        gate_state="not_ready",validation_state="not_ready",writing_state="not_ready")
    return new


def apply(root,state,outcome,payload):
    """Pure state decision reused during both commit and historical replay."""
    new=copy.deepcopy(state);refs=[]
    route,phase=state["current_route"],state["lifecycle_phase"]
    if outcome=="freeze_parent_problem":
        if route not in {"explore_problem","audit_method","audit_rejection"} or phase!="landscape":C.fail("PARENT_FREEZE_REQUIRES_EXPLORATION")
        pref=payload["parent_problem_ref"];card=C.verify_ref(root,pref,"parent-problem-card")
        parent(root,{"parent_problem_ref":pref})
        if state.get("parent_problem_ref") and pref!=state["parent_problem_ref"]:C.fail("PARENT_PROBLEM_IMMUTABLE_REROUTE_REQUIRED")
        previous=state.get("previous_parent_problem_ref")
        if previous:
            old=C.verify_ref(root,previous,"parent-problem-card")
            if pref==previous or card["problem_id"]==old["problem_id"] or card.get("previous_parent_problem_ref")!=previous:C.fail("NEW_PARENT_PROBLEM_LINEAGE_REQUIRED")
        new["parent_problem_ref"]=pref;refs+=C.payload_refs(card)
        if not state.get("parent_problem_ref"):
            new["major_collision_work_ids"]=[]
            new.pop("importance_decision_ref",None);new.pop("importance_outcome",None)
    elif outcome=="record_natural_gate_0":
        parent(root,state)
        if route not in {"explore_problem","audit_method","audit_rejection","develop_candidate"}:C.fail("NATURAL_GATE_REASSESSMENT_REQUIRES_EXPLORATION")
        gref=payload["natural_gate_0_ref"];checked=natural_gate(root,state["parent_problem_ref"],gref)
        report=C.verify_ref(root,gref,"natural-gate-0")
        raw=C.load_file(C.verify_ref(root,report["observations_ref"]))
        refs+=C.payload_refs(report)+C.payload_refs(raw)
        new.update(natural_gate_0_ref=gref,natural_gate_0_outcome=checked["outcome"],natural_gate_0_metrics=checked["metrics"])
        new.pop("importance_decision_ref",None)
        if state.get("importance_outcome")!="KILL":new.pop("importance_outcome",None)
    elif outcome=="importance_decision":
        iref=payload["importance_decision_ref"];report,choice,ids=assess(root,state,iref)
        refs+=C.payload_refs(report)
        for r in report["functional_collision_work_refs"]:refs+=C.payload_refs(C.verify_ref(root,r,"work-record"))
        if choice=="REROUTE":new=reset_for_exploration(state)
        new.update(importance_decision_ref=iref,importance_outcome=choice,major_collision_work_ids=ids)
        if choice=="KILL":new.update(gate_state="not_ready",validation_state="not_ready",writing_state="not_ready")
    elif outcome=="restart_problem_exploration":
        new=reset_for_exploration(state)
        new.pop("importance_decision_ref",None);new["importance_outcome"]="REROUTE"
    else:C.fail("UNKNOWN_IMPORTANCE_OUTCOME")
    return new,refs


def verify_event(root,prior,event):
    outcome=event["payload"].get("outcome")
    if event["event_type"]!="transition" or outcome not in OUTCOMES:return
    expected,_=apply(root,prior,outcome,event["payload"])
    expected["sequence"]=event["sequence"]
    if expected!=event["next_state"]:C.fail("IMPORTANCE_STATE_REPLAY_MISMATCH")
