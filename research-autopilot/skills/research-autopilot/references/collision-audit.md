## 10. Closest-work and adversarial collision audit

Freeze atomic novelty claims before retrieval. Search independently by problem, mechanism, objective, operator, differentiator, assumptions, observable behavior, component combinations, historical aliases, and cross-domain terminology.

Use distinct roles and artifacts:

1. claim registrar;
2. high-recall retriever;
3. collision prosecutor;
4. difference defender;
5. method-equivalence verifier;
6. provenance auditor;
7. blinded adjudicator;
8. human approval for irreversible high-confidence kills.

Generation, retrieval, prosecution, defense, and adjudication run in separate fresh contexts. The adjudicator receives anonymous candidate IDs and verified evidence spans but not generator identity, vote counts, or previous verdict language. A single agent may not retrieve, score, and adjudicate the same match.

Compare computation graphs, objective equivalence, state transitions, training and inference traces, assumptions, complexity, guarantees, and observable effects. Shared vocabulary, dataset, optimizer, scale, or benchmark is not a mechanism collision by itself.

The coverage/equivalence report may record one of the following low-level findings.
These findings do not approve continuation; the final research decision must pass
[importance-preserving-gate.md](importance-preserving-gate.md):

- `ADVANCE`;
- `REFINE`;
- `REROUTE_EVIDENCE`;
- `REROUTE_MECHANISM`;
- `REROUTE_REPLICATION_OR_TRANSFER`;
- `KILL`;
- `INCONCLUSIVE_EXPAND_SEARCH`.

After each actual functional collision, compare the residual claim to the frozen
Parent Problem. Record CONCURRENT, REROUTE or KILL with retained natural evidence,
task consequences and the strongest simple alternative. Record major functional
work IDs; after two distinct collisions return to failure census even if new
literature arrived. Legacy REFINE and mechanism/transfer reroutes are historical
findings, not executable permission to keep narrowing a contribution. A new
failure, population or task endpoint needs a fresh parent and Natural Gate 0.

The report says “no collision found under this protocol and snapshot,” never “no prior work exists.” Multiple agents citing the same source count as one evidence unit.

Collision search stops only after every required query family runs, high-risk neighbors receive citation expansion, each decisive neighbor has full text or an explicit inaccessible status, two rounds add no new high-risk family, and recorded coverage meets the configured threshold. Missing full text, unresolved priority, insufficient coverage, or wide evidence uncertainty returns `INCONCLUSIVE_EXPAND_SEARCH`, never `ADVANCE` or `KILL`. A `KILL` requires one pre-cutoff primary source that covers the frozen essential claim elements, verified provenance and locators, and explicit human approval.
