"""Render project pages for structural checks without changing GitHub's Jekyll build."""
from pathlib import Path
import re
import shutil
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.preview-navigation'
OUT.mkdir(exist_ok=True)
for name in ['assets', 'images', 'files']:
    source, target = ROOT / name, OUT / name
    if not source.exists():
        continue
    if target.exists() or target.is_symlink():
        if target.is_symlink():
            target.unlink()
        else:
            shutil.rmtree(target)
    target.symlink_to(source, target_is_directory=True)
rendered = 0
for filename in ['research-autopilot.html', 'openjudge.html', 'lab.html', 'research.html']:
    source = ROOT / '_pages' / filename
    if not source.is_file():
        continue
    _, front, body = source.read_text().split('---', 2)
    fields = {}
    for line in front.splitlines():
        match = re.match(r'^([a-z_]+):\s*(.*)$', line)
        if match:
            fields[match[1]] = match[2]
    layout = (ROOT / '_layouts' / (fields.get('layout', 'lab') + '.html')).read_text()
    while re.search(r'{% include ([\w.-]+) %}', body):
        body = re.sub(r'{% include ([\w.-]+) %}', lambda m: (ROOT / '_includes' / m[1]).read_text(), body)
    if 'redirect_to' in fields:
        destination = fields['redirect_to']
        body = f'<meta http-equiv="refresh" content="0;url={destination}"><p><a href="{destination}">Continue to the current page.</a></p>'
    page = layout.replace('{{ content }}', body.strip())
    page = re.sub(r'{{ page\.([a-z_]+) }}', lambda m: fields.get(m[1], ''), page)
    page = page.replace("{{ site.time | date: '%s' }}", str(int(time.time())))
    if '{%' in page or '{{' in page:
        raise RuntimeError('Unresolved local template in ' + filename)
    path = OUT / fields['permalink'].strip('/') / 'index.html'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page)
    rendered += 1
print(f'Rendered {rendered} project pages for structural checks. GitHub Pages performs the production Jekyll build.')
