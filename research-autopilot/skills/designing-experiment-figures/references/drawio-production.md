# Draw.io assembly for scientific experiment figures

Use this reference only when the user requests an editable draw.io composite, a vector export, or a mixed result-and-mechanism figure. The official implementation source is [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp). Draw.io is an assembly and annotation layer here; it is not the source of quantitative marks.

## Authority split

```text
verified data + plotting script
        -> exact SVG/PDF panels
        -> draw.io composition and annotation
        -> final export
```

- Source data and plotting code control values, axes, marks, error bars, fits, scales, and legends.
- Draw.io controls panel position, gutters, panel letters, explanatory callouts, arrows, qualitative examples, and schematic insets.
- If a numeric mark must move or change, modify the data or plotting code and regenerate the panel. Never drag a bar, point, interval, curve, or heatmap cell into a more favorable position.
- An imported chart panel may be composition-editable without making its individual data marks editable. State this distinction accurately.

## When draw.io is appropriate

Use it for:

- multi-panel assembly with heterogeneous evidence;
- a code-rendered result panel plus a mechanism schematic;
- aligned qualitative cases with explanatory annotations;
- reviewer-oriented callouts or zoomed regions;
- a venue-sized composite requiring editable layout.

Skip it for a simple chart that plotting code can produce directly, unless the user explicitly requests a `.drawio` source.

## Capability router

Inspect available tools before choosing a backend. Do not install an MCP server, plugin, package, or desktop application unless the user asks for setup.

1. **Official draw.io MCP App tools available**: use `create_diagram`; use `search_shapes` only for a justified specialized schematic element.
2. **Official draw.io MCP Tool Server available**: use `open_drawio_xml` for precise assembly. `open_drawio_mermaid` is usually inappropriate for heterogeneous result panels.
3. **Official draw.io assistant skill or Desktop CLI available**: write native XML and export PNG/SVG/PDF with embedded XML when supported.
4. **No draw.io runtime available**: keep the code-rendered panels; when native assembly is explicitly required, write uncompressed `.drawio` XML locally and run `python3 scripts/validate_drawio.py <file.drawio> --strict-local`. Describe it as structurally validated, not render-verified.

Always retain the `.drawio` source. Do not treat a browser URL as the persistent artifact.

## Privacy route

- Default unpublished results, reviewer material, private datasets, and proprietary findings to a local backend.
- The hosted MCP App endpoint receives diagram content. Ask before sending sensitive material to it.
- Avoid remote validators, cloud converters, external image URLs, or external fonts for strict-local work.
- Keep chart panels local and embed them in the `.drawio` when strict portability is needed.
- Uncompressed `.drawio` and embedded source data are readable plaintext; include raw data only when intended.

## Assembly rules

- Prefer draw.io XML for exact panel placement and scientific annotations.
- Preserve each imported chart's aspect ratio and do not crop axes, uncertainty, legends, or negative results.
- Use stable panel IDs and explicit labels such as `(a)`, `(b)`, and `(c)`.
- Keep a minimum readable font size after final reduction. Regenerate charts at the target dimensions rather than enlarging raster output.
- Use vector SVG/PDF panels where possible. Do not rasterize solely to simplify assembly.
- Do not cover inconvenient values with callouts, masks, white rectangles, or cropped viewports.
- Native tables remain editable tables in the manuscript; do not turn them into diagram images.

## Native XML and layout

Use a full uncompressed `<mxfile compressed="false">` with individual editable composition objects. Include root cells `id="0"` and `id="1" parent="0"`, unique IDs, valid parents, and relative edge geometry. Escape XML attribute text. Do not include XML comments, DTDs, entities, scripts, untrusted HTML, or external assets.

Use deliberate placement for heterogeneous panels. If connectors cross content, use libavoid routing. Do not apply ELK to a finished result composite because it may reorder panels and destroy the evidence hierarchy.

## Artifact package

```text
<figure-slug>-design.md
<figure-slug>-prompt.md
<figure-slug>-data.csv|json
<figure-slug>-plot.py|R
<figure-slug>-panel.svg|pdf
<figure-slug>.drawio
<figure-slug>.drawio.svg|png|pdf
<figure-slug>-provenance.yaml
```

Suggested provenance fields:

```yaml
figure:
selected_option:
source_data: []
plot_script:
panel_files: []
assembly_backend: mcp-app | mcp-tool | plugin-cli | local-xml | none
privacy_route: local | hosted-approved
validation:
  numeric_recomputation:
  plot_regeneration:
  drawio_structure:
  drawio_open:
  export:
  visual_full_size:
  visual_paper_width:
```

## Validation ladder

1. Recompute reported derived values when inputs are available.
2. Regenerate every numeric panel from the retained script and data.
3. Compare plotted values, uncertainty, axis direction, and selection rules against the evidence inventory.
4. Validate native draw.io structure with the bundled validator.
5. When a draw.io runtime exists, open the composite and confirm panel and annotation editability.
6. Export and inspect at full resolution and intended paper width.
7. Confirm draw.io assembly did not crop, rescale non-uniformly, hide, or alter quantitative evidence.

Structural validation does not prove numerical or visual fidelity. Never claim a verification level that was not executed.

## Prohibitions

- No manually drawn quantitative bars, points, lines, intervals, matrices, or heatmap cells.
- No hand-adjusted error bars or labels that change interpretation.
- No synthetic raw samples reconstructed from aggregates.
- No hidden negative results beneath insets or annotations.
- No flattened replacement of the retained data and plotting script.
- No deletion of the `.drawio` source after export.
