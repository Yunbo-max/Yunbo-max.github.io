"""Render the new bounded layout for local QA without altering GitHub's Jekyll deployment."""
from pathlib import Path
import re,shutil,json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.preview-navigation'
OUT.mkdir(exist_ok=True)
for name in ['assets','images','files']:
 target=OUT/name
 if target.exists() or target.is_symlink():
  if target.is_symlink():target.unlink()
  else:shutil.rmtree(target)
 target.symlink_to(ROOT/name,target_is_directory=True)
layout=(ROOT/'_layouts/lab.html').read_text()
for filename in ['research-autopilot.html','lab.html','openjudge.html','research.html']:
 raw=(ROOT/'_pages'/filename).read_text();_,front,body=raw.split('---',2);fields={}
 for line in front.splitlines():
  m=re.match(r'^([a-z_]+):\s*(.*)$',line)
  if m:fields[m[1]]=m[2]
 for include in ['lab-home.html','research-home.html','navigation-demo.html']:
  body=body.replace('{% include '+include+' %}',(ROOT/'_includes'/include).read_text())
 if 'redirect_to' in fields:
  destination=fields['redirect_to']
  body=f'<meta http-equiv="refresh" content="0;url={destination}"><p><a href="{destination}">Continue to the current page.</a></p>'
 body=body.strip()
 page=layout.replace('{{ content }}',body)
 for key in ['title','description','permalink']:page=page.replace('{{ page.'+key+' }}',fields.get(key,''))
 if '{%' in page or '{{' in page:raise RuntimeError('Unresolved local template')
 path=OUT/fields['permalink'].strip('/')/'index.html';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(page)
print('Local project layout rendered: four pages; the original academic homepage is verified on GitHub Pages.')
