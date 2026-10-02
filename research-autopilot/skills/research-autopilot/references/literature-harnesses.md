# Literature, publication provenance and reproduction

This augments literature-evidence.md. Search tools discover records; a harness
binds queries, primary-source reads, versions, verification, resource limits and
retained evidence. No retrieved answer or agent agreement substitutes for sources.

## L01 Search harness

Define the research question, mechanism aliases, task names and a bounded search
plan. Search historical/nearby work, recent papers, failures, simple alternatives,
replications and other domains. Use official proceedings/OpenReview/publisher pages
and search indexes as available. HF Papers can link models/code and return text;
check whether returned markdown is the complete arXiv article or a summary fallback.
Capture exact query, filters, dates, pages/cursors, raw responses/digests, parser
version, exclusion reasons and missing providers. Stop by recorded risk/coverage
and budget, never by an unexplained hit-count threshold. Tools may be unavailable;
record that instead of pretending to have queried them.

## L02 Canonical works and independent evidence axes

Keep a work identity with separate version identities and relations. Match title,
authors, dates, content and official records; Crossref relations are useful but
may be missing. Do not merge papers on a similar title alone.

| Axis | Record |
|---|---|
| Publication | preprint/submitted/accepted/published/withdrawn/retracted/unknown; venue/year/track; official URL and checked date |
| Distinction | Oral/Spotlight/Poster/other/unknown with independent official locator; not inferred from popularity |
| Content read | metadata/abstract/full scientific sections/forensic scope, exact version and missing portions |
| Reproduction | not attempted/static inspection/runs/result matched/independent replication/failed/inconclusive, with run and scope |
| Claim support | author's report/direct observation/deduction/inference/contradicted/unknown; conditions and uncertainty |

Acceptance and Oral/Spotlight may prioritize reading; they do not certify results.
Agent consensus can check provenance but cannot turn repeated opinion into
experimental evidence. Do not collapse these axes into one confidence number.

## L03 Scientific reading and final-version citation

For consequential papers read problem, assumptions, algorithm/equations, setup,
main tables, ablations and limits, with supplementary material as needed. Store
atomic paraphrases linked to page/section/equation/figure/table and version.
Never fill missing sections from a summary. Check citations in official
proceedings, publisher/DOI metadata and, where relevant, OpenReview decisions.

When the same work has a verified final conference/journal version, prefer its
official BibTeX/metadata. Preserve arXiv ID+vN as provenance. If v1 and the final
version have different experiments, cite the version actually supporting the
statement and explain the relationship. Do not relabel preprint results as final
results or invent a venue, DOI or distinction. An unresolved match stays unresolved.

Under this project's evidence policy, an unreproduced arXiv empirical result is a
question-marked lead/author-reported result, not direct evidence for a new project's
performance or a Gate PASS. It can motivate a test or be described as an unverified
prior report. An accepted unreproduced paper likewise cannot masquerade as our
own measured evidence. Conceptual ideas can be discussed with attribution;
mathematical claims require checking the relevant reasoning/assumptions rather
than running an unrelated experiment. Apply this policy to our own papers too.

## L04 Reproduction harness

Choose and label the objective: running authors' artifact, reproducing a specified
result, reimplementing from paper, or an independent replication. Freeze paper
version, official repo/commit, license, model/data revisions, split, preprocessing,
prompts, sampling, metric/evaluator, hardware, precision, seeds, time and budget.
Specify which table/cell or claim is targeted and an appropriate tolerance or
uncertainty rule before judging agreement.

Proceed through static paper-code mapping, semantic checks/canary, qualified
baseline and clean-environment execution. Keep commands, environment lock,
stdout/stderr, per-example predictions, resource use, failed attempts and numeric
comparison. A result may run yet mismatch; a missing resource may be inconclusive.
Report exact scope and discrepancies. Upgrade only the reproduced claim/settings,
not the whole paper. PaperBench's separated code, clean execution and result-match
stages are a useful design reference; Code-Dev alone skips execution/result match.
Its benchmark rules are not a universal author-code reproduction protocol.

## L05 Updating the knowledge map

Expand backward and forward citations and maintain searched/unchecked families.
Keep conflicting and negative findings. Attach provenance and version identities
to KG claim edges; attach verification scope to reproduced results. Watch new
versions, formal publication, corrections and new collisions at meaningful
project events. New findings enter a versioned overlay and invalidate affected
claims/experiments/writing/releases according to literature-evidence.md. Optional
scheduled monitoring requires requested scope. Coverage is bounded, never complete
knowledge of a field. Manuscripts and websites inherit the same evidence policy.
