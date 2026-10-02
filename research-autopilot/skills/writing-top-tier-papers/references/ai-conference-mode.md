# AI-Conference Mode

## Purpose

Use this mode for a full AI, ML, NLP, computer-vision, robotics, or related conference paper. Treat ICML, NeurIPS, ICLR, ACL-family venues, CVPR-family venues, AAAI, and their workshops or tracks as distinct rule sets. Verify the exact year, track, and stage.

## Paper contract

Before prose, fix:

- task or scientific question;
- setting and assumptions;
- central technical idea;
- evaluation regime;
- smallest coherent set of defensible contributions;
- exact venue/year/track/stage and anonymity requirements.

Use the one-sentence thesis:

> In setting **S**, we address problem **P** with idea **I**, producing outcome **O**, supported by evidence **E**.

Every main section must advance this sentence.

## Claim–evidence discipline

Pair every contribution with its proof obligation:

| Contribution type | Typical proof obligation |
|---|---|
| New method or objective | fair main comparison, clear formulation, reproducible setup |
| Mechanism claim | targeted diagnostic that distinguishes alternatives |
| Generality | multiple relevant settings or a carefully bounded claim |
| Robustness | predeclared perturbations/shifts and interpretable degradation |
| Efficiency | comparable hardware, budget, implementation, and metric definition |
| Theory | assumptions, statement, proof or derivation, and empirical relevance if claimed |
| Dataset/benchmark/resource | construction quality, coverage, validity, leakage checks, documentation |
| Analysis/finding | appropriate controls, uncertainty, and separation of observation from interpretation |

An ablation is not mandatory by convention. Include it only when it tests a material component, design choice, or mechanism claim and the evidence exists. Do not invent a “standard experiments” checklist detached from the paper's thesis.

## Section architecture

Adapt visible headings to the venue and paper type, but preserve these duties.

### Title

Expose the distinguishing idea and task or setting. Prefer concrete searchable terms over slogans. Avoid unsupported superlatives and unexplained acronyms.

### Abstract

Use a compact claim–evidence arc:

- consequential problem;
- precise limitation;
- core idea;
- evaluation setting;
- principal result, quantitative when meaningful and available;
- implication and scope.

Follow the verified venue contract for abstract citations. If citations are disallowed, move the attributed claim to the Introduction or rewrite it without unsupported specificity. Do not claim superiority without a comparison basis.

### Introduction

The introduction should:

1. establish the problem and stakes without a generic history;
2. identify a specific failure mode or unresolved gap;
3. give the central insight in accessible language;
4. preview the approach at conceptual level;
5. summarize the strongest evidence;
6. state a small set of parallel, falsifiable contributions.

If the user requests a motivation figure, place Figure 1 after the text has established problem, gap, and response. It can be motivation-led, method-led, result-led, or a restrained composite. Choose from evidence topology, not a universal house style.

### Related work

Organize by comparison dimension, not paper-by-paper chronology. For each cluster, state:

- the shared problem or technique;
- the assumption or design dimension that matters;
- how the present work differs;
- which citations directly support the comparison.

If coverage is not verified, label it provisional and avoid “first,” “only,” “all prior work,” or “comprehensive.”

### Problem setup

Define inputs, outputs, assumptions, notation, objective, and evaluation target before using them. Include shapes, units, or dimensions when they prevent ambiguity. Avoid a notation section that introduces symbols long before use.

### Method

Present in dependency order:

1. problem and high-level idea;
2. minimum notation;
3. components or stages;
4. objective, algorithm, or inference procedure;
5. training/implementation choices necessary for interpretation;
6. complexity or theoretical properties when material.

Explain why each component exists and which claim it serves. Use pseudocode when execution order, branching, or state updates are central. Use equations when they remove ambiguity, not as decoration.

### Experiments

Organize experiments around questions:

- Does the main idea improve the target outcome under fair comparison?
- Which settings define the supported scope?
- What evidence tests the claimed mechanism or component necessity?
- How does performance change under scale, shift, perturbation, or budget?
- Where does the method fail, and does that change the central claim?

Separate supplied results from proposed experiments. Do not fill missing protocol details. Report seeds, uncertainty, significance, compute, or resources only when supplied or verified.

### Results and analysis

Each subsection should follow:

1. scientific or technical question;
2. evaluation design needed to answer it;
3. direct observation;
4. interpretation;
5. connection to the claim matrix;
6. meaningful exception or boundary.

Do not narrate every cell. State the comparison that changes the reader's conclusion and preserve unfavorable entries.

### Limitations and conclusion

Limitations should name real assumptions, coverage gaps, evaluation gaps, resource constraints, failure modes, and misuse risks. Put a qualification beside the claim when it changes the reader's interpretation; do not postpone it all to a generic limitations section.

The conclusion resolves the question, restates the idea, names the strongest supported finding, and explains the implication. It introduces no new result or apology cascade.

## Figure and table program

Use a role-based visual sequence, never a mandatory count:

- Figure 1: motivation/hero, method overview, teaser result, or restrained composite;
- method figure: only if structure, state, or process is hard to understand in prose;
- main result table/plot: direct evidence for the central claim;
- targeted diagnostic or ablation: only if it tests a material claim;
- robustness, scaling, efficiency, qualitative, or error figure: when relevant to scope or mechanism;
- appendix figures/tables: secondary depth, full results, reproducibility, and diagnostics.

Every figure answers one principal question. For experiment figures, one dominant panel must occupy at least half the usable canvas; supporting panels explain or qualify the same claim. Put qualitative evidence after or beside the quantitative result it explains, with a disclosed selection rule and failures where material.

For tables:

- identify higher/lower-is-better and units;
- group comparable methods fairly;
- expose incompatible regimes rather than blending them;
- define bold/underline/shading/significance markers;
- use precision justified by the measurement;
- disclose aggregation and uncertainty when available;
- attribute externally reported numbers at row or cell level when sources differ.

## Page budget and compression

Derive the budget from the verified official limit. Use relative priority, not fixed page quotas:

| Section family | Default priority | Expansion rule |
|---|---:|---|
| Introduction/positioning | Moderate | Expand until gap, thesis, and evidence preview are unmistakable |
| Related work | Compact | Expand only for distinctions necessary to interpret novelty |
| Method | Substantial | Match conceptual and reproducibility needs |
| Experiments/results | Largest | Protect evidence for primary claims |
| Analysis/limits/conclusion | Reserved | Preserve interpretation and actual boundaries |

When over budget, compress in this order:

1. repetition and generic framing;
2. implementation narration that adds no reproducibility value;
3. redundant examples or visual panels;
4. secondary analyses that may legally and accessibly move to supplementary material;
5. prose that can be made denser without losing comprehension.

Never reduce required fonts, margins, caption text, or spacing. Never demote central evidence to preserve low-value prose.

## Appendix and supplementary material

Verify whether reviewers can access it, whether it shares a PDF or length limit, and whether external links are allowed. Suitable duties include:

- proofs and derivations;
- pseudocode and implementation detail;
- hyperparameters and full evaluation protocols;
- full tables and secondary results;
- extra diagnostics, robustness, and qualitative cases;
- dataset, prompt, annotation, model, and compute documentation;
- checklists and required disclosures.

The main paper must remain persuasive and technically interpretable without optional supplementary material. Preserve the complete underlying result matrix in an allowed artifact; keep any adverse or null result that changes interpretation in the main paper. Preserve anonymity and exact cross-references. Every numbered supplementary non-table figure receives the same design-pack and QA treatment as a main figure.

## AI-paper revision passes

1. **Contribution pass:** keep the smallest coherent defensible set.
2. **Claim pass:** update claim–evidence mapping and remove overreach.
3. **Structure pass:** ensure every section advances the thesis.
4. **Technical pass:** normalize notation, terminology, algorithms, metrics, and settings.
5. **Evidence pass:** inspect fairness, comparability, uncertainty, captions, and interpretation.
6. **Anti-overdefense pass:** direct claims, honest local limits, no generic hedging loops.
7. **Compression pass:** remove repetition while preserving evidence and reproducibility.
8. **Layout pass:** inspect floats, equations, references, page breaks, and final-size figures.
9. **Compliance pass:** exact venue/year/track/stage, anonymity, ethics, supplementary policy, and checklists.

## AI-specific failure checks

- Contributions are a feature list rather than claims with proof obligations.
- Abstract promises breadth the evaluation does not establish.
- Introduction becomes a mini-survey or hides the idea.
- Related work is a list of paper summaries.
- Method describes operations but not rationale.
- Experiments follow run chronology rather than questions.
- An ablation is added by habit rather than to test a claim.
- Best values are emphasized across incomparable regimes.
- Results prose repeats table cells.
- A generated image is used for exact measured plots.
- Essential evidence is buried in an optional appendix.
- Prior-year or different-track rules are applied as current requirements.
- Submission and camera-ready rules are conflated.

Repair these before cosmetic edits.
