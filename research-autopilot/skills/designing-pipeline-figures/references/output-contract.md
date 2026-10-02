# Pipeline figure Markdown output contract

Always create one `.md` design artifact. It must let the user compare three approaches and copy any one prompt directly into a production workflow. When the user requests an actual figure, also create the production package defined below; the Markdown artifact remains the scientific and visual source of truth.

## Required document structure

```markdown
# <Method Name> - Pipeline Figure Design

## A. Scientific Ground Truth
### Three-second claim
### Confirmed components and order
### Confirmed loops, branches, and training signals
### Exact notation and labels
### Unresolved items

## B. Three Candidate Visualizations
| Option | Topology | Visual center | Best at showing | Main risk |
| ... |

**Recommendation:** <option and scientific reason>

## C. Option 1 - <descriptive name>
### Design rationale
### Standalone generation prompt
<complete prompt>
### Caption draft

## D. Option 2 - <descriptive name>
...

## E. Option 3 - <descriptive name>
...

## F. Cross-option fidelity checklist

## G. Production manifest
<include when an actual figure is requested>
```

## Scientific ground truth

Separate source status explicitly:

- `CONFIRMED`: directly supported by the supplied figure, paper, code, or user statement.
- `ILLUSTRATIVE`: a generic visual example used only to make the mechanism visible.
- `TO CONFIRM`: necessary detail that is missing, unreadable, or inconsistent.

Never convert `ILLUSTRATIVE` or `TO CONFIRM` content into an asserted result. Preserve exact capitalization of method names, datasets, losses, variables, and module labels.

## Candidate requirements

Each candidate must:

1. use a different macro-topology;
2. preserve the same scientific facts and main claim;
3. name its visual center;
4. say what it emphasizes and what it compresses;
5. identify one failure risk, such as arrow congestion, microtext, weak baseline contrast, or overloaded color;
6. be compatible with the actual method structure.

Constrained randomization means rotating among compatible styles. It does not mean inventing branches, objectives, modalities, training stages, or quantitative outcomes.

## Standalone prompt anatomy

Write every prompt as continuous, precise design instructions containing all of the following.

### 1. Purpose and takeaway

- Figure number and intended venue style if known.
- One sentence stating the complete scientific narrative.
- What must be understood within three seconds.

### 2. Canvas and global composition

- Aspect ratio or approximate dimensions.
- Paper placement: single-column, double-column, or full-width.
- Outer background and major region proportions.
- Reading direction and primary visual center.

### 3. Region-by-region specification

For every region state its exact header, scientific role, contained objects, exact or shortened labels, input, transformation, state update, output, which objects are concrete examples versus abstractions, and relative size and alignment.

Describe meaningful micro-visuals: tokens, matrices, frames, trees, traces, memories, gates, meters, plots, or example states. Do not substitute a generic neural-network icon for the method's actual novelty.

### 4. Flow and state semantics

Specify the principal forward path, branches and merge points, feedback destination, real versus imagined transitions, training-only versus inference-time paths, accepted/rejected/skipped/uncertain states, line styles, and arrow labels.

Keep one dominant backbone. Avoid independent arrows between every pair of cards.

### 5. Mathematical content

Include only equations or symbols that clarify control, state, objective, or selection. Use the paper's exact notation. Prefer one compact equation or micro-matrix over a derivation. If notation is not confirmed, write `[TO CONFIRM: exact equation]`.

### 6. Visual system

Define one restrained academic palette with semantic assignments; font hierarchy; border, corner, shadow, and grid rules; color-independent redundancy through shape, line style, hatch, border, or opacity; and minimum readability after reduction.

### 7. Exact text list

List all labels that must appear verbatim. Keep module text short; move explanations to the caption.

### 8. Negative constraints

Explicitly prohibit likely failure modes relevant to the chosen design: fabricated numbers, unsupported modules, giant brains, generic dashboards, commercial logos, black backgrounds when printability matters, glossy 3D, decorative arrows, dense prose, tiny rotated text, duplicated modules, tangled connectors, inconsistent notation, or misleading color semantics.

### 9. Final fidelity sentence

End with a short instruction that the generated figure must preserve the confirmed module order, branches, loops, and distinction between real, imagined, selected, rejected, training, and inference states.

## Caption draft

State the problem or input, transformation and core novelty, loop/decision if present, output or consequence, and meaning of any non-obvious line style or color. Do not place claims in the caption that are absent from the figure or source.

## Editable production package

When production is requested, create:

```text
<figure-slug>-design.md
<figure-slug>-prompt.md
<figure-slug>.drawio
<figure-slug>.drawio.svg|png|pdf   # only the requested or venue-required export
<figure-slug>-provenance.yaml
```

- Keep all three candidate prompts in the design artifact. Copy the selected prompt verbatim into the separate prompt file.
- Render the user's selection. If the user requested immediate generation without selecting, render the documented recommendation. Produce all three only when explicitly requested.
- Preserve the `.drawio` file after export even when the export embeds the XML.
- Record source artifacts, fact-lock status, selected option, authoring format, backend, layout/routing pass, export method, privacy route, and validation level in provenance.
- If an export cannot be produced locally, deliver the validated `.drawio` and prompt/specification, state the missing capability, and do not fabricate an export.
- Follow [drawio-production.md](drawio-production.md) for backend routing, privacy, validation, and visual QA.

## Final checklist

- Can a reader trace input to output without reading the caption?
- Is the novelty the strongest visual object?
- Are there exactly three meaningfully different candidates?
- Does every arrow have a scientific interpretation?
- Does every feedback arrow land on the component actually updated?
- Are real, imagined, selected, rejected, training, and inference states distinguishable where relevant?
- Are all numbers and equations confirmed?
- Are illustrative elements explicitly non-empirical?
- Will labels remain legible at final paper width?
- Could any panel be removed without weakening the claim? If yes, simplify.
- If produced, does the native file contain editable shapes, text, and connectors rather than one flattened image?
- Does the separate prompt exactly match the rendered option?
- Were structural validation and visual/render verification reported separately and truthfully?
