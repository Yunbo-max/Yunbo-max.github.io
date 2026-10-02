# Draw.io production for scientific pipeline figures

Use this reference only when the user requests an actual editable figure, an export, or a revision to an existing draw.io artifact. The official implementation source is [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp). Use its canonical [XML reference](https://raw.githubusercontent.com/jgraph/drawio-mcp/main/shared/xml-reference.md) and [Mermaid reference](https://raw.githubusercontent.com/jgraph/drawio-mcp/main/shared/mermaid-reference.md) when those authoring modes are used.

## Production contract

The design Markdown and selected standalone prompt remain mandatory. Production adds a native `.drawio` source, the requested export when available, and provenance. Native editability means individual shapes, labels, containers, and connectors remain editable. A single embedded PNG or SVG is not a native editable scientific diagram.

## Capability router

Inspect the available tools before choosing a backend. Do not install an MCP server, plugin, package, or desktop application unless the user asks for setup.

1. **Official draw.io MCP App tools available**
   - Use `search_shapes` only for a justified specialized shape; ordinary scientific blocks do not need it.
   - Use `create_diagram` with draw.io XML for inline rendering.
2. **Official draw.io MCP Tool Server tools available**
   - Prefer `open_drawio_xml` for precise scientific figures.
   - Use `open_drawio_mermaid` only for a standard topology that does not require precise tensor, state, or panel placement.
   - Use `list_pages`, `get_page`, and `set_page` for targeted edits to an existing multi-page file when exposed.
3. **Official draw.io assistant skill or Desktop CLI available**
   - Use native XML directly, or convert Mermaid to `.drawio` before export.
   - Export PNG/SVG/PDF with embedded XML when supported.
4. **No draw.io runtime available**
   - Write uncompressed native `.drawio` XML locally.
   - Run `python3 scripts/validate_drawio.py <file.drawio> --strict-local` for confidential/local-only work.
   - Describe it as structurally validated, not render-verified. If a separate SVG is produced by another local renderer, label it as an independent rendering unless draw.io XML is actually embedded.

Do not treat a browser URL as the persistent artifact. Always retain the native file.

## Privacy route

- Default unpublished manuscripts, proprietary methods, reviewer materials, and non-public results to local MCP, local plugin/CLI, or local XML generation.
- The hosted MCP App endpoint receives diagram content. Ask before sending sensitive material to it.
- The local MCP Tool Server carries the diagram in the browser URL fragment, but still loads editor code unless a self-hosted base URL is configured. Use a fully local route when strict isolation is required.
- Never use remote validators, cloud converters, external image URLs, or external fonts for strict-local production.
- Uncompressed `.drawio` is readable plaintext, not encryption.

## Authoring choice

Prefer **draw.io XML** for publication architecture figures because it supports precise containers, state ports, tensor strips, train/inference lanes, exact styling, and hand-controlled hierarchy.

Use **Mermaid** only when the topology is standard and semantic compression is more important than precise placement. Convert it to native `.drawio` before delivery; do not treat `.mmd` as the final artifact.

For XML output:

- Deliver a full uncompressed `<mxfile compressed="false">` containing a `<diagram>` and `<mxGraphModel>`.
- Include root cells `id="0"` and `id="1" parent="0"`.
- Use unique IDs, valid parents, editable vertex cells, and connected edge cells with relative geometry.
- Escape XML attribute text. Do not emit XML comments, DTDs, entities, scripts, untrusted HTML, or external assets.
- Store semantic status such as `CONFIRMED`, `ILLUSTRATIVE`, and `TO CONFIRM` through stable style/layer choices and provenance, not invisible prose alone.

## Layout and routing

- Use one layout pass, not two. ELK repositions vertices and routes edges; libavoid preserves deliberate node positions and only reroutes connectors.
- Prefer deliberate placement plus libavoid for a carefully composed Figure 1.
- Prefer ELK for a simple layered dependency graph or when initial coordinates are intentionally approximate.
- Never let auto-layout reorder scientific stages, merge distinct paths, or detach a feedback arrow from its actual update target.

## Artifact package

```text
<figure-slug>-design.md
<figure-slug>-prompt.md
<figure-slug>.drawio
<figure-slug>.drawio.svg|png|pdf
<figure-slug>-provenance.yaml
```

Suggested provenance fields:

```yaml
figure:
selected_option:
source_artifacts: []
fact_lock:
authoring_format: drawio-xml | mermaid-to-drawio
backend: mcp-app | mcp-tool | plugin-cli | local-xml
layout_pass: none | elk | libavoid
privacy_route: local | hosted-approved
validation:
  xml_structure:
  drawio_open:
  export:
  visual_full_size:
  visual_paper_width:
```

## Validation ladder

1. Run the bundled structural validator and fix every reported error.
2. When a draw.io runtime exists, open the native file and confirm all objects remain editable.
3. Export the requested preview with embedded XML when supported.
4. Inspect the rendering at full resolution and at intended paper width.
5. Compare every module, label, equation, branch, loop, and line meaning against the fact lock.
6. Re-open the exported embedded file when possible to verify editability.

Structural validation does not prove visual quality. Never claim render, export, or round-trip verification unless that operation was actually performed.

## Scientific prohibitions

- Do not add a module because the shape library contains an attractive icon.
- Do not substitute branded cloud or neural icons for the paper's actual mechanism.
- Do not draw measured bars, curves, intervals, matrices, or heatmap values manually in draw.io.
- Do not flatten the whole figure into one image cell.
- Do not delete the native source after export.
- Do not silently replace unresolved facts with aesthetically convenient arrows.
