"""Publish a module directory from an owned research node registry.

Usage: python scripts/build-research-atlas.py --registry /path/to/research-nodes.json
Only public module labels, node IDs and connection topology are exported.
"""
import argparse
import hashlib
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = [
    ('P', 'Projects & resources', 'Projects', '#9eb388', 'Set research goals, inventory project assets, choose priorities, and plan time, GPU capacity and collaboration.'),
    ('I', 'Research entry & direction', 'Direction', '#dfb66d', 'Start from a question, working method, results or reviews. Identify the current decision, contribution type, venue and stopping criteria.'),
    ('L', 'Literature & implementation', 'Literature', '#91bfa7', 'Keep reading papers alongside actual code, supplementary material and benchmark protocols. Update the literature map when new results change the question.'),
    ('B', 'Tasks, benchmarks & failures', 'Benchmarks', '#d4a78b', 'Define the task and native scoring, qualify strong simple baselines, and establish their genuine remaining failures before proposing a method.'),
    ('H', 'Ideas & critical review', 'Ideas', '#c7bb84', 'Turn remaining failures into competing explanations, falsifiable claims and decisive predictions. Check necessity, novelty and nearby work.'),
    ('M', 'Methods & mathematics', 'Methods', '#92afb9', 'Connect an intervention to its expected mechanism. Make the mathematics computable, define the algorithm, and examine complexity and assumptions.'),
    ('S', 'Models, data & setup', 'Setup', '#b8aa9a', 'Choose existing benchmarks, inspect data and splits, select models, and freeze fair comparisons and complete run configurations.'),
    ('G', 'Decisive experiment design', 'Experiments', '#d1bb7b', 'Design the experiment that can distinguish the candidate explanation from its alternatives. Freeze controls, scoring, precision, budget and decision rules.'),
    ('E', 'Engineering & debugging', 'Engineering', '#c49783', 'Fix environments and dependencies, check implementation semantics, manage execution, and diagnose bugs or parameter sensitivity while retaining failed runs.'),
    ('V', 'Validation & boundaries', 'Validation', '#a8bba2', 'Connect every claim to evidence: repeated comparisons, mechanism checks, ablations, generalization, cost, failures and statistical uncertainty.'),
    ('W', 'Writing & result-driven revision', 'Writing', '#b9b0cd', 'Build the paper around supported claims. Develop the narrative, sections and sentences, and propagate new findings through the manuscript.'),
    ('F', 'Figures & manuscript checks', 'Figures', '#d0b696', 'Create method figures and editable result plots from identified evidence. Check captions, references, readability and consistency in the compiled manuscript.'),
    ('R', 'Submission, review & rebuttal', 'Review', '#b0c4bc', 'Prepare the submission, track reviewer questions, prioritize justified follow-up experiments, write responses and manage final decisions or resubmission.'),
    ('A', 'Reproducibility & release', 'Release', '#93abb4', 'Prepare reproducible GitHub releases, Hugging Face assets and demos, arXiv versions and a shared release manifest. Follow reproduction feedback.'),
    ('C', 'Websites & communication', 'Community', '#ceb09d', 'Develop project pages, posters, talks, videos, public communication and academic outreach, alongside a personal research homepage and knowledge base.'),
    ('X', 'Exploration & map maintenance', 'Exploration', '#a2b29a', 'Navigate across modules, inspect visual and code evidence, explore counter-explanations within the agreed scope, and maintain the map as capabilities change.'),
]
TASKS = {
    'P': ['Research goals & portfolio', 'Project assets & position', 'Priorities & active projects', 'Time, compute & collaborators', 'Learning & retrospectives'],
    'I': ['Entry point & current decision', 'Contribution type', 'Venue & submission stage', 'Finish, pause or stop criteria'],
    'L': ['Problem & mechanism search', 'Topic map & citation expansion', 'Critical paper reading', 'Code, supplements & reproduction', 'Coverage & new evidence'],
    'B': ['Task & metric contract', 'Natural failure census', 'Strong simple baseline qualification', 'Freeze the parent problem', 'Natural Gate 0'],
    'H': ['Failure explanations & assumptions', 'Necessity & strongest objections', 'Atomic claims & decisive predictions', 'Functional collision review', 'Importance-preserving candidate selection'],
    'M': ['Causal chain & intervention', 'Mathematics & computability', 'Minimal algorithm & interfaces', 'Complexity & scope', 'Components & theoretical obligations'],
    'S': ['Benchmark selection matrix', 'Data & split audit', 'Model & API selection', 'Baselines & fair comparison', 'Complete run configuration'],
    'G': ['Decisive experiment design', 'Frozen protocol & decision rules', 'Implementation & baseline checks', 'Prompt, inference or training execution', 'Gate A assessment & route choice'],
    'E': ['Environment & dependencies', 'Semantics, unit checks & canaries', 'Task queue & resource monitoring', 'Root-cause diagnosis & protocol branches', 'Raw evidence & recoverable checkpoints'],
    'V': ['Claims-to-experiments matrix', 'Strong baselines & repeated validation', 'Mechanisms, ablations & replacements', 'Generalization, robustness & scope', 'Quality, cost & failures', 'Statistical checks & evidence freeze'],
    'W': ['Venue template & length', 'Central claim & narrative', 'Main paper & appendix', 'Section blueprint', 'Paragraphs & sentences', 'Introduction, motivation & related work', 'Method, results & discussion', 'Title, abstract & conclusion', 'Propagating new results'],
    'F': ['Method & motivation figures', 'Result plots & editable tables', 'Captions, references & readability', 'Compilation & manuscript consistency'],
    'R': ['Submission lock & anonymous materials', 'Reviewer issue ledger', 'Response strategy & follow-up priorities', 'Point-by-point response & revision', 'Decision, resubmission & final manuscript'],
    'A': ['GitHub reproduction & versions', 'Hugging Face models, data & demos', 'arXiv versions & metadata', 'Shared release manifest', 'User feedback, reproduction & revision'],
    'C': ['Project page & interactive demo', 'Poster, talk & demonstration video', 'X, LinkedIn & Xiaohongshu', 'Recipient discovery & email drafts', 'Homepage, CV & research knowledge base'],
    'X': ['Visual position & route exploration', 'PDF figures, diagrams & appendices', 'Code, log & website evidence', 'Bounded exploration & counter-evidence', 'Registering & checking new routes', 'Map quality & capability registry'],
}
EDGE_TYPES = {'输入': 'input', '分支': 'branch', '修订': 'revision', '探索': 'explore', '返回': 'return', '失效': 'invalidate', '记录': 'record', '排程': 'schedule', '定位': 'locate'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--registry', type=Path, required=True)
    args = parser.parse_args()
    raw = args.registry.read_bytes()
    registry = json.loads(raw)
    assert len(registry['groups']) == 16 and len(registry['nodes']) == 84 and len(registry['edges']) == 221
    modules = []
    for index, (key, label, short, color, description) in enumerate(MODULES):
        modules.append(dict(id=key, label=label, short=short, color=color, description=description,
                            lat=math.asin(1 - 2 * (index + .5) / 16),
                            lon=((index * math.pi * (3 - math.sqrt(5)) + math.pi) % (2 * math.pi)) - math.pi))
    nodes = [dict(id=key + f'{index+1:02d}', module=key, label=label)
             for key, labels in TASKS.items() for index, label in enumerate(labels)]
    assert {n['id'] for n in nodes} == {n['id'] for n in registry['nodes']}
    edges = [dict(id=e['id'], **{'from': e['from'], 'to': e['to']}, type=EDGE_TYPES[e['type']]) for e in registry['edges']]
    atlas = dict(kind='public_module_directory', schema_version=1, updated='2026-10-04',
                 registry_sha256=hashlib.sha256(raw).hexdigest(),
                 total_modules=len(modules), total_nodes=len(nodes), total_connections=len(edges),
                 geography='Illustrative module continents, with no geographic or execution-order meaning.',
                 modules=modules, nodes=nodes, edges=edges)
    (ROOT / 'assets/lab/research-atlas.json').write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + '\n')
    blocks = []
    for m in modules:
        tasks = [n for n in nodes if n['module'] == m['id']]
        entries = ''.join(f'<li id="node-{n["id"]}"><a href="#node-{n["id"]}" data-node="{n["id"]}"><code>{n["id"]}</code>{html.escape(n["label"])}</a></li>\n' for n in tasks)
        blocks.append(f'''<details class="module-entry" id="module-{m['id']}" style="--module-color:{m['color']}">
<summary><code>{m['id']}</code><h3>{html.escape(m['label'])}</h3><span class="directory-count">{len(tasks)} tasks</span><span class="expand" aria-hidden="true">+</span></summary>
<div class="module-body"><p>{html.escape(m['description'])}</p><ol>{entries}</ol><button class="locate-module" type="button" data-module="{m['id']}">Locate on the globe ↑</button></div>
</details>''')
    page = ROOT / '_pages/research-autopilot.html'
    original = page.read_text()
    replacement = '<!-- MODULE DIRECTORY START -->\n' + '\n'.join(blocks) + '\n<!-- MODULE DIRECTORY END -->'
    updated, count = re.subn(r'<!-- MODULE DIRECTORY START -->.*?<!-- MODULE DIRECTORY END -->', lambda _: replacement, original, flags=re.S)
    assert count == 1, 'Expected one module directory in the research page'
    page.write_text(updated)
    print(f'Published directory: {len(modules)} modules, {len(nodes)} tasks, {len(edges)} connections; registry SHA-256 {atlas["registry_sha256"]}')

if __name__ == '__main__':
    main()

