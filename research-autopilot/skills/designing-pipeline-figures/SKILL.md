---
name: designing-pipeline-figures
description: Use when a user provides a paper, method description, sketch, screenshot, or existing scientific figure and asks for alternative layouts, a detailed visual specification, a generation prompt, or a native editable draw.io/SVG/PDF/PNG figure for a method, architecture, mechanism, training, inference, agent, or system pipeline.
---

# Designing Pipeline Figures

## Core principle

Diagram the scientific dependency graph first and style it second. Preserve the method exactly while producing three publication-ready, structurally distinct ways to explain it. When production is requested, retain the selected prompt/specification and render the selected design as editable vector structure rather than a flattened approximation.

## Required references

- Read [references/style-catalog.md](references/style-catalog.md) before choosing layouts.
- Read [references/output-contract.md](references/output-contract.md) before writing the deliverable.
- Read [references/worked-example.md](references/worked-example.md) when calibrating detail or resolving an ambiguous brief.
- Read [references/drawio-production.md](references/drawio-production.md) whenever the user asks to draw, generate, export, edit, or deliver an actual figure rather than only a design specification.

## Workflow

1. **Inspect the source.** For an attached image or PDF, inspect the actual figure visually at legible resolution. For a paper, read the relevant method, training, inference, and caption text. Treat OCR as fallible.
2. **Lock the facts.** Record the problem, inputs, outputs, modules, state objects, ordering, branches, loops, losses, notation, and claimed results. Classify each item as `CONFIRMED`, `ILLUSTRATIVE`, or `TO CONFIRM`.
3. **Write one three-second claim.** Express what the reader must understand immediately. Choose one visual center: the novelty, gate, bottleneck, shared state, branching decision, or feedback loop.
4. **Infer topology.** Identify whether the method is primarily linear, staged, recurrent, dual-lane, hub-and-spoke, bottlenecked, hierarchical, branching, or train/infer split.
5. **Select three compatible styles.** Eliminate styles whose required structure is absent. Then choose or rotate among three different topology families from the catalog. Randomness may vary composition, never modules, metrics, causal order, or claims.
6. **Design arrows before cards.** Establish one principal reading path, then secondary branches and no more than the necessary return loops. Give line style a stable meaning.
7. **Write the design artifact.** Follow the output contract. Each option must contain a standalone prompt that can be copied independently. If only planning or comparison was requested, stop after the artifact.
8. **Select the production option.** Use the user's selected option. If the user explicitly requests immediate generation without choosing, render the recommended option and record that choice. Do not render all three unless requested.
9. **Produce the editable figure.** Follow the draw.io production reference. Prefer native draw.io XML for precise scientific architecture; preserve the `.drawio` source even when also exporting SVG, PNG, or PDF.
10. **Render and inspect.** When a renderer is available, export a preview and visually inspect it at full size and intended paper width. Correct clipping, overlap, microtext, broken math, misleading arrows, and inconsistent states. When no renderer is available, report structural validation honestly and do not claim visual verification.
11. **Audit scientific fidelity.** Verify every label, equation, arrow, training signal, and numeric claim against the source. Mark unresolved content explicitly instead of guessing.

## Routing boundaries

- Use this skill for method and system explanations, including a small conceptual result inset when it closes the story.
- Use `designing-experiment-figures` when measured comparisons, ablations, scaling curves, uncertainty, or qualitative results are the main visual content.
- Use draw.io for editable scientific topology, precise vector layout, panel assembly, and annotations. Do not use it to hand-place quantitative bars, points, curves, confidence intervals, or heatmap cells.
- If the source is an existing figure, default to faithful semantic reconstruction with improved clarity. Redesign may change layout, not the underlying science.

## Non-negotiable output properties

- The three alternatives must be topologically distinct, not recolored copies.
- All three must encode the same confirmed method.
- Exact paper labels and notation remain exact; shortened labels are listed separately.
- Real observations, imagined states, training-only paths, inference-time paths, and rejected candidates receive distinguishable encodings when present.
- A conceptual icon or example is marked `ILLUSTRATIVE`; a missing fact is marked `TO CONFIRM`.
- Text remains horizontal and legible at the intended paper width.
- The figure reads without its caption, while the caption explains rather than rescues it.
- Every produced figure retains a separate source prompt/specification and native editable source. An exported image never replaces the `.drawio` source.
- A native editable diagram uses individual shapes, text objects, and connectors; one embedded flat image does not qualify.

## Common mistakes

| Mistake | Correction |
|---|---|
| Drawing every code component | Group by scientific role and expose only interfaces needed for the claim. |
| Blindly sampling three styles | Filter by topology and available evidence before varying composition. |
| Adding plausible losses or modules | Include only source-confirmed content; mark gaps. |
| Three options share the same skeleton | Change the information topology: e.g. linear pipeline, closed loop, and contrast-plus-method. |
| Feedback arrow returns to the whole system | Return it to the exact state, selector, or failed step it updates. |
| Color carries several meanings | Assign color to one semantic dimension and reinforce state with line style, shape, or opacity. |
| Decorative result claims | Use a conceptual inset without numbers, or move measured results to the experiment-figure skill. |
| Treating a prompt as the finished figure | Keep the prompt, then produce and validate the requested editable artifact. |
| Flattening the entire figure into one image cell | Build native draw.io shapes and connectors so modules and labels remain editable. |
| Sending unpublished content to a hosted renderer silently | Prefer a local route; obtain user approval before using a hosted draw.io service for sensitive material. |
| Deleting `.drawio` after SVG/PDF/PNG export | Keep both the editable source and the requested export. |
