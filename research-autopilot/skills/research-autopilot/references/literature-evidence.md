## 8. Continuous literature evidence

The evidence layer is active throughout the project. It stores:

- reproducible search runs;
- canonical papers and versions;
- read depth (`D0` metadata, `D1` triage, `D2` scientific read, `D3` forensic verification);
- atomic evidence units with exact locators;
- gaps, contradictions, failures, claims, experiments, review issues, and typed relations;
- versioned snapshots at Gate A, evidence freeze, draft lock, and submission.

Each `search-run` freezes the exact query strings, provider and API/index version, search date and cutoff, filters, sort order, page size, pagination cursors or page range, language/type restrictions, seed works, citation-expansion policy, requested and returned counts, raw-response snapshot or immutable digest, parser version, canonicalization rules, deduplication version, and normalized output digest. Replaying captured connector responses must reproduce the same normalized works, evidence units, coverage result, and snapshot digest. Missing raw captures, protocol metadata, or versioned normalization prevents the run from satisfying collision coverage and therefore prevents `ADVANCE` or `KILL`.

Search families vary by entry:

- `I`: landscape, contradiction, failure regime, benchmark, mechanism, theory, replication, adjacent domain;
- `M`: genealogy, historical aliases, functional equivalence, component combination, simple alternative, failure, resource profile, concurrent work;
- `R`: reviewer-literal terms, reviewer-cited sources, novelty objection, soundness, missing baseline, generalization, post-submission work, venue rules.

Search snippets and model memory are discovery aids only. Core novelty, mechanism, benchmark, and contradiction claims require verified primary sources. New material after a freeze enters a monitored overlay and can reopen affected claims; it never silently mutates a frozen snapshot.

Refresh is event-driven at minimum: new candidate, changed method digest, unexpected Gate A result, new headline claim, evidence freeze, venue change, reviewer feedback, and submission delta audit. Optional scheduled monitoring is separately authorized. A search iteration reaches risk-based saturation only after all applicable query families run, critical seeds receive backward/forward expansion, and two successive batches add no new high-impact method family, contradiction, or evidence obligation. This is recorded as coverage, never as exhaustive completion.

Every newly verified item receives an impact class:

- `S0 context`: ledger update only;
- `S1 positioning`: rerun citation and related-work projection;
- `S2 evidence obligation`: invalidate affected experiment, claim, writing, and figure projections;
- `S3 thesis or novelty`: mark the evidence snapshot stale and reopen collision audit or Gate A.

Downstream artifacts carry the exact evidence-snapshot digest. A stale dependency cannot remain `current` or authorize writing/submission progression.
