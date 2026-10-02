# Evidence, Citations, and Confident Prose

## Claim calibration

For every important statement, separate four layers:

1. **Observation:** what supplied data, derivation, or source directly shows.
2. **Interpretation:** the most economical inference consistent with the observation.
3. **Mechanism or causal claim:** requires evidence that distinguishes alternatives.
4. **Scope:** populations, tasks, settings, assumptions, and time periods actually covered.

Do not slide from one layer to the next through rhetoric. A broader interpretation needs broader evidence.

### Verb-to-evidence check

| Wording | Minimum evidence question |
|---|---|
| improves/outperforms | Compared under what matched conditions and metric? |
| generalizes | Across which genuinely distinct settings? |
| robust | To which declared perturbations or shifts? |
| efficient | Under which hardware, budget, implementation, and resource metric? |
| explains/mechanism | Which alternative explanations were discriminated? |
| causes | What identification or intervention supports causality? |
| state of the art | Is the comparison current, comprehensive enough, and genuinely comparable? |
| trade-off | Are two opposed quantities measured under comparable operating conditions? |

If the answer is unavailable, choose narrower language or mark the evidence gap.

## Claim–evidence ledger

Maintain a ledger with:

| Field | Required content |
|---|---|
| ID | Stable claim identifier |
| Exact claim | Text at intended strength |
| Type | Context, novelty, performance, mechanism, scope, theory, limitation |
| Evidence needed | Logical proof obligation |
| Evidence present | File/table/figure/equation/source locator |
| Boundary | Assumptions and excluded settings |
| Status | Supported / narrow / qualify / missing / contradicted / cut |
| Destinations | All manuscript locations carrying the claim |

Run a consistency check across title, abstract/summary, introduction, result headings, captions, discussion, limitations, and conclusion. The same claim must not quietly expand in a high-visibility location.

## Citation placement

Cite the smallest supported proposition. Place the citation immediately after the claim, method, dataset, benchmark, or attributed interpretation it supports.

When a sentence contains claims from different sources:

- split the sentence; or
- place citations at clause level if the target style supports it.

Do not dump a group of citations at the end of a paragraph when their roles differ. Do not cite a review as the original source of a method or result when the primary source is available.

### Typical citation anchors

- field-defining fact or accepted quantitative estimate;
- named prior method, model, dataset, metric, software, protocol, or benchmark;
- comparison with a prior limitation or assumption;
- adapted theory, equation, taxonomy, or experimental design;
- externally reported result;
- reused, adapted, or source-derived visual material.

The authors' own measured results normally point to their figure/table rather than an external citation. Cite external protocols, data, or methods used to obtain them.

## Citation ledger and audit

For every citation or placeholder record:

| Field | Meaning |
|---|---|
| Key | Existing BibTeX key or provisional source ID |
| Manuscript claim | Exact proposition to support |
| Source locator | DOI, official page, paper URL, or supplied-file location |
| Source class | Primary paper, review, official instructions, dataset/model card, standard |
| Metadata verified | Authors/title/year/venue/identifier checked |
| Entailment verified | Source actually supports the adjacent wording |
| Status | Verified, provisional, inaccessible, conflicting, or missing |
| Disposition | Cite, replace, narrow claim, remove claim, or request source |

Never fabricate a BibTeX entry from memory. If a source cannot be verified, retain `[CITATION NEEDED: exact proposition]` and list it as an open issue.

## Visual provenance

Put claim citations in body prose. Put visual provenance in the caption when appropriate:

- `Adapted from [citation]` when composition or content is modified;
- `Reproduced from [citation]` when copied faithfully;
- `Data from [citation]` when a plot is redrawn from another source;
- `Concept based on [citation]` only when that relationship is accurate.

A citation does not grant reproduction permission. Track license or permission separately. Do not invent figure numbers, page numbers, licenses, or permissions.

## Confident prose, honest limits

Use this transformation sequence:

1. Find the strongest evidence-supported proposition.
2. Remove claims outside its scope.
3. State the retained proposition with a concrete subject and verb.
4. Keep a nearby qualifier only if it changes interpretation.
5. Put paper-wide or secondary boundaries in a dedicated limitations/discussion passage.

Examples:

- Defensive: “While our method is by no means universally superior and many future studies are needed, it may potentially offer some benefits.”
- Calibrated: “Under the matched evaluation in Table 2, the method improves recall on the three tested datasets.”

- Overstated: “The analysis proves that component X causes the gain.”
- Calibrated: “Removing component X eliminates most of the measured gain, supporting its importance in this configuration.”

- Vague trade-off: “The method has a favorable accuracy–efficiency trade-off.”
- Neutral when evidence is incomplete: “Accuracy increases by [MEASURED VALUE], while latency also increases by [MEASURED VALUE] under [SETTING].”

## Where qualifications belong

Keep a qualification beside the claim when it concerns:

- the evaluated population or task;
- an assumption essential to validity;
- a measurement or comparison limitation;
- causal versus correlational interpretation;
- a material exception or negative result.

Use the Limitations section for:

- paper-wide applicability boundaries;
- untested domains or populations;
- resource and deployment constraints;
- missing evaluation dimensions;
- foreseeable misuse or ethics issues;
- well-defined next evidence needs.

Delete generic disclaimers that could attach to any paper and do not inform interpretation.

## Negative and null evidence

- Preserve the complete underlying result matrix and all disclosed evaluation conditions. A full secondary table may move to an allowed supplement, but any null, negative, or contradictory result that changes the central interpretation stays visible in the main paper.
- Report null or negative findings when they test a stated claim or materially alter scope.
- Do not select only favorable qualitative cases; record the selection rule.
- Do not relabel a loss as a benefit without evidence.
- A failed or mixed result can narrow a claim, reveal a boundary, or motivate a targeted analysis; it cannot disappear for rhetorical convenience.

## Safe prose revision invariants

Tone and clarity edits must not change:

- factual polarity or negation;
- numerical values, units, uncertainty, or comparison conditions;
- mathematical meaning;
- modality or causal strength;
- population/task scope;
- citation attribution;
- anonymity-relevant details.

Never leak instructions, figure-design specifications, revision discussions, failed drafts, or internal evidence labels into the final manuscript. A clearly labeled working draft may retain explicit placeholders. Before a clean handoff, remove them from manuscript prose and report the gaps externally; any unresolved placeholder blocks submission-ready status.
