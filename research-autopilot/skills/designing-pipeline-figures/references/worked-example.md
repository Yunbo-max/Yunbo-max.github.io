# Worked example: active multimodal evidence acquisition

## Input brief

> A multimodal agent builds a cheap global preview, estimates evidence utility and epistemic uncertainty, selectively observes video/audio/text regions under token budget B, reasons with evidence references, and uses a process verifier. Failed verification requests targeted re-observation. Training combines task reward, grounding reward, and token cost.

## Fact lock

| Status | Content |
|---|---|
| CONFIRMED | cheap preview; utility and uncertainty; token budget; selective observation; evidence-linked reasoning; verifier; targeted re-observation; three reward terms |
| ILLUSTRATIVE | specific video frames, audio events, transcript wording, evidence IDs |
| TO CONFIRM | exact selector equation; modality-specific encoders; whether verification is learned or rule-based |

Three-second claim: **The agent spends limited computation only on evidence that can resolve its current uncertainty, and unsupported reasoning triggers localized observation rather than a full restart.**

## Candidate matrix

| Option | Topology | Visual center | Best at showing | Risk |
|---|---|---|---|---|
| A | linear evidence backbone plus localized feedback | selective evidence funnel | end-to-end clarity | can understate repeated reasoning |
| B | controller loop around persistent evidence state | verifier-controlled loop | agentic adaptivity | circular routing can become crowded |
| C | baseline lane over proposed lane plus training foundation | compute contrast | why selection matters | requires a carefully bounded conceptual baseline |

Recommendation: **A**, because the method's most distinctive dependency is broad preview -> narrow acquisition -> evidence-linked verification, with only one necessary return loop.

## Excerpt from a standalone prompt

Create a full-width publication-quality Figure 1 on a bright warm-white background. The complete narrative must read left to right in three seconds: coarse multimodal preview, utility-and-uncertainty scoring, budgeted evidence acquisition, evidence-linked reasoning, process verification, and either a grounded answer or targeted re-observation. Make the selective evidence funnel the largest and most saturated object.

Divide the canvas into three softly tinted regions. In the left region, align an illustrative video filmstrip, audio waveform, and transcript on one shared time axis; mark these examples `schematic episode` and do not imply benchmark data. Route all modalities into a small `Global Preview` module and emit pale candidate tokens. In the center, place `Evidence Utility` and `Epistemic Uncertainty` above a `Budget Controller (B)`. Highlight only a few candidate regions and pass them through a narrowing funnel into an `Evidence Pack`; skipped items remain visible at low opacity. In the right region, show `Observe -> Infer -> Answer`, with each step carrying an evidence badge, beside a `Process Verifier`. A solid green `Pass` arrow reaches `Grounded Answer`; one coral dashed `Re-observe` arrow returns to the uncertainty scorer and names the missing evidence request.

Across the bottom, add a narrow training lane containing only the confirmed terms `Task Reward`, `Grounding Reward`, and `Token Cost`. Do not invent a combined equation unless the author confirms its exact form. Use solid arrows for inference flow, a dashed coral arrow for re-observation, and thin upward dashed arrows for training supervision. Use color for modality identity and line style/border for state; do not use color alone for both modality and correctness.

Use short horizontal labels, one modern type family, restrained pastel fills, charcoal outlines, minimal shadow, and enough whitespace for two-column reduction. Avoid a dark dashboard, generic brain icon, fabricated timestamps or token counts, unsupported encoder modules, decorative arrows, and any numerical performance claim. Preserve the confirmed order and make all illustrative episode content visibly schematic.

This excerpt demonstrates the required precision. A delivered option must additionally contain its full canvas dimensions, exact text list, color assignments, caption, negative constraints, and final fidelity check as specified in `output-contract.md`.
