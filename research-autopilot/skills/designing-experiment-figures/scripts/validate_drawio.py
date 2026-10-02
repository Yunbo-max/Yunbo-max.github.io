#!/usr/bin/env python3
"""Validate uncompressed native draw.io XML before delivery."""

from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable

_EXTERNAL_URL = re.compile(r"https?://", re.IGNORECASE)


def _tag(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]


def _graph_models(root: ET.Element, errors: list[str]) -> list[ET.Element]:
    if _tag(root) == "mxGraphModel":
        return [root]
    if _tag(root) != "mxfile":
        errors.append("root must be mxfile or mxGraphModel")
        return []

    diagrams = [child for child in root if _tag(child) == "diagram"]
    if not diagrams:
        errors.append("mxfile must contain at least one diagram")
        return []

    models: list[ET.Element] = []
    for index, diagram in enumerate(diagrams):
        model = next((child for child in diagram if _tag(child) == "mxGraphModel"), None)
        if model is None:
            if (diagram.text or "").strip():
                errors.append(
                    f"diagram {index} is compressed or encoded; deliver uncompressed mxGraphModel XML"
                )
            else:
                errors.append(f"diagram {index} has no mxGraphModel")
        else:
            models.append(model)
    return models


def _numbers_are_nonnegative(cell_id: str, geometry: ET.Element, errors: list[str]) -> None:
    for name in ("width", "height"):
        raw = geometry.get(name)
        if raw is None:
            errors.append(f"vertex {cell_id} mxGeometry is missing {name}")
            continue
        try:
            value = float(raw)
        except ValueError:
            errors.append(f"vertex {cell_id} has non-numeric {name}")
            continue
        if value < 0:
            errors.append(f"vertex {cell_id} has negative {name}")


def _validate_model(model: ET.Element, model_index: int, errors: list[str]) -> None:
    graph_root = next((child for child in model if _tag(child) == "root"), None)
    if graph_root is None:
        errors.append(f"model {model_index} has no root")
        return

    cells = [cell for cell in graph_root.iter() if _tag(cell) == "mxCell"]
    ids: dict[str, ET.Element] = {}
    for cell in cells:
        cell_id = cell.get("id")
        if not cell_id:
            errors.append(f"model {model_index} contains mxCell without id")
            continue
        if cell_id in ids:
            errors.append(f"duplicate mxCell id: {cell_id}")
        else:
            ids[cell_id] = cell

    if "0" not in ids:
        errors.append(f"model {model_index} is missing root cell id 0")
    if "1" not in ids:
        errors.append(f"model {model_index} is missing default layer cell id 1")
    elif ids["1"].get("parent") != "0":
        errors.append(f"model {model_index} cell 1 must have parent 0")

    for cell_id, cell in ids.items():
        parent = cell.get("parent")
        if parent and parent not in ids:
            errors.append(f"cell {cell_id} references missing parent {parent}")

        is_vertex = cell.get("vertex") == "1"
        is_edge = cell.get("edge") == "1"
        if is_vertex and is_edge:
            errors.append(f"cell {cell_id} cannot be both vertex and edge")

        geometry = next((child for child in cell if _tag(child) == "mxGeometry"), None)
        if is_vertex:
            if geometry is None:
                errors.append(f"vertex {cell_id} requires mxGeometry")
            else:
                _numbers_are_nonnegative(cell_id, geometry, errors)

        if is_edge:
            for endpoint in ("source", "target"):
                ref = cell.get(endpoint)
                if ref and ref not in ids:
                    errors.append(f"edge {cell_id} references missing {endpoint} {ref}")
            if geometry is None or geometry.get("relative") != "1":
                errors.append(f"edge {cell_id} requires relative mxGeometry")


def _iter_strings(root: ET.Element) -> Iterable[str]:
    for element in root.iter():
        if element.text:
            yield element.text
        if element.tail:
            yield element.tail
        yield from element.attrib.values()


def validate_text(text: str, strict_local: bool = False) -> list[str]:
    errors: list[str] = []
    upper = text.upper()
    if "<!DOCTYPE" in upper:
        errors.append("DOCTYPE is forbidden")
    if "<!ENTITY" in upper:
        errors.append("ENTITY declarations are forbidden")
    if "<!--" in text:
        errors.append("XML comments are forbidden")

    try:
        root = ET.fromstring(text)
    except ET.ParseError as exc:
        errors.append(f"XML parse error: {exc}")
        return errors

    if strict_local and any(_EXTERNAL_URL.search(value) for value in _iter_strings(root)):
        errors.append("external URL is forbidden in strict-local mode")

    for index, model in enumerate(_graph_models(root, errors)):
        _validate_model(model, index, errors)
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--strict-local", action="store_true")
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    text = args.path.read_text(encoding="utf-8")
    errors = validate_text(text, strict_local=args.strict_local)
    if args.as_json:
        print(json.dumps({"valid": not errors, "errors": errors}, indent=2))
    elif errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
    else:
        print(f"VALID: {args.path}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
