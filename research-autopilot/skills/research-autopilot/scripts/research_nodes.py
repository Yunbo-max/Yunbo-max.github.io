"""Read-only node navigation and exact retrieval from installed personal skills."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

SKILL = Path(__file__).resolve().parents[1]
REGISTRY = SKILL / "assets/research-nodes.json"


class SourceError(ValueError):
    pass


def load_registry(path=REGISTRY):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def extract_section(text, heading):
    """Include descendants; ignore heading-shaped text inside fenced examples."""
    lines = text.splitlines(keepends=True)
    headings = []
    fence = None
    for i, line in enumerate(lines):
        match = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if match:
            marker = match.group(1)
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
            continue
        if fence is None:
            match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
            if match:
                headings.append((i, len(match.group(1)), line.rstrip("\r\n")))
    matches = [(i, depth) for i, depth, title in headings if title == heading]
    if len(matches) != 1:
        raise SourceError(f"heading_not_unique_or_missing: {heading}")
    start, depth = matches[0]
    end = next((i for i, d, _ in headings if i > start and d <= depth), len(lines))
    return "".join(lines[start:end])


def find_skill(name, skills_root):
    matches = []
    for path in sorted(Path(skills_root).glob("*/SKILL.md")):
        text = path.read_text(encoding="utf-8")
        front = text.split("---", 2)
        if len(front) == 3 and re.search(r"^name:\s*[\"']?" + re.escape(name) + r"[\"']?\s*$", front[1], re.M):
            matches.append(path.parent)
    if len(matches) != 1:
        raise SourceError(f"installed_skill_not_unique_or_missing: {name}")
    return matches[0]


def read_source(catalog, binding, skills_root=None):
    source_id = binding["source"]
    source = catalog[source_id]
    relative = Path(source["path"])
    if relative.is_absolute() or ".." in relative.parts:
        raise SourceError(f"unsafe_source_path: {source_id}")
    directory = find_skill(source["skill"], skills_root or SKILL.parent)
    path = directory / relative
    if any(p.is_symlink() for p in [directory, *[directory.joinpath(*relative.parts[:i]) for i in range(1, len(relative.parts) + 1)]]):
        raise SourceError(f"unsafe_source_path: {source_id}")
    if not path.is_file():
        raise SourceError(f"source_missing: {source_id}: {path}")
    section = extract_section(path.read_text(encoding="utf-8"), binding["heading"])
    if hashlib.sha256(section.encode("utf-8")).hexdigest() != binding["sha256"]:
        raise SourceError(f"source_changed: {source_id}: {binding['heading']}")
    return path, section


def get_node(registry, node_id):
    matches = [node for node in registry["nodes"] if node["id"] == node_id]
    if len(matches) != 1:
        raise SourceError(f"unknown_node: {node_id}")
    return matches[0]


def entry_path(node):
    path = Path(node["entry"])
    if path.is_absolute() or ".." in path.parts:
        raise SourceError(f"unsafe_entry_path: {node['id']}")
    return SKILL / path


def show(registry, node_id):
    node = get_node(registry, node_id)
    # Resolve and verify every binding before emitting any source as current.
    sections = [(binding, *read_source(registry["source_catalog"], binding)) for binding in node["sources"]]
    output = [entry_path(node).read_text(encoding="utf-8")]
    for binding, path, section in sections:
        source = registry["source_catalog"][binding["source"]]
        output.append(f"\n---\n原文：{source['skill']} / {source['path']} / {binding['heading']}\n实际路径：{path}\n\n{section}")
    return "\n".join(output)


def validate(registry):
    errors = []
    ids = [node["id"] for node in registry["nodes"]]
    if len(set(ids)) != len(ids):
        errors.append("duplicate_node_id")
    expected_ids = {group[0] + row[0] for group in registry["groups"] for row in group[3]}
    if set(ids) != expected_ids:
        errors.append("group_node_mismatch")
    for node in registry["nodes"]:
        try:
            if node["coverage"] not in {"detailed", "partial", "missing"}:
                raise SourceError("unknown_coverage")
            if node["coverage"] == "missing" and node["sources"]:
                raise SourceError("missing_node_has_sources")
            if node["coverage"] != "missing" and not node["sources"]:
                raise SourceError("covered_node_has_no_sources")
            if node["coverage"] != "detailed" and not node["gaps"]:
                raise SourceError("gap_not_declared")
            text = entry_path(node).read_text(encoding="utf-8")
            if not text.startswith(f"# {node['id']} "):
                raise SourceError("entry_identity_mismatch")
            for field in ("inputs", "outputs", "acceptance"):
                if node[field] not in text:
                    raise SourceError(f"entry_contract_missing: {field}")
            for binding in node["sources"]:
                read_source(registry["source_catalog"], binding)
        except (SourceError, OSError, KeyError) as exc:
            errors.append(f"{node['id']}: {exc}")
    edge_ids = [edge["id"] for edge in registry["edges"]]
    if len(set(edge_ids)) != len(edge_ids):
        errors.append("duplicate_edge_id")
    for edge in registry["edges"]:
        if edge["from"] not in ids or edge["to"] not in ids:
            errors.append(f"orphaned_edge: {edge['id']}")
    return {"node_count": len(ids), "region_count": len(registry["groups"]),
            "edge_count": len(registry["edges"]),
            "coverage_counts": dict(Counter(node["coverage"] for node in registry["nodes"])),
            "errors": errors,
            "scope": "source traceability and navigation; not execution or scientific validation"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["show", "check", "list"])
    parser.add_argument("node", nargs="?")
    args = parser.parse_args()
    try:
        registry = load_registry()
        if args.command == "show":
            if not args.node:
                parser.error("show requires a node ID")
            print(show(registry, args.node))
        elif args.command == "check":
            report = validate(registry)
            print(json.dumps(report, ensure_ascii=False, indent=2))
            return bool(report["errors"])
        else:
            print(json.dumps([{k: n[k] for k in ("id", "name", "coverage", "entry", "gaps")} for n in registry["nodes"]], ensure_ascii=False, indent=2))
    except (SourceError, OSError, KeyError, json.JSONDecodeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
