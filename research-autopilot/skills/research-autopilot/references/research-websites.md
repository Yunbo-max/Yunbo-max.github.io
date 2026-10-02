# Research websites and interactive paper explanations

Contents: scope and styles; Project Page subnodes; scientific interactions;
website handoff; delivery checks; maintenance.

## Scope and style

Use the latest supplied manuscript, code/configuration and result packet. Resume
an existing website when identified. Infer audience and purpose from the request;
ask only for a missing choice that changes the next useful step. Respect design,
build, local-preview and publication scope already expressed by the user.

Keep the reference patterns separate from the paper's scientific evidence:

| Pattern | Reference | Reusable experience | Main preparation |
| --- | --- | --- | --- |
| Results showcase | [ActionMesh](https://remysabathier.github.io/actionmesh/) | Clear contribution, paper/code links, input/output galleries, baseline comparisons, recorded video or animated 3D viewers | Actual outputs, comparison conditions, media exports and loading budget |
| Interactive explanation | [Richard Xu, Multi-Head Attention](https://ai.richardxu.com/ml/#/m/transformer/mha) | Topic navigation, formulas, code walkthroughs, manipulable examples and linked source material | A faithful small computation, meaningful controls and a visible explanation of the output |
| Combined paper site | Both patterns | A concise results-led landing page followed by a method explainer, evidence and reproducibility | One consistent claim/source packet across all sections |

These pattern observations were checked on 2026-10-02. Reinspect a reference if a
new request depends on its current detailed behavior. Borrow presentation patterns;
use the user's own scientific text, media and assets.

For a paper that benefits from both styles, prefer the combined mode. Let readers
first see the research problem and contribution, then operate one example that
explains why the method works, then inspect supporting results and boundaries.
Choose a focused showcase when visuals carry the contribution; choose an explainer
when the key contribution is a mathematical or computational distinction.

## Project Page subnodes and connections

Expand the research map's `C01` Project Page node into the tasks below. Treat these
IDs as design/navigation labels, not legal values for `current_route`,
`lifecycle_phase` or `transition_state.py`. This reference defines the connections;
it does not claim an interactive map or automatic scheduler is implemented.

| Subnode | Inputs | Output | Incoming and outgoing connections |
| --- | --- | --- | --- |
| `C01.scope` | Audience, purpose, manuscript, existing site and user scope | Chosen style and reader goal | Project context → scope → story and interaction |
| `C01.story` | Supported claims, problem, strongest evidence, limitations | Section outline and claim-to-section map | Claims/manuscript → story → source packet and implementation |
| `C01.interaction` | Actual method, equations, code and a discriminating example | Controls, computation, states, explanation and expected boundary behavior | Method design/figures → interaction → implementation and checks |
| `C01.sources` | Figures, result data, cases, licenses and release identities | Versioned content/media inventory and result provenance | Figure/result nodes → sources → implementation and release |
| `C01.implementation` | Story, interaction and sources | Working responsive website or requested design handoff | Prior tasks → implementation → checks |
| `C01.checks` | Rendered page, computations and source mappings | Content, interaction and device acceptance record | Implementation + scientific evidence → checks → release or repair |
| `C01.release` | Accepted version and authorized destination | URL, editable source and linked paper/code/demo versions | Checks + unified release manifest → release → feedback/maintenance |

Keep node-level dependencies explicit rather than imposing one sequence over all
research regions. Story and interaction work can proceed independently after scope;
implementation uses the source packet needed by its first coherent slice.

Connect claim changes directly to affected story/results sections; method changes
to the interaction and method animation; data changes to charts and example cases;
paper/code/model release changes to downloads and version labels. Route an actual
scientific contradiction back to evidence repair. A broken link or layout stays a
website repair and does not reopen scientific validation.

## Design a scientific interaction

Write each interaction as a small contract: reader question; input/controls;
source equation or implementation locator; visible computation/output; what the
reader should learn; boundaries and expected behavior. Pick a control that exposes
the paper's core distinction or failure mode. Keep exact charts, diagrams and
computations in deterministic code, SVG or suitable rendering libraries.

Classify every demonstration:
- **Recorded result:** load retained outputs; provide the task/example identity,
  method/checkpoint version and evaluation conditions.
- **Browser teaching example:** compute a small example from the real equation;
  label it illustrative. A slider's counterfactual output is not a measured
  benchmark result or evidence of effectiveness.
- **Live inference:** execute the actual model through an available authorized
  service; describe inputs, runtime and limits. Plan the model integration only
  when requested, with available capability and an agreed resource scope.

Browser explanations and playback of existing videos or 3D files usually do not
need a hosted model. Choose these when they satisfy the reader's question. For a
3D paper, load actual exported animated meshes; for a speech paper, use actual
audio samples; for a code paper, show retained implementations and test outcomes.

Example: for an effective-evidence method, use four observations with the same
outcome category. Uniform relevance `p=(1/4,1/4,1/4,1/4)` gives
`E(p)=1/sum(p_i^2)=4`; concentrated relevance `p=(1,0,0,0)` gives `E(p)=1`.
Show the unchanged relative category support alongside the changing evidence mass
and `Dir(alpha + E(p) r)` parameters. Handle zero total weight explicitly according
to the actual method; do not silently normalize an undefined vector. Treat this
as an algebraic illustration, with empirical validation shown separately.

For other papers, derive the example afresh from their actual sources: a
self-distillation site can link round/method selection to real correctness,
diversity and code examples; a recurrent-state diffusion site can step through
denoising, state writes and decoding using the implemented shapes and operations.
These are starting points, not hardcoded claims or required interactions.

## Website handoff

Reuse a current validated research `handoff` when present. Put website-specific
instructions in its optional `website` object; retain the root's existing claims,
limitations, negative evidence, provenance and snapshot references. Record the
website brief/assets as digest-bearing `source_refs` where applicable.

When no validated handoff exists, prepare a design from the available manuscript
and explicitly identify statements as manuscript-reported or unverified. Record
the missing source obligations and next action. Do not fabricate a validation PASS,
run experiments simply to make a website, or inflate a paper's reported claims.
Complete the applicable existing evidence-closure handoff before certifying
scientific claims for release.

The website brief must contain:

| Field | Content |
| --- | --- |
| `purpose`, `audience`, `style`, `scope` | Reader goal, language, showcase/explainer/combined mode, design/build/publication request |
| `source_versions` | Manuscript identity/date, code revision, evidence snapshot and site/model versions when present |
| `sections` | Ordered sections with their claim IDs, source locators and intended takeaway |
| `interactions` | Reader question, controls, formula/code locator, execution kind, expected boundary behavior and labels |
| `assets` | Real figures/data/media, source and reuse information, display format and loading constraints |
| `result_provenance` | Metric definition/direction, benchmark/split, method/baseline settings, uncertainty and raw data/output locators |
| `acceptance` | Scientific, interaction, loading, responsive and accessibility checks with observed results |
| `release`, `maintenance` | Destination/status, linked artifact versions, source-to-section dependencies, changed/stale items and next action |

A reusable page outline is: problem and contribution → interactive concrete
example → method walkthrough → main results and comparisons → limitations and
failure cases → reproducibility, paper/code/data/demo links and citation.
Adjust it to the paper rather than filling every section mechanically. Keep
implementation details out of reader flows unless they explain a meaningful
scientific or usage choice.

The `website` object is an optional extension, not a new registered schema or state
transition. Existing validators check the enclosing handoff; they do not validate
website computations, page content or these additional fields. Review those with
this contract and actual rendering/interaction checks.

## Delivery and acceptance

For building, use sites-building and sites-hosting when available and applicable;
follow an explicitly chosen provider or the existing website's workflow. If no
building capability is available, deliver the complete design and identify the
unavailable implementation step. Honor an already authorized publication request
without requesting it again; design-only work stops at the requested design.

Check the actual website before claiming delivery:
- Trace each scientific statement, number and ranking to the permitted source
  version. Keep units, metric direction, comparison conditions, uncertainty and
  evidence limitations visible where needed to interpret the result.
- Check a teaching computation against its source at representative values and
  boundaries. Verify controls actually change the intended state and explanation.
- Verify generated media are conceptual only; result plots use actual data, and
  demonstrations of task outcomes use actual retained outputs.
- Inspect desktop and mobile reading, keyboard/touch controls, readable math and
  plots, loading/fallback states, downloads and external links.
- Verify publication and the linked release versions when publication is in scope.
  Record design, implemented, tested and published status separately.

## Maintenance and feedback

On a paper/result/method update, inspect the latest authoritative assets and use
the source-to-section mapping to identify affected text, formulas, interactions,
charts, cases and links. Mark dependent content stale until checked against the new
version, then rebuild/check/publish the affected site within authorized scope.
Preserve prior source snapshots. Do not rerun unrelated research or passed checks.

Feed replication failures or new counterexamples back to the existing research
evidence obligations. Feed audience questions back to explanation design. Use
scheduled refresh only when the user asks for recurring work. Retain the published
URL, editable source location, paper/code/model versions, checks and next action
so the next invocation can resume.
