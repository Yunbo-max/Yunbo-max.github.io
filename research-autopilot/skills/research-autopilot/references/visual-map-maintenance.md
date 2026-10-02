# Visual exploration and map maintenance

Use for X and its links to P/I. The navigation KG describes task dependencies;
the research evidence KG describes papers/methods/claims/benchmarks/observations.
Keep identities and provenance distinct while linking relevant records.

## X01 Navigation and human goals

Show the whole task graph with region backgrounds and visible small-node edges.
Selecting a node shows inputs, outputs, acceptance, source skills, neighbors,
edge condition and payload. Offer search/filter/zoom and a textual alternative.
Overlay actual project position only from versioned imported project records,
with date and current decision. An example route is not a live job or an automatic
all-project scheduler. Link goals/preferences to chosen routes through P/I.
Human corrections should update a proposed route and retain decision history.

## X02 Visual reading

When relevant inspect actual PDF pages, figures/tables, appendices, UI screenshots
and code/log context. Save source/version, page/region locator, observed text/data,
interpretation, uncertainty and next check. Cross-check OCR against pixels for
critical symbols/values. Images are evidence only within what they actually show.
Generated reconstructions cannot replace source figures. Missing original image
or page is a gap, not permission to invent its contents.

## X03 Evidence-to-asset links

Connect observation to paper version, code/config/run, metric and raw result;
connect claim to exact evidence and artifact locations. Record inspected scope
and verified identity. Broken links or changed source digests mark affected
projections stale; don't silently resolve to unrelated newer content. Navigate
back to actual logs/paper rather than only a polished summary.

## X04 Bounded autonomous exploration

Define question, available surfaces/tools, hypotheses, exploration budget and
stop/return rules. Agents may inspect read-only artifacts and perform authorized
checks, retain unexpected observations and competing explanations, then return
to the requesting node. Search expansion is guided by information gaps, not
visual novelty or endless curiosity. Follow real browser/permission capabilities;
never infer a signed-in session. Distinguish observations from suggestions.

## X05 Proposing graph changes

Submit a versioned change proposal with trigger, new node/edge duties, existing
equivalents, inputs/outputs/acceptance, source skill content, relationship type,
condition, payload and affected routes. Deduplicate by function and retain old
IDs. Check orphan edges, cycles, joins and return-to-caller identity. Graph layout
changes are separate from adding legal state-machine routes/gates; changes to
actual execution schemas need implementation and validation. A public website
may display proposed relationships with an explicit design label.

## X06 Capability and source verification

For each node record content binding/version/hash, available adapter/tools, actual
task scope, validation evidence/date/environment and unresolved capability.
Separate authored norm, source-retrieval test, dry run, actual operation and
scientific support. Only actual receipts authorize completed-operation labels.
Run the node source checker after edits and rebind changed sections explicitly.
Never turn 84 source bindings into 84 executed/validated research tasks.
Publish only intended public graph data; private project notes need a deliberate
release scope. Preserve editable SVG/JSON and source-to-render correspondence.
